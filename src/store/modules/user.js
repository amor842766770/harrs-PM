import { getToken, setToken, removeToken, setTimeStamp } from '@/utils/auth'
import { login, getUserInfo, getUserDetailById } from '@/api/user'
//状态
const state = {
  token: getToken(),//设置token为共享状态 初始化vuex的时候 就先从缓存中读取
  userInfo: {} //定义一个空对象
}
//修改状态
const mutations = {
  setToken(state, token) {
    state.token = token//将数据设置给vuex
    //同步给缓存
    setToken(token)
  },
  removeToken(state) {
    state.token = null//将vuex的数据置空
    removeToken()
  },
  setUserInfo(state, result) {
    // 更新一个对象
    state.userInfo = result//这样是响应式
    console.log(state.userInfo);
  },
  // 删除用户信息
  reomveUserInfo(state) {
    state.userInfo = {}
  },
}
// 执行异步
const actions = {
  async login(context, data) {
    // 调用api接口
    const result = await login(data) //拿到token
    context.commit('setToken', result)//设置token
    // 写入时间戳
    setTimeStamp() // 将当前的最新时间写入缓存
  },
  // 获取用户资料action
  async getUserInfo(context) {
    const result = await getUserInfo()//获取返回值
    //获取用户详情 用户的详情数据
    const baseInfo = await getUserDetailById(result.userId)
    context.commit('setUserInfo', { ...result, ...baseInfo })//提交到mutations
    return result //后期做权限时留下的伏笔
  },
  // 登出的action
  logout(context) {
    // 删除token
    context.commit('removeToken') // 不仅仅删除了vuex中的 还删除了缓存中的
    // 删除用户资料
    context.commit('removeUserInfo') // 删除用户信息
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}

