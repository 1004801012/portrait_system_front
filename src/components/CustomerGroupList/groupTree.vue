<template>
  <div class="group-tree">
    <el-tree
      ref="groupTree"
      node-key="id"
      :data="treeData"
      :props="defaultProps"
      :render-content="renderContent"
      :default-expanded-keys="expandIds"
      :expand-on-click-node="false"
      :highlight-current="true"
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
      @node-click="handleNodeClick"></el-tree>
    <!-- 对话框：转化为系统标签 -->
    <el-dialog
      title="标签上架申请"
      :visible.sync="transferDialogVisible"
      center
      class="customer-group-dialog transfer-dialog">
      <el-form :inline="true">
        <div class="input">
          <el-form-item label="标签名称" label-width="90px">
            <el-input v-model.trim="tagName" class="tag-name" placeholder="请输入" disabled></el-input>
          </el-form-item>
        </div>
        <div class="input">
          <el-form-item label="标签公式" label-width="90px">
            <customer-group-condition
              v-if="Array.isArray(conditions) && conditions.length"
              class="condition"
              :conditions="conditions"></customer-group-condition>
            <span v-else>无</span>
          </el-form-item>
        </div>
        <div class="input">
          <el-form-item label="更新频率" label-width="90px">
            <span>{{ frequencyState === '8' || frequencyState === '9' ? '不更新' : '每日更新' }}</span>
          </el-form-item>
        </div>
        <div class="input">
          <el-form-item label="选择有效期" label-width="90px">
            <el-date-picker
              v-model.trim="validityStart"
              type="date"
              placeholder="开始日期"
              format="yyyy-MM-dd"
              value="yyyy-MM-dd"
              :picker-options="pickerOptions">
            </el-date-picker>
            <span>至</span>
            <el-date-picker
              v-model.trim="validityEnd"
              type="date"
              placeholder="结束日期"
              format="yyyy-MM-dd"
              value="yyyy-MM-dd"
              :picker-options="pickerOptions">
            </el-date-picker>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer">
        <el-button type="primary" round size="medium" @click="transferDialogVisible = false">取 消 </el-button>
        <el-button type="primary" round sizshowNoDatae="medium" @click="transferCustomerGroup">确定 </el-button>
      </div>
    </el-dialog>
    <!-- 对话框：是否删除该标签？ -->
    <el-dialog title="系统提示" :visible.sync="delDialogVisible" center class="customer-group-dialog">
      <span class="tips">是否删除该标签？</span>
      <div slot="footer">
        <el-button type="primary" round size="medium" @click="delDialogVisible = false">取 消 </el-button>
        <el-button type="primary" round size="medium" @click="delCustomerGroup">确定 </el-button>
      </div>
    </el-dialog>
    <!-- 对话框：确定要下架此标签吗 -->
    <el-dialog title="系统提示" :visible.sync="obtainedDialogVisible" center class="customer-group-dialog">
      <span class="tips">确定要下架此标签吗？</span>
      <div slot="footer">
        <el-button type="primary" round size="medium" @click="obtainedDialogVisible = false">取 消 </el-button>
        <el-button type="primary" round size="medium" @click="obtainedCustomerGroup">确定 </el-button>
      </div>
    </el-dialog>
    <!-- 对话框：确定要重新启用此标签吗 -->
    <el-dialog title="系统提示" :visible.sync="resetDialogVisible" center class="customer-group-dialog">
      <span class="tips">确定要恢复该标签至：{{ remark }}&nbsp;吗？</span>
      <div slot="footer">
        <el-button type="primary" round size="medium" @click="resetDialogVisible = false">取 消 </el-button>
        <el-button type="primary" round size="medium" @click="resetCustomerGroup">确定 </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { formatDate } from 'cloud-utils';
  import { callback, debounce, breadthQuery } from '@/common/func';
  import { setXYGroupTreeExpandIds, getXYGroupTreeExpandIds } from '@/common/auth';
  import CustomerGroupCondition from '../CustomerGroupCondition';

  export default {
    props: {
      groupName: {
        type: String,
        default: ''
      }
    },
    data() {
      const id = this.$route.query.id || '';
      return {
        treeData: [],
        defaultProps: {
          id: 'id',
          label: 'name',
          tagCount: 'tag_count',
          children: 'children'
        },
        expandIds: [],
        _expandIds: [],
        currentGroupId: id,
        currentNode: null,
        conditions: [],
        searchName: '',
        transferDialogVisible: false,
        obtainedDialogVisible: false,
        delDialogVisible: false,
        resetDialogVisible: false,
        // 更新频率状态
        frequencyState: '',
        validityStart: formatDate(new Date(), 'yyyy-MM-dd'),
        validityEnd: '',
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() <= Date.now() - 24 * 60 * 60 * 1000;
          }
        },
        remark: '',
        tagName: ''
      };
    },
    components: {
      CustomerGroupCondition
    },
    watch: {
      groupName: {
        handler: debounce(function (name) {
          this.getGroupList(name, this.statusList);
        }, 800)
      }
    },
    async mounted() {
      this.getGroupList();
      this.$bus.$on('updateGroupName', (groupId, newGroupName) => {
        this.updateGroupName(groupId, newGroupName);
      });
    },
    beforeDestroy() {
      this.$bus.$off('updateGroupName');
    },
    methods: {
      renderContent(h, { node, data, store }) {
        if (node.isLeaf) {
          return (
            <div class="node">
              <i class="el-icon-document" style="color:#9CB1C6;margin-right:6px;font-size:18px;"></i>
              <div class="some">
                <div class="label line1" title={node.label}>
                  {node.label}
                </div>
                <div class="ctrl">
                  {String(data.operator_status) === '1' &&
                    (String(data.group_type) === '2' || String(data.group_type) === '8') &&
                    String(data.status) !== '5' && (
                      <i
                        class="iconfont-dmp iconfont-dmp-shelf"
                        title="标签上架"
                        on-click={(event) => this.handleTransferDialog(data, node, event)}></i>
                    )}
                  {String(data.operator_status) === '1' &&
                    (String(data.group_type) === '3' || String(data.group_type) === '9') &&
                    String(data.status) !== '5' && (
                      <i
                        class="iconfont-dmp iconfont-dmp-down-shelves"
                        title="标签下架"
                        on-click={() => this.handleObtainedDialog(data, node, event)}></i>
                    )}
                  {String(data.operator_status) === '1' &&
                    (String(data.group_type) === '2' || String(data.group_type) === '8') && (
                      <i
                        class="iconfont-dmp iconfont-dmp-trash"
                        title="删除"
                        on-click={(event) => this.handleDelDialog(data, node, event)}></i>
                    )}
                  {(String(data.group_type) === '2' || String(data.group_type) === '8') &&
                    String(data.status) === '2' && (
                      <i
                        class="iconfont-dmp iconfont-dmp-selected"
                        title="恢复"
                        on-click={(event) => this.handleResetDialog(data, node, event)}></i>
                    )}
                  {String(data.status) === '3' && (
                    <span class="disabled">
                      <i class="iconfont-dmp iconfont-dmp-shelfing" title="标签上架审核中"></i>
                    </span>
                  )}
                  {String(data.status) === '4' && (
                    <span class="disabled">
                      <i class="iconfont-dmp iconfont-dmp-obtained" title="标签下架审核中"></i>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        } else {
          if (node.expanded) {
            return (
              <span>
                <i class="iconfont-dmp iconfont-dmp-folder-open" style="color:#9CB1C6;margin-right:6px;"></i>
                {node.label}
                <span style="margin-left:4px">{data.tag_count > 0 ? `(${data.tag_count})` : ''}</span>
              </span>
            );
          } else {
            return (
              <span>
                <i class="iconfont-dmp iconfont-dmp-folder-close" style=";color:#9CB1C6;margin-right:6px;"></i>
                {node.label}
                <span style="margin-left:4px">{data.tag_count > 0 ? `(${data.tag_count})` : ''}</span>
              </span>
            );
          }
        }
      },
      handleNodeExpand(data, node) {
        const id = data.id;
        if (Array.isArray(this.expandIds) && this.expandIds.findIndex((e) => e === id) < 0) {
          this.expandIds.push(id);
        }
        console.log('handleNodeExpand', this.expandIds);
      },
      handleNodeCollapse(data, node) {
        console.log('handleNodeCollapse start', this.expandIds);
        const id = data.id;
        this.expandIds =
          Array.isArray(this.expandIds) &&
          this.expandIds.filter((e) => {
            if (typeof e !== 'string') return;
            return e.indexOf(id) < 0;
          });
        console.log('handleNodeCollapse end', this.expandIds);
      },
      handleNodeClick(data, node) {
        this.currentNode = node;
        // console.log('handleNodeClick', data);
        if (node.isLeaf) {
          data['source'] = 'tree';
          this.$emit('tagSelect', data);
        }
      },
      handleDeleteGroup(data) {
        if (node.isLeaf) {
          data['source'] = 'tree';
          this.$emit('tagDelete', data);
        }
      },
      async getGroupList(name, statusList = '0', cb) {
        this.statusList = statusList;
        console.log('this.statusList', this.statusList);
        const data = {
          status_list: statusList
        };
        name && (data['group_name'] = name);
        try {
          const res = await this.$services.customUserGroupOpExistentQry({ data });
          this.treeData = res.data && res.data.children;
          if (typeof cb === 'function') {
            cb();
            return;
          }
          if (name) {
            this.$refs.groupTree.store && (this.$refs.groupTree.store.defaultExpandAll = true);
          } else {
            this.$refs.groupTree.store && (this.$refs.groupTree.store.defaultExpandAll = false);
            if (this.currentGroupId) {
              const currentTreeData = breadthQuery(this.treeData, Number(this.currentGroupId));
              if (currentTreeData) {
                this.expandIds.push(currentTreeData.id);
                currentTreeData.source = 'tree';
                // 设置当前选中高亮
                this.$nextTick(() => {
                  this.$refs.groupTree.setCurrentKey(currentTreeData.id);
                });
                this.$emit('tagSelect', currentTreeData);
                this.currentGroupId = '';
              } else {
                this.handleSelectTag();
              }
            } else {
              this.handleSelectTag();
            }
          }
        } catch (err) {
          console.error('err', err);
          this.treeData = [];
        }
      },
      handleSelectTag() {
        const firstTreeData = this.treeData[0];
        if (firstTreeData) {
          this.expandIds = firstTreeData.children.map((v) => v.id) || [];
          this.expandIds.push(firstTreeData.id);
          const groupData = firstTreeData.children[0].children[0].children[0];
          groupData.source = 'tree';
          // 设置当前选中高亮
          this.$nextTick(() => {
            this.$refs.groupTree.setCurrentKey(groupData.id);
          });
          this.$emit('tagSelect', groupData);
        }
      },
      handleTransferDialog(group, node, event) {
        event.stopPropagation();
        this.transferDialogVisible = !this.transferDialogVisible;
        this.currentNode = node;
        this.currentGroupId = group.id;
        this.loadOneCustomerGroup(group.id);
      },
      async transferCustomerGroup() {
        let res = null;
        const beginDate = formatDate(new Date(this.validityStart), 'yyyy-MM-dd');
        const endDate = formatDate(new Date(this.validityEnd), 'yyyy-MM-dd');
        if (!this.validityEnd) {
          this.$message({ message: '结束日期不能为空', showClose: true });
          return;
        }
        if (new Date(beginDate).getTime() > new Date(endDate).getTime()) {
          this.$message({ message: '开始日期不能大于结束日期', showClose: true });
          return;
        }
        const data = {
          group_id: this.currentGroupId,
          begin_date: beginDate,
          end_date: endDate
        };
        try {
          res = await this.$services.customUserGroupOpTrans({ data });
          res &&
            callback(
              res,
              () => {
                this.$message({
                  message: '上架申请已提交，待审核~',
                  type: 'success',
                  showClose: true
                });
                this.transferDialogVisible = false;
                this.currentNode.data['operator_status'] = 0;
                this.currentNode.data['status'] = 3;
              },
              () => {
                this.transferDialogVisible = false;
                if (String(res.error_no) === '10014') {
                  this.$alert('对不起，当前分公司标签数量额度已满（100个）<br>请下架后再行新增。', '', {
                    confirmButtonText: '确定',
                    showClose: false,
                    dangerouslyUseHTMLString: true,
                    center: true,
                    callback: (action) => {}
                  });
                  return;
                }
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          this.transferDialogVisible = false;
        }
      },
      handleObtainedDialog(group, node, event) {
        event.stopPropagation();
        this.obtainedDialogVisible = !this.obtainedDialogVisible;
        this.currentGroupId = group.id;
        this.currentNode = node;
      },
      async obtainedCustomerGroup() {
        let res = null;
        const data = {
          group_id: this.currentGroupId
        };
        try {
          res = await this.$services.customUserGroupOpOff({ data });
          res &&
            callback(
              res,
              () => {
                this.$message({
                  message: '下架申请已提交，待审核~',
                  type: 'success',
                  showClose: true
                });
                this.obtainedDialogVisible = false;
                this.currentNode.data['operator_status'] = 0;
                this.currentNode.data['status'] = 4;
              },
              () => {
                this.obtainedDialogVisible = false;
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          this.obtainedDialogVisible = false;
        }
      },
      handleDelDialog(group, node, event) {
        event.stopPropagation();
        this.delDialogVisible = !this.delDialogVisible;
        this.currentGroupId = group.id;
        this.currentNode = node;
      },
      async delCustomerGroup() {
        let res = null;
        const data = {
          group_id: this.currentGroupId
        };
        try {
          res = await this.$services.customUserGroupOpDel({ data });
          res &&
            callback(
              res,
              () => {
                // this.remove(this.currentNode, this.currentGroupId);
                this.getGroupList('', this.statusList, () => {});
                this.$message({
                  message: '删除成功~',
                  type: 'success',
                  showClose: true
                });
                this.delDialogVisible = false;
                this.$emit('tagSelect', {
                  id: window.CT.CUSTOMER_GROUP_ID,
                  group_type: '-1',
                  source: 'tree'
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
      // TODO 已废弃
      remove(node, id) {
        // 根节点
        const root = node.parent.parent.parent;
        const rootCount = root.data.tag_count;
        // 二级节点
        const secondNode = node.parent.parent;
        const secondCount = secondNode.data.tag_count;
        // 三级节点
        const parent = node.parent;
        const count = parent.data.tag_count;
        const children = parent.data.children || parent.data;
        const index = Array.isArray(children) && children.findIndex((d) => d.id === id);

        // 3级目录只有一条时，2级目录的数量减1
        if (count === 1) {
          if (secondCount === 1) {
            // 1级目录只有一条时，整个层级都删除掉
            this.$refs.groupTree.remove(parent.parent);
          } else {
            parent.parent.data.tag_count = secondCount - 1;
            this.$refs.groupTree.remove(parent);
          }
        } else {
          children.splice(index, 1);
          parent.data['tag_count'] = count - 1;
        }
        if (rootCount !== 1) {
        }
        console.log(node);
      },
      updateGroupName(id, name) {
        const parent = this.currentNode.parent;
        const children = parent.data.children || parent.data;
        const index = Array.isArray(children) && children.findIndex((d) => d.id === id);
        children[index]['name'] = name;
      },
      onPickValidityPeriod({ maxDate, minDate }) {
        console.log(maxDate, minDate);
      },
      async loadOneCustomerGroup(id) {
        const data = {
          group_id: id
        };
        try {
          const res = await this.$services.getGroupInfo({ data });
          res &&
            callback(
              res,
              () => {
                const groupData = res.datas[0];
                if (groupData) {
                  this.tagName = groupData.groupName;
                  this.frequencyState = String(groupData.groupType);
                  try {
                    this.conditions = JSON.parse(groupData.groupCondition).con;
                  } catch (err) {
                    this.conditions = [];
                    console.error('标签条件转换异常', err);
                  }
                }
              },
              () => {
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          console.log(err);
        }
      },
      handleResetDialog(group, node, event) {
        event.stopPropagation();
        this.resetDialogVisible = !this.resetDialogVisible;
        this.currentGroupId = group.id;
        this.currentNode = node;
        this.remark = group.remark;
      },
      async resetCustomerGroup() {
        let res = null;
        const data = {
          group_id: this.currentGroupId
        };
        try {
          res = await this.$services.customUserGroupOpUndoDel({ data });
          res &&
            callback(
              res,
              () => {
                this.getGroupList('', this.statusList, () => {});
                this.$message({
                  message: '恢复成功~',
                  type: 'success',
                  showClose: true
                });
                this.resetDialogVisible = false;
                this.$emit('tagSelect', {
                  id: window.CT.CUSTOMER_GROUP_ID,
                  group_type: '-1',
                  source: 'tree'
                });
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
  @invalidColor: #f2b044;
  @invalidBgColor: #fff8ed;

  .group-tree {
    box-sizing: border-box;

    .node {
      display: flex;
      flex-direction: row;
      width: 100%;

      .some {
        display: flex;
        width: auto;
        margin-right: 5px;
        align-items: center;
        .label {
          flex-grow: 1;
        }

        .ctrl {
          flex-grow: 0;
        }
        .invalid {
          width: 26px;
          height: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid @invalidColor;
          color: @invalidColor;
          background: @invalidBgColor;
          border-radius: 2px;
          & > div {
            font-size: 20px;
            transform: scale(0.5);
          }
        }
      }

      .iconfont-dmp {
        margin-left: 3px;
        font-size: @fontSizeH3;
        color: @colorBlueText;
      }

      .iconfont-dmp-selected {
        font-size: @fontSizeH4;
      }

      span.disabled {
        .iconfont-dmp {
          color: rgba(186, 186, 186, 0.7);
        }
      }
    }

    .line1 {
      .line-clamp(1);
      width: 144px;
    }
  }

  .transfer-dialog {
    .customer-group-condition {
      margin-left: 0;
      line-height: 23px;
    }

    .el-date-editor {
      width: 145px;
      margin-right: 10px;
    }
  }
</style>
