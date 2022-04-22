<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
          <!-- 左侧的内容 -->
          <el-tab-pane label="角色管理">
            <el-row style="height: 60px">
              <el-button type="primary" icon="el-icon-plus" size="small" @click="showDialog=true">
                新增角色
              </el-button>
            </el-row>
            <!-- 表格 -->
            <el-table border="" :data="list">
              <el-table-column label="序号" width="120" prop="id"></el-table-column>
              <el-table-column label="名称" width="240" prop="name"></el-table-column>
              <el-table-column label="描述" prop="description"></el-table-column>
              <el-table-column label="操作">
                 <template slot-scope="{ row }">
                  <el-button size="small" type="success">分配权限</el-button>
                  <el-button size="small" type="primary" @click="editRole(row.id)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteRole(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            </el-row>

            <!-- 放置分页组件 -->
            <el-row type="flex" justify="center" align="middle" style="height:60px"> 
              <el-pagination 
              layout="prev,pager,next" 
              :total="page.total" 
              :page-size="page.pagesize" 
              :current-page="page.page"
              @current-change="changePage"></el-pagination>
              
            </el-row>
          </el-tab-pane>
          <!-- 右侧的内容 -->
          <el-tab-pane label="公司信息">
            <el-alert title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改" type="info" show-icon :closable="false"></el-alert>
            <el-form label-width="120px" style="margin-top:50px" ref="roleForm">
              <el-form-item label="企业名称">
                <el-input  style="width:400px" disabled v-model="formData.name"></el-input>
              </el-form-item>
               <el-form-item label="公司地址">
                <el-input style="width:400px" disabled v-model="formData.companyAddress" ></el-input>
              </el-form-item>
               <el-form-item label="电话">
                <el-input style="width:400px" disabled v-model="formData.companyPhone"></el-input>
              </el-form-item>
               <el-form-item label="邮箱">
                <el-input  style="width:400px" disabled  v-model="formData.mailbox"></el-input>
              </el-form-item>
               <el-form-item label="备注" v-model="formData.remarks">
                <el-input type="textarea" :row="3" style="width:400px" disabled></el-input>
              </el-form-item>
              
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <!-- 放置一个弹层组件 -->
    <el-dialog
      title="编辑部门"
      :visible="showDialog"
      >
      <el-form label-width="120px" :model="roleForm" :rules="rules" ref="roleForm" @close="btnCancel ">
        <el-form-item label="角色名称" prop="name">
          <el-input placeholder=""  v-model="roleForm.name"></el-input>
        </el-form-item> 
        <el-form-item label="角色描述">
          <el-input placeholder=""  v-model="roleForm.description"></el-input>
        </el-form-item>
      </el-form>
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="8">
        <el-button @click="btnCancel">取 消</el-button>
        <el-button type="primary" @click="btnOk">确 定</el-button>
        </el-col>
        
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getRoleList, getCompanyInfo, deleteRole, updateRole, getRoleDetail, addRole } from '@/api/setting'
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      list: [],
      // 承接数组
      page: {
        // 放置页码及相关数据
        page: 1,
        pagesize: 10,
        total: 0 // 记录总数
      },
      formData: {},
      showDialog: false,//控制弹层显示
      roleForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '角色名称选项不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['companyId'])
  },
  created() {
    this.getRoleList() // 获取角色列表
    this.getCompanyInfo()
  },
  methods: {
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.companyId)
    },
    async getRoleList() {
      const { total, rows } = await getRoleList(this.page)
      this.page.total = total
      this.list = rows
    },
    changePage(newPage) {
      //newPage是当前点击的页码
      this.page.page = newPage//将当前页码赋值给当前的最新页码
      this.getRoleList()
    },
    async deleteRole(id) {
      //  提示
      try {
        await this.$confirm('确认删除该角色吗')
        // 只有点击了确定 才能进入到下方
        await deleteRole(id) // 调用删除接口
        this.getRoleList() // 重新加载数据
        this.$message.success('删除角色成功')
      } catch (error) {
        console.log(error)
      }
    },
    async editRole(id) {
      this.roleForm = await getRoleDetail(id)//实现数据回写
      this.showDialog = true//显示弹层
    },
    btnCancel() {
      this.roleForm = {
        name: '',
        description: ''
      }
      this.$refs.roleForm.resetFields()
      this.showDialog = false
    },
    async btnOk() {
      try {
        await this.$refs.roleForm.validate()
        // 只有校验通过的情况下 才会执行await的下方内容
        if (this.roleForm.id) {
          await updateRole(this.roleForm)
        } else {
          // 新增业务
          addRole(this.roleForm)
          this.formData = {}
        }
        // 重新拉取数据
        this.getRoleList()
        this.$message.success('操作成功!')
        this.showDialog = false//关闭弹层 => 触发 el-dialong的事件close事件
      } catch (error) {
        alert('校验失败')
      }

    },
  }
}
</script>

<style>
</style>
