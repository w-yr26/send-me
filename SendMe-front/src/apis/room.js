import http from '@/utils/http'

/**
 *
 * @returns 房间列表
 */
export const getRoomAPI = (page, pageSize) => {
  return http.get(`/room/get?page=${page}&pageSize=${pageSize}`)
}

/**
 * 创建房间
 */
export const postAddRoomAPI = (data) => {
  return http.post('/room/add', data)
}

/**
 * 删除房间
 */
export const delRoomAPI = (id) => {
  return http.delete(`/room/del/${id}`)
}

/**
 * 文件上传前的校验(用于秒传、断点续传)
 */
export const postVerifyAPI = (data) => {
  return http.post('/chat/verify', data)
}

/**
 * 文件上传
 */
export const postFileAPI = (data, onUploadProgress) => {
  return http.post('/chat/upload', data, {
    onUploadProgress,
  })
}

/**
 * 文件合并
 */
export const postMergeAPI = (data) => {
  return http.post('/chat/merge', data)
}

/**
 * 文件流下载
 */
export const getDownloadAPI = (fileName, controller, onDownloadProgress) => {
  return http.get(`/chat/download?fileName=${fileName}`, {
    responseType: 'blob',
    signal: controller.signal,
    onDownloadProgress,
  })
}
