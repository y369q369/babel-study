// 第一步处理：
//      1. 将三元表达式 转换为 if - else 语句
//      2. 去除 !function(){}() 语句
//      3. if else 添加 {}
//      4. 16进制 、 unicode字符 转为正常字符

const parser = require('@babel/parser')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const fs = require('fs');
const path = require('path');

const demo1 = fs.readFileSync(path.join(__dirname, './collina.js'), {
    encoding: 'utf-8'
});

// 三元表达式示例
// const demo1 = `function demo() {
//     var a2
//     // 三元表达式赋值的不处理
//     a2 = 1 == 1 ? 3 : 4;
//     li = 17 > Ai ? Ao < H.length ? 2629 : 12866 : ee ? 642 : 4581
//     1 == 1 ? (console.log(1), a2 = 5) : 2 == 2 ? 456 : 123
//     if (1 == 1) {
//         console.log(1)
//     } else {
//         console.log(2)
//     }
// }`

// !function示例
// const demo1 = `!function() {
//     var u
//     switch (u) {
//         case 1:
//             !function() {
//                 console.log(1)
//                 console.log(2)
//                 console.log(3)
//             }()
//             break
//         case 2:
//             console.log(2)
//         default:
//             console.log('default')
//     }
// }()`

// if else 示例
// const demo1 = `if (12 == Ai)
//     ae = ce << F
// else if (12 > Ai)
//     5 == Ai
//
// if (19 == Ai)
//    M++, li = 8229;
// else if (19 > Ai) {
//     li = 24741;
// } else
//   456
// `

// unicode编码 和 十六进制编码 示例
// const demo1 = `var t1 = '\x4a\x63\x4f\x46'
// var t2 = '\u0175\u0170\u0154\u0175\u0173\u016a\u016f\u0168'
// var t3 = 'qwe'
// `


const astDemo1 = parser.parse(demo1)

// 判断是否为赋值表达式的三元表达式， flase: 是， true: 不是
const isTransformConditionalExpression = function (parentPath) {
    if (parentPath.node.type === 'ConditionalExpression') {
        return isTransformConditionalExpression(parentPath.parentPath)
    } else if (parentPath.node.type != 'AssignmentExpression') {
        return true
    }
    return false
}

const visitor = {
    // 针对三元表达式类型处理
    ConditionalExpression(path) {
        if (isTransformConditionalExpression(path.parentPath)) {
            // if (path.parentPath.type != 'AssignmentExpression') {
            // 将三元表达式类型转为 if-else类型
            path.node.type = 'IfStatement'

            // 左半部分 添加{}
            let tempConsequent = t.blockStatement([])
            if (path.node.consequent.type === 'SequenceExpression') {
                tempConsequent.body = path.node.consequent.expressions
            } else {
                tempConsequent.body.push(path.node.consequent)
            }
            path.node.consequent = tempConsequent

            // 右半部分 添加{}
            let tempAlternate = t.blockStatement([])
            if (path.node.alternate.type === 'SequenceExpression') {
                tempAlternate.body = path.node.alternate.expressions
            } else {
                tempAlternate.body.push(path.node.alternate)
            }
            path.node.alternate = tempAlternate
        }
    },

    // 针对 !function 处理
    UnaryExpression(path) {
        if (path.node.argument.type === 'CallExpression') {
            if (path.node.argument.callee.type === 'FunctionExpression' && path.node.argument.callee.body.type === 'BlockStatement') {
                let node = path.parentPath
                // 将 !function 下方代码替换到当前的父结点上
                node.replaceWithMultiple(path.node.argument.callee.body.body)

                // 拼接子节点
                // if (node.type === 'Program') {
                //     node.body.push.apply(node.body, path.node.argument.callee.body.body)
                // } else if (node.type === 'SwitchCase') {
                //     node.consequent.push.apply(node.consequent, path.node.argument.callee.body.body)
                // }
                // 删除当前父级节点
                // path.parentPath.remove()
            }

        }
    },

    // 将 if-else 添加 {}
    IfStatement(path) {
        if (path.node.consequent.type != 'BlockStatement') {
            let tempConsequent = t.blockStatement([path.node.consequent])
            path.node.consequent = tempConsequent
        }
        if (path.node.alternate && path.node.alternate.type != 'BlockStatement') {
            if (path.node.alternate.type != 'BlockStatement' && path.node.alternate.type != 'IfStatement') {
                let tempConsequent = t.blockStatement([path.node.alternate])
                path.node.alternate = tempConsequent
            }
        }
    },

    // 将所有十六进制编码与Unicode编码转为正常字符
    // StringLiteral(path) {
    //     // rawValue 属性 赋值给 raw 属性
    //     path.node.extra.raw = "\"" + path.node.extra.rawValue + "\"";
    // },

}

traverse(astDemo1, visitor)

const transformedCode = generate(astDemo1).code
fs.writeFile('step1.js', transformedCode, function (err) {
    if (err) {
        console.error('三元表达式 转换 if-else 语句 写入文件异常', err)
    }
    console.log("三元表达式 转换 if-else 语句 写入 collina-step1.js 成功！");
})

// console.log(transformedCode)