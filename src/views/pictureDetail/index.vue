<template>
<div class="picture-detail-container">
  <div class="person-body">
    <div class="person-body-bg" :class="{
    'man-bg': sex === 0,
    'woman-bg': sex === 1
  }"></div>
    <div class="info-left">
      <div class="info-container basic-info" :class="{'dot-animate': showAnimate[0]}">
        <div v-for="(item, index) in pictureDetail[0].label_list" :key="item.label_en_nane + index" class="tag-info-item">
          <span class="label">{{ item.label_zh_name }}</span>
          <span class="value">{{ item.label_value }}</span>
        </div>
        <div class="after-tag ">
          <div class="point-dot"></div>
        </div>
      </div>
      <div class="info-container earnings-info" :class="{'dot-animate': showAnimate[1]}">
        <div v-for="(item, index) in pictureDetail[1].label_list" :key="item.label_en_nane + index" class="tag-info-item">
          <span class="label">{{ item.label_zh_name }}</span>
          <span class="value">{{ item.label_value }}</span>
        </div>
        <div class="after-tag">
          <div class="point-dot"></div>
        </div>
      </div>
    </div>
    <div class="info-right">
      <div class="info-container stock-info" :class="{'dot-animate':showAnimate[2]}">
        <div v-for="(item, index) in pictureDetail[2].label_list" :key="item.label_en_nane + index" class="tag-info-item">
          <span class="label">{{ item.label_zh_name }}</span>
          <span class="value">{{ item.label_value }}</span>
        </div>
        <div class="after-tag">
          <div class="point-dot"></div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'PictureDetail',
  data () {
    return {
      fundAccount: '',
      pictureDetail: [[], [], []],
      showAnimate: [true, false, false],
    }
  },
  activated () {
    this.fundAccount = this.$route.query.fundAccount
    this.getPictureDetail()
    this.setAnimation()
  },
  methods: {
    async getPictureDetail() {
      try {
        const res = await this.$services.getUserPortraitInfo({
          data: {
            fund_account: this.fundAccount
          }
        })
        if (res && res.error_no === '0') {
          this.pictureDetail = res.datas
          console.log(this.pictureDetail)
        }
      } catch (e) {
        console.log(e)
      }
    },

    setAnimation () {
      let cur = 0 // 当前移动到的点
      let that = this
      this.interval = setInterval(() => {
        let back = cur

        cur = cur >= 2 ? 0 : cur + 1

        this.$set(that.showAnimate, back, false)
        this.$set(that.showAnimate, cur, true)
      }, 4500)
    }
  },
  computed: {
    sex () {
      const category = this.pictureDetail.find(item => item.label_category === 1)
      if (category) {
        const sexTag = category.label_list.find(item => item.label_en_nane === 'client_sex')
        if (sexTag) {
          return +sexTag.label_value
        }
        return 2
      }
      return 2
    }
  }
}
</script>

<style scoped lang="less">
@import "style";
</style>
