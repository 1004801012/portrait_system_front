<template>
  <div class="chart-panel">
    <!-- 标题 -->
    <div class="head">
      <p class="title">
        {{ groupName }}
        <span class="tag">{{ usersTotalCount }}人</span>
      </p>
      <div class="save-btn save-btn-delete">
        <h-button v-if="panelType === 0" :class="{'delete-btn': titleBtn === '删除'}" type="primary" class="right-btn" @click="checkEditType(titleBtn)">{{ titleBtn }}</h-button>
        <h-button v-if="panelType === 0 && titleBtn === '删除'" type="primary" class="right-btn" @click="saveChart()">保存视图</h-button>
      </div>
    </div>

    <!-- 表单 -->
    <div class="content" :class="{'content-new': editType && panelType !== 0}">
      <div class="left">
        <div class="tabs">
          <span :class="{'selected': activeTab === 0}" @click="tabChange(0)">指标分布</span>
          <span :class="{'selected': activeTab === 1}" @click="tabChange(1)">指标走势</span>
        </div>
        <!-- 指标分布 -->
        <div class="operate" v-if="activeTab === 0">
          <p class="label">分析维度</p>
          <el-select v-model="activatedHandle[activeTab].dimensionsValue" size="mini" no-data-text="无数据" placeholder="请选择分析维度"
                     :disabled="!editType" @change="dimensionsChange()">
            <el-option v-for="item in options1" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <p class="label">X轴标签选择</p>
          <el-button class="btn-mini" size="mini" @click="selectTag('x')" :disabled="!editType">{{
              xValue.name
            }}
          </el-button>
          <el-checkbox class="operate-new" v-model="autoRange" v-if="activatedHandle[activeTab].dimensionsValue === 1 && xValue.type !== 'i'">自动取值分段
          </el-checkbox>
          <div v-if="activatedHandle[activeTab].dimensionsValue === 1 && !autoRange && xValue.type !== 'i'">
            <p class="label">设置分段数：</p>
            <el-select v-model="rangeValue" size="mini" placeholder="请选择分数段" no-data-text="无数据" :disabled="!editType">
              <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
          <p class="label">Y轴标签选择</p>
          <el-button class="btn-mini" size="mini" @click="selectTag('y')" :disabled="!editType || activatedHandle[activeTab].dimensionsValue === 1">
            {{ yValue.name }}
          </el-button>
        </div>
        <!-- 指标走势 -->
        <div class="operate" v-if="activeTab === 1">
          <p class="label">统计周期</p>
          <div class="date-div">
            <h-select
              v-model="time_type"
              showBottom
              :clearable="false"
              :readonly="!editType"
              :disabled="!editType"
            >
              <h-option
                v-for="items in dateList"
                :value="items.id"
                :key="items.id"
              >{{ items.name }}</h-option>
            </h-select>
          </div>
          <p class="label">统计维度</p>
          <el-button class="btn-mini" size="mini" @click="activatedHandle[activeTab].selectTag()" :disabled="!editType">{{
              dimension.name
            }}
          </el-button>
          <p class="label" v-if="activatedHandle[activeTab].tagValueType === 'i'">字典子项</p>
          <div class="date-div" v-if="activatedHandle[activeTab].tagValueType === 'i'">
            <h-select
              v-model="activatedHandle[activeTab].subEntry"
              showBottom
              :clearable="false"
              :readonly="!editType"
              :disabled="!editType"
            >
              <h-option
                v-for="items in subEntryList"
                :value="items.value"
                :key="items.value"
              >{{ items.name }}</h-option>
            </h-select>
          </div>
        </div>
        <!--  -->
        <div class="operation-btn" v-if="editType">
          <h-button type="ghost" @click="activatedHandle[activeTab].dimensionsChange()">重置</h-button>
          <h-button type="primary" class="right-btn" @click="activatedHandle[activeTab].displayChart()">生成视图</h-button>
        </div>
      </div>
      <div class="right">
        <div class="title" v-if="activatedHandle[activeTab].showSaveBtn && editType">
          <div>视图名称：</div>
          <div v-if="!isEdit && !editType">{{activatedHandle[activeTab].viewName}}</div>
          <div v-else-if="!isEdit && editType ">{{activatedHandle[activeTab].name}}</div>
          <div v-else-if="isEdit"><h-input ref="input" v-model.trim="activatedHandle[activeTab].name" maxlength="16" clearable filterable @on-blur="handleBlur" /></div>
          <div @click="editViewName">
            <h-icon name="t-b-modify edit-icon"></h-icon>
          </div>
        </div>
        <div class="">
          <div class="chart" ref="chart" id="chart" v-show="activeTab === 0"></div>
          <div class="chart" ref="chart1" id="chart1" v-show="activeTab === 1"></div>
          <div class="panel" v-if="activatedHandle[activeTab].dimensionsValue === 1 && activatedHandle[activeTab].showSaveBtn && editType && activeTab === 0">
            <i class="iconfont-dmp iconfont-dmp-bar" :class="{'actived': activedChart === 10, 'disabled': !editType}"
               @click="switchChart(10, false)"></i>
            <i class="iconfont-dmp iconfont-dmp-line" :class="{'actived': activedChart === 11, 'disabled': !editType}"
               @click="switchChart(11, false)"></i>
            <i class="iconfont-dmp iconfont-dmp-pie" :class="{'actived': activedChart === 12, 'disabled': !editType}"
               @click="switchChart(12, false)"></i>
          </div>
        </div>
        <div class="save-btn">
          <h-button v-if="activatedHandle[activeTab].showSaveBtn && editType && panelType !== 0" type="primary" class="right-btn" @click="saveChart()">保存视图</h-button>
        </div>
      </div>
    </div>

    <!-- 标签选择弹窗 -->
    <el-dialog title="标签选择" :visible.sync="modalTag" class="modal-tag" width="720px">
      <el-input
        class="search-input"
        placeholder="输出标签关键字搜索"
        v-model.trim="keyword">
        <i slot="prefix" class="iconfont-dmp iconfont-dmp-select"></i>
      </el-input>
      <div class="add-middle">
        <div class="left">
          <div class="attr-tag-tree">
            <div class="list">
              <el-tree
                :data="treeData"
                :props="defaultProps"
                :render-content="renderContent"
                :default-expand-all="true"
                :expand-on-click-node="false"
                :highlight-current="true"
                @node-click="handleNodeClick"></el-tree>
            </div>
          </div>
        </div>
        <div class="right">
          <el-radio-group v-model="radio" class="radio-group">
            <el-radio v-for="item in detailTagList" :key="item.name" :label="JSON.stringify(item)" class="radio-item">
              {{ item.name }}
            </el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="result-confirm" slot="footer">
        <el-button type="primary" round size="medium" @click="activatedHandle[activeTab].modalConfirm(0)">确定</el-button>
        <el-button type="primary" round size="medium" @click="modalCancel(0)">取消</el-button>
      </div>
    </el-dialog>

    <h-msgBox
      v-model="modalSave"
      class="delivery-check-box"
      title="保存视图"
      width="400"
      @on-ok="activatedHandle[activeTab].modalConfirm"
      @on-cancel="modalCancel(2)"
      @on-close="modalCancel(2)">
      <div class="msg-box-content">
        <div class="title-name">
          视图名称
        </div>
        <h-input
          v-model.trim="activatedHandle[activeTab].name"
          :canResize="false"
          icon
          maxlength="16"
          placeholder="请输入视图名称"
          type="text"
        ></h-input>
      </div>
    </h-msgBox>
  </div>
