<template>
  <h1 class="page-title">내 인사 정보</h1>
  <div class="desc-row">
    <p class="desc">사원 상세 조회</p>
  </div>
  <div class="employee-detail">
    <div class="card compact-card adjusted-card short-height-card overflow-scroll-wrapper top-card">
      <div class="top-card-layout">

        <div class="profile-area">
          <div class="profile-wrapper">
            <img
              v-if="previewSrc"
              :src="previewSrc"
              class="profile-img"
              :class="{ editable: isEditing }"
              @click="isEditing && triggerFileSelect()"
            />
            <div
              v-else
              class="profile-placeholder-box editable"
              @click="isEditing && triggerFileSelect()"
            >
              <span>사진 없음</span>
            </div>

            <!-- ───────── 업로드 아이콘 추가 ───────── -->
            <button
              v-if="isEditing"
              class="upload-btn-icon"
              type="button"
              @click="triggerFileSelect"
            >
              <img
                src="@/assets/icons/img_btn.svg"
                alt="Upload"
                class="upload-icon"
              />
            </button>

            <!-- 숨겨진 file input -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onPhotoSelected"
            />
          </div>
        </div>

        <!-- 폼 그리드 -->
        <div class="top-grid-info">
          <div class="info-item">
            <label class="label-bold">사원명</label>
            <input class="same-size-input" v-model="form.employeeName" readonly />
          </div>
          <div class="info-item">
            <label class="label-bold">직무</label>
            <input class="same-size-input" v-model="form.jobName" readonly />
          </div>
          <div class="info-item">
            <label class="label-bold">근무형태</label>
            <input class="same-size-input" v-model="form.workType" readonly />
          </div>
          <div class="info-item">
            <label class="label-bold">본부</label>
            <input class="same-size-input" v-model="form.headName" readonly />
          </div>
          <div class="info-item">
            <label class="label-bold">직책</label>
            <input class="same-size-input" v-model="form.positionName" readonly />
          </div>
          <div class="info-item">
            <label class="label-bold">입사일</label>
            <input class="same-size-input" v-model="form.employmentDate" readonly />
          </div>
          <div class="info-item">
            <label class="label-bold">부서</label>
            <input class="same-size-input" v-model="form.departmentName" readonly />
          </div>
          <div class="info-item">
            <label class="label-bold">직급</label>
            <input class="same-size-input" v-model="form.rankName" readonly />
          </div>
          <div class="info-item">
            <label class="label-bold">퇴사일</label>
            <input class="same-size-input" v-model="form.retirementDate" readonly />
          </div>
          <div class="info-item">
            <label class="label-bold">팀</label>
            <input class="same-size-input" v-model="form.teamName" readonly />
          </div>
          <div class="info-item">
            <label class="label-bold">연락처</label>
            <input
              class="same-size-input"
              v-model="form.employeeContact"
              :readonly="!isEditing"
            />
          </div>
          <div class="info-item">
            <label class="label-bold">사번</label>
            <input class="same-size-input" v-model="form.employeeId" readonly />
          </div>
          <div class="info-item">
            <label class="label-bold">이메일</label>
            <input
              type="email"
              class="same-size-input"
              v-model="form.employeeEmail"
              :readonly="!isEditing"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 탭 영역 -->
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

    <!-- 하단 카드: 탭별 읽기 전용 필드 -->
    <div class="card tab-content overflow-scroll-wrapper bottom-card">
      <div v-if="currentTab === '인사정보'">
        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item">
              <label class="label-bold">성별</label>
              <input class="same-size-input" v-model="form.employeeGender" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">국적</label>
              <input class="same-size-input" v-model="form.employeeNation" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">생년월일</label>
              <input
                type="date"
                class="same-size-input"
                v-model="form.employeeBirth"
                :readonly="!isEditing"
              />
            </div>
            <div class="info-item">
              <label class="label-bold">4대 보험</label>
              <input class="same-size-input" v-model="form.isFourInsurances" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">거래 은행</label>
              <input
                class="same-size-input"
                v-model="form.bankName"
                :readonly="!isEditing"
              />
            </div>
            <div class="info-item">
              <label class="label-bold">예금주</label>
              <input
                class="same-size-input"
                v-model="form.bankDepositor"
                :readonly="!isEditing"
              />
            </div>
            <div class="info-item">
              <label class="label-bold">계좌 번호</label>
              <input
                class="same-size-input"
                v-model="form.bankAccount"
                :readonly="!isEditing"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="currentTab === '개인정보'">
        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item">
              <label class="label-bold">주민등록번호</label>
              <input class="same-size-input" v-model="form.employeeResident" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">주소</label>
              <input
                class="same-size-input"
                v-model="form.employeeAddress"
                :readonly="!isEditing"
              />
            </div>
            <div class="info-item">
              <label class="label-bold">출신학교</label>
              <input class="same-size-input" v-model="form.employeeSchool" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">장애여부</label>
              <input class="same-size-input" v-model="form.isDisorder" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">병역여부</label>
              <input class="same-size-input" v-model="form.militaryType" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">부양 가족 수</label>
              <input class="same-size-input" v-model="form.familyCount" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">결혼 여부</label>
              <input class="same-size-input" v-model="form.isMarriage" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">결혼 일자</label>
              <input class="same-size-input" v-model="form.marriageDate" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">경력 년수</label>
              <input class="same-size-input" v-model="form.careerYearCount" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">이전 근무 회사</label>
              <input class="same-size-input" v-model="form.previousCompany" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">최종 학력</label>
              <input class="same-size-input" v-model="form.finalAcademic" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">전공</label>
              <input class="same-size-input" v-model="form.employeeDept" readonly />
            </div>
            <div class="info-item">
              <label class="label-bold">졸업년도</label>
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
            :gridOptions="{ theme: 'legacy' }"
            :rowData="appointmentData"
            :defaultColDef="defaultColDef"
            :pagination="true"
            :paginationPageSize="pageSize"
            rowSelection="multiple"
            @grid-ready="onGridReady"
            @cell-clicked="onCellClick"
            style="width:100%; height:100%"
          />
        </div>
      </div>
      <!-- 징계 탭: AG Grid -->
      <div v-else-if="currentTab === '징계'">
        <div class="ag-theme-alpine ag-grid-box">
          <AgGridVue
            :columnDefs="disciplineColumnDefs"
            :gridOptions="{ theme: 'legacy' }"            
            :rowData="disciplineData"
            :defaultColDef="defaultColDef"
            :pagination="true"
            :paginationPageSize="pageSize"
            rowSelection="multiple"
            @grid-ready="onGridReady"
            @cell-clicked="onCellClick"
            style="width:100%; height:100%"
          />
        </div>
      </div>
      <!-- 계약 탭: AG Grid -->
      <div v-else-if="currentTab === '계약'">
        <div class="ag-theme-alpine ag-grid-box">
          <AgGridVue
            :columnDefs="contractColumnDefs"
            :gridOptions="{ theme: 'legacy' }"
            :rowData="contractData"
            :defaultColDef="defaultColDef"
            :pagination="true"
            :paginationPageSize="pageSize"
            rowSelection="multiple"
            @grid-ready="onGridReady"
            @cell-clicked="onCellClick"
            style="width:100%; height:100%"
          />
        </div>
      </div>
            <!-- 하단 오른쪽 고정 버튼 그룹 -->
      <div class="action-buttons-bottom">
        <button v-if="!isEditing" class="btn-save" @click="enterEditMode">수정</button>
        <template v-else>
          <button class="btn-delete" @click="cancelEdit">취소</button>
          <button class="btn-save" @click="saveChanges">저장</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { AgGridVue } from 'ag-grid-vue3'
