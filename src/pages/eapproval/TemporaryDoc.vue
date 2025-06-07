<!-- 전자결재 > 기안작성 > 임시저장함 -->

<template>
  <h1 class="page-title">기안작성</h1>
    <!-- 헤더: 기안양식함 + 양식 추가 + 토글 -->
    <div class="form-list-header">
      <h3 class="box-title">임시저장함</h3>
            <!-- <button class="button add" @click="onAddForm">양식 추가</button> -->
      <span class="item-count">임시저장목록 {{ registeredForms.length }}건</span>
    </div>

    <div v-if="formsExpanded" class="storage-box fixed-height">
      <div class="box-content">
        <div class="search-area">
          <img src="@/assets/icons/search.svg" alt="검색이미지" class="search-logo" />
          <input type="text" v-model="formSearchQuery" placeholder="제목 검색" class="search-input" />
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
  { id: 1, title: '사업기안 임시저장', date: '2025-05-22', author: '인사팀 이쁜펭' },
  { id: 2, title: '휴가신청서 임시저장', date: '2025-05-22', author: '인사팀 이쁜펭' },
])

const formColumnDefs = [
    { headerName: '번호', field: 'id', width: 80, cellStyle: { textAlign: 'center' } },
    { headerName: '제목', field: 'title', flex: 1 },
    { headerName: '임시저장일', field: 'date', width: 120, cellStyle: { textAlign: 'center' } },
    { headerName: '작성자', field: 'author', flex: 1 },
]

const filteredForms = computed(() => {
  if (!formSearchQuery.value) return registeredForms.value
  const query = formSearchQuery.value.toLowerCase()
  return registeredForms.value.filter(form => form.name.toLowerCase().includes(query))
})

function handleFormRowClick({ data }) {
  if (data && data.path) router.push(data.path)
}
</script>

<style>
/* 페이지 상단 제목 스타일 */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
}

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

/* 임시저장함 제목과 개수 영역 */
.form-list-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px; /* 간격 줄임 */
  padding-left: 4px;
}

/* 임시저장 목록 수 표시 */
.item-count {
  color: #666;
  font-size: 1em;
  margin-left: 0;
}

/* 전체 테이블 박스 영역 */
.storage-box {
  width: 100%;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  padding: 32px 32px 40px 32px; /* 위쪽 padding을 줄임 */
  box-shadow: 1px 1px 20px 1px rgba(0,0,0,0.05);
  margin: 24px 0;
 /* 상하 여백 줄임 */
  transition: background 0.2s;
  box-sizing: border-box;
}

/* 높이 고정 및 내부 column 방향 설정 */
.storage-box.fixed-height {
  height: 700px;
  display: flex;
  flex-direction: column;
}

/* 검색 영역 스타일 */
.search-area {
  width: 400px;
  height: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: flex-start;
}

/* 검색 아이콘 스타일 */
.search-logo {
  width: 28px;
  height: auto;
  margin-right: 4px;
}

/* 검색 input 스타일 */
.search-input {
  max-width: 900px;
  padding: 8px;
  border: 1px solid #c7c7c7;
  border-radius: 8px;
  font-size: 1.05em;
  flex: 1 1 0;
}

.search-input:focus {
  outline: none;
  border: 1px solid #111;
  box-shadow: 0 0 0 1.5px #111;
}

</style>
