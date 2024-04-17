<template>
  <page :title="!isEdit ? '新增商品' : '编辑商品'" has-handler>
    <div flex="dir:top cross:center">
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="135px" class="ml40 form-wrap">
        <!-- 商品类型 (01:普通商品; 02:普通套餐; 03:称重商品; 04:组合套餐) -->
        <el-form-item label="商品类型" prop="goodsType" style="width: 100%">
          <el-radio-group v-model="ruleForm.goodsType" class="ml-4" style="margin-top: -5px" :disabled="isEdit">
            <el-radio label="01" size="large">普通商品</el-radio>
            <el-radio label="02" size="large">普通套餐</el-radio>
            <el-radio label="03" size="large">称重商品</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="商品名称" prop="name">
          <el-input class="w260" v-model="ruleForm.name" placeholder="请输入" @input="setJaneSearch" :disabled="isCurrentTemp" />
        </el-form-item>
        <el-form-item label="简码" prop="janeSearch" style="width: 100%">
          <el-input class="w260" v-model="ruleForm.janeSearch" />
        </el-form-item>
        <el-form-item label="基准价格" prop="price">
          <el-input class="w260" v-model="ruleForm.price" placeholder="请输入" @input="setPrice" type="number" />
        </el-form-item>
        <el-form-item label="选择套餐商品" prop="goodsPackageList" style="width: 100%" v-if="ruleForm.isTemp !== 1 && ruleForm.goodsType === '02'">
          <el-button icon="CirclePlus" @click="setGoodsPack" class="mb10">选择套餐商品</el-button>

          <SelectGoodsDialog ref="SelectGoodsDialogRef" @confirm="confirm" class="mb10"></SelectGoodsDialog>

          <el-table :data="goodsTableData" border stripe style="width: 100%">
            <el-table-column prop="goodsName" label="套餐子商品名称" width="180"></el-table-column>
            <el-table-column prop="price" label="套餐子商品价格"></el-table-column>
            <el-table-column prop="sizeTypeName" label="套餐子商品规格"></el-table-column>
            <el-table-column prop="num" label="套餐子商品数量">
              <template #default="scope">
                <b class="input_tip">*</b>
                <el-input class="w200" v-model="scope.row.num" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column prop="sequence" label="套餐子商品排序码">
              <template #default="scope">
                <el-input class="w200" v-model="scope.row.sequence" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="80">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="batchDeleteGoods(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <el-form-item label="商品分类" prop="categoryId">
          <el-cascader
            v-model="ruleForm.categoryId"
            class="w260"
            :options="categoryOptions"
            v-auth="'findCategoryTree'"
            :props="{
              label: 'name',
              value: 'id',
            }"
            @change="handleChangeCategoryId"
          />
          <!-- <el-cascader
            v-model="ruleForm.categoryId"
            class="w260 "
            :options="categoryOptions"
            :props="{
              label: 'name',
              value: 'id'
            }"
            @change="handleChangeCategoryId"
            v-if="ruleForm.goodsType !== '02'" />
          <el-select v-model="ruleForm.categoryId" class="w260 " placeholder="请选择" v-else>
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select> -->
        </el-form-item>
        <el-form-item label="统计分类" prop="statisCategoryId">
          <el-select v-model="ruleForm.statisCategoryId" class="w260" placeholder="请选择">
            <el-option v-for="item in statiscOptions" :key="item.id" :label="item.name" :value="item.id" v-auth="'statiscategoryFindList'"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序码" prop="sequence">
          <el-input class="w260" v-model="ruleForm.sequence" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input class="w260" v-model="ruleForm.unit" placeholder="请输入" @input="checkUnit" />
        </el-form-item>
        <el-form-item label="规格" prop="sizeTypeId" v-if="ruleForm.goodsType === '01' && ruleForm.isTemp !== 1">
          <!-- collapse-tags -->
          <el-select v-model="ruleForm.sizeTypeId" multiple class="w260 mb12" placeholder="请选择" clearable @change="setSize">
            <el-option v-for="item in sizeOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>

          <el-table :data="sizeTableData" border stripe style="width: 100%">
            <el-table-column prop="sizeTypeName" label="类型" width="180">
              <template #default="scope">
                <el-input class="w200" v-model="scope.row.sizeTypeName" placeholder="请输入" disabled />
              </template>
            </el-table-column>
            <el-table-column prop="price" label="价格">
              <template #default="scope">
                <b class="input_tip">*</b>
                <el-input class="w200" v-model="scope.row.price" placeholder="请输入" type="number" />
              </template>
            </el-table-column>
            <el-table-column prop="sequence" label="排序码">
              <template #default="scope">
                <el-input class="w200" v-model="scope.row.sequence" placeholder="请输入" />
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <el-form-item label="属性" prop="classId" style="width: 100%">
          <el-button icon="CirclePlus" type="primary" @click="addProp('add')" class="mb10">新增属性</el-button>
          <el-button icon="Edit" @click="addProp('edit')" class="mb10" :disabled="propListTableData.length === 0">编辑属性</el-button>

          <el-table :data="propListTableData" border stripe class="prop_table">
            <el-table-column prop="className" label="类型" width="180"></el-table-column>
            <el-table-column>
              <template #default="scope">
                <!-- data.isMustOption === 1 && data.isMustOption -->
                <!-- <el-radio-group v-model="scope.row.propValue" class="ml-4" style="margin-top: -5px" @change="setProp"> -->
                <el-radio-group v-model="scope.row.propId" class="ml-4" style="margin-top: -5px" @change="setProp" v-if="scope.row.isMustOption === 1 && scope.row.isRadio === 1">
                  <el-radio v-for="(item, index) in scope.row.propList" :key="index" :label="item.id" size="large">
                    {{ item.name }}
                    <!-- sss
                    {{ item.isDefault }} -->
                  </el-radio>
                </el-radio-group>
                <ul class="prop_txt" v-else>
                  <!-- v-show="item.isMustOption === 0 || item.isRadio === 0" -->
                  <li class="mr20" v-for="(item, index) in scope.row.propList" :key="index" :label="item.propValue" size="large" style="display: inline-block">
                    {{ item.name }}
                  </li>
                </ul>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="80">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="batchDelete(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="商品标签" prop="labelIdList" style="width: 100%">
          <el-checkbox-group v-model="ruleForm.labelIdList">
            <el-checkbox v-for="item in laeblIdOptions" :label="item.id" :value="item.id" :key="item.id">
              {{ item.name }}
            </el-checkbox>
            <!-- <el-checkbox v-for="item in laeblIdOptions" :label="item.name" :value="item.id" :key="item.id" /> -->
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="辣度" prop="hotTag" style="width: 100%">
          <!-- 辣度.0-3递增(不辣微辣中辣重辣) -->
          <el-radio-group v-model="ruleForm.hotTag" class="ml-4" style="margin-top: -5px">
            <el-radio :label="0" size="large">不辣</el-radio>
            <el-radio :label="1" size="large">微辣</el-radio>
            <el-radio :label="2" size="large">中辣</el-radio>
            <el-radio :label="3" size="large">重辣</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否打印" prop="isPrint" style="width: 100%">
          <el-radio-group v-model="ruleForm.isPrint" class="ml-4" style="margin-top: -5px">
            <el-radio :label="1" size="large">是</el-radio>
            <el-radio :label="0" size="large">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否临时菜" prop="isTemp" style="width: 100%">
          <el-radio-group v-model="ruleForm.isTemp" class="ml-4" style="margin-top: -5px" :disabled="isCurrentTemp" @change="isSetTemp">
            <el-radio :label="1" size="large">是</el-radio>
            <el-radio :label="0" size="large">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否打折" prop="isDiscount" style="width: 100%">
          <el-radio-group v-model="ruleForm.isDiscount" @change="isSetDiscount" class="ml-4" style="margin-top: -5px">
            <el-radio :label="1" size="large">是</el-radio>
            <el-radio :label="0" size="large">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否支持打包" prop="`isSupportPackage" style="width: 100%">
          <el-radio-group v-model="ruleForm.isSupportPackage" class="ml-4" style="margin-top: -5px">
            <el-radio :label="1" size="large">是</el-radio>
            <el-radio :label="0" size="large">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否打包盒商品" prop="isPackaging" style="width: 100%">
          <el-radio-group v-model="ruleForm.isPackaging" class="ml-4" style="margin-top: -5px">
            <el-radio :label="1" size="large">是</el-radio>
            <el-radio :label="0" size="large">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否显示电子菜谱" prop="isShowInEbook" style="width: 100%">
          <el-radio-group v-model="ruleForm.isShowInEbook" class="ml-4" style="margin-top: -5px">
            <el-radio :label="1" size="large">是</el-radio>
            <el-radio :label="0" size="large">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品图片" prop="picUrl" style="width: 100%">
          <UploadImg v-model:image-url="ruleForm.picUrl" width="80px" height="80px" file-size="400" v-if="route.query.type !== 'detail'">
            <template #empty>
              <el-icon>
                <Picture />
              </el-icon>
              <span>可拖拽上传</span>
            </template>
          </UploadImg>
          <el-image :src="ruleForm.logoImg" style="width: 80px; height: 80px" v-else></el-image>
        </el-form-item>
        <el-form-item label="商品介绍" prop="description" style="width: 100%">
          <!-- <el-input v-model="ruleForm.description" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" placeholder="请输入" /> -->
          <div style="width: 1000px; border: 1px solid #ccc">
            <Toolbar style="border-bottom: 1px solid #ccc" :editor="editor" :default-config="toolbarConfig" />
            <Editor v-model="ruleForm.description" style="height: 301px; overflow-y: hidden" :default-config="editorConfig" :mode="mode" @onCreated="onCreated" />
          </div>
        </el-form-item>
        <!-- <el-form-item label="简码" prop="janeSearch" style="width: 100%">
          <el-input class="w260" v-model="ruleForm.janeSearch" />
        </el-form-item> -->
        <el-form-item label="条码" prop="barCode" style="width: 100%">
          <el-input class="w260" v-model="ruleForm.barCode" />
        </el-form-item>
        <el-form-item label="起售数" prop="minSell" style="width: 100%">
          <el-input class="w260" v-model="ruleForm.minSell" />
        </el-form-item>
        <el-form-item label="最小累加数" prop="minAdd" style="width: 100%">
          <el-input class="w260" v-model="ruleForm.minAdd" />
        </el-form-item>
      </el-form>
    </div>
    <page-handle @confirm="submitForm(ruleFormRef)" v-if="route.query.type !== 'detail'"></page-handle>
    <page-handle :config="pageHandleConfig" v-else ref="pageHandleRef" @other="onEdit">
      <template #back>
        <el-button class="plain-btn" @click="onBack">返回</el-button>
      </template>
    </page-handle>

    <AddOrEditDialog ref="addOrEditDialogRef" @getPropData="getPropData"></AddOrEditDialog>
  </page>
</template>

<script setup name="goodsInfo">
import { ref, reactive, onMounted /* computed */, watch /* getCurrentInstance */ } from 'vue'
import pinyin from 'js-pinyin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { http } from '@/api'
import UploadImg from '@/components/Upload/Img.vue'
import { showReqError } from '@/hooks/useError'
import AddOrEditDialog from './components/AddOrEditDialog.vue'
import SelectGoodsDialog from './components/select-goods/index.vue'
import { getStorage } from '@/utils/storage'

const editor = ref(null)
const toolbarConfig = ref({})
const goodUploadImg = ref('')
const editorConfig = ref({
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      customUpload: goodUploadImg.value,
    },
  },
})
const mode = ref('simple') // or 'simple'

const onCreated = (val) => {
  editor.value = Object.seal(val) // 一定要用 Object.seal() ，否则会报错
}

const setPrice = () => {
  // console.log(111)
  // console.log(ruleForm.value.price)
}

// const instance = getCurrentInstance()

pinyin.setOptions({ checkPolyphone: false, charCase: 0 })

const ruleFormRef = ref()
// const districtRef = ref()
// const cascaderRef = ref()
const pageHandleRef = ref()
const addOrEditDialogRef = ref()
const SelectGoodsDialogRef = ref()

const route = useRoute()
const router = useRouter()

const sizeTableData = ref([])
const goodsTableData = ref([])
const propListTableData = ref([])

const laeblIdOptions = ref([
  {
    id: '1',
    name: '推荐菜',
  },
  {
    id: '2',
    name: '新品',
  },
  {
    id: '3',
    name: '招牌菜',
  },
])

let ruleForm = ref({
  name: '',
  goodsType: '01', // 商品类型 (01:普通商品; 02:普通套餐; 03:称重套餐)
  isPrint: 1,
  hotTag: 0,
  isTemp: 0,
  isDiscount: 1,
  isPackaging: 0,
  isSupportPackage: 1,
  isShowInEbook: 1,
  minSell: 1,
  minAdd: 1,
})

let statiscOptions = ref([])
let categoryOptions = ref([])
let sizeOptions = ref([])
let propOptions = ref([])

let isEdit = ref(false)
let isCurrentTemp = ref(false)

onMounted(() => {
  // ruleForm.value.parentOrgId = route.query.orgId

  if (route.query.id) {
    findOrganizationById()
    isEdit.value = true

    /* // 编辑时，如果是临时菜
    if (ruleForm.value.isTemp === 1) {
      ruleForm.value.name = '临时菜'
    } */
  }

  statiscategoryFindList()
  categoryOptionsFindList()
  findSizetypeList()

  // findPropTree()
})

const checkUnit = (val) => {
  let reg = /\d/
  // return reg.test(str);
  // console.log(reg.test(val))

  if (reg.test(val)) {
    ruleForm.value.unit = ''
  }
}

const batchDelete = (index) => {
  // console.log(index)
  propListTableData.value.splice(index, 1)
}
const batchDeleteGoods = (index) => {
  // console.log(index)
  goodsTableData.value.splice(index, 1)
}

const setGoodsPack = () => {
  // console.log(goodsTableData.value)
  SelectGoodsDialogRef.value.show(goodsTableData.value)
}

const confirm = (ids, goods) => {
  // console.log(ids, goods)

  goodsTableData.value = goods

  ruleForm.value.goodsPackageList = goods
}

const handleChangeCategoryId = (value) => {
  // console.log(value, ruleForm.value, categoryOptions.value)
  categoryOptions.value.forEach((item) => {
    // console.log(item)

    if (item.children.length !== 0) {
      item.children.forEach((jItem) => {
        if (jItem.id === value[1]) {
          console.log(jItem.statisId, jItem.statisName)
          if (jItem.statisId) {
            ruleForm.value.statisCategoryId = jItem.statisId
          }
        }
      })
    }
  })
}

const setJaneSearch = () => {
  // console.log(ruleForm.value.name, ruleForm.value.janeSearch)
  // ruleForm.value.janeSearch = ruleForm.value.name
  ruleForm.value.janeSearch = pinyin.getCamelChars(ruleForm.value.name).toLowerCase()
}

const addProp = (type) => {
  // console.log(propListTableData.value)

  addOrEditDialogRef.value.show(propListTableData.value, type)
}

const setSize = (val) => {
  //  表格数据增加判断
  if (val.length > sizeTableData.value.length) {
    // console.log('select选择数量大于表格数目，说明此时是新增操作')

    /**
     * 添加：
     * 当前的选项是val数组的最后一项，即获取最后一项的id
     * 根据最后一项的id，匹配下拉列表，获取规格名称
     * 将匹配的规格名称添加到表格中
     */
    // 获取当前添加项
    let currentSelect = sizeOptions.value.filter((item) => item.id === val[val.length - 1])[0]
    sizeTableData.value.push({
      sizeTypeId: currentSelect.id,
      sizeTypeName: currentSelect.name,
      price: ruleForm.value.price,
      sequence: '',
    })
  }

  //  减少数据表格判断
  if (val.length < sizeTableData.value.length) {
    // console.log('select选择数量小于表格数目，说明此时是减少操作')

    /**
     * 删除：
     * 减少之后，val数组中数据会少一项，判断进入减少操作
     * 遍历表格数据，与val数组做比较，找到减少的那一项
     * 在表格中删除那一项
     */
    /* let currentDelete = sizeTableData.value.filter((item) => !val.includes(item.sizeTypeId))
    console.log(currentDelete) */
    sizeTableData.value.forEach((item, index) => {
      if (!val.includes(item.sizeTypeId)) {
        sizeTableData.value.splice(index, 1)
      }
    })
  }

  // 将表格数据赋值到表单数据
  ruleForm.value.sizeList = sizeTableData.value
}

const onBack = () => {
  pageHandleRef.value.goBack()
}

const onEdit = () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      type: 'edit',
    },
  })
}

/**
 * 获取地址信息树
 */
const statiscategoryFindList = async () => {
  try {
    let res = await http('statiscategoryFindList')
    if (res.isError) return showReqError(res)
    statiscOptions.value = res.content
  } catch (error) {
    console.log(error)
  }
}
const categoryOptionsFindList = async () => {
  try {
    let res = await http('findCategoryTree')
    if (res.isError) return showReqError(res)
    categoryOptions.value = res.content
    // console.log('00', categoryOptions.value)
  } catch (error) {
    console.log(error)
  }
}
const findSizetypeList = async () => {
  try {
    let res = await http('findSizetypeList')
    if (res.isError) return showReqError(res)
    sizeOptions.value = res.content
    console.log(sizeOptions.value)
  } catch (error) {
    console.log(error)
  }
}
// onEdit
/* const findPropTree = async () => {
  try {
    let res = await http('findPropTree')
    if (res.isError) return showReqError(res)
    propOptions.value = res.content
  } catch (error) {
    console.log(error)
  }
} */
/**
 *  详情
 */
const findOrganizationById = async () => {
  const params = {
    id: route.query.id,
  }

  const apiName = route.query.type === 'wait' ? 'findApplyingGoodsById' : 'findGoodsById'

  try {
    let res = await http(apiName, params)
    if (res.isError) return showReqError(res)
    console.log('详情', res)
    // console.log('00', categoryOptions.value)

    if (!res.content) return

    if (!res.content.description) {
      res.content.description = '<p><br></p>'
    }

    ruleForm.value = res.content

    if (ruleForm.value.isTemp) {
      if (ruleForm.value.isTemp === 1) {
        isCurrentTemp.value = true
        // console.log(isCurrentTemp.value)
      }
    }

    categoryOptions.value.forEach((item) => {
      if (item.children) {
        item.children.forEach((jItem) => {
          if (jItem.id === res.content.categoryId) {
            ruleForm.value.categoryId = [item.id, jItem.id]
          }
        })
      }
    })

    if (res.content.propList) {
      propListTableData.value = res.content.propList
      // console.log(propListTableData.value)

      propListTableData.value.forEach((item) => {
        if (item.isMustOption === 1 && item.isRadio === 1) {
          // item.propId = item.propList[0].propValue
          item.propList.forEach((jItem) => {
            // console.log(jItem.isDefault)
            if (jItem.isDefault === 1) {
              item.propId = jItem.id
              // console.log('000', item, jItem)
            }
          })
        }
        // console.log(item)
        // item.propId = parseInt(item.propId, 10)

        propOptions.value.forEach((jItem) => {
          if (item.classId === jItem.classId) {
            item.className = jItem.className
            item.propList = jItem.propList
          }
        })
      })

      // console.log(propListTableData.value)
    }
    if (res.content.sizeList) {
      sizeTableData.value = res.content.sizeList
      ruleForm.value.sizeTypeId = res.content.sizeList.map((item) => item.sizeTypeId)
    }
    if (res.content.goodsPackageList) {
      goodsTableData.value = res.content.goodsPackageList
      goodsTableData.value.forEach((item) => {
        item.goodsName = item.name
      })
    }
  } catch (error) {
    console.log(error)
  }
}

// 判断数组对象中某个属性的值是否为空
const arrPropIsEmpty = (arr, prop) => {
  if (arr) {
    let _arr = []
    arr.forEach((item) => {
      // console.log(item[prop])
      _arr.push(item[prop])
    })
    // console.log(arr, _arr)
    if (_arr.some((val) => val === '' || !val)) {
      // console.log('有空值，不通过') // true
      return true
    }

    // console.log('无空值，通过') // false
    return false
  }
}
// 判断价格是否为0
const arrPropPrice = (arr, prop) => {
  if (arr) {
    let _arr = []
    arr.forEach((item) => {
      // console.log(item[prop])
      _arr.push(item[prop])
    })
    // console.log(arr, _arr)
    if (_arr.some((val) => val === '0')) {
      // console.log('有空值，不通过') // true
      // return true
      return false
    }

    // console.log('无空值，通过') // false
    return false
  }
}

/**
 * 处理请求数据
 */
const handleSubmitData = async () => {
  const apiName = route.query.id === undefined ? 'insertGoods' : 'modifyGoods'

  ruleForm.value.propList = propListTableData.value

  // console.log(ruleForm.value.categoryId)

  if (ruleForm.value.categoryId.length === 1) {
    ElMessage.warning('必须选择二级分类')
    return
  }

  // console.log('xxx', ruleForm.value.sizeList)
  if (ruleForm.value.sizeList && arrPropIsEmpty(ruleForm.value.sizeList, 'price') && ruleForm.value.isTemp !== 1) {
    ElMessage.warning('规格价格不能为空')
    return
  }

  if (arrPropPrice(ruleForm.value.sizeList, 'price')) {
    ElMessage.warning('规格价格不能为0')
    return
  }

  /* let priceFlagArr =  []
  ruleForm.value.sizeList.forEach(item=> {
    priceFlagArr.push(item.)
  }) */

  /* let _arr = []
    arr.forEach((item) => {
      // console.log(item[prop])
      _arr.push(item[prop])
    })
    // console.log(arr, _arr)
    if (_arr.some((val) => val === '' || !val)) {
      // console.log('有空值，不通过') // true
      return true
    }
    // console.log('无空值，通过') // false
    return false */

  if (ruleForm.value.goodsPackageList && arrPropIsEmpty(ruleForm.value.goodsPackageList, 'num')) {
    ElMessage.warning('套餐商品数量不能为空')
    return
  }

  let propFlag = false
  ruleForm.value.propList.forEach((item) => {
    if (item.isMustOption === 1 && item.isRadio === 1) {
      if (item.propList.length > 0 && !item.propId) {
        propFlag = true
      }
    }
  })

  if (propFlag) {
    ElMessage.warning('必须选择商品属性')
    return
  }

  if (ruleForm.value.isTemp === 1 && ruleForm.value.isPackaging === 1) {
    ElMessage.warning('打包盒商品和临时菜商品不能同时存在')
    return
  }

  /* console.log('0000', ruleForm.value.propList)
  let propIdArr = []
  ruleForm.value.propList.forEach((item) => {
    console.log(item)
    if (item.isMustOption === 1 && item.isRadio === 1) {
      propIdArr.push(item.propId)
    }
  })
  console.log(propIdArr)
  let propFlag = propIdArr.some((item) => item === null)
  if (propFlag) {
    ElMessage.warning('必须选择商品属性')
    return
  } */

  // ruleForm.value.categoryId = ruleForm.value.categoryId[ruleForm.value.categoryId.length - 1]
  /* if(typeof(ruleForm.value.categoryId) === 'Array') {
    ruleForm.value.categoryId =
  } */
  const params = {
    ...ruleForm.value,
    categoryId:
      // typeof ruleForm.value.categoryId === 'Array' ? ruleForm.value.categoryId[ruleForm.value.categoryId.length - 1] : ruleForm.value.categoryId
      typeof ruleForm.value.categoryId === 'object' ? ruleForm.value.categoryId[ruleForm.value.categoryId.length - 1] : ruleForm.value.categoryId,
    orgId: getStorage('orgId'),
  }
  console.log(params, apiName)

  try {
    let res = await http(apiName, params)
    if (res.isError) return showReqError(res)
    ElMessage.success('保存成功')

    // router.push('/goods/list')
    router.back()
    // instance?.proxy?.emitter.emit('findGoodsList')
  } catch (error) {
    console.log(error)
  }
}

const isSetTemp = (val) => {
  // console.log(val)

  if (!val) return
  if (val === 1) {
    ElMessageBox.confirm('该商品将作为临时菜展示，您是否要将其设置为临时菜', '提示', {
      type: 'warning',
    })
      .then(() => {
        ruleForm.value.isTemp = 1
      })
      .catch(() => {
        ruleForm.value.isTemp = 0
      })
  }
}

const isSetDiscount = (val) => {
  if (val === 1) return
  if (val === 0) {
    ElMessageBox.confirm('设定为否后，该商品将不参与所有优惠活动', {
      type: 'warning',
    })
      .then(() => {
        ruleForm.value.isDiscount = 0
      })
      .catch(() => {
        ruleForm.value.isDiscount = 1
      })
  }
}

/**
 * 校验 form 表单
 * @param {El} formEl form 的对象
 */
const submitForm = async (formEl) => {
  // console.log('155', arrPropPrice(ruleForm.value.sizeList, 'price'))

  // console.log(ruleForm.value, editor.value, propListTableData.value)
  // console.log(ruleForm.value.categoryId[ruleForm.value.categoryId.length - 1])

  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      handleSubmitData()

      /* let isPackagingRule = ref(false)
      let isTempRule = ref(true) */

      /* if (ruleForm.value.isPackaging === 1 && ruleForm.value.name.indexOf('打包盒') !== -1) {
        ElMessageBox.confirm('您当前设置为打包盒商品,商品名称需包含打包盒', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          isPackagingRule.value = true
        })
      } else {
        isPackagingRule.value = true
      } */

      // 如果是临时菜
      /* if (ruleForm.value.isTemp === 1) {
        ElMessageBox.confirm('由于您选择了临时菜，商品名称将自动变更为临时菜', '提示', {
          confirmButtonText: '确定',
          // cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            if (ruleForm.value.name.indexOf('临时菜') === -1) {
              ruleForm.value.name = `临时菜`
              isTempRule.value = true
            }
          })
          .catch(() => {})
      } else {
        isTempRule.value = true
      } */
      // console.log(isPackagingRule, isTempRule)

      /* if (isPackagingRule && isTempRule) {
        handleSubmitData()
      } */
      /* // 打包盒商品
      if (isEdit.value && ruleForm.value.isPackaging === 1) {
        ElMessageBox.confirm('您当前设置为打包盒商品', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            handleSubmitData()
          })
          .catch(() => {})
      } */
    } else {
      console.log('error submit!', fields)
    }
  })
}

const checkPrice = (rule, value, callback) => {
  console.log('验证价格')
  if (value === '0') {
    callback(new Error('价格不能为0'))
  } else {
    callback()
  }
}

const rules = reactive({
  goodsType: [{ required: true, message: '请选择', trigger: 'blur' }],
  name: [{ required: true, message: '请输入', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择', trigger: 'blur' }],
  statisCategoryId: [{ required: true, message: '请选择', trigger: 'blur' }],
  isDiscount: [{ required: true, message: '请选择', trigger: 'blur' }],
  isPrint: [{ required: true, message: '请选择', trigger: 'blur' }],
  isTemp: [{ required: true, message: '请选择', trigger: 'blur' }],
  janeSearch: [{ required: true, message: '请输入', trigger: 'blur' }],
  // barCode: [{ required: true, message: '请输入', trigger: 'blur' }],
  minAdd: [{ required: true, message: '请输入', trigger: 'blur' }],
  minSell: [{ required: true, message: '请输入', trigger: 'blur' }],
  remark: [{ required: true, message: '请输入', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入', trigger: 'blur' }],
  price: [
    { required: true, message: '请输入', trigger: 'blur' },
    // { validator: checkPrice, trigger: 'blur' }
  ],
  sizeTypeId: [{ required: true, message: '请选择', trigger: 'blur' }],
})

const pageHandleConfig = {
  btns: [
    {
      slot: 'back',
    },
    {
      text: '编辑',
      plain: true,
      type: 'primary',
      event: 'other',
    },
  ],
}

const setProp = (value) => {
  console.log(`setProp`, value, propListTableData.value)

  propListTableData.value.forEach((item) => {
    if (item.propId === value) {
      console.log(item)

      item.propList.forEach((jItem) => {
        jItem.isDefault = 0
        if (item.propId === jItem.id) {
          jItem.isDefault = 1
        }
      })
    }
  })

  // console.log(value, propListTableData.value)
  // propListTableData.value.forEach((item) => {
  //   if (item.isMustOption === 1 && item.isRadio === 1) {
  //     console.log(value, item)
  //     item.propList.forEach((jItem) => {
  //       jItem.isDefault = 0
  //       if (jItem.id === value) {
  //         jItem.isDefault = 1
  //       }
  //     })
  //     // item.isDefault = 0
  //     /* if (item.id === value) {
  //       item.isDefault = 1
  //     } */
  //   }
  // })
  // console.log(propListTableData.value)
  // ruleForm.value.propList = propListTableData.value
}

const getPropData = (data) => {
  /**
   * 是否单选  isRadio
   * 是否必选  isMustOption
   * 单选且必选，在表格显示可选，否则表格显示只读
   */
  console.log(data)
  // propListTableData.value = data

  data.forEach((item) => {
    // 表格显示只读 - 选择几个propList显示几个
    // if (item.isMustOption === 0 || item.isRadio === 0) {
    // console.log(item)
    if (item.attrId) {
      // if (item.attrId.length === 0) return
      item.propList = item.propList.filter((jItem) => item.attrId.includes(jItem.id))
    }
    // }
  })

  propListTableData.value = data

  /* if (data.isMustOption === 0 || data.isRadio === 0) {
    // propListTableData.value = data
    ruleForm.value.propList = data
  } else {
    data.forEach((item) => {
      item.propList0 = JSON.parse(JSON.stringify(item.propList))
      item.attrId.forEach((jItem) => {
        // console.log(jItem)
        item.propList = item.propList0.filter((qItem) => qItem.id === jItem)
      })
      delete item.propList0
    })
    // console.log(data.propList.filter((item) => item.id === '113828868178729984'))
  } */
  // propListTableData.value = data

  /* if (data.isMustOption === 1 && data.isRadio === 1) {
    propListTableData.value = data
  } else {
    ruleForm.value.propList = data
  } */
}

watch(ruleForm, (newValue) => {
  if (newValue) {
    ruleForm.value.janeSearch = pinyin.getCamelChars(newValue.name).toLowerCase()
  }
})
</script>
<style lang="scss" scoped>
.input_tip {
  color: red;
  position: absolute;
  left: 3px;
  top: 50%;
  transform: translateY(-50%);
}

.form-wrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-right: 80px;
  width: 800px;

  .img-tips {
    padding-right: 50px;

    p {
      line-height: 22px;
    }
  }

  .prop_table {
    :deep .el-table__header-wrapper {
      display: none;
    }
  }
}
</style>
<style src="@wangeditor/editor/dist/css/style.css"></style>
