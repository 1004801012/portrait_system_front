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
  </div>
</template>

<script>
  import { callback, debounce, breadthQuery } from '@/common/func';

  export default {
    props: {
      groupName: {
        type: String,
        default: ''
      },
      groupImportType: {
        type: String,
        // 1静态
        // 2动态
        default: '1'
      }
    },
    data() {
      const { id } = this.$route.query;
      return {
        treeData: [],
        defaultProps: {
          id: 'id',
          label: 'name',
          tagCount: 'count',
          children: 'children'
        },
        expandIds: [],
        currentGroupId: id,
        currentNode: null,
        searchName: ''
      };
    },
    watch: {
      groupName: {
        handler: debounce(function (name) {
          if (Number(this.groupImportType) === 2) {
            this.getGroupList(name, this.statusList);
          } else {
            this.getStaticCustomUserGroupQry(name);
          }
        }, 800),
        immediate: true
      }
    },
    async mounted() {
      this.$bus.$on('updateGroupName', (groupId, newGroupName) => {
        console.log(groupId, newGroupName);
        this.updateGroupName(groupId, newGroupName);
      });
    },
    beforeDestroy() {
      this.$bus.$off('updateGroupName');
    },
    methods: {
      renderContent(h, { node, data, store }) {
        if (node.isLeaf) {
          const invalid = (
            <div class="invalid">
              <div>失效</div>
            </div>
          );
          return (
            <div class="node">
              <i class="iconfont-dmp iconfont-dmp-group-name"></i>
              <div class="some">
                <div class="label line1" title={node.label}>
                  {node.label}
                </div>
                {String(data.status) === '6' ? invalid : ''}
              </div>
            </div>
          );
        } else {
          if (node.expanded) {
            return (
              <span>
                {node.label}
                <span style="margin-left:4px">{data.count > 0 ? `(${data.count})` : ''}</span>
              </span>
            );
          } else {
            return (
              <span>
                {node.label}
                <span style="margin-left:4px">{data.count > 0 ? `(${data.count})` : ''}</span>
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
          this.currentGroupId = data.id;
          this.$emit('tagSelect', data);
        }
      },
      async getGroupList(name, statusList = '0,3,4,6', cb) {
        this.statusList = statusList;
        const data = {
          status_list: statusList
        };
        // 静态客群
        if (this.groupImportType !== '1') {
          data['group_import_type'] = this.groupImportType;
        }
        name && (data['group_name'] = name);
        let res = {};
        try {
          res = await this.$services.customUserGroupQry({ data });
          this.treeData = res.datas || [];
          console.log('this.treeData', this.treeData);
          if (Array.isArray(this.treeData) && this.treeData.length) {
            this.treeData = this.treeData.filter((t) => t.children && t.children.length);
          }
          if (typeof cb === 'function') {
            cb();
            this.$emit('tagSelect', {
              groupId: window.CT.CUSTOMER_GROUP_ID
            });
            return;
          }
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
        } catch (err) {
          console.error('err', err);
          this.treeData = [];
        }
      },
      async getStaticCustomUserGroupQry(name, groupImportType = '1') {
        console.log('getStaticCustomUserGroupQry');
        const data = {};
        name && (data['group_name'] = name);
        let res = {};
        try {
          res = await this.$services.staticCustomUserGroupQry({ data });
          this.treeData = res.datas;
          if (Array.isArray(this.treeData) && this.treeData.length) {
            this.treeData = this.treeData.filter((t) => t.children.length);
          }
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
          const groupData = firstTreeData.children[0];
          if (groupData) {
            groupData.source = 'tree';
            // 设置当前选中高亮
            this.$nextTick(() => {
              this.$refs.groupTree.setCurrentKey(groupData.id);
              this.currentGroupId = groupData.id;
            });
            this.$emit('tagSelect', groupData);
          } else {
            this.$emit('tagSelect', {
              groupId: window.CT.CUSTOMER_GROUP_ID
            });
          }
        } else {
          this.$emit('tagSelect', {
            groupId: window.CT.CUSTOMER_GROUP_ID
          });
        }
      },
      updateGroupName(id, name) {
        const parent = this.currentNode.parent;
        const children = parent.data.children || parent.data;
        const index = Array.isArray(children) && children.findIndex((d) => d.id === id);
        children[index]['name'] = name;
      },
      async loadOneCustomerGroup(id) {
        const data = {
          group_id: id
        };
        try {
          const res = await this.$services.customUserGroupQry({ data });
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
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less">

  @import '~mixins';

  .group-tree {
    box-sizing: border-box;

    .node {
      display: flex;
      flex-direction: row;
      width: 100%;

      .some {
        display: flex;
        width: 100%;
        margin-right: 5px;

        .label {
          flex-grow: 1;
        }

        .ctrl {
          flex-grow: 0;
        }
      }

      .iconfont-dmp {
        margin-left: 3px;
        font-size: @fontSizeH3;
        color: #999;
        margin-right: 5px;
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
