<template>
  <nav>
    <el-menu
        :collapse="isCollapse"
        background-color="#3A3B6C"
        text-color="#fff"
        active-text-color="#fff"
        :router="true"
        :default-active="defaultActive"
        >
        <menu-detail v-for="item in menuArr" :key="item.permission" class="menu-item" :menuDetail="item" root-class="root-menu"></menu-detail>
    </el-menu>
  </nav>
</template>
<script>
import { Menu } from 'element-ui'
import MenuDetail from './menuDetail'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      defaultActive: ''
    }
  },
  props: {
    isCollapse: Boolean
  },
  methods: {
    redirectOther () {
      window.open(`${window.LOCAL_CONFIG.API_HOME}/experience/${this.userInfo.appId}`)
    }
  },
  watch: {
    $route: {
      handler () {
        this.defaultActive = this.$route.path
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters(['menuArr', 'userInfo'])
  },
  components: {
    ElMenu: Menu,
    MenuDetail
  }
}
</script>
<style scope="scope" lang="less">
 @import "style.less";
</style>
