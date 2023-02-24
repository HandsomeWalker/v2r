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
import DatePicker from './DatePicker';

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
  <div class="box" :title="title" @click="test">
    <span v-if="count === 2">{{ count }} - {{ data.count }}</span>
    <strong v-else-if="count === 3">士大夫</strong>
    <i v-else title="电视放">的身高和</i>
    <h1 v-if="count > 1">h1</h1>
    <h2 v-if="count > 2">h2</h2>
    <b v-for="(item, index) in arr" :key="index">{{ item }} - {{ index }}</b>
    <DatePicker :start="new Date()" />
  </div>
</template>

<style lang="less" scoped>
.box {
  color: red;
}
</style>
