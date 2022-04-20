import request from '@/utils/request'

/**
*登录接口封装
*/
export function login(data) {
  // 返回一个promise对象
  return request({
    method: 'Post',
    url: '/sys/login',
    data
  })
}
/**
*获取用户资料接口
*/
export function getUserInfo() {
  // 返回一个promise对象
  return request({
    url: '/sys/profile',
    method: 'post'
  })
}
/** *
 *
 * 获取用户的基本信息  现在写它 完全是为了显示头像
 * **/
export function getUserDetailById(id) {
  return request({
    url: `/sys/user/${id}`
  })
}
