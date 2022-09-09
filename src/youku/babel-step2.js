// 第二步处理：
//      1. if else 转 switch

const parser = require('@babel/parser')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const fs = require('fs');
const path = require('path');

const demo1 = fs.readFileSync(path.join(__dirname, './collina-step1.js'), {
    encoding: 'utf-8'
});



// && 逻辑表达式转 if - else
// const demo1 = `Ai > 0 && (L = mo, li = 24641)
// Ai > 0 && L
// !ie[he] && !Q
// `

// 三元表达式示例
// const demo1 = `switch (Ai) {
//     case 1:
//         if (12 == Ai) {
//             N = Se[vo];
//         } else if (12 > Ai) {
//             if (5 == Ai) {
//                 li = 8804;
//             } else if (5 > Ai) {
//                 if (2 == Ai) {
//                     ie = [];
//                 } else if (2 > Ai) {
//                     if (0 == Ai) {
//                         Dn.push(0);
//                         li = 11522;
//                     } else if (Ai > 0) {
//                         L = mo;
//                         li = 24641;
//                     }
//                 } else {
//                     if (3 == Ai) {
//                         Oe = K;
//                         li = 20257;
//                     } else if (Ai > 3) {
//                         _ = 0 !== se.length;
//                         I = je;
//                         li = _ ? 22694 : 16963;
//                     }
//                 }
//             } else {
//                 if (8 == Ai) {
//                     li = Pn < qe.length ? 22722 : 23586;
//                 } else if (8 > Ai) {
//                     if (6 == Ai) {
//                         je += "u";
//                     } else if (Ai > 6) {
//                         y = d;
//                     }
//                 } else {
//                     if (10 == Ai) {
//                         li = ie[le] ? 5218 : 1185;
//                     } else if (10 > Ai) {
//                         on = [];
//                     } else {
//                         mn |= I;
//                     }
//                 }
//             }
//         } else {
//             if (19 == Ai) {
//                 li = 1313;
//             } else if (19 > Ai) {
//                 if (15 == Ai) {
//                     $ = po;
//                     li = 26147;
//                 } else if (15 > Ai) {
//                     if (13 == Ai) {
//                         Ue = on;
//                         li = Ue ? 3683 : 3206;
//                     } else if (Ai > 13) {
//                         li = co ? 12834 : 3808;
//                     }
//                 } else {
//                     if (17 == Ai) {
//                         Sn = ee[7];
//                     } else if (17 > Ai) {
//                         m = T[zt](u[27], Oe);
//                         li = 20996;
//                     } else {
//                         li = Qe < X.length ? 1633 : 8641;
//                     }
//                 }
//             } else {
//                 if (22 == Ai) {
//                     li = fe < Xe.length ? 22243 : 25313;
//                 } else if (22 > Ai) {
//                     if (20 == Ai) {
//                         li = I < g.length ? 25092 : 7650;
//                     } else if (Ai > 20) {
//                         Le = Ao.indexOf(se);
//                     }
//                 } else {
//                     if (24 == Ai) {
//                         ye = he - 1;
//                         li = 16162;
//                     } else if (24 > Ai) {
//                         Ie += "tN";
//                         li = On ? 26337 : 1568;
//                     } else {
//                         mn++;
//                         li = 17509;
//                     }
//                 }
//             }
//         }
//         break;
// }`




const numArr = [0, 3, 6, 13, 20, 10, 17, 24]


const astDemo1 = parser.parse(demo1)


