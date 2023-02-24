import { useState, computed, readonly, watchEffect, watchPostEffect, watchSyncEffect, watch } from "react";
import traverse from '@babel/traverse';
import DatePicker from './DatePicker';
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
  return <div title={title} className="box" onClick={test}>{(() => {
      if (count === 2) return <span>{ count } - { data.count }</span>;
      if (count === 3) return <strong>士大夫</strong>;
      return <i title="电视放">的身高和</i>;
    })()}{count > 1 && <h1>h1</h1>}{count > 2 && <h2>h2</h2>}{arr.map((item, index) => <b key={index}>{ item } - { index }</b>)}<DatePicker start={new Date()}></DatePicker></div>;
}