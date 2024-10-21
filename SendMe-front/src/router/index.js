import { useUserStore } from '@/store'
import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'

// 关闭进度条的 loading 状态
// NProgress.configure({
//   showSpinner: false,
// })

const routes = [
  {
    path: '/',
    redirect: '/home',
    component: () => import('@/views/Layout/index.vue'),
    children: [
      {
        path: '/home',
        component: () => import('@/views/Home/index.vue'),
        meta: { title: '首页' },
      },
      {
        path: '/my',
        component: () => import('@/views/User/index.vue'),
        meta: { title: '个人' },
      },
      {
        path: '/note',
        component: () => import('@/views/Note/index.vue'),
        meta: { title: '小记' },
      },
    ],
  },
  {
    path: '/room',
    component: () => import('@/views/Room/index.vue'),
    meta: { title: '聊天室' },
  },
  {
    path: '/login',
    component: () => import('@/views/Login/index.vue'),
    meta: { title: '登录' },
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由白名单
const WHITE_LIST = ['/login']

// 路由前置守卫
router.beforeEach((to) => {
  // 开启进度条
  NProgress.start()
  const store = useUserStore()
  if (!store.userInfo.token && !WHITE_LIST.includes(to.path)) return '/login'
})

// 路由后置守卫
router.afterEach((to) => {
  // 设置页面标题
  document.title = `SendMe-${to.meta.title || ''}`
  // 关闭进度条
  NProgress.done()
})

export default router
