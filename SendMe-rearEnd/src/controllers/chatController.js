/**
 * 执行聊天室建立socket连接相关逻辑
 */
import { Server } from 'socket.io'
import { createServer } from 'http'
import { addNewChat, selectAllChat } from '../models/chatModels.js'
const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: '*', // 允许跨域的前端域名
    methods: ['GET', 'POST'], // 允许的跨域请求方法
    credentials: true, // 允许cookies等认证信息一起跨域传递
  },
})
/**
 * 数据结构
 * {
 *  room_id_1: [
 *    {  },
 *    {  }
 *  ],
 *  room_id_2: []
 * }
 */
const groupList = {}
io.on('connection', (socket) => {
  console.log('socket连接建立')
  // 加入房间
  socket.on('room', async ({ room, room_id, user_name }) => {
    console.log('传递的值', room, room_id, user_name)

    socket.join(room)
    if (!groupList[room_id]) {
      groupList[room_id] = [{ user_name, room, socket_id: socket.id }]
    } else {
      groupList[room_id].push({ user_name, room, socket_id: socket.id })
    }
    console.log('当前房间情况1', groupList)

    // 管理员广播消息(除了当前客户端无需广播，其他成员需要通知)
    socket.broadcast.emit('info', `${user_name}进来了`)
    socket.emit('info', `${user_name}进来了`)
    // 发送历史消息
    // 1. 数据库查历史消息
    const data = await selectAllChat()
    // 2. 推送给当前连接的客户端
    socket.emit('history', data)
  })

  // 发送消息
  socket.on(
    'putChat',
    async ({ content, fileName, user_name, room_id, room, type }) => {
      // fileName不一定有值(只有属于文件上传消息才有)
      // 数据库操作：存放当前消息
      const data = await addNewChat(content, fileName, user_name, room_id, type)
      // 同个房间内广播消息
      io.to(room).emit('msg', data[0])
    }
  )

  // 断开连接
  socket.on('disconnect', () => {
    Object.keys(groupList).forEach((key) => {
      const level = groupList[key].find((item) => item.socket_id === socket.id)
      socket.broadcast.to(level.room).emit('info', `${level.user_name}离开了`)
      // 更新用户数据
      groupList[key] = groupList[key].filter(
        (item) => item.socket_id !== socket.id
      )
    })
    console.log('当前房间情况', groupList)
  })
})

httpServer.listen(3001, () => {
  console.log('socket服务器已启动 ws://localhost:3001')
})
