<!--兼顾已保存客户列表及客群列表-->
<template>
  <div class="customer-group-result zt2">
    <template v-if="isBuilding">
      <div class="group-result-no-data" v-loading="buildLoading">
        <span class="ad"></span>
        <p>客群数据生成中，请稍等<i class="el-icon-loading"></i></p>
        <router-link v-if="resultType === 'customerGroupPreview'" to="groupList">返回客群列表</router-link>
      </div>
    </template>
    <template v-else>
      <header>
      <span class="title">已为您找到满足条件的<em>{{ usersTotalCount }}</em>名客户
        {{ usersTotalCount > 10000 ? '，列表展示前10000名客户' : '' }}
      </span>
      </header>
      <div class="tab-content">
        <div class="tab-pane" v-show="activeIndex === '1'">
          <el-table
            empty-text="暂无数据"
            :data="listTableData"
            border
            size="medium"
            style="width: 100%">
            <el-table-column
              v-for="(column, index) in columns"
              :label="column.label"
              :fixed="index === 0 ? 'left' : false"
              :key="index"
            >
              <template slot-scope="scope">
               <span v-if="column.prop === 'operator'">
                 <span v-if="scope.row.potrait_status && scope.row.potrait_status+'' === '0'">找不到该用户</span>
                 <router-link
                   v-else
                   :to="`/pictureDetail?fundAccount=${ scope.row.fund_account}&client_name=${scope.row.client_name}`"
                   v-show="scope.row.fund_account"
                 >
                 查看个体画像
                 </router-link>
               </span>
                <span v-else>
                  {{ scope.row[column.prop] }}
                </span>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <el-pagination
            small
            background
            layout="prev, pager, next"
            prev-text="上一页"
            next-text="下一页"
            :page-size="pageSize"
            :total="usersTotalCount>10000?10000:usersTotalCount"
            :current-page="pageNo"
            @current-change="currentChange"></el-pagination>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { callback } from '@/common/func'
import {NoData} from '@/components'
import CustomerGroupGraphs from '../CustomerGroupGraphs'
import VClickOutside from 'v-click-outside'
import {
  getToken,
  setGroupDisplayModules
} from '@/common/auth'

