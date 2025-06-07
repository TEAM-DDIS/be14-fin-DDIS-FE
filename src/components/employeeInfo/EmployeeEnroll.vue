<template>
  <!-- 페이지 제목 + 버튼을 같은 줄에 배치 -->
  <h1 class="page-title">사원 상세 조회</h1>
  <div class="desc-row">
    <p class="desc">사원 상세 조회</p>
    <div class="button-group-inline top-buttons">
      <button class="btn-delete" @click="onDeleteClick">삭제</button>
      <button class="btn-save"   @click="onSave">저장</button>
    </div>
  </div>

  <div class="employee-detail">
    <!-- ──────────────────────────────────────────────────────────────────────────
         ① 상단 카드: 프로필 + 입력폼
    ────────────────────────────────────────────────────────────────────────── -->
    <div class="card compact-card adjusted-card short-height-card overflow-scroll-wrapper top-card">
      <div class="top-card-layout">
        <!-- 프로필 영역 -->
        <div class="profile-area">
          <div class="profile-wrapper">
            <!-- 프로필 이미지: placeholder가 그대로라면 안내 문구 표시 -->
            <img
              v-if="profileSrc !== '/images/profile-placeholder.png'"
              class="profile-img"
              :src="profileSrc"
              alt="Profile"
            />
            <div v-else class="profile-placeholder-box">
              <span class="no-photo-text">사진을 추가해주세요</span>
            </div>

            <!-- 업로드 아이콘 (회색 원 없이 아이콘만) -->
            <button class="upload-btn-icon" @click="onUploadClick">
              <img
                src="~@/assets/icons/img_btn.svg"
                alt="Upload"
                class="upload-icon"
              />
            </button>

            <!-- 숨겨진 파일 입력창 -->
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              style="display: none"
              @change="onFileChange"
            />
          </div>
        </div>

        <!-- 위쪽 카드 전용 그리드 (3열 × 5행) -->
        <div class="top-grid-info">
          <!-- 1행 -->
          <div class="info-item">
            <label class="label-bold">사원명</label>
            <input class="same-size-input" />
          </div>
          <div class="info-item">
            <label class="label-bold">직무</label>
            <input class="same-size-input" />
          </div>
          <div class="info-item">
            <label class="label-bold">근무형태</label>
            <input class="same-size-input" />
          </div>

          <!-- 2행 -->
          <div class="info-item">
            <label class="label-bold">본부</label>
            <select class="same-size-input" v-model="selectedHead">
              <option value="">선택</option>
              <option
                v-for="(departments, head) in departmentMap"
                :key="head"
                :value="head"
              >
                {{ head }}
              </option>
            </select>
          </div>
          <div class="info-item">
            <label class="label-bold">직책</label>
            <input class="same-size-input" />
          </div>
          <div class="info-item">
            <label class="label-bold">입사일</label>
            <input type="date" class="same-size-input" />
          </div>

          <!-- 3행 -->
          <div class="info-item">
            <label class="label-bold">부서</label>
            <select class="same-size-input" v-model="selectedDepartment">
              <option value="">선택</option>
              <option
                v-for="dept in departmentMap[selectedHead] || []"
                :key="dept"
              >
                {{ dept }}
              </option>
            </select>
          </div>
          <div class="info-item">
            <label class="label-bold">직급</label>
            <input class="same-size-input" />
          </div>
          <div class="info-item">
            <label class="label-bold">퇴사일</label>
            <input type="date" class="same-size-input" />
          </div>

          <!-- 4행 -->
          <div class="info-item">
            <label class="label-bold">팀</label>
            <select class="same-size-input" v-model="selectedTeam">
              <option value="">선택</option>
              <option
                v-for="team in teamMap[selectedDepartment] || []"
                :key="team"
              >
                {{ team }}
              </option>
            </select>
          </div>
          <div class="info-item">
            <label class="label-bold">연락처</label>
            <input class="same-size-input" />
          </div>
          <!-- 빈칸 (4행 3열) -->
          <div class="info-item"></div>

          <!-- 5행 -->
          <div class="info-item">
            <label class="label-bold">사번</label>
            <input class="same-size-input" />
          </div>
          <div class="info-item">
            <label class="label-bold">이메일</label>
            <input class="same-size-input" />
          </div>
          <!-- 빈칸 (5행 3열) -->
          <div class="info-item"></div>
        </div>
      </div>
    </div>

    <!-- ──────────────────────────────────────────────────────────────────────────
         ② 탭 메뉴
    ────────────────────────────────────────────────────────────────────────── -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="['tab', { active: currentTab === tab }]"
        @click="currentTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- ──────────────────────────────────────────────────────────────────────────
         ③ 하단 카드: 탭별 상세 정보 (아래쪽 카드 그대로)
    ────────────────────────────────────────────────────────────────────────── -->
    <div class="card tab-content overflow-scroll-wrapper bottom-card">
      <!-- 인사정보 탭 -->
      <div v-if="currentTab === '인사정보'">
        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item">
              <label class="label-bold">성별</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">국적</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">생년월일</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">직무</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">직책</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">직급</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">입사일</label>
              <input type="date" class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">퇴사일</label>
              <input type="date" class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">4대 보험</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">거래 은행</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">예금주</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">계좌</label>
              <input class="same-size-input" />
            </div>
          </div>
        </div>
      </div>

      <!-- 개인정보 탭 -->
      <div v-else-if="currentTab === '개인정보'">
        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item">
              <label class="label-bold">주민등록번호</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">주소</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">출신학교</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">장애 여부</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">병역 여부</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">부양 가족 수</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">결혼 여부</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">결혼 일자</label>
              <input type="date" class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">경력 년수</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">이전 근무 회사</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">최종 학력</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">전공</label>
              <input class="same-size-input" />
            </div>
            <div class="info-item">
              <label class="label-bold">졸업년도</label>
              <input type="date" class="same-size-input" />
            </div>
          </div>
        </div>
      </div>

      <!-- 인사발령 탭: AG Grid -->
      <div v-else-if="currentTab === '인사발령'">
        <div class="ag-theme-alpine ag-grid-box">
          <AgGridVue
            class="ag-theme-alpine custom-theme"
            :gridOptions="{ theme: 'legacy' }"
            :columnDefs="appointmentColumnDefs"
            :rowData="appointmentData"
            :defaultColDef="defaultColDef"
            rowSelection="multiple"
            :pagination="true"
            :paginationPageSize="pageSize"
            @grid-ready="onGridReady"
            style="width: 100%; height: 100%;"
          />
        </div>
      </div>

      <!-- 징계 탭: AG Grid (“징계 일자” 컬럼 추가) -->
      <div v-else-if="currentTab === '징계'">
        <div class="ag-theme-alpine ag-grid-box">
          <AgGridVue
            class="ag-theme-alpine custom-theme"
            :gridOptions="{ theme: 'legacy' }"
            :columnDefs="disciplineColumnDefs"
            :rowData="disciplineData"
            :defaultColDef="defaultColDef"
            rowSelection="multiple"
            :pagination="true"
            :paginationPageSize="pageSize"
            @grid-ready="onGridReady"
            style="width: 100%; height: 100%;"
          />
        </div>
      </div>

      <!-- 계약 탭: AG Grid -->
      <div v-else-if="currentTab === '계약'">
        <div class="ag-theme-alpine ag-grid-box">
          <AgGridVue
            class="ag-theme-alpine custom-theme"
            :gridOptions="{ theme: 'legacy' }"
            :columnDefs="contractColumnDefs"
            :rowData="contractData"
            :defaultColDef="defaultColDef"
            rowSelection="multiple"
            :pagination="true"
            :paginationPageSize="pageSize"
            @grid-ready="onGridReady"
            style="width: 100%; height: 100%;"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- 삭제 확인 모달 -->
  <div v-if="showDeleteModal" class="modal-overlay">
    <div class="modal-content">
      <p>정말로 삭제하시겠습니까?</p>
      <div class="modal-buttons">
        <button class="btn-modal btn-cancel" @click="cancelDelete">취소</button>
        <button class="btn-modal btn-confirm" @click="confirmDelete">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
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

