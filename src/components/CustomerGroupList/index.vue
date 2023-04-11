<!--兴业标签列表-->
<template>
  <div class="customer-group-list-common">
    <header>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="标签管理" name="myGroup"></el-tab-pane>
        <el-tab-pane label="已删除标签" name="delGroup"></el-tab-pane>
      </el-tabs>
    </header>
    <el-input
      v-model.trim="customerGroupName"
      size="mini"
      placeholder="输入标签名称快速检索"
      suffix-icon="el-icon-search">
    </el-input>
    <div class="list">
      <!--标签管理-->
      <group-tree ref="groupTree" :groupName="customerGroupName" @tagSelect="handleSelected" />
    </div>
  </div>
</template>

<script>
  import { callback, debounce } from '@/common/func';
  import LoadMore from '../LoadMore';
  import VSpinner from '../VSpinner';
  import NoData from '../NoData';
  import GroupTree from './groupTree.vue';

  export default {
    name: 'CustomerGroupList',
    props: {
      list: {
        type: Array
      }
    },
    data() {
      const id = this.$route.query.id || '';
      return {
        customerGroupName: '',
        delGroupName: '',
        status: '0,3',
        selectedId: id,
        currentIndex: 0,
        activeName: 'myGroup'
      };
    },
    components: {
      LoadMore,
      VSpinner,
      NoData,
      GroupTree
    },
    methods: {
      handleSelected(group, index) {
        console.log('handleSelected group', group);
        let isCanEdit = false;
        let { groupId, groupType, status, source } = group;
        // 树状列表
        if (source && source === 'tree') {
          groupId = group.id;
          groupType = group.group_type;
        }
        this.selectedId = groupId;
        this.currentIndex = index;
        isCanEdit =
          String(groupType) !== '3' &&
          String(groupType) !== '7' &&
          String(groupType) !== '9' &&
          String(groupType) !== '8' &&
          String(status) === '0';
        // console.log('handleSelected', groupId);
        // console.log('handleSelected', isCanEdit );
        this.$emit('selectedCustomerGroup', groupId, isCanEdit);
      },
      handleClick(tab, event) {
        const { paneName } = tab;
        if (paneName === 'myGroup') {
          this.statusList = '0';
          this.status = '0,3';
        } else {
          this.status = '2';
          this.statusList = '2';
        }
        console.log('handleClick this.statusList', this.statusList);
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
  @import './style.less';
</style>
