<template>
  <div class="nav-header-container clearfix">
    <div class="operate-button-container fl clearfix">
      <div class="logo-container fl"
           :class="{ 'collapse-title-container': isCollapse, 'shirk-title-container': !isCollapse && !isFirstTime }">
        <img :src="systemLogoSrc" />
        <span>画像系统</span>
      </div>
      <ul class="flex-container">
        <li class="menu-shirk-button" @click="changeLeftMenu"><div :class="{ 'rotate-button-container': isCollapse}"></div></li>
        <li class="menu-refresh-button" @click="refreshRouter"></li>
        <li class="menu-search-button" v-if="false"></li>
      </ul>
    </div>
    <div class="personal-container fr flex-container">
      <div class="personal-item message-button" v-if="false">
      </div>
      <div class="personal-item user-message">
        <span class="user-name">{{userInfo.nickname}}</span>
        <ul class="slice-down-menu">
          <li @click="changePassword">修改密码</li>
<!--          <li @click="changeUser">修改资料</li>-->
        </ul>
      </div>
      <div class="personal-item logout" @click="logout">
        <span>退出登陆</span>
      </div>
    </div>

    <change-password-msg-box
        ref="dialog"
        :visible.sync="changePasswordVisible">
    </change-password-msg-box>
    <change-user-msg-msg-box
      :visible.sync="changeUserMsgVisible"
      ref="userDialog"
    ></change-user-msg-msg-box>
  </div>
</template>
<script>
import { removeToken } from '@/utils/auth'
import { mapGetters } from 'vuex'
import ChangePasswordMsgBox from './changePasswordMsgBox'
import ChangeUserMsgMsgBox from './changeUserMsgMsgBox'

export default {
  data () {
    return {
      drawer: false,
      direction: 'rtl',
      versionMsg: {},
      changePasswordVisible: false,
      changeUserMsgVisible: false,
      systemLogoSrc: require('@/assets/images/icon/system-logo.png')
    }
  },
  props: {
    isCollapse: Boolean,
    isFirstTime: Boolean
  },
  methods: {
    changeLeftMenu () {
      this.$emit('update:isCollapse', !this.isCollapse)
      if (this.isFirstTime) {
        this.$emit('update:isFirstTime', false)
      }
    },
    logout () {
      removeToken()
      window.location.reload()
    },
    refreshRouter () {
      this.$emit('reload')
    },
    changePassword () {
      this.changePasswordVisible = true
    },
    changeUser () {
      this.changeUserMsgVisible = true
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  components: {
    ChangePasswordMsgBox,
    ChangeUserMsgMsgBox
  }
}
</script>
<style>
  .el-drawer {
    width: 460px !important;
    padding: 0 40px;
  }
  .el-drawer__header {
    color: rgba(36, 36, 36, 1);
    font-size: 18px;
    padding-bottom: 14px;
    margin-bottom: 21px;
    border-bottom: 1px solid rgba(239,239,239,1);
  }
  .version-item {
    display: flex;
  }
  .version-item label {
    flex-basis: 100px;
    text-align: right;
    color: rgba(102, 102, 102, 1);
    margin-bottom: 11px;
  }
  .version-item label:last-child {
    margin-bottom: 0;
  }
</style>
<style scope="scope" lang="less">
  @import "style";
</style>
