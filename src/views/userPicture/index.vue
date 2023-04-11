<template>
  <div class="user-picture-container">
    <div class="search-form-container">
      <el-form ref="form" :model="formSearch" label-width="120px">
        <el-row>
          <el-col :span="6">
            <el-form-item label="姓名：" prop="label_zh_name">
              <el-input v-model="formSearch.client_name" placeholder="请输入姓名" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="资金账号：" prop="label_en_name">
              <el-input v-model="formSearch.fund_account" placeholder="请输入资金账号" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="手机号：" prop="label_en_name">
              <el-input v-model="formSearch.mobile_tel" placeholder="请输入手机号" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6" align="right">
            <el-button class="search-button" @click="handleSearch">查询</el-button>
            <el-button class="reset-button" @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="table-container">
      <pagination-table
        ref="dataTable"
        border
        url="getUserPortraitList"
        :bindForm="formSearch"
        headerRowClassName="header-align-center"
      >
        <el-table-column prop="client_name" label="姓名" align="center"></el-table-column>
        <el-table-column prop="fund_account" label="资金账号" align="center"></el-table-column>
        <el-table-column prop="mobile_tel" label="电话号码" align="center"></el-table-column>
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template v-slot="scope">
            <div class="table-operation-button-container">
              <el-button size="mini" class="btn-table-detail" @click="handleDetail(scope.row)">查看个体画像</el-button>
            </div>
          </template>
        </el-table-column>
      </pagination-table>
    </div>
  </div>
</template>

<script>
import PaginationTable from '@components/PaginationTable/index.vue'

export default {
  name: 'UserPicture',
  data () {
    return {
      formSearch: {
        client_name: '',
        fund_account: '',
        mobile_tel: ''
      },
    }
  },
  methods: {
    handleReset() {
      this.formSearch = {
        client_name: '',
        fund_account: '',
        mobile_tel: ''
      }
    },
    handleSearch() {
      this.$refs.dataTable.handleClickSearch(1)
    },
    handleDetail({ fund_account }) {
      this.$router.push({
        path: '/pictureDetail',
        query: {
          fundAccount: fund_account
        }
      })
    }
  },
  components: {
    PaginationTable
  }
}
</script>

<style scoped lang="less">
@import "style";
</style>
