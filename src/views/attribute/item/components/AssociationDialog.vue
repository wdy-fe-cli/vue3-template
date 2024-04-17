<template>
  <el-dialog width="740px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>关联店铺信息</span>
    </template>
    <!-- <el-form inline class="detail-form">
      <el-form-item :label="item.label" v-for="(item, index) in detailData" :key="index" :style="{ border: item.label ? '1px solid #e4e4e4' : '' }">
        <div>{{ item.value }}</div>
      </el-form-item>
    </el-form> -->
    <el-row class="b" style="border-width: 0.5px">
      <el-col :span="12" flex class="b" style="border-width: 0.5px" v-for="(item, index) in detailData" :key="index">
        <div style="background-color: #f2f3f6; padding: 6px 8px; width: 100px" flex="main:center cross:center" class="br tc item">
          {{ item.label }}
        </div>
        <div class="item sle" style="padding: 6px 8px; flex: 1">{{ item.value }}</div>
      </el-col>
    </el-row>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="showDialog = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { /* nextTick, */ ref } from 'vue'
import dayjs from 'dayjs'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'

const showDialog = ref(false)
const detailData = ref([])
/**
 * 父组件调弹框显示方法
 */
const show = (row) => {
  detailData.value = []
  // handleDetailData(JSON.parse(JSON.stringify(row)))
  findSuitStore(row.id)
}
/**
 * 获取详情
 */
const findSuitStore = async (id) => {
  const params = { propId: id }
  try {
    let res = await http('findSuitStore', params)
    if (res.isError) return showReqError(res)

    res.content.forEach((item, index) => {
      detailData.value.push({
        label: `关联店铺${index + 1}`,
        value: item.storeName,
      })

      if (res.content.length === 0) return

      showDialog.value = true
    })
  } catch (error) {
    console.log(error)
  }
}

defineExpose({ show })
</script>
<style lang="scss" scoped></style>
