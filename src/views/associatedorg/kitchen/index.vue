<template>
  <page :has-handler="false">
    <div v-if="!orgStore.isStore" class="mb24">
      <span class="info-title ml8">选择店铺：</span>
      <store-select v-model:storeId="currentStoreId" :emit-path="false" class="w240" @changeStore="changeStore" />
    </div>
    <div class="main-box" style="max-height: 72vh" flex>
      <CTreeFilter
        label="name"
        title="分类(单选)"
        :data="treeOptions"
        :need-all="true"
        :need-node="true"
        id="id"
        v-auth="'findCategoryTreeForPrinter'"
        @change="changeTreeFilter"
        @setCategoryPrinter="setCategoryPrinter"
        :default-value="currentCategoryId" />

      <div style="flex: 1" flex="dir:top main:justify">
        <div class="goods-wrap ml12" style="flex-wrap: wrap" flex>
          <div class="goods-item mb16 mr16" style="position: relative" v-for="(item, index) in goodsData" :key="index" @click="onGoodsItem(item)">
            <div flex style="flex-wrap: wrap">
              <el-image :src="item.picUrl" style="height: 80px; width: 80px; border-radius: 6px">
                <template #error>
                  <div class="image-slot ft32">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="info ml8" flex="dir:top main:justify" style="width: 160px">
                <div class="name">{{ item.name }}</div>
                <div class="color-warning ft12" v-if="item.isPrint === 0">不打印</div>
                <div class="color-warning ft12" v-else-if="item.isPrint === 1 && item.printerList && item.printerList.length > 0">
                  {{ item.printerList.length > 1 ? `已设置 ${item.printerList.length} 个` : item.printerList[0].printerName }}
                </div>
                <div class="color-warning ft12" v-else>与分类一致</div>
                <!-- <div flex="main:justify" v-if="item.isPrint !== 0"> -->
                <div flex="main:justify">
                  <el-button type="primary" link @click="setPrinter(item)" v-auth="'printerRelReceiptAdd'">设置打印机</el-button>
                  <el-popconfirm title="确认该商品设为不打印?" @confirm="setNoPrinter(item)">
                    <template #reference>
                      <el-button type="primary" link v-auth="'setToNotPrint'">设为不打印</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div flex="main:right">
          <el-pagination background layout="total, prev, pager, next" :page-size="12" :total="goodsTotal" @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>
    <AddOrEditDialog ref="addOrEditDialogRef" @dialogClosed="dialogClosed"></AddOrEditDialog>
  </page>
</template>

<script setup name="kitchen">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'

import AddOrEditDialog from './components/AddOrEditDialog.vue'
import CTreeFilter from './components/TreeFilter/index.vue'
import StoreSelect from '@/views/components/select-store/index.vue'

import { showReqError } from '@/hooks/useError'

import { useOrgStore } from '@/store/modules/org'

import { getStorage } from '@/utils/storage'

import { http } from '@/api'

// 弹框的元素
const addOrEditDialogRef = ref()
const orgStore = useOrgStore()

const treeOptions = ref([])
const goodsData = ref([])
const goodsTotal = ref(0)

let selectedSizeIds = ref([])
let selectedGoods = ref([])

let currentCategoryId = ref('')
let currentStoreId = ref('')
let currentPageNumber = 1

// let storeId = getStorage('orgId')

defineProps({
  needInput: {
    type: [Boolean, String],
    default: true
  }
})

/**
 * 新增编辑等弹框关闭，刷新列表
 */
const dialogClosed = () => {
  findCategoryTree()
}

/**
 * 修改店铺
 */
const changeStore = (val) => {
  // console.log(val)
  // findGoodsList()
  // console.log(val.value)
  // ruleForm.value.storeId = storeId
  currentStoreId.value = JSON.parse(JSON.stringify(val.value))
  console.log(currentStoreId.value)

  findCategoryTree()
}
/**
 * 设置分类打印机
 */
