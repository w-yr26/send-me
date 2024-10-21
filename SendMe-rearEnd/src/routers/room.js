import express from 'express'
import JWT from '../utils/jwt.js'
import { check } from 'express-validator'
import { addRoom, delRoom, getRooms } from '../controllers/roomController.js'
const roomRouter = express.Router()

/**
 * 新建房间
 */
roomRouter.post(
  '/add',
  [
    check('room_name', '请输入房间名').trim().notEmpty(),
    check('room_pwd', '请输入房间密码').trim().notEmpty(),
  ],
  JWT.middleware(),
  addRoom
)
/**
 * 获取所有房间列表
 */
roomRouter.get('/get', JWT.middleware(), getRooms)
/**
 * 删除某个房间
 */
roomRouter.delete('/del/:room_id', JWT.middleware(), delRoom)

export default roomRouter
