<template>
  <div class="tabs-view-container clearfix">
    <div class="tag-operation tag-left fl" @click="tagTurnLeft"><span class="iconzuoshuangjiantou" :class="iconfontBaseName"></span>
    </div>
    <div id="tagViewContainer" class="tag-view-container fl">
      <div class="tag-position-change" id="tagPositionChange" :style="tagPositionStyle">
        <div class="tag-item" @contextmenu.prevent="tabOperation(item, $event)" v-for="(item, index) in tabsArray"
             :key="index" :attr-url="item.path">
          <tags :isCur="item.meta.isCur" :tagMsg="item"></tags>
        </div>
      </div>
    </div>
    <div class="tag-operation tag-right fl" @click="tagTurnRight"><span class="iconyoushuangjiantou"  :class="iconfontBaseName"></span>
    </div>
    <ul class="h-tag-close-tip" :style="styles" v-clickoutside="handlerhide">
      <li class="h-tag-close-tip-item" @click.stop.prevent="handleCloseCurrent()" v-if="currentCloseFlag">
        <span>关闭当前选项卡</span>
      </li>
      <li class="h-tag-close-tip-item" @click.stop.prevent="handleCloseAll()">
        <span>关闭全部选项卡</span>
      </li>
      <li class="h-tag-close-tip-item" @click.stop.prevent="handleCloseOther()">
        <span>关闭当前以外选项卡</span>
      </li>
    </ul>
  </div>
</template>

<script>
import Tags from './tags'
import clickoutside from '@/directive/clickoutside'
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'index',
  data () {
    return {
      styles: {},
      currentTagPath: '',
      currentTag: {},
      tagPositionStyle: {
        left: '0px'
      }
    }
  },
  methods: {
    tabOperation (item, event) {
      this.currentTagPath = item.path
      this.currentTag = item
      this.styles = {
        display: 'block',
        top: `${event.clientY}px`,
        left: `${event.clientX}px`
      }
    },
    handlerhide () {
      this.styles = {}
    },
    handleCloseAll () {
      this.delAllTabs()
      this.$router.push('/')
      this.handlerhide()
      this.tagPositionStyle = { left: '0px' }
    },
    handleCloseCurrent () {
      this.delConfirmTabs(this.currentTag)
      this.handlerhide()
    },
    handleCloseOther () {
      this.delOtherTabs(this.currentTag)
      this.tagPositionStyle = { left: '0px' }
      this.handlerhide()
    },
    tagTurnLeft () {
      const OperationDom = document.querySelector('#tagViewContainer') //  dom容器
      const containerWidth = OperationDom.offsetWidth //  操作dom的宽度
      const currentOffsetLeft = Number(this.tagPositionStyle.left.replace('px', '')) //  当前的left值
      const tagsDomWidthArr = [...OperationDom.querySelectorAll('.tag-item')].map(item => item.offsetWidth) //  每个tag的宽度
      if (Math.abs(currentOffsetLeft) < containerWidth) {
        this.tagPositionStyle = { left: '0px' }
      } else {
        const targetLeft = currentOffsetLeft + containerWidth //  应滚动width
        let total = 0
        for (let i = 0, length = tagsDomWidthArr.length; i < length; i++) {
          if (Math.abs(targetLeft) < total) {
            total -= tagsDomWidthArr[i - 1]
            break
          } else {
            total += tagsDomWidthArr[i]
          }
        }
        this.tagPositionStyle = { left: `-${total}px` }
      }
    },
    tagTurnRight () {
      const OperationDom = document.querySelector('#tagViewContainer') //  dom容器
      const containerWidth = OperationDom.offsetWidth //  操作dom的width
      const currentOffsetLeft = Number(this.tagPositionStyle.left.replace('px', '')) //  当前偏移量
      const tagArr = [...OperationDom.querySelectorAll('.tag-item')] //  taglist
      const tagDomWidthArr = tagArr.map(item => item.offsetWidth) //  tag宽度list
      const tagTotalWidth = tagDomWidthArr.reduce((total, item) => {
        return total + item
      }, 0) //  tag总长度
      const tagsDomWidthArr = [...OperationDom.querySelectorAll('.tag-item')].map(item => item.offsetWidth) //  每个tag的宽度list
      if (containerWidth >= tagTotalWidth) {
        //  如果总宽度小于容器width，left为0
        this.tagPositionStyle = { left: '0px' }
      } else if (tagTotalWidth <= containerWidth + Math.abs(currentOffsetLeft)) {
        //  不做操作
      } else {
        const targetLeft = Math.abs(currentOffsetLeft) + containerWidth //  应滚动width
        //  计算当前在哪个tag
        let total = 0
        for (let i = 0, length = tagDomWidthArr.length; i <= length; i++) {
          if (total < targetLeft) {
            total += tagsDomWidthArr[i] || 0
          } else {
            total -= tagsDomWidthArr[i - 1]
            break
          }
        }

        this.tagPositionStyle = { left: `${-total}px` }
      }
    },
    ...mapMutations('tabsView', ['delAllTabs', 'delConfirmTabs', 'delOtherTabs'])
  },
  watch: {
    $route: {
      handler () {
        this.$nextTick(() => {
          const containerDom = document.querySelector('#tagViewContainer') //  操作的dom
          const containerWidth = containerDom.offsetWidth //  操作dom的width
          const tagArr = [...containerDom.querySelectorAll('.tag-item')] //  taglist
          const tagDomWidthArr = tagArr.map(item => item.offsetWidth) //  tag宽度list
          const curTag = tagArr.find(item => item.getAttribute('attr-url') === this.$route.path)
          const arrIndex = tagArr.indexOf(curTag) //  第几个tag，从0开始
          const currentOffsetLeft = Number(this.tagPositionStyle.left.replace('px', '')) //  当前的left值,复数
          let frontWidthTotal = 0 //  当前dom前置dom的width和
          for (let i = 0; i < arrIndex; i++) {
            frontWidthTotal += tagDomWidthArr[i]
          }
          if (frontWidthTotal === 0) {
            //  访问首页
            this.tagPositionStyle = { left: '0px' }
          } else if (frontWidthTotal < Math.abs(currentOffsetLeft)) {
            //  如果left值大于前面dom和，说明该dom在页面左侧，左对齐
            this.tagPositionStyle = { left: `${-frontWidthTotal}px` }
          } else if (frontWidthTotal >= Math.abs(currentOffsetLeft) + containerWidth || Math.abs(currentOffsetLeft) + containerWidth - frontWidthTotal <= curTag.offsetWidth) {
            //  如果前面dom长度大于left偏移量绝对值 + 容器宽度，说明dom在页面右侧，右对齐
            this.tagPositionStyle = { left: `${-(frontWidthTotal - containerWidth + curTag.offsetWidth)}px` }
          }
        })
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters(['tabsArray']),
    currentCloseFlag () {
      return this.currentTagPath !== '/index'
    }
  },
  directives: {
    clickoutside
  },
  components: {
    Tags
  }
}
</script>

<style scoped lang="less">
  @import "style.less";
</style>
