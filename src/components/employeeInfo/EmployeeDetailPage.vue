<template>
  <h1 class="page-title">
    <img
      src="@/assets/icons/back_btn.svg"
      alt="back"
      class="back-btn"
      @click="goBack"
    />
    사원 목록 조회
  </h1>
  <div class="desc-row">
    <p class="desc">사원 상세 조회 </p>
  </div>

  <div class="employee-detail" :class="{ 'editing-mode': isEditing }">
    <div class="card compact-card adjusted-card short-height-card overflow-scroll-wrapper top-card">
      <div class="top-card-layout">
        <!-- 프로필 -->
        <div class="profile-area">
          <div class="profile-wrapper">
            <!-- 실제 이미지(또는 placeholder)를 클릭 가능하게 -->
            <img
              v-if="previewSrc"
              :src="previewSrc"
              class="profile-img"
              :class="{ editable: isEditing }"
              @click="triggerFileSelect"
            />
            <div
              v-else
              class="profile-placeholder-box editable"
              @click="triggerFileSelect"
            >
              <span>사진 없음</span>
            </div>

            <!-- 수정 모드일 때만 보이는 업로드 아이콘 -->
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

            <!-- 숨겨진 파일 입력창 -->
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
            <label class="label-bold">사원명
              <span class="required-star">*</span>
            </label>  
            <input
              class="same-size-input"
              v-model="form.employeeName"
              :readonly="!isEditing"
            />
          </div>
          <!-- 직무 -->
          <div class="info-item">
            <label class="label-bold">직무</label>
            <input
              class="same-size-input"
              :value="form.jobName || '-'"
              readonly
            />
          </div>
          <div class="info-item">
            <label class="label-bold">근무형태
              <span class="required-star">*</span>
            </label>
            <!-- 수정 모드일 때만 드롭다운 -->
            <template v-if="isEditing">
              <select v-model="form.workType" class="same-size-input">
                <option value="">선택</option>
                <option
                  v-for="opt in workTypeOptions"
                  :key="opt"
                  :value="opt"
                >
                  {{ opt }}
                </option>
              </select>
            </template>
            <!-- 보기 모드일 때는 읽기 전용 텍스트 -->
            <template v-else>
              <input
                class="same-size-input"
                :value="form.workType || '-'"
                readonly
              />
            </template>
          </div>
          <!-- 본부 -->
          <div class="info-item">
            <label class="label-bold">본부</label>
            <input
              class="same-size-input"
              :value="form.headName || '-'"
              readonly
            />
          </div>
          <!-- 직책 -->
          <div class="info-item">
            <label class="label-bold">직책</label>
            <input
              class="same-size-input"
              :value="form.positionName || '-'"
              readonly
            />
          </div>
          <div class="info-item">
            <label class="label-bold">입사일
              <span class="required-star">*</span> 
            </label>
            <input type="date" class="same-size-input" v-model="form.employmentDate" :readonly="!isEditing" />
          </div>
          <!-- 부서 -->
          <div class="info-item">
            <label class="label-bold">부서</label>
            <input
              class="same-size-input"
              :value="form.departmentName || '-'"
              readonly
            />
          </div>
          <!-- 직급 -->
          <div class="info-item">
            <label class="label-bold">직급</label>
            <input
              class="same-size-input"
              :value="form.rankName || '-'"
              readonly
            />
          </div>
          <div class="info-item">
            <label class="label-bold">퇴사일</label>
            <input type="date" class="same-size-input" v-model="form.retirementDate" :readonly="!isEditing" />
          </div>
          <!-- 팀 -->
          <div class="info-item">
            <label class="label-bold">팀</label>
            <input
              class="same-size-input"
              :value="form.teamName || '-'"
              readonly
            />
          </div>
          <div class="info-item">
            <label class="label-bold">연락처
              <span class="required-star">*</span> 
            </label>
            <input class="same-size-input" v-model="form.employeeContact" :readonly="!isEditing" />
            <span v-if="isEditing && errors.contact" class="error-text">{{ errors.contact }}</span>
          </div>
          <div class="info-item"></div>
          <div class="info-item">
            <label class="label-bold">사번
              <span class="required-star">*</span> 
            </label>
            <input class="same-size-input" v-model="form.employeeId" :readonly />
          </div>
          <div class="info-item">
            <label class="label-bold">이메일
              <span class="required-star">*</span> 
            </label>
            <input class="same-size-input" v-model="form.employeeEmail" :readonly="!isEditing"/>
            <span v-if="isEditing && errors.email" class="error-text">{{ errors.email }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- HR 권한이 있을 때만 탭 및 하단 컨텐츠 보여주기 -->
    <template v-if="isHR">
      <!-- 🔷 겹쳐지는 탭 스타일 적용 -->
      <div class="tab-wrapper">
        <div class="tab-menu">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="{ active: currentTab === tab }"
            @click="currentTab = tab"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- 하단 카드: 탭별 읽기 전용 필드 -->
      <div class="card tab-content overflow-scroll-wrapper bottom-card">
        <div class="tab-content-wrapper">
          <!-- 인사정보 -->
          <div v-if="currentTab === '인사정보'">
            <div class="grid-info scrollable-grid">
              <div class="info-column">
                <div class="info-item">
                  <label class="label-bold">
                    성별
                    <span class="required-star">*</span>
                  </label>
                  <!-- 수정 모드일 때 드롭다운 -->
                  <template v-if="isEditing">
                    <select v-model="form.employeeGender" class="same-size-input">
                      <option value="">선택</option>
                      <option
                        v-for="g in genderOptions"
                        :key="g"
                        :value="g"
                      >
                        {{ g }}
                      </option>
                    </select>
                  </template>
                  <template v-else>
                    <input
                      class="same-size-input"
                      :value="form.employeeGender || '-'"
                      readonly
                    />
                  </template>
                </div>
                <div class="info-item">
                  <label class="label-bold">거래 은행
                    <span class="required-star">*</span> 
                  </label>
                  <input class="same-size-input" v-model="form.bankName" :readonly="!isEditing" />
                </div>
                <div class="info-item">
                  <label class="label-bold">
                    4대 보험
                    <span class="required-star">*</span>
                  </label>
                  <template v-if="isEditing">
                    <select v-model="form.isFourInsurances" class="same-size-input">
                      <option value="">선택</option>
                      <option
                        v-for="opt in insuranceOptions"
                        :key="opt"
                        :value="opt"
                      >
                        {{ opt }}
                      </option>
                    </select>
                  </template>
                  <template v-else>
                    <input
                      class="same-size-input"
                      :value="form.isFourInsurances || '-'"
                      readonly
                    />
                  </template>
                </div>
                <div class="info-item">
                  <label class="label-bold">생년월일
                    <span class="required-star">*</span> 
                  </label>
                  <input type="date" class="same-size-input" v-model="form.employeeBirth" :readonly="!isEditing" />
                </div>
                <div class="info-item">
                  <label class="label-bold">계좌 번호
                    <span class="required-star">*</span> 
                  </label>
                  <input class="same-size-input" v-model="form.bankAccount" :readonly="!isEditing" />
                  <span v-if="isEditing && errors.bankAccount" class="error-text">{{ errors.bankAccount }}</span>
                </div>
                <div class="info-item"></div>
                <div class="info-item">
                  <label class="label-bold">국적
                    <span class="required-star">*</span> 
                  </label>
                  <input class="same-size-input" v-model="form.employeeNation" :readonly="!isEditing" />
                </div>
                <div class="info-item">
                  <label class="label-bold">예금주
                    <span class="required-star">*</span> 
                  </label>
                  <input class="same-size-input" v-model="form.bankDepositor" :readonly="!isEditing" />
                </div>
              </div>
            </div>
          </div>
          <!-- 개인정보 -->
          <div v-else-if="currentTab === '개인정보'">
            <div class="grid-info scrollable-grid">
              <div class="info-column">
                <div class="info-item">
                  <label class="label-bold">주민등록번호
                    <span class="required-star">*</span> 
                  </label>
                  <input class="same-size-input" v-model="form.employeeResident" :readonly="!isEditing" />
                  <span v-if="isEditing && errors.resident" class="error-text">{{ errors.resident }}</span>
                </div>
                <div class="info-item">
                  <label class="label-bold">
                    졸업년도
                  </label>
                  <!-- 수정 모드일 때 드롭다운 -->
                  <template v-if="isEditing">
                    <select class="same-size-input" v-model="form.graduationYear">
                      <option value="">선택</option>
                      <option
                        v-for="year in yearOptions"
                        :key="year"
                        :value="year"
                      >
                        {{ year }}
                      </option>
                    </select>
                  </template>
                  <!-- 보기 모드일 때 읽기 전용 텍스트 -->
                  <template v-else>
                    <input
                      class="same-size-input"
                      :value="form.graduationYear || '-'" 
                      readonly
                    />
                  </template>
                </div>
                <div class="info-item">
                  <label class="label-bold">
                    결혼 여부
                    <span class="required-star">*</span>
                  </label>
                  <template v-if="isEditing">
                    <select v-model="form.isMarriage" class="same-size-input">
                      <option value="">선택</option>
                      <option
                        v-for="opt in marriageOptions"
                        :key="opt"
                        :value="opt"
                      >
                        {{ opt }}
                      </option>
                    </select>
                  </template>
                  <template v-else>
                    <input
                      class="same-size-input"
                      :value="form.isMarriage || '-'"
                      readonly
                    />
                  </template>
                </div>
                <div class="info-item">
                  <label class="label-bold">주소
                    <span class="required-star">*</span> 
                  </label>
                  <input class="same-size-input" v-model="form.employeeAddress" :readonly="!isEditing"/>
                </div>
                <div class="info-item">
                  <label class="label-bold">경력 년수</label>
                  <input type="number" class="same-size-input" v-model="form.careerYearCount" :readonly="!isEditing"/>
                </div>
                <div class="info-item">
                  <label class="label-bold">결혼 일자</label>
                  <input type="date" class="same-size-input" v-model="form.marriageDate" :readonly="!isEditing" />
                </div>
                <div class="info-item">
                  <label class="label-bold">최종 학력
                    <span class="required-star">*</span> 
                  </label>
                  <input class="same-size-input" v-model="form.finalAcademic" :readonly="!isEditing" />
                </div>
                <div class="info-item">
                  <label class="label-bold">이전 근무 회사</label>
                  <input class="same-size-input" v-model="form.previousCompany" :readonly="!isEditing" />
                </div>
                <div class="info-item">
                  <label class="label-bold">부양 가족 수
                    <span class="required-star">*</span> 
                  </label>
                  <input type="number" class="same-size-input" v-model="form.familyCount" :readonly="!isEditing" />
                </div>
                <div class="info-item">
                  <label class="label-bold">출신학교
                    <span class="required-star">*</span> 
                  </label>
                  <input class="same-size-input" v-model="form.employeeSchool" :readonly="!isEditing" />
                </div>
                <div class="info-item">
                  <label class="label-bold">
                    장애 여부
                    <span class="required-star">*</span>
                  </label>
                  <template v-if="isEditing">
                    <select v-model="form.isDisorder" class="same-size-input">
                      <option value="">선택</option>
                      <option
                        v-for="opt in disorderOptions"
                        :key="opt"
                        :value="opt"
                      >
                        {{ opt }}
                      </option>
                    </select>
                  </template>
                  <template v-else>
                    <input
                      class="same-size-input"
                      :value="form.isDisorder || '-'"
                      readonly
                    />
                  </template>
                </div>
                <div class="info-item"></div>
                <div class="info-item">
                  <label class="label-bold">전공</label>
                  <input class="same-size-input" v-model="form.employeeDept" :readonly="!isEditing" />
                </div>
                <div class="info-item">
                  <label class="label-bold">
                    병역 여부
                    <span class="required-star">*</span>
                  </label>
                  <template v-if="isEditing">
                    <select v-model="form.militaryType" class="same-size-input">
                      <option value="">선택</option>
                      <option
                        v-for="m in militaryOptions"
                        :key="m"
                        :value="m"
                      >
                        {{ m }}
                      </option>
                    </select>
                  </template>
                  <!-- 보기 모드일 때 읽기 전용 텍스트 -->
                  <template v-else>
                    <input
                      class="same-size-input"
                      :value="form.militaryType || '-'"
                      readonly
                    />
                  </template>
                </div>
              </div>
            </div>
          </div>
          <!-- 인사발령 탭: AG Grid -->
          <div v-else-if="currentTab === '인사발령'">
            <div class="ag-theme-alpine ag-grid-box custom-theme">
              <BaseGrid
                :columnDefs="appointmentColumnDefs"
                :gridOptions="{ theme: 'legacy' }"
                :rowData="appointmentData"
                :defaultColDef="defaultColDef"
                :pagination="true"
                :paginationPageSize="pageSize"
                rowSelection="multiple"
                @grid-ready="onGridReady"
                @cell-click="onCellClick"
                style="width:100%; height:100%"
              />
            </div>
          </div>
          <!-- 징계 탭: AG Grid -->
          <div v-else-if="currentTab === '징계'">
            <div class="ag-theme-alpine ag-grid-box custom-theme">
              <BaseGrid
                :columnDefs="disciplineColumnDefs"
                :gridOptions="{ theme: 'legacy' }"
                :rowData="disciplineData"
                :defaultColDef="defaultColDef"
                :pagination="true"
                :paginationPageSize="pageSize"
                rowSelection="multiple"
                @grid-ready="onGridReady"
                @cell-click="onCellClick"
                style="width:100%; height:100%"
              />
            </div>
          </div>
          <!-- 계약 탭: AG Grid -->
          <div v-else-if="currentTab === '계약'">
            <div class="ag-theme-alpine ag-grid-box custom-theme">
              <BaseGrid
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
        </div>
        
        <!-- ───────── 하단 고정 버튼 ───────── -->
        <div class="action-buttons-bottom">
          <!-- 보기 모드 → 수정 버튼 -->
          <button
            v-if="isHR && !isEditing"
            class="btn-save"
            @click="enterEditMode"
          >
            수정
          </button>
          <!-- 편집 모드 → 취소 / 저장 버튼 -->
          <template v-else-if="isHR && isEditing">
            <button class="btn-delete" @click="cancelEdit">
              취소
            </button>
            <button class="btn-save" @click="saveChanges">
              저장
            </button>
          </template>
        </div>
      </div>
    </template>
  </div>
  <BaseToast ref="toastRef" />
</template>

<script setup>
import { ref, reactive, onMounted, computed, readonly, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
// import { AgGridVue } from 'ag-grid-vue3'
import BaseGrid from '@/components/grid/BaseGrid.vue'
import detailIconUrl from '@/assets/icons/detail_appointment.svg'
import BaseToast from '@/components/toast/BaseToast.vue'
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

// — Axios 기본 URL
axios.defaults.baseURL = 'http://localhost:5000'

// — AG Grid 모듈 등록
ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
])

