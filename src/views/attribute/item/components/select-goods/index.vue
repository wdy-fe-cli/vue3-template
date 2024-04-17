<template>
  <el-dialog width="1000px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>选择商品</span>
    </template>

    <div class="main-box" style="max-height: 80vh" flex v-if="showDialog">
      <TreeFilter
        style="height: 525px; overflow: hidden"
        label="name"
        title="分类(单选)"
        :data="treeOptions"
        :need-all="true"
        :need-node="true"
        id="id"
        v-auth="'findCategoryTree'"
        @change="changeTreeFilter"
        :default-value="currentCategoryId"
      />

      <div style="flex: 1" flex="dir:top main:justify">
        <div class="goods-wrap ml12" style="flex-wrap: wrap" flex>
          <div class="goods-item mb16 mr16 relative" v-for="(item, index) in goodsData" :key="index" @click="onGoodsItem(item)" :class="selectedGoodsIds.includes(item.id) && 'selected'">
            <div flex style="flex-wrap: wrap">
              <el-image :src="item.picUrl" style="height: 80px; width: 80px; border-radius: 6px">
                <template #error>
                  <div class="image-slot ft32">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="info ml8" flex="dir:top main:justify" style="width: 100px">
                <div class="name">{{ item.name }}</div>
                <!-- <div class="ft12">规格：{{ item.sizeTypeName }}</div> -->

                <!-- <div class="ft12">
                  <span>售价：</span>
                  <span>¥</span>
                  <span class="ft16 ml4" style="color: red">{{ item.price }}</span>
                </div> -->
              </div>

              <div class="select-icon" v-if="selectedGoodsIds.includes(item.id)">
                <el-icon><CircleCheck /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页器 -->
        <div flex="main:justify" class="ml12">
          <div>
            <el-checkbox v-model="isChecked" size="mini" style="padding: 0px; margin-right: 5px" @change="handleCheckAllChange"> 全选 </el-checkbox>
          </div>

          <el-pagination background layout="total, prev, pager, next" :page-size="12" :total="goodsTotal" @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>

    <!-- 底部操作按钮  -->
    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="showDialog = false">取消</el-button>
        <el-button v-blur type="primary" @click="onConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { getStorage } from '@/utils/storage.js'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'

const route = useRoute()
let isChecked = ref(false)

const showDialog = ref(false)
const treeOptions = ref([])
const goodsData = ref([])
const goodsTotal = ref(0)

let selectedGoodsIds = ref([])
let selectedGoods = []
let delGoodsIdList = []

let currentCategoryId = ''
let currentPageNumber = 1

// 全选按钮勾上的方法事件
const handleCheckAllChange = () => {
  selectedGoodsIds.value = [...new Set(selectedGoodsIds.value)]

  // 全选
  if (isChecked.value) {
    goodsData.value.forEach((item) => {
      // 如果该项的 id 值不在 selectedGoodsIds 数组中，则向 selectedGoodsIds 数组添加该 id

      if (!selectedGoodsIds.value.includes(item.id)) {
        selectedGoodsIds.value.push(item.id)
      }
      // 如果该项的 id 值在 delGoodsIdList 数组中，则移除该 id
      if (delGoodsIdList.includes(item.id)) {
        delGoodsIdList.splice(delGoodsIdList.indexOf(item.id), 1)
      }
    })
  } else {
    // 取消全选
    goodsData.value.forEach((item) => {
      // 如果该项的 id 值在 selectedGoodsIds 数组中，则从 selectedGoodsIds 数组中移除该 id
      if (selectedGoodsIds.value.includes(item.id)) {
        selectedGoodsIds.value.splice(selectedGoodsIds.value.indexOf(item.id), 1)
      }
      // 如果该项的 id 值不在 delGoodsIdList 数组中，并且打开默认是勾选状态的，则向 delGoodsIdList 数组添加该 id
      if (!delGoodsIdList.includes(item.id) && item.isCheck) {
        delGoodsIdList.push(item.id)
      }
    })
  }
}

/**
 * 确认保存
 */
const onConfirm = async () => {
  let tempList = []
  propList.value.forEach((item) => {
    tempList.push({
      classId: item.classId,
      propId: item.id,
    })
  })

  let params = {
    goodsIds: selectedGoodsIds.value,
    operateType: '1',
    orgId: getStorage('orgId'),
    propList: tempList,
  }
  let res = await http('bindGoodsForBatch', params)
  // 注：只有批量绑定，没有解绑，每次勾选几个就是几个选中的值
  if (res.isError) return showReqError(res)
  ElMessage.success('绑定成功')
  showDialog.value = false
  dialogClosed()
}

const emit = defineEmits(['dialogClosed'])
const dialogClosed = () => {
  emit('dialogClosed')
}

let propList = ref([])

/**
 * 父组件调弹框显示方法
 */
