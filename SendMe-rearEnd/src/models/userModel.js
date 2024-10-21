import db from '../db/index.js'

/**
 *
 * @returns 特定用户
 */
export const findUser = async (account) => {
  // 返回数据库查找结果
  // .columns('account','password') 限定返回字段
  return await db('user').select().where({ account })
}

/**
 *
 * @param {*} account 用户账号
 * @param {*} password 密码
 */
export const addNewUser = async (account, password) => {
  return await db('user').insert({
    account,
    password,
  })
}
