import express from 'express'
import JWT from '../utils/jwt.js'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
const chatRouter = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `test/`)
  }, // 上传的文件存放在uplads文件夹下
  filename: function (req, file, cb) {
    //file: {
    //   fieldname: 'file',
    //   originalname: 'avatar.jpg',
    //   encoding: '7bit',
    //   mimetype: 'image/jpeg'
    // }
    // 文件后缀
    console.log('上传文件信息', file)

    const ext = path.extname(file.originalname)
    // 文件名称
    const filename = Date.now() + ext
    cb(null, filename)
  },
})

const upload = multer({ storage: storage }).single('file')

/**
 * 文件上传
 */
chatRouter.post('/upload', (req, res) => {
  // 文件信息 req.file {
  //   fieldname: 'file',
  //   originalname: 'avatar.jpg',
  //   encoding: '7bit',
  //   mimetype: 'image/jpeg',
  //   destination: 'uploads/',
  //   filename: '1727422516880.jpg',
  //   path: 'uploads\\1727422516880.jpg',
  //   size: 19017
  // }
  // res.json({
  //   code: 200,
  //   msg: 'success',
  //   data: {
  //     path: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
  //     fileName: req.file.filename,
  //   },
  // })
  // upload(req, res, (err) => {
  //   if (err) {
  //     console.log('err', req.file.filename)

  //     console.log('文件上传出错')
  //   } else {
  //     res.send(req.file.filename)
  //   }
  // })

  upload(req, res, function (err) {
    console.log('req.file', req.file)
    console.log('req.body', req.body)

    if (err instanceof multer.MulterError) {
      // 发生错误
      console.log('文件上传出错')
      res.send('error')
    } else if (err) {
      // 发生错误
      console.log('出错111')
      res.send('error2')
    } else {
      res.send(req.file.filename)
    }
  })
})

/**
 * 文件下载
 */
chatRouter.get('/download', (req, res) => {
  const fileName = req.query.fileName
  const filePath = path.join(process.cwd(), './uploads', fileName)
  const content = fs.readFileSync(filePath)
  // 返回流的形式
  // res.setHeader('Content-Type', 'application/octet-stream')
  // res.setHeader('Content-Disposition', 'attachment;filename=' + fileName)
  // res.json({
  //   code: 200,
  //   msg: 'success',
  //   data: content,
  // })
  // res.status(200).send(content)
  res.status(200).download(filePath, fileName)
})

export default chatRouter
