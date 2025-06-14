<template>
    <h1 class="page-title">사원 목록 조회</h1>
    <div class="desc-row">
        <p class="desc">사원 상세 조회 </p>
        <div class="button-group-inline top-buttons">
        <button class="btn-back" @click="onBackClick">뒤로가기</button>
        </div>
  </div>

<div class="employee-detail">
    <div class="card compact-card adjusted-card short-height-card overflow-scroll-wrapper top-card">
      <div class="top-card-layout">

        <!-- 프로필 -->
        <div class="profile-area">
          <img v-if="form.employeePhotoUrl" :src="form.employeePhotoUrl" class="profile-img"/>
          <div v-else class="profile-placeholder-box"><span>사진 없음</span></div>
        </div>
        <!-- 폼 그리드 -->
        <div class="top-grid-info">
          <div class="info-item">
            <label class ="label-bold">사원명</label>
            <input class="same-size-input" v-model="form.employeeName" readonly />
          </div>
          <div class="info-item">
            <label class ="label-bold">직무</label>
            <input class="same-size-input" v-model="form.jobName" readonly />
          </div>
          <div class="info-item">
            <label class ="label-bold">근무형태</label>
            <input class="same-size-input" v-model="form.workType" readonly />
          </div>
          <div class="info-item">
            <label class ="label-bold">본부</label>
            <input class="same-size-input" v-model="form.headName" readonly />
          </div>
          <div class="info-item">
            <label class ="label-bold">직책</label>
            <input class="same-size-input" v-model="form.positionName" readonly />
          </div>
          <div class="info-item">
            <label class ="label-bold">입사일</label>
            <input class="same-size-input" v-model="form.employmentDate" readonly />
          </div>
          <div class="info-item">
            <label class ="label-bold">부서</label>
            <input class="same-size-input" v-model="form.departmentName" readonly />
          </div>
          <div class="info-item">
            <label class ="label-bold">직급</label>
            <input class="same-size-input" v-model="form.rankName" readonly />
          </div>
          <div class="info-item">
            <label class ="label-bold">퇴사일</label>
            <input class="same-size-input" v-model="form.retirementDate" readonly />
          </div>
          <div class="info-item">
            <label class ="label-bold">팀</label>
            <input class="same-size-input" v-model="form.teamName" readonly />
          </div>
          <div class="info-item">
            <label class ="label-bold">연락처</label>
            <input class="same-size-input" v-model="form.employeeContact" readonly />
          </div>
          <div class="info-item">
            <label class ="label-bold">사번</label>
            <input class="same-size-input" v-model="form.employeeId" readonly />
          </div>
          <div class="info-item">
            <label class ="label-bold">이메일</label>
            <input class="same-size-input" v-model="form.employeeEmail" readonly />
          </div>
         </div>
        </div>
    </div>

    <!-- 탭 영역 -->
    <div class="tabs">
      <button v-for="tab in tabs" :key="tab" :class="['tab',{ active: currentTab===tab }]" @click="currentTab=tab">
        {{ tab }}
      </button>
    </div>

    <!-- 하단 카드: 탭별 읽기 전용 필드 -->
    <div class="card tab-content overflow-scroll-wrapper bottom-card">
      <div v-if="currentTab==='인사정보'">
        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item">
              <label class ="label-bold">성별</label>
              <input class="same-size-input" v-model="form.employeeGender" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">국적</label>
              <input class="same-size-input" v-model="form.employeeNation" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">생년월일</label>
              <input class="same-size-input" v-model="form.employeeBirth" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">4대 보험</label>
              <input class="same-size-input" v-model="form.isFourInsurances" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">거래 은행</label>
              <input class="same-size-input" v-model="form.bankName" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">예금주</label>
              <input class="same-size-input" v-model="form.bankDepositor" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">계좌 번호</label>
              <input class="same-size-input" v-model="form.bankAccount" readonly />
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="currentTab==='개인정보'">
        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item">
              <label class ="label-bold">주민등록번호</label>
              <input class="same-size-input" v-model="form.employeeResident" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">주소</label>
              <input class="same-size-input" v-model="form.employeeAddress" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">출신학교</label>
              <input class="same-size-input" v-model="form.employeeSchool" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">장애여부</label>
              <input class="same-size-input" v-model="form.isDisorder" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">병역여부</label>
              <input class="same-size-input" v-model="form.militaryType" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">부양 가족 수</label>
              <input class="same-size-input" v-model="form.familyCount" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">결혼 여부</label>
              <input class="same-size-input" v-model="form.isMarriage" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">결혼 일자</label>
              <input class="same-size-input" v-model="form.marriageDate" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">경력 년수</label>
              <input class="same-size-input" v-model="form.careerYearCount" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">이전 근무 회사</label>
              <input class="same-size-input" v-model="form.previousCompany" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">최종 학력</label>
              <input class="same-size-input" v-model="form.finalAcademic" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">전공</label>
              <input class="same-size-input" v-model="form.employeeDept" readonly />
            </div>
            <div class="info-item">
              <label class ="label-bold">졸업년도</label>
              <input class="same-size-input" v-model="form.graduationYear" readonly />
            </div>
          </div>
         </div>
      </div>
      <!-- 인사발령 탭: AG Grid -->
      <div v-else-if="currentTab === '인사발령'">
        <div class="ag-theme-alpine ag-grid-box">  
          <AgGridVue
            :columnDefs="appointmentColumnDefs"
            :rowData="appointmentData"
            :defaultColDef="defaultColDef"
            :pagination="true"
            :paginationPageSize="pageSize"
            rowSelection="multiple"
            @grid-ready="onGridReady"
            style="width:100%; height:100%"
          />
        </div>
      </div>
      <!-- 징계 탭: AG Grid -->
      <div v-else-if="currentTab === '징계'">
        <div class="ag-theme-alpine ag-grid-box">
          <AgGridVue
            :columnDefs="disciplineColumnDefs"
            :rowData="disciplineData"
            :defaultColDef="defaultColDef"
            :pagination="true"
            :paginationPageSize="pageSize"
            rowSelection="multiple"
            @grid-ready="onGridReady"
            style="width:100%; height:100%"
          />
        </div>
      </div>
      <!-- 계약 탭: AG Grid -->
      <div v-else-if="currentTab === '계약'">
        <div class="ag-theme-alpine ag-grid-box">
          <AgGridVue
            :columnDefs="contractColumnDefs"
            :rowData="contractData"
            :defaultColDef="defaultColDef"
            :pagination="true"
            :paginationPageSize="pageSize"
            rowSelection="multiple"
            @grid-ready="onGridReady"
            style="width:100%; height:100%"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
