<template>
  <div class="comp-pagination-table">
    <el-table
      :data="tableData"
      :border="border"
      :header-row-class-name="headerRowClassName"
      v-loading="loading"
      :fit="fit"
      @sort-change="handleSortChange"
    >
      <slot></slot>
    </el-table>
    <el-pagination
      v-if="needPage"
      :layout="layout"
      :page-sizes="pageSizes"
      :page-size="pageInfo.size"
      :total="total"
      :current-page="pageInfo.current"
      @size-change="handlePageSizeChange"
      @current-change="handlePageChange"
      @prev-click="handlePageChange"
      @next-click="handlePageChange"
    ></el-pagination>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ISortable } from '@/interface/ISortable'
import { IPage } from '@/interface/IPage'

@Component({})
export default class PaginationTable extends Vue {
  @Prop({
    type: Array,
    default () {
      return []
    }
  }) data!: any //  表格数据

  @Prop({
    type: Boolean,
    default () {
      return true
    }
  }) needPage!: boolean

  @Prop({
    type: String,
    default () {
      return ''
    }
  }) url!: string //  请求地址

  @Prop({
    type: String,
    default () {
      return 'post'
    }
  }) method!: string //  请求方法

  @Prop({
    type: Object,
    default () {
      return {}
    }
  }) axiosOptions!: any //  请求附加信息

  @Prop({
    type: Object,
    default () {
      return {}
    }
  }) bindForm: any //  绑定表单

  @Prop({
    type: Boolean,
    default () {
      return false
    }
  }) border!: any //  是否有表格

  @Prop({
    type: Boolean,
    default () {
      return true
    }
  }) autoLoad!: boolean //  是否自动请求

  @Prop({
    type: String,
    default () {
      return 'total, sizes, prev, pager, next, jumper'
    }
  }) layout!: string

  @Prop({
    type: Array,
    default () {
      return [5, 10, 20, 30, 40, 50, 100]
    }
  }) pageSizes!: any

  @Prop({
    type: Boolean,
    default () {
      return true
    }
  }) fit!: boolean

  @Prop({
    type: [String, Function],
    default () {
      return ''
    }
  }) headerRowClassName!: string | Function

  tableData: any = [] //  表格数据
  loading = true // 等待动画
  searchForm: any = {} //  查询条件
  total = 0 // 总数
  sortable: ISortable = {
    asc: '',
    by: ''
  } //  排序

  height = 0

  pageInfo: IPage = {
    current: 1,
    size: 10
  } //  分页信息

  created () {
    if (this.autoLoad) {
      this.getTableData()
    }
    this.$nextTick(() => {
      const that = this
      this.height = this.getTableHeight()
      window.onresize = function () {
        that.height = that.getTableHeight()
      }
    })
  }

  destroyed () {
    window.onresize = null
  }

  /**
   * 获取表格数据
   */
  async getTableData () {
    if (this.data && this.data.length > 0) {
      //  如果父组件传递给子组件表格数据，则直接复制
      this.tableData = this.data
      this.loading = false
    } else {
      if (this.url && this.url.length !== 0) {
        let data = Object.assign({}, this.bindForm)
        if (this.needPage) {
          data = Object.assign(data, {
            page_no: this.pageInfo.current,
            page_size: this.pageInfo.size
          })
        }
        if (this.sortable.asc !== '') {
          data = Object.assign(data, this.sortable)
        }
        try {
          const res = await this.$services[this.url](Object.assign({
            data,
            method: this.method
          }, this.axiosOptions))
          if (res && res.error_no === '0') {
            if (this.needPage) {
              this.tableData = res.datas
              this.total = res.total || res.datas.length
            } else {
              this.tableData = res.data
            }
          }
        } catch (e) {
          console.log(`${this.url}接口异常：`, e)
        } finally {
          this.loading = false
        }
      }
    }
  }

  /**
   * 页码修改
   * @param current
   */
  handlePageChange (current = this.pageInfo.current) {
    this.pageInfo.current = current
    this.getTableData()
  }

  /**
   * 每页展示行数修改
   * @param size
   */
  handlePageSizeChange (size) {
    this.pageInfo.size = size
    this.getTableData()
  }

  /**
   * 排序修改
   * @param order
   * @param prop
   */
  handleSortChange ({ order, prop }) {
    if (order === null) {
      this.sortable.asc = ''
      this.sortable.by = ''
    } else {
      this.sortable.asc = order === 'ascending'
      this.sortable.by = prop
    }
    this.getTableData()
  }

  /**
   * 点击查询按钮
   */
  handleClickSearch () {
    this.searchForm = { ...this.bindForm }
    this.pageInfo = {
      current: 1,
      size: this.pageInfo.size
    }
    this.getTableData()
  }

  getTableHeight () {
    let searchDomHeight = 0
    const searchDom: HTMLDivElement | null = document.querySelector('.search-form-container')
    if (searchDom) {
      searchDomHeight = searchDom.clientHeight
    }
    let paginationHeight = 46
    if (!this.needPage) {
      paginationHeight = -20
    }
    //  窗口高度 - 状态条高度 - tab页高度 - 上下padding - 分页高度 - 查询栏高度 - table的margin - 查询栏margin-bottom
    return window.innerHeight - 50 - 40 - 40 - paginationHeight - searchDomHeight - 20 - 20
  }
}
</script>

<style lang="less" rel="stylesheet/less" scoped>
@import './style.less';
</style>
