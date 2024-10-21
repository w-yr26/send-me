<template>
  <div class="fs-estimated-virtuallist-container">
    <div class="fs-estimated-virtuallist-content" ref="contentRef">
      <div
        class="fs-estimated-virtuallist-list"
        ref="listRef"
        :style="scrollStyle"
      >
        <div
          class="fs-estimated-virtuallist-list-item"
          v-for="i in renderList"
          :key="i.index"
          :id="String(i.index)"
        >
          <slot name="item" :item="i"></slot>
        </div>
      </div>
      <!-- <div class="loading-box" v-if="props.isLoading">
        <van-loading />
      </div> -->
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'
const props = defineProps({
  dataSource: Array, // 源数据
  estimatedHeight: Number, // 每一项的预设高度
  isLoading: {
    type: Boolean,
    defaule: false,
  },
})

const emit = defineEmits(['getMoreData'])

// defineSlots<{
//   item(props: { item: T }): any;
// }>();

const contentRef = ref()

const listRef = ref()
// 源数据的每一项的相关信息
const positions = ref([])

const state = reactive({
  viewHeight: 0,
  listHeight: 0,
  startIndex: 0,
  maxCount: 0,
  preLen: 0,
})

const endIndex = computed(() =>
  Math.min(props.dataSource.length, state.startIndex + state.maxCount)
)

const renderList = computed(() =>
  props.dataSource.slice(state.startIndex, endIndex.value)
)

const offsetDis = computed(() =>
  state.startIndex > 0 ? positions.value[state.startIndex - 1].bottom : 0
)

const scrollStyle = computed(() => ({
  height: `${state.listHeight - offsetDis.value}px`,
  transform: `translate3d(0, ${offsetDis.value}px, 0)`,
}))

// 初始化每一项的位置信息
const initPosition = () => {
  const pos = []
  const disLen = props.dataSource.length - state.preLen
  const currentLen = positions.value.length
  const preBottom = positions.value[currentLen - 1]
    ? positions.value[currentLen - 1].bottom
    : 0
  for (let i = 0; i < disLen; i++) {
    const item = props.dataSource[state.preLen + i]
    pos.push({
      index: item.index,
      height: props.estimatedHeight,
      // top: i * props.estimatedHeight,
      // bottom: (i + 1) * props.estimatedHeight,
      top: preBottom
        ? preBottom + i * props.estimatedHeight
        : item.index * props.estimatedHeight,
      bottom: preBottom
        ? preBottom + (i + 1) * props.estimatedHeight
        : (item.index + 1) * props.estimatedHeight,
      dHeight: 0,
    })
  }
  positions.value = [...positions.value, ...pos]
  // 记录下上次存的数据数量
  state.preLen = props.dataSource.length
}

// 数据 item 渲染完成后，更新数据item的真实高度 -更新时机包括追加新的数据源、滚动过程视图区域数据的变化
const setPosition = () => {
  const nodes = listRef.value.children
  if (!nodes || !nodes.length) return console.log('获取children失败')
  Array.from(nodes).forEach((node) => {
    // 每一项的元素大小信息
    const rect = node.getBoundingClientRect()
    // positions里面存的是源数据的每一项的信息，nodes仅是视图区域的数据的每一项的信息
    const item = positions.value[+node.id]
    // 预设高度和真实高度的差
    const dHeight = item.height - rect.height
    if (dHeight) {
      item.height = rect.height
      item.bottom = item.bottom - dHeight
      item.dHeight = dHeight
    }
  })

  // id存的其实是下标
  const startId = +nodes[0].id
  const len = positions.value.length
  // 在列表中，其中有一项的高度有偏差，后面的子项的信息都会做出相对应的修改，而且不一定只有第一个元素有偏差，所以在后续的循环过程中，需要累加这个startHeight(如果有偏差的话)
  let startHeight = positions.value[startId].dHeight
  positions.value[startId].dHeight = 0
  // 从第二项开始，因为第一项前面已经处理了
  for (let i = startId + 1; i < len; i++) {
    const item = positions.value[i]
    item.top = positions.value[i - 1].bottom
    item.bottom = item.bottom - startHeight
    if (item.dHeight !== 0) {
      startHeight += item.dHeight
      item.dHeight = 0
    }
  }

  state.listHeight = positions.value[len - 1].bottom
}

const init = () => {
  state.viewHeight = contentRef.value ? contentRef.value.offsetHeight : 0
  state.maxCount = Math.ceil(state.viewHeight / props.estimatedHeight) + 1 // 预设高度一定要比真实DOM渲染的时候的最小高度小一点，因为maxCount是固定的
  contentRef.value && contentRef.value.addEventListener('scroll', handleScroll)
}

const destory = () => {
  contentRef.value &&
    contentRef.value.removeEventListener('scroll', handleScroll)
}

// 处理滚动事件
const handleScroll = () => {
  const { scrollTop, clientHeight, scrollHeight } = contentRef.value
  state.startIndex = binarySearch(positions.value, scrollTop)
  const bottom = scrollHeight - clientHeight - scrollTop
  if (bottom <= 20) {
    !props.isLoading && emit('getMoreData')
  }
}

// 二分查找startIndex
const binarySearch = (list, value) => {
  let left = 0,
    right = list.length - 1,
    templateIndex = -1
  while (left < right) {
    const midIndex = Math.floor((left + right) / 2)
    const midValue = list[midIndex].bottom
    if (midValue === value) return midIndex + 1
    else if (midValue < value) left = midIndex + 1
    else if (midValue > value) {
      if (templateIndex === -1 || templateIndex > midIndex)
        templateIndex = midIndex
      right = midIndex
    }
  }
  return templateIndex
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  destory()
})

watch(
  () => props.dataSource.length,
  () => {
    initPosition()
    nextTick(() => {
      setPosition()
    })
  }
)

watch(
  () => state.startIndex,
  () => {
    setPosition()
  }
)
</script>

<style scoped lang="scss">
.fs-estimated-virtuallist {
  &-container {
    width: 100%;
    height: 100%;
  }
  &-content {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  &-list-item {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
