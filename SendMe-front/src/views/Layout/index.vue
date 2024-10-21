<template>
  <div class="container">
    <router-view></router-view>
    <van-tabbar route active-color="#6364F0" placeholder>
      <van-tabbar-item to="/home">
        首页
        <template #icon="{ active }">
          <van-icon
            class="iconfont"
            class-prefix="icon"
            name="chatroom"
            :color="active ? '#6364F0' : 'inherit'"
            size="24px"
          />
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/note">
        小记
        <template #icon="{ active }">
          <van-icon
            class="iconfont"
            class-prefix="icon"
            name="user"
            :color="active ? '#6364F0' : 'inherit'"
            size="24px"
          />
        </template>
      </van-tabbar-item>
      <!-- <van-tabbar-item to="/my">
        我的
        <template #icon="{ active }">
          <van-icon
            class="iconfont"
            class-prefix="icon"
            name="user"
            :color="active ? '#6364F0' : 'inherit'"
            size="24px"
          />
        </template>
      </van-tabbar-item> -->
    </van-tabbar>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  width: 100%;
  background-color: #f5f7fa;
}

.van-tabbar-item {
  background-color: #f5f7fa;
}
</style>
