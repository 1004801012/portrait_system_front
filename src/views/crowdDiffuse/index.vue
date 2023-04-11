<!--生命周期管理-->
<template>
  <div class="page-crowd-diffuse">
    <div class="page-content">
      <div class="group-analysis-wrapper">
        <!-- 扩散条件 -->
        <div class="group-upload-wrapper">
          <!-- 条件选择扩散 -->
          <div class="group-upload-header" v-show="uploadType === 0">
            <h2>人群扩散设置</h2>
          </div>
          <div class="setting-group">
            <div class="setting-item">
              <span>选择客群</span>
              <el-select class="setting-value" size="small" v-model="groupValue" no-data-text="无数据" placeholder="请选择客群">
                <el-option
                  v-for="item in groups"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </div>
          <!-- 扩散按钮 -->
          <div class="feature-submit-btn" @click="fetchCrowdDiffusion">特征识别</div>
        </div>

        <!-- 结论词云 -->
        <div class="accuracy" v-show="showWordCloudChart">准确率：{{ accuracy }}</div>
        <div class="group-wordcloud-wrapper" v-show="showWordCloudChart">
          <div class="wordcloud-chart-box" ref="wordcloudChart"></div>
          <div class="analysis-progress" v-show="featureRecognition">
            <Loading size="huge" theme="dark"/>
          </div>
        </div>
      </div>

      <!-- 人群扩散列表 -->
      <div class="group-list-wrapper" v-if="showCrowdDiffuseBar">
        <div class="group-condition-wrapper">
          <div class="condition-list">
            <div class="condition-list-content">
              <!-- <div class="condition-item">
                <span>客户群：</span>
                <el-input class="group-name" value="待扩散客群" size="mini" disabled readonly></el-input>
              </div> -->
              <div class="condition-list-group-container">
                <div class="condition-list-group">
                  <div class="condition-item">
                    <span class="condition-label">符合度：</span>
                    <el-select v-model="conformity" placeholder="请选择" size="mini" no-data-text="无数据">
                      <el-option
                        v-for="item in conformitys"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </div>
                  <div class="condition-item">
                  <span class="condition-label">
                    扩散范围：
                  </span>
                    <el-select v-model="rangeValue" placeholder="请选择" size="mini" no-data-text="无数据">
                      <el-option
                        v-for="item in groups"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </div>
                </div>
                <div class="condition-list-group">
                  <div class="condition-item">
                    <span class="condition-label">标签x：</span>
                    <el-select v-model="tagX" placeholder="请选择" size="mini" no-data-text="无数据">
                      <el-option
                        v-for="item in wordCloudLabelList"
                        :key="item.label_en_name"
                        :label="item.label_zh_name"
                        :value="item.label_en_name">
                      </el-option>
                    </el-select>
                  </div>
                  <div class="condition-item">
                  <span class="condition-label">
                    目标值：
                  </span>
                    <el-select v-model="labelX" placeholder="请选择" size="mini" no-data-text="无数据">
                      <el-option
                        v-for="item in labelXList"
                        :key="item.sub_entry"
                        :label="item.dict_prompt"
                        :value="item.sub_entry">
                      </el-option>
                    </el-select>
                  </div>
                </div>
                <div class="condition-list-group">
                  <div class="condition-item">
                    <span class="condition-label">标签y：</span>
                    <el-select v-model="tagY" placeholder="请选择" size="mini" no-data-text="无数据">
                      <el-option
                        v-for="item in wordCloudLabelList"
                        :key="item.label_en_name"
                        :label="item.label_zh_name"
                        :value="item.label_en_name">
                      </el-option>
                    </el-select>
                  </div>
                  <div class="condition-item">
                  <span class="condition-label">
                    目标值：
                  </span>
                    <el-select v-model="labelY" placeholder="请选择" size="mini" no-data-text="无数据">
                      <el-option
                        v-for="item in labelYList"
                        :key="item.sub_entry"
                        :label="item.dict_prompt"
                        :value="item.sub_entry">
                      </el-option>
                    </el-select>
                  </div>
                </div>
              </div>
              <el-button plain size="mini" @click="crowdDiffuse">人群扩散</el-button>
            </div>
            <!--            <div v-if="crowdDiffuseResultShow && !crowdDiffusioning">已为您赛选出100个客户</div>-->
            <el-button type="primary" size="mini" v-if="crowdDiffuseResultShow && !crowdDiffusioning"
                       @click="handleSaveGroup">保存客群
            </el-button>
          </div>
        </div>

        <div class="crowd-diffuse-reault-wrapper" v-if="crowdDiffuseResultShow">
          <div class="crowd-diffuse-result-group">
            <header>
              <span class="title">已为您找到满足条件的
                <em>{{ totalCount }}</em>名客户
              </span>
            </header>
            <div class="result-body">
              <el-table
                empty-text="暂无数据"
                :data="listTableData"
                border
                style="width: 100%">
                <el-table-column :resizable="false" prop="client_name" align="center" label="客户名称" width="180">
                </el-table-column>
                <el-table-column :resizable="false" prop="fund_account" align="center" label="资金账号">
                </el-table-column>
                <el-table-column :resizable="false" label="电话号码" align="center">
                  <template slot-scope="scope">{{ scope.row.mobile_tel }}</template>
                </el-table-column>
                <el-table-column :resizable="false" label="符合度(%)" align="center">
                  <template slot-scope="scope">{{ scope.row.percent ? scope.row.percent : '--' }}</template>
                </el-table-column>
                <el-table-column :resizable="false" label="操作" align="center">
                  <template slot-scope="scope">
                    <router-link :to="`/pictureDetail?fundAccount=${scope.row.fund_account}`"
                                 v-show="scope.row.fund_account">查看个体画像
                    </router-link>
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
                :total="totalCount"
                :page-size="pageSize"
                :current-page="pageNo"
                @current-change="listPageChange"></el-pagination>
            </div>
          </div>
          <div class="analysis-progress" v-show="crowdDiffusioning">
            <Loading size="huge" theme="dark"/>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      title="保存客群"
      class="dialog demonstrate-dialog"
      :visible.sync="showSaveGroupDailog"
      append-to-body
      width="510px">
      <div>
        <el-input v-model.trim="groupName" placeholder="请输入客群名称"></el-input>
      </div>
      <div class="result-confirm" slot="footer">
        <el-button type="primary"
                   round
                   size="medium"
                   @click="handleCancelGroupConfirm">取 消
        </el-button>
        <el-button type="primary"
                   round
                   size="medium"
                   @click="handleSaveGroupConfirm">确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
