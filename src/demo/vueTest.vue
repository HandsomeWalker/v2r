<script setup>
import {
  ref,
  reactive,
  computed,
  readonly,
  watchEffect,
  watchPostEffect,
  watchSyncEffect,
  watch,
} from "vue";

const count = ref(1);
const title = ref("标题");
const data = reactive({ count: 0 });
data.count++;
data.count = 33;

function test() {
  console.log("test");
  count.value = 2;
}
</script>

<template>
  <div class="title" :title="title" @click="test">
    {{ count }} - {{ data.count }}
  </div>
</template>

<style lang="less" scoped>
.title {
  color: red;
}
</style>
