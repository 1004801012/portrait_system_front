<!--客群列表：视图组件-->
<template>
  <div v-loading="isLoading" class="customer-group-graphs" element-loading-text="数据拼命加载中...">
    <!-- 系统视图 -->
    <div v-for="(item, index) in selectModules" :key="item + ''" class="group-card">
      <header>
        <span class="title">{{ getGraphsName(item) }}</span>
      </header>
      <div class="content">
        <div :id="'chart' + index" class="chart" style="width: 446px; height: 250px"></div>
      </div>
    </div>
    <!--详情行为-->
    <div class="box behavior">
      <div class="group-card">
        <header><span class="title">详情行为</span></header>
        <el-table empty-text="暂无数据" :data="behaviorTableData" border style="width: 100%">
          <el-table-column prop="event" label="事件" width="180"> </el-table-column>
          <el-table-column prop="trigger_count" label="触发次数" width="180"> </el-table-column>
          <el-table-column prop="trigger_people" label="触发人数"> </el-table-column>
          <el-table-column prop="trigger_avg" label="人均触发次数"> </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
  import { formatCacheTagDict } from '@/filters';
  import { callback, showChartNoData, checkErrorNoFunc } from '@/common/func';
  import { getTagDicts } from '@/common/auth';
  import echarts from 'echarts/lib/echarts';
  import 'echarts/lib/component/legend';
  import 'echarts/lib/chart/bar';
  import 'echarts/lib/chart/pie';
  import 'echarts/lib/chart/funnel';
  import NoData from '../NoData';
  import {
    barChartOption,
    lineChartOption,
    pieChartOption,
    scatterChartOption,
    thremalChartOption
  } from '@/common/chartOption';

  const modules = ['client_sex', 'age_period', 'open_time', 'corp_risk_level', 'total_stock_trade_balance'];

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
      selectModules: {
        type: Array,
        default: modules
      },
      resultType: {
        type: String,
        // 默认是客群列表 customerGroup
        // 已保存客群列表 customerGroupSaved
        default: 'customerGroup'
      }
    },
    data() {
      return {
        modules,
        sexData: [],
        userSourceData: [],
        preferenceIndustry: [],
        preferenceShare: [],
        behaviorTableData: [],
        isLoading: false,
        timerList: []
      };
    },
    computed: {
      groupSnapshot() {
        const { id, snapshotId } = this;
        return {
          id,
          snapshotId
        };
      }
    },
    watch: {
      id: {
        handler(val) {
          console.log('watch id', val);
          // 若是在 `已保存客群列表`页，则监听不执行
          // if (this.resultType === 'customerGroupSaved') return;
          if (val) {
            this.isLoading = true;
            this.getBehaviorTableData();
            this.loadGroupGraphs();
          }
        },
        immediate: true
      },
      // 在 `已保存客群列表`页，则监听
      groupSnapshot: {
        handler(val) {
          console.log('watch groupSnapshot', val);
          // if (this.resultType === 'customerGroupSaved') {
          //   if (val.id && val.snapshotId) {
          //     this.loadGroupGraphs();
          //     this.getBehaviorTableData();
          //   }
          // }
        },
        immediate: true,
        deep: true
      },
      selectModules: {
        handler(newVal, oldVal) {
          console.log('watch selectModules', newVal, oldVal);
          // this.loadGroupGraphs();
          // this.getBehaviorTableData();
          // if (newVal.length !== oldVal.length) {
          //   this.loadGroupGraphs();
          // }
        },
        immediate: true
      }
    },
    components: {
      NoData
    },
    beforeDestroy() {
      this.clearTimeoutFunc();
    },
    methods: {
      formatGroupType(graphType) {
        let type = '';
        switch (graphType) {
          case '1':
            type = 'client_sex';
            break;
          case '2':
            type = 'age_period';
            break;
          case '3':
            type = 'open_time';
            break;
          case '4':
            type = 'corp_risk_level';
            break;
          case '12':
            type = 'total_stock_trade_balance';
            break;
        }
        return type;
      },
      getGraphsName(value) {
        let type = '';
        switch (value) {
          case 'client_sex':
            type = '性别占比';
            break;
          case 'age_period':
            type = '年龄分布';
            break;
          case 'open_time':
            type = '开户时长';
            break;
          case 'corp_risk_level':
            type = '风险等级';
            break;
          case 'total_stock_trade_balance':
            type = '累计交易额';
            break;
        }
        return type;
      },
      async loadGroupGraphs() {
        Promise.all([
          this.getGroupGraphs('1', 0),
          this.getGroupGraphs('2', 1),
          this.getGroupGraphs('3', 2),
          this.getGroupGraphs('4', 3),
          this.getGroupGraphs('5', 4),
          this.getGroupGraphs('6', 5),
          this.getGroupGraphs('7', 6),
          this.getGroupGraphs('8', 7),
          // this.getGroupGraphs('9'),
          // this.getGroupGraphs('10'),
          this.getGroupGraphs('11', 8),
          this.getGroupGraphs('12', 9)
        ])
          .then((res) => {
            this.isLoading = false;
          })
          .catch((err) => {
            console.log('loadGroupGraphs数据加载异常' + err);
            this.isLoading = false;
          });
      },
      async getGroupGraphs(graphType, index) {
        // 如果此类型系统视图未选中，则不请求数据
        if (this.selectModules.indexOf(this.formatGroupType(graphType)) < 0) {
          return;
        }
        const { id, snapshotId } = this;
        const data = {
          group_id: id,
          graph_type: graphType
        };
        if (this.resultType === 'customerGroupSaved') {
          data.snapshot_id = snapshotId;
        }
        try {
          const res = await this.$services.groupGraphsQry({ data });
          const chart = echarts.init(this.$el.querySelector(`#chart${index}`));
          res &&
            callback(
              res,
              async () => {
                if (res.data && res.data.picType) {
                  this.switchChart(chart, res.data, res.data.picType);
                }
                this.isLoading = false;
              },
              () => {
                this.isLoading = false;
                showChartNoData(chart, res.error_info);
                if (!checkErrorNoFunc(res.error_no)) {
                  const timer = setTimeout(() => {
                    this.getGroupGraphs(graphType, index);
                  }, 3000);
                  this.timerList.push(timer);
                }
              }
            );
        } catch (err) {
          this.isLoading = false;
          console.log('getGroupGraphs err', err);
        }
      },
      /**
       * 切换图表
       */
      switchChart(chart, data, type) {
        const dataList = data.dataList;
        let chartOption = {};
        // 求数据总和，用于算各项占比
        let allValue = 0;
        dataList.forEach((item) => (allValue += Number(item.num)));
        try {
          switch (type) {
            case 10:
              chartOption = barChartOption;
              chartOption.xAxis.data = dataList.map((item) => item.dictName);
              chartOption.series.data = dataList.map((item, index) => {
                return {
                  value: item.num,
                  ratio: ((item.num / allValue) * 100).toFixed(2)
                };
              });
              chart.clear();
              if (allValue <= 0 || isNaN(allValue)) {
                showChartNoData(chart, '暂无数据');
              } else {
                chart.setOption(chartOption);
              }
              break;
            case 11:
              chartOption = lineChartOption;
              chartOption.xAxis.data = dataList.map((item) => item.dictName);
              chartOption.series.data = dataList.map((item, index) => {
                return {
                  value: item.num,
                  ratio: ((item.num / allValue) * 100).toFixed(2)
                };
              });
              chart.clear();
              if (allValue <= 0 || isNaN(allValue)) {
                showChartNoData(chart, '暂无数据');
              } else {
                chart.setOption(chartOption);
              }
              break;
            case 12:
              let allValue = 0;
              chartOption = pieChartOption;
              chartOption.legend.data = dataList.map((item) => item.dictName);
              chartOption.series.data = dataList.map((item) => {
                allValue += item.num;
                return {
                  value: item.num,
                  name: item.dictName
                };
              });
              chart.clear();
              if (allValue <= 0) {
                showChartNoData(chart, '暂无数据');
              } else {
                chart.setOption(chartOption);
              }
              break;
            case 20:
              chartOption = scatterChartOption;
              chartOption.series.data = dataList;
              chart.clear();
              if (!dataList.length) {
                showChartNoData(chart, '暂无数据');
              } else {
                chart.setOption(chartOption);
              }
              break;
            case 21:
              chartOption = thremalChartOption;
              const list = [];
              // 处理轴坐标数据
              data.firstDictName.forEach((i) => {
                data.secondDictName.forEach((j) => {
                  list.push({
                    name: [i, j],
                    value: ''
                  });
                });
              });
              list.forEach((item, index) => {
                item.value = dataList[index];
              });
              chartOption.series.data = list;
              // 处理数据范围
              const sortList = dataList.map((item) => item[2]);
              chartOption.visualMap.min = sortList[0];
              chartOption.visualMap.max = sortList[sortList.length - 1];
              let xTag = '';
              let yTag = '';
              // 获取标签信息作为副标题
              try {
                xTag = data.tagDesc.split(';')[0];
                yTag = data.tagDesc.split(';')[1];
                // chartOption.title.text = `x轴标签：${xTag}，y轴标签：${yTag}`
              } catch (e) {
                console.error('获取标签信息作为副标题异常错误：' + e);
              }
              chart.clear();
              chart.setOption(chartOption);
              break;
          }
        } catch (err) {
          console.log('switch catch', err);
        }
      },
      async getBehaviorTableData() {
        const { id, snapshotId } = this;
        const data = {
          group_id: id
        };
        if (this.resultType === 'customerGroupSaved') {
          data.snapshot_id = snapshotId;
        }
        try {
          const res = await this.$services.groupBehaviorQry({ data });
          res &&
            callback(
              res,
              () => {
                this.behaviorTableData = res.datas;
              },
              () => {
                if (id !== window.CT.CUSTOMER_GROUP_ID) {
                  this.$message({ message: res.error_info, showClose: true });
                }
              }
            );
        } catch (err) {
          console.log('getBehaviorTableData err', err);
        }
      },
      clearTimeoutFunc() {
        this.timerList.forEach((item) => {
          clearTimeout(item);
        });
      }
    }
  };
</script>

<style rel="stylesheet/less" lang="less">
  @import './style.less';
</style>
