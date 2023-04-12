<template>
  <div class="customer-group-picture customer-group-add">
    <!--属性列表-->
    <CustomerGroupAttrList />
    <div class="group-info">
      <div class="container">
        <div class="form-box">
          <!--          <el-button type="primary"-->
          <!--                     size="mini"-->
          <!--                     class="btn-clear"-->
          <!--                     @click="cancelCustomerGroup">清空条件-->
          <!--          </el-button>-->
          <p class="tips">选择左侧用户属性，进行客群查询，例如：</p>
          <div class="form-el">
            <label
              >定义条件：
              <em>(标签公式)</em>
            </label>
            <div class="label-formula">
              <!--标签公式-->
              <CustomerGroupLabelFormula ref="labelFormula" :conditionDatas="conditions" />
            </div>
          </div>
          <div class="actions-button">
            <el-button type="primary" round @click="dialogControlFunc">{{ saveButtonText }} </el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 对话框：系统提示 -->
    <el-dialog
      title="系统提示"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      center
      append-to-body
      class="customer-group-dialog"
      @close="cleanData">
      <el-form>
        <el-form-item>
          <el-input v-model.trim="groupName" placeholder="请输入客群名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" round size="medium" @click="dialogVisible = false">取 消 </el-button>
        <el-button type="primary" round size="medium" @click="saveCustomerGroup">确定 </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { callback, combineURLs } from '@/common/func';
  import { setGroupConditions, getGroupConditions, removeXYTagAttrExpandIds, getToken } from '@/common/auth';
  import { CustomerGroupAttrList, CustomerGroupCondition } from '@components';
  import CustomerGroupLabelFormula from './CustomerGroupLabelFormula';

  export default {
    data() {
      const query = this.$route && this.$route.query;
      const { id = '', isPreview = '' } = query;
      return {
        groupId: id,
        conditions: [],
        isPreview,
        dialogVisible: false,
        groupName: '',
        groupCondition: [],
        saveButtonText: id ? '保存' : '保存为客群',
        step: '1',
        importDialogVisible: false,
        uploadExcelName: '',
        actionUrl: '',
        actionData: {
          access_token: getToken()
        },
        uploadFileList: [],
        uploadGroupId: '',
        uploadGroupName: '',
        downloadExcelUrl: ''
      };
    },
    components: {
      CustomerGroupCondition,
      CustomerGroupAttrList,
      CustomerGroupLabelFormula
    },
    watch: {
      $route(to, from) {
        this.cancelCustomerGroup();
      }
    },
    mounted() {
      this.noPreviewEdit = this.groupId && this.groupId !== 'previewYj';
      console.log(0);
    },
    methods: {
      /**
       *  取消窗口时数据清空
       */
      cleanData() {
        this.groupName = '';
      },
      async goCustomerGroupPreview() {
        this.groupCondition = this.$refs.labelFormula.getGroupConditionDatas();
        console.log(this.groupCondition);
        if ((this.groupCondition && !this.groupCondition.con.length) || this.$refs.labelFormula.checkInputsEmpty()) {
          this.$message({ message: '定义条件不能为空', showClose: true });
          return;
        }
        setGroupConditions(JSON.stringify(this.groupCondition));
        console.log();
        this.$router.push(`groupPreview?editId=${this.groupId}&groupName=${encodeURIComponent(this.groupName)}`);
      },
      async dialogControlFunc() {
        if (this.noPreviewEdit) {
          this.saveCustomerGroup();
        } else {
          this.dialogVisible = !this.dialogVisible;
        }
      },
      cancelCustomerGroup() {
        this.$refs.labelFormula.clearGroupConditionDatas();
        this.groupCondition = [];
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
      async saveCustomerGroup() {
        if (!this.checkSpecificKey(this.groupName)) {
          this.$message({ message: '名称含有特殊字符', showClose: true });
          return;
        }
        let res = null;
        this.groupCondition = this.$refs.labelFormula.getGroupConditionDatas();
        console.log(this.groupCondition);
        if ((this.groupCondition && !this.groupCondition.con.length) || this.$refs.labelFormula.checkInputsEmpty()) {
          this.$message({ message: '定义条件不能为空', showClose: true });
          return;
        }
        console.log('=====>', JSON.stringify(this.groupCondition));

        const data = {
          group_condition: JSON.stringify(this.groupCondition)
        };

        try {
          // 新增客群
          if (this.groupName === '') {
            this.$message({ message: '客群名称不能为空', showClose: true });
            return;
          }
          data['group_name'] = this.groupName;
          res = await this.$services.customUserGroupAdd({ data });

          res &&
            callback(
              res,
              () => {
                this.$message({
                  message: '保存成功~',
                  showClose: true,
                  duration: 800
                });
                setTimeout(() => {
                  this.$router.push({
                    path: 'groupList'
                  });
                  removeXYTagAttrExpandIds();
                }, 1000);
              },
              () => {
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          console.log(err);
        }
      },
      importCustomerGroup() {
        this.goAgainImport();
        this.importDialogVisible = true;
      },
      removeFile(file) {
        this.uploadGroupId = '';
        this.uploadExcelName = '';
      },
      handleUpload(response, file) {
        console.log('handleUpload', response);
        response &&
          callback(
            response,
            () => {
              this.uploadGroupId = response.data;
              this.uploadExcelName = file.name;
            },
            () => {
              this.uploadGroupId = '';
              this.uploadExcelName = '';
              this.$message({ message: response.error_info, showClose: true });
            }
          );
      },
      async saveImportCustomerGroup() {
        if (!this.checkSpecificKey(this.uploadGroupName)) {
          this.$message({ message: '名称含有特殊字符', showClose: true });
          return;
        }
        // 上传操作，成功之后弹框输入客群名称
        if (!this.uploadGroupName) {
          this.$message({ message: '客群名称不能为空', showClose: true });
          return;
        }
        const data = {
          group_id: this.uploadGroupId,
          group_name: this.uploadGroupName
        };
        let response = null;
        try {
          response = await this.$services.updateUserGroupExcelImportName({ data });
          response &&
            callback(
              response,
              () => {
                this.step = '3';
              },
              () => {
                this.$message({ message: response.error_info, showClose: true });
              }
            );
        } catch (e) {
          this.$message({ message: '保存失败', showClose: true });
        }
      },
      goToCustomerGroup() {
        this.$router.push('groupList?activeName=delGroup');
      },
      goAgainImport() {
        this.step = '1';
        this.uploadGroupId = '';
        this.uploadGroupName = '';
        this.uploadExcelName = '';
        this.$refs.uploadFile && this.$refs.uploadFile.clearFiles();
      },
      nextStep() {
        if (!this.uploadGroupId) {
          this.$message({ message: '请先上传文件', showClose: true });
          return;
        }
        this.step = '2';
      },
      importDialogClose() {
        this.uploadFileList = [];
      }
    }
  };
</script>

<style rel="stylesheet/less" lang="less">
  @import './style.less';
</style>