axios.defaults.baseURL = 'http://localhost:8000'

import { AgGridVue } from 'ag-grid-vue3'
import {
  ModuleRegistry,
  AllCommunityModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
} from 'ag-grid-community'

// AG Grid 모듈 등록
ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
])



const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// 탭 정의
const tabs = ['인사정보','개인정보','인사발령','징계','계약']
const currentTab = ref(tabs[0])

// ⑤ AG Grid 공통 설정
const defaultColDef = { sortable: true, filter: true, resizable: true }
const pageSize = ref(10)
let gridApi = null
function onGridReady(params) { gridApi = params.api }

// 인사발령 그리드
const appointmentColumnDefs = ref([
  { headerName: '번호', field: 'id', width: 90 },
  { headerName: '사원번호', field: 'employeeNo', flex: 1, cellClass: 'center-align' },
  { headerName: '발령유형', field: 'appointment_type', flex: 1, cellClass: 'center-align' },
  { headerName: '발령일자', field: 'appointment_effective_date', flex: 1, cellClass: 'center-align' },
  { headerName: '상태', field: 'appointment_status', width: 200 },
  { headerName: '상세', field: 'detail', width: 100 }
])

// 징계 그리드
const disciplineColumnDefs = ref([
  { headerName: '징계번호', field: 'disciplineNo', flex: 1, cellClass: 'center-align' },
  { headerName: '징계내용', field: 'content', flex: 2 },
  { headerName: '징계일자', field: 'disciplineDate', flex: 1, cellClass: 'center-align' }
])

// 계약 그리드
const contractColumnDefs = ref([
  { headerName: '번호', field: 'id', width: 100, cellClass: 'center-align' },
  { headerName: '요청일자', field: 'requestDate', width: 150 },
  { headerName: '계약서류', field: 'document', flex: 1, cellRenderer: params => `<a href="${params.data.documentUrl}" target="_blank">${params.value}</a>` },
  { headerName: '계약일자', field: 'contractDate', width: 150 },
  { headerName: '만료일자', field: 'expiryDate', width: 150, cellClass: 'center-align' }
])

