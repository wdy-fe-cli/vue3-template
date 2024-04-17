<template>
  <el-cascader
    v-model="storeId"
    ref="cascaderRef"
    :options="storeOptions"
    :style="{ width: width }"
    :show-all-levels="false"
    @change="changeStore"
    placeholder="请选择"
    :props="{
      label: 'name',
      emitPath: emitPath,
      value: 'id'
    }" />
</template>

<script setup>
import { ref, watch } from 'vue'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'

const props = defineProps({
  emitPath: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: '240px'
  },
  defaultValue: {
    type: String,
    default: ''
  }
})

// 断点变化时 执行 findIndex
watch(
  () => props.defaultValue,
  () => {
    if (props.defaultValue) {
      storeId.value = props.defaultValue
    } else {
      storeId.value = ''
    }
  }
)
const cascaderRef = ref()

const storeOptions = ref([])
const storeId = ref(props.defaultValue || '')

const emit = defineEmits(['update:storeId', 'update:storeData', 'changeStore'])
const changeStore = () => {
  emit('update:storeData', cascaderRef.value.getCheckedNodes()[0].data)
  emit('update:storeId', storeId)
  emit('changeStore', storeId)
}

const findStoreTreeByOrgId = async (/* orgId */) => {
  const params = { /* orgId, */ showBusiness: 1 }
  try {
    let res = await http('findStoreTreeByOrgId', params)
    if (res.isError) return showReqError(res)
    storeOptions.value = [res.content]
  } catch (error) {
    console.log(error)
  }
}
findStoreTreeByOrgId()
</script>
<style lang="scss" scoped></style>
