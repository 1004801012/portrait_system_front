<!--中泰二期客群列表-->
<template>
  <div class="customer-group-list-common">
    <header>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态客群" name="myGroup"></el-tab-pane>
        <el-tab-pane label="静态客群" name="delGroup"></el-tab-pane>
      </el-tabs>
    </header>
    <el-input
      v-model.trim="customerGroupName"
      size="mini"
      placeholder="输入客群名称快速检索"
      suffix-icon="el-icon-search"
      @input="searchCustomerGroupByName">
    </el-input>
    <div class="list">
      <!--标签管理-->
      <group-tree
        ref="groupTree"
        :groupName="customerGroupName"
        :groupImportType="activeName === 'myGroup' ? '1' : '2'"
        @tagSelect="handleSelected" />
    </div>
  </div>
</template>

<script>
  import { LoadMore, VSpinner, NoData } from '@components';
  import GroupTree from './groupTree.vue';

  export default {
    name: 'CustomerGroupList',
    props: {
      list: {
        type: Array
      },
      updatedName: {
        type: String
      }
    },
    data() {
      const { keyword, activeName = 'myGroup' } = this.$route.query;
      return {
        customerGroupName: keyword || '',
        status: '0,3,4,6',
        selectedId: '',
        currentGroupId: '',
        currentIndex: 0,
        activeName
      };
    },
    components: {
      LoadMore,
      VSpinner,
      NoData,
      GroupTree
    },
    methods: {
      searchCustomerGroupByName() {},
      handleSelected(group, index) {
        console.log('handleSelected group', group);
        let isCanEdit = false;
        let { groupId, groupType, status, source, groupImportType } = group;
        // 树状列表
        if (source && source === 'tree') {
          groupId = group.group_id || groupId;
          groupType = group.group_type || groupType;
        }
        this.selectedId = groupId;
        this.groupImportType = groupImportType;
        this.currentIndex = index;
        isCanEdit =
          String(groupType) !== '3' &&
          String(groupType) !== '7' &&
          String(groupType) !== '9' &&
          String(groupType) !== '8' &&
          String(status) === '0';
        // console.log('handleSelected', groupId);
        // console.log('handleSelected', isCanEdit );
        this.$emit('selectedCustomerGroup', groupId, isCanEdit, group);
      },
      handleClick(tab, event) {
        this.$nextTick(() => {
          this.loadList();
        })
      },
      loadList() {

        this.$refs.groupTree.getGroupList('', this.statusList);
        this.customerGroupName = '';
        this.currentIndex = 0;
        // 滚动条置顶 IE有兼容性
        document.documentElement.scrollTop = document.body.scrollTop = 0;
        this.$emit('handleSwitchCustomerGroup', this.status);
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less">
  @import './style';
</style>
