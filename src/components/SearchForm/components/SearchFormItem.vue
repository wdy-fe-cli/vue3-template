<template>
  <component
    v-if="column.search?.render"
    :is="column.search?.render"
    v-bind="{ ...handleSearchProps, ...placeholder, searchParam: _searchParam, clearable }"
    v-model.trim="_searchParam[column.search?.key ?? handleProp(column.prop)]"
    :data="column.search?.el === 'tree-select' ? columnEnum : []"
    :options="['cascader', 'select-v2'].includes(column.search?.el) ? columnEnum : []">
    <template v-if="column.search?.el === 'cascader'" #default="{ data }">
      <span>{{ data[fieldNames.label] }}</span>
    </template>
  </component>
  <ElDatePicker
    v-if="column.search?.el === 'date-picker'"
    v-bind="{ ...handleSearchProps, ...placeholder, searchParam: _searchParam, clearable }"
    v-model.trim="_searchParam[column.search?.key ?? handleProp(column.prop)]"></ElDatePicker>
  <ElInput
    v-if="column.search?.el === 'input'"
    @keydown.enter.native="onSearch"
    v-bind="{ ...handleSearchProps, ...placeholder, searchParam: _searchParam, clearable }"
    v-model.trim="_searchParam[column.search?.key ?? handleProp(column.prop)]"></ElInput>
  <ElSelect
    v-if="column.search?.el === 'select'"
    v-bind="{ ...handleSearchProps, ...placeholder, searchParam: _searchParam, clearable }"
    v-model.trim="_searchParam[column.search?.key ?? handleProp(column.prop)]">
    <ElOption v-for="(col, index) in columnEnum" :key="index" :label="col[fieldNames.label]" :value="col[fieldNames.value]"></ElOption>
  </ElSelect>
  <ElCascader
    v-if="column.search?.el === 'cascader'"
    v-bind="{ ...handleSearchProps, ...placeholder, searchParam: _searchParam, clearable }"
    v-model.trim="_searchParam[column.search?.key ?? handleProp(column.prop)]"
    :options="columnEnum">
    <template #default="{ data }">
      <span>{{ data[fieldNames.label] }}</span>
    </template>
  </ElCascader>
  <ElSelectV2
    v-if="column.search?.el === 'select-v2'"
    v-bind="{ ...handleSearchProps, ...placeholder, searchParam: _searchParam, clearable }"
    v-model.trim="_searchParam[column.search?.key ?? handleProp(column.prop)]"
    :options="columnEnum"></ElSelectV2>
  <ElTreeSelect
    v-if="column.search?.el === 'tree-select'"
    v-bind="{ ...handleSearchProps, ...placeholder, searchParam: _searchParam, clearable }"
    v-model.trim="_searchParam[column.search?.key ?? handleProp(column.prop)]"
    :data="columnEnum"></ElTreeSelect>

  <slot v-else></slot>
</template>

<script setup name="SearchFormItem">
import { ElInput, ElSelect, ElSelectV2, ElCascader, ElTreeSelect } from 'element-plus'
import { computed, inject, ref } from 'vue'
import { handleProp } from '@/utils'

const props = defineProps({
  column: Object,
  searchParam: Object
})

const emit = defineEmits(['search'])
const onSearch = () => {
  emit('search')
}
// Re receive SearchParam
const _searchParam = computed(() => props.searchParam)

// 判断 fieldNames 设置 label && value && children 的 key 值
const fieldNames = computed(() => ({
  label: props.column.fieldNames?.label ?? 'label',
  value: props.column.fieldNames?.value ?? 'value',
  children: props.column.fieldNames?.children ?? 'children'
}))

// 接收 enumMap (el 为 select-v2 需单独处理 enumData)
const enumMap = inject('enumMap', ref(new Map()))
const columnEnum = computed(() => {
  let enumData = enumMap.value.get(props.column.prop)
  if (!enumData) return []
  if (props.column.search?.el === 'select-v2' && props.column.fieldNames) {
    enumData = enumData.map((item) => ({ ...item, label: item[fieldNames.value.label], value: item[fieldNames.value.value] }))
  }
  return enumData
})

// 处理透传的 searchProps (el 为 tree-select、cascader 的时候需要给下默认 label && value && children)
const handleSearchProps = computed(() => {
  const label = fieldNames.value.label
  const value = fieldNames.value.value
  const children = fieldNames.value.children
  const searchEl = props.column.search?.el
  let searchProps = props.column.search?.props ?? {}
  if (searchEl === 'tree-select') {
    searchProps = { ...searchProps, props: { ...searchProps.props, label, children }, nodeKey: value }
  }
  if (searchEl === 'cascader') {
    searchProps = { ...searchProps, props: { ...searchProps.props, label, value, children } }
  }
  return searchProps
})

// 处理默认 placeholder
const placeholder = computed(() => {
  const search = props.column.search
  if (['datetimerange', 'daterange', 'monthrange'].includes(search?.props?.type) || search?.props?.isRange) {
    return { rangeSeparator: '至', startPlaceholder: '开始时间', endPlaceholder: '结束时间' }
  }
  const placeholder1 = search?.props?.placeholder ?? (search?.el?.includes('input') ? '请输入' : '请选择')
  return { placeholder1 }
})

// 是否有清除按钮 (当搜索项有默认值时，清除按钮不显示)
const clearable = computed(() => {
  const search = props.column.search
  return search?.props?.clearable ?? (search?.defaultValue == null || search?.defaultValue === undefined)
})
</script>
