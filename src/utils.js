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

module.exports = {
  isIncludingState,
  upperCaseFirst
};