export default {
  name: 'CustomerGroupResult',
  props: {
    // groupId
    id: [String, Number],
    snapshotId: [String, Number],
    groupType: [String, Number],
    groupImportType: [String, Number],
    groupName: String,
    groupData: Object,
    resultType: {
      type: String,
      // 默认是客群列表 customerGroup
      // 已保存客群列表 customerGroupSaved
      // 预览结果页 customerGroupPreview
      default: 'customerGroup'
    },
    columns: {
      type: Array,
      default: []
    }
  },
  data () {
    const modules = [
      {
        id: '1',
        label: '性别占比',
        value: 'client_sex'
      },
      {
        id: '2',
        label: '年龄分布',
        value: 'age_group'
      },
      {
        id: '3',
        label: '开户时长',
        value: 'open_length_level'
      },
      {
        id: '4',
        label: '风险等级',
        value: 'corp_risk_level'
      },
      {
        id: '12',
        label: '累计交易额',
        value: 'stock_trade_balance'
      }
    ]
    return {
      modules,
      // checkModules: modules.map((v) => v.value),
      allModules: [],
      displayView: [],
      displayModules: [],
      selectModules: [], // 传参到子组件，避免子组件重新调用此接口
      popperVisible: false,
      saveAble: false,
      listTableData: [],
      pageNo: 1,
      pageSize: 10,
      usersTotalCount: 0,
      totalCount: 0,
      activeIndex: '1',
      dialogVisible: false,
      timer: null,
      isBuilding: false,
      buildLoading: false,
      exportLoading: false,
      tableColumns: [],
      customViewList: []
    }
  },
  watch: {
    id: {
      handler (val) {
        if (val) {
          window.clearInterval(this.timer)
          this.timer = null
          this.activeIndex = '1' // 默认展示列表
          const id = (typeof val === 'string') ? val : val + ''
          const index = id.indexOf('_')
          this.id = index !== -1 ? id.substring(0, index) : val
          this.init()
        }
      },
      immediate: true
    },
    groupData: {
      handler (val) {
        if (val && val.groupImportType && +val.groupImportType === 1) {
          this.customDisplayViewQry()
        }
      },
      immediate: true
    },
    snapshotId: {
      handler (val) {
        if (val) {
          console.log('watch snapshotId', val)
          window.clearInterval(this.timer)
          this.timer = null
          const id = (typeof val === 'string') ? val : val + ''
          const index = id.indexOf('_')
          this.snapshotId = index !== -1 ? id.substring(0, index) : val
          this.init()
        }
      },
      immediate: true
    },
    displayModules: {
      handler (val) {
        this.saveAble = this.checkCustomDisplayView()
      }
    }
  },
  components: {
    NoData,
    CustomerGroupGraphs
  },
  directives: {
    clickOutside: VClickOutside.directive
  },
  mounted () {
  },
  methods: {
    init () {
      this.resetQryCondition()
      this.getGroupUsers()
    },
    onClickOutside (event) {
      this.popperVisible = false
    },
    switchPane (index) {
      this.activeIndex = index
    },
    /**
     * 查询用户自定义展示视图列表
     */
    async customDisplayViewQry () {
      this.displayModules = []
      this.displayView = []
      const data = {
        groupId: this.id
      }
      try {
        const res = await this.$services.customDisplayViewQry({data})
        res && callback(res, () => {
          if (res.datas && res.datas.length) {
            this.selectModules = res.datas
            setGroupDisplayModules(this.selectModules)
            res.datas.forEach(item => {
              this.displayModules.push({
                id: item.viewId,
                label: item.viewName
              })
              this.displayView.push(item.viewName)
            })
          } else {
            this.selectModules = []
            this.showModules = []
            this.displayView = []
            setGroupDisplayModules(this.selectModules)
          }
          this.customViewQry()
        })
      } catch (err) {
        this.selectModules = []
        this.showModules = []
        this.displayView = []
        setGroupDisplayModules(this.selectModules)
        console.log('err', err)
      }
    },
    /**
     * 查询自定义视图列表
     */
    async customViewQry () {
      // 添加系统视图
      let allList = this.modules.map(i => i)
      const data = {
        groupId: this.id
      }
      try {
        const res = await this.$services.customViewQry({data})
        res && callback(res, () => {
          if (res.datas && res.datas.length) {
            this.customViewList = res.datas
            res.datas.forEach(item => {
              allList.push({
                id: item.viewId,
                label: item.viewName,
                value: item.viewTagName
              })
            })
          }
          // 去重
          this.filteAllModules(allList)
        }, () => {
          this.filteAllModules(allList)
        })
      } catch (err) {
        console.log('err', err)
      }
    },
    /**
     * 去重：用户展示部分不在模块池中展示
     */
    filteAllModules (allList) {
      const showLabelList = this.displayModules.map(i => i.label)
      this.allModules = allList.filter((item) => {
        return showLabelList.indexOf(item.label) === -1
      })
      console.log(1111, this.allModules)
    },
    /**
     * 删除展示模块项
     */
    delViewItem (item) {
      const modulesList = this.displayModules.map(item => {
        return item.label
      })
      const index = modulesList.indexOf(item.label)
      if (index >= 0) {
        this.displayModules.splice(index, 1)
        this.allModules.push(item)
      }
    },
    /**
     * 添加展示模块项
     */
    addViewItem (item) {
      const showLabelList = this.displayModules.map(item => {
        return item.label
      })
      const index = showLabelList.indexOf(item.label)
      if (index < 0) {
        this.displayModules.push(item)
        let allList = this.allModules.map(item => item.label)
        let i = allList.indexOf(item.label)
        this.allModules.splice(i, 1)
      }
    },
    /**
     * 系统视图将viewId转化为特定value（用于保存时传参）
     */
    formatViewIdToValue (viewId) {
      let value = ''
      switch (viewId) {
        case '1':
          value = 'a'
          break
        case '2':
          value = 'b'
          break
        case '3':
          value = 'c'
          break
        case '4':
          value = 'd'
          break
        case '5':
          value = 'e'
          break
        case '6':
          value = 'f'
          break
        case '7':
          value = 'g'
          break
        case '11':
          value = 'h'
          break
        case '12':
          value = 'i'
          break
        default:
          value = viewId
      }
      return value
    },
    /**
     * 校验用户自定义展示视图是否变更
     */
    checkCustomDisplayView () {
      let newDisPlayView = this.displayModules.map(item => item.label)
      return this.displayView.join(';') !== newDisPlayView.join(';')
    },
    async getGroupUsers (groupId, state) {
      let res = null
      let {id, pageNo, pageSize, snapshotId} = this
      groupId && (id = groupId)
      const data = {
        group_id: id,
        page_no: pageNo,
        page_size: pageSize
      }
      try {
        if (this.resultType === 'customerGroup' || this.resultType === 'customerGroupPreview') {
          res = await this.$services.getGroupUserList({data})
        } else {
          data.group_id = ''
          data.snapshot_id = snapshotId
          res = await this.$services.getGroupUserList({data})
        }
        res &&
        callback(
          res,
          () => {
            this.listTableData = []
            this.listTableData = res.datas
            this.usersTotalCount = res.total_count
            this.isBuilding = false
            this.buildLoading = false
            window.clearInterval(this.timer)
            if (state === 'complete') {
              this.$refs.groupGraphs && this.$refs.groupGraphs.loadGroupGraphs()
            }
          },
          () => {
            if (res.error_no === '10005') {
              this.isBuilding = true
              this.buildLoading = false
              if (!this.timer) {
                // 开启轮询
                this.openAutoQuery()
              }
            } else { // 其他错误
              window.clearInterval(this.timer)
              this.buildLoading = false
              this.isBuilding = false
              if ((snapshotId && snapshotId !== window.CT.CUSTOMER_GROUP_ID) || id !== window.CT.CUSTOMER_GROUP_ID) {
                this.$message({message: res.error_info, showClose: true})
              }
            }
            this.resetQryCondition()
          }
        )
      } catch (err) {
        console.log(err)
        this.resetQryCondition()
      }
    },
    openAutoQuery () {
      this.timer = window.setInterval(() => {
        this.buildLoading = true
        this.getGroupUsers(this.id, 'complete')
      }, 5000)
    },
    currentChange (val) {
      this.pageNo = val
      this.getGroupUsers()
    },
    resetQryCondition () {
      this.displayModules = []
      this.allModules = []
      this.listTableData = []
      this.pageNo = 1
      this.usersTotalCount = 0
    }
  },
  beforeDestroy () {
    clearInterval(this.timer)
  }
}
</script>
<style lang="less" rel="stylesheet/less" scoped>
@import "style";
</style>
