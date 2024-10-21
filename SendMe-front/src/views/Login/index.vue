<template>
  <div class="container">
    <div class="tabs-box">
      <van-tabs
        v-model:active="activeIndex"
        line-height="8"
        background="#f0f1f5"
        title-active-color="#131E23"
        title-inactive-color="#808080"
        shrink
      >
        <van-tab title="账号登录">
          <Login></Login>
        </van-tab>
        <van-tab title="用户注册">
          <register @update="onUpdate"></register>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Login from './components/login.vue'
import register from './components/register.vue'
const activeIndex = ref(0)

const onUpdate = (newIndex) => {
  activeIndex.value = newIndex
}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  width: 100%;
  background-color: #f0f1f5;
}

.tabs-box {
  padding-top: 30px;
}
</style>
