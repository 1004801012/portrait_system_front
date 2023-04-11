/*
 * @Author: Tengteng
 * @Date: 2019-06-20 15:35:14
 * @Last Modified by: Tengteng
 * @Last Modified time: 2019-07-11 11:32:18
 */

/* 客群视图共享图表配置文件 */

export const barChartOption = {
  color: ['#54a7fd'],
  tooltip: {
    trigger: 'axis',
    formatter: function (param) {
      return `
        <p style="text-align: left;">X轴：${param[0].name}</p>
        <p style="text-align: left;">数值：${param[0].value}</p>
        <p style="text-align: left;">占比：${param[0].data.ratio}%</p>
        `;
    }
  },
  grid: {
    top: '5%',
    bottom: '5%',
    left: '3%',
    right: '3%',
    containLabel: true
  },
  xAxis: {
    show: true,
    type: 'category',
    data: [],
    axisLine: {
      show: false
    },
    axisTick: {
      show: false,
      alignWithLabel: true
    },
    axisLabel: {
      color: '#999999'
    },
    nameTextStyle: {
      color: '#666666'
    },
    splitLine: {
      lineStyle: {
        color: '#54a7fd',
        type: 'dashed'
      }
    }
  },
  yAxis: {
    show: true,
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#999999'
    },
    splitLine: {
      lineStyle: {
        color: '#54a7fd',
        type: 'dashed'
      }
    },
    type: 'value'
  },
  series: {
    name: '',
    type: 'bar',
    barWidth: '10%',
    data: []
  }
};

export const lineChartOption = {
  color: ['#54a7fd'],
  tooltip: {
    trigger: 'axis',
    formatter: function (param) {
      return `
        <p style="text-align: left;">X轴：${param[0].name}</p>
        <p style="text-align: left;">数值：${param[0].value}</p>
        <p style="text-align: left;">占比：${param[0].data.ratio}%</p>
        `;
    }
  },
  grid: {
    height: '85%',
    left: '3%',
    right: '4%',
    bottom: '5%',
    containLabel: true
  },
  xAxis: {
    show: true,
    type: 'category',
    data: [],
    axisLine: {
      show: false
    },
    axisLabel: {
      color: '#999999'
    },
    axisTick: {
      show: false,
      alignWithLabel: true
    },
    nameTextStyle: {
      color: '#666666'
    },
    splitLine: {
      lineStyle: {
        color: '#54a7fd',
        type: 'dashed'
      }
    }
  },
  yAxis: {
    show: true,
    axisLine: {
      show: false
    },
    axisLabel: {
      color: '#999999'
    },
    axisTick: {
      show: false
    },
    splitLine: {
      lineStyle: {
        color: '#54a7fd',
        type: 'dashed'
      }
    },
    type: 'value'
  },
  series: {
    name: '',
    type: 'line',
    stack: '总量',
    data: []
  }
};

export const pieChartOption = {
  color: ['#36cbcb', '#975fe4', '#facd19', '#F1627A', '#64a0f6', '#ff8866', '#DF45D7', '#A7E253', '#7BDEFD', '#5E5E5E'],
  tooltip: {
    trigger: 'item',
    formatter: '{b} <br/> 数值: {c} <br/> 占比: {d}%'
  },
  legend: {
    orient: 'vertical',
    right: '10%',
    top: 'center',
    itemGap: 15,
    textStyle: {
      color: '#666666'
    },
    data: []
  },
  xAxis: {
    show: false
  },
  yAxis: {
    show: false
  },
  series: {
    name: '',
    type: 'pie',
    center: ['30%', '50%'],
    radius: ['40%', '80%'],
    data: [],
    itemStyle: {
      emphasis: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    label: {
      normal: {
        show: false
      },
      emphasis: {
        show: false
      }
    },
    labelLine: {
      show: false
    }
  }
};

export const scatterChartOption = {
  color: ['#cf65fd'],
  tooltip: {
    trigger: 'item'
  },
  grid: {
    top: '8%',
    left: '3%',
    right: '5%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    show: true,
    type: 'category',
    axisLine: {
      lineStyle: {
        color: '#666'
      }
    },
    axisLabel: {
      color: '#666'
    }
  },
  yAxis: {
    show: true,
    type: 'value',
    axisLine: {
      lineStyle: {
        color: '#666'
      }
    },
    axisLabel: {
      color: '#666'
    }
  },
  series: {
    symbolSize: 20,
    data: [],
    type: 'scatter'
  }
};

export const thremalChartOption = {
  tooltip: {
    trigger: 'item',
    position: 'bottom',
    formatter: function (param) {
      return `
        <p style="text-align: left;">X轴：${param.name[0]}</p>
        <p style="text-align: left;">Y轴：${param.name[1]}</p>
        <p style="text-align: left;">数值：${param.value[2]}</p>
        `;
    }
  },
  animation: false,
  grid: {
    height: '78%',
    left: '3%',
    right: '3%',
    bottom: '18%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    axisLine: {
      lineStyle: {
        color: '#666'
      }
    },
    axisLabel: {
      color: '#666'
    },
    splitArea: {
      show: true
    }
  },
  yAxis: {
    type: 'category',
    axisLine: {
      lineStyle: {
        color: '#666'
      }
    },
    axisLabel: {
      color: '#666'
    },
    splitArea: {
      show: true
    }
  },
  visualMap: {
    min: 0,
    max: 10,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '5%',
    color: ['#CF65FD', '#64A0F6']
  },
  series: {
    name: '',
    type: 'heatmap',
    data: [],
    label: {
      normal: {
        show: true
      }
    },
    itemStyle: {
      emphasis: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }
};
export const optionTarget = {
  title: {
    textStyle: {
      height: 12,
      fontSize: 14,
      lineHeight: 12,
      fontWeight: 500,
      color: '#333'
    },
    padding: [10, 0, 0, 16]
  },
  color: ['#1890FF', '#00C6C4', '#00C54C', '#FFCA00', '#FF3160', '#FE9750', '#2CBFF0', '#F02CE9'],
  animation: false,
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 30,
    data: [],
    bottom: 0
  },
  grid: {
    left: '1.6%',
    right: '4%',
    bottom: '8%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    scale: true,
    boundaryGap: false,
    axisLine: {
      show: false,
      lineStyle: {
        type: 'solid',
        color: '#999', // x线的颜色
        width: '1' // 坐标线的宽度
      }
    },
    axisTick: {
      show: false
    },
    splitLine: { show: false },
    axisPointer: {
      z: 100
    },
    data: []
  },
  yAxis: [
    {
      type: 'value',
      splitNumber: 5,
      offset: 0,
      axisTick: {
        show: false
      },
      axisLine: {
        show: false,
        lineStyle: {
          type: 'solid',
          color: '#999', // x线的颜色
          width: '1' // 坐标线的宽度
        }
      },
      splitLine: {
        show: true, // 保留网格线
        lineStyle: {
          // y轴网格线设置
          color: '#eee',
          height: 2,
          type: 'solid'
        }
      }
    }
  ],
  series: [
    {
      name: '',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      data: [],
      yAxisIndex: 0
    }
  ]
};
