<template>
  <div class="card filter" v-drag>
    <h4 v-if="title" class="title sle">
      {{ title }}
    </h4>
    <el-input v-model="filterText" placeholder="输入关键字进行过滤" clearable />
    <el-scrollbar :style="{ height: title ? `calc(100% - 95px)` : `calc(100% - 56px)` }">
      <el-tree
        ref="treeRef"
        default-expand-all
        :node-key="id"
        :data="multiple ? treeData : treeAllData"
        :show-checkbox="multiple"
        :check-strictly="false"
        :current-node-key="!multiple ? selected : ''"
        :highlight-current="!multiple"
        :expand-on-click-node="false"
        :check-on-click-node="multiple"
        :props="defaultProps"
        :filter-node-method="filterNode"
        :default-checked-keys="multiple ? selected : []"
        @node-click="handleNodeClick"
        @check="handleCheckChange"
      >
        <template #default="scope">
          <span class="el-tree-node__label">
            <slot :row="scope">
              {{ scope.node.label }}
            </slot>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<script setup name="TreeFilter">
import { ref, watch, onBeforeMount, nextTick } from 'vue'
import { ElTree } from 'element-plus'

const props = defineProps({
  requestApi: Function, // 请求分类数据的 api ==> 非必传
  defaultValue: [Array, Object, String], // 默认选中的值 ==> 非必传
  data: Array, // 分类数据，如果有分类数据，则不会执行 api 请求 ==> 非必传
  title: String, // treeFilter 标题 ==> 非必传
  needAll: {
    type: [Boolean, String],
    default: true,
  },
  needNode: {
    type: [Boolean, String],
    default: false,
  },
  id: {
    type: String,
    default: 'id',
  },
  label: {
    type: String,
    default: 'label',
  },
  children: {
    type: String,
    default: 'children',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
})

const defaultProps = {
  children: props.children,
  label: props.label,
}

const treeRef = ref()
const treeData = ref([])
const treeAllData = ref([])

const selected = ref()
const setSelected = () => {
  if (props.multiple) selected.value = Array.isArray(props.defaultValue) ? props.defaultValue : [props.defaultValue]
  else selected.value = typeof props.defaultValue === 'string' ? props.defaultValue : ''
}

onBeforeMount(async () => {
  setSelected()
  if (props.requestApi) {
    const { content } = await props.requestApi()
    treeData.value = content
    if (props.needAll) {
      treeAllData.value = [{ id: '', [props.label]: '全部' }, ...content]
    } else {
      treeAllData.value = [...content]
    }
  }
})

// 使用 nextTick 防止打包后赋值不生效，开发环境是正常的
watch(
  () => props.defaultValue,
  () => nextTick(() => setSelected()),
  { deep: true, immediate: true }
)

watch(
  () => props.data,
  () => {
    if (props.data?.length) {
      treeData.value = props.data
      if (props.needAll) {
        treeAllData.value = [{ id: '', [props.label]: '全部' }, ...props.data]
      } else {
        treeAllData.value = [...props.data]
      }
    }
  },
  { deep: true, immediate: true }
)

const filterText = ref('')
watch(filterText, (val) => {
  treeRef.value.filter(val)
})

// 过滤
const filterNode = (value, data, node) => {
  if (!value) return true
  let parentNode = node.parent
  let labels = [node.label]
  let level = 1
  while (level < node.level) {
    labels = [...labels, parentNode.label]
    parentNode = parentNode.parent
    level += 1
  }
  return labels.some((label) => label.indexOf(value) !== -1)
}

const emit = defineEmits(['change'])

// 单选
const handleNodeClick = (data) => {
  // console.log(data)
  if (props.multiple) return
  if (props.needNode) {
    emit('change', data)
  } else {
    emit('change', data[props.id])
  }
}

// 多选
const handleCheckChange = () => {
  if (props.needNode) {
    emit('change', treeRef.value?.getCheckedKeys())
  } else {
    emit('change', treeRef.value?.getCheckedNodes())
  }
}

// 暴露给父组件使用
defineExpose({ treeData, treeAllData, treeRef })
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
