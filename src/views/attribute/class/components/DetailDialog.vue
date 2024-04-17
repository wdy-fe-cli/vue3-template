<template>
  <el-dialog width="930px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>属性分类信息</span>
    </template>
    <el-row class="b" style="border-width: 0.5px">
      <el-col :span="12" flex class="b" style="border-width: 0.5px" v-for="(item, index) in detailData" :key="index">
        <div style="background-color: #f2f3f6; padding: 6px 8px; width: 100px" flex="main:center cross:center" class="br tc item">
          {{ item.label }}
        </div>
        <!-- <div class="item sle" style="padding: 6px 8px; flex: 1">{{ item.value }}</div> -->
        <div class="item break-word" style="padding: 6px 8px; flex: 1; display: flex; align-items: center">
          <div>
            {{ item.value }}
          </div>
        </div>
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
let rowData = {}
/**
 * 父组件调弹框显示方法
 */
const show = (row) => {
  showDialog.value = true
  detailData.value = []
  // handleDetailData(JSON.parse(JSON.stringify(row)))
  rowData = JSON.parse(JSON.stringify(row))
  findCategoryById(row.id)
}
/**
 * 获取详情
 */
const findCategoryById = async (id) => {
  const params = { id }
  try {
    let res = await http('findPropclassById', params)
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
  data = Object.assign(data, rowData)

  const keysMap = new Map([
    ['name', '分类名称'],
    ['sequence', '排序码'],
    ['isMustOption', '是否必选'],
    ['isRadio', '是否单选'],
    ['orgName', '创建组织'],
    ['editEnable', '是否可以编辑'],
    ['isModifyQuantity', '是否允许修改数量'],
    ['', ''],
    ['creator', '创建人'],
    ['modifier', '更新人'],
    ['createTime', '创建时间'],
    ['modifyTime', '更新时间']
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

    detailData.value.push({
      label: key,
      value: data[value]
    })
  })
}

defineExpose({ show })
</script>
<style lang="scss" scoped></style>
