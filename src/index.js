const { resolve } = require("path");
const vueCompilerSfc = require("@vue/compiler-sfc");
const vueTemplateCompiler = require("vue-template-compiler");
const fs = require("fs");
const util = require("util");
const parser = require("@babel/parser");
const generator = require("@babel/generator").default;
const t = require("@babel/types");
const { initState } = require("./stateHandler.js");
const { initTemplate } = require("./templateHandler.js");

let store = {
  ref: [],
  reactive: [],
};

async function main() {
  const source = fs.readFileSync(resolve(__dirname, "demo/vueTest.vue"), {
    encoding: "utf-8",
  });
  const vueParseObj = vueCompilerSfc.parse(source);
  // console.log(util.inspect(vueParseObj.descriptor.template, false, null, true));
  let jsAst = parser.parse(vueParseObj.descriptor.scriptSetup.content, {
    sourceType: "module",
  });
  let { ast: templateAst } = vueTemplateCompiler.compile(
    vueParseObj.descriptor.template.content
  );
  jsAst = initState(jsAst, store);
  templateAst = initTemplate(templateAst, null, new Set());
  const { code: jsCode } = generator(
    t.program(
      [
        ...jsAst.program.body.filter((item) => t.isImportDeclaration(item)),
        t.functionDeclaration(
          t.identifier("VueTest"),
          [t.identifier("props")],
          t.blockStatement([
            ...jsAst.program.body.filter(
              (item) => !t.isImportDeclaration(item)
            ),
            t.returnStatement(templateAst),
          ])
        ),
      ],
      undefined,
      "module"
    ),
    { jsescOption: { minimal: true } }
  );
  fs.writeFileSync(resolve(__dirname, "demo/res.tsx"), jsCode, {
    encoding: "utf-8",
  });
  for (let i = 0; i < vueParseObj.descriptor.styles.length; i++) {
    const item = vueParseObj.descriptor.styles[i];
    fs.writeFileSync(
      resolve(
        __dirname,
        `demo/res${vueParseObj.descriptor.styles.length > 1 ? i : ""}.${
          item.lang || "css"
        }`
      ),
      item.content,
      {
        encoding: "utf-8",
      }
    );
  }
}

main();
