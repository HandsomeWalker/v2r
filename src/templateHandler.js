const t = require("@babel/types");
const traverse = require("@babel/traverse").default;
const { eventMap } = require("./utils.js");

function initTemplate(vnode, parentElement, attrsCollector) {
  const {
    type,
    events,
    key,
    directives,
    attrs,
    staticClass,
    ifConditions,
    alias,
  } = vnode;
  let element;
  let wrappedElement;
  let ast;

  if (type === 1) {
    let commonAttrs = [];
    if (attrs) {
      commonAttrs = attrs.map((attr) => {
        if (attr.dynamic === false) {
          // attr.dynamic === false
          // <div :data="list" v-bind:content="content"/> -> <div data={list} content={content}/>
          attrsCollector.add(attr.value);
          return t.jSXAttribute(
            t.jSXIdentifier(attr.name),
            t.jSXExpressionContainer(t.identifier(attr.value))
          );
        } else {
          // attr.dynamic === undefined
          // <div id="34we3"/> -> <div id="34we3"/>
          return t.jSXAttribute(
            t.jSXIdentifier(attr.name),
            t.stringLiteral(JSON.parse(attr.value))
          );
        }
      });
    }

    // <div class="wrapper"/> -> <div className="wrapper"/>
    let staticClassAttrs = [];
    if (staticClass) {
      staticClassAttrs.push(
        t.jSXAttribute(
          t.jSXIdentifier("className"),
          t.stringLiteral(JSON.parse(staticClass))
        )
      );
    }

    // <div v-on:blur="handleBlur" @click="handleClick"/> -> <div onClick={handleClick} onBlur={handleBlur}/>
    let eventAttrs = [];
    if (events) {
      Object.keys(events).forEach((key) => {
        const eventName = eventMap[key];
        if (!eventName) {
          return console.log(`Not support event name: ${key}`, "info");
        }
        attrsCollector.add(events[key].value);
        eventAttrs.push(
          t.jSXAttribute(
            t.jSXIdentifier(eventName),
            t.jSXExpressionContainer(t.identifier(events[key].value))
          )
        );
      });
    }

    // <div :key="item.id"/> -> <div key={item.id}/>
    let keyAttrs = [];
    if (key) {
      attrsCollector.add(key);
      keyAttrs.push(
        t.jSXAttribute(
          t.jSXIdentifier("key"),
          t.jSXExpressionContainer(t.identifier(key))
        )
      );
    }

    let directivesAttr = [];
    if (directives) {
      directives.forEach((directive) => {
        attrsCollector.add(directive.value);
        switch (directive.rawName) {
          case "v-show":
            // <div v-show="isLoading"/> -> <div style={{display: isLoading ? 'block' : 'none'}}/>
            directivesAttr.push(
              t.jSXAttribute(
                t.jSXIdentifier("style"),
                t.jSXExpressionContainer(
                  t.objectExpression([
                    t.objectProperty(
                      t.identifier("display"),
                      t.conditionalExpression(
                        t.identifier(directive.value),
                        t.stringLiteral("block"),
                        t.stringLiteral("none")
                      )
                    ),
                  ])
                )
              )
            );
            break;
          case "v-html":
            // <div v-html="template"/> -> <div dangerouslySetInnerHTML={{__html: template}}/>
            directivesAttr.push(
              t.jSXAttribute(
                t.jSXIdentifier("dangerouslySetInnerHTML"),
                t.jSXExpressionContainer(
                  t.objectExpression([
                    t.objectProperty(
                      t.identifier("__html"),
                      t.identifier(directive.value)
                    ),
                  ])
                )
              )
            );
            break;
          default:
            break;
        }
      });
    }

    element = t.jSXElement(
      t.jSXOpeningElement(t.jSXIdentifier(vnode.tag), [
        ...commonAttrs,
        ...staticClassAttrs,
        ...eventAttrs,
        ...keyAttrs,
        ...directivesAttr,
      ]),
      t.jSXClosingElement(t.jSXIdentifier(vnode.tag)),
      []
    );

    if (ifConditions) {
      // <div v-if="show"/> -> {show && <div/>} | {show ? foo : bar} | {(() => {if (show) return foo})()}
      if (ifConditions.length === 1) {
        wrappedElement = t.jSXExpressionContainer(
          t.logicalExpression("&&", t.identifier(ifConditions[0].exp), element)
        );
      } else if (ifConditions.length === 2) {
        const { block: elseBlock } = ifConditions[1];
        const elseElement = initTemplate(elseBlock, null, attrsCollector);
        wrappedElement = t.jSXExpressionContainer(
          t.conditionalExpression(t.identifier(ifConditions[0].exp), element, elseElement)
        );
      } else {
        let ifStatement = [];
        for (const item of ifConditions) {
          if (!ifStatement.length) {
            ifStatement.push(t.ifStatement(t.identifier(item.exp), t.returnStatement(element)));
          } else if (item.exp) {
            ifStatement.push(t.ifStatement(t.identifier(item.exp), t.returnStatement(initTemplate(item.block, null, attrsCollector))));
          } else {
            ifStatement.push(t.returnStatement(initTemplate(item.block, null, attrsCollector)));
          }
        }
        wrappedElement = t.jSXExpressionContainer(
          t.callExpression(t.arrowFunctionExpression([], t.blockStatement(ifStatement)), [])
        );
      }
    } else if (alias) {
      // <div v-for="item in list"/> -> {list.map(item => <div/>)}
      wrappedElement = t.jSXExpressionContainer(
        t.callExpression(
          t.memberExpression(t.identifier(vnode.for), t.identifier("map")),
          [t.arrowFunctionExpression([t.identifier(alias), t.identifier(vnode.iterator1)], element)]
        )
      );
    } else {
      wrappedElement = element;
    }
  } else if (type === 2) {
    // {{name}} -> {name}
    attrsCollector.add(vnode.text.replace(/{{/g, "").replace(/}}/g, ""));
    wrappedElement = t.jSXText(
      vnode.text.replace(/{{/g, "{").replace(/}}/g, "}")
    );
  } else {
    if (vnode.text.trim()) {
      wrappedElement = t.jSXText(vnode.text);
    }
  }

  if (parentElement) {
    parentElement.children.push(wrappedElement);
  }

  if (vnode.children && vnode.children.length > 0) {
    vnode.children.forEach((child) => {
      initTemplate(child, element, attrsCollector);
    });
  }

  if (
    t.isJSXExpressionContainer(wrappedElement) ||
    t.isJSXText(wrappedElement)
  ) {
    ast = t.jSXElement(
      t.jSXOpeningElement(t.jSXIdentifier("div"), []),
      t.jSXClosingElement(t.jSXIdentifier("div")),
      [wrappedElement]
    );
  } else {
    ast = wrappedElement;
  }

  return ast;
}

module.exports = {
  initTemplate,
};
