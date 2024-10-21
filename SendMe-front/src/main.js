import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './style.css'
import App from './App.vue'
import router from './router'
import { Lazyload } from 'vant'
// 引入自定义图标
import '@/assets/icon_font/iconfont.css';


const pinia = createPinia()
// 注册插件
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(Lazyload, {
  lazyComponent: true,
})
app.mount('#app')
