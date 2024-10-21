import { check } from 'express-validator'
import express from 'express'
import { loginUser, refreshUser, registerUser } from '../controllers/userController.js'
const userRouter = express.Router()

/**
 * 用户注册
 */
userRouter.post(
  '/register',
  [
    check('account', '请输入合法名').isLength({ min: 11 }),
    check('password', '请输入合法密码').isLength({ min: 6 }),
  ],
  registerUser
)
/**
 * 用户登录
 */
userRouter.post(
  '/login',
  [
    check('account', '请输入合法名').isLength({ min: 11 }),
    check('password', '请输入合法密码').isLength({ min: 6 }),
  ],
  loginUser
)
/**
 * 用户无感刷新
 */
userRouter.post('/refresh', refreshUser)
export default userRouter