import detailIconUrl from '@/assets/icons/detail_appointment.svg'
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

// Axios 기본 URL 설정
axios.defaults.baseURL = 'http://localhost:8000'

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

const userStore   = useUserStore()
const router      = useRouter()
const employeeId  = userStore.employeeId


// 프로필 미리보기 URL
const previewSrc = ref('')

// 편집 모드
const isEditing = ref(false)
let original = {}


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
    // 순번
    {
      headerName: '번호',
      width: 90,
      valueGetter: params => params.node.rowIndex + 1,
      sortable: false,
      suppressMenu: true
    },
    // 사원번호
    { headerName: '사원번호', field: 'employeeId',             flex: 1 },
    // 발령사유
    { headerName: '발령사유', field: 'appointmentReason',      flex: 1 },
    // 발령유형
    { headerName: '발령유형', field: 'appointmentType',        flex: 1 },
    // 발령일자
    { headerName: '발령일자', field: 'appointmentEffectiveDate', flex: 1 },
    {
    headerName: '상세',
    field: 'detail',
    width: 80,
    cellRenderer: () => `<img src="${detailIconUrl}" class="detail-btn"/>`
    }
])

// 징계 그리드
const disciplineColumnDefs = ref([
  {
    headerName: '',
    field: 'checkbox',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 50,
    pinned: 'left'
  },
  { headerName: '번호',            field: 'disciplinaryId',          width: 80,  cellClass: 'center-align' },
  { headerName: '사원명',          field: 'employeeName',            flex: 1.2 },
  {
    headerName: '징계 서류',
    field: 'fileList',
    flex: 2,
    cellRenderer: params => {
      const files = Array.isArray(params.value) ? params.value : []
      if (!files.length) return '-'
      return `<div class="file-list-cell">${
        files.map((f,i) => `<a href="#" data-idx="${i}">${f.fileName}</a>`).join('')
      }</div>`
    }
  },
  { headerName: '징계 내용',     field: 'disciplinaryDescription', flex: 2 },
  {
    headerName: '징계일자',
    field: 'disciplinaryDate',
    flex: 1,
    cellClass: 'center-align',
    valueFormatter: ({ value }) => new Date(value).toISOString().slice(0,10)
  }
])

