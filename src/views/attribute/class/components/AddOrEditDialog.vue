<template>
  <el-dialog width="420px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>{{ !isEdit ? '新增属性分类' : '编辑属性分类' }}</span>
    </template>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="110px">
      <el-form-item label="属性分类名称" prop="name">
        <el-input class="w240" v-model="ruleForm.name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="排序码" prop="sequence">
        <el-input class="w240" v-model="ruleForm.sequence" placeholder="请输入" />
      </el-form-item>
      <div style="width: 84%; margin: -15px 0 0 111px">
        <el-checkbox v-model="ruleForm.isRadio" label="属性单选" size="large" />
        <el-checkbox v-model="ruleForm.isMustOption" label="属性必选" size="large" />
      </div>
      <el-form-item :label="'分类下属性是否\n允许修改数量'" prop="isModifyQuantity" class="fold_label">
        <el-radio-group v-model="ruleForm.isModifyQuantity" class="ml-4">
          <el-radio :label="1" size="large">是</el-radio>
          <el-radio :label="0" size="large">否</el-radio>
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
import { ref, reactive /* nextTick */ } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'
import { getStorage } from '@/utils/storage'

const showDialog = ref(false)
const ruleFormRef = ref()
let tempParentId = ''

const emit = defineEmits(['dialogClosed'])
let isEdit = false
let ruleForm = ref({
  name: '',
  description: '',
  isModifyQuantity: 0,
})
// let digTitle = ref('新增属性分类')
/**
 * 父组件调弹框显示方法
 */
/* const show = (row, type) => {
  showDialog.value = true
  // resetRuleFormData()
  if (type) {
    tempParentId = row.id
  }
  if ((row && row.parentId !== '0') || (row && row.parentId === '0' && !type)) {
    findCategoryById(row.id)
    isEdit = true
    return
  }
  isEdit = false
} */
const show = (row) => {
  console.log(row)
  showDialog.value = true

  ruleForm.value = {
    name: '',
    description: '',
    isModifyQuantity: 0,
  }

  if (row) {
    // tempParentId = row.id
    isEdit = true
    ruleForm.value = JSON.parse(JSON.stringify(row))
    ruleForm.value.isRadio === 1 ? (ruleForm.value.isRadio = true) : (ruleForm.value.isRadio = false)
    ruleForm.value.isMustOption === 1 ? (ruleForm.value.isMustOption = true) : (ruleForm.value.isMustOption = false)
    // ruleForm.value.isMustOption = ruleForm.value.isMustOption.toString()
    console.log(ruleForm.value, ruleForm.value.isMustOption, ruleForm.value.isRadio)
  } else {
    // resetRuleFormData()
    isEdit = false
  }
}
/**
 * 获取详情
 */
/* const findCategoryById = async (nameLike) => {
  const params = { nameLike }
  try {
    let res = await http('findPropClassList', params)
    if (res.isError) return showReqError(res)

    ruleForm.value = res.content
  } catch (error) {
    console.log(error)
  }
} */
/**
 *  弹框关闭，父组件更新
 */
const dialogClosed = () => {
  emit('dialogClosed')
}

/**
 * 获取分类标签
 */
/* const apiFindOrgLabelEnList = async () => {
  try {
    let res = await http('findOrgLabelEnList')
    if (res.isError) return showReqError(res)
    orgLabelOptions.value = res.content
  } catch (error) {
    console.log(error)
  }
} */
/**
 * 校验 form 表单
 * @param {El} formEl form 的对象
 */
const submitForm = async (formEl) => {
  /* ruleForm.value.isRadio === true ? (ruleForm.value.isRadio = 1) : (ruleForm.value.isRadio = 0)
  ruleForm.value.isMustOption === true ? (ruleForm.value.isMustOption = 1) : (ruleForm.value.isMustOption = 0)
  console.log(ruleForm.value) */
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
  const apiName = !isEdit ? 'insertPropClass' : 'modifyPropClass'

  ruleForm.value.isRadio === true ? (ruleForm.value.isRadio = 1) : (ruleForm.value.isRadio = 0)
  ruleForm.value.isMustOption === true ? (ruleForm.value.isMustOption = 1) : (ruleForm.value.isMustOption = 0)
  const params = {
    ...ruleForm.value,
    orgId: getStorage('orgId'),
  }

  if (tempParentId) {
    params.parentId = tempParentId
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

const rules = reactive({
  name: [{ required: true, message: '请输入', trigger: 'blur' }],
})

// apiFindOrgLabelEnList()
defineExpose({ show })

/* const resetRuleFormData = async () => {
  nextTick(() => {
    ruleFormRef.value.resetFields()
    ruleForm.value = {}
  })
} */
</script>
<style lang="scss">
/* 过于长的label分两行展示样式 */
.fold_label .el-form-item__label {
  white-space: pre-line;
  text-align-last: justify;
  text-align: justify;
  margin-top: -4px;
  line-height: 25px;
  text-justify: distribute-all-lines;
}
</style>
