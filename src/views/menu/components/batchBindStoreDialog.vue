<template>
  <el-dialog width="740px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>关联店铺</span>
    </template>
    <div class="dinning_wrap" flex="main:justify" style="flex: 1">
      <div class="ding_left">
        <div class="ding_cot">
          <h3 class="mb13">选择店铺</h3>

          <div class="ding_box">
            <!-- show-checkbox -->
            <el-tree
              :data="dpList"
              :props="{
                children: 'children',
                label: 'name',
                value: 'id',
              }"
              @node-click="handleDpNodeClick"
            />
          </div>
        </div>
      </div>
      <div class="ding_right">
        <div class="ding_cot">
          <h3 class="mb13">选择营业点</h3>
          <div class="ding_box">
            <el-checkbox-group v-model="checkedYydList">
              <el-checkbox v-for="yydItem in yydList" :key="yydItem.id" :label="yydItem.id" @change="(e) => handleCheckedYydChange(e, yydItem)" :disabled="yydItem.tableNum <= 0">
                <span>{{ yydItem.name }}</span>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="showDialog = false">取消</el-button>
        <el-button v-blur type="primary" @click="handleSubmitData()">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'

const showDialog = ref(false)

let currentStoreId = ref(null)

// 店铺
// const checkedDpList = ref([])
let dpList = ref([])

// 营业点
const checkedYydList = ref([])
let yydList = ref([])

// 中间量
let checkedDpAndYydMap = ref(new Map())

// 参数
let ruleForm = ref({
  // groupIdList: [],
  // orgId: 0,
  storeBusinessList: [],
})

/**
 * 父组件调弹框显示方法
 */
const show = (idList) => {
  showDialog.value = true
  ruleForm.value.groupIdList = idList // 菜谱id集合
  // 清空关联营业点id
  ruleForm.value.storeBusinessList = []
  checkedYydList.value = [] // 营业点
  yydList.value = [] // 营业点

  // 获取店铺列表
  findStoreTreeByOrgId() // 店铺

  findSuitStoreBusiness(idList[0])
}

/**
 * 1.获取店铺接口 */
const findStoreTreeByOrgId = async () => {
  const params = {
    showBusiness: 1,
  }
  try {
    let res = await http('findStoreTreeByOrgId', params)
    if (res.isError) return ElMessage.warning(res.subMessage)
    // console.log([res.content])
    dpList.value = [res.content]
    // treeOptions.value = [res.content]
    // console.log(params)
  } catch (error) {
    console.log(error)
  }
}

// 2.查询菜谱关联店铺营业点列表
const findSuitStoreBusiness = async (groupId) => {
  const params = {
    groupId,
  }

  try {
    let res = await http('findSuitStoreBusiness', params)
    if (res.isError) return ElMessage.error(res.message)
    // console.log(res, yydList)
    res.content.forEach((item) => {
      // 营业点列表查询
      findBusinessList(item.storeId, (resItem) => {
        let { content } = resItem

        // checkedDpAndYydMap.value.set(item.storeId, content)
        // 打开绑定查询，如果有值，则再查询营业点列表，遍历，id相等则赋值显示
        content.forEach((jItem) => {
          if (item.businessId === jItem.id) {
            // console.log(jItem)
            // checkedYydList.value.push()
            // 右侧显示的
            checkedYydList.value.push(jItem.id)
            yydList.value.push(jItem)

            // 需要提交的表单参数
            ruleForm.value.storeBusinessList.push({
              businessId: jItem.id,
              storeId: jItem.storeId,
              businessName: jItem.name,
              // storeId: currentStoreId.value
            })
          }
        })

        // console.log(resItem)
        // if(item.)
        // yydList.value = res.content
      })
    })

    /* findBusinessList(val.id, (res) => {
      yydList.value = res.content
    }) // 营业点 */
  } catch (error) {
    console.log(error)
  }
}

// 3.确定关联店铺绑定
const handleSubmitData = async () => {
  try {
    let res = await http('saveGoodsGroupSuitStore', ruleForm.value)
    if (res.isError) return showReqError(res)
    ElMessage.success('绑定成功')
    showDialog.value = false
    dialogClosed()
  } catch (error) {
    console.log(error)
  }
}

// 4.营业点选中
const handleCheckedYydChange = (value, item) => {
  if (value) {
    ruleForm.value.storeBusinessList.push({
      businessId: item.id,
      storeId: item.storeId,
      businessName: item.name,
      // storeId: currentStoreId.value
    })
  } else {
    ruleForm.value.storeBusinessList.forEach((x) => {
      if (x.businessId === item.id) {
        ruleForm.value.storeBusinessList.splice(ruleForm.value.storeBusinessList.indexOf(x), 1)
      }
    })
  }
}

// 6. 查询店铺营业点列表
const findBusinessList = async (storeId, next) => {
  const params = {
    storeId,
  }

  try {
    let res = await http('findBusinessList', params)
    if (res.isError) return showReqError(res)
    // console.log(res)
    next(res)
    // yydList.value = res.content
    // console.log(res.content)
    // checkedDpAndYydMap.value.set(storeId, res.content)
  } catch (error) {
    console.log(error)
  }
}

// 店铺展开
const handleDpNodeClick = (val) => {
  currentStoreId.value = val.id
  // if (val.parentOrgId === '1') {
  if (!val.children) {
    findBusinessList(val.id, (res) => {
      yydList.value = res.content
    }) // 营业点
  }
}

// 监听营业点选中
watch(
  () => checkedDpAndYydMap.value,
  () => {
    console.log('未触发过')
    let temYydArr = []
    if (checkedDpAndYydMap.value.size > 0) {
      let tempArr = []

      checkedDpAndYydMap.value.forEach((value) => {
        value.forEach((item) => {
          tempArr.push(item)
          temYydArr.push(item.id)
        })
      })
      yydList.value = tempArr
    } else {
      yydList.value = []
    }

    let tempEndArr = JSON.parse(JSON.stringify(checkedYydList.value))
    checkedYydList.value.forEach((item) => {
      if (!temYydArr.includes(item)) {
        tempEndArr.splice(tempEndArr.indexOf(item), 1)
      }
    })
    checkedYydList.value = tempEndArr
  },
  { deep: true }
)

const emit = defineEmits(['dialogClosed'])
const dialogClosed = () => {
  emit('dialogClosed')
}

defineExpose({ show })
</script>
<style lang="scss" scoped>
.dinning_wrap {
  width: 100%;

  .ding_left,
  .ding_right {
    .ding_cot {
      height: 100%;

      .ding_box {
        padding: 5px 10px;
        width: 100%;
        height: 300px;
        overflow: auto;
        background-color: #f5f5f5;

        :deep .el-tree {
          background: none;

          .el-icon:not(.is-leaf) {
            + label {
              display: none;
            }
          }
        }
      }
    }
  }

  .ding_left {
    width: 40%;
    .ding_cot {
      width: 86%;

      .el-checkbox-group {
        .el-checkbox {
          position: relative;
          width: 100%;
          display: block;
          padding-top: 10px;
          height: 22px;

          span.check_num {
            position: absolute;
            right: 0;
          }
        }
      }
    }
  }
  .ding_right {
    width: 60%;
    .ding_cot {
      width: 95%;
    }
  }
}
</style>
