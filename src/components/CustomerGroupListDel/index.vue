<template>
  <div class="customer-group-list-common group-list-saved">
    <header>
      <span>{{ groupName || '已删除客群' }}</span>
    </header>
    <el-input
      v-if="!groupId"
      v-model.trim="customerGroupName"
      size="mini"
      placeholder="输入客群名称快速检索"
      suffix-icon="el-icon-search"
      @input="searchCustomerGroupByName">
    </el-input>
    <div class="list" :style="{ height: groupId ? '500px' : '460px' }">
      <LoadMore ref="myloadmore" :bottomMethod="loadBottom" :canInif="canInif">
        <ul v-if="groupList && groupList.length">
          <li
            v-for="(item, index) in groupList"
            :key="item.groupId"
            :class="{ active: selectedId === item.groupId }"
            @click="handleSelected(item, index)">
            <span>{{ item.groupName }}</span>
            <a href="javascript:;" title="删除" @click.stop="handleDelDialog(item.groupId, index)">
              <i class="iconfont-dmp iconfont-dmp-trash"></i>
            </a>
            <a href="javascript:;" title="恢复" @click.stop="handleResetDialog(item.groupId, index)">
              <i class="iconfont-dmp iconfont-dmp-selected"></i>
            </a>
          </li>
        </ul>
        <div v-show="isLoading" class="spinner-container">
          <v-spinner width="30" type="triple-bounce" color="#54a7fd"></v-spinner>
        </div>
        <NoData v-show="showNoData"></NoData>
        <div v-if="isEnd && groupList.length > 20" class="no-data">已经到底了</div>
      </LoadMore>
    </div>
    <!-- 对话框：是否删除该客户列表？ -->
    <el-dialog title="系统提示" :visible.sync="delDialogVisible" center class="customer-group-dialog">
      <span class="tips">是否删除该客户列表？</span>
      <div slot="footer">
        <el-button type="primary" round size="medium" @click="delDialogVisible = false">取 消 </el-button>
        <el-button type="primary" round size="medium" @click="delCustomerGroup">确定 </el-button>
      </div>
    </el-dialog>
    <!-- 对话框：确定要重新启用此客群吗 -->
    <el-dialog title="系统提示" :visible.sync="resetDialogVisible" center class="customer-group-dialog">
      <span class="tips">确定要重新启用此客群吗？</span>
      <div slot="footer">
        <el-button type="primary" round size="medium" @click="resetDialogVisible = false">取 消 </el-button>
        <el-button type="primary" round size="medium" @click="resetCustomerGroup">确定 </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { callback, debounce } from '@/common/func';
  import LoadMore from '../LoadMore';
  import VSpinner from '../VSpinner';
  import NoData from '../NoData';
  import CustomerGroupCondition from '../CustomerGroupCondition';

  export default {
    name: 'CustomerGroupListDel',
    props: {
      list: {
        type: Array
      }
    },
    data() {
      return {
        groupId: '',
        groupName: '',
        customerGroupName: '',
        selectedId: '',
        currentGroupId: '',
        currentIndex: 0,
        tagName: '兴业证券',
        conditions: [],
        delDialogVisible: false,
        transferDialogVisible: false,
        resetDialogVisible: false,
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
      NoData,
      CustomerGroupCondition
    },
    created() {
      this.loadGroupList();
    },
    mounted() {
      this.listDom = this.$el.querySelector('.list');
    },
    watch: {
      // 如果路由有变化，会再次执行该方法
      // 只有这个页面初始化之后，这个监听事件才开始生效
      $route(to, from) {
        this.loadGroupList();
      }
    },
    methods: {
      searchCustomerGroupByName: debounce(function () {
        this.pageNo = 1;
        this.pageSize = window.CT.REQUEST_NUM + 10;
        this.loadGroupList();
      }, 500),
      handleSelected(group, index) {
        const { groupId } = group;
        this.selectedId = groupId;
        this.currentIndex = index;
        this.$emit('selectedCustomerGroup', groupId);
      },
      async loadGroupList(loadType) {
        console.log('loadType', loadType);
        const { groupId = '', groupName = '' } = this.$route.query;
        const { pageNo: page_no, pageSize: page_size } = this;
        if (loadType !== 'append') {
          this.isLoading = true;
        }
        this.groupId = groupId;
        this.groupName = groupName;
        const data = {
          status_list: '2',
          group_name: this.customerGroupName,
          page_no,
          page_size
        };
        try {
          const res = await this.$services.customUserGroupQry({ data });
          res &&
            callback(
              res,
              () => {
                // 第一次加载
                if (typeof loadType === 'undefined') {
                  const currentGroupData = res.datas[0];
                  if (currentGroupData) {
                    this.selectedId = currentGroupData.groupId;
                    this.tagName = currentGroupData.groupName;
                    try {
                      this.conditions = JSON.parse(currentGroupData.groupCondition).con;
                    } catch (err) {
                      this.conditions = [];
                      console.log(err);
                      console.log('客群列表条件加载失败：' + JSON.stringify(err));
                    }
                    this.$emit('selectedCustomerGroup', this.selectedId);
                  } else {
                    this.selectedId = window.CT.CUSTOMER_GROUP_ID;
                    this.$emit('selectedCustomerGroup', this.selectedId);
                  }
                }
                this.renderText(res.datas, loadType);
              },
              () => {
                this.showNoData = true;
                this.isLoading = false;
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          console.log(err);
          this.showNoData = true;
          this.isLoading = false;
        }
      },
      // 判断加载数据
      renderText: function (result, loadType) {
        this.isLoading = false;
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
        } else {
          this.showNoData = false;
        }
      },
      // 无限滚动
      loadBottom() {
        this.pageNo++;
        setTimeout(() => {
          this.loadGroupList('append');
        }, 500);
      },
      handleDelDialog(id, index) {
        this.delDialogVisible = !this.delDialogVisible;
        this.currentGroupId = id;
        this.currentIndex = index;
      },
      async delCustomerGroup() {
        let nextGroup = null;
        const data = {
          group_id: this.currentGroupId
        };
        try {
          const res = await this.$services.customUserGroupRealDel({ data });
          res &&
            callback(
              res,
              () => {
                this.groupList.splice(this.currentIndex, 1);
                this.$message({
                  message: '删除成功~',
                  type: 'success',
                  showClose: true
                });
                this.delDialogVisible = false;
                if (this.groupList.length === this.currentIndex) {
                  // 若是最后一条数据，则选中上一条
                  nextGroup = this.groupList[this.currentIndex - 1];
                } else {
                  nextGroup = this.groupList[this.currentIndex];
                }
                //              console.log(this.groupList.length, this.currentIndex, this.currentIndex - 1, this.groupList[this.currentIndex - 1]);
                console.log(nextGroup, this.selectedId, this.currentGroupId, this.groupList.length);
                if (nextGroup && this.selectedId === this.currentGroupId) {
                  this.handleSelected(nextGroup);
                }

                if (!this.groupList.length) {
                  this.showNoData = true;
                  this.$emit('selectedCustomerGroup');
                }
              },
              () => {
                this.$message({ message: res.error_info, showClose: true });
                this.delDialogVisible = false;
              }
            );
        } catch (err) {
          this.delDialogVisible = false;
        }
      },
      handleResetDialog(id, index) {
        this.resetDialogVisible = !this.resetDialogVisible;
        this.currentGroupId = id;
        this.currentIndex = index;
      },
      async resetCustomerGroup() {
        let res = null;
        let nextGroup = null;
        const data = {
          group_id: this.currentGroupId
        };
        try {
          res = await this.$services.customUserGroupUndoDel({ data });
          res &&
            callback(
              res,
              () => {
                this.groupList.splice(this.currentIndex, 1);
                this.$message({
                  message: '恢复成功~',
                  type: 'success',
                  showClose: true
                });
                this.resetDialogVisible = false;
                if (this.groupList.length === 0) {
                  this.showNoData = true;
                  this.selectedId = window.CT.CUSTOMER_GROUP_ID;
                  this.$emit('selectedCustomerGroup', this.selectedId, false);
                } else {
                  if (this.groupList.length === this.currentIndex) {
                    // 若是最后一条数据，则选中上一条
                    nextGroup = this.groupList[this.currentIndex - 1];
                  } else {
                    nextGroup = this.groupList[this.currentIndex];
                  }
                  if (this.selectedId === this.currentGroupId) {
                    this.handleSelected(nextGroup);
                  }
                }
              },
              () => {
                this.resetDialogVisible = false;
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          this.resetDialogVisible = false;
        }
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less">

  @import '~mixins';

  .customer-group-list-common {
    width: 260px;
    float: left;
    border: 1px solid #e4e4e4;
    border-radius: 3px;
    box-sizing: border-box;
    background-color: #fff;
    height: 590px;

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

    header {
      .flexbox();
      .justify-content(space-between);
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      margin-bottom: 15px;
      border-bottom: 1px solid #e4e4e4;
    }

    .el-tabs__nav {
      margin-left: 40px;
      height: auto;
    }

    .el-tabs__nav-wrap::after {
      height: 0;
    }

    .el-tabs__header {
      margin: 0;
    }

    .el-tabs__item {
      height: 40px;
      line-height: 40px;
      font-size: 14px;
      color: #999;
      font-weight: 300;
    }

    .el-input {
      width: 240px;
      margin-left: 10px;
    }

    .el-input--mini .el-input__icon {
      color: @colorBlackAssist;
      font-size: 18px;
    }

    .list {
      margin-top: 10px;
      overflow-y: auto;
      height: 460px;

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

      .spinner-container {
        text-align: center;
      }

      .iconfont-dmp-selected {
        font-size: 12px;
      }
    }

    li {
      padding: 8px 10px;
      border-bottom: 1px solid #e4e4e4;

      &.active {
        background-color: #e4e4e4;
      }

      &:last-child {
        border-bottom: none;
      }

      span {
        display: inline-block;
        width: 156px;
        opacity: 0.7;
        height: 24px;
        line-height: 24px;
        font-size: 14px;
        background-color: @colorBlueMain;
        padding: 0 5px 0 10px;
        color: @colorWhite;
        border-radius: 2px;
        cursor: pointer;
        margin-right: 3px;
        .text-overflow();
        vertical-align: middle;
      }

      a {
        width: 24px;
        height: 24px;
        line-height: 24px;
        color: @colorWhite;
        display: inline-block;
        text-align: center;
        background-color: rgba(84, 167, 253, 0.7);
        border-radius: 2px;
        margin: 0 2px;
        vertical-align: middle;

        &.disabled {
          background-color: rgba(187, 187, 187, 0.7);
        }
      }
    }

    .inifScroll span {
      font-size: 14px;
    }

    .footer {
      border-top: 1px solid #e4e4e4;
      height: 30px;
      line-height: 30px;
      text-align: center;

      a {
        display: block;
        color: @colorBlueMain;
      }
    }
  }

  .transfer-dialog {
    .customer-group-condition {
      margin-left: 0;
      line-height: 33px;

      span {
        display: block;
      }
    }
  }
</style>