// AG Grid 모듈 등록 (한 번만)
ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
])

// vue-router 인스턴스
const router = useRouter()

// 탭 목록과 현재 선택된 탭
const tabs = ['인사정보', '개인정보', '인사발령', '징계', '계약']
const currentTab = ref('인사정보')

// 상단 필터용 더미 데이터
const selectedHead = ref('')
const selectedDepartment = ref('')
const selectedTeam = ref('')

const departmentMap = {
  개발본부: ['PC게임개발부서', '아트개발부서'],
  경영지원본부: ['인사부서', '재무회계부서'],
  사업본부: ['마케팅부서', '영업부서'],
}

const teamMap = {
  PC게임개발부서: ['PC개발팀', 'PC게임기획팀'],
  아트개발부서: ['아트기획팀'],
  인사부서: ['채용팀', '인사평가팀'],
  재무회계부서: ['급여정산팀', '세무관리팀'],
  마케팅부서: ['콘텐츠마케팅팀', '퍼포먼스팀'],
  영업부서: ['B2B영업팀', 'B2C영업팀'],
}

watch(selectedHead, () => {
  selectedDepartment.value = ''
  selectedTeam.value = ''
})
watch(selectedDepartment, () => {
  selectedTeam.value = ''
})

// 프로필 미리보기용 src와 파일 입력창 ref
const profileSrc = ref('/images/profile-placeholder.png')
const fileInput = ref(null)

