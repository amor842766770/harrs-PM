<template>
  <div class="dashboard-container">
    <page-tools :show-before="true">
      <span slot="before"> 知名女星夜宿ta家，只为做头发? </span>
      <!-- 插槽除了slot="name" v-slot -->
      <!-- slot="名称" v-slot:名称 -->
      <template v-slot:after>
        <el-button type="primary" size="mini"> 导入Excel </el-button>
      </template>
    </page-tools>
    <div class="dashboard-text">name: {{ name }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