const setCategoryPrinter = (data) => {
  // console.log('111', data)
  if (!orgStore.isStore && !currentStoreId.value) {
    return ElMessage.warning('请先选择店铺')
  }
  addOrEditDialogRef.value.show(data, 'category', currentStoreId.value)
}

/**
 * 设置打印机
 */
const setPrinter = (data) => {
  if (!orgStore.isStore && !currentStoreId.value) {
    return ElMessage.warning('请先选择店铺')
  }
  addOrEditDialogRef.value.show(data, 'goods', currentStoreId.value)
}
/**
 * 设置不打印
 */
const setNoPrinter = async (row) => {
  if (!orgStore.isStore && !currentStoreId.value) {
    return ElMessage.warning('请先选择店铺')
  }
  const params = {
    ...row,
    storeId: currentStoreId.value,
    goodsId: row.id
  }
  // console.log(JSON.parse(JSON.stringify(currentStoreId.value)))
  try {
    let res = await http('setToNotPrint', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('设置成功')
    dialogClosed()
  } catch (error) {
    console.log(error)
  }
}

/**
 * 切换分页
 */
const handleCurrentChange = (val) => {
  currentPageNumber = val
  findGoodsList()
}
/**
 * 设置选中的数据
 */
const setData = (data) => {
  console.log(data)
  if (data) {
    selectedGoods.value = data
    selectedSizeIds.value = selectedGoods.value.map((item) => item.sizeId)
  }
}

/**
 * 点击商品item
 */
const onGoodsItem = () => {}
/**
 * 左侧树修改的值
 * @param {String} params 选中树代表的值
 */
let parentId = ref('')
const changeTreeFilter = (val) => {
  console.log(val)
  if (val.parentId === '0' && val.children.length <= 0) return
  if (val.parentId === '0') {
    // currentCategoryId.value = val.children[0].id
    currentCategoryId.value = val.id
    parentId.value = '0'
  } else {
    currentCategoryId.value = val.id
    parentId.value = val.parentId
  }
  findGoodsList()
  // findCategoryTree()
}

/**
 * 查找商品列表
 */
const findGoodsList = async () => {
  const params = {
    // categoryId: currentCategoryId.value,
    pageNumber: currentPageNumber,
    goodsType: '01',
    pageSize: 12,
    storeId: currentStoreId.value || getStorage('orgId')
  }

  if (parentId.value === '0') {
    params.categoryId = undefined
    params.parentCategoryId = currentCategoryId.value
  } else {
    params.categoryId = currentCategoryId.value
    params.parentCategoryId = undefined
  }

  try {
    let res = await http('findPageListForPrinter', params)
    if (res.isError) return showReqError(res)
    goodsTotal.value = Number(res.content.count)
    goodsData.value = res.content.items
  } catch (error) {
    console.log(error)
  }
}

/**
 * 获取分类树
 */
const findCategoryTree = async () => {
  let params = {
    storeId: currentStoreId.value || getStorage('orgId')
  }

  try {
    let res = await http('findCategoryTreeForPrinter', params)
    if (res.isError) return showReqError(res)
    treeOptions.value = res.content
    // console.log(treeOptions.value)
    findGoodsList()
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  selectedSizeIds.value = []
  selectedGoods.value = []

  setData()

  findCategoryTree()
})
</script>
<style lang="scss" scoped>
.goods-wrap::after {
  content: '';
  flex: auto;
}
.goods-item {
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light);
  padding: 6px;
  .select-icon {
    background-color: #ffffff;
    position: absolute;
    right: -8px;
    top: -8px;
    font-size: 20px;
    height: 20px;
    z-index: 1;
    color: var(--el-color-primary) !important;
  }
  .info {
    .name {
      font-size: 15px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; /* 设置行数 */
      -webkit-box-orient: vertical;
    }
  }
}
.selected {
  border-color: var(--el-color-primary) !important;
}
.goods-item:hover {
  border-color: var(--el-color-primary) !important;
}
</style>