function onUploadClick() {
  fileInput.value?.click()
}

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  profileSrc.value = URL.createObjectURL(file)
}

// AG Grid 공통 컬럼 설정
const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true
}

const pageSize = ref(10)
let gridApi = null
function onGridReady(params) {
  gridApi = params.api
}

// --- 인사발령 그리드 컬럼 & 데이터 ---
const appointmentColumnDefs = ref([
  { headerName: '번호',       field: 'id', width: 90 },
  { headerName: '사원번호',   field: 'employeeNo', width: 150, cellClass: 'center-align', flex: 1 },
  { headerName: '발령유형',   field: 'appointment_type', cellClass: 'center-align', flex: 1 },
  { headerName: '발령일자',   field: 'appointment_effective_date', cellClass: 'center-align', flex: 1 },
  { headerName: '상태',       field: 'appointment_status', cellClass: 'center-align', width: 200 },
  { headerName: '상세',       field: 'detail', width: 100 },
])

const appointmentData = ref([
  { id: 1, employeeNo: 'EMP001', appointment_type: '승진',    appointment_effective_date: '2021-03-15', appointment_status: '완료' },
  { id: 2, employeeNo: 'EMP002', appointment_type: '보직변경', appointment_effective_date: '2022-06-01', appointment_status: '진행 중' },
  { id: 3, employeeNo: 'EMP003', appointment_type: '승진',    appointment_effective_date: '2023-01-10', appointment_status: '완료' },
])

// --- 징계 탭: “징계 일자” 컬럼 추가 ---
const disciplineColumnDefs = ref([
  { headerName: '징계번호', field: 'disciplineNo',  flex: 1, cellClass: 'center-align' },
  { headerName: '징계내용', field: 'content',       flex: 2 },
  { headerName: '징계일자', field: 'disciplineDate', flex: 1, cellClass: 'center-align' },
])

const disciplineData = ref([
  { disciplineNo: 'D001', content: '지각 3회 경고', disciplineDate: '2023-02-10' },
  { disciplineNo: 'D002', content: '업무 태만 징계', disciplineDate: '2023-05-05' },
])

// --- 계약 탭: 기존 컬럼 & 데이터 ---
const contractColumnDefs = ref([
  { headerName: '번호',     field: 'id',           width: 100, cellClass: 'center-align' },
  { headerName: '요청일자', field: 'requestDate',  width: 150, cellClass: 'center-align' },
  {
    headerName: '계약서류',
    field: 'document',
    flex: 1,
    cellRenderer: params =>
      `<a href="${params.data.documentUrl}" target="_blank">${params.value}</a>`
  },
  { headerName: '계약일자', field: 'contractDate', width: 150, cellClass: 'center-align' },
  { headerName: '만료일자', field: 'expiryDate',   width: 150, cellClass: 'center-align' },
])

const contractData = ref([
  {
    id: 1,
    requestDate: '2017-12-20',
    document: '근로계약서.pdf',
    documentUrl: '/contracts/근로계약서.pdf',
    contractDate: '2017-12-28',
    expiryDate: '2019-12-27',
  },
  {
    id: 2,
    requestDate: '2018-01-10',
    document: '비밀유지계약서.pdf',
    documentUrl: '/contracts/비밀유지계약서.pdf',
    contractDate: '2018-01-15',
    expiryDate: '2020-01-14',
  },
  {
    id: 3,
    requestDate: '2019-05-05',
    document: '인턴계약서.pdf',
    documentUrl: '/contracts/인턴계약서.pdf',
    contractDate: '2019-05-10',
    expiryDate: '2019-08-10',
  },
  {
    id: 4,
    requestDate: '2020-01-01',
    document: '프리랜서계약서.pdf',
    documentUrl: '/contracts/프리랜서계약서.pdf',
    contractDate: '2020-01-05',
    expiryDate: '2021-01-04',
  },
])

// --- 저장 / 삭제 처리 로직 ---
// 저장 버튼 클릭 시, 알림 후 목록 조회 페이지로 이동
function onSave() {
  alert('저장 되었습니다')
  router.push('/employeeInfo/employeeList')
}

// 삭제 클릭 시 모달 띄우기
const showDeleteModal = ref(false)

function onDeleteClick() {
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
}

// 삭제 확인 후, 알림 띄우고 목록 조회 페이지로 이동
function confirmDelete() {
  showDeleteModal.value = false
  alert('삭제가 완료되었습니다')
  router.push('/employeeInfo/employeeList')
}
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
</style>