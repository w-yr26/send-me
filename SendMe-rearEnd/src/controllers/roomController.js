import {
  addNewRoom,
  delRoomById,
  selectPageRooms,
} from '../models/roomModel.js'
import { validationResult } from 'express-validator'

/**
 * 新增房间
 */
export const addRoom = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.send(errors)
  }

  const { room_name, room_pwd, user_id } = req.body

  await addNewRoom(room_name, room_pwd, user_id)

  res.json({
    code: 200,
    msg: 'success',
    data: null,
  })
}

/**
 * 获取房间列表
 */
export const getRooms = async (req, res) => {
  const { page, pageSize } = req.query

  const { rows, total } = await selectPageRooms(page, pageSize)

  res.json({
    code: 200,
    msg: 'success',
    data: {
      rows,
      total: total[0].total,
    },
  })
}

/**
 * 删除房间
 */
export const delRoom = async (req, res) => {
  const { room_id } = req.params

  await delRoomById(room_id)
  res.json({
    code: 200,
    msg: 'success',
    data: null,
  })
}
