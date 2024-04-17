<template>
  <div class="page-handle-wrap">
    <template v-for="(btn, index) in useConfig.btns">
      <slot v-if="btn.slot" :name="btn.slot"></slot>
      <el-button v-blur v-else :key="index" v-bind="bindProps(btn)" @click="onBtn(btn)">
        {{ btn.text }}
      </el-button>
    </template>
  </div>
</template>

<script setup name="page-handle">
import { computed, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/store/modules/tabs'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const tabStore = useTabsStore()
let emit = defineEmits(['confirm', 'cancel', 'other'])

const onBtn = (btn) => {
  if (btn.event === 'cancel') return cancel()
  emit(btn.event)
}
const cancel = () => {
  const { isEdit, backConfirm, backConfirmText } = useConfig
  if (!backConfirm) {
    goBack()
    return
  }
  const handleText = isEdit ? '编辑' : '新增'
  const title = backConfirmText || `要取消${handleText}？`
  proxy
    .$confirm('取消之后，填写的内容将全部清空', title, {
      confirmButtonText: '继续填写',
      cancelButtonText: `取消${handleText}`,
      closeOnClickModal: false,
      closeOnPressEscape: false
    })
    .then(() => {})
    .catch(() => {
      goBack()
    })
}
const goBack = () => {
  tabStore.removeTabs(route.fullPath)
  const { backRouteName } = useConfig
  if (backRouteName) return router.push({ name: backRouteName })
  router.back()
}

const bindProps = computed(() => (btn) => {
  const obj = { ...btn }
  // 移除冗余属性
  delete obj.text
  delete obj.event

  return obj
})

const useConfig = computed(() => {
  const initConfig = {
    btns: [
      {
        text: '确定',
        type: 'primary',
        event: 'confirm'
      },
      {
        text: '取消',
        event: 'cancel'
      }
    ]
  }
  if (props.confirmText) {
    initConfig.btns[0].text = props.confirmText
  }
  return { ...initConfig, ...props.config }
})

const props = defineProps({
  confirmText: {
    type: String,
    default: ''
  },
  /**
   *  --- config 配置项
   *  backRouteName: 返回上一页面得Name
   *  backConfirm: 返回上一页是否需要二次确认
   *  backConfirmText: 返回上一页二次确认提示文字
   *  isEdit: 是否编辑页面
   *  btns: [] // 按钮列表 默认显示 确认 跟 取消
   */
  config: {
    type: Object,
    default: () => ({})
  }
})

defineExpose({ goBack })
</script>

<style lang="scss" scoped>
$marginPage: 20px;
.page-handle-wrap {
  left: 0;
  right: 0;
  position: absolute;
  bottom: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: left 0.28s;
  z-index: 6;
  background: #ffffff;
  border-top: 1px solid #eeeeee;
  .el-button {
    margin-top: 16px;
    margin-bottom: 16px;
  }
}
.collapse-page-handle {
  left: 0;
}
</style>
