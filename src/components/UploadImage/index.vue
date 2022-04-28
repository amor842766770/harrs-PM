<template>
  <div>
    <el-upload
      list-type="picture-card"
      :limit="1"
      action="#"
      :on-preview="preview"
      :on-change="changeFile"
      :on-remove="handleFile"
      :before-upload="beforeUpload"
      :http-request="upload"
      :file-list="fileList"
      :class="{ disabled: fileComputed }"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    <el-progress
      v-if="showPercent"
      style="width: 180px"
      :percentage="percent"
    />
    <el-dialog title="图片" :visible.sync="showDialog">
      <img :src="imgUrl" style="width: 100%" alt="" />
    </el-dialog>
  </div>
</template>

<script>
//引用腾讯云cos包
import COS from 'cos-js-sdk-v5';
const cos = new COS({
  SecretId: 'AKIDe7LK5cuxlNlunRs53mk4DAuXw756wXt2',
  SecretKey: '1pPmvriPsVvBE3g6IG2bw3wd8PSKzQee'
})
export default {
  data() {
    return {
      fileList: [], // 图片地址设置为数组 
      showDialog: false, // 控制显示弹层
      imgUrl: '',
      currentFileUid: null,//记录当前正在上传的uid
      percent: 0,//当前的百分比
      showPercent: false
    }
  },
  computed: {
    fileComputed() {
      return this.fileList.length === 1
    }
  }
  ,
  methods: {
    //   点击预览事件
    preview(file) {
      // 这里应该弹出一个层 层里是点击的图片地址
      this.imgUrl = file.url
      this.showDialog = true
    },
    handleFile(file) {
      this.fileList = this.fileList.filter(item => { item.uid !== file.uid })
    },
    changeFile(file, fileList) {
      this.fileList = fileList.map(item => item)
      //   这里不成功 是因为现在还没有上传 没有第二次进来的数据  一定是个空的
      //   如果上传动作完成 第一次进入 和 第二次进入 fl的长度 应该都是1  都有数据
      //   上传成功 => 数据才能进来 => 才能上传腾讯云cos
    },
    beforeUpload(file) {
      // 检查文件类型
      const types = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png']
      if (!types.includes(file.type)) {
        this.$message.error('上传图片只能是 JPG、GIF、BMP、PNG 格式!')
        return false
      }
      // 检查文件大小  
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        this.$message.error('上传图片大小不能超过5M')
        return false
      }
      this.currentFileUid = file.uid
      this.showPercent = true//打开进度条
      return true
    },
    // 进行上传操作
    upload(params) {
      if (params.file) {
        cos.putObject({
          Bucket: 'riick123-1306373975', /* 填入您自己的存储桶，必须字段 */
          Region: 'ap-chengdu',  /* 存储桶所在地域，例如ap-beijing，必须字段 */
          Key: params.file.name,  /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */
          StorageClass: 'STANDARD',//上传的模式  标准模式
          onProgress: (params) => {
            this.percent = params.percent * 100
          },
          Body: params.file, // 上传文件对象
        }, (err, data) => {
          //   console.log(err || data);
          if (!err && data.statusCode === 200) {
            //  文件上传成功 需获取成功的返回地址
            //  需知当前上传成功的是哪一张照片
            this.fileList = this.fileList.map(item => {
              // 找谁的uid等于刚刚记录下来的id
              if (item.uid === this.currentFileUid) {
                //   将成功的地址赋值给原来的url属性
                return { url: 'http://' + data.Location, upload: true }
                // upload 为 true 表示这张图片已经上传完毕 该属性为后期应用做标记
                // 保存 => 图片有大小 => 上传有快慢 => 根据有没有upload标记决定是否保存
              }
              return item
            })
          }
          setTimeout(() => {
            this.showPercent = false
            this.percent = 0
          }, 800);
        });
      }
    }
  }
}
</script>

<style>
.disabled .el-upload--picture-card {
  display: none;
}
</style>