const visitor = {
    // 针对三元表达式类型处理
    LogicalExpression(path) {
        // 将 &&逻辑表达式 转为 if-else类型
        if ((path.node.operator === '&&') && (path.node.left.type === 'BinaryExpression')) {
            if (path.parentPath.node.type == 'ExpressionStatement') {
                let tempBlock
                if (path.node.right.type == 'SequenceExpression') {
                    let blockStatementBody = []
                    path.node.right.expressions.forEach(expression => {
                        if (expression.type !== 'ExpressionStatement') {
                            blockStatementBody.push(t.expressionStatement(expression))
                        } else {
                            blockStatementBody.push(expression)
                        }
                    })
                    tempBlock = t.blockStatement(blockStatementBody)
                } else {
                    tempBlock = t.blockStatement([t.expressionStatement(path.node.right)])
                }
                let tempIfStatement = t.ifStatement(path.node.left, tempBlock)
                path.parentPath.replaceWith(tempIfStatement)
            }
        }
    },

    // if else 处理
    IfStatement(path) {
        if (path.node.test.type == 'BinaryExpression') {
            if (path.node.test.left.type == 'Identifier' && path.node.test.left.name == 'Ai' && path.node.test.operator == '>' && path.node.test.right.type == 'NumericLiteral') {
                if (numArr.includes(path.node.test.right.value)) {
                    if (path.node.test.right.value == 0) {
                        path.node.test.right.value = 1
                    } else if (path.node.test.right.value == 3) {
                        path.node.test.right.value = 4
                    } else if (path.node.test.right.value == 6) {
                        path.node.test.right.value = 7
                    } else if (path.node.test.right.value == 13) {
                        path.node.test.right.value = 14
                    } else if (path.node.test.right.value == 20) {
                        path.node.test.right.value = 21
                    }

                    path.node.test.operator = '=='
                    let tempNode = path.node.test.right
                    path.node.test.right = path.node.test.left
                    path.node.test.left = tempNode
                }
            } else if (path.node.test.right.type == 'Identifier' && path.node.test.right.name == 'Ai' && path.node.test.operator == '>' && path.node.test.left.type == 'NumericLiteral') {
                if (numArr.includes(path.node.test.left.value)) {
                    let num
                    if (path.node.test.left.value == 10) {
                        num = 11
                        path.node.test.left.value = 9
                    } else if (path.node.test.left.value == 17) {
                        num = 18
                        path.node.test.left.value = 16
                    } else if (path.node.test.left.value == 24) {
                        // 超过24，暂用25表示
                        num = 25
                        path.node.test.left.value = 23
                    }

                    let tempBinaryExpression = t.binaryExpression('==', t.numericLiteral(num), t.identifier('Ai'))
                    let tempIfStatement = t.ifStatement(tempBinaryExpression, path.node.alternate, null)
                    path.node.alternate = tempIfStatement

                    path.node.test.operator = '=='
                }
            }
        }
    },

    // 去除空语句
    // EmptyStatement(path) {
    //     path.remove()
    // }
}

// if 语句转化 case语句
let transformData = function (node, switchArr) {
    let num = node.test.left.value
    if (num < 25) {
        node.consequent.body.push(t.breakStatement())
    }
    switchArr[num].consequent = node.consequent.body

    if (node.alternate) {
        if (node.alternate.type == 'IfStatement') {
            getTransformNode(node.alternate, switchArr)
        } else if (node.alternate.type == 'BlockStatement'){
            for (let i = 0; i < node.alternate.body.length; i++) {
                getTransformNode(node.alternate.body[i], switchArr)
            }
        }
    }
}

// 寻找 == 语句的if
let getTransformNode = function(node, switchArr) {
    if (node.type == 'IfStatement') {
        if (node.test.type == 'BinaryExpression' && node.test.right.name == 'Ai' && node.test.operator == '==') {
            transformData(node, switchArr)
        } else {
            for (let i = 0; i < node.consequent.body.length; i++) {
                getTransformNode(node.consequent.body[i], switchArr)
            }

            if (node.alternate != null && node.alternate.type == 'BlockStatement') {
                for (let i = 0; i < node.alternate.body.length; i++) {
                    getTransformNode(node.alternate.body[i],  switchArr)
                }
            }
        }
    }
}


// if else 转 switch
visitor2 = {
    IfStatement(path) {
        if (path.node.test.type == 'BinaryExpression' && path.node.test.right.name == 'Ai' && path.node.test.operator == '==' && path.node.test.left.value == 12) {
            if (path.parentPath.node.type == 'SwitchCase') {
                let switchArr = []
                for (let i = 0; i < 25; i++) {
                    switchArr.push(t.switchCase(t.numericLiteral(i), []))
                }
                switchArr.push(t.switchCase(null, []))

                transformData(path.node, switchArr)

                // 将 if else 替换为 switch
                let tempSwitch = t.switchStatement(t.identifier('Ai'), switchArr)
                path.replaceWith(tempSwitch)
            }
        }
    }
}



traverse(astDemo1, visitor)

traverse(astDemo1, visitor2)

const transformedCode = generate(astDemo1).code

fs.writeFile('./step2.js', transformedCode, function (err) {
    if (err) {
        console.error('三元表达式 转换2 写入文件异常', err)
    } else {
        console.log("三元表达式 转换2 写入 collina-step2.js 成功！");
    }
})

// console.log(transformedCode)