// form 초기값
const form = reactive({
  employeeId:        '',  
  employeeName:      '',
  employeePwd:       '',
  employeePhotoName: '',
  employeePhotoUrl:  '',
  employeeNation:    '',
  employeeGender:    '',
  employeeBirth:     '',     
  employeeResident:  '',
  employeeContact:   '',
  employeeEmail:     '',
  employeeAddress:   '',
  employmentDate:    '',     
  retirementDate:    '',    
  workType:          '',    
  bankName:          '',
  bankDepositor:     '',
  bankAccount:       '',
  isDisorder:        '',     
  militaryType:      '',     
  isMarriage:        '',     
  marriageDate:      '',     
  familyCount:       '',
  careerYearCount:   '',
  previousCompany:   '',
  finalAcademic:     '',
  employeeSchool:    '',
  employeeDept:      '',
  graduationYear:    '',
  isFourInsurances:  '',  
  positionId:        '',   
  positionName:      '',
  rankId:            '',
  rankName:          '',
  jobId:             '',
  jobName:           '',
  headId:            '',
  headName:          '',
  departmentName:    '',
  teamId:            '',
  teamName:          ''
})

// 뒤로가기
function onBackClick() {
  router.back()
}

// 데이터 가져오기
onMounted(async () => {
  const { id } = route.params
  try {
    const { data } = await axios.get(`/employees/${id}`, {
      headers: { Authorization: `Bearer ${userStore.accessToken}` }
    })

    // S3 컨트롤러를 통해 프록시로 이미지 불러오기
    form.employeePhotoUrl  = data.employeePhotoUrl
    form.employeePhotoName   = data.employeePhotoName
    form.employeeId          = data.employeeId
    form.employeeName        = data.employeeName
    form.employeeNation      = data.employeeNation
    form.employeeGender      = data.employeeGender
    form.employeeBirth       = data.employeeBirth
    form.employeeResident    = data.employeeResident
    form.employeeContact     = data.employeeContact
    form.employeeEmail       = data.employeeEmail
    form.employeeAddress     = data.employeeAddress

    form.employmentDate      = data.employmentDate
    form.retirementDate      = data.retirementDate

    form.workType            = data.workType
    form.bankName            = data.bankName
    form.bankDepositor       = data.bankDepositor
    form.bankAccount         = data.bankAccount

    form.isDisorder          = data.isDisorder
    form.militaryType        = data.militaryType
    form.isMarriage          = data.isMarriage
    form.marriageDate        = data.marriageDate
    form.familyCount         = data.familyCount
    form.careerYearCount     = data.careerYearCount
    form.previousCompany     = data.previousCompany

    form.finalAcademic       = data.finalAcademic
    form.employeeSchool      = data.employeeSchool
    form.employeeDept        = data.employeeDept
    form.graduationYear      = data.graduationYear
    form.isFourInsurances    = data.isFourInsurances

    form.positionId          = data.positionId
    form.positionName        = data.positionName

    form.rankId              = data.rankId
    form.rankName            = data.rankName

    form.jobId               = data.jobId
    form.jobName             = data.jobName

    form.headId              = data.headId
    form.headName            = data.headName

    form.departmentId        = data.departmentId
    form.departmentName      = data.departmentName

    form.teamId              = data.teamId
    form.teamName            = data.teamName

    if (form.employeePhotoUrl) {
      try {
        const resp = await axios.get(`/s3/download-url`, {
          params: {
            filename: form.employeePhotoUrl,
            contentType: 'image/png'   // 실제 업로드하신 파일 타입에 맞춰 주세요
          }
        })
        form.employeePhotoUrl = resp.data  // 이제 이 값이 <img> src 가 됩니다
      } catch (e) {
        console.error('S3 presigned download URL fetch failed', e)
        // 실패 시, 그냥 빈 상태로 두거나 placeholder를 보여줄 수 있습니다
        form.employeePhotoUrl = ''
      }
    }

  } catch (err) {
    console.error(err)
    alert('사원 정보를 불러오는 데 실패했습니다.')
    router.back()
  }
})
</script>

