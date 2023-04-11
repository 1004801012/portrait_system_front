<template>
  <div class="nodata-card">
    <div class="no-data-content">
      <div class="no-data">{{ datadec }}</div>
    </div>
  </div>
</template>
<script type="text/babel">
  export default {
    name: 'NoData',
    props: {
      datadec: {
        type: String,
        default: '暂无数据~'
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import 'style.less';
</style>
