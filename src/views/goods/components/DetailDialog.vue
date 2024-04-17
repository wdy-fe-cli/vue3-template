<template>
  <el-dialog width="930px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>商品信息</span>
    </template>
    <el-row class="b" style="border-width: 0.5px">
      <el-col :span="12" flex class="b" style="border-width: 0.5px" v-for="(item, index) in detailData" :key="index">
        <div style="background-color: #f2f3f6; padding: 6px 8px; width: 100px" flex="main:center cross:center" class="br tc item">
          {{ item.label }}
        </div>
        <!-- sle单行文本溢出省略号  -->
        <!-- <div class="item sle" style="padding: 6px 8px; flex: 1">{{ item.value }}</div> -->
        <!-- break-word多行文本自动换行  -->
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
/**
 * 父组件调弹框显示方法
 */
const show = (row) => {
  showDialog.value = true
  detailData.value = []
  // handleDetailData(JSON.parse(JSON.stringify(row)))
  findCategoryById(row.id, row)
}
/**
 * 获取详情
 */
const findCategoryById = async (id, row) => {
  const params = { id }
  // console.log(params)
  try {
    let res = await http('findGoodsById', params)
    if (res.isError) return showReqError(res)

    handleDetailData(res.content, row)
  } catch (error) {
    console.log(error)
  }
}

/**
 * 处理详情数据
 */
const handleDetailData = (data, item) => {
  // console.log(data)

  const keysMap = new Map([
    ['goodsType', '商品类型:'],
    ['name', '商品名称:'],
    ['janeSearch', '简码:'],
    ['price', '基准价格:'],
    ['goodsPackageList', '套餐商品:'], // 数组

    ['categoryName', '商品分类:'], // ⭐
    ['statisCategoryName', '统计分类:'], // ⭐
    ['sequence', '排序码：'],
    ['unit', '单位:'],
    ['sizeList', '商品规格:'], // 数组
    ['propList', '商品属性:'], // 数组
    ['labelIdList', '商品标签:'], // 数组
    ['hotTag', '辣度:'],
    ['isPrint', '是否打印:'],
    ['isTemp', '是否临时菜:'],
    ['isDiscount', '是否打折:'],
    ['isSupportPackage', '是否支持打包:'],
    ['isPackaging', '是否打包盒商品:'],
    ['isShowInEbook', '是否显示电子菜谱:'],

    ['minSell', '起售数:'],
    ['minAdd', '最小累加数:'],

    ['creator', '创建人:'],
    ['modifier', '更新人:'],
    ['createTime', '创建时间:'],
    ['modifyTime', '更新时间:']
    /* ['picUrl', '商品主图'],
    ['description', '商品介绍'] */
  ])
  keysMap.forEach((key, value) => {
    if (value === 'categoryName' || value === 'statisCategoryName') {
      // 无数据直接跳过
      if (!item[value] || item[value].length === 0) {
        return
      }

      detailData.value.push({
        label: key,
        value: item[value]
      })
    } else {
      // 数组类型处理=====👇
      // 商品规格
      if (value === 'sizeList') {
        // 商品规格
        let str = ''
        data[value]
          ? data[value].forEach((tempItem) => {
              str += `${tempItem.sizeTypeName}    ￥${tempItem.price}  `
            })
          : []
        data[value] = str
      }

      // 商品属性
      if (value === 'propList') {
        let str = ''
        data[value]
          ? data[value].forEach((tempItem) => {
              str += `${tempItem.className}  `
            })
          : []
        data[value] = str
      }

      // 商品标签
      if (value === 'labelIdList') {
        let str = ''
        data[value]
          ? data[value].forEach((tempItem) => {
              str += tempItem === '1' ? '推荐菜  ' : tempItem === '2' ? '新品  ' : '招牌菜  '
            })
          : []
        data[value] = str
      }

      // 套餐商品
      if (value === 'goodsPackageList') {
        let str = ''
        data[value]
          ? data[value].forEach((tempItem) => {
              // 套餐商品名称+价格x数量
              str += `${tempItem.name}x${tempItem.num}  `
              str += '  '
            })
          : []
        data[value] = str
      }

      // 数组类型处理=====👆

      if (
        value === 'isPrint' ||
        value === 'isTemp' ||
        value === 'isDiscount' ||
        value === 'isSupportPackage' ||
        value === 'isPackaging' ||
        value === 'isShowInEbook'
      ) {
        switch (data[value]) {
          case 0:
            data[value] = '否'
            break
          case 1:
            data[value] = '是'
            break
          default:
            break
        }
      }

      if (value === 'goodsType') {
        // console.log(data[value])
        switch (data[value]) {
          case '01':
            data[value] = '普通商品'
            break
          case '02':
            data[value] = '普通套餐'
            break
          case '03':
            data[value] = '称重商品'
            break
          case '04':
            data[value] = '组合套餐'
            break
          default:
            break
        }
      }

      // 不辣,微辣,中辣,重辣
      if (value === 'hotTag') {
        switch (data[value].toString()) {
          case '0':
            data[value] = '不辣'
            break
          case '1':
            data[value] = '微辣'
            break
          case '2':
            data[value] = '中辣'
            break
          case '3':
            data[value] = '重辣'
            break
          default:
            break
        }
      }

      // 基准价格加前置￥符号
      if (value === 'price') {
        data[value] = data[value] ? `￥${data[value]}` : data[value]
      }

      if (value === 'createTime' || value === 'modifyTime') {
        data[value] = dayjs(data[value]).format('YYYY-MM-DD HH:mm:ss')
      }

      // 无数据直接跳过
      if (!data[value]) {
        return
      }

      detailData.value.push({
        label: key,
        value: data[value]
      })
    }
  })
}

defineExpose({ show })
</script>
<style lang="scss" scoped></style>