// — 라우터, 스토어
const route     = useRoute()
const router    = useRouter()
const userStore = useUserStore()
const toastRef = ref(null)

// 유효성 검사 에러 상태
const errors = reactive({
  contact: '',
  email: '',
  resident: '',
  bankAccount: ''
})





// 정규식 패턴 정의
const patterns = {
  contact: /^\d{3}-\d{3,4}-\d{4}$/,
  email:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  resident:/^[0-9]{6}-[1-4][0-9]{6}$/,  // ex. 900101-1234567
  bankAccount: /^[0-9]{6,20}$/          // 6~20자리 숫자
}

// 유효성 검사 함수
function validate(field, value) {
  if (!value) {
    errors[field] = ''
    return
  }
  
  if (!patterns[field].test(value)) {
    switch (field) {
      case 'contact':
        errors.contact = '010-1234-5678 형식으로 입력하세요.'
        break
      case 'email':
        errors.email = '유효한 이메일을 입력하세요.'
        break
      case 'resident':
        errors.resident = '예: 900101-1234567 형식으로 입력하세요.'
        break
      case 'bankAccount':
        errors.bankAccount = '숫자만, 6~20자리로 입력하세요.'
        break
    }
  } else {
    errors[field] = ''
  }
}

function showToast(msg) {
  toastRef.value?.show(msg)
}

