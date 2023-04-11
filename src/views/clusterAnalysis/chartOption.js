/**
 * Created by zhangyun21025 on 2018/5/24.
 */
export const option = {
  backgroundColor: '#fff',
  tooltip: {
    show: true,
    formatter: function (params) {
      return params.name
    }
    // formatter: '{b2}: {c2}<br />{b1}: {c1}'
  },
  // 保存为图片
  // toolbox: {
  //  feature: {
  //    saveAsImage: {
  //      iconStyle: {
  //        normal: {
  //          color: '#FFFFFF'
  //        }
  //      }
  //    }
  //  }
  // },
  series: [{
    // name: '聚类分析',
    type: 'wordCloud',
    gridSize: 20,
    sizeRange: [16, 40],
    width: '100%',
    height: '80%',
    // rotationRange: [-45, 90],
    rotationRange: [0, 0],
    shape: 'circle',
    textPadding: 0,
    autoSize: {
      enable: true,
      minSize: 6
    },
    textStyle: {
      normal: {
        // color: function (val) {
        //  return val.data.color;
        // }
        color: function () { // 颜色随机
          return 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160)
          ].join(',') + ')'
        }
      }
      // emphasis: {
      //   shadowBlur: 10,
      //   shadowColor: '#333'
      // }
    }
  }]
}
