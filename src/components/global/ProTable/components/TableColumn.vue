<template>
  <RenderTableColumn v-bind="column" />
</template>

<script setup lang="jsx" name="TableColumn">
import { inject, ref, useSlots } from 'vue'
import { filterEnum, formatValue, handleProp, handleRowAccordingToProp } from '@/utils'

defineProps({
  column: Object
})

const slots = useSlots()

const enumMap = inject('enumMap', ref(new Map()))

// 渲染表格数据
const renderCellData = (item, scope) =>
  enumMap.value.get(item.prop) && item.isFilterEnum
    ? filterEnum(handleRowAccordingToProp(scope.row, item.prop), enumMap.value.get(item.prop), item.fieldNames)
    : formatValue(handleRowAccordingToProp(scope.row, item.prop))

// 获取 tag 类型
const getTagType = (item, scope) => filterEnum(handleRowAccordingToProp(scope.row, item.prop), enumMap.value.get(item.prop), item.fieldNames, 'tag')

const RenderTableColumn = (item) => (
  <>
    {item.isShow && (
      <el-table-column
        {...item}
        // 添加纯文本居中形式（textCenter：重点表头居中）
        align={item.type === 'textCenter' ? 'center' : item.align ?? 'left'}
        showOverflowTooltip={item.showOverflowTooltip ?? item.prop !== 'operation'}>
        {{
          default: (scope) => {
            if (item._children) return item._children.map((child) => RenderTableColumn(child))
            if (item.render) return item.render(scope)
            if (slots[handleProp(item.prop)]) return slots[handleProp(item.prop)](scope)
            if (item.tag) return <el-tag type={getTagType(item, scope)}>{renderCellData(item, scope)}</el-tag>
            return renderCellData(item, scope)
          },
          header: (scope) => {
            if (item.headerRender) return item.headerRender(scope)
            if (slots[`${handleProp(item.prop)}Header`]) return slots[`${handleProp(item.prop)}Header`](scope)
            return item.label
          }
        }}
      </el-table-column>
    )}
  </>
)
</script>