</template>

<script>
import echarts from 'echarts'
import {
  barChartOption,
  lineChartOption,
  pieChartOption,
  scatterChartOption,
  thremalChartOption,
  optionTarget
} from '@/common/chartOption.js'
import { callback, debounce, showChartNoData, checkErrorNoFunc } from '@/common/func'
import {formatDate} from 'cloud-utils'

let chart = null
let chart1 = null

export default {
  name: 'customView',
  props: {
    panelType: {
      type: Number,
      default: 0 // 0: 可切换编辑、预览模式，1：只有编辑模式
    },
    id: {
      type: [String, Number]
    },
    groupName: {
      type: String
    },
    usersTotalCount: {
      type: [String, Number]
    },
    viewParam: {
      type: Object
    },
    currentTime: {
      type: Number
    }
  },
  data () {
    return {
      activeTab: 0, // 默认在指标分布
      // 当前组件是否被重新创建
      newComponent: true,
      // 模式状态（编辑、预览）
      editType: this.panelType !== 0,
      titleBtn: '编辑',
      // 维度
      options1: [
        {
          value: 1,
          label: '一维'
        },
        {
          value: 2,
          label: '二维'
        }
      ],
      // X轴
      xValue: {
        name: '请选择标签',
        label: '',
        type: ''
      },
      dimension: {
        name: '请选择统计维度',
        label: '',
        type: ''
      },
      // 分数段
      autoRange: true,
      rangList: [], // 观测值选项
      rangeValue: '',
      options2: [
        {
          value: 2,
          label: '2段'
        },
        {
          value: 3,
          label: '3段'
        },
        {
          value: 4,
          label: '4段'
        },
        {
          value: 5,
          label: '5段'
        },
        {
          value: 6,
          label: '6段'
        },
        {
          value: 7,
          label: '7段'
        },
        {
          value: 8,
          label: '8段'
        },
        {
          value: 9,
          label: '9段'
        },
        {
          value: 10,
          label: '10段'
        }
      ],
      // Y轴
      yValue: {
        name: '请选择标签',
        label: ''
      },
      // 当前选中的图表类型，10：柱状图、11：折线图、12：饼图、20：散点图、21：热力图
      activedChart: 10,
      // 标签选择弹窗
      modalTag: false,
      keyword: '',
      treeData: [], // 左侧标签层
      defaultProps: {
        id: 'id',
        children: 'children',
        label: 'label'
      },
      detailTagList: [], // 右侧标签组
      radio: '', // 当前选中的标签对象
      tagType: '', // 标签类型，0：x轴标签，1：y轴标签， 2: 统计维度
      // 保存弹窗
      modalSave: false,
      timerList: [],
      isEdit: false,
      activatedHandle: {
        0: {
          showSaveBtn: false,
          dimensionsChange: this.dimensionsChange,
          displayChart: this.displayChart, // 生成视图
          viewName: '',
          name: '',
          chartData: [], // 图表数据
          dimensionsValue: '', // 统计维度
          tagValueType: '', // 标签类型
          selectTag: this.selectTag, // 选择标签
          modalConfirm: this.modalConfirm, // 确认按钮
          subEntry: '' // 字典子项
        },
        1: {
          showSaveBtn: false,
          dimensionsChange: this.reset,
          displayChart: this.rightDisplayChart,
          viewName: '',
          name: '',
          chartData: {}, // 图表数据
          dimensionsValue: 0, // 走势图
          tagValueType: '', // 标签类型
          selectTag: this.selectTagSub, // 选择维度
          modalConfirm: this.modalConfirmRight, // 确认按钮
          subEntry: '' // 字典子项
        }
      },
      time_type: 0,
      dateList: [
        {
          id: 0,
          name: '近一月'
        }
      ],
      subEntryList: [] // 字典子项
    }
  },
  computed: {
  },
  created () {
  },
  mounted () {
    this.newComponent && this.initViewData()
    this.newComponent = false
    window.onresize = () => {
      chart && chart.resize()
      chart1 && chart1.resize()
    }
  },
  beforeDestroy () {
    this.clearTimeoutFunc()
  },
  watch: {
    keyword: function (val) {
      this.filterByKeyword()
    },
    // viewParam: {
    //   handler: function (data) {
    //     // 组件初始化时不执行，切换数据时执行
    //     !this.newComponent && this.initViewData();
    //     this.initFlag = true;
    //   },
    //   deep: true,
    //   immediate: true
    // },
    currentTime () {
      !this.newComponent && this.initViewData()
    }
  },
  methods: {
    /**
     * 初始化视图数据
     */
    initViewData () {
      this.reset()
      this.dimensionsChange()
      if (this.viewParam) {
        this.editType = false
        this.titleBtn = '编辑'
        this.activedChart = this.viewParam.viewPicType
        this.activeTab = this.activedChart === 100 ? 1 : 0
        this.activatedHandle[this.activeTab].dimensionsValue = this.viewParam.viewDimension
        this.activatedHandle[this.activeTab].viewName = this.viewParam.viewName
        this.activatedHandle[this.activeTab].name = this.viewParam.viewName
        if (this.activeTab === 1) {
          this.dimension.name = this.viewParam.tagChName || ''
          this.dimension.label = this.viewParam.viewTagName || ''
          this.dimension.type = this.viewParam.tagValueType || ''
          this.activatedHandle[this.activeTab].subEntry = this.viewParam.subEntry || ''
          this.activatedHandle[this.activeTab].tagValueType = this.viewParam.tagValueType || ''
          this.time_type = this.viewParam.time_type || 0
          if (this.viewParam.tagValueType === 'i') {
            this.activatedHandle[this.activeTab].dictEntry = this.viewParam.dictEntry
            this.tagDictQry()
          }
          this.rightCustomViewQry()
          return
        }
        // x轴信息
        let xValueName = this.viewParam.tagChName.split(';')[0]
        this.xValue.name = xValueName || this.viewParam.tagChName
        let xValueLabel = this.viewParam.viewTagName.split(';')[0]
        this.xValue.label = xValueLabel || this.viewParam.viewTagName
        this.xValue.type = this.viewParam.tagValueType
        // 取值分数段
        this.rangeValue = this.viewParam.viewPartition
        // y轴信息
        let yValueName = this.viewParam.tagChName.split(';')[1]
        this.yValue.name = yValueName || '分布百分比'
        let yValueLabel = this.viewParam.viewTagName.split(';')[1]
        this.yValue.label = yValueLabel || ''
        this.customViewQry()
      }
    },
    /**
     * 预览、查看自定义视图数据
     */
    async customViewQry () {
      chart = echarts.init(this.$refs.chart)
      // 参数校验状态
      let state = true
      const data = {
        dimension: this.activatedHandle[this.activeTab].dimensionsValue,
        picType: this.activedChart,
        groupId: this.id
      }
      // 预览、查看模式入参
      if (this.viewParam && this.viewParam.viewId && !this.editType) {
        data.viewId = this.viewParam.viewId
      }
      // 预览：参数完整性校验
      if (this.editType) {
        if (!this.activatedHandle[this.activeTab].dimensionsValue) {
          state = false
        }
        if (this.activatedHandle[this.activeTab].dimensionsValue === 1 && !this.xValue.label) {
          state = false
        }
        if (this.activatedHandle[this.activeTab].dimensionsValue === 2) {
          if (!this.xValue.label || !this.yValue.label) {
            state = false
          }
        }
      }
      if (!state) {
        this.$hMessage.warning('请将参数配置完整！')
        return
      }
      // 维度入参
      if (this.activatedHandle[this.activeTab].dimensionsValue === 1) {
        data.tagName = this.xValue.label
      } else if (this.activatedHandle[this.activeTab].dimensionsValue === 2) {
        data.tagName = `${this.xValue.label};${this.yValue.label}`
      }
      // 一维：分数段入参
      if (this.rangeValue) {
        data.partition = this.rangeValue
      }
      // 初始化图表对象
      try {
        let res = await this.$services.customViewDataQry({ data })
        res && callback(res, () => {
          if (res.data) {
            this.activatedHandle[this.activeTab].chartData = res.data
            this.switchChart(res.data.picType, true)
            this.activatedHandle[this.activeTab].showSaveBtn = true
            this.activatedHandle[this.activeTab].name = this.xValue.name
          }
        }, () => {
          showChartNoData(chart, res.error_info)
          if (!checkErrorNoFunc(res.error_no)) {
            let timer = setTimeout(() => {
              this.customViewQry()
            }, 3000)
            this.timerList.push(timer)
          }
        })
      } catch (err) {
        console.log('catch err', err)
      }
    },
    /**
     * 保存视图
     */
    async customViewSave () {
      let tagName = ''
      if (this.activatedHandle[this.activeTab].dimensionsValue === 1) {
        tagName = this.xValue.label
      } else if (this.activatedHandle[this.activeTab].dimensionsValue === 2) {
        tagName = `${this.xValue.label};${this.yValue.label}`
      } else if (this.activatedHandle[this.activeTab].dimensionsValue === 0) {
        tagName = this.dimension.label
      }
      const data = {
        tagName,
        dimension: this.activatedHandle[this.activeTab].dimensionsValue,
        subEntry: this.activatedHandle[this.activeTab].subEntry,
        picType: this.activedChart,
        groupId: this.id,
        viewName: this.activatedHandle[this.activeTab].name,
        timeType: this.time_type
      }
      if (this.rangeValue) {
        data.partition = this.rangeValue
      }
      try {
        let res = await this.$services.customViewSave({ data })
        res && callback(res, () => {
          this.$hMessage.warning(res.error_info)
          this.modalSave = false
          // 跳转到管理视图页面
          this.$router.push({
            path: 'managementView',
            query: { id: this.id, groupName: this.groupName, usersTotalCount: this.usersTotalCount, t: new Date().getTime() }
          })
        }, () => {
          this.$hMessage.warning(res.error_info)
        })
      } catch (err) {
        console.log('catch err', err)
      }
    },
    /**
     * 更新视图
     */
    async customViewUpdate () {
      let tagName = ''
      if (this.activatedHandle[this.activeTab].dimensionsValue === 1) {
        tagName = this.xValue.label
      } else if (this.activatedHandle[this.activeTab].dimensionsValue === 2) {
        tagName = `${this.xValue.label};${this.yValue.label}`
      } else if (this.activatedHandle[this.activeTab].dimensionsValue === 0) {
        tagName = this.dimension.label
      }
      const data = {
        tagName,
        dimension: this.activatedHandle[this.activeTab].dimensionsValue,
        picType: this.activedChart,
        groupId: this.id,
        viewName: this.activatedHandle[this.activeTab].name,
        viewId: this.viewParam.viewId,
        partition: this.rangeValue,
        subEntry: this.activatedHandle[this.activeTab].subEntry,
        time_type: this.time_type
      }
      try {
        let res = await this.$services.customViewUpdate({ data })
        res && callback(res, () => {
          this.$hMessage.warning(res.error_info)
          this.modalSave = false
          this.editType = false
          this.titleBtn = '编辑'
          this.$emit('updateView', 'update')
        }, () => {
          this.$hMessage.warning(res.error_info)
        })
      } catch (err) {
        console.log('catch err', err)
      }
    },
    /**
     * 删除视图
     */
    async customViewDelete () {
      const data = {
        viewId: this.viewParam.viewId
      }
      try {
        let res = await this.$services.customViewDelete({ data })
        res && callback(res, () => {
          this.$hMessage.warning(res.error_info)
          this.editType = false
          this.titleBtn = '编辑'
          this.$emit('updateView', 'delete')
        }, () => {
          this.$hMessage.warning(res.error_info)
        })
      } catch (err) {
        console.log('catch err', err)
      }
    },
    /**
     * 获取标签组数据
     */
    async customTagQry () {
      const data = {
        dimension: this.activatedHandle[this.activeTab].dimensionsValue,
        keyword: this.keyword,
        type: 1
      }
      try {
        let res = await this.$services.customTagQry({ data })
        res && callback(res, () => {
          this.handleTagList(res.data && res.data.children)
        }, () => {
          console.log('err', res)
        })
      } catch (err) {
        console.log('catch err', err)
      }
    },
    /**
     * 处理标签数据
     */
    handleTagList (dataList) {
      let tagList = []
      if (dataList.length) {
        dataList.forEach(item1 => {
          let obj = {
            id: item1.id,
            label: item1.name
          }
          if (item1.children && item1.children.length) {
            obj.children = []
            item1.children.forEach(item2 => {
              let child = {
                id: item2.id,
                label: item2.name
              }
              if (item2.children && item2.children.length) {
                child.childList = []
                item2.children.forEach(item3 => {
                  let tag = {
                    name: item3.c_tag_category_name,
                    label: item3.c_tag_english_name,
                    type: item3.c_tag_value_type,
                    unit: item3.c_tag_unit,
                    dictEntry: item3.c_dict_entry
                  }
                  child.childList.push(tag)
                })
              }
              obj.children.push(child)
            })
          }
          tagList.push(obj)
        })
      }
      // 过滤空子节点
      if (tagList.length) {
        this.treeData = tagList.filter(item => {
          return item.children && item.children.length
        })
      }
    },
    /**
     * 渲染树节点
     */
    renderContent (h, { node, data, store }) {
      /* eslint-disable */
      if (node.isLeaf) {
        return (<span>< i class="iconfont-dmp iconfont-dmp-group-add"
                          style="font-size:12px;color:#54A7FD;margin-right:6px;"/>{node.label}</span>)
      } else {
        return <span>{node.label}</span>
      }
    },
    /**
     * 点击节点事件
     */
    handleNodeClick (data, node) {
      if (node.isLeaf) {
        this.showDetailTagList(data.childList)
      }
    },
    /**
     * 展示具体标签组
     */
    showDetailTagList (tagList) {
      if (tagList && tagList.length) {
        this.detailTagList = tagList
      } else {
        this.detailTagList = []
      }
    },
    /**
     * 条件过滤标签组
     */
    filterByKeyword: debounce(function () {
      this.customTagQry()
      this.showDetailTagList([])
    }, 500),
    /**
     * 切换编辑、删除模式
     */
    checkEditType (type) {
      if (type === '编辑') {
        this.activatedHandle[this.activeTab].name = this.activatedHandle[this.activeTab].viewName;
        this.editType = true
        this.titleBtn = '删除'
      } else {
        this.$hMsgBox.confirm({
          title: "删除提示",
          content: '是否删除该视图？',
          onOk: () => {
            this.modalConfirm(1);
          },
          onCancel: () => {
            this.modalCancel(1);
          }
        });
      }
    },
    /**
     * tab切换事件
     */
    tabChange (index) {
      this.activeTab = index;
    },
    /**
     * 切换维度事件
     */
    dimensionsChange () {
      this.rangeValue = ''
      this.activedChart = 10
      this.activatedHandle[0].showSaveBtn = false;
      this.xValue = {
        name: '请选择标签',
        label: ''
      }
      this.yValue = {
        name: '请选择标签',
        label: ''
      }
      this.showDetailTagList([])
      // 清空chart
      chart && chart.clear()
    },
    /**
     * 预览视图
     */
    displayChart () {
      this.activatedHandle[this.activeTab].showSaveBtn = false
      this.customViewQry()
    },
    /**
     * 切换图表
     */
    switchChart (type, isInit) {
      let dataList = this.activatedHandle[this.activeTab].chartData.dataList||[]
      let chartOption = {}
      // 求数据总和，用于算各项占比
      let allValue = 0
      dataList instanceof Array && dataList.forEach(item => allValue += Number(item.num))
      if (this.editType || isInit) {
        this.activedChart = type
        switch (type) {
          case 10:
            chartOption = barChartOption
            chartOption.xAxis.data = dataList.map(item => item.dictName)
            chartOption.series.data = dataList.map((item, index) => {
              return {
                value: item.num,
                ratio: allValue ? (item.num / allValue * 100).toFixed(2) : 0
              }
            })
            chart && chart.clear()
            if (allValue <= 0 || isNaN(allValue)) {
              showChartNoData(chart, '暂无数据')
            } else {
              chart.setOption(chartOption)
              chart.resize()
            }
            break
          case 11:
            chartOption = lineChartOption
            chartOption.xAxis.data = dataList.map(item => item.dictName)
            chartOption.series.data = dataList.map((item, index) => {
              return {
                value: item.num,
                ratio: allValue ? (item.num / allValue * 100).toFixed(2) : 0
              }
            })
            chart && chart.clear()
            if (allValue <= 0 || isNaN(allValue)) {
              showChartNoData(chart, '暂无数据')
            } else {
              chart.setOption(chartOption)
              chart.resize()
            }
            break
          case 12:
            chartOption = pieChartOption
            chartOption.legend.icon = 'circle';
            chartOption.legend.itemWidth = 8;
            chartOption.legend.itemHeight = 8;
            chartOption.legend.data = dataList.map(item => item.dictName)
            chartOption.series.data = dataList.map(item => {
              allValue += item.num
              return {
                value: item.num,
                name: item.dictName
              }
            })
            chart && chart.clear()
            if (allValue <= 0 || isNaN(allValue)) {
              showChartNoData(chart, '暂无数据')
            } else {
              chart.setOption(chartOption)
              chart.resize()
            }
            break
          case 20:
            chartOption = scatterChartOption
            chartOption.series.data = dataList
            chart && chart.clear()
            if (!dataList.length) {
              showChartNoData(chart, '暂无数据')
            } else {
              chart.setOption(chartOption)
              chart.resize()
            }
            break
          case 21:
            chartOption = thremalChartOption
            let list = []
            // 处理轴坐标数据
            this.activatedHandle[this.activeTab].chartData.firstDictName.forEach(i => {
              this.activatedHandle[this.activeTab].chartData.secondDictName.forEach(j => {
                list.push({
                  name: [i, j],
                  value: ''
                })
              })
            })
            list.forEach((item, index) => {
              item.value = dataList[index]
            })
            chartOption.series.data = list
            // 处理数据范围
            let sortList = dataList.map(item => item[2])
            chartOption.visualMap.min = sortList[0]
            chartOption.visualMap.max = sortList[sortList.length - 1]
            chartOption.visualMap.color = ['#EF4864', '#FACC14'];
            chartOption.xAxis.axisLabel.formatter = (value, index) => {
              return this.activatedHandle[this.activeTab].chartData.firstDictName[index];
            };
            chartOption.yAxis.axisLabel.formatter = (value, index) => {
              return this.activatedHandle[this.activeTab].chartData.secondDictName[index];
            };
            chart && chart.clear()
            chart.setOption(thremalChartOption)
            chart.resize()
            break;
          case 100:
            if(dataList instanceof Array) {
              dataList = {};
            }
            dataList = dataList || {}
            chartOption = optionTarget;
            let arr = []
            let dates = Object.keys(dataList).filter((key) => key)
            const subEntry = this.activatedHandle[this.activeTab].chartData.subEntry
            dates.forEach((key) => {
              let dataInfo = dataList[key] || {};
              if(subEntry){
                arr.push({
                  0: dataInfo.count || ''
                })
              } else {
                arr.push({
                  0: dataInfo.max || '0',
                  1: dataInfo.avg || '0',
                  2: dataInfo.min || '0',
                  3: dataInfo.median || '0',
                  4: dataInfo.count || '0'
                })
              }
            })
            let legendTitle = {
              0: '最大值',
              1: '平均值',
              2: '最小值',
              3: '中位数',
              4: '总和'
            }
            subEntry && (legendTitle[0] = '总和');
            chartOption.legend.show = !subEntry;
            let seriesTarget = []
            chartOption.legend.data = []
            if (arr && arr.length > 0) {
              Object.keys(arr[0]).forEach(key => {
                chartOption.legend.data.push(legendTitle[key]);
              })
              chartOption.legend.data.forEach((item, index) => {
                let obj = {
                  name: item,
                  type: 'line',
                  symbol: 'circle',
                  symbolSize: 5,
                  data: [],
                  yAxisIndex: 0
                }
                arr.forEach((o) => {
                  o && o[index] !== undefined && obj.data.push(o[index]) || obj.data.push(null)
                })
                seriesTarget.push(obj)
              })
              chartOption.xAxis.data = dates.map((date) => date && date.length === 8 && date.substring(0, 4) + '.' + date.substring(4, 6) + "." + date.substring(6) || date);
              chartOption.series = seriesTarget;
              chart1 && chart1.clear();
            };
            if (!arr.length) {
              showChartNoData(chart1, '暂无数据')
            } else {
              chart1.setOption(chartOption)
              chart1.resize()
            }
            break;
        }
      }
    },
    /**
     * 保存视图
     */
    saveChart () {
      this.modalSave = true
    },
    /**
     * 开启标签选择弹窗
     */
    selectTag (param) {
      this.modalTag = true
      this.radio = ''
      if (param === 'x') {
        this.tagType = 0
      } else if (param === 'y') {
        this.tagType = 1
      }
      this.customTagQry()
    },
    /**
     * 弹窗确认回调
     */
    modalConfirm (type = 2) {
      this.activatedHandle[this.activeTab].viewName = this.activatedHandle[this.activeTab].name;
      if (type === 0) {
        this.rangeValue = ''
        this.modalTag = false
        if (this.tagType === 0) {
          this.xValue = JSON.parse(this.radio)
          this.activatedHandle[this.activeTab].tagValueType = this.xValue.type || '';
          this.activatedHandle[this.activeTab].dictEntry = this.xValue.dictEntry || '';
          // 一维时，y轴标签只展示x轴标签的单位
          if (this.activatedHandle[this.activeTab].dimensionsValue === 1) {
            // this.yValue.name = this.radio.unit;
            this.yValue.name = '分布百分比'
          }
        } else if (this.tagType === 1) {
          this.yValue = JSON.parse(this.radio)
        }
        return true
      } else if (type === 1) {
        this.customViewDelete()
        return true
      } else {
        if (!this.activatedHandle[this.activeTab].name) {
          this.$hMessage.warning('视图名称不能为空！')
          return false
        }
        if (this.panelType === 0) {   // 编辑视图
          this.customViewUpdate()
          return true
        } else {    // 创建视图
          this.customViewSave()
          return true
        }
      }
    },
    /**
     * 弹窗取消回调
     */
    modalCancel (type) {
      if (type === 0) {
        this.modalTag = false
      }
    },
    clearTimeoutFunc () {
      this.timerList.forEach(item => {
        clearTimeout(item)
      })
    },
    reset() {
      chart1 && chart1.clear();
      this.time_type = 0;
      this.dimension = {
        name: '请选择统计维度',
        label: '',
        type: ''
      };
      this.activatedHandle[1].showSaveBtn = false;
      this.activatedHandle[1].viewName = '';
      this.activatedHandle[1].name = '';
      this.activatedHandle[1].chartData = {}; // 图表数据
      this.activatedHandle[1].dimensionsValue = 0; // 统计维度
      this.activatedHandle[1].tagValueType = ''; // 标签类型
      this.activatedHandle[1].subEntry = ''; // 字典子项
    },
    rightDisplayChart () {
      this.activatedHandle[this.activeTab].showSaveBtn = false;
      this.rightCustomViewQry()
    },
    async rightCustomViewQry () {
      chart1 = echarts.init(this.$refs.chart1);
      const data = {
        timeType: this.time_type,
        groupId: this.id,
        tagName: this.dimension.label,
        subEntry: this.activatedHandle[this.activeTab].subEntry
      }
      // 预览、查看模式入参
      if (this.viewParam && this.viewParam.viewId && !this.editType) {
        data.viewId = this.viewParam.viewId
      }
      if (this.time_type === '' || this.dimension.label === '' || this.dimension.type === 'i' && this.activatedHandle[this.activeTab].subEntry === '') {
        this.$hMessage.warning('请将参数配置完整！')
        return
      }
      // 初始化图表对象
      try {
        let res = await this.$services.getHisTendencyView({
          headers: {'Content-Type': 'application/json; charset=UTF-8'},
          data
        })
        res && callback(res,
          () => {
            if (res.data) {
              this.activatedHandle[this.activeTab].chartData = res.data
              this.switchChart(res.data.picType || 100, true)
              this.activatedHandle[this.activeTab].showSaveBtn = true
              this.activatedHandle[this.activeTab].name = this.dimension.name;
            }
          },
          () => {
            showChartNoData(chart1, res.error_info)
            if (!checkErrorNoFunc(res.error_no)) {
              let timer = setTimeout(() => {
                this.rightCustomViewQry()
              }, 3000)
              this.timerList.push(timer)
            }
          }
        )
      } catch (err) {
        console.log('catch err', err)
      }
    },
    editViewName () {
      this.isEdit = true;
      this.$nextTick(() => {
        this.$refs.input.focus();
      })
    },
    handleBlur () {
      this.isEdit = false;
    },
    selectTagSub () {
      this.modalTag = true;
      this.radio = '';
      this.customTagQry();
    },
    modalConfirmRight (type) {
      this.activatedHandle[this.activeTab].viewName = this.activatedHandle[this.activeTab].name;
     console.log('11111111111', type)
      if (type === 0) {
        this.rangeValue = ''
        this.modalTag = false
        let xValue
        try {
          xValue = JSON.parse(this.radio);
        } catch (e) {
          xValue = {}
        }
        this.dimension = xValue;
        this.activatedHandle[this.activeTab].tagValueType = xValue.type || '';
        this.activatedHandle[this.activeTab].dictEntry = xValue.dictEntry || '';
        this.activatedHandle[this.activeTab].subEntry = ''
        xValue.type === 'i' && this.tagDictQry();
        return true
      } else if (type === 1) {
        this.customViewDelete()
        return true
      } else {
        if (!this.activatedHandle[this.activeTab].name) {
          this.$hMessage.warning('视图名称不能为空！')
          return false
        }
        if (this.panelType === 0) {   // 编辑视图
          this.customViewUpdate()
          return true
        } else {    // 创建视图
          this.customViewSave()
          return true
        }
      }
    },
    async tagDictQry() {
      this.subEntryList = [];
      const params = {
        c_dict_entry: this.activatedHandle[this.activeTab].dictEntry
      }
      try {
        const {
          datas,
          error_no,
          error_info
        } = await this.$services.tagDictQry({
          data: params
        })
        if (error_no === '0') {
          let oldData = datas || [];
          oldData.map((v, i) => {
            this.subEntryList.push({
              name: v.c_dict_prompt || c_sub_entry,
              value: v.c_sub_entry
            })
          })
        } else {
          this.$hMessage.warning(error_info)
        }
      } catch (err) {
      }
    }
  }
}
</script>

<style lang="less" rel="stylesheet/less" scoped>
@import 'style';
</style>
