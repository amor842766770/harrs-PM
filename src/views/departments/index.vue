<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 组织架构内容 - 头部 -->
      <el-card class="tree-card">
        <!-- 放置结构内容 -->
        <tree-tools :tree-node="company" :is-root="true" />
        <!-- 防止tree组件 -->
        <!--放置一个属性   这里的props和我们之前学习的父传子 的props没关系-->
        <el-tree
          :data="departs"
          :props="defaultProps"
          :default-expand-all="true"
        >
          <!-- 传入内容 插槽内容 会循环多次 有多少节点 就循环多少次 -->
          <!-- 作用域插槽 slot-scope="obj" 接收传递给插槽的数据   data 每个节点的数据对象-->
          <tree-tools
            slot-scope="{ data }"
            :tree-node="data"
            @delDepts="getDepartment"
            @addDepts="addDepts"
          />
        </el-tree>
      </el-card>
    </div>
    <add-dept :show-dialog="showDialog" />
  </div>
</template>

<script>
import TreeTools from './components/tree-tools';
import AddDept from './components/add-dept.vue';
import { getDepartments } from '@/api/departments'
import { tranListToTreeData } from '@/utils'
export default {
  data() {
    return {
      company: {},
      departs: [],
      defaultProps: {
        label: 'name' // 表示 从这个属性显示内容
      },
      showDialog: false, // 显示窗体
      node: null//记录当前点击的节点
    }
  },
  components: {
    TreeTools,
    AddDept
  },
  created() {

    this.getDepartment()//调用自身方法

  },
  methods: {
    async getDepartment() {
      const res = await getDepartments()
      console.log(res);
      this.company = { name: res.companyName, manager: '负责人' }
      this.departs = tranListToTreeData(res.depts, "") //需要将其转化成树形结构
    },
    // 监听tree-tools中触发的点击添加子部门的事件
    // node是我们点击的部门
    addDepts(node) {
      this.showDialog = true // 显示弹层
      // 因为node是当前的点击的部门， 此时这个部门应该记录下来,
      this.node = node
    }
  }
}
</script>

<style scoped>
.tree-card {
  padding: 20px 140px;
  font-size: 14px;
}
</style>