// 계약 그리드
const contractColumnDefs = ref([
  {
    headerName: '',
    field: 'checkbox',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 50,
    pinned: 'left'
  },
  { headerName: 'ID',               field: 'contractId',          width: 80, cellClass: 'center-align' },
  { headerName: '사원명',           field: 'employeeName',        flex: 1.2 },
  { headerName: '계약 설명',        field: 'contractDescription', flex: 2 },
  {
    headerName: '파일',
    field: 'fileList',
    flex: 2,
    cellRenderer: params => {
      const files = Array.isArray(params.value) ? params.value : []
      if (!files.length) return '-'
      return `<div class="file-list-cell">${
        files.map((f,i) => `<a href="#" data-idx="${i}">${f.fileName}</a>`).join('')
      }</div>`
    }
  },
  {
    headerName: '요청일자',
    field: 'requestDate',
    flex: 1,
    cellClass: 'center-align',
    valueFormatter: ({ value }) => new Date(value).toISOString().slice(0,10)
  },
  {
    headerName: '계약일자',
    field: 'contractDate',
    flex: 1,
    cellClass: 'center-align',
    valueFormatter: ({ value }) => new Date(value).toISOString().slice(0,10)
  },
  {
    headerName: '만료일자',
    field: 'endDate',
    flex: 1,
    cellClass: 'center-align',
    valueFormatter: ({ value }) => new Date(value).toISOString().slice(0,10)
  }
])

// — 각 탭의 rowData
const appointmentData = ref([])
const disciplineData  = ref([])
const contractData    = ref([])

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
  departmentId:      '',
  departmentName:    '',
  teamId:            '',
  teamName:          ''
})

async function downloadFile(fileUrl, fileName) {
  try {
    const { data: presignedUrl } = await axios.get(
      '/s3/download-url',
      {
        params: { filename: fileUrl, contentType: '' },
        headers: { Authorization: `Bearer ${userStore.accessToken}` }
      }
    )
    const res  = await fetch(presignedUrl)
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('파일 다운로드 실패:', err)
    alert('파일 다운로드에 실패했습니다.')
  }
}

async function onCellClick(e) {
    // 1) 상세 버튼 클릭
    if (e.colDef.field === 'detail') {
      router.push(`/org/appointment/${e.data.appointmentHistoryId}`)
      return
    }

    // 2) 파일 목록 클릭 시 다운로드
    if (
      e.colDef.field === 'fileList' &&
      e.event.target.matches('a') &&
      e.event.target.dataset.idx != null
    ) {
      e.event.preventDefault()
      const idx  = Number(e.event.target.dataset.idx)
      const file = (e.data.fileList || [])[idx]
      if (!file) return
      await downloadFile(file.fileUrl, file.fileName)
    }
}

