import express from 'express'
import path from 'node:path'
import './src/controllers/chatController.js'
import cors from 'cors'
import JWT from './src/utils/jwt.js'
import userRouter from './src/routers/user.js'
import roomRouter from './src/routers/room.js'
import chatRouter from './src/routers/chat.js'
import editRouter from './src/routers/edit.js'
import helmet from 'helmet'
const app = express()

// 执行校验的插件
JWT.initJWTStrategy()
// 跨域资源共享
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://124.221.125.17:5173'],
  })
)
// 静态资源存放路径
app.use('/uploads', express.static('uploads'))
app.use('/uploadEdit', express.static('uploadEdit'))
// 解析JSON
app.use(express.json())
// 校验器注入Express中
app.use(JWT.init())

/**
 * 用户路由
 */
app.use('/api/v1/user', userRouter)
/**
 * 聊天室路由
 */
app.use('/api/v1/room', roomRouter)
/**
 * 聊天内容路由(主要是文件上传)
 */
app.use('/api/v1/chat', chatRouter)
/**
 * 文本编辑器路由
 */
app.use(
  '/api/v1/edit',
  // helmet.contentSecurityPolicy({
  //   directives: {
  //     defaultSrc: ["'self'"]
  //   },
  // }),
  editRouter
)

app.listen(3000, () => {
  console.log('3000端口已启动')
})
