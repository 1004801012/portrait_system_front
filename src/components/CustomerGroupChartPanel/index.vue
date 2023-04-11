<template>
  <div class="chart-panel">
    <!-- 标题 -->
    <div class="head">
      <p class="title">
        {{ groupName }}
        <span class="tag">{{ usersTotalCount }}人</span>
      </p>
      <el-button v-if="panelType === 0" size="mini" type="primary" @click="checkEditType(titleBtn)"
        >{{ titleBtn }}
      </el-button>
    </div>

    <!-- 表单 -->
    <div class="content">
      <div class="left">
        <p class="label">选择分析维度：</p>
        <el-select
          v-model="dimensionsValue"
          size="mini"
          no-data-text="无数据"
          placeholder="请选择分析维度"
          :disabled="!editType"
          @change="dimensionsChange">
          <el-option v-for="item in options1" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <p class="label">选择X轴：</p>
        <el-button class="btn-mini" size="mini" :disabled="!editType" @click="selectTag('x')"
          >{{ xValue.name }}
        </el-button>
        <div v-if="dimensionsValue === 1 && xValue.type !== 'i'">
          <p class="label">选择取值分数段：</p>
          <el-select
            v-model="rangeValue"
            size="mini"
            no-data-text="无数据"
            placeholder="请选择分数段"
            :disabled="!editType">
            <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
        <p class="label">选择Y轴：</p>
        <el-button class="btn-mini" size="mini" :disabled="dimensionsValue === 1" @click="selectTag('y')"
          >{{ yValue.name }}
        </el-button>
        <el-button v-if="editType" class="btn-main" type="primary" round style="width: 100px" @click="displayChart">
          预览
        </el-button>
      </div>
      <div class="right">
        <div ref="chart" class="chart"></div>
        <div v-if="dimensionsValue === 1" class="panel">
          <i
            class="iconfont-dmp iconfont-dmp-bar"
            :class="{ actived: activedChart === 10, disabled: !editType }"
            @click="switchChart(10, false)"></i>
          <i
            class="iconfont-dmp iconfont-dmp-line"
            :class="{ actived: activedChart === 11, disabled: !editType }"
            @click="switchChart(11, false)"></i>
          <i
            class="iconfont-dmp iconfont-dmp-pie"
            :class="{ actived: activedChart === 12, disabled: !editType }"
            @click="switchChart(12, false)"></i>
        </div>
      </div>
      <el-button v-if="editType" class="btn-main" type="primary" round style="width: 180px" @click="saveChart"
        >保存视图
      </el-button>
    </div>

    <!-- 标签选择弹窗 -->
    <el-dialog title="标签选择" :visible.sync="modalTag" class="modal-tag" width="720px">
      <el-input v-model.trim="keyword" class="search-input" placeholder="输出标签关键字搜索">
        <i slot="prefix" class="iconfont-dmp iconfont-dmp-select"></i>
      </el-input>
      <div class="add-middle">
        <div class="left">
          <div class="attr-tag-tree">
            <div class="list">
              <el-tree
                :data="treeData"
                :props="defaultProps"
                :render-content="renderContent"
                :default-expand-all="true"
                :expand-on-click-node="false"
                :highlight-current="true"
                @node-click="handleNodeClick"></el-tree>
            </div>
          </div>
        </div>
        <div class="right">
          <el-radio-group v-model="radio" class="radio-group">
            <el-radio v-for="item in detailTagList" :key="item.name" :label="item" class="radio-item"
              >{{ item.name }}
            </el-radio>
          </el-radio-group>
        </div>
      </div>
      <div slot="footer" class="result-confirm">
        <el-button type="primary" round size="medium" @click="modalConfirm(0)">确定</el-button>
        <el-button type="primary" round size="medium" @click="modalCancel(0)">取消</el-button>
      </div>
    </el-dialog>

    <!-- 删除视图弹窗 -->
    <el-dialog title="系统提示" :visible.sync="modalDelete" class="modal-delete" width="510px">
      <p class="title-delete">是否删除该视图？</p>
      <div slot="footer" class="result-confirm">
        <el-button type="primary" round size="medium" @click="modalConfirm(1)">确定</el-button>
        <el-button type="primary" round size="medium" @click="modalCancel(1)">取消</el-button>
      </div>
    </el-dialog>

    <!-- 保存视图弹窗 -->
    <el-dialog title="保存视图模块" :visible.sync="modalSave" class="modal-save" width="510px">
      <div class="save-content">
        <el-input
          v-model.trim="viewName"
          type="text"
          placeholder="请输入客户列表名称"
          maxlength="16"
          show-word-limit></el-input>
        <!-- <el-checkbox v-model="saveChecked">保存视图后置顶显示</el-checkbox> -->
      </div>
      <div slot="footer" class="result-confirm">
        <el-button type="primary" round size="medium" @click="modalConfirm(2)">确定</el-button>
        <el-button type="primary" round size="medium" @click="modalCancel(2)">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import echarts from 'echarts';
  import {
    barChartOption,
    lineChartOption,
    pieChartOption,
    scatterChartOption,
    thremalChartOption,
    optionTarget
  } from '@/common/chartOption.js';
  import { callback, debounce, showChartNoData, checkErrorNoFunc } from '@/common/func';

  let chart = null;

  export default {
    props: {
      panelType: {
        type: Number,
        default: 0 // 0: 可切换编辑、预览模式，1：只有编辑模式
      },
      id: {
        type: [String, Number]
      },
      groupName: {
        type: String
      },
      usersTotalCount: {
        type: [String, Number]
      },
      viewParam: {
        type: Object
      }
    },
    data() {
      return {
        // 当前组件是否被重新创建
        newComponent: true,
        // 模式状态（编辑、预览）
        editType: this.panelType !== 0,
        titleBtn: '编辑',
        // 维度
        dimensionsValue: '',
        options1: [
          {
            value: 1,
            label: '一维'
          },
          {
            value: 2,
            label: '二维'
          }
        ],
        // X轴
        xValue: {
          name: '请选择标签',
          label: '',
          type: ''
        },
        // 分数段
        rangeValue: '',
        options2: [
          {
            value: 2,
            label: '2段'
          },
          {
            value: 3,
            label: '3段'
          },
          {
            value: 4,
            label: '4段'
          },
          {
            value: 5,
            label: '5段'
          },
          {
            value: 6,
            label: '6段'
          },
          {
            value: 7,
            label: '7段'
          },
          {
            value: 8,
            label: '8段'
          }
        ],
        // Y轴
        yValue: {
          name: '请选择标签',
          label: ''
        },
        // 当前选中的图表类型，10：柱状图、11：折线图、12：饼图、20：散点图、21：热力图
        activedChart: 10,
        chartData: [], // 图表数据
        // 标签选择弹窗
        modalTag: false,
        keyword: '',
        treeData: [], // 左侧标签层
        defaultProps: {
          id: 'id',
          children: 'children',
          label: 'label'
        },
        detailTagList: [], // 右侧标签组
        radio: {}, // 当前选中的标签对象
        tagType: '', // 标签类型，0：x轴标签，1：y轴标签

        // 删除弹窗
        modalDelete: false,

        // 保存弹窗
        modalSave: false,
        viewName: '',
        timerList: []
        // saveChecked: false
      };
    },
    created() {},
    mounted() {
      this.newComponent && this.initViewData();
      this.newComponent = false;
    },
    beforeDestroy() {
      this.clearTimeoutFunc();
    },
    watch: {
      keyword: function (val) {
        this.filterByKeyword();
      },
      viewParam: {
        handler: function (data) {
          // 组件初始化时不执行，切换数据时执行
          !this.newComponent && this.initViewData();
        },
        deep: true,
        immediate: true
      }
    },
    methods: {
      /**
       * 初始化视图数据
       */
      initViewData() {
        if (this.viewParam) {
          this.editType = false;
          this.titleBtn = '编辑';
          this.dimensionsValue = this.viewParam.viewDimension;
          this.activedChart = this.viewParam.viewPicType;
          this.viewName = this.viewParam.viewName;
          // x轴信息
          const xValueName = (this.viewParam.tagChName && this.viewParam.tagChName.split(';')[0]) || '';
          this.xValue.name = xValueName || this.viewParam.tagChName;
          const xValueLabel = (this.viewParam.viewTagName && this.viewParam.viewTagName.split(';')[0]) || '';
          this.xValue.label = xValueLabel || this.viewParam.viewTagName;
          this.xValue.type = this.viewParam.tagValueType;
          // 取值分数段
          this.rangeValue = this.viewParam.viewPartition;
          // y轴信息
          const yValueName = (this.viewParam.tagChName && this.viewParam.tagChName.split(';')[1]) || '';
          this.yValue.name = yValueName || '分布百分比';
          const yValueLabel = (this.viewParam.viewTagName && this.viewParam.viewTagName.split(';')[1]) || '';
          this.yValue.label = yValueLabel || '';
          this.customViewQry();
        }
      },
      /**
       * 预览、查看自定义视图数据
       */
      async customViewQry() {
        // 参数校验状态
        let state = true;
        const data = {
          dimension: this.dimensionsValue,
          picType: this.activedChart,
          groupId: this.id
        };
        // 预览、查看模式入参
        if (this.viewParam && this.viewParam.viewId && !this.editType) {
          data.viewId = this.viewParam.viewId;
        }
        // 预览：参数完整性校验
        if (this.editType) {
          if (!this.dimensionsValue) {
            state = false;
          }
          if (this.dimensionsValue === 1 && !this.xValue.label) {
            state = false;
          }
          if (this.dimensionsValue === 2) {
            if (!this.xValue.label || !this.yValue.label) {
              state = false;
            }
          }
        }
        if (!state) {
          this.$message({ message: '请将参数配置完整！', showClose: true });
          return;
        }
        // 维度入参
        if (this.dimensionsValue === 1) {
          data.tagName = this.xValue.label;
        } else if (this.dimensionsValue === 2) {
          data.tagName = `${this.xValue.label};${this.yValue.label}`;
        }
        // 一维：分数段入参
        if (this.rangeValue) {
          data.partition = this.rangeValue;
        }
        // 初始化图表对象
        chart = echarts.init(this.$refs.chart);
        try {
          const res = await this.$services.customViewDataQry({ data });
          res &&
            callback(
              res,
              () => {
                if (res.data) {
                  this.chartData = res.data;
                  this.switchChart(res.data.picType, true);
                }
              },
              () => {
                showChartNoData(chart, res.error_info);
                if (!checkErrorNoFunc(res.error_no)) {
                  const timer = setTimeout(() => {
                    this.customViewQry();
                  }, 3000);
                  this.timerList.push(timer);
                }
              }
            );
        } catch (err) {
          console.log('catch err', err);
        }
      },
      /**
       * 保存视图
       */
      async customViewSave() {
        const data = {
          tagName: this.dimensionsValue === 1 ? this.xValue.label : `${this.xValue.label};${this.yValue.label}`,
          dimension: this.dimensionsValue,
          picType: this.activedChart,
          groupId: this.id,
          viewName: this.viewName
        };
        if (this.rangeValue) {
          data.partition = this.rangeValue;
        }
        // if (this.saveChecked) {
        //   data.isTop = 1;
        // }
        try {
          const res = await this.$services.customViewSave({ data });
          res &&
            callback(
              res,
              () => {
                this.$message({ message: res.error_info, showClose: true });
                this.modalSave = false;
              },
              () => {
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          console.log('catch err', err);
        }
      },
      /**
       * 更新视图
       */
      async customViewUpdate() {
        const data = {
          tagName: this.dimensionsValue === 1 ? this.xValue.label : `${this.xValue.label};${this.yValue.label}`,
          dimension: this.dimensionsValue,
          picType: this.activedChart,
          groupId: this.id,
          viewName: this.viewName,
          viewId: this.viewParam.viewId,
          partition: this.rangeValue
        };
        // if (this.saveChecked) {
        //   data.isTop = 1;
        // }
        try {
          const res = await this.$services.customViewUpdate({ data });
          res &&
            callback(
              res,
              () => {
                this.$message({ message: res.error_info, showClose: true });
                this.modalSave = false;
                this.editType = false;
                this.titleBtn = '编辑';
                this.$emit('updateView', 'update');
              },
              () => {
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          console.log('catch err', err);
        }
      },
      /**
       * 删除视图
       */
      async customViewDelete() {
        const data = {
          viewId: this.viewParam.viewId
        };
        try {
          const res = await this.$services.customViewDelete({ data });
          res &&
            callback(
              res,
              () => {
                this.$message({ message: res.error_info, showClose: true });
                this.modalDelete = false;
                this.editType = false;
                this.titleBtn = '编辑';
                this.$emit('updateView', 'delete');
              },
              () => {
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          console.log('catch err', err);
        }
      },
      /**
       * 获取标签组数据
       */
      async customTagQry() {
        const data = {
          dimension: this.dimensionsValue,
          keyword: this.keyword,
          type: 1
        };
        try {
          const res = await this.$services.customTagQry({ data });
          res &&
            callback(
              res,
              () => {
                this.handleTagList(res.data && res.data.children);
              },
              () => {
                console.log('err', res);
              }
            );
        } catch (err) {
          console.log('catch err', err);
        }
      },
      /**
       * 处理标签数据
       */
      handleTagList(dataList) {
        const tagList = [];
        if (dataList.length) {
          dataList.forEach((item1) => {
            const obj = {
              id: item1.id,
              label: item1.name
            };
            if (item1.children && item1.children.length) {
              obj.children = [];
              item1.children.forEach((item2) => {
                const child = {
                  id: item2.id,
                  label: item2.name
                };
                if (item2.children && item2.children.length) {
                  child.childList = [];
                  item2.children.forEach((item3) => {
                    const tag = {
                      name: item3.c_tag_category_name,
                      label: item3.c_tag_english_name,
                      type: item3.c_tag_value_type,
                      unit: item3.c_tag_unit
                    };
                    child.childList.push(tag);
                  });
                }
                obj.children.push(child);
              });
            }
            tagList.push(obj);
          });
        }
        // 过滤空子节点
        if (tagList.length) {
          this.treeData = tagList.filter((item) => {
            return item.children && item.children.length;
          });
        }
      },
      /**
       * 渲染树节点
       */
      renderContent(h, { node, data, store }) {
        /* eslint-disable */
      if (node.isLeaf) {
        return (<span>< i class="iconfont-dmp iconfont-dmp-group-add"
                          style="font-size:12px;color:#54A7FD;margin-right:6px;"/>{node.label}</span>);
      } else {
        return <span>{node.label}</span>;
      }
    },
    /**
     * 点击节点事件
     */
    handleNodeClick(data, node) {
      if (node.isLeaf) {
        this.showDetailTagList(data.childList);
      }
    },
    /**
     * 展示具体标签组
     */
    showDetailTagList(tagList) {
      if (tagList && tagList.length) {
        this.detailTagList = tagList;
      } else {
        this.detailTagList = [];
      }
    },
    /**
     * 条件过滤标签组
     */
    filterByKeyword: debounce(function () {
      this.customTagQry();
      this.showDetailTagList([]);
    }, 500),
    /**
     * 切换编辑、删除模式
     */
    checkEditType(type) {
      if (type === '编辑') {
        this.editType = true;
        this.titleBtn = '删除';
      } else {
        this.modalDelete = true;
      }
    },
    /**
     * 切换维度事件
     */
    dimensionsChange() {
      this.rangeValue = '';
      this.activedChart = 10;
      this.xValue = {
        name: '请选择标签',
        label: ''
      };
      this.yValue = {
        name: '请选择标签',
        label: ''
      };
      this.showDetailTagList([]);
      // 清空chart
      chart && chart.clear();
    },
    /**
     * 预览视图
     */
    displayChart() {
      this.customViewQry();
    },
    /**
     * 切换图表
     */
    switchChart(type, isInit) {
      let dataList = this.chartData.dataList;
      let chartOption = {};
      // 求数据总和，用于算各项占比
      let allValue = 0;
      dataList instanceof Array && dataList.forEach(item => allValue += Number(item.num));
      if (this.editType || isInit) {
        this.activedChart = type;
        switch (type) {
          case 10:
            chartOption = barChartOption;
            chartOption.xAxis.data = dataList.map(item => item.dictName);
            chartOption.series.data = dataList.map((item, index) => {
              return {
                value: item.num,
                ratio: (item.num / allValue * 100).toFixed(2)
              }
            });
            chart.clear();
            if (allValue <= 0 || isNaN(allValue)) {
              showChartNoData(chart, '暂无数据')
            } else {
              chart.setOption(chartOption)
            }
            break;
          case 11:
            chartOption = lineChartOption;
            chartOption.legend.icon = 'circle';
            chartOption.legend.itemWidth = 8;
            chartOption.legend.itemHeight = 8;
            chartOption.xAxis.data = dataList.map(item => item.dictName);
            chartOption.series.data = dataList.map((item, index) => {
              return {
                value: item.num,
                ratio: (item.num / allValue * 100).toFixed(2)
              }
            });
            chart.clear();
            if (allValue <= 0 || isNaN(allValue)) {
              showChartNoData(chart, '暂无数据')
            } else {
              chart.setOption(chartOption)
            }
            break;
          case 12:
            chartOption = pieChartOption;
            chartOption.legend.data = dataList.map(item => item.dictName);
            chartOption.series.data = dataList.map(item => {
              allValue += item.num;
              return {
                value: item.num,
                name: item.dictName
              }
            });
            chart.clear();
            if (allValue <= 0 || isNaN(allValue)) {
              showChartNoData(chart, '暂无数据')
            } else {
              chart.setOption(chartOption)
            }
            break;
          case 20:
            chartOption = scatterChartOption;
            chartOption.series.data = dataList;
            chart.clear();
            if (!dataList.length) {
              showChartNoData(chart, '暂无数据')
            } else {
              chart.setOption(chartOption)
            }
            break;
          case 21:
            chartOption = thremalChartOption;
            let list = [];
            // 处理轴坐标数据
            this.chartData.firstDictName.forEach(i => {
              this.chartData.secondDictName.forEach(j => {
                list.push({
                  name: [i, j],
                  value: ''
                })
              })
            });
            list.forEach((item, index) => {
              item.value = dataList[index];
            });
            chartOption.series.data = list;
            // 处理数据范围
            let sortList = dataList.map(item => item[2]);
            chartOption.visualMap.min = sortList[0];
            chartOption.visualMap.max = sortList[sortList.length - 1];
            chart.clear();
            chart.setOption(thremalChartOption);
            break;
          case 100:
            let dataListCurrent = dataList || {}
            console.log("dataListCurrent: ", dataListCurrent);
            chartOption = optionTarget;
            let arr = []
            let dates = Object.keys(dataListCurrent).filter((key) => key);
            dates.forEach((key) => {
              let dataInfo = dataListCurrent[key] || {};
              if(data.subEntry){
                arr.push({
                  0: dataInfo.count || ''
                })
              } else {
                arr.push({
                  0: dataInfo.max || '0',
                  1: dataInfo.avg || '0',
                  2: dataInfo.min || '0',
                  3: dataInfo.median || '0',
                  4: dataInfo.count || '0'
                })
              }
            })
            let legendTitle = {
              0: '最大值',
              1: '平均值',
              2: '最小值',
              3: '中位数',
              4: '总和'
            }
            data.subEntry && (legendTitle[0] = '总和');
            let seriesTarget = []
            chartOption.legend.data = []
            if (arr && arr.length > 0) {
              Object.keys(arr[0]).forEach(key => {
                chartOption.legend.data.push(legendTitle[key]);
              })
              chartOption.legend.data.forEach((item, index) => {
                let obj = {
                  name: item,
                  type: 'line',
                  symbol: 'circle',
                  symbolSize: 5,
                  data: [],
                  yAxisIndex: 0
                }
                arr.forEach((o) => {
                  o && o[index] && obj.data.push(o[index]) || obj.data.push(null)
                })
                seriesTarget.push(obj)
              })
              chartOption.legend.show = !data.subEntry;
              chartOption.xAxis.data = dates.map((date) => date && date.length === 8 && date.substring(0, 4) + '.' + date.substring(4, 6) + "." + date.substring(6) || date);
              chartOption.series = seriesTarget;
              chart && chart.clear();
            };
            if (!arr.length) {
              showChartNoData(chart, '暂无数据');
            } else {
              chart && chart.setOption(chartOption)
              chart && chart.resize()
            }
            break;
        }
      }
    },
    /**
     * 保存视图
     */
    saveChart() {
      this.modalSave = true;
      // this.saveChecked = false;
    },
    /**
     * 开启标签选择弹窗
     */
    selectTag(param) {
      this.modalTag = true;
      this.radio = {};
      if (param === 'x') {
        this.tagType = 0;
      } else if (param === 'y') {
        this.tagType = 1;
      }
      this.customTagQry();
    },
    /**
     * 弹窗确认回调
     */
    modalConfirm(type) {
      if (type === 0) {
        this.rangeValue = '';
        this.modalTag = false;
        if (this.tagType === 0) {
          this.xValue = this.radio;
          // 一维时，y轴标签只展示x轴标签的单位
          if (this.dimensionsValue === 1) {
            // this.yValue.name = this.radio.unit;
            this.yValue.name = '分布百分比';
          }
        } else if (this.tagType === 1) {
          this.yValue = this.radio;
        }
      } else if (type === 1) {
        this.customViewDelete();
      } else {
        if (!this.viewName) {
          this.$message({message: '客户列表名称不能为空', showClose: true});
          return;
        }
        if (this.panelType === 0) {   // 编辑视图
          this.customViewUpdate();
        } else {    // 创建视图
          this.customViewSave();
        }

      }
    },
    /**
     * 弹窗取消回调
     */
    modalCancel(type) {
      if (type === 0) {
        this.modalTag = false;
      } else if (type === 1) {
        this.modalDelete = false;
      } else {
        this.modalSave = false;
      }
    },
    clearTimeoutFunc() {
      this.timerList.forEach(item => {
        clearTimeout(item);
      });
    }
  },
  components: {}
};
</script>

<style lang="less" rel="stylesheet/less" scoped>
@import 'style';
</style>
