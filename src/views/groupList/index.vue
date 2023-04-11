<template>
<!--    <keep-alive v-if="$route.meta.keepalive">-->
<!--      <router-view class="keep-alive"></router-view>-->
  <group-list></group-list>
<!--    </keep-alive>-->
<!--    <router-view v-else></router-view>-->
</template>
<script setup lang="ts">
import GroupList from "@/views/groupList/groupList.vue";
</script>
