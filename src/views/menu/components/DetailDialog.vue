<template>
  <el-dialog width="740px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>模板信息</span>
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
  showDialog.value = true
  detailData.value = []
  // handleDetailData(JSON.parse(JSON.stringify(row)))
  findCategoryById(row.id)
}
/**
 * 获取详情
 */
const findCategoryById = async (id) => {
  const params = { id }
  try {
    let res = await http('findGoodsGroupById', params)
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
  console.log(data)

  const keysMap = new Map([
    ['name', '模板名称'],
    ['groupTypes', '模板类型'],
    ['startDateTime', '生效开始时间'],
    ['endDateTime', '生效结束时间'],
    ['status', '模板状态'],
    ['creator', '创建人'],
    ['modifier', '更新人'],
    ['createTime', '创建时间'],
    ['modifyTime', '更新时间']
  ])
  keysMap.forEach((key, value) => {
    if (value === 'groupTypes') {
      // console.log(data[value][0])
      if (data[value]) {
        switch (data[value][0]) {
          case '0':
            data[value] = '全部类型'
            break
          case '1':
            data[value] = '堂食'
            break
          case '2':
            data[value] = '扫码点餐'
            break
          case '3':
            data[value] = '外卖'
            break
          default:
            break
        }
      } else {
        data[value] = '全部类型'
      }
    }

    if (value === 'status') {
      switch (data[value]) {
        case 1:
          data[value] = '启用'
          break
        case -1:
          data[value] = '停用'
          break
        default:
          break
      }
    }

    data.startDateTime = `${dayjs(data.startDate).format('YYYY-MM-DD')} ${data.startTime}`
    data.endDateTime = `${dayjs(data.endDate).format('YYYY-MM-DD')} ${data.endTime}`

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
