/**
 * Created by zhangyun21025 on 2018/5/24.
 */
export default {
  backgroundColor: '#fff',
  tooltip: {
    show: true,
    formatter: function (params) {
      return params.name
    }
  },
  series: [{
    type: 'wordCloud',
    shape: 'circle',
    gridSize: 20,
    sizeRange: [16, 40],
    width: '100%',
    height: '100%',
    rotationRange: [0, 0],
    textPadding: 0,
    autoSize: {
      enable: true,
      minSize: 6
    },
    textStyle: {
      normal: {
        color: function () { // 颜色随机
          return 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160)
          ].join(',') + ')'
        }
      }
    }
  }]
}
