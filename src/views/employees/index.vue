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
            <el-button type="danger" size="small" @click="exportData">
              excel导出
            </el-button>
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
        <el-table-column label="头像" width="120px" align="center">
          <!-- 插槽 -->
          <template slot-scope="{ row }">
            <!-- <template v-model="{ row }">-->
            <img
              @click="showQrcode(row.staffPhoto)"
              :src="row.staffPhoto"
              style="
                border-radius: 50%;
                width: 100px;
                height: 100px;
                padding: 10px;
              "
              v-imagerror="require('@/assets/common/bigUserHeader.png')"
              alt=""
            />
          </template>
        </el-table-column>
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
            <el-button
              type="text"
              size="small"
              @click="$router.push(`/employees/detail/${row.id}`)"
              >查看</el-button
            >
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
    <el-dialog title="二维码" :visible.sync="showCodeDialog">
      <el-row type="flex" justify="center">
        <canvas ref="myCnavas"></canvas>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees' // 引入员工的枚举对象
import AddEmployee from './components/add-employee'
import { formatDate } from '@/filters'
import QrCode from 'qrcode'

export default {
  components: {
    AddEmployee
  },
  data() {
    return {
      loading: false,
      list: [], // 接数据的
      showDialog: false, // 弹层默认关闭
      showCodeDialog: false,//显示二维码弹层
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
    },
    // 导出员工excel表
    exportData() {
      // 表头对应关系
      const headers = {
        '姓名': 'username',
        '手机号': 'mobile',
        '入职日期': 'timeOfEntry',
        '聘用形式': 'formOfEmployment',
        '转正日期': 'correctionTime',
        '工号': 'workNumber',
        '部门': 'departmentName'
      }
      // 懒加载
      // 导出操作  header从哪来 data 从哪来
      // 没有接口没有获取所有数据
      // 获取员工的接口 页码 每页条数
      import('@/vendor/Export2Excel').then(async excel => {
        const { rows } = await getEmployeeList({ page: 1, size: this.page.total })
        const data = this.formatJson(headers, rows)//返回的data就是要导出的结构
        excel.export_json_to_excel({
          header: Object.keys(headers),
          data,
          filename: '员工资料表'
        })
      })
      //   import('@/vendor/Export2Excel').then(excel => {
      //     excel.export_json_to_excel({
      //       header: ['name', 'salary'],//表头 必填
      //       data: [['victory', 3000]],//具体数据 必填
      //       filename: '员工工资表', //非必填
      //     })
      //   })
      // }
      //[{username:'张三'}] =>[['username','张三']]
      // 要转化 数据结构 还要和表头的顺序对应上
      // 要求转出的标题是中文
    },
    // 将表头数据和数据进行对应
    formatJson(headers, rows) {
      return rows.map(item => {
        // item是一个对象 {mobile：123，username:'zs'}
        // ['手机号'，'姓名'，'入职时间'，'部门'...]
        return Object.keys(headers).map(key => {
          // 需要判断字段
          if (headers[key] === 'timeOfEntry' || headers[key] === 'correctionTime') {
            // 格式化日期
            return formatDate(item[headers[key]])
          } else if (headers[key] === 'formOfEmployment') {
            // 格式化聘用形式
            const obj = EmployeeEnum.hireType.find(obj => obj.id === item[headers[key]])
            return obj ? obj.value : '未知'
          }
          return item[headers[key]]
        })

      })
    },
    // 头像图片二维码弹出
    showQrcode(url) {
      // url存在的情况下 弹出
      if (url) {
        this.showCodeDialog = true //数据更新  页面弹层不会立即出现 页面渲染是异步的
        // this.$nextTick 可以在上一次数据更新完毕 页面渲染完毕之后 执行
        this.$nextTick(() => {
          // 此时可以确认有ref对象
          QrCode.toCanvas(this.$refs.myCnavas, url)
        }) //将地址转化成二维码
      } else {
        this.$message.warning('图片地址不存在')
      }
    }
  }
}
</script>

<style>
</style>
