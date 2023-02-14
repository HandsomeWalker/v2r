const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const { isIncludingState, upperCaseFirst } = require("./utils.js");

function handleExpressionStatement(
  store,
  path,
  name,
  propertyName,
  expression
) {
  const temp = isIncludingState(store, name);
  if (!temp) {
    return;
  }
  if (temp.stateType === "ref") {
    if (propertyName === "value") {
      path.replaceWith(
        t.expressionStatement(
          t.callExpression(t.identifier(`set${upperCaseFirst(name)}`), [
            expression,
          ])
        )
      );
    }
  } else {
    if (temp.sourceType === "ObjectExpression") {
      path.insertAfter(
        t.expressionStatement(
          t.callExpression(t.identifier(`set${upperCaseFirst(name)}`), [
            t.objectExpression([t.spreadElement(t.identifier(name))]),
          ])
        )
      );
    } else if (temp.sourceType === "ArrayExpression") {
      path.insertAfter(
        t.expressionStatement(
          t.callExpression(t.identifier(`set${upperCaseFirst(name)}`), [
            t.arrayExpression([t.spreadElement(t.identifier(name))]),
          ])
        )
      );
    } else {
      path.insertAfter(
        t.expressionStatement(
          t.callExpression(t.identifier(`set${upperCaseFirst(name)}`), [
            expression,
          ])
        )
      );
    }
  }
}

function initState(ast, store) {
  let hasState = false;
  traverse(ast, {
    ImportDeclaration: function (path) {
      if (path.node.source.value === "vue") {
        path.node.source.value = "react";
        path.traverse({
          ImportSpecifier: function (p) {
            if (
              p.node.imported.name === "ref" ||
              p.node.imported.name === "reactive"
            ) {
              if (hasState) {
                p.remove();
              } else {
                p.node.imported.name = "useState";
                p.node.local.name = "useState";
                hasState = true;
              }
            }
          },
        });
      }
    },
  });
  if (!hasState) {
    return;
  }
  traverse(ast, {
    VariableDeclaration: function (path) {
      path.traverse({
        CallExpression: function (p) {
          if (p.node.callee.name === "ref") {
            p.node.callee.name = "useState";
            store.ref.push({
              name: p.parentPath.node.id.name,
              sourceType: p.node.arguments[0].type,
            });
            p.parentPath.node.id.name = `[${
              p.parentPath.node.id.name
            }, set${upperCaseFirst(p.parentPath.node.id.name)}]`;
          }
          if (p.node.callee.name === "reactive") {
            p.node.callee.name = "useState";
            store.reactive.push({
              name: p.parentPath.node.id.name,
              sourceType: p.node.arguments[0].type,
            });
            p.parentPath.node.id.name = `[${
              p.parentPath.node.id.name
            }, set${upperCaseFirst(p.parentPath.node.id.name)}]`;
          }
        },
      });
    },
  });
  traverse(ast, {
    ExpressionStatement: function (path) {
      if (path.node.expression.type === "UpdateExpression") {
        handleExpressionStatement(
          store,
          path,
          path.node.expression.argument.object.name,
          path.node.expression.argument.property.name,
          path.node.expression
        );
      }
      if (path.node.expression.type === "AssignmentExpression") {
        handleExpressionStatement(
          store,
          path,
          path.node.expression.left.object.name,
          path.node.expression.left.property.name,
          path.node.expression.right
        );
      }
    },
  });
  return ast;
}

module.exports = {
  initState,
};
