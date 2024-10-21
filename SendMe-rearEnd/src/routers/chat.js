import express from 'express'
import JWT from '../utils/jwt.js'
import multer from 'multer'
import multiparty from 'multiparty'
import path from 'node:path'
import fs from 'node:fs'
const chatRouter = express.Router()

// 所有上传的文件存放到该目录下
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads')

/**
 * 切片上传
 */
chatRouter.post('/upload', (req, res) => {
  const form = new multiparty.Form()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(401).json({
        ok: false,
        msg: '上传失败',
      })
    }
    // hash值
    const hash = fields.hash[0]
    // 文件名称
    const fileName = fields.name[0]
    // 拓展名
    const extName = fields.extname[0]

    // 创建文件夹(如果没有的话)
    const chunkDir = path.join(UPLOAD_DIR, hash)
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir)
    }

    // 文件的旧路径(本地路径)
    // 注意，之所以是.file,是因为和前端append的对象字段对应
    const oldPath = files.file[0].path
    // 把文件切片移动到临时的切片文件夹中
    const newPath = path.join(chunkDir, fileName)
    try {
      // 注意是fs的promise模块
      await fs.promises.rename(oldPath, newPath)
    } catch (error) {
      console.log('移动出错')
    }

    res.json({
      code: 200,
      msg: 'chunk upload success',
      data: null,
    })
  })
})

/**
 * 文件合并
 */
chatRouter.post('/merge', async (req, res) => {
  // 文件hash值，拓展名,切片大小
  const { hash, extName, size } = req.body
  // 文件路径
  const filePath = path.join(UPLOAD_DIR, `${hash}${extName}`)

  // 如果大文件已经存在，就无需合并
  if (fs.existsSync(filePath)) {
    return res.json({
      code: 200,
      msg: 'already merge',
      data: null,
    })
  }

  /**
   * 找到切片文件夹
   */
  const chunkDir = path.join(UPLOAD_DIR, hash)
  if (!fs.existsSync(chunkDir)) {
    return res.json({
      code: 200,
      msg: '合并失败，请重新上传',
      data: null,
    })
  }

  // 文件合并
  await mergeFileChunk(filePath, hash, size)

  res.json({
    code: 200,
    msg: 'merge success',
    data: `${req.protocol}://${req.get('host')}/uploads/${hash}${extName}`,
  })
})

/**
 * 进行文件合并
 */
const mergeFileChunk = async (filePath, fileHash, size) => {
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash)
  // 读取所有切片
  let chunkPaths = await fs.promises.readdir(chunkDir)
  // 根据索引排序
  chunkPaths = chunkPaths.sort((a, b) => a.split('-')[0] - b.split('-')[0])

  const list = chunkPaths.map((chunkPath, index) => {
    return pipeStream(
      path.join(chunkDir, chunkPath),
      fs.createWriteStream(filePath, {
        start: index * size,
        end: (index + 1) * size,
      })
    )
  })

  await Promise.all(list)
  // 文件合并后删除保存切片的目录
  fs.rmdirSync(chunkDir)
}

/**
 * 文件读写流
 * @param {*} path 文件路径
 * @param {*} writeStream 可写流
 * @returns 
 */
const pipeStream = (path, writeStream) => {
  return new Promise((resolve, reject) => {
    // 创建可读流
    const readStream = fs.createReadStream(path)
    readStream.on('end', async () => {
      fs.unlinkSync(path)
      resolve()
    })
    readStream.pipe(writeStream)
  })
}

/**
 * 文件上传前的校验(秒传、断点续传)
 */
chatRouter.post('/verify', async (req, res) => {
  const { hash, extName } = req.body
  const filePath = path.join(UPLOAD_DIR, `${hash}${extName}`)
  if (fs.existsSync(filePath)) {
    // 合并之后的文件已经存在，秒传
    res.json({
      code: 1,
      msg: 'had upload',
      data: `${req.protocol}://${req.get('host')}/uploads/${hash}${extName}`,
    })
  } else {
    // 还没有合并之后的文件，但是可能有部分切片
    res.json({
      code: 0,
      msg: 'not exit',
      data: {
        uploadedList: await createUploadedList(hash),
      },
    })
  }
})

/**
 * 找到已经上传的切片
 * @param {*} fileHash 文件hash值
 * @returns 已上传的切片数组
 */
const createUploadedList = async (fileHash) => {
  return fs.existsSync(path.resolve(UPLOAD_DIR, fileHash))
    ? await fs.promises.readdir(path.resolve(UPLOAD_DIR, fileHash)) // 读取该文件夹下所有的文件的名称
    : []
}

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
