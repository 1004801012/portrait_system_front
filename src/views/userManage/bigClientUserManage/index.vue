<template>
  <div class="substation-list-container" v-loading.fullscreen.lock="loadingFlag"
       element-loading-background="rgba(0, 0, 0, 0.3)"
       element-loading-text="正在处理，请稍后">
    <div class="search-form-container">
      <el-form ref="form" :model="formSearch" label-width="100px">
        <el-row>
         <el-col :span="6">
            <el-form-item label="客户名称：" prop="clientName">
              <el-input v-model="formSearch.clientName" placeholder="请输入客户名称" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="联系人：" prop="contact">
              <el-input v-model="formSearch.contact" placeholder="请输入联系人" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="联系方式：" prop="contactWay">
              <el-input v-model="formSearch.contactWay" placeholder="请输入联系方式" clearable></el-input>
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
          <el-col :span="24" align="right">
            <el-button class="search-button" @click="search">查询</el-button>
            <el-button class="new-button" @click="addUser('add', { lockedFlag: 0})" v-auth="'bigClientUser:create'">新增</el-button>
            <el-button class="sync-button" @click="handleExport" v-auth="'bigClientUser:export'">导出</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="data-table-container">
      <pagination-table
          ref="dataTable"
          url="getBigClientUserByPage"
          :bindForm="formSearch"
          headerRowClassName="header-align-center"
      >
        <el-table-column prop="clientName" label="客户信息" min-width="160">
          <template v-slot='scope'>
            <div><span class="table-label">客户名称：</span>{{scope.row.clientName}}</div>
            <div style="text-indent: 14px"><span class="table-label">联系人：</span>{{scope.row.contact}}</div>
            <div><span class="table-label">联系方式：</span>{{scope.row.contactWay}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="账户信息" width="250px">
          <template slot-scope="scope">
            <div style="text-indent: 14px"><span class="table-label">客户ID：</span>{{ scope.row.id }}</div>
            <div><span class="table-label">回收金额：</span>{{scope.row.totalAmount | filterMoney}}</div>
            <div><span class="table-label">回收次数：</span>{{scope.row.totalCount | filterNull}}</div>
<!--            <div style="text-indent: 14px"><span class="table-label">环保币：</span>{{scope.row.coin | filterNull}}</div>-->
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="激活信息" width="250px">
          <template v-slot="scope">
            <div><span class="table-label">是否激活：</span>{{ scope.row.activateFlag | filterFlag }}</div>
            <template v-if="+scope.row.activateFlag === 1">
              <div><span class="table-label">激活用户：</span>{{ scope.row.activateName }}</div>
              <div><span class="table-label">激活时间：</span>{{ scope.row.activateTime }}</div>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="绑定信息" width="250px">
          <template v-slot="scope">
            <div><span class="table-label">是否绑定：</span>{{ scope.row.bindId | filterBindFlag }}</div>
            <template v-if="!scope.row.bindId === '' && !scope.row.bindId === null">
              <div><span class="table-label">绑定用户：</span>{{ scope.row.nickName }}</div>
              <div><span class="table-label">绑定时间：</span>{{ scope.row.bindTime }}</div>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template slot-scope="scope">{{scope.row.lockedFlag | filterStatus}}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template slot-scope="scope">
            <div class="table-operation-button-container">
              <el-button size="mini" class="edit-table-button" @click="addUser('edit', scope.row)" v-auth="'bigClientUser:update'">编辑</el-button>
              <el-button size="mini" class="change-table-button" @click="handleQrcode(scope.row)" v-auth="'bigClientUser:qrcode'">获取二维码</el-button>
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

    <qrcode-msg-box
      width="700px"
      :append-to-body="true"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :visible.sync="qrcodeVisible"
      :clientId="curClientId"
    />
  </div>
</template>

<script>
import { Row, Col, Form, FormItem, Input, Button, TableColumn, MessageBox } from 'element-ui'
import PaginationTable from '@components/PaginationTable/index.vue'
import MsgBox from './msgBox'
import QrcodeMsgBox from './qrcodeMsgBox.vue'
import { deepClone } from '@/utils/commonUtils'
import url from '../../../services/RESTFULURL'
import qs from 'qs'

export default {
  name: 'UserManage',
  data () {
    return {
      visible: false,
      balanceVisible: false, //  修改余额弹窗
      qrcodeVisible: false,
      state: 'add',
      formSearch: {
        clientName: '',
        contactWay: '',
        contact: '',
        // storeId: '',
        lockedFlag: ''
      },
      submitData: {},
      storeList: [],
      loadingFlag: false,
      inviteDialogVisible: false,
      inviteRow: {},
      curClientId: ''
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
    removeUser ({ userId }) {
      MessageBox.confirm('你确定要删除该用户嘛?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(action => {
        if (action === 'confirm') {
          this.handlerRemove(userId)
        }
      })
    },
    async handlerRemove (id) {
      try {
        const res = await this.$services.deleteUser({
          data: {
            id
          },
          method: 'delete'
        })
        if (res && res.code === '200') {
          MessageBox.alert('删除成功', '提示', {
            type: 'success',
            confirmButtonText: '确定',
            callback: () => {
              this.search()
            }
          })
        } else {
          MessageBox.alert(res.msg, '提示', {
            type: 'error',
            confirmButtonText: '确定'
          })
        }
      } catch (e) {
        MessageBox.alert('请求超时', '提示', {
          type: 'error',
          confirmButtonText: '确定'
        })
      }
    },
    handleShowInvite (data) {
      this.inviteRow = data
      this.inviteDialogVisible = true
    },
    handleQrcode ({ id: clientId }) {
      this.curClientId = clientId
      this.qrcodeVisible = true
    },
    handleExport () {
      location.href = window.LOCAL_CONFIG.API_HOME + url.exportBigClientUser + '?' + qs.stringify(this.formSearch)
    }
  },
  filters: {
    filterStatus (val) {
      return val === 0 ? '正常' : '冻结'
    },
    filterFlag (val) {
      return val === 0 ? '否' : '是'
    },
    filterBindFlag (val) {
      return val === null || val === '' ? '否' : '是'
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
    MsgBox,
    QrcodeMsgBox
  }
}
</script>

<style scoped lang="less">
@import "./style";
</style>
