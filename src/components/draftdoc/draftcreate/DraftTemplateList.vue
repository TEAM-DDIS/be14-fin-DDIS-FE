<template>
  <h1 class="page-title">기안작성</h1>

    <!-- 헤더: 기안양식함 + 양식 추가 + 토글 -->
    <div class="form-list-header">
      <h3 class="box-title">기안양식함</h3>
      <button class="button add" @click="onAddForm">양식 추가</button>
      <span class="item-count">양식목록 {{ registeredForms.length }}건</span>
    </div>

    <!-- 검색 + 표 : 접힘상태면 storage-box 사라짐 -->
    <div v-if="formsExpanded" class="storage-box fixed-height">
      <div class="box-content">
        <div class="search-area">
          <img src="@/assets/icons/search.svg" alt="검색이미지" class="search-logo" />
          <input type="text" v-model="formSearchQuery" placeholder="양식 제목 검색" class="search-input" />
          <button class="button primary">조회</button>
        </div>
        <!-- AG Grid 적용 -->
        <AgGridVue
          class="ag-theme-alpine custom-theme"
          style="width:100%;height:520px;"
          :columnDefs="formColumnDefs"
          :rowData="filteredForms"
          :pagination="true"
          rowSelection="single"
          @rowClicked="handleFormRowClick"
        />
      </div>
    </div>     

</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

const router = useRouter()
const formSearchQuery = ref('')
const formsExpanded = ref(true)

const registeredForms = ref([
  { id: 1, name: '일반사업기안', retention: '5년', manager: '인사팀 이쁜펭', path: '/org/draftlis/formA' },
  { id: 2, name: '외근신청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/org/draftlis/formB' },
  { id: 3, name: '출장신청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/form/business-trip' },
  { id: 4, name: '인사발령 결재요청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/form/promotion' },
  { id: 5, name: '초과근무신청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/form/overtime' },
  { id: 6, name: '휴가신청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/form/vacation' },
])

const formColumnDefs = [
  { headerName: '번호', field: 'id', width: 80, cellStyle: { textAlign: 'center' } },
  { headerName: '양식명', field: 'name', flex: 1 },
  { headerName: '보존기간', field: 'retention', width: 110, cellStyle: { textAlign: 'center' } },
  { headerName: '양식담당자', field: 'manager', flex: 1 },
]

const filteredForms = computed(() => {
  if (!formSearchQuery.value) return registeredForms.value
  const query = formSearchQuery.value.toLowerCase()
  return registeredForms.value.filter(form => form.name.toLowerCase().includes(query))
})

function toggleForms() {
  formsExpanded.value = !formsExpanded.value
}
function handleFormRowClick({ data }) {
  if (data && data.path) router.push(data.path)
}
function handleTempRowClick({ data }) {
  alert(`${data.title} 클릭됨`)
}
function onAddForm() {
  alert('양식 추가 버튼 클릭!')
}
</script>

<style scoped>
.box-title {
  margin: 0;
  font-size: 1.2em;
  font-weight: bold;
}
.add {
  position: absolute;
  top: 24px;
  right: 24px;
  background-color: #00a8e8;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 30px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.add:hover {
  background-color: #07749f;
} 
.page-title {
    margin-left: 20px;
    margin-bottom: 50px;
    color: #00a8e8;
}
.form-list-header {
  display: flex;
  align-items: center;
  gap: 12px;           /* 두 요소 간격, 너무 붙으면 더 늘리세요 */
  margin-bottom: 20px;
  padding-left: 4px;
}
.form-list-status {
  margin: 5px 0 0 4px;
}
.item-count {
  color: #666;
  font-size: 1em;
  margin-left: 0;
}
.storage-box {
  width: 100%;
  min-width: 0;
  /* 기존 스타일 유지 */
  background: #fff;
  border-radius: 12px;
  padding: 32px 32px 40px 32px;
  box-shadow: 1px 1px 20px 1px rgba(0,0,0,0.05);
  margin: 24px 0;
  /* overflow: hidden; */
  transition: background 0.2s;
  box-sizing: border-box; /* 추가 */

  /* width: 1550px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 1px 1px 20px 1px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  overflow: hidden;
  transition: background 0.2s; */
}
.storage-box.fixed-height {
  height: 700px;
  display: flex;
  flex-direction: column;
}
/* .storage-box.collapsed {
  background-color: transparent !important;
  box-shadow: none !important;
  border-radius: 8px !important;
  margin-bottom: 20px !important;
  border: none !important;
} */
/* .box-content {
  padding: 20px;
  height: 800px;
} */
.search-area {
  width: 400px;
  height: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: flex-start;
}
.search-logo {
  width: 28px;
  height: auto;
  margin-right: 4px;
}
.search-input {
  width: 100%;
  max-width: 900px;
  padding: 8px;
  border: 2px solid #00a8e8;
  border-radius: 8px;
  font-size: 1.05em;
  flex: 1 1 0;
}
.button.primary {
  background-color: #00a8e8;
  color: white;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  font-size: 1em;
  cursor: pointer;
  margin-left: 4px;
  min-width: 60px;
}

/* .-button {
  position: absolute;
  top: 24px;
  right: 24px;
  background-color: #00a8e8;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 30px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.edit-button:hover {
  background-color: #07749f;
} */
</style>
