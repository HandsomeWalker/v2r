import _traverse from '@babel/traverse';
const traverse = _traverse.default;

export function initState(ast, store) {
  let hasState = false;
  traverse(ast, {
    ImportDeclaration: function (path) {
      if (path.node.source.value === 'vue') {
        path.node.source.value = 'react';
        path.traverse({
          ImportSpecifier: function (p) {
            if (p.node.imported.name === 'ref' || p.node.imported.name === 'reactive') {
              if (hasState) {
                p.remove();
              } else {
                p.node.imported.name = 'useState';
                p.node.local.name = 'useState';
                hasState = true;
              }
            }
          }
        })
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
          if (p.node.callee.name === 'ref') {
            p.node.callee.name = 'useState';
            store.ref.push(p.parentPath.node.id.name);
          }
          if (p.node.callee.name === 'reactive') {
            p.node.callee.name = 'useState';
            store.reactive.push(p.parentPath.node.id.name);
          }
        }
      })
    },
  });
  return ast;
}
