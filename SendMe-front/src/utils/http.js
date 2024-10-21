import axios from 'axios'
import { useUserStore } from '@/store'
import { postRefreshAPI } from '@/apis/user'
import router from '@/router'
const http = axios.create({
  baseURL: `http://localhost:3000/api/v1`,
  timeout: 5000,
})

// 添加请求拦截器
http.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    const userStore = useUserStore()
    const token = userStore.userInfo.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 添加响应拦截器
http.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response.data
  },
  async function (error) {
    // token过期/失效，进行无感刷新
    console.log(error, 'error')

    // 发送refresh接口请求时，由于refresh_token也有过期的风险，为了避免401循环，需要特判（因为refresh_token过期也返回401）
    if (error.status === 401 && error.config.url !== '/user/refresh') {
      const userStore = useUserStore()
      const { code, data } = await postRefreshAPI({
        refresh_token: userStore.userInfo.refresh_token,
      })

      if (code === 200) {
        userStore.userInfo.token = data.token
        userStore.userInfo.refresh_token = data.refresh_token
        return http(error.config);
      } else {
        // 真过期了(refresh_token也过期了)
        router.replace('/login')
      }
    }

    // 对响应错误做点什么
    return Promise.reject(error)
  }
)

export default http
