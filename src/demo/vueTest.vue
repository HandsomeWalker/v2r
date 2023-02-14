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
import traverse from '@babel/traverse';

const count = ref(1);
const title = ref("标题");
const data = reactive({ count: 0 });
const arr = reactive([1, 2, 3, 4]);
data.count++;
arr[2] = 10;
data.count = 33;

function test() {
  console.log("test");
  count.value = 2;
}
</script>

<template>
  <div class="title" :title="title" @click="test">
    <span v-if="count === 2">{{ count }} - {{ data.count }}</span>
    <b v-for="(item, index) in arr" :key="index">{{ item }} - {{ index }}</b>
  </div>
</template>

<style lang="less" scoped>
.title {
  color: red;
}
</style>
