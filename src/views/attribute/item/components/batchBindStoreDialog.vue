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
              ref="treeRef"
              :data="dpList"
              :check-strictly="true"
              :props="{
                children: 'children',
                label: 'name',
                value: 'id',
              }"
              node-key="id"
              show-checkbox
              @check-change="handleCheckedStoreIdChange"
            />
          </div>
        </div>
      </div>
      <div class="ding_right">
        <div class="ding_cot">
          <h3 class="mb13">已选关联店铺</h3>
          <div class="ding_box">
            <el-checkbox v-model="defaultCheck" v-for="sotreItem in checkedStoreIdList" :key="sotreItem.id" :label="sotreItem.name" @change="(e) => handleCheckedYydChange(e, sotreItem)">
            </el-checkbox>
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
import { nextTick, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'
import { getStorage } from '@/utils/storage'

const showDialog = ref(false)

// 店铺列表
let dpList = ref([])

let treeRef = ref(null)
// let 默认选择状态
let defaultCheck = ref(true)

let checkedStoreIdList = ref([])

// 参数
let ruleForm = ref({
  // groupIdList: [],
  // orgId: 0,
  // storeBusinessList: [],
  storeIds: [],
})

/**
 * 父组件调弹框显示方法
 */
const show = (idList) => {
  showDialog.value = true
  ruleForm.value.propIds = idList // 菜谱id集合
  ruleForm.value.storeIds = []
  checkedStoreIdList.value = []
  nextTick(() => {
    treeRef.value.setCheckedKeys([], false)
  })
  // 获取店铺列表
  findStoreTreeByOrgId() // 店铺
  // 查询属性关联店铺列表
  findSuitStore(idList)
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

// 2.查询属性关联店铺列表
const findSuitStore = async (idList) => {
  // 批量关联店铺时不回显
  if (idList && idList.length > 1) {
    return
  }

  const params = {
    propId: idList[0],
  }

  try {
    let res = await http('findSuitStore', params)
    if (res.isError) return ElMessage.error(res.message)

    let tempKeys = []

    res?.content.forEach((item) => {
      tempKeys.push(item.storeId)
    })

    // 回显tree节点显示
    treeRef.value.setCheckedKeys(tempKeys, false)

    // 获取node节点并回显右侧
    let nodeList = treeRef.value.getCheckedNodes(false, false)

    checkedStoreIdList.value = []
    nodeList.forEach((item) => {
      checkedStoreIdList.value.push(item)
      ruleForm.value.storeIds.push(item.id)
    })
  } catch (error) {
    console.log(error)
  }
}

// 3.确定关联店铺绑定
const handleSubmitData = async () => {
  ruleForm.value.orgId = getStorage('orgId')

  /* showDialog.value = false
  dialogClosed() */
  try {
    let res = await http('saveSuitStore', ruleForm.value)
    if (res.isError) return showReqError(res)
    ElMessage.success('绑定成功')
    showDialog.value = false
    dialogClosed()
  } catch (error) {
    console.log(error)
  }
}

// 4.店铺选中
// 共三个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、节点本身是否被选中、节点的子树中是否有被选中的节点
const handleCheckedStoreIdChange = (data, checked, indeterminate) => {
  if (checked) {
    // 判断是否已经存在，避免重复添加
    if (checkedStoreIdList.value.some((x) => x.id === data.id)) return
    checkedStoreIdList.value.push(data)
    ruleForm.value.storeIds.push(data.id)
  } else {
    ruleForm.value.storeIds.forEach((x) => {
      if (x === data.id) {
        checkedStoreIdList.value.splice(checkedStoreIdList.value.indexOf(data), 1)
        ruleForm.value.storeIds.splice(ruleForm.value.storeIds.indexOf(x), 1)
      }
    })
  }
}

// 右侧移除选中店铺
const handleCheckedYydChange = (e, data) => {
  defaultCheck.value = true

  let tempKeys = treeRef.value?.getCheckedKeys(false)
  // 从列表中删除
  ruleForm.value.storeIds.forEach((x) => {
    if (x === data.id) {
      tempKeys.splice(tempKeys.indexOf(data.id), 1)
      checkedStoreIdList.value.splice(checkedStoreIdList.value.indexOf(data), 1)
      ruleForm.value.storeIds.splice(ruleForm.value.storeIds.indexOf(x), 1)
    }
  })
  treeRef.value.setCheckedKeys(tempKeys, false)
}

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
