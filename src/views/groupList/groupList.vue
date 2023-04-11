<template>
  <div class="customer-group-picture customer-group-manage group-list-zt2">
    <!--客群列表-->
    <customer-group-list
      ref="customerGroupList"
      :updated-name="updatedName"
      @selectedCustomerGroup="loadOneCustomerGroup"
      @handleSwitchCustomerGroup="switchCustomerGroup"></customer-group-list>
    <div class="group-info">
      <template v-if="status === '0,3,4,6'">
        <h-spin v-if="groupQryLoading" fix>加载中...</h-spin>
        <div class="filter-box">
          <div class="filter-box-content">
            <label>客群名称：</label>
            <div v-if="groupType + '' === '3' || groupStatus + '' === '3' || groupStatus + '' === '4'">
              {{ groupName }}
            </div>
            <el-input v-else v-model.trim="groupName" @on-blur="updateName"></el-input>
            <a v-if="groupStatus + '' === '3'" href="javascript:;" class="disabled">标签上架审核中</a>
            <a v-if="groupStatus + '' === '4'" href="javascript:;" class="disabled">未进入有效期</a>
            <!--            <a href="javascript:;"-->
            <!--               v-if="groupType+'' === '3' && groupStatus+'' === '0'"-->
            <!--               class="disabled">已上架</a>-->
          </div>
          <div v-if="groupType + '' === '3' || groupStatus + '' === '4'" class="group-valid-date">
            <div>
              <span class="key">更新频率：</span>
              <span class="value">{{ groupImportType + '' === '1' ? '动态更新' : '静态更新' }}</span>
            </div>
            <div v-if="groupData.onlineTime">
              <span class="key">客群有效期：</span>
              <span class="value">{{ groupData.onlineTime }} ～ {{ groupData.offlineTime | offlineDateView }}</span>
            </div>
            <div v-if="groupData.offlineTime && groupData.offlineTime !== longDate">
              <a href="javascript:;" @click="onGroupExtend">延长有效期</a>
            </div>
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
          <!--已保存客户列表-->
          <div v-if="groupName" class="save-list-box">
            <!--            状态-操作-->
            <h-button v-if="groupType + '' === '3' && groupStatus + '' === '0'" type="ghost" @click.stop="onGroupOff"
              >下架客群</h-button
            >
            <h-button v-if="groupType + '' === '2' && groupStatus + '' === '0'" type="info" @click.stop="onGroupOn"
              >上架客群</h-button
            >
            <h-tooltip content="删除" transfer placement="top-end">
              <span
                v-if="groupType + '' === '2' && (groupStatus + '' === '0' || groupStatus + '' === '6')"
                class="saved"
                @click.stop="handleDelDialog">
                <i class="iconfont-dmp iconfont-dmp-trash"></i>
              </span>
            </h-tooltip>
            <h-tooltip content="保存为客群快照" transfer placement="top-end">
              <span
                v-if="groupImportType === '1'"
                class="saved"
                :class="id === -9999 || groupType + '' === '5' ? 'disabled' : ''"
                @click="openSavePopup">
                <i class="icon iconfont-dmp iconfont-dmp-add-snapshot"></i>
              </span>
            </h-tooltip>
          </div>
        </div>
        <CustomerGroupResult
          v-if="groupStatus + '' !== '6'"
          :id="id"
          :groupType="groupType"
          :groupData="groupData"
          :groupName="groupName"
          :groupImportType="groupImportType"
          :columns="columns" />
        <div v-else class="invalid-content">
          <p>以下客群标签已过有效期，该客群无法匹配用户</p>
          <p>可点击 <router-link :to="$refs.customerGroupCondition.to()">编辑条件</router-link>更改标签</p>
          <p v-if="groupData.invalidTags">
            <h-tag v-for="item in groupData.invalidTags.split(',')" :key="item">{{ item }}</h-tag>
          </p>
        </div>
      </template>
      <template v-else>
        <div class="filter-box">
          <p v-if="groupName">
            <label>客群名称：</label>
            <el-input v-model.trim="groupName" disabled></el-input>
          </p>
          <template v-if="Array.isArray(groupCondition) && groupCondition.length">
            <customer-group-condition
              v-if="groupName"
              :id="groupId"
              :conditions="groupCondition"
              class="condition"></customer-group-condition>
          </template>
        </div>
        <div class="customer-group-result">
          <div class="del-box">
            <span class="ad"></span>
            <p>已删除客群重新启用后方可查看客群列表～</p>
          </div>
        </div>
      </template>
    </div>
    <!-- 对话框：是否删除该客群？ -->
    <el-dialog title="系统提示" :visible.sync="delDialogVisible" center class="customer-group-dialog">
      <span class="tips">{{ delMsg }}</span>
      <div slot="footer">
        <el-button type="primary" round size="medium" @click="delDialogVisible = false">取 消 </el-button>
        <el-button type="primary" round size="medium" @click="delCustomerGroup">确定 </el-button>
      </div>
    </el-dialog>
    <!-- 对话框：转化为系统标签 -->
    <h-msg-box
      v-model="groupUpdateDialogShow"
      class="group-update-dialog"
      :escClose="true"
      :title="groupUpdateDialogType === 'ONLINE' ? '客群上架' : '延长有效期'">
      <h-row>
        <h-col class="align-right" span="4">客群名称</h-col>
        <h-col span="1">&nbsp;</h-col>
        <h-col span="19">
          <div v-if="groupUpdateDialogType === 'EXTEND'">{{ currentGroup.groupName }}</div>
          <h-input v-else v-model.trim="currentGroup.groupName" type="text" placeholder="请输入模型名称(20字内)" />
        </h-col>
      </h-row>
      <h-row v-if="groupImportType + '' === '1'">
        <h-col class="align-right" span="4">条件定义</h-col>
        <h-col span="1">&nbsp;</h-col>
        <h-col span="19">
          <customer-group-condition
            :id="groupId"
            :is-can-edit="false"
            :conditions="groupCondition"
            class="condition"></customer-group-condition>
        </h-col>
      </h-row>
      <h-row>
        <h-col class="align-right" span="4">更新频率</h-col>
        <h-col span="1">&nbsp;</h-col>
        <h-col span="19">{{ groupImportType + '' === '1' ? '动态更新' : '静态更新' }}</h-col>
      </h-row>
      <h-row v-if="groupUpdateDialogType === 'ONLINE'">
        <h-col class="align-right" span="4">客群生效日期</h-col>
        <h-col span="1">&nbsp;</h-col>
        <h-col span="19">
          <h-date-picker
            key="date"
            :value="currentGroup.date"
            type="datetimerange"
            showLong
            :longValue="longDate"
            @on-change="setGroupDate"></h-date-picker>
        </h-col>
      </h-row>
      <h-row v-else>
        <h-col class="align-right" span="4">客群有效期至</h-col>
        <h-col span="1">&nbsp;</h-col>
        <h-col span="19">
          <h-date-picker
            key="endDate"
            :value="currentGroup.endDate"
            type="datetime"
            showLong
            :options="extendDateOptions"
            :longValue="longDate"
            @on-change="setGroupEndDate"></h-date-picker>
        </h-col>
      </h-row>
      <div slot="footer">
        <h-button type="ghost" @click="groupUpdateDialogShow = false">取消</h-button>
        <h-button type="primary" :loading="groupUpdateDialogLoading" @click="onGroupUpdate">确定</h-button>
      </div>
    </h-msg-box>
    <el-dialog
      title="标签上架申请"
      :visible.sync="transferDialogVisible"
      center
      class="customer-group-dialog transfer-dialog">
      <el-form :inline="true">
        <div class="input">
          <el-form-item label="标签名称">
            <el-input v-model.trim="tagName" placeholder="请输入" disabled></el-input>
          </el-form-item>
        </div>
        <div class="input">
          <el-form-item label="标签公式">
            <customer-group-condition
              v-if="Array.isArray(conditions) && conditions.length"
              class="condition"
              :conditions="conditions"></customer-group-condition>
            <span v-else>无</span>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer">
        <el-button type="primary" round size="medium" @click="transferDialogVisible = false">取 消 </el-button>
        <el-button type="primary" round sizshowNoDatae="medium" @click="transferCustomerGroup">确定 </el-button>
      </div>
    </el-dialog>
    <!-- 对话框：系统提示 -->
    <el-dialog title="保存客群快照" :visible.sync="savePopupDialogVisible" center class="customer-group-dialog">
      <el-form>
        <el-form-item>
          <el-input v-model.trim="customerListName" placeholder="请输入客群快照名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" round size="medium" @click="savePopupDialogVisible = false">取 消 </el-button>
        <el-button type="primary" round size="medium" @click="saveCustomerList">确定 </el-button>
      </div>
    </el-dialog>
    <h-msg-box v-model="groupCanNotOffDialogShow" :escClose="true" width="450" height="100" title="下架提示">
      <div>
        <p style="margin-bottom: 10px; color: #333">客群被使用中，不可下架，需终止任务后才可下架客群</p>
        <h-table :canDrag="false" border :columns="groupCanNotOffColumns" :data="groupCanNotOffData"></h-table>
      </div>
      <div slot="footer">
        <h-button type="ghost" @click="groupCanNotOffDialogShow = false">取消</h-button>
        <h-button type="primary" @click="groupCanNotOffDialogShow = false">确定</h-button>
      </div>
    </h-msg-box>
  </div>
