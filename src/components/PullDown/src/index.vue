<template>
  <div class="pulldown-card">
    <div v-click-outside="closeSelect" class="pull-select" @click="changeSelect">
      <!--<input type="text" v-model="chooseTitle" @focus="changeSelect" readonly="readonly">-->
      <span class="title">{{ chooseTitles }}</span>
      <i class="iconfont-dmp iconfont-dmp-solid-triangle" :class="{ up: showSelectDown, down: !showSelectDown }"></i>
    </div>
    <div v-if="showSelectDown" class="down-select">
      <ul>
        <li
          v-for="(item, i) in downList"
          v-if="downList.length > 0"
          :key="item"
          :class="{ choose: i == choseIndexs }"
          @click="chooseIndexFunc(item, i)">
          {{ item }}
        </li>
        <li v-if="downList.length == 0">暂无数据</li>
      </ul>
    </div>
  </div>
</template>
<script type="text/babel">
  import VClickOutside from 'v-click-outside';
  export default {
    props: ['chooseTitle', 'choseIndex', 'downList', 'showSelectDown'],
    data() {
      return {
        choseIndexs: this.choseIndex || 0,
        chooseTitles: this.chooseTitle || this.downList[0]
      };
    },
    watch: {},
    mounted() {},
    directives: {
      clickOutside: VClickOutside.directive
    },
    methods: {
      chooseIndexFunc(i, j) {
        this.chooseTitles = i;
        this.choseIndexs = j; // 下拉选择项
        this.$emit('chooseIndex', i, j);
      },
      changeSelect() {
        this.showSelectDown = !this.showSelectDown;
      },
      closeSelect() {
        this.showSelectDown = false;
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import 'style.less';
</style>
