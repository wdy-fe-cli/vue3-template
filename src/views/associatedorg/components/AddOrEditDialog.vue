<template>
  <el-dialog width="450px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>设置打印机</span>
    </template>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="100px">
      <el-form-item :label="'选择打印机'" prop="printerGuid">
        <el-select v-model="ruleForm.printerGuid" class="w240" multiple placeholder="请选择">
          <el-option v-for="item in printerGuidOptions" :key="item.guid" :label="item.customPrinterName" :value="item.guid"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="修改范围" prop="type" v-if="printerType === 'category'"> -->
      <el-form-item label="修改范围" prop="type" v-if="false">
        <el-radio-group v-model="ruleForm.type">
          <el-radio :label="1">与分类一致</el-radio>
          <el-radio :label="2">所有的商品</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="showDialog = false">取消</el-button>
        <el-button v-blur type="primary" @click="submitForm(ruleFormRef)">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

import { showReqError } from '@/hooks/useError'

import { getStorage } from '@/utils/storage'

import { http } from '@/api'

/**
 * 必要参数
 *  showDialog 是否显示弹框
 *  ruleFormRef 表单
 *  rules 配置代码
 *  dialogClosed 弹框关闭，父组件更新
 *  submitForm 校验提交表单
 *  isEdit 是否是编辑
 */
let isEdit = ref(false)
let ruleForm = ref({
  /* type: 1 */
})

let printerType = ref('')
let printerGuidOptions = ref([])

// let pageNumber = 1

/**
 * 父组件调弹框显示方法
 */
const show = (row, type, currentStoreId) => {
  // console.log('123456', row, type, currentStoreId)
  printerType.value = type
  showDialog.value = true
  // pageNumber = 0
  printerGuidOptions.value = []
  ruleForm.value = JSON.parse(JSON.stringify(row))
  ruleForm.value.type = 1
  ruleForm.value.storeId = currentStoreId
  // console.log(ruleForm.value.printerGuid)
  /* if (ruleForm.value.printerGuid)
    ruleForm.value.printerGuid = row.printerList && row.printerList.length > 0 ? row.printerList.map((item) => item.printerGuid) : [] */
  if (ruleForm.value.printerList) {
    ruleForm.value.printerGuid = row.printerList && row.printerList.length > 0 ? row.printerList.map((item) => item.printerGuid) : []
  }
  //   查找打印机绑定信息
  printerFindByPage()
  // findPrinterInfo(row)
}

// const findPrinterInfo = async () => {
//   printerFindByPage() // 打印机下拉列表
//   /* let apiName = ''
//   const params = { storeId: ruleForm.value.storeId }
//   if (printerType.value === 'category') {
//     apiName = 'selectPrinterRelGoods'
//     params.categoryId = ruleForm.value.id
//   } else {
//     apiName = 'selectGoodsPrinterRelGoods'
//     params.goodsId = [ruleForm.value.id]
//     params.categoryId = ruleForm.value.categoryId
//   }

//   if (!params.storeId) {
//     params.storeId = getStorage('orgId')
//   }
//   try {
//     let res = await http(apiName, params)
//     if (printerType.value === 'category') {
//       ruleForm.value.printerGuid = res.content.selectPrinterRelGoodsResps.map((item) => item.printerGuid)
//       isEdit.value = res.content.selectPrinterRelGoodsResps && res.content.selectPrinterRelGoodsResps.length > 0
//     } else {
//       if (res.content.selectGoodsPrinterRelGoodsResps) {
//         ruleForm.value.printerGuid = res.content.selectGoodsPrinterRelGoodsResps.map((item) => item.printerGuid)
//         isEdit.value = res.content.selectGoodsPrinterRelGoodsResps && res.content.selectGoodsPrinterRelGoodsResps.length > 0
//       }
//     }
//   } catch (error) {
//     console.log(error)
//   } */
// }

/**
 * 获取打印机分页
 */
const printerFindByPage = async () => {
  const params = {
    // pageNumber: (pageNumber += 1),
    storeId: ruleForm.value.storeId,
    // pageSize: 20,
    receiptType: 1, // 打印类型：（0 前台打印，1 后厨打印，2 传菜打印，3 外卖打印机）
    status: 1
  }
  try {
    let res = await http('findPrinterList', params)
    // console.log(res.content)
    // ruleForm.value.printerGuid = res.content.items.map((item) => item.guid)

    printerGuidOptions.value = res.content

    /* if (pageNumber === 1) {
      printerGuidOptions.value = res.content.items
    } else {
      printerGuidOptions.value = printerGuidOptions.value.concat(res.content.items)
    } */
  } catch (error) {
    console.log(error)
  }
}

/**
 * 处理请求数据
 */
const handleSubmitData = async () => {
  let apiName = ''
  const params = {
    ...ruleForm.value
  }
  // console.log('000', ruleForm.value, printerGuidOptions.value)
  // ruleForm.value.printerGuid = res.content.items.map((item) => item.guid)

  params.printerList = []
  // console.log(ruleForm.value)
  if (ruleForm.value.printerList) {
    printerGuidOptions.value.forEach((item) => {
      if (ruleForm.value.printerList.includes(item.guid)) {
        // console.log(item)
        params.printerList.push({
          printerGuid: item.guid,
          printerName: item.customPrinterName
        })
      }
    })
  }

  /* params.printerList = [
    {
      printerGuid: 'cbf333ad496b44461a4b2954f35b4587342a',
      printerName: '测试后厨打印'
    }
  ] */

  if (printerType.value === 'category') {
    apiName = !isEdit.value ? 'printerRelReceiptAdd' : 'updateClassification'
    params.categoryId = ruleForm.value.id
  } else {
    apiName = 'updatePrinterRelGoods'
    params.categoryId = ruleForm.value.categoryId
    params.goodsId = ruleForm.value.id
  }

  if (!params.storeId) {
    params.storeId = getStorage('orgId')
  }

  try {
    let res = await http(apiName, params)
    if (res.isError) return showReqError(res)
    ElMessage.success('保存成功')
    showDialog.value = false
    dialogClosed()
  } catch (error) {
    console.log(error)
  }
}

const showDialog = ref(false)
const ruleFormRef = ref()

const rules = reactive({
  storeId: [{ required: true, message: `请选择`, trigger: 'blur' }]
  // printerGuid: [{ required: true, message: `请选择`, trigger: 'blur' }]
})

const emit = defineEmits(['dialogClosed'])
const dialogClosed = () => {
  emit('dialogClosed')
}
const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      handleSubmitData()
    } else {
      console.log('error submit!', fields)
    }
  })
}

defineExpose({ show })
</script>
<style lang="scss" scoped></style>
