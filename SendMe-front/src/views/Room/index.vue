<template>
  <div class="container">
    <div class="header-box">
      <div class="header-left">
        <van-icon
          class="iconfont"
          class-prefix="icon"
          name="quit"
          color="#6364f0"
          size="24"
          @click="exitRoom"
        />
        <van-icon
          class="iconfont"
          class-prefix="icon"
          name="cc-bell-o"
          color="#007bbc"
          size="24"
          style="margin-left: 10px"
          @click="isShow = true"
        />
      </div>
      <div class="header-right">
        <van-icon
          class="iconfont"
          class-prefix="icon"
          name="send"
          color="#6364f0"
          size="24"
        />
        <h5>SendMe</h5>
      </div>
    </div>
    <!-- 消息输入框 -->
    <div class="post-box">
      <van-cell-group inset>
        <van-field
          label=""
          rows="7"
          v-model="msg"
          placeholder="Input text or paste images here... Press click button to send"
          type="textarea"
          maxlength="300"
          show-word-limit
        />
      </van-cell-group>
      <div class="btn-box">
        <van-uploader :after-read="selectFile">
          <div class="left-btn">
            <div>
              <van-icon
                class="iconfont"
                class-prefix="icon"
                name="plus"
                size="24px"
              />
              <span> Upload </span>
            </div>
            <!-- <div
              class="progress-box"
              v-if="uplaodProgress !== 0 && uplaodProgress !== 100"
            >
              <van-progress :percentage="uplaodProgress" :show-pivot="false" />
            </div> -->
          </div>
        </van-uploader>
        <div class="right-btn" @click="sendMsg">
          <span> Send </span>
          <van-icon
            class="iconfont"
            class-prefix="icon"
            name="upload"
            size="24px"
            color="#fff"
          />
        </div>
      </div>
    </div>
    <!-- 消息列表 -->
    <!-- <template v-for="item in historyMsg" :key="item.id">
      <div class="chat-item" v-if="item.type === 0">
        <div class="time-header">
          <span class="name">@{{ item.user_name }}</span>
          <span>{{ item.create_time }}</span>
        </div>
        <div class="chat-msg">
          <div class="content-box">
            {{ item.content }}
          </div>
          <div class="icon-box" @click="copyMsg(item.content)">
            <van-icon
              class="iconfont"
              class-prefix="icon"
              name="copy"
              size="20px"
              color="#6364F0"
            />
          </div>
        </div>
      </div>
      <div class="file-item" v-else>
        <div class="time-header">
          <span class="name">@{{ item.user_name }}</span>
          <span>{{ item.create_time }}</span>
        </div>
        <div class="file-msg">
          <div class="img-box">
            <van-image width="50" height="50" lazy-load :src="item.content" />
            <span class="file-name-box">
              {{ item.fileName }}
            </span>
          </div>
          <div class="icon-box">
            <van-icon
              class="iconfont"
              class-prefix="icon"
              name="download"
              color="#6364F0"
              size="20px"
              @click="downloadFile(item.fileName)"
              v-if="!isCancelDown"
            />
            <van-circle
              v-model:current-rate="downloadProgress"
              :rate="100"
              :speed="100"
              :size="30"
              stroke-width="100"
              color="#6364F0"
              v-if="isCancelDown"
            >
              <van-icon
                name="close"
                color="#333333"
                size="20px"
                @click="cancleDownload"
              />
            </van-circle>
          </div>
        </div>
      </div>
    </template> -->
    <div
      class="chat-virtual-container"
      :style="{ height: innerHeight - 380 + 'px' }"
    >
      <virtualList
        :data-source="historyMsg"
        :estimated-height="100"
        :is-loading="false"
      >
        <template #item="{ item }">
          <div class="chat-item" v-if="item.type === 0">
            <div class="time-header">
              <span class="name">@{{ item.user_name }}</span>
              <span>{{ item.create_time }}</span>
            </div>
            <div class="chat-msg">
              <div class="content-box">
                {{ item.content }}
              </div>
              <div class="icon-box" @click="copyMsg(item.content)">
                <van-icon
                  class="iconfont"
                  class-prefix="icon"
                  name="copy"
                  size="20px"
                  color="#6364F0"
                />
              </div>
            </div>
          </div>
          <div class="file-item" v-else>
            <div class="time-header">
              <span class="name">@{{ item.user_name }}</span>
              <span>{{ item.create_time }}</span>
            </div>
            <div class="file-msg">
              <div class="img-box">
                <van-image
                  width="50"
                  height="50"
                  lazy-load
                  :src="item.content"
                />
                <span class="file-name-box">
                  {{ item.fileName }}
                </span>
              </div>
              <div class="icon-box">
                <van-icon
                  class="iconfont"
                  class-prefix="icon"
                  name="download"
                  color="#6364F0"
                  size="20px"
                  @click="downloadFile(item.fileName)"
                  v-if="!isCancelDown"
                />
                <van-circle
                  v-model:current-rate="downloadProgress"
                  :rate="100"
                  :speed="100"
                  :size="30"
                  stroke-width="100"
                  color="#6364F0"
                  v-if="isCancelDown"
                >
                  <van-icon
                    name="close"
                    color="#333333"
                    size="20px"
                    @click="cancleDownload"
                  />
                </van-circle>
              </div>
            </div>
          </div>
        </template>
      </virtualList>
    </div>

    <!-- 管理员消息通知中心 -->
    <van-popup
      v-model:show="isShow"
      position="left"
      :style="{
        width: '50%',
        height: '100%',
        padding: '20px',
        background: '#f5f7fa',
      }"
    >
      <h5>管理员通知:</h5>
      <div class="notify-box" v-for="item in adminMsg" :key="item">
        {{ item }}
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { useUserStore } from '@/store'
import { useRoute, useRouter } from 'vue-router'
import useClipboard from 'vue-clipboard3'
import { getDownloadAPI, postFileAPI, postMergeAPI, postVerifyAPI } from '@/apis/room'
import virtualList from '@/components/virtualList.vue'
import { uploaderProps } from 'vant'
import SparkMD5 from 'spark-md5'
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { toClipboard } = useClipboard()

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
})
// 输入的消息
const msg = ref('')
// 消息列表
const historyMsg = ref([])
// 管理员消息通知列表
const adminMsg = ref([])
// 屏幕高度
const innerHeight = ref(0)
onMounted(() => {
  // 获取屏幕高度
  innerHeight.value = window.innerHeight
  socket.on('connect', () => {
    // 加入房间
    socket.emit('room', {
      room: route.query.room,
      room_id: route.query.room_id,
      user_name: userStore.userInfo.account,
    })
    // 接收管理员信息
    socket.on('info', (text) => {
      adminMsg.value.push(text)
    })
    // 接收历史消息和接收新发的消息时，需要改变一下源数据，为每一项添加index属性，方便监听滚动改变视图区域的内容
    // 接收历史消息
    socket.on('history', (data) => {
      const newData = data.map((chat, index) => {
        return {
          ...chat,
          index,
        }
      })
      historyMsg.value = [...newData]
    })
    // 接收新发送的消息
    socket.on('msg', (newMsg) => {
      historyMsg.value.push({
        ...newMsg,
        index: historyMsg.value.length,
      })
    })
  })
})
// 发送新消息,同时接收新消息
const sendMsg = () => {
  if (msg.value === '') return
  // 触发事件,发送消息
  socket.emit('putChat', {
    content: msg.value,
    user_name: userStore.userInfo.account,
    room_id: route.query.room_id,
    room: route.query.room,
    type: 0,
  })
  // 清空消息
  msg.value = ''
}

