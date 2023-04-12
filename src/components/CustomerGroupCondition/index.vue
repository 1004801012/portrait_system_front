<template>
  <div class="customer-group-condition">
    <template v-for="(item, index) in conditions">
      <span class="condition-label"
        >（<div class="tag" v-if="item.desc">{{ item.desc }}</div>
        <template v-if="Array.isArray(item.sub) && item.sub.length">
          <template v-for="(subItem, subIndex) in item.sub">
            <i v-if="subItem.op + '' === '0'">或</i>
            <i v-if="subItem.op + '' === '3'">非</i>
            <div class="tag">{{ subItem.desc }}</div>
          </template> </template
        >）</span
      >
      <span v-if="conditions.length - 1 !== index">且</span>
    </template>
<!--    <router-link v-if="isCanEdit" class="edit-condition" :to="to()">-->
<!--      <i class="icon iconfont-dmp iconfont-dmp-edit"></i><span>编辑条件</span></router-link-->
<!--    >-->
  </div>
</template>

<script>
  export default {
    name: 'CustomerGroupCondition',
    props: {
      id: {
        type: [String, Number]
      },
      conditions: {
        type: Array,
        default() {
          return [];
        }
      },
      isCanEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      const query = this.$route && this.$route.query;
      const { modularId = '' } = query;
      return {
        modularId
      };
    },
    methods: {
      to() {
        if (this.id === 'previewXy' || this.id === 'previewYj') {
          return `groupAdd?id=${this.id}&modularId=${this.modularId}`;
        }
        if (this.$route.path === '/groupList') {
          return `groupAdd?id=${this.id}&modularId=${this.modularId}`;
        }
        return `groupAdd?id=${this.id}&isPreview=1&modularId=${this.modularId}`;
      }
    }
  };
</script>
<style lang="less" rel="stylesheet/less">

  @import '~mixins';

  .customer-group-condition {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    > div {
      .and:last-child {
        display: none;
      }
    }

    .iconfont-dmp {
      margin: 0 0 0 10px;
      font-size: 14px;
    }
    .condition-label {
      line-height: 26px;
    }
    i {
      padding: 0 5px;
      vertical-align: middle;
    }

    .edit-condition {
      color: @colorBlueMain;
      display: inline-block;

      span {
        display: inline-block;
        vertical-align: middle;
      }
    }
  }
  .tag {
    padding: 4px 8px;
    background: #eeeeee;
    border-radius: 2px;
    display: inline-block;
  }
</style>
