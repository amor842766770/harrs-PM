
<template>
  <!-- 防止弹层组件 -->
  <el-dialog
    :title="formData.id ? '编辑部门' : '新增部门'"
    :visible="showDialog"
    @close="btnCancel"
  >
    <el-form
      ref="deptForm"
      label-width="120px"
      :model="formData"
      :rules="rules"
    >
      <el-form-item label="部门名称" prop="name">
        <el-input
          v-model="formData.name"
          style="width: 80%"
          placeholder="1-50个字符"
        />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input
          v-model="formData.code"
          style="width: 80%"
          placeholder="1-50个字符"
        />
      </el-form-item>
      <el-form-item label="负责人" prop="manager">
        <!-- native修饰符 可以找到原生元素的事件 -->
        <el-select
          v-model="formData.manager"
          style="width: 80%"
          placeholder="请选择"
          @focus="getEmployeeSimple"
        >
          <!-- 需要循环生成选项   这里做一下简单的处理 显示的是用户名 存的也是用户名-->
          <el-option
            v-for="item in peoples"
            :key="item.id"
            :label="item.username"
            :value="item.username"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input
          v-model="formData.introduce"
          style="width: 80%"
          placeholder="1-300个字符"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
    </el-form>

    <!-- el-dialog有专门放置底部操作栏的 插槽  具名插槽 -->
    <el-row slot="footer" type="flex" justify="center">
      <el-col :span="6">
        <el-button size="small" @click="btnCancel">取 消</el-button>
        <el-button type="primary" size="small" @click="btnOk">
          确 定
        </el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import { addDepartments, getDepartments, getDepartDetail, updateDepartments } from '@/api/departments'
import { getEmployeeSimple } from '@/api/employees'
export default {
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    treeNode: {
      type: Object,
      default: null
    }
  },
  data() {
    // 检查部门是否重复
    const checkNameReapt = async (rule, value, callback) => {
      // value 是部门名称  要去和同级部门下的部门去比较 有没有相同的 有相同的 不能过  / 不相同就可以过
      const { depts } = await getDepartments()
      let isReapet = false
      if (this.formData.id) {
        // 有id就是编辑模式
        // 编辑的数据 在数据库里有 同级部门下 我的名字不能和其他名字重复
        isReapet = depts.filter(item => item.pid === this.formData.pid && item.id !== this.formData.id).some(item => item.name === value)
      } else {
        // 去找同级部门下有没有和value相同的数据
        //   找所有子部门
        isReapet = depts.filter(item => item.pid === this.treeNode.id).some(item => item.name === value)
      }
      // 如果isReapet为true 表示找到了一样的名字
      isReapet ? callback(new Error(`同级部门下已经存在${value}`)) : callback()
    }
    const checkCodeReapt = async (rule, value, callback) => {
      const { depts } = await getDepartments()
      let isReapet = false
      if (this.formData.id) {
        isReapet = depts.filter(item => item.id !== this.formData.id).some(item => item.code === value && value)
      } else {
        // 要求和所有部门的编码都不重复   由于历史数据有可能 没有code 所以说这里加一个=强制条件 value不为空
        isReapet = depts.some(item => item.code === value && value)
      }

      isReapet ? callback(new Error(`编码${value}已经被使用过了`)) : callback()
    }
    return {
      // 定义表单数据
      formData: {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '' // 部门介绍
      },
      // 定义校验规则 {key:数组[]}
      rules: {
        name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' },
        { min: 1, max: 50, message: '部门名称要求1-50个字符', trigger: 'blur' }, {
          trigger: 'blur',
          validator: checkNameReapt
        }],
        code: [{ required: true, message: '部门编码不能为空', trigger: 'blur' },
        { min: 1, max: 50, message: '部门编码要求1-50个字符', trigger: 'blur' }, {
          trigger: 'blur',
          validator: checkCodeReapt
        }],
        manager: [{ required: true, message: '部门负责人不能为空', trigger: 'blur' }],
        introduce: [{ required: true, message: '部门介绍不能为空', trigger: 'blur' },
        { trigger: 'blur', min: 1, max: 300, message: '部门介绍要求1-50个字符' }]
      },
      peoples: [] // 接收获取的员工简单列表的数据

    }
  },
  methods: {
    // 获取员工简单列表数据
    async getEmployeeSimple() {
      this.peoples = await getEmployeeSimple()
    },
    // 获取部门详情
    async getDepartDetail(id) {
      this.formData = await getDepartDetail(id)
    },
    btnOk() {
      // 手动校验表单
      this.$refs.deptForm.validate(async isOk => {
        if (isOk) {
          // 表示可以提交了
          if (this.formData.id) {
            // 编辑模式
            await updateDepartments(this.formData)
          } else {
            // 新增模式
            await addDepartments({ ...this.formData, pid: this.treeNode.id })
          }
          // 通知父组件
          this.$emit('addDepts')
          // 此时应该修改showDialog值
          // update:props名称
          this.$emit('update:showDialog', false)
        }
      })
    },
    btnCancel() {
      // 重置数据  因为resetFields 只能重置 表单上的数据 非表单上的 比如 编辑中id 不能重置
      this.formData = {
        name: '',
        code: '',
        manager: '',
        introduce: ''
      }
      // 关闭弹层
      this.$emit('update:showDialog', false)
      // 清除之前校验
      this.$refs.deptForm.resetFields()
    }
  }
}
</script>