// 페이지 진입 시 데이터 로드
onMounted(async () => {
  try {
    // 기본 사원 정보
    const { data } = await axios.get(
      '/employees/myinfo',
      { headers: { Authorization: `Bearer ${userStore.accessToken}` } }
    )
    Object.assign(form, data)
    if (data.employeePhotoUrl) {
      const { data: url } = await axios.get('/s3/download-url', {
        params: { filename: data.employeePhotoUrl, contentType: 'image/png' }
      })
      previewSrc.value = url
    }

    // 인사발령 목록
    const res  = await axios.get(
      `/appointment-history/employee/${data.employeeId}`,
      { headers: { Authorization: `Bearer ${userStore.accessToken}` } }
    )
    // 응답 wrapper 안에 list 프로퍼티에 실제 배열이 들어 있다면
    appointmentData.value = Array.isArray(res.data)
      ? res.data
      : res.data.list

    // 징계 목록
    const discs = await axios.get(`/disciplinary/employee/${data.employeeId}`, {
      headers: { Authorization: `Bearer ${userStore.accessToken}` }
    })
    disciplineData.value = discs.data

    // 계약 목록
    const contracts = await axios.get(`/contract/employee/${data.employeeId}`, {
      headers: { Authorization: `Bearer ${userStore.accessToken}` }
    })
    contractData.value = contracts.data

  } catch (err) {
    console.error(err)
    alert('데이터를 불러오는 데 실패했습니다.')
    router.back()
  }
})

// 뒤로가기
function goBack() {
  router.back()
}

// 편집 모드 진입
function enterEditMode() {
  original = JSON.parse(JSON.stringify(form))
  isEditing.value = true
}

// 편집 취소
function cancelEdit() {
  Object.assign(form, original)
  isEditing.value = false
}

async function saveChanges() {

  // 저장 로직 시작 부분에 필수 값 검증
  const requiredFields = [
    { value: form.employeeBirth,    label: '생년월일' },
    { value: form.employeeContact,  label: '연락처' },
    { value: form.employeeEmail,    label: '이메일' },
    { value: form.employeeAddress,  label: '주소' },
    { value: form.bankName,         label: '거래 은행' },
    { value: form.bankDepositor,    label: '예금주' },
    { value: form.bankAccount,      label: '계좌 번호' }
  ];

  for (const field of requiredFields) {
    if (!field.value) {
      alert(`${field.label}을(를) 입력해주세요.`);
      return;  // 하나라도 비어 있으면 저장 중단
    }
  }
    
  try {
    const dto = {
      employeePhotoName: form.employeePhotoName,
      employeePhotoUrl:  form.employeePhotoUrl,
      employeeBirth:     form.employeeBirth,
      employeeContact:   form.employeeContact,
      employeeEmail:     form.employeeEmail,
      employeeAddress:   form.employeeAddress,
      bankName:          form.bankName,
      bankDepositor:     form.bankDepositor,
      bankAccount:       form.bankAccount
    }
    await axios.patch(
      `/employees/${form.employeeId}`,
      dto,
      { headers: { Authorization: `Bearer ${userStore.accessToken}` } }
    )
    alert('정보가 성공적으로 저장되었습니다.')
    isEditing.value = false
  } catch (err) {
    console.error(err)
    alert('저장에 실패했습니다.')
  }
}

// 사진 업로드 로직
const fileInput = ref(null)
function triggerFileSelect() {
  fileInput.value.click()
}
async function onPhotoSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return

  try {
    const { data: { url, key } } = await axios.get('/s3/upload-url', {
      params: { filename: file.name, contentType: file.type },
      headers: { Authorization: `Bearer ${userStore.accessToken}` }
    })
    await axios.put(url, file, { headers: { 'Content-Type': file.type } })
    form.employeePhotoUrl  = key
    form.employeePhotoName = file.name
    const { data: previewUrl } = await axios.get('/s3/download-url', {
      params: { filename: key, contentType: file.type }
    })
    previewSrc.value = previewUrl
  } catch (err) {
    console.error(err)
    alert('사진 업로드에 실패했습니다.')
  }
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

.back-btn {
  width: 24px;
  margin-right: -2px;
  cursor: pointer;
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
  position: relative;
  min-height: 200px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  width: 100%;
  min-width: 0;
  max-width: 100%;  
  margin-bottom: 30px;
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
  padding-bottom: 80px;   /* 버튼 높이 + 여유 */
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

.action-buttons-bottom {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  margin-top: 50px;
  gap: 8px;
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

.grid-info,
.ag-grid-box {
  margin-bottom: 24px;    /* 원하는 간격으로 조절 */
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

:deep(.file-list-cell) {
  display: flex;
  flex-wrap: nowrap;
  /* 링크들 사이 간격을 8px로 설정 */
  gap: 8px;
  max-height: 36px;
  padding-right: 8px;
}
/* a 태그는 줄바꿈 없이 */
.file-list-cell a {
  white-space: nowrap;
  text-decoration: underline;
  cursor: pointer;
}

.detail-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    width: 30px;
    height: 30px;
}
</style>
