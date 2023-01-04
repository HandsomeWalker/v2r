import { useState } from "react";
import traverse from '@babel/traverse';
const a = useState(1);
const b = useState({
  count: 0
});
setB(b.count++);
setB(33);
function test() {
  console.log('test');
  setA(2);
}