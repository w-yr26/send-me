import express from 'express'
import JWT from '../utils/jwt.js'
import { check } from 'express-validator'
import {
  addEdit,
  uploadImg,
  delEdit,
  getEdits,
} from '../controllers/editController.js'

const editRouter = express.Router()

/**
 * 富文本上传图片
 */
editRouter.post('/img', uploadImg)

/**
 * 创建小记
 */
editRouter.post(
  '/create',
  [
    check('content', '请输入内容').trim().notEmpty(),
    check('user_id', '请传入用户id').trim().notEmpty(),
  ],
  JWT.middleware(),
  addEdit
)

/**
 * 获取小记列表
 */
editRouter.get(
  '/list',
  JWT.middleware(),
  getEdits
)

/**
 * 删除小记
 */
editRouter.delete(
  '/delete/:edit_id',
  [check('edit_id', '请传入小记id').trim().notEmpty()],
  JWT.middleware(),
  delEdit
)

export default editRouter
