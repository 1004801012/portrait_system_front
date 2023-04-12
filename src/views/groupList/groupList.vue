<template>
  <div class="customer-group-picture customer-group-manage group-list-zt2">
    <!--客群列表-->
    <customer-group-list
      ref="customerGroupList"
      :updated-name="updatedName"
      @selectedCustomerGroup="loadOneCustomerGroup"
      @handleSwitchCustomerGroup="switchCustomerGroup"></customer-group-list>
    <div class="group-info" v-if="id">
      <template>
        <div class="filter-box">
          <div class="filter-box-content">
            <label>客群名称：</label>
            <div v-if="groupType + '' === '3' || groupStatus + '' === '3' || groupStatus + '' === '4'">
              {{ groupName }}
            </div>
            <el-input v-else v-model.trim="groupName" disabled></el-input>

          </div>
          <template v-if="Array.isArray(groupCondition) && groupCondition.length">
            <customer-group-condition
              v-if="groupName"
              :id="groupId"
              ref="customerGroupCondition"
              :is-can-edit="groupStatus + '' !== '3' && groupType + '' !== '3'"
              :conditions="groupCondition"
              class="condition"></customer-group-condition>
          </template>
        </div>
        <CustomerGroupResult
          :id="id"
          :groupType="groupType"
          :groupData="groupData"
          :groupName="groupName"
          :groupImportType="groupImportType"
          :columns="columns" />
      </template>
    </div>
    <div v-else style="width: 100%;height: 483px;background: #fff;padding-top: 160px">
      <no-data></no-data>
    </div>
  </div>
</template>

