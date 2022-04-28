/* eslint-disable indent */
// 负责所有全局自定义组件的注册
// 该文件负责所有的公共的组件的全局注册   Vue.use
import PageTools from './PageTools'
import UploadExcel from './UploadExcel'
import UploadImage from './UploadImage'
import Print from 'vue-print-nb'

export default {
    install(Vue) {
        //  注册全局的通用栏组件对象
        Vue.component('PageTools', PageTools)
        Vue.component('UploadExcel', UploadExcel)
        Vue.component('UploadImage', UploadImage)
        Vue.use(Print)//注册打印组件
    }
}
