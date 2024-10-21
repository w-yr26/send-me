import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref({})

    const setUserInfo = (newValue) => {
      userInfo.value = { ...newValue }
    }
    return { userInfo, setUserInfo }
  },
  {
    persist: {
      path: ['userInfo'],
    },
  }
)
