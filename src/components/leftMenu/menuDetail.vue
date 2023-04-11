<template>
  <div :class="rootClass">
    <el-submenu v-if="menuDetail.childMenus.length > 0  && JSON.parse(menuDetail.extend).leftMenu !== 0" :index="menuDetail.id">
      <template slot="title">
        <i class="menu-icon" :class="[iconfontBaseName, menuDetail.icon]" v-if="menuDetail.icon !== null"></i>
        <span>{{menuDetail.name}}</span>
      </template>
      <menu-detail v-for="item in menuDetail.childMenus" :menuDetail="item" :key="item.permission"></menu-detail>
    </el-submenu>
    <el-menu-item v-if="menuDetail.childMenus.length === 0 && JSON.parse(menuDetail.extend).leftMenu !== 0" :index="menuDetail.url">
      <i class="menu-icon" :class="[menuDetail.icon, iconfontBaseName]" v-if="menuDetail.icon !== null"></i>
      <span slot="title">{{menuDetail.name}}</span>
    </el-menu-item>
  </div>
</template>
<script>
import { Submenu, MenuItem } from 'element-ui'

export default {
  name: 'MenuDetail',
  data () {
    return {}
  },
  props: {
    menuDetail: Object,
    rootClass: {
      type: String,
      default: ''
    }
  },
  methods: {},
  components: {
    ElSubmenu: Submenu,
    ElMenuItem: MenuItem
  }
}
</script>
<style>
 .el-menu--collapse>.root-menu>.el-submenu>.el-submenu__title .el-submenu__icon-arrow {
    display: none;
  }

   .el-menu--collapse>.root-menu>.el-submenu>.el-submenu__title span {
    height: 0;
    width: 0;
    overflow: hidden;
    visibility: hidden;
    display: inline-block;
  }
</style>
<style scope="scope" lang="less">
  @import "./style.less";
</style>