import echarts from 'echarts/lib/echarts'
import 'echarts-wordcloud'
import wordCloudChartOption from './chartOption'
import Loading from '@components/Loading'

const conformitysAry = [
{
  value: 0.1,
  label: '10%以上'
}, {
  value: 0.2,
  label: '20%以上'
}, {
  value: 0.3,
  label: '30%以上'
}, {
  value: 0.4,
  label: '40%以上'
}, {
  value: 0.5,
  label: '50%以上'
}, {
  value: 0.6,
  label: '60%以上'
}, {
  value: 0.7,
  label: '70%以上'
}, {
  value: 0.8,
  label: '80%以上'
}, {
  value: 0.9,
  label: '90%以上'
}]
export default {
  components: {
    Loading
  },
  data () {
    return {
      uploadType: 0,
      // 词云图表
      wordCloudChart: null,
      showWordCloudChart: false,
      featureRecognition: false, // 特征识别过渡动画开关
      crowdDiffusioning: false, // 人群扩散过渡动画开关
      tagX: '',
      tagY: '',
      labelX: '',
      labelY: '',


      // 条件-客群选择
      groupValue: '',
      groups: [],
      accuracy: '--',
      conformity: 0.5,
      conformitys: conformitysAry,
      // 条件-规则选择
      ruleValve: '',
      rules: [],
      // 条件-标签弹窗
      showSettingDialog: false,
      clusterInputData: '',
      tagList: [],
      tagValue: null,
      wordCloudLabelList: [],

      // 文件上传相关
      excelPath: '',
      uploadFile: [],

      // 扩散范围
      rangeValue: '',

      // 人群扩散操作栏
      showCrowdDiffuseBar: false,

      // 扩散结果列表
      listTableData: [],
      crowdDiffuseLoading: false,
      crowdDiffuseResultShow: false,
      pageSize: 10,
      pageNo: 1,
      totalCount: 0,

      // 保存客群相关
      showSaveGroupDailog: false,
      groupName: ''
    }
  },
  mounted () {
    this.getCustomUserGroup()
    this.initWordCloudChart()
  },
  methods: {
    /**
     * 获取客群下拉列表数据
     */
    getCustomUserGroup () {
      this.$services.getGroupList({
        data: {
          group_type: 1
        },
        method: 'post'
      }).then((res) => {
        if (res.error_no !== '0') {
          this.groups = []
          return
        }
        const tempArr = res.datas.map((item) => {
          return {
            value: item.group_id,
            label: item.group_name
          }
        })
        this.groups = tempArr
      }).catch((err) => {
        this.groups = []
      })
    },
    /**
     * 进行特征识别
     */
    fetchCrowdDiffusion () {
      // 进行条件选择验证
      if (!this.validateData()) {
        return
      }
      // 特征识别进行中不能再次点击
      if (this.featureRecognition) {
        return
      }
      // 显示词云部分容器
      this.showWordCloudChart = true
      // 显示特征识别过渡动画
      this.featureRecognition = true
      this.wordCloudLabelList = []
      this.tagX = ''
      this.tagY = ''
      this.labelX = ''
      this.labelY = ''
      this.updateWordCloudChart([])
      this.$services.getMainFeature({
        data: {
          group_id: this.groupValue
        },
        timeout: 0
      }).then((res) => {
        // 关闭特征识别过渡动画
        this.featureRecognition = false
        if (res.error_no !== '0') {
          this.$message({
            showClose: true,
            message: res.error_info ? res.error_info : '特征识别失败',
            type: 'error',
            duration: 1000
          })
          return
        }
        this.accuracy = (res.data.ratio * 100).toFixed(2) + '%'
        this.wordCloudLabelList = res.data.label_list
        this.updateWordCloudChart(res.data.label_list)
        this.showCrowdDiffuseBar = true
      }, (rej) => {
        // 关闭特征识别过渡动画
        this.featureRecognition = false
      })
    },

    // 特征识别条件选择合法验证
    validateData () {
      let result = true
      if (!this.groupValue) {
        this.$message({
          showClose: true,
          message: '请选择客群',
          type: 'warning',
          duration: 1000
        })
        result = false
      }
      return result
    },

    /**
     * 进行人群扩散
     */
    crowdDiffuse (loadType) {
      // 不是分页的时候，重置为 1
      if (!(loadType && loadType === 'append')) {
        this.pageNo = 1
      }
      // 进行条件选择验证
      if (!this.validateData()) {
        return
      }
      if (!this.rangeValue) {
        this.$message({
          showClose: true,
          message: '请选择扩散人群',
          type: 'warning',
          duration: 1000
        })
        return
      }
      if (!this.tagX || !this.tagY) {
        this.$message({
          showClose: true,
          message: '请选择目标值',
          type: 'warning',
          duration: 1000
        })
        return
      }
      // 扩散进行中不能再次点击
      if (this.crowdDiffusioning) {
        return
      }
      // 展示扩散结果容器
      this.crowdDiffuseResultShow = true
      // 展示扩散中过渡动画
      this.crowdDiffusioning = true
      let paramData = {
        group_id: this.rangeValue,
        percent: this.conformity,
        label_x: this.labelX,
        label_y: this.labelY,
        page_no: this.pageNo,
        page_size: this.pageSize
      }

      this.$services.crowdDiffusion({
        data: paramData,
        timeout: 0
      }).then((res) => {
        if (res.error_no !== '0') {
          this.$message({
            showClose: true,
            message: res.error_info,
            type: 'error',
            duration: 1000
          })
          this.crowdDiffusioning = false
          this.pageNo = 1
          this.totalCount = 0
          this.listTableData = []
          return
        }
        // 关闭过渡动画，翻页时需要延迟，不然会有闪动
        setTimeout(() => {
          this.crowdDiffusioning = false
        }, 300)
        if (res.datas.length === 0) {
          this.$message({
            showClose: true,
            message: this.pageNo === 1 ? '暂无扩散结果' : '没有下一页了',
            type: 'warning',
            duration: 1000
          })
          this.pageNo = 1
          this.totalCount = 0
          this.listTableData = []
          return
        }
        this.totalCount = res.total_count
        this.listTableData = res.datas
      }).catch((err) => {
        this.pageNo = 1
        this.crowdDiffusioning = false
        this.totalCount = 0
        this.listTableData = []
      })
    },

    listPageChange (pageNo) {
      this.pageNo = pageNo
      this.crowdDiffuse('append')
    },

    /**
     * 实例化词云对象
     */
    initWordCloudChart () {
      this.wordCloudChart = echarts.init(this.$refs.wordcloudChart)
    },
    /**
     * 更新词云对象
     */
    updateWordCloudChart (wordCloudData) {
      const JosnList = wordCloudData.reverse().map((item, index) => {
        return {
          value: item.ratio,
          name: item.label_zh_name,
          ratio: item.ratio
        }
      })
      if (JosnList.length > 0) {
        JosnList.forEach(function (item) {
          if (item.ratio > 0 && item.ratio <= 0.3) {
            item.color = 'red'
          } else if (item.value > 0.3 && item.value <= 0.6) {
            item.color = 'blue'
          } else if (item.value > 0.6) {
            item.color = 'green'
          } else {
            item.color = 'grey'
          }
        })
      }
      wordCloudChartOption.series[0].data = JosnList
      console.log(wordCloudChartOption)
      this.wordCloudChart.setOption(wordCloudChartOption)
    },

    // 显示标签选择弹窗
    openSettingDialog () {
      this.showSettingDialog = true
    },
    // 关闭标签选择弹窗
    closeSettingDialog () {
      this.showSettingDialog = false
    },

    /**
     * 弹窗中切换二级标签
     * @augments i i为展示列表对应详情项（中文）
     * @augments j j为所有标签
     * @augments k k为展示列表对应详情项（中文、英文）
     */
    showSubmenu (i, j, k) {
      console.log(k)
      this.tagList = k
    },

    handleSaveGroup () {
      this.showSaveGroupDailog = true
    },
    checkSpecificKey (str) {
      const specialKey = "[`~!#$^&*()=|{}':;',\\[\\].<>/?~！#￥……&*（）|{}【】‘；：”“'。，、？]‘'"
      for (let i = 0; i < str.length; i++) {
        if (specialKey.indexOf(str.substr(i, 1)) > -1) {
          return false
        }
      }
      return true
    },
    handleSaveGroupConfirm () {
      // 进行条件选择验证
      if (!this.validateData()) {
        return
      }
      if (!this.checkSpecificKey(this.groupName)) {
        this.$message({message: '名称含有特殊字符', showClose: true})
        return
      }

      if (!this.groupName) {
        this.$message({
          showClose: true,
          message: '请输入客群名称',
          type: 'warning',
          duration: 1000
        })
        return
      }
      let paramData = {
        group_id: this.rangeValue,
        label_x: this.labelX,
        label_y: this.labelY,
        group_name: this.groupName,
        percent: this.conformity
      }
      this.$services.postCrowdDiffusionGroup({
        data: paramData,
        timeout: 0,
        method: 'post'
      }).then((res) => {
        if (res.error_no === '0') {
          this.$message({
            showClose: true,
            message: '保存客群成功',
            type: 'success',
            duration: 1000
          })
        } else {
          this.$message({
            showClose: true,
            message: res.error_info ? res.error_info : '保存客群失败',
            type: 'error',
            duration: 1000
          })
        }
      })
      this.handleCancelGroupConfirm()
    },

    handleCancelGroupConfirm () {
      this.showSaveGroupDailog = false
      this.groupName = ''
    }
  },
  computed: {
    labelXList () {
      if (!this.wordCloudLabelList || !this.tagX) {
        return []
      }

      const obj = this.wordCloudLabelList.find(item => item.label_en_name === this.tagX)
      if (obj) {
        return obj.dict_item_list
      }

      return []
    },
    labelYList () {
      if (!this.wordCloudLabelList || !this.tagY) {
        return []
      }

      const obj = this.wordCloudLabelList.find(item => item.label_en_name === this.tagY)
      if (obj) {
        return obj.dict_item_list
      }

      return []
    }
  }
}
</script>

<style lang="less" scoped>
@import './style.less';
</style>
<style lang="less">
.el-radio__label {
  color: #606266;
  font-weight: 300;
  font-size: 12px;
  white-space: normal;
}
</style>
