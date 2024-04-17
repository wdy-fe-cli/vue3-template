<template>
  <div class="upload-box" :class="{ tb_upload: isTableBtn }">
    <el-upload
      :id="uuid"
      action="#"
      :class="['upload', self_disabled ? 'disabled' : '', 'no-border']"
      :multiple="false"
      :disabled="self_disabled"
      :show-file-list="false"
      :http-request="handleHttpUpload"
      :before-upload="beforeUpload"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      :drag="drag">
      <ElButton v-if="!isTableBtn" type="primary" :loading="btnLoading">{{ fileUrl ? '重新上传' : '上传' }}</ElButton>
      <el-button v-else v-blur type="primary" plain icon="Upload" :loading="btnLoading">导入</el-button>
    </el-upload>
    <div class="el-upload__tip">
      <slot name="tip"></slot>
    </div>
  </div>
</template>

<script setup name="UploadFile">
import { ElNotification, formContextKey, formItemContextKey } from 'element-plus'
import { ref, computed, inject } from 'vue'
import { generateUUID } from '@/utils'
import { uploadFile } from '@/api/modules/app.js'

// 接受父组件参数
const props = defineProps({
  fileUrl: {
    type: String,
    default: ''
  },
  drag: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fileSize: {
    type: [Number, String],
    default: 50
  },
  fileType: {
    type: Array,
    default: () => []
  },
  api: {
    type: Function,
    default: null
  },
  isTableBtn: {
    type: Boolean,
    default: false
  },
  isMySuccCallback: {
    type: Boolean,
    default: false
  }
})

let btnLoading = ref(false)

// 生成组件唯一id
const uuid = ref(`id-${generateUUID()}`)

// 获取 el-form 组件上下文
const formContext = inject(formContextKey)
// 获取 el-form-item 组件上下文
const formItemContext = inject(formItemContextKey)
// 判断是否禁用上传和删除
// eslint-disable-next-line camelcase
const self_disabled = computed(() => props.disabled || formContext?.disabled)

/**
 * @description 文件上传
 * @param options upload 所有配置项
 * */

const emit = defineEmits(['update:fileUrl', 'update:fileName'])
const handleHttpUpload = async (options) => {
  btnLoading.value = true

  try {
    options.type = 1

    const api = props.api ?? uploadFile
    const data = await api(options)
    btnLoading.value = false
    if (!props.api) {
      emit('update:fileUrl', data.filePath)
      emit('update:fileName', options.file.name)
      // 调用 el-form 内部的校验方法（可自动校验）
      formItemContext?.prop && formContext?.validateField([formItemContext.prop])
    }
  } catch (error) {
    options.onError(error)
  }
}

/**
 * @description 文件上传之前判断
 * @param rawFile 选择的文件
 * */
const beforeUpload = (rawFile) => {
  const imgSize = rawFile.size / 1024 / 1024 < Number(props.fileSize)
  // const imgType = props.fileType.includes(rawFile.type)
  // if (!imgType)
  //   ElNotification({
  //     title: '温馨提示',
  //     message: '上传文件不符合所需的格式！',
  //     type: 'warning'
  //   })
  if (!imgSize)
    setTimeout(() => {
      ElNotification({
        title: '温馨提示',
        message: `上传文件大小不能超过 ${props.fileSize}M！`,
        type: 'warning'
      })
    }, 0)
  return imgSize
}

/**
 * @description 文件上传成功
 * */
const uploadSuccess = () => {
  if (!props.isMySuccCallback) {
    ElNotification({
      title: '温馨提示',
      message: '文件上传成功！',
      type: 'success'
    })
  }
}

/**
 * @description 文件上传错误
 * */
const uploadError = () => {
  ElNotification({
    title: '温馨提示',
    message: '文件上传失败，请您重新上传！',
    type: 'error'
  })
}
</script>

<style scoped lang="scss">
.is-error {
  .upload {
    :deep(.el-upload),
    :deep(.el-upload-dragger) {
      &:hover {
      }
    }
  }
}
:deep(.disabled) {
  .el-upload,
  .el-upload-dragger {
    cursor: not-allowed !important;
    background: var(--el-disabled-bg-color);
  }
}

.upload-box {
  &.tb_upload {
    position: relative;
    top: -5px;
    display: inline-block;
    margin-left: 15px;

    .upload {
      :deep .el-upload {
        .el-button {
          margin: 0;
        }
      }
    }
    .el-upload__tip {
      display: none;
    }
  }

  .no-border {
    :deep(.el-upload) {
      border: none !important;
    }
  }
  :deep(.upload) {
    .el-upload {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
      &:hover {
        .upload-handle {
          opacity: 1;
        }
      }
      .el-upload-dragger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        background-color: transparent;
        &:hover {
        }
      }
      .el-upload-dragger.is-dragover {
        background-color: var(--el-color-primary-light-9);
      }
      .upload-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .upload-empty {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        border: none !important;
        line-height: 30px;
        color: var(--el-color-info);
        .el-icon {
          font-size: 28px;
          color: var(--el-text-color-secondary);
        }
      }
      .upload-handle {
        position: absolute;
        top: 0;
        right: 0;
        box-sizing: border-box;
        border: none !important;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        cursor: pointer;
        background: rgb(0 0 0 / 60%);
        opacity: 0;
        transition: var(--el-transition-duration-fast);
        .handle-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 6%;
          color: aliceblue;
          .el-icon {
            margin-bottom: 40%;
            font-size: 130%;
            line-height: 130%;
          }
          span {
            font-size: 85%;
            line-height: 85%;
          }
        }
      }
    }
  }
  .el-upload__tip {
    line-height: 18px;
    text-align: center;
  }
}

:deep .upload-box .upload .el-upload {
  border: 0 !important;
}
</style>
