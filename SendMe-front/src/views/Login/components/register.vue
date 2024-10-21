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
      <van-field
        v-model="formData.rePwd"
        type="password"
        name="密码"
        label="密码验证"
        placeholder="请再次输入密码"
        :rules="[{ required: true, message: '请填写密码' }]"
      />
    </van-cell-group>
    <div style="margin: 16px">
      <van-button block type="primary" native-type="submit"> 注册 </van-button>
    </div>
  </van-form>
</template>

<script setup>
import { postRegisterAPI } from '@/apis/user'
import { ref, defineEmits } from 'vue'
const formData = ref({
  account: '',
  password: '',
  rePwd: '',
})
const resetData = {
  account: '',
  password: '',
  rePwd: '',
}
// 自定义事件更新tab栏下标
const emits = defineEmits(['update'])
// 提交表单
const onSubmit = async () => {
  const { account, password } = formData.value
  const { code } = await postRegisterAPI({
    account,
    password,
  })
  if (code !== 200) return showFailToast('注册失败')
  showSuccessToast('注册成功')
  // 清空数据
  formData.value = { ...resetData }
  // 更新tabs栏下标
  emits('update', 0)
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
