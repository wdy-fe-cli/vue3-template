<!-- <template>
  <el-dialog width="630px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>分类信息</span>
    </template>
    <el-form label-width="100px" inline class="detail-form">
      <el-form-item :label="item.label" v-for="(item, index) in detailData" :key="index">
        <div style="width: 160px">{{ item.value }}</div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="showDialog = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template> -->
<template>
  <el-dialog width="930px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>分类信息</span>
    </template>

    <el-row class="b" style="border-width: 0.5px">
      <el-col :span="12" flex class="b" style="border-width: 0.5px" v-for="(item, index) in detailData" :key="index">
        <div style="background-color: #f2f3f6; padding: 6px 8px; width: 100px" flex="main:center cross:center" class="br tc item">
          {{ item.label }}
        </div>
        <div class="item sle" style="padding: 6px 8px; flex: 1">{{ item.value }}</div>
      </el-col>
    </el-row>

    <!-- <el-form inline class="detail-form">
      <el-form-item :label="item.label" v-for="(item, index) in detailData" :key="index" :style="{ border: item.label ? '1px solid #e4e4e4' : '' }">
        <div>{{ item.value }}</div>
      </el-form-item>
    </el-form> -->
    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="showDialog = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'

const showDialog = ref(false)
const detailData = ref([])
/**
 * 父组件调弹框显示方法
 */
const show = (row) => {
  showDialog.value = true
  detailData.value = []
  findCategoryById(row.id)
}
/**
 * 获取详情
 */
const findCategoryById = async (id) => {
  const params = { id }
  try {
    let res = await http('findCategoryById', params)
    if (res.isError) return showReqError(res)

    handleDetailData(res.content)
  } catch (error) {
    console.log(error)
  }
}

/**
 * 处理详情数据
 */
const handleDetailData = (data) => {
  const keysMap = new Map([
    ['name', '分类名称'],
    ['code', '编码'],
    ['creator', '创建人'],
    ['modifier', '更新人'],
    ['createTime', '创建时间'],
    ['modifyTime', '更新时间']
  ])
  keysMap.forEach((key, value) => {
    if (value === 'createTime' || value === 'modifyTime') {
      data[value] = dayjs(data[value]).format('YYYY-MM-DD HH:mm:ss')
    }

    detailData.value.push({
      label: key,
      value: data[value]
    })
  })
}

defineExpose({ show })
</script>
<style lang="scss" scoped></style>
