<template>
  <!-- 分页组件 -->
  <el-pagination
    :background="true"
    :current-page="pageable.pageNumber"
    :page-size="pageable.pageSize"
    :page-sizes="[10, 25, 50, 100]"
    :total="pageable.total"
    layout="total, sizes, prev, pager, next, jumper"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"></el-pagination>
</template>

<script setup name="Pagination">
defineProps({
  pageable: {
    type: Object,
    default: () => ({
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })
  },
  handleSizeChange: Function,
  handleCurrentChange: Function
})
</script>
