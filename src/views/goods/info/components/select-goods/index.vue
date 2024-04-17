<template>
  <el-dialog width="900px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>选择商品</span>
    </template>

    <div class="main-box" style="max-height: 80vh" flex>
      <TreeFilter
        class="filter_wrap"
        label="name"
        title="分类(单选)"
        :data="treeOptions"
        :need-all="true"
        :need-node="true"
        id="id"
        @change="changeTreeFilter"
        :default-value="currentCategoryId" />

      <div style="flex: 1; height: 500px" flex="dir:top main:justify">
        <div class="goods-wrap ml12" style="flex-wrap: wrap" flex>
          <div
            class="goods-item mb16 mr16 relative"
            v-for="(item, index) in goodsData"
            :key="index"
            @click="onGoodsItem(item)"
            :class="selectedGoodsIds.includes(item.sizeId) && 'selected'">
            <div flex style="flex-wrap: wrap">
              <el-image :src="item.picUrl" style="height: 80px; width: 80px; border-radius: 6px">
                <template #error>
                  <div class="image-slot ft32">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="info ml8" flex="dir:top main:justify" style="width: 100px">
                <div class="name">{{ item.goodsName }}</div>
                <div class="ft12">规格：{{ item.sizeTypeName }}</div>

                <div class="ft12">
                  <span>售价：</span>
                  <span>¥</span>
                  <span class="ft16 ml4" style="color: red">{{ item.price }}</span>
                </div>
              </div>

              <div class="select-icon" v-if="selectedGoodsIds.includes(item.sizeId)">
                <el-icon><CircleCheck /></el-icon>
              </div>
            </div>
          </div>
        </div>
        <div flex="main:right">
          <el-pagination background layout="total, prev, pager, next" :page-size="12" :total="goodsTotal" @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="showDialog = false">取消</el-button>
        <el-button v-blur type="primary" @click="onConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import { ElMessage } from 'element-plus'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'

const showDialog = ref(false)
const treeOptions = ref([])
const goodsData = ref([])
const goodsTotal = ref(0)

let selectedGoodsIds = ref([])
let selectedGoods = []

let currentCategoryId = ''
let currentPageNumber = 1

const emit = defineEmits(['confirm'])

/**
 * 确认保存
 */
const onConfirm = () => {
  emit('confirm', selectedGoodsIds.value, selectedGoods)
  showDialog.value = false
}
/**
 * 父组件调弹框显示方法
 */
const show = (data) => {
  // console.log(data)

  showDialog.value = true
  findCategoryTree()

  if (data) {
    // console.log(data)
    // console.log(selectedGoods)
    selectedGoodsIds.value = data.map((item) => item.sizeId)
    selectedGoods = data
  }
}

onMounted(() => {
  findCategoryTree()
})
/**
 * 切换分页
 */
const handleCurrentChange = (val) => {
  currentPageNumber = val
  findGoodsAndSizePageList()
}

/**
 * 点击商品item
 */
const onGoodsItem = (goodsItem) => {
  let tempIndex = selectedGoodsIds.value.findIndex((item) => item === goodsItem.sizeId)
  if (tempIndex >= 0) {
    selectedGoods.splice(tempIndex, 1)
    selectedGoodsIds.value.splice(tempIndex, 1)
  } else {
    selectedGoods.push(goodsItem)
    selectedGoodsIds.value.push(goodsItem.sizeId)
  }

  // console.log(selectedGoods, selectedGoodsIds)

  /* selectedGoods.push(goodsItem)
    selectedGoodsIds.value.push(goodsItem.sizeId) */
}
/**
 * 左侧树修改的值
 * @param {String} params 选中树代表的值
 */
const changeTreeFilter = (val) => {
  if (val.parentId === '0' && val.children.length <= 0) return
  if (val.parentId === '0') {
    currentCategoryId = val.children[0].id
  } else {
    currentCategoryId = val.id
  }

  findGoodsAndSizePageList()
}

/**
 * 查找商品列表
 */
const findGoodsAndSizePageList = async () => {
  const params = {
    categoryId: currentCategoryId,
    pageNumber: currentPageNumber,
    goodsType: '01',
    pageSize: 12
  }
  try {
    let res = await http('findGoodsAndSizePageList', params)
    if (res.isError) return showReqError(res)
    goodsTotal.value = Number(res.content.count)
    goodsData.value = res.content.items
  } catch (error) {
    console.log(error)
  }
}
/**
 * 获取地址信息树
 */
const findCategoryTree = async () => {
  try {
    let res = await http('findCategoryTree')
    if (res.isError) return showReqError(res)
    treeOptions.value = res.content
    findGoodsAndSizePageList()
  } catch (error) {
    console.log(error)
  }
}

defineExpose({ show })
</script>
<style lang="scss" scoped>
.filter_wrap {
  height: 525px;
  overflow: hidden;
}

.goods-wrap {
  // height: 525px;
  overflow: auto;
}

.goods-wrap::after {
  content: '';
  flex: auto;
}
.goods-item {
  position: relative;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 6px;
  padding: 6px;
  border: 1px solid var(--el-border-color-light);
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
