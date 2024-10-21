import db from '../db/index.js'

export const addNewRoom = async (room_name, room_pwd, user_id) => {
  return await db('room').insert({ room_name, room_pwd, user_id })
}

export const selectPageRooms = async (page, pageSize) => {
  const offset = (page - 1) * pageSize
  return {
    rows: await db('room').select().limit(pageSize).offset(offset),
    total: await db('room').select().count('* as total'),
  }
}

export const delRoomById = async (id) => {
  return await db('room').delete().where({ id })
}
