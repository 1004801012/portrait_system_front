<template>
  <div class="tag-search-bar">
    <el-input id="search" ref="search" v-model.trim="inputData" class="search" :placeholder="placeholder">
      <div slot="suffix">
        <div>
          <i class="serach-btn iconfont-dmp iconfont-dmp-select" @click="searchTags"></i>
        </div>
      </div>
    </el-input>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    data () {
      return {
        inputData: ''
      }
    },
    computed: {
      placeholder () {
        const project = this.project
        if (project === 'xy' || project === 'xy2') {
          return '请输入指标名称进行查询'
        } else {
          return '请输入标签名称进行查询'
        }
      }
    },
    mounted () {
      document.onkeydown = (e) => {
        if (!e) {
          e = window.event
        }
        if ((e.keyCode || e.which) === 13) {
          if (this.$route.path === '/tags/tagsSearch') {
            this.searchTags()
          }
        }
      }
    },
    methods: {
      searchTags () {
        this.$bus.$emit('SearchTags', this.inputData)
      }
    },
    components: {

    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  .tag-search-bar {
    height: 80px;
    text-align: center;
    background: url('~@/assets/images/gtgk_bg.jpg');
    background-attachment: fixed;
    background-position: center;
    text-align: center;
    .search {
      width: 600px;
      margin-top: 16px;
    }
    .serach-btn {
      width: 72px;
      height: 42px;
      line-height: 42px;
      color: white;
      font-size: 16px;
      border-radius: 21px;
      background-color: #54a7fd;
      cursor: pointer;
    }
    .el-input .el-input__inner {
      height: 48px;
      border-radius: 100px;
      padding-right: 80px;
    }
    .el-input .el-input__suffix {
      right: 3px;
      top: 3px;
    }
    .el-input .iconfont-dmp-select {
      font-size: 20px;
    }
  }
</style>

<style lang="less" rel="stylesheet/less">
  .tag-search-bar {
  }
</style>
