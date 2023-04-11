<!--客群列表：视图组件-->
<template>
  <div class="customer-group-graphs"
       element-loading-text="数据拼命加载中..."
       v-loading="isLoading">

    <!--自定义模块图表-->
    <div class="group-card"
         v-for="(item, index) in displayModules"
         v-if="displayModules.length"
         :key="item + ''">
      <header><span class="title">{{ item.viewName }}</span></header>
      <div class="content">
        <div class="chart" :id="'chart' + index" style="height: 300px;width: 406px"></div>
      </div>
    </div>
    <!--奇数的时候最后项flex为1会占满一行，因此加一个隐藏DIV使他占50%-->
    <div class="group-card" v-show="displayModules.length%2!==0" style="opacity:0;"></div>
    <div class="no-charts" v-if="!displayModules.length">
      暂无视图
    </div>
  </div>
</template>

<script>
import {callback, showChartNoData, checkErrorNoFunc} from '@/common/func'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/component/legend'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/funnel'
import {NoData} from '@/components'
import {
  barChartOption,
  lineChartOption,
  pieChartOption,
  scatterChartOption,
  thremalChartOption,
  optionTarget
} from '@/common/chartOption'

let chart = null
const modules = ['client_sex', 'age_group', 'open_length_level', 'corp_risk_level', 'stock_trade_balance']

