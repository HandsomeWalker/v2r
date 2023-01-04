<script setup>
import { ref, reactive } from 'vue';
import traverse from '@babel/traverse';

const a = ref(1);
const b = reactive({ count: 0 });
b.count++;
b.count = 33;

function test() {
  console.log('test');
  a.value = 2;
}
</script>

<template>
  <div class="title">{{ a }}</div>
</template>

<style lang="less" scoped>
.title {
  color: red;
}
</style>
