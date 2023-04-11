<template>
  <div class="customer-group-list">
    <header>
      <span>客群</span>
      <router-link to="/groupAdd"><i class="icon iconfont-dmp iconfont-dmp-add"></i></router-link>
    </header>
    <div class="list">
      <LoadMore ref="myloadmore" :bottomMethod="loadBottom" :canInif="canInif">
        <ul v-if="groupList && groupList.length">
          <li v-for="(item, index) in groupList" :key="item.groupId">
            <span @click="goGroupAdd(item.groupId)">{{ item.groupName }}</span>
          </li>
        </ul>
        <div v-show="isLoading" class="spinner-container">
          <v-spinner width="30" type="triple-bounce" color="#54a7fd"></v-spinner>
        </div>
        <NoData v-show="showNoData"></NoData>
        <div v-if="isEnd && groupList.length > 20" class="no-data">已经到底了</div>
      </LoadMore>
    </div>
  </div>
</template>

<script>
  import { callback } from '@/common/func';
  import LoadMore from '../LoadMore';
  import VSpinner from '../VSpinner';
  import NoData from '../NoData';

  export default {
    name: 'GroupList',
    props: {
      list: {
        type: Array
      }
    },
    data() {
      return {
        canInif: false, // 是否能够无限滚动加载
        isEnd: false, // 是否加载完所有数据
        showNoData: false, // 是否显示暂无数据
        isLoading: false, // 是否正在加载中
        pageNo: 1,
        pageSize: window.CT.REQUEST_NUM + 10,
        groupList: []
      };
    },
    components: {
      LoadMore,
      VSpinner,
      NoData
    },
    created() {
      this.loadGroupList();
    },
    methods: {
      async loadGroupList(loadType) {
        const { pageNo: page_no, pageSize: page_size } = this;
        if (loadType !== 'append') {
          this.isLoading = true;
        }
        const data = {
          page_no,
          page_size
        };
        try {
          const res = await this.$services.customUserGroupQry({
            data
          });
          res &&
            callback(
              res,
              () => {
                this.renderText(res.datas, loadType);
              },
              () => {
                this.showNoData = true;
                this.isLoading = false;
                this.$message(res.error_info);
              }
            );
        } catch (err) {
          console.log(err);
          this.showNoData = true;
          this.isLoading = false;
          this.$message(JSON.stringify(err));
        }
      },
      // 判断加载数据
      renderText: function (result, loadType) {
        if (result.length >= window.CT.REQUEST_NUM + 10) {
          this.canInif = true;
          this.isEnd = false;
        } else {
          this.canInif = false;
          this.isEnd = true;
        }
        if (loadType === 'append') {
          this.groupList = this.groupList.concat(result);
        } else {
          this.groupList = result;
        }

        if (!this.groupList.length) {
          this.showNoData = true; // 在页面渲染数据的时候才判断是否显示暂无数据
        }
        this.isLoading = false;
      },
      // 无限滚动
      loadBottom() {
        this.pageNo++;
        setTimeout(() => {
          this.loadGroupList('append');
        }, 200);
      },
      goGroupAdd(id) {
        if (id) {
          this.$router.push(`/groupDetail?id=${id}`);
        } else {
          this.$router.push('/groupAdd');
        }
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>

  @import '~mixins';

  .customer-group-list {
    header {
      .flexbox();
      .justify-content(space-between);
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #e4e4e4;
    }
    span,
    a {
      display: block;
      font-size: 16px;
    }
    span {
      color: @colorBlack;
    }
    a {
      color: @colorBlueMain;
    }
    .list {
      &::-webkit-scrollbar-thumb:vertical {
        height: 8px;
        background-color: #ededed;
        -webkit-border-radius: 8px;
      }
      &::-webkit-scrollbar-thumb:horizontal {
        width: 8px;
        background-color: #ededed;
        -webkit-border-radius: 8px;
      }
      overflow-y: auto;
      height: 590px;
    }
    li {
      padding: 8px 10px;
      border-bottom: 1px solid #e4e4e4;
      &:last-child {
        border-bottom: none;
      }
      span {
        width: 200px;
        opacity: 0.7;
        font-size: 14px;
        background-color: @colorBlueMain;
        padding: 5px 5px 5px 10px;
        color: @colorWhite;
        border-radius: 2px;
        cursor: pointer;
      }
    }
    .inifScroll span {
      font-size: 14px;
    }
  }
</style>
