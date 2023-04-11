<template>
  <div class="substation-list-container" v-loading.fullscreen.lock="loadingFlag"
       element-loading-background="rgba(0, 0, 0, 0.3)"
       element-loading-text="正在处理，请稍后">
    <div class="search-form-container">
      <el-form ref="form" :model="formSearch" label-width="100px">
        <el-row>
          <el-col :span="6">
            <el-form-item label="用户昵称：" prop="nickname">
              <el-input v-model="formSearch.nickname" placeholder="请输入用户昵称" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="用户姓名：" prop="name">
              <el-input v-model="formSearch.name" placeholder="请输入用户姓名" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="用户电话：" prop="name">
              <el-input v-model="formSearch.mobile" placeholder="请输入用户电话" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="回收次数：" prop="name">
              <el-input v-model="formSearch.totalCount" placeholder="请输入回收次数" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="用户状态：" prop="lockedFlag">
              <el-select placeholder="请选择用户状态" clearable v-model="formSearch.lockedFlag">
                <el-option :value="0" label="正常"></el-option>
                <el-option :value="1" label="冻结"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
<!--          <el-col :span="6">-->
<!--            <el-form-item label="所属店铺：" prop="storeId">-->
<!--              <el-select placeholder="请选择所属店铺" clearable v-model="formSearch.storeId">-->
<!--                <el-option v-for="item in storeList" :key="item.id" :value="item.id" :label="item.name">{{ item.name }}</el-option>-->
<!--              </el-select>-->
<!--            </el-form-item>-->
<!--          </el-col>-->
          <el-col :span="18" align="right">
            <el-button class="search-button" @click="search">查询</el-button>
            <el-button class="sync-button" @click="handleExport" v-auth="'clientUser:export'">导出</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="data-table-container">
      <pagination-table
          ref="dataTable"
          url="getClientUserByPage"
          :bindForm="formSearch"
          headerRowClassName="header-align-center"
      >
        <el-table-column prop="avatarUrl" label="用户头像" min-width="76">
          <template slot-scope="scope">
            <div style="text-align: center">
              <img :src="scope.row.avatarUrl" width="46" height="46"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="用户信息" min-width="160">
          <template slot-scope="scope">
            <div><span class="table-label">用户昵称：</span>{{scope.row.nickname | filterNull}}</div>
            <div><span class="table-label">用户姓名：</span>{{scope.row.name | filterNull}}</div>
            <div><span class="table-label">用户电话：</span>{{scope.row.mobile | filterNull}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="账户信息" width="250px">
          <template slot-scope="scope">
            <div style="text-indent: 14px"><span class="table-label">用户ID：</span>{{ scope.row.id }}</div>
            <div><span class="table-label">回收金额：</span>{{scope.row.totalAmount | filterMoney}}</div>
            <div><span class="table-label">回收次数：</span>{{scope.row.totalCount | filterNull}}</div>
<!--            <div style="text-indent: 14px"><span class="table-label">环保币：</span>{{scope.row.coin | filterNull}}</div>-->
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册信息" width="230px">
          <template slot-scope="scope">
            <div class="prev-login-ip"><span class="table-label">注册IP：</span>{{scope.row.createIp | filterNull}}
            </div>
            <div class="prev-login-time"><span class="table-label">注册时间：</span>{{scope.row.createTime | filterNull}}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="上次登录情况" width="230px">
          <template slot-scope="scope">
            <div class="prev-login-ip"><span class="table-label">登录IP：</span>{{scope.row.lastLoginIp | filterNull}}
            </div>
            <div class="prev-login-time"><span class="table-label">登录时间：</span>{{scope.row.lastLoginTime | filterNull}}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template slot-scope="scope">{{scope.row.lockedFlag | filterStatus}}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template slot-scope="scope">
            <div class="table-operation-button-container">
              <el-button size="mini" class="edit-table-button" @click="addUser('edit', scope.row)" v-auth="'clientUser:update'">编辑</el-button>
            </div>
          </template>
        </el-table-column>
      </pagination-table>
    </div>
    <msg-box
        ref="dialog"
        :visible.sync="visible"
        :state="state"
        :submitForm="submitData"
        @successSubmit="reloadTable">
    </msg-box>
  </div>
</template>

<script>
import { Row, Col, Form, FormItem, Input, Button, TableColumn } from 'element-ui'
import PaginationTable from '@components/PaginationTable/index.vue'
import MsgBox from './msgBox'
import { deepClone } from '@/utils/commonUtils'
import url from '../../../services/RESTFULURL'
import qs from 'qs'

export default {
  name: 'UserManage',
  data () {
    return {
      visible: false,
      balanceVisible: false, //  修改余额弹窗
      state: 'add',
      formSearch: {
        nickname: '',
        mobile: '',
        // storeId: '',
        lockedFlag: '',
        name: '',
        totalCount: ''
      },
      submitData: {},
      storeList: [],
      loadingFlag: false,
      inviteDialogVisible: false,
      inviteRow: {}
    }
  },
  methods: {
    search () {
      this.$refs.dataTable.handleClickSearch(1)
    },
    reloadTable () {
      this.$refs.dataTable.handlePageChange()
    },
    addUser (state, submitData) {
      this.state = state
      this.submitData = deepClone(submitData)
      this.visible = true
    },
    handleUpdateBalance (submitData) {
      this.submitData = deepClone(submitData)
      this.balanceVisible = true
    },
    handleExport () {
      location.href = window.LOCAL_CONFIG.API_HOME + url.exportClientUser + '?' + qs.stringify(this.formSearch)
    }
  },
  filters: {
    filterStatus (val) {
      return val === 0 ? '正常' : '冻结'
    }
  },
  components: {
    elRow: Row,
    elCol: Col,
    elForm: Form,
    elFormItem: FormItem,
    ElButton: Button,
    ElTableColumn: TableColumn,
    ElInput: Input,
    PaginationTable,
    MsgBox
  }
}
</script>

<style scoped lang="less">
@import "./style";
</style>
