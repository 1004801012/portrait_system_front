<template>
  <div class="spinner">
    <div
      v-if="!showText"
      class="loading"
      :style="{
        height: height + 'px',
        width: width + 'px'
      }">
      <!--snake-->
      <div
        v-if="type == 'snake'"
        class="mint-spinner-snake"
        :style="{
          'border-top-color': color,
          'border-left-color': color,
          'border-bottom-color': color
        }"></div>
      <!--double-bounce-->
      <div v-if="type == 'double-bounce'" class="double-bounce">
        <div class="bounce1" :style="{ backgroundColor: color }"></div>
        <div class="bounce2" :style="{ backgroundColor: color }"></div>
      </div>

      <!--triple-bounce-->
      <div v-if="type == 'triple-bounce'" class="triple-bounce">
        <div class="bounce1" :style="tripleStyle"></div>
        <div class="bounce2" :style="tripleStyle"></div>
        <div class="bounce3" :style="tripleStyle"></div>
      </div>
    </div>
    <span v-else class="text">{{ text }}</span>
  </div>
</template>
<script type="text/babel">
  export default {
    name: 'VSpinner',
    props: {
      type: {
        type: String,
        default: 'snake'
      },
      showText: {
        type: Boolean,
        default: false
      },
      text: {
        type: String,
        default: '查询结果集为空或查询失败'
      },
      width: {
        type: String,
        default: '40'
      },
      height: {
        type: String,
        default: function () {
          return this.width;
        }
      },
      color: {
        type: String,
        default: function () {
          return '#aeaeae';
        }
      }
    },
    computed: {
      tripleSize() {
        return (parseInt(this.width) || 28) / 3 + 'px';
      },
      tripleStyle() {
        return {
          width: this.tripleSize,
          height: this.tripleSize,
          backgroundColor: this.color
        };
      }
    }
  };
</script>

<style scoped lang="less" rel="stylesheet/less">
  @import 'style';
</style>
