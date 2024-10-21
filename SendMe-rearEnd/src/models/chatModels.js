import db from '../db/index.js'

/**
 * 发送新消息
 */
export const addNewChat = async (
  content,
  fileName,
  user_name,
  room_id,
  type
) => {
  // 先插入,插入成功返回消息id,然后再查找返回消息内容
  const ids = await db('chathistory').insert({
    content,
    fileName,
    user_name,
    room_id,
    type,
  })
  return await db('chathistory').select().where({ id: ids[0] })
}

/**
 * 查询历史消息(倒序排序)
 */
export const selectAllChat = async (page = 1, pageSize = 10) => {
  return await db('chathistory').select()
}