</template>

<script>
  import { callback, removeRepeatArrObj, flatten } from '@/common/func';
  import { CustomerGroupCondition } from '@/components';
  import CustomerGroupList from './CustomerGroupList';
  import CustomerGroupResult from '../public/CustomerGroupResult';
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
        const data = {
          group_id: id
        };
        if (this.activeName === 'delGroup') {
          data['group_import_type'] = groupImportType;
        }
        try {
          this.groupQryLoading = true;
          const res = await this.$services.customUserGroupQry({ data });
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
                this.groupData = res.datas[0] || {};
                console.log('this.groupData', this.groupData);
                if (this.groupData) {
                  this.groupName = this.groupData.groupName;
                  this.oldGroupName = this.groupName;
                  this.groupType = this.groupData.groupType;
                  this.groupImportType = String(this.groupData.groupImportType);
                  this.groupStatus = this.groupData.status;
                  try {
                    this.groupCondition = JSON.parse(this.groupData.groupCondition).con;
                    // console.log('this.groupCondition', this.groupCondition);
                    const groupFd = this.groupCondition.map((item) => {
                      // 且
                      if (item.desc) {
                        return {
                          label: item.desc.split(' ')[0],
                          prop: item.fd
                        };
                      }
                      // 或
                      if (Array.isArray(item.sub) && item.sub.length) {
                        return item.sub.map((itemSub) => {
                          return {
                            label: itemSub.desc.split(' ')[0],
                            prop: itemSub.fd
                          };
                        });
                      }
                    });
                    console.log('groupFd', groupFd);
                    console.log('this.columns', this.columns);
                    const newGroupFd = flatten(groupFd).filter((item) => {
                      return !(
                        ['client_name', 'mobile_tel', 'fund_account'].includes(item.prop) ||
                        item.prop.indexOf('ext_label_') > -1
                      );
                    });
                    this.columns = removeRepeatArrObj(this.columns.concat(newGroupFd));
                    this.columns.push({
                      label: '操作',
                      prop: 'operator'
                    });
                    console.log('loadOneCustomerGroup this.columns', this.columns);
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
      async onGroupOff() {
        this.$hMsgBox.confirm({
          title: '删除提示',
          content: `是否确定下架${this.groupName}？下架后客群不可被调用，可在私有客群中重新上架 `,
          closable: true,
          loading: true,
          onOk: async () => {
            const data = { group_id: this.groupId };
            try {
              const res = await this.$services.customUserGroupOff({ data });
              this.$hMsgBox.remove();
              res &&
                callback(
                  res,
                  () => {
                    if (res.datas && res.datas.length > 0) {
                      this.groupCanNotOffData = res.datas;
                      this.groupCanNotOffDialogShow = true;
                    } else {
                      this.$hMessage.success('下架成功');
                      this.$refs.customerGroupList.loadList();
                    }
                  },
                  () => {
                    this.$hMessage.error(res.error_info);
                  }
                );
            } catch (err) {
              console.log(err);
            }
          }
        });
      },
      async onRefresh() {
        this.id = this.getId();
        const data = { group_id: this.id };
        try {
          const res = await this.$services.customUserGroupRefresh({ data });
          res &&
            callback(
              res,
              () => {
                console.log('customUserGroupRefresh res', res);
                this.id = `${this.id}_${Date.now()}`;
              },
              () => {
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          console.log(err);
        }
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
      async onGroupUpdate() {
        if (!this.currentGroup.groupName) {
          this.$hMessage.info('请输入客群名称');
          return false;
        }
        if (this.groupUpdateDialogType === 'ONLINE') {
          if (JSON.stringify(this.currentGroup.date) === '[]') {
            this.$hMessage.info('请选择日期');
            return false;
          }
          const onlineTime = new Date(this.currentGroup.date[0]).getTime();
          const offlineTime = new Date(this.currentGroup.date[1]).getTime();
          const nowTime = new Date().getTime();
          if (offlineTime <= onlineTime) {
            this.$hMessage.info('结束时间必须大于开始时间');
            return false;
          }
          if (offlineTime - onlineTime < 86400000) {
            const msg = '<p>当前客群有效期过短</p><p>是否确认上架？</p>';
            const pass = await this.validityConfirm(msg);
            if (!pass) {
              return false;
            }
          }
          if (onlineTime - nowTime > 86400000 * 180) {
            const msg = '<p>此日期距今超过180天</p><p>请确认是否有误？</p>';
            const pass = await this.validityConfirm(msg);
            if (!pass) {
              return false;
            }
          }
        }
        if (this.groupUpdateDialogType === 'EXTEND') {
          const offlineTime = new Date(this.currentGroup.endDate).getTime();
          const oldOfflineTime = new Date(this.groupData.offlineTime).getTime();
          if (!this.currentGroup.endDate) {
            this.$hMessage.info('请选择日期');
            return false;
          }
          if (offlineTime <= oldOfflineTime) {
            this.$hMessage.info('新有效期必须大于原有效期');
            return false;
          }
        }
        let data;
        let url;
        if (this.groupUpdateDialogType === 'ONLINE') {
          data = {
            group_id: this.groupId,
            groupName: this.currentGroup.groupName,
            onlineTime: this.currentGroup.date[0],
            offlineTime: this.currentGroup.date[1]
          };
          url = 'customUserGroupTrans';
        } else {
          data = {
            group_id: this.groupId,
            groupName: this.currentGroup.groupName,
            offlineTime: this.currentGroup.endDate
          };
          url = 'extendValidPeriod';
        }
        try {
          const res = await this.$services[url]({ data });
          res &&
            callback(
              res,
              () => {
                this.$hMessage.success('提交成功');
                this.groupUpdateDialogShow = false;
                this.$refs.customerGroupList.loadList();
              },
              () => {
                this.groupUpdateDialogShow = false;
                this.$hMessage.info(res.error_info);
              }
            );
        } catch (err) {
          this.transferDialogVisible = false;
        }
      },
      async transferCustomerGroup() {
        let res = null;
        const data = {
          group_id: this.groupId
        };
        try {
          res = await this.$services.customUserGroupTrans({ data });
          res &&
            callback(
              res,
              () => {
                this.$message({
                  message: '转化申请已提交，待审核~',
                  type: 'success',
                  showClose: true
                });
                this.transferDialogVisible = false;
                this.groupStatus = '3';
              },
              () => {
                this.transferDialogVisible = false;
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          this.transferDialogVisible = false;
        }
      },
      openSavePopup() {
        if (this.groupId === window.CT.CUSTOMER_GROUP_ID || String(this.groupType) === '5') return;
        this.customerListName = '';
        this.savePopupDialogVisible = true;
      },
      checkSpecificKey(str) {
        const specialKey = "[`~!#$^&*()=|{}':;',\\[\\].<>/?~！#￥……&*（）|{}【】‘；：”“'。，、？]‘'";
        for (let i = 0; i < str.length; i++) {
          if (specialKey.indexOf(str.substr(i, 1)) > -1) {
            return false;
          }
        }
        return true;
      },
      /**
       * 保存客户列表名称
       */
      async saveCustomerList() {
        if (this.customerListName === '') {
          this.$message({ message: '客户列表名称不能为空', showClose: true });
          return;
        }
        if (!this.checkSpecificKey(this.customerListName)) {
          this.$message({ message: '名称含有特殊字符', showClose: true });
          return;
        }
        const data = {
          snapshot_name: this.customerListName,
          group_id: this.id
        };
        try {
          const res = await this.$services.customUserGroupSnapshotAdd({ data });
          res &&
            callback(
              res,
              () => {
                this.$message({
                  message: '保存成功~',
                  showClose: true,
                  duration: 800
                });
                this.savePopupDialogVisible = false;
              },
              () => {
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          console.log(err);
        }
      }
    }
  };
</script>

<style rel="stylesheet/less" lang="less">
  @import './style.less';
</style>
