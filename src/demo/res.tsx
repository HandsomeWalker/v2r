import { useState, computed, readonly, watchEffect, watchPostEffect, watchSyncEffect, watch } from "react";
import traverse from '@babel/traverse';
function VueTest(props) {
  const [count, setCount] = useState(1);
  const [title, setTitle] = useState("标题");
  const [data, setData] = useState({
    count: 0
  });
  const [arr, setArr] = useState([1, 2, 3, 4]);
  data.count++;
  setData({
    ...data
  });
  arr[2] = 10;
  setArr([...arr]);
  data.count = 33;
  setData({
    ...data
  });
  function test() {
    console.log("test");
    setCount(2);
  }
  return <div title={title} className="title" onClick={test}>{count === 2 && <span>{ count } - { data.count }</span>}{arr.map(item => <b key={index}>{ item } - { index }</b>)}</div>;
}