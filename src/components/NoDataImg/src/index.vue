<template>
  <div class="nodata-card">
<!--    <img src="~@/assets/img/images" alt="">-->
    <span class="text">{{ datadec }}</span>
  </div>
</template>
<script type="text/babel">
export default {
  name: 'NoData',
  props: {
    datadec: {
      type: String,
      default: '暂无数据'
    }
  }
}
</script>

<style lang="less" rel="stylesheet/less" scoped>
@import "style.less";
</style>
