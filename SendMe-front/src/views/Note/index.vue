<template>
  <div class="content-list">
    <div class="content-item" v-for="item in editList" :key="item.id">
      <div class="content">
        <container :content="item.content"></container>
      </div>
      <div class="footer-box">
        <div class="time-box">
          {{ item.edit_create_time }}
        </div>
        <div class="down-icon" @click="delEdit(item.id)">
          <van-icon name="delete-o" color="#6364f0" />
        </div>
      </div>
    </div>
  </div>

  <div class="add-box" :class="isExtend && 'translate-dis'">
    <div class="left-icon" @click="extendRight">
      <van-icon name="arrow-left" color="#fff" size="20" v-if="!isExtend" />
      <van-icon name="arrow" color="#fff" size="20" v-else />
    </div>
    <div class="right-icon" @click="isShow = true">
      <van-icon name="add-o" color="#fff" size="20" />
    </div>
  </div>

  <div>
    <van-popup
      v-model:show="isShow"
      position="bottom"
      :style="{ height: '70%' }"
    >
      <editor @finish="onFinish"></editor>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import editor from './components/editor.vue'
import container from './components/container.vue'
import { delEditAPI, getEditsAPI, postNewNoteAPI } from '@/apis/edit'
import { useUserStore } from '@/store'
const userStore = useUserStore()
const isShow = ref(false)

onMounted(async () => {
  await getList()
})

const params = ref({
  page: 1,
  pageSize: 10,
})
const editList = ref([])
const totalNum = ref(0)

const getList = async () => {
  const {
    data: { rows, total },
  } = await getEditsAPI(params.value.page, params.value.pageSize)
  params.value.page++
  editList.value = [...editList.value, ...rows]
  totalNum.value = total
}

// 发送内容
const onFinish = async (content) => {
  isExtend.value = false
  isShow.value = false
  await postNewNoteAPI({
    content,
    user_id: userStore.userInfo.id,
  })

  showSuccessToast('创建成功')
  resetData()
  await getList()
}

const resetData = () => {
  params.value.page = 1
  params.value.pageSize = 10
  editList.value = []
}

// 删除
const delEdit = async (id) => {
  const { code } = await delEditAPI(id)
  if (code === 200) showSuccessToast('删除成功')
  editList.value = editList.value.filter((item) => {
    return item.id !== id
  })
}

const isExtend = ref(false)
const extendRight = () => {
  isExtend.value = !isExtend.value
}
</script>

<style lang="scss" scoped>
.content-list {
  padding: 15px 15px 0;
}

.content-item {
  background-color: #fff;
  width: 100%;
  border-radius: 10px;
  padding: 0 10px;
  margin-bottom: 10px;
  box-sizing: border-box;

  .content {
    line-height: 1.5;
    color: #222222;
    word-break: break-all;
    // max-height: 100px;
    overflow: hidden;
    transition: max-height 0.5s ease;
  }

  .footer-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    height: 20px;

    .time-box {
      font-size: 12px;
      color: #787878;
    }
  }
}

.add-box {
  position: fixed;
  right: 0;
  top: 50%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  transform: translate(50%, -50%);
  width: 60px;
  height: 35px;
  background-color: #6364f0;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  box-shadow: 0px 0px 28px -3px rgba(0, 0, 0, 0.1);
}

.translate-dis {
  transform: translate(0, -50%);
}
</style>
