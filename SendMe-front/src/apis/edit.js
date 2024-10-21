import http from '@/utils/http'
/**
 * 富文本上传图片
 */
export const postImgAPI = (data) => {
  return http.post('/edit/img', data)
}

/**
 * 新增小记
 */
export const postNewNoteAPI = (data) => {
  return http.post('/edit/create', data)
}

/**
 * 获取小记列表
 */
export const getEditsAPI = (page = 1, pageSize = 10) => {
  return http.get(`/edit/list?page=${page}&pageSize=${pageSize}`)
}

/**
 * 删除小记
 */
export const delEditAPI = (id) => {
  return http.delete(`/edit/delete/${id}`)
}
