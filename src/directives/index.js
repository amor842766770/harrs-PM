// 负责管理所有的自定义指令
export const imagerror = {
    // 指令对象 会在当前的dom元素插入到节点之后执行
    inserted(dom, options) {
        // options 是指令中变量的解释 其中有一个属性叫做 value
        // dom表示当前指令作用的dom对象
        // dom认为此时就是图片
        dom.src = dom.src || options.value
        // 当图片有地址 但是地址没有加载成功的时候 会报错 会触发图片的一个时间 => onerror
        dom.onerror = function () {
            // 当图片出现异常的时候 会将指令配置的默认图片设置为该图片的内容
            // dom可以注册error事件
            dom.src = options.value
        }
    },
    // 该函数同insterted一样是个钩子函数
    componentUpdated(dom, options) {
        // 该钩子函数会在房前指令作用的组件 更新数据完毕之后 执行
        // insterted 只会执行一次
        // 组件初始化 一旦更新就会再进入 insterted 函数 会进去componentUpdated
        dom.src = dom.src || options.value
    }
}