<style scoped>
/* 페이지 타이틀과 설명 */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
}

/* “사원 상세 조회” 텍스트와 버튼을 같은 행에 배치 */
.desc-row {
  display: flex;
  align-items: center;   /* 텍스트와 버튼을 수직 가운데 정렬 */
  margin-left: 20px;     /* 기존 .desc 의 margin-left */
}
.desc {
  margin: 0; /* 텍스트 자체의 여백 제거 */
}

/* 위쪽 카드 내부로 이동한 버튼 그룹 */
.button-group-inline.top-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-left: auto;   /* “사원 상세 조회”와 버튼 사이 빈 공간 채우기 */
  margin-right: 20px;  /* 전체 오른쪽 여백 맞추기 */
}

.btn-save {
  background-color: #00a8e8;
  color: white;
  font-weight: bold;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-save:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.btn-delete {
  background-color: #d3d3d3;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 10px 30px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-delete:hover {
  background-color: #000;
  color: #fff;
}

/* EmployeeDetail 전체 컨테이너 */
.employee-detail {
  padding: 1rem;
  font-size: 14px;
  max-width: 100%;
  overflow-x: hidden;
  margin: 0 auto;
}

/* 공통 Card 스타일 (상단/하단 모두 동일) */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  width: 100%;
  min-width: 0;
  max-width: 100%;
  margin-bottom: 30px;
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
}

/* 상단 카드 내부 레이아웃 */
.top-card-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  min-width: 1024px;
}

/* 프로필 */
.profile-area {
  flex-shrink: 0;
}
.profile-wrapper {
  position: relative;
  display: inline-block;
}
.profile-img {
  width: 200px;
  height: 260px;
  object-fit: cover;
  border-radius: 8px;
}

/* 사진이 없을 때 표시되는 박스 및 텍스트 */
.profile-placeholder-box {
  width: 200px;
  height: 260px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
}
.no-photo-text {
  color: #999;
  font-size: 14px;
}

/* 업로드 버튼 아이콘 (회색 원 없이) */
.upload-btn-icon {
  position: absolute;
  right: -40px;
  bottom: -10px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  z-index: 1;
}
.upload-icon {
  width: 40px;
  height: 40px;
}

/* ──────────────────────────────────────────────────────────────────────────
   위쪽 카드 전용 그리드 (3열 × 5행)
────────────────────────────────────────────────────────────────────────── */
.top-grid-info {
  display: grid;
  grid-template-columns: repeat(3, minmax(200px, 1fr));
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

/* 아래쪽 카드 그리드 (원본 그대로) */
.grid-info {
  display: grid;
  grid-template-columns: repeat(3, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
}
@media (max-width: 1024px) {
  .grid-info {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    white-space: normal;
  }
}

/* AG Grid 컨테이너 */
.ag-grid-box {
  width: 100%;
  height: 300px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto;
  overflow-y: auto;
}

.info-column {
  display: contents;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.label-bold {
  font-weight: 600;
  width: 100px;
  text-align: right;
}
.same-size-input {
  width: 180px;
  height: 36px;
  padding: 0.6rem;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

/* 탭 메뉴 */
.tabs {
  display: flex;
  gap: 1px;
  margin-top: 15px;
  border-bottom: 1px solid #ccc;
}
.tab {
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  background: #e0e0e0;
  border: 1px solid #ccc;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}
.tab.active {
  background: #fff;
  font-weight: bold;
  border-bottom: 1px solid #fff;
}

/* 셀 중앙 정렬 */
.center-align {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 삭제 확인 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #ffffff;
  border-radius: 12px;
  padding: 30px 40px;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
}
.modal-content p {
  margin-bottom: 16px;
  font-size: 18px;
}
.modal-buttons {
  display: flex;
  justify-content: space-between;
}
.btn-modal {
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
}
.btn-cancel {
  background-color: #d3d3d3;
  color: #000;
  flex: 1;
  margin-right: 10px;
}
.btn-cancel:hover {
  background-color: #000;
  color: #fff;
}
.btn-confirm {
  background-color: #00a8e8;
  color: white;
  flex: 1;
}
.btn-confirm:hover {
  background-color: white;
  color: #00a8e8;
  border: 1px solid #00a8e8;
}

input[readonly] {
  background-color: #f9f9f9;
  border: none;
}
</style>
