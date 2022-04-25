<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <!-- <span slot="before">共16条记录</span> -->
        <template v-slot:before>
          <span slot="before">共{{ page.total }}条记录</span>
        </template>
        <template v-slot:after>
          <span slot="before">
            <el-button
              type="success"
              size="small"
              @click="$router.push('/import')"
              >excel导入</el-button
            >
            <el-button type="danger" size="small">excel导出</el-button>
            <el-button type="primary" size="small" @click="showDialog = true">
              新增员工
            </el-button>
          </span>
        </template>
      </page-tools>
      <!-- 表格组件 -->
      <el-table v-loading="loading" border="" :data="list">
        <!-- 表格中如何显示序号 -->
        <el-table-column type="index" label="序号" sortable="" />
        <el-table-column label="姓名" sortable="" prop="username" />
        <el-table-column label="工号" sortable="" prop="workNumber" />
        <el-table-column
          label="聘用形式"
          sortable=""
          :formatter="formatEmployment"
          prop="formOfEmployment"
        />
        <el-table-column label="部门" sortable="" prop="departmentName" />
        <!-- 作用域插槽+过滤器 -->
        <el-table-column label="入职时间" sortable="" align="center">
          <!-- 作用域插槽 -->
          <template slot-scope="{ row }">
            {{ row.timeOfEntry | formatDate }}
          </template>
        </el-table-column>

        <el-table-column label="账户状态" sortable="" prop="enableState">
          <template slot-scope="{ row }">
            <!-- 根据当前状态来确定 是否打开开关 -->
            <el-switch :value="row.enableState === 1" />
          </template>
        </el-table-column>
        <el-table-column label="操作" sortable="" fixed="right" width="280">
          <template slot-scope="{ row }">
            <el-button type="text" size="small">查看</el-button>
            <el-button type="text" size="small">转正</el-button>
            <el-button type="text" size="small">调岗</el-button>
            <el-button type="text" size="small">离职</el-button>
            <el-button type="text" size="small">角色</el-button>
            <el-button type="text" size="small" @click="deleteEmployee(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 放置分页组件 -->
      <el-row type="flex" justify="center" align="middle" style="height: 50px">
        <el-pagination
          layout="prev, pager, next"
          :page-size="page.size"
          :current-page="page.page"
          :total="page.total"
          @current-change="changePage"
        />
      </el-row>
    </div>
    <!-- 放置组件弹层 -->
    <!-- sync修饰符 子组件改变父组件数据的语法糖-->
    <add-employee :show-dialog.sync="showDialog" />
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees' // 引入员工的枚举对象
import AddEmployee from './components/add-employee'
export default {
  components: {
    AddEmployee
  },
  data() {
    return {
      loading: false,
      list: [], // 接数据的
      showDialog: false, // 弹层默认关闭
      page: {
        page: 1, // 当前页码
        size: 10,
        total: 0 // 总数
      }
    }
  },
  created() {
    this.getEmployeeList()
  },
  methods: {
    // newpage是最新页码
    changePage(newPage) {
      this.page.page = newPage// 赋值最新页码
      this.getEmployeeList()
    },
    async getEmployeeList() {
      this.loading = true
      const { total, rows } = await getEmployeeList(this.page)
      this.page.total = total
      this.list = rows
      this.loading = false
    },
    // 格式化聘用形式
    formatEmployment(row, column, cellValue, index) {
      // 要去找 1所对应的值
      const obj = EmployeeEnum.hireType.find(item => item.id === cellValue)
      return obj ? obj.value : '未知'
    },
    // 删除员工
    async deleteEmployee(id) {
      try {
        await this.$confirm('您确定删除该员工吗')
        await delEmployee(id)
        this.getEmployeeList()
        this.$message.success('删除员工成功')
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>

<style>
</style>