const show = (data) => {
  // 只有批量绑定，不需要回显，每次选中的值都是最新绑定商品内容，无需解绑

  propList.value = data

  currentPageNumber = 1
  // 每次打开，置空需要删除的商品列表
  delGoodsIdList = []
  // 分页获取商品列表
  findGoodsList()

  showDialog.value = true
  selectedGoodsIds.value = []
  findCategoryTree()
}

onMounted(() => {
  selectedGoodsIds.value = []
  selectedGoods = []
  delGoodsIdList = []
  findCategoryTree()
})
/**
 * 切换分页
 */
const handleCurrentChange = (val) => {
  currentPageNumber = val
  findGoodsList()
}

/**
 * 点击商品item
 */
// let tempSelectedGoods = []
const onGoodsItem = (goodsItem) => {
  // 去重 选中商品id列表
  selectedGoodsIds.value = [...new Set(selectedGoodsIds.value)]
  // 判断该商品是否已经勾选
  let tempIndex = selectedGoodsIds.value.findIndex((item) => item === goodsItem.id)
  // 取消勾选
  if (tempIndex >= 0) {
    // 从勾选列表中移除该商品
    selectedGoodsIds.value.splice(tempIndex, 1)
    // 如果isCheck 存在，则表明，这个是之前已经确认过的商品，因此此时取消选中则意味着删除该商品 ，反之则是重复勾选取消，但未真正意义上架
    if (goodsItem.isCheck) {
      delGoodsIdList.push(goodsItem.id)
    }
  }
  // 勾选
  else {
    // 如果之前是上架商品
    if (goodsItem.isCheck) {
      // 如果isCheck,则意味着该商品是上架商品，此时该上架商品又被勾上，则在删除商品中过滤是否有该商品，有的话则删除。（例如：上架商品被取消勾选，之后又重新勾回去情形）
      let tempIndex2 = delGoodsIdList.findIndex((item) => item === goodsItem.id)
      delGoodsIdList.splice(tempIndex2, 1)
    }
    // 如果之前不是上架商品，则添加
    selectedGoodsIds.value.push(goodsItem.id)
  }

  // 根据回显勾选状态，判断全选按钮选中状态
  const tempIsChecked = goodsData.value.every((item) => selectedGoodsIds.value.includes(item.id))
  if (tempIsChecked) {
    isChecked.value = true
  } else {
    isChecked.value = false
  }
}

let parentId = ref('')

/**
 * 左侧树修改的值
 * @param {String} params 选中树代表的值
 */
const changeTreeFilter = (val) => {
  console.log(val)

  if (val.parentId === '0' && val.children.length <= 0) return
  if (val.parentId === '0') {
    parentId.value = '0'
    // currentCategoryId = val.children[0].id
    currentCategoryId = val.id
  } else {
    currentCategoryId = val.id
    parentId.value = val.parentId
  }

  findGoodsList()
  // onGoodsItem()

  // console.log(selectedGoodsIds)
  // console.log(selectedGoods)
}

/**
 * 查找商品列表
 */
const findGoodsList = async () => {
  const params = {
    orgId: getStorage('orgId'),
    pageNumber: currentPageNumber,
    pageSize: 12,
  }

  if (parentId.value === '0') {
    params.categoryId = undefined
    params.parentCategoryId = currentCategoryId
  } else {
    params.categoryId = currentCategoryId
    params.parentCategoryId = undefined
  }
  // console.log(params, selectedGoods)
  // console.log(selectedGoodsIds)
  try {
    let res = await http('findGoodsList', params)
    if (res.isError) return showReqError(res)
    goodsTotal.value = Number(res.content.count)
    goodsData.value = res.content.items
    if (currentPageNumber === 1) {
      selectedGoods = goodsData.value.filter((item) => item.isCheck)
    } else {
      selectedGoods = [...selectedGoods, ...goodsData.value.filter((item) => item.isCheck)]
    }

    // 根据回显勾选状态，判断全选按钮选中状态
    const tempIsChecked = goodsData.value.every((item) => selectedGoodsIds.value.includes(item.id))
    if (tempIsChecked) {
      isChecked.value = true
    } else {
      isChecked.value = false
    }

    /* let tempSelectedGoods = selectedGoods.map((item) => item.id)
    if (selectedGoodsIds.value.length === tempSelectedGoods.length) {
      selectedGoodsIds.value = selectedGoods.map((item) => item.id)
    } else {
      selectedGoodsIds.value = selectedGoodsIds.value.concat(tempSelectedGoods)
    } */
    selectedGoodsIds.value = selectedGoodsIds.value.concat(selectedGoodsIds.value)

    // selectedGoodsIds.value = selectedGoods.map((item) => item.id)
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
    findGoodsList()
  } catch (error) {
    console.log(error)
  }
}

defineExpose({ show })
</script>
<style lang="scss" scoped>
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
