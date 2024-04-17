<template>
  <el-dialog width="420px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>迁移分类</span>
    </template>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="80px">
      <el-form-item label="一级分类" prop="parentId">
        <el-select v-model="ruleForm.parentId" class="w240" placeholder="请选择">
          <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" v-auth="'findCategoryTree'"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="showDialog = false">取消</el-button>
        <el-button v-blur type="primary" @click="submitForm(ruleFormRef)" v-auth="'modifySubCategoryParentId'">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

import { http } from '@/api'
import { showReqError } from '@/hooks/useError'

const showDialog = ref(false)
const ruleFormRef = ref()

const emit = defineEmits(['dialogClosed'])

let tempIds = []
let ruleForm = ref({
  name: '',
  description: ''
})
let categoryOptions = ref([])
/**
 * 父组件调弹框显示方法
 */
const show = (ids) => {
  showDialog.value = true
  resetRuleFormData()
  tempIds = ids
  findCategoryTree()
}
/**
 * 获取统计分类树
 */
const findCategoryTree = async () => {
  const params = { deep: 1 }
  try {
    let res = await http('findCategoryTree', params)
    if (res.isError) return showReqError(res)
    categoryOptions.value = res.content
  } catch (error) {
    console.log(error)
  }
}
/**
 *  弹框关闭，父组件更新
 */
const dialogClosed = () => {
  emit('dialogClosed')
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
    ...ruleForm.value,
    idList: tempIds
  }

  try {
    let res = await http('modifySubCategoryParentId', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('保存成功')
    showDialog.value = false
    dialogClosed()
  } catch (error) {
    console.log(error)
  }
}

const rules = reactive({
  parentId: [{ required: true, message: '请选择一级分类', trigger: 'blur' }]
})

defineExpose({ show })

const resetRuleFormData = async () => {
  nextTick(() => {
    ruleFormRef.value.resetFields()
    ruleForm.value = {}
  })
}
</script>
<style lang="scss" scoped></style>
