import { useState, computed, readonly, watchEffect, watchPostEffect, watchSyncEffect, watch } from "react";
const [count, setCount] = useState(1);
const [title, setTitle] = useState("标题");
const [data, setData] = useState({
  count: 0
});
data.count++;
setData({
  ...data
})
data.count = 33;
setData({
  ...data
})
function test() {
  console.log("test");
  setCount(2);
}