<template>
  <el-dialog width="740px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>属性信息</span>
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
  // handleDetailData(JSON.parse(JSON.stringify(row)))
  findCategoryById(row.id)
}
/**
 * 获取详情
 */
const findCategoryById = async (id) => {
  const params = { id }
  try {
    let res = await http('findPropById', params)
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
  // console.log(data)

  const keysMap = new Map([
    ['name', '属性名称'],
    ['className', '分类名称'],
    ['sequence', '排序码'],
    ['editEnable', '是否可以编辑'],
    ['isMustOption', '是否必选'],
    ['isRadio', '是否单选'],
    ['orgName', '创建组织'],
    ['isDiscount', '是否参与单品打折'],
    ['creator', '创建人'],
    ['modifier', '更新人'],
    ['createTime', '创建时间'],
    ['modifyTime', '更新时间']
    // ['picUrl', '属性图片'],
  ])
  keysMap.forEach((key, value) => {
    if (value !== 'sequence') {
      switch (data[value]) {
        case 0:
          data[value] = '否'
          break
        case 1:
          data[value] = '是'
          break
        case false:
          data[value] = '否'
          break
        case true:
          data[value] = '是'
          break
        default:
          break
      }
    }

    if (value === 'createTime' || value === 'modifyTime') {
      data[value] = dayjs(data[value]).format('YYYY-MM-DD HH:mm:ss')
    }

    if (value === 'picUrl') {
      // eslint-disable-next-line no-eval
      // data[value] = eval('<img src="http://192.168.10.213:8000/file/material/image/20230712152047113938317892070400.png" alt="logo" />')
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
