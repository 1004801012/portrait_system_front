<template>
  <div class="chart-panel">
    <!-- 标题 -->
    <div class="head">
      <p class="title">
        {{ groupName }}
        <span class="tag">{{ usersTotalCount }}人</span>
      </p>
    </div>

    <!-- 表单 -->
    <div class="content">
      <div class="group-card">
        <div class="content">
          <div id="normalChart" class="chart"></div>
        </div>
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
  import {
    barChartOption,
    lineChartOption,
    pieChartOption,
    scatterChartOption,
    thremalChartOption,
    optionTarget
  } from '@/common/chartOption.js';

  let chart = null;

  export default {
    props: {
      param: {
        type: Object
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
      currentTime: {
        type: Number
      }
    },
    data() {
      return {
        value: '',
        sexData: [],
        userSourceData: [],
        timerList: []
      };
    },
    watch: {
      currentTime: {
        handler: function (newVal) {
          this.getGroupGraphs(this.param);
        },
        immediate: true
      }
    },
    created() {},
    mounted() {},
    beforeDestroy() {
      this.clearTimeoutFunc();
    },
    methods: {
      formatGroupType(graphType) {
        let type = '';
        switch (graphType) {
          case 'client_sex':
            type = '1';
            break;
          case 'age_group':
            type = '2';
            break;
          case 'open_length_level':
            type = '3';
            break;
          case 'corp_risk_level':
            type = '4';
            break;
          case 'client_asset_level':
            type = '5';
            break;
          case 'income_level':
            type = '6';
            break;
          case 'op_entrust_way_preference':
            type = '7';
            break;
          case 'stock_commission_offer':
            type = '11';
            break;
          case 'stock_trade_balance':
            type = '12';
            break;
        }
        return type;
      },
      /**
       * 获取图表数据
       */
      async getGroupGraphs(graphType) {
        const { id } = this;
        const data = {
          group_id: id,
          graph_type: this.formatGroupType(graphType)
        };
        try {
          const res = await this.$services.groupGraphsQry({ data });
          chart = echarts.init(this.$el.querySelector('#normalChart'));
          res &&
            callback(
              res,
              async () => {
                if (res.data && res.data.picType) {
                  this.switchChart(res.data, res.data.picType);
                }
              },
              () => {
                showChartNoData(chart, res.error_info);
                if (!checkErrorNoFunc(res.error_no)) {
                  const timer = setTimeout(() => {
                    this.getGroupGraphs(graphType);
                  }, 3000);
                  this.timerList.push(timer);
                }
              }
            );
        } catch (err) {
          console.log('getGroupGraphs err', err);
        }
      },
      /**
       * 切换图表
       */
      switchChart(data, type) {
        const dataList = data.dataList;
        let chartOption = {};
        // 求数据总和，用于算各项占比
        let allValue = 0;
        dataList instanceof Array && dataList.forEach((item) => (allValue += Number(item.num)));
        switch (type) {
          case 10:
            chartOption = barChartOption;
            chartOption.xAxis.data = dataList.map((item) => item.dictName);
            chartOption.series.data = dataList.map((item, index) => {
              return {
                value: item.num,
                ratio: !allValue ? 0 : ((item.num / allValue) * 100).toFixed(2)
              };
            });
            chart.clear();
            if (allValue <= 0 || isNaN(allValue)) {
              showChartNoData(chart, '暂无数据');
            } else {
              chart.setOption(chartOption);
            }
            // chart.setOption(chartOption)
            break;
          case 11:
            chartOption = lineChartOption;
            chartOption.xAxis.data = dataList.map((item) => item.dictName);
            chartOption.series.data = dataList.map((item, index) => {
              return {
                value: item.num,
                ratio: !allValue ? 0 : ((item.num / allValue) * 100).toFixed(2)
              };
            });
            chart.clear();
            if (allValue <= 0 || isNaN(allValue)) {
              showChartNoData(chart, '暂无数据');
            } else {
              chart.setOption(chartOption);
            }
            // chart.setOption(chartOption)
            break;
          case 12:
            // 深拷贝
            chartOption = JSON.parse(JSON.stringify(pieChartOption));
            chartOption.legend.right = '45%';
            chartOption.legend.icon = 'circle';
            chartOption.legend.itemWidth = 8;
            chartOption.legend.itemHeight = 8;
            chartOption.legend.data = dataList.map((item) => item.dictName);
            chartOption.series.data = dataList.map((item) => {
              allValue += item.num;
              return {
                value: item.num,
                name: item.dictName
              };
            });
            chart.clear();
            if (allValue <= 0 || isNaN(allValue)) {
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
          case 100:
            const dataListCurrent = dataList || {};
            console.log('dataListCurrent: ', dataListCurrent);
            chartOption = optionTarget;
            const arr = [];
            const dates = Object.keys(dataListCurrent).filter((key) => key);
            dates.forEach((key) => {
              const dataInfo = dataListCurrent[key] || {};
              if (data.subEntry) {
                arr.push({
                  0: dataInfo.count || ''
                });
              } else {
                arr.push({
                  0: dataInfo.max || '0',
                  1: dataInfo.avg || '0',
                  2: dataInfo.min || '0',
                  3: dataInfo.median || '0',
                  4: dataInfo.count || '0'
                });
              }
            });
            const legendTitle = {
              0: '最大值',
              1: '平均值',
              2: '最小值',
              3: '中位数',
              4: '总和'
            };
            data.subEntry && (legendTitle[0] = '总和');
            const seriesTarget = [];
            chartOption.legend.data = [];
            if (arr && arr.length > 0) {
              Object.keys(arr[0]).forEach((key) => {
                chartOption.legend.data.push(legendTitle[key]);
              });
              chartOption.legend.data.forEach((item, index) => {
                const obj = {
                  name: item,
                  type: 'line',
                  symbol: 'circle',
                  symbolSize: 5,
                  data: [],
                  yAxisIndex: 0
                };
                arr.forEach((o) => {
                  (o && o[index] && obj.data.push(o[index])) || obj.data.push(null);
                });
                seriesTarget.push(obj);
              });
              chartOption.legend.show = !data.subEntry;
              chartOption.xAxis.data = dates.map(
                (date) =>
                  (date &&
                    date.length === 8 &&
                    date.substring(0, 4) + '.' + date.substring(4, 6) + '.' + date.substring(6)) ||
                  date
              );
              chartOption.series = seriesTarget;
              chart && chart.clear();
            }
            if (!arr.length) {
              showChartNoData(chart, '暂无数据');
            } else {
              chart && chart.setOption(chartOption);
              chart && chart.resize();
            }
            break;
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

<style lang="less" rel="stylesheet/less" scoped>
  @import 'style';
</style>