// JWT 토큰 디코딩 유틸
function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return {}
  }
}

// HR 권한 여부 계산 (role 클레임명은 실제 JWT 에 맞춰 조정)
const isHR = computed(() => {
  const raw = userStore.accessToken?.startsWith('Bearer ')
    ? userStore.accessToken.slice(7)
    : userStore.accessToken
  if (!raw) return false

  const { auth } = parseJwtPayload(raw)
  if (Array.isArray(auth))    return auth.includes('ROLE_HR')
  if (typeof auth === 'string') return auth.includes('ROLE_HR')
  return false
})

// — 탭 정의
const tabs       = ['인사정보','개인정보','인사발령','징계','계약']
const currentTab = ref(tabs[0])

// — AG Grid 공통 설정
const defaultColDef = { sortable: true, filter: true, resizable: true }
const pageSize      = ref(10)
let gridApi         = null
function onGridReady(params) { gridApi = params.api }

// 드롭다운 옵션 리스트
const currentYear = new Date().getFullYear()

const yearOptions = Array.from(
  { length: currentYear - 1950 + 1 },
  (_, i) => currentYear - i
)

const workTypeOptions = ['정규직', '계약직']
const militaryOptions = ['군필', '미필', '보충역', '면제', '해당 없음']
const genderOptions = ['남', '여']
const insuranceOptions   = ['가입','미가입']
const disorderOptions    = ['장애','비장애']
const marriageOptions    = ['미혼','기혼']



