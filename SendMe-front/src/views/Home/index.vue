<template>
  <div class="container">
    <div class="header-box">
      <div class="header-left">
        <van-icon
          class="iconfont"
          class-prefix="icon"
          name="send"
          color="#6364f0"
          size="24"
        />
        <h5>SendMe</h5>
      </div>
      <div class="header-right" @click="isShow = true">
        <van-icon
          class="iconfont"
          class-prefix="icon"
          name="plus"
          color="#6364f0"
          size="24"
        />
      </div>
    </div>
    <!-- <div class="room-list-box"> -->
    <van-list
      v-model:loading="isLoading"
      :finished="isFinished"
      finished-text="没有更多了"
      @load="onLoad"
      class="room-list-box"
    >
      <div class="room-item" v-for="item in roomList" :key="item.id">
        <div class="info-box">
          <div class="title-box">
            <div class="name">
              <span>
                <van-icon
                  class="iconfont"
                  class-prefix="icon"
                  name="doorroom"
                  color="#3b3f88"
                />
              </span>
              <span>
                {{ item.room_name }}
              </span>
            </div>
            <span
              @click="delRoom(item.id)"
              v-if="userStore.userInfo.id === item.user_id"
            >
              <van-icon name="delete-o" color="#111111" />
            </span>
          </div>
          <div class="room-time-box">{{ item.create_time }}</div>
        </div>
        <div
          class="btn-box"
          @click="toRoom(item.id, item.room_name, item.room_pwd)"
        >
          Enter
        </div>
      </div>
      <!-- </div> -->
    </van-list>
  </div>

  <!-- 创建房间弹层 -->
  <van-popup
    v-model:show="isShow"
    round
    position="bottom"
    :style="{ height: '40%', padding: '20px', background: '#f5f7fa' }"
  >
    <h4>创建房间</h4>
    <div class="form-box">
      <van-form @submit="onSubmit" ref="formRef">
        <van-cell-group inset>
          <van-field
            v-model="formData.room_name"
            name="房间名称"
            label="房间名称"
            placeholder="请输入房间名称"
            :rules="[{ required: true, message: '请填写房间名称' }]"
          />
          <van-field
            v-model="formData.room_pwd"
            type="password"
            name="密码"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写房间密码' }]"
          />
        </van-cell-group>
        <div style="margin: 25px">
          <van-button round block type="primary" native-type="submit">
            提交
          </van-button>
        </div>
      </van-form>
    </div>
  </van-popup>

  <!-- 房间密码弹层 -->
  <van-popup
    v-model:show="isEnter"
    round
    position="bottom"
    :style="{ height: '25%', padding: '20px', background: '#f5f7fa' }"
    @click-overlay="onOverlay"
  >
    <h4>权限验证</h4>
    <div class="form-box">
      <van-form @submit="validatePwd" show-error :show-error-message="false">
        <van-cell-group inset>
          <van-field
            v-model="formData.room_pwd"
            name="房间密码"
            label="房间密码"
            placeholder="请输入房间密码"
            :type="showPwd ? 'text' : 'password'"
            :rules="[{ required: true, message: '请填写房间密码' }]"
          >
            <template #right-icon>
              <van-icon name="eye-o" v-if="!showPwd" @click="showPwd = true" />
              <van-icon name="closed-eye" v-else @click="showPwd = false" />
            </template>
          </van-field>
        </van-cell-group>
        <div style="margin: 25px">
          <van-button round block type="primary" native-type="submit">
            进入
          </van-button>
        </div>
      </van-form>
    </div>
  </van-popup>
</template>

<script setup>
import { delRoomAPI, getRoomAPI, postAddRoomAPI } from '@/apis/room'
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'
const userStore = useUserStore()
const router = useRouter()
// 房间列表
const roomList = ref([])
const isLoading = ref(false)
const isFinished = ref(false)
// 显示popup
const isShow = ref(false)
const isEnter = ref(false)
onMounted(() => {
  getRoomList()
})
const params = ref({
  page: 1,
  pageSize: 10,
})
const total = ref(0)
const hasMore = computed(() => {
  return roomList.value.length < total.value
})
const getRoomList = async () => {
  const { data } = await getRoomAPI(params.value.page, params.value.pageSize)
  // 倒序追加数据
  roomList.value = [...roomList.value, ...data.rows.reverse()]
  // 页数++
  params.value.page++
}
// 加载下一页数据
const onLoad = async () => {
  isLoading.value = false
  // 没有更多数据
  if (!hasMore.value) {
    isFinished.value = true
    return
  }
  // 加载下一页
  await getRoomList()
}
// 创建房间
const formData = ref({
  room_name: '',
  room_pwd: '',
})
const resetData = {
  room_name: '',
  room_pwd: '',
}
const onSubmit = async () => {
  const { code } = await postAddRoomAPI({
    room_name: formData.value.room_name,
    room_pwd: formData.value.room_pwd,
    user_id: userStore.userInfo.id,
  })
  isShow.value = false
  formData.value = { ...resetData }
  code === 200 ? showSuccessToast('创建成功') : showSuccessToast('创建失败')
  resetParams()
  await getRoomList()
}

const resetParams = () => {
  params.value.page = 1
  params.value.pageSize = 10
  roomList.value = []
}
// 删除房间
const delRoom = (id) => {
  showConfirmDialog({
    title: '温馨提示',
    message: '您确认要删除当前房间吗？',
  })
    .then(async () => {
      const { code } = await delRoomAPI(id)
      code === 200 ? showSuccessToast('删除成功') : showSuccessToast('删除失败')
      roomList.value = roomList.value.filter((item) => item.id !== id)
    })
    .catch(() => {
      console.log('取消删除')
    })
}
const selectId = ref(undefined)
const selectRoom = ref(undefined)
const selectPwd = ref(undefined)
const showPwd = ref(false)
const toRoom = async (id, room, pwd) => {
  isEnter.value = true
  selectId.value = id
  selectRoom.value = room
  selectPwd.value = pwd
}
const validatePwd = () => {
  if (formData.value.room_pwd !== selectPwd.value)
    return showFailToast('密码错误')

  router.push(`/room?room_id=${selectId.value}&room=${selectRoom.value}`)
}
// 点击遮罩层
const onOverlay = () => {
  formData.value = { ...resetData }
}
</script>

<style lang="scss" scoped>
.container {
  .header-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    padding: 0 20px;
    .header-left {
      display: flex;
      align-items: center;
    }

    h5 {
      color: #2b2b33;
      font-size: 14px;
      font-weight: 600;
      margin-left: 5px;
    }
  }

  .room-list-box {
    padding: 0 20px;

    .room-item {
      position: relative;
      background-color: #fff;
      border-radius: 10px;
      padding: 20px;
      height: 120px;
      margin-top: 20px;
      box-shadow: 0px 7px 15px 0px rgba(0, 0, 0, 0.1);

      .info-box {
        color: #111111;

        .title-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 16px;
          font-weight: 600;
          padding: 5px 0;

          .name {
            border-left: 3px solid #3b3f88;
            padding-left: 5px;
          }
        }

        .room-time-box {
          color: #bbbbbb;
          font-size: 13px;
          padding: 5px 0;
        }
      }

      .btn-box {
        position: absolute;
        width: 85px;
        height: 40px;
        background-color: #6364f0;
        border-radius: 10px;
        bottom: 20px;
        right: 20px;
        color: #fff;
        line-height: 40px;
        text-align: center;
      }
    }
  }
}

.form-box {
  margin-top: 30px;
}
</style>
