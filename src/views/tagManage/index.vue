<template>
  <div class="tags-manage-container">
    <div class="button-container">
      <div class="btn" @click="handleChooseCategory(1)" :class="{'btn__active': formSearch.label_category === 1}">用户信息</div>
      <div class="btn" @click="handleChooseCategory(2)" :class="{'btn__active': formSearch.label_category === 2}">用户行为</div>
      <div class="btn" @click="handleChooseCategory(3)" :class="{'btn__active': formSearch.label_category === 3}">账户信息</div>
    </div>
    <div class="search-form-container">
      <el-form ref="form" :model="formSearch" label-width="120px">
        <el-row>
          <el-col :span="6">
            <el-form-item label="标签名称：" prop="label_zh_name">
              <el-input v-model="formSearch.label_zh_name" placeholder="请输入标签名称" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="标签英文名：" prop="label_en_name">
              <el-input v-model="formSearch.label_en_name" placeholder="请输入标签英文名" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" align="right">
            <el-button class="search-button" @click="handleSearch">查询</el-button>
            <el-button class="reset-button" @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="table-container">
      <el-table border :data="tableData">
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="label_zh_name" label="标签名称" align="center"></el-table-column>
        <el-table-column prop="label_en_name" label="标签英文名" align="center"></el-table-column>
        <el-table-column prop="label_definition" label="标签定义" align="center"></el-table-column>
        <el-table-column prop="label_definition" label="标签定义" align="center"></el-table-column>
        <el-table-column prop="label_category" label="标签类别" align="center">
          <template v-slot="scope">
            <span>{{ tagTypeEnum(scope.row.label_category) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template slot-scope="scope">
            <div class="table-operation-button-container">
              <el-button size="mini" class="btn-table-detail" @click="handleShowDetail(scope.row)">详情</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <detail-msg-box
      width="700px"
      :append-to-body="true"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :visible.sync="editDialogVisible"
      :currentId.sync="currentId"
      @submitSuccess="handleSearch"
    />
  </div>
</template>

<script>

import { tagTypeEnum } from '../../enum/enum'
import DetailMsgBox from './comp/detailMsgBox'

export default {
  name: 'TagManage',
  data () {
    return {
      editDialogVisible: false,
      currentId: '',
      formSearch: {
        label_en_name: '',
        label_zh_name: '',
        label_category: 1
      },
      tableData: []
    }
  },
  mounted () {
    this.getTableData()
  },
  methods: {
    tagTypeEnum,
    handleSearch () {
      this.getTableData()
    },
    handleChooseCategory(category) {
      this.formSearch.label_category = category
      this.getTableData()
    },
    async getTableData () {
      const data = {
        ...this.formSearch
      }
      try {
        const res = await this.$services.getTagList({
          data,
        })
        if (res?.error_no === '0') {
          this.tableData = res.datas
        }
      } catch (e) {
        console.log(e)
        this.$message.error(e)
      }
    },
    handleShowDetail (row) {
      this.currentId = row.label_id
      this.editDialogVisible = true
    },
    handleReset () {
      this.formSearch.label_en_name = ''
      this.formSearch.label_zh_name = ''
    }
  },
  components: {
    DetailMsgBox
  }
}
</script>

<style scoped lang="less">
@import './style';
</style>
