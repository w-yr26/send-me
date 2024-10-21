import multiparty from 'multiparty'
import path from 'node:path'
import fs from 'node:fs'
import { validationResult } from 'express-validator'
import {
  addNewEdit,
  delEditById,
  selectPageEdits,
} from '../models/editModels.js'

import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
const window = new JSDOM('').window
const purify = DOMPurify(window)

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploadEdit')

/**
 * 富文本上传图片
 */
export const uploadImg = (req, res) => {
  const form = new multiparty.Form()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.json({
        errno: 1,
        message: '上传失败',
      })
    }

    // 文件名称
    const fileName = fields.name[0]

    // 文件的旧路径(本地路径)
    // 注意，之所以是.file,是因为和前端append的对象字段对应
    const oldPath = files.file[0].path

    // 把文件移动到图片文件夹中
    const newPath = path.join(UPLOAD_DIR, fileName)
    try {
      // 注意是fs的promise模块
      await fs.promises.rename(oldPath, newPath)
    } catch (error) {
      console.log('移动出错', error)
    }
    res.json({
      errno: 0, // 注意：值是数字，不能是字符串
      data: {
        url: `${req.protocol}://${req.get('host')}/uploadEdit/${fileName}`, // 图片 src ，必须
        href: `${req.protocol}://${req.get('host')}/uploadEdit/${fileName}`, // 图片在线链接 ，必须
      },
    })
  })
}

/**
 * 获取小记列表
 */
export const getEdits = async (req, res) => {
  const { page, pageSize } = req.query

  const { rows, total } = await selectPageEdits(page, pageSize)

  // res.setHeader('content-security-policy', '')
  res.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' ; style-src 'self' ; img-src 'self' data:; connect-src 'self' ;"
  )
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
 * 新增小记
 */
export const addEdit = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.send(errors)
  }

  const { content, user_id } = req.body
  // purify.sanitize(content)
  await addNewEdit(content, user_id)

  res.json({
    code: 200,
    msg: 'success',
    data: null,
  })
}

/**
 * 删除小记
 * @returns
 */
export const delEdit = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.send(errors)
  }

  const { edit_id } = req.params
  await delEditById(edit_id)

  res.json({
    code: 200,
    msg: 'delete success',
    data: null,
  })
}
