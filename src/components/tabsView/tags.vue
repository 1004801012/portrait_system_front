<template>
 <div class="tag-container" @click="jumpPage" :class="{'current-tag': isCur}">
   <span v-if="tagMsg.name !== 'index'" class="tag-text">{{tagMsg.meta.menuName}}</span>
   <span v-else><span class="iconshouye" :class="iconfontBaseName"></span></span>
   <i class="el-icon-close" @click.stop="closeTags" v-if="tagMsg.name !== 'index'"></i>
 </div>
</template>

<script>
import { mapMutations } from 'vuex'
export default {
  name: 'tags',
  data () {
    return {}
  },
  props: {
    isCur: Boolean,
    tagMsg: Object
  },
  methods: {
    jumpPage () {
      if (this.isCur) {
        return
      }
      this.$store.state.tabsView.tabsArray.forEach(item => {
        item.meta.isCur = item.path === this.tagMsg.path
      })
      this.$router.push(this.tagMsg.path)
    },
    closeTags () {
      this.delConfirmTabs(this.tagMsg)
    },
    ...mapMutations('tabsView', ['delConfirmTabs'])
  }
}
</script>

<style scoped lang="less">
@import "style.less";
</style>