onUnmounted(() => {
  // 断开连接
  socket.disconnect()
})

// 复制消息
const copyMsg = (content) => {
  toClipboard(content)
  showNotify({
    type: 'success',
    message: '复制成功',
    position: 'center',
    background: '#ffffff',
    color: '#acacee',
    duration: '500',
  })
}
// 退出房间
const exitRoom = () => {
  router.back()
}

const extname = ref('')
const hashValue = ref('')
// 选择文件上传
const selectFile = async (e) => {
  // 文件拓展名 .jpg/.png
  const fileName = e.file.name
  extname.value = fileName.slice(fileName.lastIndexOf('.', fileName.length))
  // 创建切片
  const fileChunks = chunkFun(e.file)
  // 读取文件hash值
  hashValue.value = await calculateHash(fileChunks)
  console.log('hash值', hashValue.value)
  // 分片上传前的校验
  const { code, data } = await postVerifyAPI({
    hash: hashValue.value,
    extName: extname.value,
  })
  if (code) {
    console.log('秒传')
    const fileUrl = data
    // 发送消息
    socket.emit('putChat', {
      content: fileUrl,
      fileName: data.fileName,
      user_name: userStore.userInfo.account,
      room_id: route.query.room_id,
      room: route.query.room,
      type: 1, // 0:文字信息;1:文件信息
    })
  } else {
    // 找到已上传的切片
    const uploadedList = data.uploadedList
    // 分片上传
    await uploadChunks(fileChunks, uploadedList)
  }
}

