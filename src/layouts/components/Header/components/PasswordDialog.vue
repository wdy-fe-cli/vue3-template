<template>
  <el-dialog v-model="dialogVisible" title="修改密码" width="420px" draggable>
    <el-form :model="form.data" ref="formRef" :rules="form.rules" label-position="left" label-width="100px" size="default" @submit.prevent>
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="form.data.oldPassword" class="w260" type="password" placeholder="密码" show-password>
          <template #prefix>
            <el-icon class="el-input__icon">
              <lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="form.data.newPassword" class="w260" type="password" placeholder="密码" show-password>
          <template #prefix>
            <el-icon class="el-input__icon">
              <lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="form.data.confirmPassword" class="w260" type="password" placeholder="密码" show-password>
          <template #prefix>
            <el-icon class="el-input__icon">
              <lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="dialogVisible = false">取消</el-button>
        <el-button v-blur type="primary" @click="confirmChangePwd">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { checkPassword } from '@/utils/eleValidate.js'
import { http } from '@/api'

const formRef = ref(null)
let form = ref({
  data: {
    oldPassword: null,
    newPassword: '',
    confirmPassword: null
  },
  rules: {
    oldPassword: [{ required: true, validator: checkPassword, trigger: 'blur' }],
    newPassword: [{ required: true, validator: checkPassword, trigger: 'blur' }],
    confirmPassword: [{ required: true, validator: checkPassword, trigger: 'blur' }]
  }
})
const dialogVisible = ref(false)
/**
 * 确认修改密码
 */
const confirmChangePwd = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      apiUpdateUserPassword()
    }
  })
}
/**
 * 请求更新密码操作
 */
const apiUpdateUserPassword = async () => {
  const params = {
    oldPassword: form.value.data.oldPassword,
    password: form.value.data.newPassword
  }

  let data = await http('apiUpdateUserPassword', params)
  if (!data || data.isError) {
    const subCodeArr = [
      {
        code: 'OLD_PASS_FAIL',
        subMessage: '原密码错误'
      },
      {
        code: 'USER_NOT_FOUND',
        subMessage: '请重新登录再试'
      },
      {
        code: 'UPDATE_FAIL',
        subMessage: '更新失败，请稍后再试'
      }
    ]
    subCodeArr.forEach((item) => {
      if (data.subCode === item.code) {
        ElMessage.error(item.subMessage)
      }
    })
    return
  }
  ElMessage.success('密码修改成功')
  cancelUpdatePassword()
}

const cancelUpdatePassword = () => {
  dialogVisible.value = false
}

const openDialog = () => {
  dialogVisible.value = true
}

defineExpose({ openDialog })
</script>
