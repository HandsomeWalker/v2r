import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import compiler from '@vue/compiler-sfc';
import fs from 'fs';
import util from 'util';
import parser from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse.default;
import _generator from '@babel/generator';
const generator = _generator.default;
import * as t from '@babel/types';
import { initState } from './stateHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let store = {
  ref: [],
  reactive: [],
};

async function main() {
  const source = fs.readFileSync(resolve(__dirname, 'demo/vueTest.vue'), { encoding: 'utf-8' });
  const temp = compiler.parse(source);
  console.log(util.inspect(temp.descriptor.styles, false, null, true));
  let ast = parser.parse(temp.descriptor.scriptSetup.content, { sourceType: 'module' });
  ast = initState(ast, store);
  traverse(ast, {
    ExpressionStatement: function (path) {
      if (path.node.expression.type === 'UpdateExpression' && store.state.includes(path.node.expression.argument.object.name)) {
        path.replaceWith(t.callExpression(t.identifier(`set${path.node.expression.argument.object.name.toUpperCase()}`), [path.node.expression]));
      }
      if (path.node.expression.type === 'AssignmentExpression' && store.state.includes(path.node.expression.left.object.name)) {
        path.replaceWith(t.callExpression(t.identifier(`set${path.node.expression.left.object.name.toUpperCase()}`), [path.node.expression.right]));
      }
    }
  });
  const { code } = generator(ast);
  fs.writeFileSync(resolve(__dirname, 'demo/res.tsx'), code, { encoding: 'utf-8' });
}

main();
