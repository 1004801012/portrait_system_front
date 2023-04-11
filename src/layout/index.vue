<template>
  <div class="main-container">
    <div class="left-menu-container"
         :class="{'collapse-menu': isCollapse, 'collapse-animate-menu': !isFirstTime && !isCollapse}">
      <!-- 隐藏滚动条 -->
      <div class="left-menu-scroller-container">
        <left-menu :isCollapse="isCollapse"></left-menu>
      </div>
    </div>
    <div class="header-container">
      <nav-header
        :isCollapse.sync="isCollapse"
        :isFirstTime.sync="isFirstTime"
        @reload="reload"
      ></nav-header>
    </div>
    <div class="menu-tab"
         :class="{'collapse-menu-tab': isCollapse, 'collapse-animate-menu-tab': !isFirstTime && !isCollapse}">
      <tabs-view @pageJump="pageJump"></tabs-view>
    </div>
    <div class="main-content-container"
         :class="{'collapse-main-container': isCollapse, 'collapse-animate-container': !isFirstTime && !isCollapse}">
      <div class="main-root" v-if="!refreshFlag">
        <router-view v-if="!$route.meta.keepAlive"></router-view>
        <keep-alive :include="keepAliveList">
          <router-view v-if="$route.meta.keepAlive"></router-view>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import LeftMenu from '@components/leftMenu'
import NavHeader from '@components/navHeader'
import TabsView from '@components/tabsView'
import { mapGetters } from 'vuex'
import { SECONDS } from '@/constant'

export default {
  data () {
    return {
      isCollapse: false,
      isFirstTime: true, //  判断是否第一次加载确定是否加载动画
      keepAliveList: [],
      refreshFlag: false
    }
  },
  methods: {
    pageJump (item) {
      if (item) {
        this.$router.push(item.description)
      }
    },
    reload () {
      this.refreshFlag = true
      this.$nextTick(() => {
        this.refreshFlag = false
      })
    }
  },
  watch: {
    tabsArray: {
      handler () {
        this.keepAliveList = []
        this.tabsArray.forEach(item => {
          if (item.name !== 'index') {
            this.keepAliveList.push(item.name.replace(/\//g, '-'))
          }
        })
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters(['tabsArray'])
  },
  components: {
    LeftMenu,
    NavHeader,
    TabsView
  }
}
</script>

<style scoped lang="less">
@import "style";
</style>