// 切片的大小
const CHUNK_SIZE = 1024 * 1024 * 0.5
// 文件切片
const chunkFun = (file) => {
  const chunksList = []
  for (let i = 0; i < file.size; i += CHUNK_SIZE) {
    chunksList.push({ file: file.slice(i, i + CHUNK_SIZE) })
  }
  return chunksList
}
// 读取文件的hash值
const calculateHash = async (fileChunks) => {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer()
    const chunks = []

    fileChunks.forEach((chunk, index) => {
      if (index === 0 || index === fileChunks.length - 1) {
        // 1. 第一个和最后一个切片的内容全部参与计算
        chunks.push(chunk.file)
      } else {
        // 2. 中间剩余的切片我们分别在前面、后面和中间取2个字节参与计算
        // 前面的2字节
        chunks.push(chunk.file.slice(0, 2))
        // 中间的2字节
        chunks.push(chunk.file.slice(CHUNK_SIZE / 2, CHUNK_SIZE / 2 + 2))
        // 后面的2字节
        chunks.push(chunk.file.slice(CHUNK_SIZE - 2, CHUNK_SIZE))
      }
    })

    const reader = new FileReader()
    reader.readAsArrayBuffer(new Blob(chunks))
    reader.onload = (e) => {
      spark.append(e.target.result)
      resolve(spark.end())
    }
  })
}
// 分片上传
const uploadChunks = async (fileChunks, uploadedList) => {
  const data = fileChunks
    .filter((item, index) => {
      return !uploadedList.includes(`${hashValue.value}-${index}`)
    })
    .map(({ file }, index) => {
      return {
        file,
        name: `${hashValue.value}-${index}`,
      }
    })
  // Promise数组
  const proList = data.map((item) => {
    const fd = new FormData()
    fd.append('hash', hashValue.value) // 文件hash值，用于创建切片文件夹
    fd.append('name', item.name) // 文件名称 hash值-index
    fd.append('extname', extname.value) // 拓展名(方便后续返回)
    fd.append('file', item.file) // 文件对象
    return postFileAPI(fd)
  })

  await Promise.all(proList)
  // 文件合并
  const res = await postMergeAPI({
    hash: hashValue.value,
    extName: extname.value,
    size: CHUNK_SIZE,
  })
  console.log('合并')
  const fileUrl = res.data
  // 发送消息
  socket.emit('putChat', {
    content: fileUrl,
    fileName: data.fileName,
    user_name: userStore.userInfo.account,
    room_id: route.query.room_id,
    room: route.query.room,
    type: 1, // 0:文字信息;1:文件信息
  })
}

// 是否显示取消按钮
const isCancelDown = ref(false)
// 下载进度
const downloadProgress = ref(0)
// 中断请求控制对象
let controller
// 文件下载
const downloadFile = async (fileName) => {
  isCancelDown.value = true
  controller = new AbortController()
  // 返回一个blob对象,通过type属性可以读取文件的类型 image/jpeg image/png
  const res = await getDownloadAPI(fileName, controller, (e) => {
    const current = e.loaded
    const total = e.total
    downloadProgress.value = Math.round((current / total) * 100)
  })
  const blob = new Blob([res], { type: res.type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  // 移除a标签
  a.remove()
  isCancelDown.value = false
  downloadProgress.value = 0
}
// 取消文件下载
const cancleDownload = () => {
  try {
    isCancelDown.value = false
    if (controller) {
      controller.abort() // 使用 abort 方法中止下载
    }
    showFailToast('下载取消')
    downloadProgress.value = 0
  } catch (error) {
    console.log('中断下载')
  }
}

// 管理员中心
const isShow = ref(false)
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  width: 100%;
  // background-color: #111111;
  padding: 0 20px;
  box-sizing: border-box;

  .header-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;

    .header-right {
      display: flex;
      align-items: center;
    }

    h5 {
      color: #333333;
      font-size: 14px;
      font-weight: 600;
      margin-left: 5px;
    }
  }

  .post-box {
    height: 250px;
    border: 1px solid #cccccc;
    border-radius: 10px;
    padding: 10px;
  }
}

.van-cell-group--inset {
  margin: 0;
}
.van-cell {
  padding: 5px;
}

.btn-box {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .left-btn,
  .right-btn {
    width: 108px;
    height: 48px;
    color: #6364f0;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f3f4f4;
    box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);

    span {
      margin: 0 5px;
    }
  }

  .left-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 5px;

    .progress-box {
      margin-top: 5px;
      width: 100%;
    }
  }

  .right-btn {
    background-color: #6364f0;
    color: #fff;
  }
}

.chat-item,
.file-item {
  margin-bottom: 10px;
  padding: 20px 10px;
  border-radius: 10px;
  background-color: #f3f4f4;

  .time-header {
    color: #787878;
    font-size: 12px;
    margin-bottom: 10px;

    .name {
      color: #6364f0;
      margin-right: 5px;
    }
  }

  .chat-msg {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .file-msg {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .content-box {
    flex: 1;
    color: #111111;
    font-size: 12px;
    font-weight: 500;
    word-wrap: break-word;
    word-break: break-all;
  }

  .img-box {
    flex: 1;
    display: flex;
    align-items: center;
    width: 50px;

    .file-name-box {
      flex: 1;
      margin-left: 5px;
      color: #333333;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .icon-box {
    display: flex;
    justify-content: center;
    width: 50px;
  }
}

.notify-box {
  height: 50px;
  background-color: #eaeaf6;
  line-height: 50px;
  font-size: 12px;
  text-align: center;
  border-radius: 10px;
  margin-top: 5px;
}

.van-circle {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-virtual-container {
  margin-top: 10px;
  width: 100%;
  height: 400px;
}
</style>
