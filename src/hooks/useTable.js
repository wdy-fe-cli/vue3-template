import { reactive, computed, toRefs } from 'vue'

/**
 * @description table 页面操作方法封装
 * @param {Function} api 获取表格数据 api 方法 (必传)
 * @param {Object} initParam 获取数据初始化参数 (非必传，默认为{})
 * @param {Boolean} isPageable 是否有分页 (非必传，默认为true)
 * @param {Function} dataCallBack 对后台返回的数据进行处理的方法 (非必传)
 * */
// eslint-disable-next-line default-param-last
export const useTable = (api, initParam = {}, isPageable = true, dataCallBack, requestError) => {
  const state = reactive({
    // 表格数据
    tableData: [],
    // 分页数据
    pageable: {
      // 当前页数
      pageNumber: initParam.pageNumber || 1,
      // 每页显示条数
      pageSize: initParam.pageSize || 10,
      // 总条数
      total: 0
    },
    // 查询参数(只包括查询)
    searchParam: {},
    // 初始化默认的查询参数
    searchInitParam: {},
    // 总参数(包含分页和查询参数)
    totalParam: {}
  })

  /**
   * @description 分页查询参数(只包括分页和表格字段排序,其他排序方式可自行配置)
   * */
  const pageParam = computed({
    get: () => ({
      pageNumber: state.pageable.pageNumber,
      pageSize: state.pageable.pageSize
    }),
    set: (newVal) => {
      console.log('我是分页更新之后的值', newVal)
    }
  })

  /**
   * @description 获取表格数据
   * @return void
   * */
  const getTableList = async () => {
    if (!api) return
    try {
      // 先把初始化参数和分页参数放到总参数里面
      Object.assign(state.totalParam, initParam, isPageable ? pageParam.value : {})
      let { content } = await api({ ...state.searchInitParam, ...state.totalParam })
      content = content || []
      dataCallBack && (content = dataCallBack(content))
      state.tableData = isPageable ? content.items : content
      // 解构后台返回的分页数据 (如果有分页更新分页信息)
      if (isPageable) {
        const { pageNumber, pageSize } = state.totalParam
        const { count } = content
        updatePageable({ pageNumber, pageSize, total: Number(count || 0) })
      }
    } catch (error) {
      requestError && requestError(error)
    }
  }

  /**
   * @description 更新查询参数
   * @return void
   * */
  const updatedTotalParam = () => {
    state.totalParam = {}
    // 处理查询参数，可以给查询参数加自定义前缀操作
    let nowSearchParam = {}
    // 防止手动清空输入框携带参数（这里可以自定义查询参数前缀）
    Object.keys(state.searchParam).forEach((key) => {
      // * 某些情况下参数为 false/0 也应该携带参数
      if (state.searchParam[key] || state.searchParam[key] === false || state.searchParam[key] === 0) {
        nowSearchParam[key] = state.searchParam[key]
      }
    })

    Object.assign(state.totalParam, nowSearchParam, isPageable ? pageParam.value : {})
  }

  /**
   * @description 更新分页信息
   * @param {Object} pageable 后台返回的分页数据
   * @return void
   * */
  const updatePageable = (pageable) => {
    Object.assign(state.pageable, pageable)
  }

  /**
   * @description 表格数据查询
   * @return void
   * */
  const search = () => {
    state.pageable.pageNumber = 1
    updatedTotalParam()
    getTableList()
  }

  /**
   * @description 表格数据重置
   * @return void
   * */
  const reset = () => {
    state.pageable.pageNumber = 1
    state.searchParam = {}
    // 重置搜索表单的时，如果有默认搜索参数，则重置默认的搜索参数
    Object.keys(state.searchInitParam).forEach((key) => {
      state.searchParam[key] = state.searchInitParam[key]
    })
    updatedTotalParam()
    getTableList()
  }

  /**
   * @description 每页条数改变
   * @param {Number} val 当前条数
   * @return void
   * */
  const handleSizeChange = (val) => {
    state.pageable.pageNumber = 1
    state.pageable.pageSize = val
    getTableList()
  }

  /**
   * @description 当前页改变
   * @param {Number} val 当前页
   * @return void
   * */
  const handleCurrentChange = (val) => {
    state.pageable.pageNumber = val
    getTableList()
  }

  return {
    ...toRefs(state),
    getTableList,
    search,
    reset,
    handleSizeChange,
    handleCurrentChange,
    updatedTotalParam
  }
}

/**
 * 列表行合并的预处理
 * 已经封装好了，可以放全局引用
 * @param {Array} tableData 表单数据
 * @param {String} mergeId  合并的依据，一般是id
 * @returns {Array} 处理后的合并数组
 */

export function tagRowSpan(tableData, mergeId) {
  const tagArr = []
  let pos = 0
  // eslint-disable-next-line array-callback-return
  tableData.map((_, index) => {
    if (index === 0) {
      tagArr.push(1)
      pos = 0
    } else if (tableData[index][mergeId] === tableData[index - 1][mergeId]) {
      // 合并项目
      tagArr[pos] += 1
      tagArr.push(0)
    } else {
      tagArr.push(1)
      pos = index
    }
  })
  return tagArr
}
/**
 * 实际表格合并的逻辑
 * @param {Number} rowIndex 表格数据行下标
 * @param {Number} columnIndex 表格数据列下标
 * @param {Array} tagArr  预处理后的数组
 * @param {Array} needMergeCol  需要合并的列下标
 * @returns {Object}
 */
export function handleSpanMethod({ rowIndex, columnIndex }, tagArr, needMergeCol) {
  if (needMergeCol.includes(columnIndex)) {
    const _row = tagArr[rowIndex]
    const _col = _row > 0 ? 1 : 0
    return {
      rowspan: _row,
      colspan: _col
    }
  }
}