<script>
  import { callback, removeRepeatArrObj, flatten } from '@/common/func';
  import { CustomerGroupCondition } from '@/components';
  import CustomerGroupList from './CustomerGroupList';
  import CustomerGroupResult from '../public/CustomerGroupResult';
  import NoData from "@components/NoData/src/index";
  const longDate = '2099-12-31 23:59:59';

  export default {
    name: 'groupList',
    data() {
      const { keyword, activeName = 'myGroup' } = this.$route.query;
      return {
        isMounted: false,
        id: '',
        groupId: '',
        groupName: keyword || '',
        groupType: '',
        groupData: {},
        // 客群生成方式
        // 1 使用条件
        // 2 导入excel
        // 3 快照
        groupImportType: '',
        groupStatus: '',
        oldGroupName: '',
        groupCondition: [],
        status: '0,3,4,6',
        updatedName: '',
        columns: [],
        delDialogVisible: false,
        transferDialogVisible: false,
        resetDialogVisible: false,
        savePopupDialogVisible: false,
        customerListName: '',
        tagName: '',
        activeName,
        groupQryLoading: false,
        groupUpdateDialogLoading: false,
        groupUpdateDialogShow: false,
        longDate,
        // ONLINE:客群上架    EXTEND:延长有效期
        groupUpdateDialogType: 'ONLINE',
        groupOldDate: '',
        currentGroup: {
          date: [], // beginDate , endDate
          endDate: '', // beginDate , endDate
          groupName: ''
        },
        groupCanNotOffDialogShow: false,
        groupCanNotOffColumns: [
          {
            title: '任务名称',
            key: 'taskName'
          },
          {
            title: '任务类型',
            key: 'taskType'
          },
          {
            title: '任务终止时间',
            key: 'endTime'
          },
          {
            title: '创建人',
            key: 'creatorName'
          }
        ],
        groupCanNotOffData: [],
        delMsg: "",
        conditions: []
      };
    },
    components: {
      NoData,
      CustomerGroupCondition,
      CustomerGroupList,
      CustomerGroupResult
    },
    filters: {
      offlineDateView(date) {
        return date === longDate ? '长期' : date;
      }
    },
    computed: {
      extendDateOptions() {
        const oldDate = this.groupOldDate;
        return {
          disabledDate(date) {
            return date && date.valueOf() < Date.parse(oldDate.split(' ')[0]) - 86400000;
          }
        };
      }
    },
    mounted() {
      // if (this.$store.getters.needKeepAliveList.includes(this.$options.name)) {
      //   this.isMounted = true;
      // }
    },
    activated() {
      if (this.isMounted) {
        this.$refs.customerGroupList.loadList();
      }
    },
    methods: {
      async loadOneCustomerGroup(id, status, { groupImportType, status: groupStatus }) {
        console.log('loadOneCustomerGroup', id, groupImportType);
        this.groupStatus = groupStatus;
        this.id = id;
        this.groupId = id;
        this.columns = [];
        if (!id) {
          return
        }
        const data = {
          group_id: id
        };
        try {
          this.groupQryLoading = true;
          const res = await this.$services.getGroupInfo({ data });
          this.groupQryLoading = false;
          res &&
            callback(
              res,
              () => {
                this.columns = [
                  {
                    label: '客户名称',
                    prop: 'client_name'
                  },
                  {
                    label: '电话号码',
                    prop: 'mobile_tel'
                  },
                  {
                    label: '资金账号',
                    prop: 'fund_account'
                  }
                ];
                this.groupData = res.data;
                console.log('this.groupData', this.groupData);
                if (this.groupData) {
                  this.groupName = this.groupData.group_name;
                  this.oldGroupName = this.groupName;
                  this.groupType = this.groupData.groupType;
                  this.groupImportType = String(this.groupData.group_type);
                  try {
                    this.groupCondition = JSON.parse(this.groupData.group_condition).con;
                    this.columns.push({
                      label: '操作',
                      prop: 'operator'
                    });
                  } catch (err) {
                    // console.log('err', err);
                    this.columns.push({
                      label: '操作',
                      prop: 'operator'
                    });
                    this.groupCondition = [];
                    console.log('客群条件转换异常' + JSON.stringify(err));
                  }
                } else {
                  this.groupName = '';
                  this.groupCondition = [];
                }
              },
              () => {
                this.$message({ message: res.error_info, showClose: true });
                this.exportLink = 'javascript:;';
              }
            );
        } catch (err) {
          this.groupQryLoading = false;
          console.log(err);
        }
      },
      switchCustomerGroup(status) {
        this.status = status;
      },
      async updateName() {
        if (this.groupName === '') {
          this.$message({ message: '客群名称不能为空', showClose: true });
          return;
        }
        if (!this.checkSpecificKey(this.groupName)) {
          this.groupName = this.oldGroupName;
          this.$message({ message: '名称含有特殊字符', showClose: true });
          return;
        }
        // name未做修改
        if (this.groupName === this.oldGroupName) return;
        const data = {
          group_id: this.groupId,
          group_name: this.groupName
        };
        try {
          const res = await this.$services.customUserGroupNameUpdate({ data });
          res &&
            callback(
              res,
              () => {
                this.updatedName = this.groupName;
                this.oldGroupName = this.groupName;
                this.$message({ message: '修改成功', showClose: true });
                this.$bus.$emit('updateGroupName', this.groupId, this.groupName);
                this.loadOneCustomerGroup(this.groupId, false, this.groupData);
              },
              () => {
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          console.log(err);
        }
      },
      getId() {
        const id = typeof this.id === 'string' ? this.id : String(this.id);
        const index = id.indexOf('_');
        return index !== -1 ? id.substring(0, index) : this.id;
      },
      handleDelDialog(group, index, type) {
        this.delDialogVisible = !this.delDialogVisible;
        this.currentIndex = index;
        if (type && type === 'real') {
          this.delType = type;
          this.delMsg = `是否彻底删除客群 ${group.groupName}？`;
        } else {
          this.delType = '';
          this.delMsg = '是否删除该客群？';
        }
      },
      async delCustomerGroup() {
        let res = null;
        const data = {
          group_id: this.groupId,
          groupName: this.groupName
        };
        try {
          if (this.delType === 'real') {
            res = await this.$services.customUserGroupRealDel({ data });
          } else {
            res = await this.$services.customUserGroupDel({ data });
          }
          res &&
            callback(
              res,
              () => {
                this.$message({
                  message: '删除成功~',
                  type: 'success',
                  showClose: true
                });
                this.delDialogVisible = false;
                this.$refs.customerGroupList.loadList(() => {
                  console.log('不需要重置选中的 tree id');
                });
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
      handleTransferDialog() {
        this.transferDialogVisible = !this.transferDialogVisible;
        this.tagName = this.groupName;
        try {
          this.conditions = this.groupCondition;
        } catch (err) {
          this.conditions = [];
          console.log(err);
        }
      },
      setGroupDate(date) {
        this.currentGroup.date = date;
      },
      setGroupEndDate(date) {
        this.currentGroup.endDate = date;
      },
      onGroupExtend() {
        this.groupUpdateDialogType = 'EXTEND';
        this.groupOldDate = this.groupData.offlineTime;
        this.currentGroup.groupName = this.groupName;
        this.currentGroup.endDate = this.groupData.offlineTime;
        this.groupUpdateDialogShow = true;
      },
      onGroupOn() {
        this.groupUpdateDialogType = 'ONLINE';
        this.currentGroup.groupName = this.groupName;
        this.currentGroup.date = [];
        this.groupUpdateDialogShow = true;
      },
      validityConfirm(msg) {
        return new Promise((resolve, reject) => {
          this.$hMsgBox.confirm({
            title: '提示',
            content: msg,
            onOk: () => {
              resolve(true);
            },
            onCancel: () => {
              resolve(false);
            }
          });
        });
      },
      checkSpecificKey(str) {
        const specialKey = "[`~!#$^&*()=|{}':;',\\[\\].<>/?~！#￥……&*（）|{}【】‘；：”“'。，、？]‘'";
        for (let i = 0; i < str.length; i++) {
          if (specialKey.indexOf(str.substr(i, 1)) > -1) {
            return false;
          }
        }
        return true;
      }
    }
  };
</script>

<style rel="stylesheet/less" lang="less">
  @import './style.less';
</style>
