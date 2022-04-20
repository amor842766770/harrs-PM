// 权限拦截在路由跳转 导航守卫
import router from '@/router' //引用路由实例
import store from '@/store' //引入store实例，和组件中的this.$store是一回事
import NProgress from 'nprogress' // 引入一份进度条插件
import 'nprogress/nprogress.css' // 引入进度条样式

const whiteList = ['/login', '/404']//定义白名单 不受权限控制

//前置守卫
// next是前置守卫必须执行的钩子 next必须执行 如果不执行 页面就死了
// next()放过 next(false)跳转中止 next(地址)跳转到某个地址
router.beforeEach(async (to, from, next) => {
    NProgress.start() // 开启进度条
    if (store.getters.token) {
        // 如果有token
        if (to.path === '/login') {
            // 如果要访问的是登录页
            next('/')//跳到主页
        } else {
            if (!store.getters.userId) {
                // 如果没有id这个值 才会调用 vuex的获取资料的action
                await store.dispatch('user/getUserInfo')
                // 为什么要写await 因为我们想获取完资料再去放行
            }
            next()
        }
    } else {
        if (whiteList.indexOf(to.path) > -1) {
            next()
        } else {
            next('/login')
        }
    }
    NProgress.done() // 手动强制关闭一次  为了解决 手动切换地址时  进度条的不关闭的问题
})
// 后置守卫
router.afterEach(function () {
    NProgress.done() // 关闭进度条
})