import http from '@/utils/http'

/**
 * 登录
 */
export const postLoginAPI = (data) => {
  return http.post('/user/login', data)
}

/**
 * 注册
 */
export const postRegisterAPI = (data) => {
  return http.post('/user/register', data)
}

/**
 * 无感刷新
 */
export const postRefreshAPI = (data) => {
  return http.post('/user/refresh', data)
}
