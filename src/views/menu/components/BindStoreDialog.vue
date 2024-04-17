<template>
  <el-dialog width="410px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>新增菜谱</span>
    </template>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="80px">
      <el-form-item label="店铺" prop="groupTypes">
        <el-cascader
          :options="treeOptions"
          :props="{ label: 'name', multiple: true }"
          collapse-tags
          collapse-tags-tooltip
          v-model="ruleForm.storeBusinessList"
          :show-all-levels="false" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/api'
// import { showReqError } from '@/hooks/useError'

const showDialog = ref(false)
const ruleFormRef = ref()

let ruleForm = ref({
  storeBusinessList: []
})
let treeOptions = ref([])

/**
 * 父组件调弹框显示方法
 */
const show = (ids) => {
  showDialog.value = true
  ruleForm.value.groupIds = ids
}
onMounted(() => {
  findStoreTreeByOrgId()
})

const findStoreTreeByOrgId = async () => {
  const params = {
    showBusiness: 1
  }
  try {
    let res = await http('findStoreTreeByOrgId', params)
    if (res.isError) return ElMessage.error(res.subMessage)
    treeOptions.value = [res.content]
  } catch (error) {
    console.log(error)
  }
}
/**
 * 校验 form 表单
 * @param {El} formEl form 的对象
 */
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

/**
 * 处理请求数据
 */
const handleSubmitData = async () => {
  const params = {
    ...ruleForm.value
  }
  console.log(params)
  // try {
  //   let res = await http('saveOrUpdateGoodsGroup', params)
  //   if (res.isError) return showReqError(res)
  //   ElMessage.success('保存成功')
  //   showDialog.value = false
  //   dialogClosed()
  // } catch (error) {
  //   console.log(error)
  // }
}

const rules = reactive({
  选择店铺: [{ required: true, message: '请选择', trigger: 'change' }]
})

defineExpose({ show })
</script>
<style lang="scss" scoped></style>
