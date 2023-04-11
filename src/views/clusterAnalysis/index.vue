<template>
<div class="cluster-analysis-container">
 <div class="head">
   <div>
     <div>
      <el-dropdown>
        <div class="dropdown-title">
          {{ selectedGroup && selectedGroup.group_name || '请选择客群'}}<i class="el-icon-arrow-down el-icon--right"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="item in groupList"
            :key="item.group_id"
            @click.native="selectedGroup = item"
          >{{ item.group_name }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
     </div>
     <div v-if="!selectedGroup">请先选择客群，选择客群后可添加标签执行聚类分析，或进行一键分析</div>
     <div v-else class="demo1">
       <span v-show="!selectTags.length">请添加标签或选择一键分析执行聚类分析</span>
       <el-tag
         :key="item.label_en_name"
         v-for="(item, index) in selectTags"
         type="info"
         disable-transitions
         closable
         @close="delTagList(index)"
       >{{ item.label_zh_name }}</el-tag>
       <el-button type="text" @click="tagSelectDialogVisible = true">添加标签</el-button>
     </div>
   </div>
   <div v-if="selectedGroup">
     <el-button type="primary" size="mini" @click="handleClusterAnalysis">执行聚类</el-button>
   </div>
 </div>

  <div class="cluster-content" v-if="cloudList.length">
    <div class="cluster-main">
      <div class="content-left">
        <p class="title">聚类结果</p>
        <div class="menu-left">
          <ul v-if="cloudList.length > 0">
            <li class="common" :class="{showtype: i == resultIndex}" v-for="(item, i) in cloudList"
                @click="showResultIndex(i)">{{ chooseTitle + '_' + '聚类' + i }}&nbsp;&nbsp;<span
              v-if="item.count >= 0">({{ item.count }}人)</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="content-right">
        <!--说明-->
        <div class="main-state">
          特征分布（95%置信水平）<span v-for="item in cloudList[resultIndex].feature_list">{{ item.name }}</span>
        </div>
        <el-button type="primary" @click="addTypeFunc()">添加为客群</el-button>
        <!--词云内容展示-->
        <div class="word-cloud">
          <div class="chart" id="wordChart"></div>
        </div>
      </div>
    </div>
  </div>

  <TagSelectDialog
    :visible.sync="tagSelectDialogVisible"
    width="800px"
    :currentSelectTagList="selectTags"
    @handleChangeTags="handleChangeTags"
  />


  <!--添加为客群弹框-->
  <el-dialog title="系统提示" :visible.sync="dialogTypeAdd" class="type-add" width="510px">
    <div>
      <el-input v-model.trim="typeName" placeholder="请输入客群名称"></el-input>
    </div>
    <div class="result-confirm" slot="footer">
      <el-button type="primary"
                 round
                 size="medium"
                 @click="delTypeConfirm">取 消
      </el-button>
      <el-button type="primary"
                 round
                 size="medium"
                 @click="addTypeConfirm">确定
      </el-button>
    </div>
  </el-dialog>
</div>
</template>

<script>
import TagSelectDialog from '../../components/tagSelectDialog'
import echarts from 'echarts/lib/echarts'
import 'echarts-wordcloud'
import {option} from './chartOption'
export default {
  name: 'index',
  data() {
    return {
      groupList: [],
      selectTags: [],
      tagSelectDialogVisible: false,
      selectedGroup: null,
      cloudList: [],
      resultIndex: 0, // 聚类结果默认展示左列表第一项
      chooseTitle: '选择客户群开始聚类分析',

      dialogTypeAdd: false,
      typeName: ''
    }
  },
  mounted () {
    this.getGroupList()
  },
  methods: {
    async getGroupList() {
      try {
        const res = await this.$services.getGroupList()

        if (res && res.error_no === '0') {
          this.groupList = res.datas
        }
      } catch (e) {
        console.log(e)
      }
    },

    async handleClusterAnalysis () {
      //  TODO
      let tagsArr = this.selectTags.map(item => item.label_en_name)
      try {
        const res = await this.$services.postCluster({
          data: {
            group_id: this.selectedGroup.group_id,
            label_en_name_str: tagsArr.join(',')
          }
        })
        if (res && res.error_no === '0') {
          this.cloudList = res.datas
          this.resultIndex = 0
          this.$nextTick(() => {
            this.cloudFunc(0)
          })

        }
      } catch (e) {
        console.log(e)
      }
    },

    handleChangeTags(tagList) {
      console.log(tagList)
      this.selectTags = tagList
    },

    showResultIndex (i) {
      this.resultIndex = i
      this.$nextTick(() => {
        this.cloudFunc(i)
      })
    },

    cloudFunc (i) {
      this.chart = echarts.init(document.getElementById('wordChart'))
      this.chart.clear()
      var JosnList = []
      if (this.cloudList.length > 0) {
        JosnList = this.cloudList[i].feature_list
      }
      const tempArr = JosnList.map(item => {
        return {
          name: item.name,
          title: item.name,
          value: +item.key_number,
          count: +item.key_number
        }
      })
      option.series[0].data = tempArr
      this.chart.setOption(option)
      this.loading = false
    },

    addTypeFunc () {
      setTimeout(() => {
        if (this.cloudList.length > 0) {
          this.typeName = ''
          this.dialogTypeAdd = true
        } else {
          this.$message({message: '暂无聚类结果无法添加为客群', showClose: true})
        }
      }, 500)
    },

    delTypeConfirm () {
      this.dialogTypeAdd = false
      this.typeName = ''
    },

    addTypeConfirm () {
      if (this.typeName === '') {
        this.$message({message: '客群名称不能为空', showClose: true})
        return
      }
      this.dialogTypeAdd = false
      // 保存为客群typeName
      if (this.cloudList.length > 0) {
        let arr = this.cloudList[this.resultIndex]
        let showArr = [] // con的条件选项
        showArr.push(...this.selectedGroupCondition)
        if (arr.length > 0) {
          arr.forEach(function (item) {
            // status 0 字典项的标识
            if (item.status === 0) {
              let obj = {
                'op': 1, // and
                'fd': item.en_name || '', // 英文名
                'cmp': 4, // cmp包括0：大于,1：大于等于,2：小于,3：小于等于,4：等于,5:不等于;目前只取大于和小于
                'val': item.key_number || '', // key_number值
                'desc': item.desc, // name
                'c_has_operator': '0'
              }
              showArr.push(obj)
            } else {
              let a = item.key_number
              let b = a.split(',')
              // update start by liwb 2021-1-27 17:48:44
              // 考虑"等于"的情况
              let obj3 = {}
              if (item.name.indexOf('=') !== -1 && item.name.indexOf('<') === -1) {
                obj3 = {
                  'op': 1, // and
                  'fd': item.en_name || '', // 英文名
                  'cmp': 4, // cmp包括0：大于,1：大于等于,2：小于,3：小于等于,4：等于,5:不等于;目前只取大于和小于
                  'val': b[0] || '', // key_number值
                  'desc': (item.desc + ' = ' + b[0]) || '', // name
                  'c_has_operator': '1'
                }

                showArr.push(obj3)
              } else {
                // update start by liwb 2021-1-19 11:00:37
                // > <
                // 左右两边添加空格，条件解析的时候需要
                // update end by liwb 2021-1-19 11:00:37
                let obj1 = {
                  'op': 1, // and
                  'fd': item.en_name || '', // 英文名
                  'cmp': 1, // cmp包括0：大于,1：大于等于,2：小于,3：小于等于,4：等于,5:不等于;目前只取大于和小于
                  'val': b[0], // key_number值
                  'desc': (item.desc + ' >= ' + b[0]) || '', // name
                  'c_has_operator': '1'
                }
                showArr.push(obj1)
                let obj2 = {
                  'op': 1, // and
                  'fd': item.en_name || '', // 英文名
                  'cmp': 3, // cmp包括0：大于,1：大于等于,2：小于,3：小于等于,4：等于,5:不等于;目前只取大于和小于
                  'val': b[1], // key_number值
                  'desc': (item.desc + ' <= ' + b[1]) || '', // name
                  'c_has_operator': '1'
                }
                showArr.push(obj2)
              }
              // update end by liwb 2021-1-27 17:48:40
            }
          })
        }
        // 保存客群json入参
        // ------start
        // 修改 showObj 结构 by liwb 2021年1月6日09:39:46
        // 因为聚类分析的结构渲染到客群里有问题
        // ------end
        let showObj = {
          'ver': '2.0',
          'con': showArr
        }
        this.saveGroupFunc(showObj)
      }
    },
    delTagList(i) {
      this.selectTags.splice(i, 1)
    }
  },
  components: {
    TagSelectDialog
  }
}
</script>

<style scoped lang="less">
@import "style.less";
</style>
