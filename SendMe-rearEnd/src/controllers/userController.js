import { validationResult } from 'express-validator'
import { addNewUser, findUser } from '../models/userModel.js'
import JWT from '../utils/jwt.js'

/**
 * 注册
 */
export const registerUser = async (req, res) => {
  // 数据dto层判断
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.send(errors)
  }
  const { account, password } = req.body
  await addNewUser(account, password)

  res.json({
    code: 200,
    msg: 'success',
    data: null,
  })
}

/**
 * 登录
 */
export const loginUser = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.send(errors)
  }

  const { account, password } = req.body
  // 1. 先找到该用户
  const data = await findUser(account)
  if (!data.length) {
    return res.json({
      code: 200,
      msg: 'Not Found',
      data: null,
    })
  }
  if (data[0].password !== password) {
    return res.json({
      code: 200,
      msg: 'password error',
      data: null,
    })
  }
  // 2. 生成token和refresh_token
  const token = JWT.generate(data[0])
  const refresh_token = JWT.doubleCheck(data[0])
  // 3. 返回前端
  res.json({
    code: 200,
    msg: 'success',
    data: {
      token,
      refresh_token,
      id: data[0].id,
      account: data[0].account.slice(7, 11),
    },
  })
}

/**
 * 无感刷新
 */
export const refreshUser = async (req, res) => {
  // 注意，这个refresh_token也可能已经过期，所以要trycatch一下
  try {
    // 解密用户信息
    const result = JWT.verify(req.body.refresh_token)
    console.log('用户信息', result)

    // 找到该用户，生成新的token和regresh_token
    const data = await findUser(result.account)
    const token = JWT.generate(data[0])
    const refresh_token = JWT.doubleCheck(data[0])
    // 生成新的token返回
    res.json({
      code: 200,
      msg: 'success',
      data: {
        token,
        refresh_token,
      },
    })
  } catch (error) {
    res.json({
      code: 401,
      msg: 'error',
      data: null,
    })
  }
}
