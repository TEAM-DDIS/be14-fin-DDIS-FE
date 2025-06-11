 <!-- 전자결재 > 기안작성 > (기안양식목록) -->

<template>
  <h1 class="page-title">기안작성</h1>
    <!-- 헤더: 기안양식함 + 양식 추가 + 토글 -->
    <div class="form-list-header">
      <h3 class="box-title">기안양식함</h3>
      <button class="button add" @click="onAddForm">양식 추가</button>
      <span class="item-count">양식목록 {{ registeredForms.length }}건</span>
    </div>
    <!-- 검색 + 표 -->
    <div v-if="formsExpanded" class="storage-box fixed-height">
      <div class="box-content">
        <div class="search-area">
          <img src="@/assets/icons/search.svg" alt="검색이미지" class="search-logo" />
          <input type="text" v-model="formSearchQuery" placeholder="양식 제목 검색" class="search-input" />
        </div>
        <!-- AG Grid 적용 -->
        <AgGridVue
          class="ag-theme-alpine custom-theme"
          :gridOptions="{ theme: 'legacy' }"
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
  { id: 1, name: '업무기안', retention: '5년', manager: '인사팀 이쁜펭', path: '/draft/formA' },
  { id: 2, name: '외근신청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/draft/formAB' },
  { id: 3, name: '출장신청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/form/business-trip' },
  { id: 4, name: '인사발령 결재요청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/form/promotion' },
  { id: 5, name: '초과근무신청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/form/overtime' },
  { id: 6, name: '휴가신청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/form/vacation' },
  { id: 7, name: '테스트', retention: '5년', manager: '인사팀 이쁜펭', path: '/draft/test' }
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

function handleFormRowClick({ data }) {
  if (data && data.path) router.push(data.path)
}

function onAddForm() {
  alert('양식 추가 버튼 클릭!')
}
</script>

<style scoped>

.add {
  position: absolute;           /* 부모 요소 기준으로 절대 위치 지정 */
  right: 24px;                  /* 오른쪽에서 24px 떨어진 위치 */
  font-size: 14px;              /* 글자 크기 설정 */
  font-weight: bold;           /* 글자를 굵게 표시 */
  cursor: pointer;             /* 마우스 오버 시 커서를 손가락 모양으로 */
  font-family: inherit;        /* 상위 요소의 폰트 스타일 상속 */
  background-color: #00a8e8;   /* 배경색: 밝은 파랑 */
  color: white;                /* 글자색: 흰색 */
  border: 1px solid transparent; /* 투명 테두리 (hover 시 변화 대비) */
  border-radius: 10px;         /* 둥근 테두리 (모서리) */
  padding: 10px 30px;          /* 내부 여백: 위아래 10px, 좌우 30px */
  cursor: pointer;             /* (중복) 클릭 가능한 버튼임을 표시 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* 그림자 효과 */
  transition: background-color 0.2s, box-shadow 0.2s; /* 전환 애니메이션 */
  box-sizing: border-box;      /* 테두리와 패딩을 width에 포함 */
}
.add:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
} 
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
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
  background: #fff;
  border-radius: 12px;
  padding: 32px 32px 40px 32px;
  box-shadow: 1px 1px 20px 1px rgba(0,0,0,0.05);
  margin: 24px 0;
  /* overflow: hidden; */
  transition: background 0.2s;
  box-sizing: border-box; /* 추가 */
}
.storage-box.fixed-height {
  height: 700px;
  display: flex;
  flex-direction: column;
}
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
  max-width: 900px;
  padding: 8px;
  border: 1px solid #c7c7c7;      /* 기본 2px */
  border-radius: 8px;
  font-size: 1.05em;
  flex: 1 1 0;
}
.search-input:focus {
  outline: none;
  border: 1px solid #111;          /* 포커스 시도 2px */
  box-shadow: 0 0 0 1.5px #111;    /* 옵션: 강조 효과 */
}
</style>
