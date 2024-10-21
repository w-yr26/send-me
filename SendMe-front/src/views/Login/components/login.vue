<template>
  <van-form
    @submit="onSubmit"
    class="form-box"
    :show-error-message="false"
    show-error
  >
    <van-cell-group inset>
      <van-field
        v-model="formData.account"
        name="用户名"
        label="用户名"
        placeholder="请输入用户名(手机号)"
        :rules="[{ required: true, message: '请填写用户名' }]"
      />
      <van-field
        v-model="formData.password"
        type="password"
        name="密码"
        label="密码"
        placeholder="请输入密码"
        :rules="[{ required: true, message: '请填写密码' }]"
      />
    </van-cell-group>
    <div style="margin: 16px">
      <van-button block type="primary" native-type="submit"> 登录 </van-button>
    </div>
  </van-form>
</template>

<script setup>
import { postLoginAPI } from '@/apis/user'
import { ref } from 'vue'
import { useUserStore } from '@/store/index'
import { useRouter } from 'vue-router'
const router = useRouter()
const userStore = useUserStore()
const formData = ref({
  account: '',
  password: '',
})
// 提交表单
const onSubmit = async () => {
  const { data } = await postLoginAPI(formData.value)
  userStore.setUserInfo(data)
  router.replace('/home')
  showSuccessToast('登录成功')
}
</script>

<style lang="scss" scoped>
.form-box {
  margin-top: 20px;
}

.van-cell {
  padding: 20px;
}
</style>
