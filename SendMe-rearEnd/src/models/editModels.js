import db from '../db/index.js'

export const selectPageEdits = async (page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize
  return {
    rows: await db('edit').select().limit(pageSize).offset(offset),
    total: await db('edit').select().count('* as total'),
  }
}

export const addNewEdit = async (content, user_id) => {
  return await db('edit').insert({ content, user_id })
}

export const delEditById = async (id) => {
  return await db('edit').delete().where({ id })
}