export default {
  name: 'CustomerGroupGraphs',
  props: {
    // group_id
    id: {
      type: [String, Number],
      default: ''
    },
    snapshotId: {
      type: [String, Number],
      default: ''
    },
    customViewList: {
      type: Array,
      default: () => []
    },
    displayModulesList: {
      type: Array,
      default: () => []
    },
    resultType: {
      type: String,
      // 默认是客群列表 customerGroup
      // 已保存客群列表 customerGroupSaved
      default: 'customerGroup'
    }
  },
  data () {
    return {
      modules,
      sexData: [],
      userSourceData: [],
      isLoading: false,
      // 自定义模块
      customerModules: [],
      // 用户自定义展示视图
      displayModules: [],
      // 延时器
      timerList: []
    }
  },
  computed: {
    groupSnapshot () {
      const {id, snapshotId} = this
      return {
        id,
        snapshotId
      }
    }
  },
  watch: {
    id: {
      handler (val) {
        // 若是在 `已保存客群列表`页，则监听不执行
        this.displayModules = [] // 切换ID时候清空已选视图
        if (this.resultType === 'customerGroupSaved') return
        if (val) {
          // this.customDisplayViewQry();
          // this.displayModules = this.displayModulesList;
          // this.getCustomViewGraphs();
        }
      },
      immediate: true
    },
    // 在 `已保存客群列表`页，则监听
    groupSnapshot: {
      handler (val) {
        if (this.resultType === 'customerGroupSaved') {
          if (val.id && val.snapshotId) {
            // this.customDisplayViewQry();
          }
        }
      },
      deep: true
    },
    displayModulesList: {
      handler (val) {
        this.resetGroupGraphs()
        if (val.length) {
          setTimeout(() => {
            this.displayModules = val
            this.getCustomViewGraphs()
          }, 300)
        } else {
          this.displayModules = []
        }
      },
      deep: true,
      immediate: true
    }
  },
  components: {
    NoData
  },
  beforeDestroy () {
    this.clearTimeoutFunc()
  },
  methods: {
    /**
     * 查询用户自定义展示视图列表
     */
    // async customDisplayViewQry() {
    //   this.resetGroupGraphs();
    //   const data = {
    //     groupId: this.id
    //   };
    //   try {
    //     const res = await this.$services.customDisplayViewQry({data});
    //     debugger
    //     res && callback(res, () => {
    //       if (res.datas && res.datas.length) {
    //         this.displayModules = res.datas;
    //         this.getCustomViewGraphs();
    //       }
    //     });
    //   } catch (err) {
    //     console.log('err', err);
    //   }
    // },
    /**
     * 获取用户自定义展示视图数据
     */
    getCustomViewGraphs () {
      this.displayModules.forEach((item, index) => {
        const viewIdAry = [1, 2, 3, 4, 5, 6, 7, 11, 12]
        if (viewIdAry.includes(+item.viewId)) {
          this.getGroupGraphs(item.viewId, index)
        } else {
          setTimeout(() => {
            this.customViewQry(item.viewId, index)
          }, 0)
        }
      })
    },
    /**
     * 获取系统视图数据
     */
    async getGroupGraphs (graphType, chartIndex) {
      this.isLoading = true
      const {id, snapshotId} = this
      const data = {
        group_id: id,
        graph_type: graphType
      }
      if (this.resultType === 'customerGroupSaved') {
        data.group_id = id
        data.snapshot_id = snapshotId
      }
      try {
        const res = await this.$services.groupGraphsQry({data})
        chart = echarts.init(this.$el.querySelector(`#chart${chartIndex}`))
        res && callback(res, async () => {
          if (res.data && res.data.picType) {
            this.switchChart(res.data, res.data.picType)
          }
          this.isLoading = false
        }, () => {
          this.isLoading = false
          showChartNoData(chart, res.error_info)
          if (!checkErrorNoFunc(res.error_no)) {
            let timer = setTimeout(() => {
              this.getGroupGraphs(graphType, chartIndex)
            }, 3000)
            this.timerList.push(timer)
          }
        })
      } catch (err) {
        this.isLoading = false
      }
    },
    resetGroupGraphs () {
      this.displayModules = []
    },
    /**
     * 展示自定义视图数据
     */
    async customViewQry (viewId, index) {
      // clearTimeout(this.timer);
      const { subEntry, timeType, viewTagName } = this.customViewList.find((view) => +view.viewId === +viewId)
      const data = {
        groupId: this.id,
        viewId: viewId,
        subEntry,
        timeType,
        viewTagName
      }
      try {
        let res = await this.$services.customViewDataQry({data})
        chart = echarts.init(this.$el.querySelector(`#chart${index}`))
        res && callback(res, () => {
          if (res.data) {
            this.switchChart(res.data, res.data.picType)
          }
        }, () => {
          showChartNoData(chart, res.error_info)
          if (!checkErrorNoFunc(res.error_no)) {
            let timer = setTimeout(() => {
              this.customViewQry(viewId, index)
            }, 3000)
            this.timerList.push(timer)
          }
        })
      } catch (err) {
        console.log('catch err', err)
      }
    },
    /**
     * 切换图表
     */
    switchChart (data, type) {
      let dataList = data.dataList
      let chartOption = {}
      // 求数据总和，用于算各项占比
      let allValue = 0
      dataList instanceof Array && dataList.forEach(item => allValue += Number(item.num))
      switch (type) {
        case 10:
          chartOption = barChartOption
          chartOption.xAxis.data = dataList.map(item => item.dictName)
          chartOption.series.data = dataList.map((item, index) => {
            return {
              value: item.num,
              ratio: (item.num / allValue * 100).toFixed(2)
            }
          })
          chart && chart.clear()
          if (allValue <= 0 || isNaN(allValue)) {
            showChartNoData(chart, '暂无数据')
          } else {
            chart && chart.setOption(chartOption)
            chart && chart.resize()
          }
          break
        case 11:
          chartOption = lineChartOption
          chartOption.xAxis.data = dataList.map(item => item.dictName)
          chartOption.series.data = dataList.map((item, index) => {
            return {
              value: item.num,
              ratio: (item.num / allValue * 100).toFixed(2)
            }
          })
          chart && chart.clear()
          if (allValue <= 0 || isNaN(allValue)) {
            showChartNoData(chart, '暂无数据')
          } else {
            chart && chart.setOption(chartOption)
            chart && chart.resize()
          }
          // chart.setOption(chartOption)
          break
        case 12:
          chartOption = pieChartOption
          chartOption.legend.icon = 'circle'
          chartOption.legend.itemWidth = 8
          chartOption.legend.itemHeight = 8
          chartOption.legend.data = dataList.map(item => item.dictName)
          chartOption.series.data = dataList.map(item => {
            return {
              value: item.num,
              name: item.dictName
            }
          })
          chart && chart.clear()
          if (allValue <= 0 || isNaN(allValue)) {
            showChartNoData(chart, '暂无数据')
          } else {
            chart && chart.setOption(chartOption)
            chart && chart.resize()
          }
          break
        case 20:
          chartOption = scatterChartOption
          chartOption.series.data = dataList
          chart && chart.clear()
          if (!dataList.length) {
            showChartNoData(chart, '暂无数据')
          } else {
            chart && chart.setOption(chartOption)
            chart && chart.resize()
          }
          break
        case 21:
          chartOption = thremalChartOption
          let list = []
          // 处理轴坐标数据
          data.firstDictName.forEach(i => {
            data.secondDictName.forEach(j => {
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
          let xTag = ''
          let yTag = ''
          // 处理数据范围
          chartOption.visualMap.color = ['#EF4864', '#FACC14']
          chartOption.xAxis.axisLabel.formatter = (value, index) => {
            return data.firstDictName[index]
          }
          chartOption.yAxis.axisLabel.formatter = (value, index) => {
            return data.secondDictName[index]
          }
          // 获取标签信息作为副标题
          try {
            xTag = data.tagDesc.split(';')[0]
            yTag = data.tagDesc.split(';')[1]
            // chartOption.title.text = `x轴标签：${xTag}，y轴标签：${yTag}`
          } catch (e) {
            console.error('获取标签信息作为副标题异常错误：' + e)
          }
          chart && chart.clear()
          chart && chart.setOption(chartOption)
          chart && chart.resize()
          break
        case 100:
          let dataListCurrent = dataList || {}
          console.log('dataListCurrent: ', dataListCurrent)
          chartOption = optionTarget
          let arr = []
          let dates = Object.keys(dataListCurrent).filter((key) => key)
          dates.forEach((key) => {
            let dataInfo = dataListCurrent[key] || {}
            if (data.subEntry) {
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
          data.subEntry && (legendTitle[0] = '总和')
          let seriesTarget = []
          chartOption.legend.data = []
          if (arr && arr.length > 0) {
            Object.keys(arr[0]).forEach(key => {
              chartOption.legend.data.push(legendTitle[key])
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
                o && o[index] && obj.data.push(o[index]) || obj.data.push(null)
              })
              seriesTarget.push(obj)
            })
            chartOption.legend.show = !data.subEntry
            chartOption.xAxis.data = dates.map((date) => date && date.length === 8 && date.substring(0, 4) + '.' + date.substring(4, 6) + '.' + date.substring(6) || date)
            chartOption.series = seriesTarget
            chart && chart.clear()
          };
          if (!arr.length) {
            showChartNoData(chart, '暂无数据')
          } else {
            chart && chart.setOption(chartOption)
            chart && chart.resize()
          }
          break
      }
    },
    clearTimeoutFunc () {
      this.timerList.forEach(item => {
        clearTimeout(item)
      })
    }
  }
}
</script>

<style rel="stylesheet/less" scoped lang="less">
@import './style.less';
</style>