// — 인사발령 컬럼 정의
const appointmentColumnDefs = ref([
  // 순번
  {
    headerName: '번호',
    width: 90,
    valueGetter: params => params.api.getDisplayedRowCount() - params.node.rowIndex, sortable: false, flex: 0.3, cellClass:'center-align',
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

// — 징계 컬럼 정의
const disciplineColumnDefs = ref([
  {
    headerName: '',
    field: 'checkbox',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 50,
    pinned: 'left'
  },
  { headerName: '번호',            valueGetter: params => params.api.getDisplayedRowCount() - params.node.rowIndex, sortable: false, flex: 0.3, cellClass:'center-align' },
  { headerName: '사원명',          field: 'employeeName',            flex: 1.2 },
  {
    headerName: '징계 서류',
    field: 'fileList',
    flex: 2,
    cellRenderer: params => {
      const files = Array.isArray(params.value) ? params.value : []
      if (!files.length) return '-'
      const container = document.createElement('div')
      container.className = 'file-list-cell'
      files.forEach((f, i) => {
        const a = document.createElement('a')
        a.href = '#'
        a.textContent = f.fileName
        a.dataset.idx = i
        a.addEventListener('click', async evt => {
          evt.preventDefault()
          // 바로 다운로드 호출
          await downloadFile(f.fileUrl, f.fileName)
        })
        container.appendChild(a)
      })
      return container
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

// — 계약 컬럼 정의
const contractColumnDefs = ref([
  {
    headerName: '',
    field: 'checkbox',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 50,
    pinned: 'left'
  },
  { headerName: '번호',               valueGetter: params => params.api.getDisplayedRowCount() - params.node.rowIndex, sortable: false, flex: 0.3, cellClass:'center-align' },
  { headerName: '사원명',           field: 'employeeName',        flex: 1.2 },
  { headerName: '계약 설명',        field: 'contractDescription', flex: 2 },
  {
    headerName: '파일',
    field: 'fileList',
    flex: 2,
    cellRenderer: params => {
      const files = Array.isArray(params.value) ? params.value : []
      if (!files.length) return '-'

      // 컨테이너 엘리먼트 생성
      const container = document.createElement('div')
      container.className = 'file-list-cell'

      files.forEach((f, i) => {
        const a = document.createElement('a')
        a.href = '#'
        a.textContent = f.fileName
        a.dataset.idx = i

        // 클릭 시 presigned URL 받아서 다운로드
        a.addEventListener('click', async evt => {
          evt.preventDefault()
          try {
            await downloadFile(f.fileUrl, f.fileName)
          } catch (err) {
            console.error('다운로드 실패:', err)
          }
        })

        container.appendChild(a)
      })

      return container
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

// — 인증 헤더 유틸
function authHeaders() {
  return { Authorization: `Bearer ${userStore.accessToken}` }
}

// ───────── 편집 모드 상태 ─────────
const isEditing = ref(false)
// 변경 전 원본 보관용
let original = {}

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
  const requiredChecks = [
    { key: 'employeePhotoUrl',   msg: '사진을 업로드해주세요.' },
    { key: 'employeeName',       msg: '사원명을 입력해주세요.' },
    { key: 'employmentDate',     msg: '입사일을 선택해주세요.' },
    { key: 'employeeNation',     msg: '국적을 입력해주세요.' },
    { key: 'employeeGender',     msg: '성별을 선택해주세요.' },
    { key: 'employeeBirth',      msg: '생년월일을 입력해주세요.' },
    { key: 'employeeResident',   msg: '주민등록번호를 입력해주세요.' },
    { key: 'employeeContact',    msg: '연락처를 입력해주세요.' },
    { key: 'employeeEmail',      msg: '이메일을 입력해주세요.' },
    { key: 'employeeAddress',    msg: '주소를 입력해주세요.' },
    { key: 'workType',           msg: '근무형태를 선택해주세요.' },
    { key: 'bankName',           msg: '은행명을 입력해주세요.' },
    { key: 'bankDepositor',      msg: '예금주를 입력해주세요.' },
    { key: 'bankAccount',        msg: '계좌번호를 입력해주세요.' },
    { key: 'isDisorder',         msg: '장애여부를 선택해주세요.' },
    { key: 'militaryType',       msg: '병역여부를 선택해주세요.' },
    { key: 'isMarriage',         msg: '결혼여부를 선택해주세요.' },
    { key: 'familyCount',        msg: '가족 수를 입력해주세요.' },
    { key: 'finalAcademic',      msg: '최종 학력을 입력해주세요.' },
    { key: 'employeeSchool',     msg: '최종 학교를 입력해주세요.' },
    { key: 'isFourInsurances',   msg: '4대 보험 여부를 선택해주세요.' },
  ];

  for (const { key, msg } of requiredChecks) {
    const val = form[key];
    if (val === '' || val === null || val === undefined) {
      return showToast(msg);
    }
  }

  // 유효성 검사 에러 확인
  const hasValidationErrors = Object.values(errors).some(error => error !== '')
  if (hasValidationErrors) {
    return showToast('입력 형식을 확인해주세요.')
  }

  // HR 전용 DTO
  const hrDto = {
    employeeName:      form.employeeName,
    employeePhotoName: form.employeePhotoName,
    employeePhotoUrl:  form.employeePhotoUrl,
    employeeNation:    form.employeeNation,
    employeeGender:    form.employeeGender,
    employeeBirth:     form.employeeBirth,
    employeeResident:  form.employeeResident,
    employeeContact:   form.employeeContact,
    employeeEmail:     form.employeeEmail,
    employeeAddress:   form.employeeAddress,
    employmentDate:    form.employmentDate,
    retirementDate:    form.retirementDate,
    workType:          form.workType,
    bankName:          form.bankName,
    bankDepositor:     form.bankDepositor,
    bankAccount:       form.bankAccount,
    isDisorder:        form.isDisorder,
    militaryType:      form.militaryType,
    isMarriage:        form.isMarriage,
    marriageDate:      form.marriageDate,
    familyCount:       form.familyCount,
    careerYearCount:   form.careerYearCount,
    previousCompany:   form.previousCompany,
    finalAcademic:     form.finalAcademic,
    employeeSchool:    form.employeeSchool,
    employeeDept:      form.employeeDept,
    graduationYear:    form.graduationYear,
    isFourInsurances:  form.isFourInsurances,
    positionId:        form.positionId,
    rankId:            form.rankId,
    jobId:             form.jobId,
    headId:            form.headId,
    departmentId:      form.departmentId,
    teamId:            form.teamId,
  };

  try {
    // 무조건 HR 전용 PUT 호출
    await axios.put(
      `/employees/${form.employeeId}`,
      hrDto,
      { headers: authHeaders() }
    );
    showToast('수정이 완료되었습니다.');
    isEditing.value = false;
  } catch (err) {
    console.error(err);
    showToast('저장에 실패했습니다.');
  }
}

async function downloadFile(fileUrl, fileName) {
  try {
    const { data: presignedUrl } = await axios.get(
      '/s3/download-url',
      {
        params: { filename: fileUrl, contentType: '' },
        headers: authHeaders()
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
    showToast('파일 다운로드에 실패했습니다.')
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

// — 사원 기본 정보 폼
const form = reactive({
  employeeId:        '',
  employeeName:      '',
  employeePhotoName: '',
  employeePhotoUrl:  '',
  jobName:           '',
  workType:          '',
  headName:          '',
  positionName:      '',
  employmentDate:    '',
  departmentName:    '',
  rankName:          '',
  retirementDate:    '',
  teamName:          '',
  employeeContact:   '',
  employeeEmail:     '',
  employeeNation:    '',
  employeeGender:    '',
  employeeBirth:     '',
  employeeResident:  '',
  employeeAddress:   '',
  isFourInsurances:  '',
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
  positionId:       '',
  rankId:           '',
  jobId:            '',
  headId:           '',
  departmentId:     '',
  teamId:           ''
})

// watch로 실시간 검사
watch(() => form.employeeContact, v => validate('contact', v))
watch(() => form.employeeEmail,   v => validate('email',   v))
watch(() => form.employeeResident, v => validate('resident', v))
watch(() => form.bankAccount,     v => validate('bankAccount', v))

// — 뒤로가기
function goBack() {
  router.back()
}

// 프로필 이미지 미리보기 URL
const previewSrc = ref('')      
// 숨겨진 file input 레퍼런스
const fileInput  = ref(null)

// 파일 선택창 열기
function triggerFileSelect() {
  fileInput.value.click()
}

// 파일이 선택됐을 때 실행
async function onPhotoSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // presigned 업로드 URL + key 얻기
  const { data: { url, key } } = await axios.get('/s3/upload-url', {
    params: { filename: file.name, contentType: file.type },
    headers: authHeaders()
  })
  // 파일 PUT
  await axios.put(url, file, { headers: { 'Content-Type': file.type } })

  // form 에는 key만
  form.employeePhotoUrl  = key
  form.employeePhotoName = file.name

  // 미리보기 URL은 별도 변수에
  const { data: previewUrl } = await axios.get('/s3/download-url', {
    params: { filename: key, contentType: file.type },
    headers: authHeaders()
  })
  previewSrc.value = previewUrl
}

onMounted(async () => {
  const { id } = route.params;

  // 1) 사원 기본 정보 조회
  try {
    const { data: emp } = await axios.get(
      `/employees/${id}`,
      { headers: authHeaders() }
    );

    // ▼ emp의 모든 필드를 form에 직접 할당
    Object.assign(form, {
      employeeId:        emp.employeeId,
      employeeName:      emp.employeeName,
      employeePhotoName: emp.employeePhotoName,
      employeePhotoUrl:  emp.employeePhotoUrl,
      jobName:           emp.jobName,
      workType:          emp.workType,
      headName:          emp.headName,
      positionName:      emp.positionName,
      employmentDate:    emp.employmentDate,
      departmentName:    emp.departmentName,
      rankName:          emp.rankName,
      retirementDate:    emp.retirementDate,
      teamName:          emp.teamName,
      employeeContact:   emp.employeeContact,
      employeeEmail:     emp.employeeEmail,
      employeeNation:    emp.employeeNation,
      employeeGender:    emp.employeeGender,
      employeeBirth:     emp.employeeBirth,
      employeeResident:  emp.employeeResident,
      employeeAddress:   emp.employeeAddress,
      isFourInsurances:  emp.isFourInsurances,
      bankName:          emp.bankName,
      bankDepositor:     emp.bankDepositor,
      bankAccount:       emp.bankAccount,
      isDisorder:        emp.isDisorder,
      militaryType:      emp.militaryType,
      isMarriage:        emp.isMarriage,
      marriageDate:      emp.marriageDate,
      familyCount:       emp.familyCount,
      careerYearCount:   emp.careerYearCount,
      previousCompany:   emp.previousCompany,
      finalAcademic:     emp.finalAcademic,
      employeeSchool:    emp.employeeSchool,
      employeeDept:      emp.employeeDept,
      graduationYear:    emp.graduationYear,

      // — DB에서 내려주는 ID를 그대로 할당
      positionId:       emp.positionId,
      rankId:           emp.rankId,
      jobId:            emp.jobId,
      headId:           emp.headId,
      departmentId:     emp.departmentId,
      teamId:           emp.teamId
    });

    // ▼ 프로필 이미지 preview 세팅
    if (emp.employeePhotoUrl) {
      try {
        const { data: url } = await axios.get(
          '/s3/download-url',
          {
            params: {
              filename:    emp.employeePhotoUrl,
              contentType: 'image/png'
            },
            headers: authHeaders()
          }
        );
        previewSrc.value = url;
      } catch {
        previewSrc.value = '';
      }
    } else {
      previewSrc.value = '';
    }

  } catch (err) {
    console.error(err);
    showToast('사원 정보를 불러오는 데 실패했습니다.');
    router.back();
    return;
  }

  // 2) 인사발령 목록 조회
  try {
    const { data: appts } = await axios.get(
      `/appointment-history/employee/${id}`,
      { headers: authHeaders() }
    );
    appointmentData.value = appts;
  } catch (err) {
    console.error('인사발령 조회 실패:', err);
  }

  // 3) 징계 목록 조회
  try {
    const { data: discs } = await axios.get(
      `/disciplinary/employee/${id}`,
      { headers: authHeaders() }
    );
    disciplineData.value = discs;
  } catch (err) {
    console.error('징계 조회 실패:', err);
  }

  // 4) 계약 목록 조회
  try {
    const { data: contracts } = await axios.get(
      `/contract/employee/${id}`,
      { headers: authHeaders() }
    );
    contractData.value = contracts;
  } catch (err) {
    console.error('계약 조회 실패:', err);
  }
});

</script>

<style scoped>
/* 페이지 타이틀과 설명 */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: var(--primary);
}

/* "사원 상세 조회" 텍스트와 버튼을 같은 행에 배치 */
.desc-row {
  display: flex;
  align-items: center;   /* 텍스트와 버튼을 수직 가운데 정렬 */
  margin-left: 20px;     /* 기존 .desc 의 margin-left */
}
.desc {
  margin: 0;
  font-size: 18px;
}

/* 기본엔 숨김 */
.required-star {
  display: none;
  color: red;
}
/* 수정 모드일 때만 표시 */
.editing-mode .required-star {
  display: inline;
}

.back-btn {
  color: var(--primary);
  width: 24px;
  height: 24px;
  margin-right: -10px;
  cursor: pointer;
}

.btn-save {
  background-color: var(--primary);
  color: var(--text-on-primary);
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
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
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
  margin: 10px 20px 0;
  font-size: 14px;
  max-width: 100%;
  overflow-x: hidden; 
}

/* 공통 Card 스타일 (상단/하단 모두 동일) */
.card {
  background: var(--bg-box);
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  width: 100%;
  min-width: 0;
  max-width: 100%;
  margin-bottom: 30px;
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
}

/* 하단 카드에 상대 위치 설정 */
.bottom-card {
  position: relative;
  min-height: 200px; /* 최소 높이 설정으로 버튼이 항상 보이도록 */
  padding-bottom: 80px; /* 버튼 공간 확보 */
  border-radius: 0px 12px 12px 12px; /* 새로운 탭 디자인에 맞춰 조정 */
}

/* 탭 콘텐츠 래퍼 */
.tab-content-wrapper {
  width: 100%;
  height: 100%;
}

/* 상단 카드 내부 레이아웃 */
.top-card-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  min-width: 1024px;
  padding: 16px 6px;
}

/* 프로필 */
.profile-area {
  flex-shrink: 0;
}
.profile-wrapper {
  position: relative;
  display: inline-block;
  margin-top: 6px;
}
.profile-img {
  width: 200px;
  height: 260px;
  object-fit: cover;
  border-radius: 12px;
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
.upload-btn-icon:hover .upload-icon {
  filter: invert(41%) sepia(50%) saturate(6012%) hue-rotate(173deg) brightness(90%) contrast(98%);
}

/* 액션 버튼을 하단 카드의 오른쪽 하단에 고정 */
.action-buttons-bottom {
  position: absolute;
  bottom: 20px;
  right: 40px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

/* 🔷 새로운 겹쳐지는 탭 스타일 */
.tab-wrapper {
  position: relative;
  z-index: 2;
  margin-top: 15px;
}

.tab-menu {
  display: flex;
  align-items: flex-end;
  gap: 0;
  position: relative;
}

/* 기본 탭 버튼 */
.tab-menu button {
  font-size: 16px;
  padding: 10px 30px;
  border: none;
  border-bottom: none;
  background-color: #C8C8C8;
  color: white;
  cursor: pointer;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  position: relative;
  z-index: 1;
  margin-right: -20px; /* ✅ 가로 겹치기 */
  transition: all 0.2s ease;
}

/* 선택된 탭 위로 */
.tab-menu button.active {
  background: var(--bg-box);
  color: var(--modal-text);
  z-index: 3;
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
  /* border: 1px solid #d9d9d9; */
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
  position: relative;
  margin-bottom: 8px;
}
.label-bold {
  font-weight: 600;
  width: 100px;
  text-align: right;
}
.same-size-input {
  width: 180px;
  height: 36px;
  padding: 0 0.6rem;
  font-size: 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  background-color: var(--modal-box-bg) !important;
  color: var(--text-main);
  font-family: 'inherit';
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
  background-color: var(--primary);
  color: white;
  flex: 1;
}
.btn-confirm:hover {
  background-color: white;
  color: var(--primary);
  border: 1px solid var(--primary);
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

.error-text {
  position: absolute;
  top: 0;
  left: 300px;
  color: #e74c3c;
  font-size: 0.8rem;
  z-index: 10;
  white-space: nowrap;  /* 텍스트 줄바꿈 방지 */
  min-width: max-content;  /* 내용에 맞는 최소 너비 */
  overflow: visible;  /* 넘치는 텍스트 표시 */
}

/* 반응형 대응 */
@media (max-width: 768px) {
  .action-buttons-bottom {
    bottom: 15px;
    right: 20px;
  }

  .bottom-card {
    padding-bottom: 70px;
  }
}
</style>