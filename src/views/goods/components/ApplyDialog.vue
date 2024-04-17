<template>
  <el-dialog width="420px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>发起申请</span>
    </template>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="100px">
      <el-form-item :label="'归属店铺：'" prop="storeId" v-if="!orgStore.isStore">
        <store-select v-model:storeId="ruleForm.storeId" :default-value="ruleForm.storeId" :emit-path="false" class="w240" v-if="showDialog" />
      </el-form-item>
      <el-form-item label="申请类型：" prop="applyType">
        <el-radio-group v-model="ruleForm.applyType">
          <el-radio label="01">新品申请</el-radio>
          <el-radio label="02">商品调整</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="附件：" prop="note">
        <div>
          <UploadFile v-model:file-url="ruleForm.fileUrl" v-model:file-name="ruleForm.fileName" file-size="200">
            <template #empty>
              <el-icon><DocumentAdd /></el-icon>
            </template>
          </UploadFile>
        </div>
        <div class="ml16 mb12">{{ ruleForm.fileName }}</div>
      </el-form-item>
      <el-form-item label="申请备注：" prop="note">
        <el-input class="w340" type="textarea" v-model="ruleForm.note" placeholder="请输入" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="showDialog = false">取消</el-button>
        <el-button v-blur type="primary" @click="submitForm(ruleFormRef)" v-auth="'goodsApplyInsert'">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/api'
import StoreSelect from '@/views/components/select-store/index.vue'
import { showReqError } from '@/hooks/useError'
import { useOrgStore } from '@/store/modules/org'
import UploadFile from '@/components/Upload/File.vue'

const showDialog = ref(false)
const ruleFormRef = ref()
const orgStore = useOrgStore()
const emit = defineEmits(['dialogClosed'])

let ruleForm = ref({
  applyType: '01',
  status: 1
})
/**
 * 父组件调弹框显示方法
 */
const show = (goodsIdList) => {
  showDialog.value = true
  ruleForm.value.goodsIdList = goodsIdList
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
    ...ruleForm.value
  }

  try {
    let res = await http('goodsApplyInsert', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('操作成功')
    dialogClosed()
    showDialog.value = false
  } catch (error) {
    console.log(error)
  }
}

const rules = reactive({})

defineExpose({ show })
</script>
<style lang="scss" scoped></style>
