<template>
  <div class="pie">
    <div :id="id" :class="className" :style="{ height: height, width: width }"></div>
    <div class="mark">注：数据采用T-1日 单位（元）</div>
  </div>
</template>
<script>
  import { addChineseUnit } from 'cloud-utils';
  import echarts from 'echarts/lib/echarts';
  import 'echarts/lib/chart/pie';
  import 'echarts/lib/component/tooltip';
  import 'echarts/lib/component/title';
  import 'echarts/lib/component/legend';

  const padEnd = function (source, targetLength, padString) {
    targetLength = targetLength >> 0; // floor if number or convert non-number to 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    if (source.length > targetLength) {
      return String(source);
    } else {
      targetLength = targetLength - source.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); // append to original to ensure we are longer than needed
      }
      return String(source) + padString.slice(0, targetLength);
    }
  };

  export default {
    props: {
      className: {
        type: String,
        default: 'pieChart'
      },
      id: {
        type: String,
        default: 'pieChart'
      },
      width: {
        type: String,
        default: '1100px'
      },
      height: {
        type: String,
        default: '400px'
      },
      category: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        chart: null,
        _category: {}
      };
    },
    mounted() {},
    beforeDestroy() {
      if (!this.chart) {
        return;
      }
      this.chart.dispose();
      this.chart = null;
    },
    watch: {
      category: {
        // deep: true,
        handler() {
          if (this.category.categoryTitle) {
            console.log('======>', this.category);
            this.initChart();
          }
        }
      }
    },
    methods: {
      initChart() {
        this.chart = echarts.init(document.getElementById(this.id));
        this.category.categoryTitle.map((v, index) => {
          v['name'] = padEnd(v['name'], 4, '\u3000');
        });

        const option = {
          title: {
            text: '资产视图',
            x: 'center',
            y: 'center',
            textStyle: {
              fontWeight: 600,
              fontSize: 14,
              color: '#3c4858'
            }
          },
          tooltip: {
            trigger: 'item',
            // formatter: '{b} : {c} <br/>({d}%)'
            formatter: function (param) {
              const data = param.data;
              return data.name + ' :' + data.value + '<br/>' + data.proportion + '%';
            }
          },

          color: ['#1D4894', '#FB497C', '#FFC760', '#6FE621', '#1D4894'],
          legend: [
            {
              orient: 'vertical',
              left: '0px',
              top: 'center',
              icon: 'circle',
              itemGap: 20,
              textStyle: {
                color: '#999',
                fontSize: 16,
                width: 250,
                rich: {
                  style: {
                    color: '#FF8866',
                    width: 90,
                    fontSize: 16,
                    align: 'left',
                    padding: [0, 0, 0, 10]
                  }
                }
              },
              data: ['现金资产', '证券市值'],
              formatter: function (name) {
                const oa = option.series[0].data;
                for (let i = 0; i < option.series[0].data.length; i++) {
                  if (name === oa[i].name) {
                    return name + '{style|' + addChineseUnit(oa[i].value) + '元}' + '{style|' + oa[i].proportion + '}';
                  }
                }
              }
            },
            {
              orient: 'vertical',
              left: 'right',
              top: 'center',
              icon: 'circle',
              itemGap: 20,
              textStyle: {
                color: '#999',
                fontSize: 16,
                width: 250,
                rich: {
                  style: {
                    color: '#FF8866',
                    width: 90,
                    fontSize: 16,
                    lineHeight: 10,
                    align: 'left',
                    padding: [0, 0, 0, 10]
                  }
                }
              },
              align: 'left',
              data: ['场外资产', '在途资产', '资金占比'],
              formatter: function (name) {
                const oa = option.series[0].data;
                for (let i = 0; i < option.series[0].data.length; i++) {
                  if (name === oa[i].name) {
                    return name + '{style|' + addChineseUnit(oa[i].value) + '元}' + '{style|' + oa[i].proportion + '}';
                  }
                }
              }
            }
          ],
          calculable: true,
          series: [
            {
              name: '资产视图',
              type: 'pie',
              selectedMode: 'single',
              startAngle: 0,
              radius: ['20%', '80%'],
              center: ['50%', '50%'],
              // minAngle: 30,
              //              roseType: 'radius',
              label: {
                normal: {
                  // position: 'inner',
                  formatter: function (param) {
                    const data = param.data;
                    return data.proportion;
                  }
                },
                emphasis: {
                  show: true,
                  textStyle: {
                    fontSize: '16',
                    fontWeight: 'bold'
                  }
                }
              },
              labelLine: {
                normal: {
                  show: true
                },
                emphasis: {
                  show: true
                }
              },
              itemStyle: {
                normal: {
                  // borderColor: '#FFF',
                  borderWidth: '0'
                },
                emphasis: {
                  // borderColor: '#FFF',
                  borderWidth: '0'
                }
              },
              data: this.category.categoryTitle
            }
          ]
        };
        console.log('option', option);
        this.chart.setOption(option);
      }
    }
  };
</script>
<style lang="less" rel="stylesheet/less" scoped>
  @import 'style';

  .pie {
    .mark {
      width: 100%;
      text-align: center;
      font-size: 14px;
      color: #999;
    }
  }
</style>
