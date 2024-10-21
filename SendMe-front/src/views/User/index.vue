<!-- <template>
  <div class="test-estimated-list-container">
    <virtualList
      :data-source="dataSource"
      :estimated-height="100"
      :isLoading="loading"
      @get-more-data="onLoadMore"
    >
      <template #item="{ item }">
        <div class="list-item">{{ item.index }} - {{ item.content }}</div>
      </template>
    </virtualList>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import virtualList from '@/components/virtualList.vue'
const dataSource = ref([])
const loading = ref(false)
function getRandomString(length) {
  const characters =
    '臣亮上奏：先帝創建帝國還沒成功，中途就過世了。現在天下分成三國，益州財力不夠、人力困乏，這實在是危急存亡的緊要關頭！然而皇帝身邊的臣子，在朝廷內盡忠職守不敢懈怠；忠誠的將士，在朝廷外捨身為國效命，這都是為了追念先帝特殊優厚的對待，想要報答在陛下您的身上啊！陛下應該擴大自己的見聞，廣泛聽取意見，用來發揚光大先帝遺留下來的德性，擴大仁人志士的勇氣；不應該隨便看輕自己，引用一些不合義理的事來作譬喻，以致阻塞了忠臣進諫的道路'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function generateRandomData() {
  loading.value = true
  setTimeout(() => {
    const newData = []
    for (let i = 0; i < 20; i++) {
      const len = dataSource.value.length + newData.length
      const randomLength = Math.floor(Math.random() * 101) + 100 // 随机长度在 30 到 50 之间
      newData.push({ content: getRandomString(randomLength), index: len })
    }
    dataSource.value = [...dataSource.value, ...newData]
    loading.value = false
  }, 1000)
}

onMounted(() => {
  generateRandomData()
})

const onLoadMore = () => {
  console.log('加载更多')
  generateRandomData()
}

// dataSource.value = generateRandomData()
// console.log(dataSource.value)
</script>

<style lang="scss" scoped>
.test-estimated-list-container {
  width: 100%;
  height: 100%;
}
.list-item {
  border: 1px solid #000;
  padding: 10px;
  word-wrap: break-word;
  word-break: break-all;
  letter-spacing: 0.1em;
}
</style> -->

<template>
  <div>
    <van-uploader :after-read="afterRead" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { postFileAPI, postMergeAPI, postVerifyAPI } from '@/apis/room'
import SparkMD5 from 'spark-md5'
const hashValue = ref('')
const extname = ref('')
/**
 * 1. 文件分片
 * 2. 计算文件hash值
 * 3. 分片上传
 * 分片上传完毕，合并切片
 */
const afterRead = async (e) => {
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
    showSuccessToast('上传成功,秒传')
  } else {
    // 找到以上传的切片
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
  await postMergeAPI({
    hash: hashValue.value,
    extName: extname.value,
    size: CHUNK_SIZE,
  })
}
</script>

<style lang="scss" scoped></style>
