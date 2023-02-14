function isIncludingState(store, varName) {
  if (!varName) {
    return false;
  }
  for (const item of store.ref) {
    if (item.name === varName) {
      return {
        sourceType: item.sourceType,
        stateType: 'ref'
      };
    }
  }
  for (const item of store.reactive) {
    if (item.name === varName) {
      return {
        sourceType: item.sourceType,
        stateType: 'reactive'
      };
    }
  }
  return false;
}

function upperCaseFirst(str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
}

const eventMap = {
  click: 'onClick',
  dblclick: 'onDoubleClick',
  abort: 'onAbort',
  change: 'onChange',
  error: 'onError',
  focus: 'onFocus',
  blur: 'onBlur',
  keydown: 'onKeyDown',
  keyup: 'onKeyUp',
  keypress: 'onKeyPress',
  load: 'onLoad',
  mousedown: 'onMouseDown',
  mouseup: 'onMouseUp',
  mousemove: 'onMouseMove',
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  mouseout: 'onMouseOut',
  mouseover: 'onMouseOver',
  reset: 'onReset',
  resize: 'onResize',
  select: 'onSelect',
  submit: 'onSubmit',
  unload: 'onUnload',
  drag: 'onDrag',
  dragend: 'onDragEnd',
  dragenter: 'onDragEnter',
  dragexit: 'onDragExit',
  dragleave: 'onDragLeave',
  dragover: 'onDragOver',
  dragstart: 'onDragStart',
  drop: 'onDrop',
  touchstart: 'onTouchStart',
  touchend: 'onTouchEnd',
  touchcancel: 'onTouchCancel',
  touchmove: 'onTouchMove'
};

module.exports = {
  isIncludingState,
  upperCaseFirst,
  eventMap
};
