<template>
  <!-- 페이지 제목 + 버튼을 같은 줄에 배치 -->
  <h1 class="page-title">사원 목록 조회</h1>
  <div class="desc-row">
    <p class="desc">사원 등록 </p>
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
              alt="Profile"/>
            <div v-else class="profile-placeholder-box">
              <span class="no-photo-text">사진을 추가해주세요</span>
            </div>

            <!-- 업로드 아이콘 -->
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
              @change="onFileChange" />
            </div>
        </div>

        <!-- 위쪽 카드 전용 그리드 (3열 × 5행) -->
        <div class="top-grid-info">
          <!-- 1행 -->
          <div class="info-item">
            <label class="label-bold">사원명 
              <span class="required-star">*</span> 
            </label>
            <input class="same-size-input" 
            v-model="form.employeeName" />
          </div>
                  <!-- 직무 선택 -->
          <div class="info-item">
            <label class="label-bold">직무
              <span class="required-star">*</span> 
            </label>
            <select v-model="form.jobId" class="same-size-input">
              <option value="">선택</option>
              <option 
                v-for="opt in jobOptions" 
                :key="opt.id" 
                :value="opt.id"
              >
                {{ opt.name }}
              </option>
            </select>
          </div>

          <div class="info-item">
            <label class="label-bold">근무형태
              <span class="required-star">*</span> 
            </label>
              <select class="same-size-input" v-model="form.workType">
                <option value="">선택</option>
                <option 
                  v-for="opt in workTypeOptions" 
                  :key="opt" 
                  :value="opt">
                  {{ opt }}
                </option>
              </select>
          </div>

          <!-- 2행 -->
          <!-- 본부 선택 -->
          <div class="info-item">
            <label class="label-bold">본부
              <span class="required-star">*</span> 
            </label>
            <select v-model="form.headId" class="same-size-input">
              <option value="">선택</option>
              <option 
                v-for="opt in headOptions" 
                :key="opt.id" 
                :value="opt.id"
              >
                {{ opt.name }}
              </option>
            </select>
          </div>
                  <!-- 직책 선택 -->
          <div class="info-item">
            <label class="label-bold">직책
              <span class="required-star">*</span> 
            </label>
            <select v-model="form.positionId" class="same-size-input">
              <option value="">선택</option>
              <option 
                v-for="opt in positionOptions" 
                :key="opt.id" 
                :value="opt.id"
              >
                {{ opt.name }}
              </option>
            </select>
          </div>
          <div class="info-item">
            <label class="label-bold">입사일
              <span class="required-star">*</span> 
            </label>
            <input type="date" class="same-size-input" v-model="form.employmentDate" />
          </div>

                  <!-- 부서 선택 -->
          <div class="info-item">
            <label class="label-bold">부서
              <span class="required-star">*</span> 
            </label>
            <select v-model="form.departmentId" class="same-size-input">
              <option value="">선택</option>
              <option 
                v-for="opt in departmentOptions" 
                :key="opt.id" 
                :value="opt.id"
              >
                {{ opt.name }}
              </option>
            </select>
          </div>
                  <!-- 직급 선택 -->
          <div class="info-item">
            <label class="label-bold">직급
              <span class="required-star">*</span> 
            </label>
            <select v-model="form.rankId" class="same-size-input">
              <option value="">선택</option>
              <option 
                v-for="opt in rankOptions" 
                :key="opt.id" 
                :value="opt.id"
              >
                {{ opt.name }}
              </option>
            </select>
          </div>
          <div class="info-item">
            <label class="label-bold">퇴사일</label>
            <input type="date" class="same-size-input" v-model="form.retirementDate" />
          </div>

                    <!-- 팀 선택 -->
          <div class="info-item">
            <label class="label-bold">팀
              <span class="required-star">*</span> 
            </label>
            <select v-model="form.teamId" class="same-size-input">
              <option value="">선택</option>
              <option 
                v-for="opt in teamOptions" 
                :key="opt.id" 
                :value="opt.id"
              >
                {{ opt.name }}
              </option>
            </select>
          </div>
          <div class="info-item">
            <label class="label-bold">연락처
              <span class="required-star">*</span> 
            </label>
            <input class="same-size-input" v-model="form.employeeContact" />
          </div>
          <div class="info-item"></div>

          <!-- 5행 -->
          <div class="info-item">
            <label class="label-bold">사번</label>
                <input
                      class="same-size-input"
                      v-model="form.employeeId"
                      disabled
                      placeholder="등록 시 자동 생성됩니다"
                />
          </div>
          <div class="info-item">
            <label class="label-bold">이메일
              <span class="required-star">*</span> 
            </label>
            <input class="same-size-input" v-model="form.employeeEmail" />
          </div>
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
         ③ 하단 카드: 탭별 상세 정보
    ────────────────────────────────────────────────────────────────────────── -->
    <div class="card tab-content overflow-scroll-wrapper bottom-card">
      <!-- 인사정보 탭 -->
      <div v-if="currentTab === '인사정보'">
        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item">
              <label class="label-bold">성별
                <span class="required-star">*</span> 
              </label>
              <select class="same-size-input" v-model="form.employeeGender">
                <option value="">선택</option>
                <option 
                  v-for="g in genderOptions" 
                  :key="g" 
                  :value="g">
                  {{ g }}
                </option>
              </select>
            </div>
            <div class="info-item">
              <label class="label-bold">국적
                <span class="required-star">*</span> 
              </label>
              <input class="same-size-input" v-model="form.employeeNation" />
            </div>
            <div class="info-item">
              <label class="label-bold">생년월일
                <span class="required-star">*</span> 
              </label>
              <input type="date" class="same-size-input" v-model="form.employeeBirth" />
            </div>
            <div class="info-item">
              <label class="label-bold">4대 보험
                <span class="required-star">*</span> 
              </label>
              <select class="same-size-input" v-model="form.isFourInsurances">
                    <option value="">선택</option>
                    <option 
                      v-for="opt in insuranceOptions" 
                      :key="opt" 
                      :value="opt">
                      {{ opt }}
                    </option>
              </select>
            </div>
            <div class="info-item">
              <label class="label-bold">거래 은행
                <span class="required-star">*</span> 
              </label>
              <input class="same-size-input" v-model="form.bankName" />
            </div>
            <div class="info-item">
              <label class="label-bold">예금주
                <span class="required-star">*</span> 
              </label>
              <input class="same-size-input" v-model="form.bankDepositor" />
            </div>
            <div class="info-item">
              <label class="label-bold">계좌
                <span class="required-star">*</span> 
              </label>
              <input class="same-size-input" v-model="form.bankAccount" />
            </div>
          </div>
        </div>
      </div>

      <!-- 개인정보 탭 -->
      <div v-else-if="currentTab === '개인정보'">
        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item">
              <label class="label-bold">주민등록번호
                <span class="required-star">*</span> 
              </label>
              <input class="same-size-input" v-model="form.employeeResident" />
            </div>
            <div class="info-item">
              <label class="label-bold">주소
                <span class="required-star">*</span> 
              </label>
              <input class="same-size-input" v-model="form.employeeAddress" />
            </div>
            <div class="info-item">
              <label class="label-bold">출신학교
                <span class="required-star">*</span> 
              </label>
              <input class="same-size-input" v-model="form.employeeSchool" />
            </div>
            <div class="info-item">
              <label class="label-bold">장애 여부
                <span class="required-star">*</span> 
              </label>
              <select class="same-size-input" v-model="form.isDisorder">
                <option value="">선택</option>
                <option 
                  v-for="opt in disorderOptions" 
                  :key="opt" 
                  :value="opt">
                  {{ opt }}
                </option>
              </select>
            </div>
            <div class="info-item">
              <label class="label-bold">병역 여부
                <span class="required-star">*</span> 
              </label>
                <select class="same-size-input" v-model="form.militaryType">
                  <option value="">선택</option>
                  <option 
                    v-for="m in militaryOptions" 
                    :key="m" 
                    :value="m">
                    {{ m }}
                  </option>
                </select>
            </div>
            <div class="info-item">
              <label class="label-bold">부양 가족 수
                <span class="required-star">*</span> 
              </label>
              <input type="number" class="same-size-input" v-model="form.familyCount" />
            </div>
            <div class="info-item">
              <label class="label-bold">결혼 여부
                <span class="required-star">*</span> 
              </label>
              <select class="same-size-input" v-model="form.isMarriage">
                <option value="">선택</option>
                <option 
                  v-for="opt in marriageOptions" 
                  :key="opt" 
                  :value="opt">
                  {{ opt }}
                </option>
              </select>
            </div>
            <div class="info-item">
              <label class="label-bold">결혼 일자</label>
              <input type="date" class="same-size-input" v-model="form.marriageDate" />
            </div>
            <div class="info-item">
              <label class="label-bold">경력 년수</label>
              <input type="number" class="same-size-input" v-model="form.careerYearCount" />
            </div>
            <div class="info-item">
              <label class="label-bold">이전 근무 회사</label>
              <input class="same-size-input" v-model="form.previousCompany" />
            </div>
            <div class="info-item">
              <label class="label-bold">최종 학력
                <span class="required-star">*</span> 
              </label>
              <input class="same-size-input" v-model="form.finalAcademic" />
            </div>
            <div class="info-item">
              <label class="label-bold">전공</label>
              <input class="same-size-input" v-model="form.employeeDept" />
            </div>
            <div class="info-item">
              <label class="label-bold">졸업년도</label>
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
            </div>
          </div>
        </div>
      </div>
    <div class="button-group-inline top-buttons">
      <button type="button" class="btn-back" @click="onBackClick">취소</button>
      <button class="btn-save" @click="onSave">저장</button>
    </div>
    </div>
  </div>

</template>




<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

import axios from 'axios' 

// Axios 기본 URL 설정
axios.defaults.baseURL = 'http://localhost:8000'


const userStore = useUserStore()

const tabs = ['인사정보','개인정보']
const currentTab = ref('인사정보')

const router = useRouter()

const currentYear = new Date().getFullYear()
const yearOptions = Array.from(
  { length: currentYear - 1950 + 1 },
  (_, i) => currentYear - i
)

// 프로필 미리보기 URL
const profileSrc = ref('/images/profile-placeholder.png')
// 숨겨진 file input 레퍼런스
const fileInput  = ref(null)


// 드롭다운 옵션 리스트

const workTypeOptions = ['정규직', '계약직']

const militaryOptions = ['군필', '미필', '보충역', '면제']

const genderOptions = ['남', '여']

const insuranceOptions   = ['가입','미가입']

const disorderOptions    = ['장애','비장애']

const marriageOptions    = ['미혼','기혼']

const headOptions = [
  { id: 1, name: '개발본부' },
  { id: 2, name: '경영지원본부' },
  { id: 3, name: '사업본부' },
  { id: 4, name: '소속없음' },
]

const departmentOptions = [
  { id: 1, name: 'PC게임개발부서' },
  { id: 2, name: '아트개발부서' },
  { id: 3, name: '인사부서' },
  { id: 4, name: '재무회계부서' },
  { id: 5, name: '마케팅부서' },
  { id: 6, name: '영업부서' },
  { id: 7, name: '소속없음' },
]

const teamOptions = [
  { id: 1, name: 'PC개발팀' },
  { id: 2, name: 'PC게임기획팀' },
  { id: 3, name: '아트기획팀' },
  { id: 4, name: '아트팀' },
  { id: 5, name: '채용팀' },
  { id: 6, name: '인사평가팀' },
  { id: 7, name: '급여정산팀' },
  { id: 8, name: '세무관리팀' },
  { id: 9, name: '콘텐츠마케팅팀' },
  { id: 10, name: '퍼포먼스팀' },
  { id: 11, name: 'B2B영업팀' },
  { id: 12, name: 'B2C영업팀' },
  { id: 13, name: '소속없음' },
]

const jobOptions = [
  { id: 1, name: 'PC게임개발' },
  { id: 2, name: 'PC 플랫폼 기반 개발' },
  { id: 3, name: '게임 기능 구현 및 테스트' },
  { id: 4, name: 'PC 게임 기획' },
  { id: 5, name: 'PC 게임 컨셉 및 시나리오 설계' },
  { id: 6, name: '콘텐츠 기획 및 문서화' },
  { id: 7, name: '게임 아트 스타일 기획' },
  { id: 8, name: '비주얼 방향성 설계' },
  { id: 9, name: '아트 리소스 기획 및 관리' },
  { id: 10, name: '3D 캐릭터 디자인' },
  { id: 11, name: '배경, 이펙트 3D 제작' },
  { id: 12, name: 'UI/UX 디자인 (사용자 인터페이스)' },
  { id: 13, name: '채용 공고 작성 및 지원자 관리' },
  { id: 14, name: '면접 일정 조율 및 평가 진행' },
  { id: 15, name: '리크루팅 채널 관리 및 인재풀 운영' },
  { id: 16, name: '성과평가 지표 설계 및 운영' },
  { id: 17, name: '다면평가 및 피드백 관리' },
  { id: 18, name: '평가 결과 분석 및 보상 연계' },
  { id: 19, name: '급여 및 상여금 계산' },
  { id: 20, name: '4대보험 신고 및 정산' },
  { id: 21, name: '급여 관련 법적 이슈 대응' },
  { id: 22, name: '부가세, 법인세 신고' },
  { id: 23, name: '세무 감사 대응' },
  { id: 24, name: '비용 절감 세무 전략 수립' },
  { id: 25, name: '콘텐츠 기획 및 제작' },
  { id: 26, name: '브랜드 캠페인 운영' },
  { id: 27, name: '마케팅 전략 수립' },
  { id: 28, name: '퍼포먼스 광고 집행 및 최적화' },
  { id: 29, name: '매체 운영 및 효율 분석' },
  { id: 30, name: '기업 대상 서비스 제안 및 계약' },
  { id: 31, name: '파트너사 관리 및 협업 운영' },
  { id: 32, name: '맞춤형 솔루션 영업 전략 수립' },
  { id: 33, name: '개인 고객 대상 제품/서비스 영업' },
  { id: 34, name: 'CRM 기반 리텐션 전략 수립' },
  { id: 35, name: '온·오프라인 프로모션 운영' },
  { id: 36, name: '없음' },
]

const rankOptions = [
  { id: 1, name: '사원' },
  { id: 2, name: '대리' },
  { id: 3, name: '과장' },
  { id: 4, name: '부장' },
  { id: 5, name: '상무' },
  { id: 6, name: '사장' },
]

const positionOptions = [
  { id: 1, name: '팀원' },
  { id: 2, name: '팀장' },
  { id: 3, name: '부서장' },
  { id: 4, name: '본부장' },
  { id: 5, name: '대표이사' },
]




// ① 폼 데이터
const form = reactive({
  employeeId:        null,   // 보낼 필요는 없지만 DTO에 있으므로
  employeeName:      '',
  employeePwd:       '',
  employeePhotoName: null,
  employeePhotoUrl:  null,
  employeeNation:    '',
  employeeGender:    '',
  employeeBirth:     '',     // LocalDate → yyyy-MM-dd 형태의 문자열
  employeeResident:  '',
  employeeContact:   '',
  employeeEmail:     '',
  employeeAddress:   '',
  employmentDate:    '',     // LocalDate
  retirementDate:    '',     // LocalDate
  workType:          '',     // '정규직' / '계약직'
  bankName:          '',
  bankDepositor:     '',
  bankAccount:       '',
  isDisorder:        '',     // '장애' / '비장애'
  militaryType:      '',     // '군필' / '미필' 등
  isMarriage:        '',     // '미혼' / '기혼'
  marriageDate:      '',     // LocalDate
  familyCount:       null,
  careerYearCount:   null,
  previousCompany:   '',
  finalAcademic:     '',
  employeeSchool:    '',
  employeeDept:      '',
  graduationYear:    null,
  isFourInsurances:  '',     // '가입' / '미가입'
  positionId:        null,
  rankId:            null,
  jobId:             null,
  headId:            null,
  departmentId:      null,
  teamId:            null
})

// ② 본부/부서/팀 변경 시 초기화
watch(() => form.headId, () => {
  form.departmentId = null
  form.teamId       = null
})

watch(() => form.departmentId, () => {
  form.teamId = null
})

// ③ 본부/부서/팀 매핑
const departmentMap = {
  '개발본부': ['PC게임개발부서', '아트개발부서'],
  '경영지원본부': ['인사부서', '재무회계부서'],
  '사업본부': ['마케팅부서', '영업부서']
}
const teamMap = {
  'PC게임개발부서': ['PC개발팀', 'PC게임기획팀'],
  '아트개발부서': ['아트기획팀'],
  '인사부서': ['채용팀', '인사평가팀'],
  '재무회계부서': ['급여정산팀', '세무관리팀'],
  '마케팅부서': ['콘텐츠마케팅팀', '퍼포먼스팀'],
  '영업부서': ['B2B영업팀', 'B2C영업팀']
}

  function onUploadClick() {
    fileInput.value?.click()
  }


async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // 1) presigned PUT URL + key 받아오기
  const { data } = await axios.get('/s3/upload-url', {
    params: { filename: file.name, contentType: file.type }
  })

  // 2) S3에 업로드
  await axios.put(data.url, file, {
    headers: { 'Content-Type': file.type }
  })

  // 3) DTO에는 **key**만 저장
  form.employeePhotoUrl  = data.key
  form.employeePhotoName = file.name

  // 4) 미리보기는 **profileSrc** 에만 저장
  const { data: previewUrl } = await axios.get('/s3/download-url', {
    params: { filename: data.key, contentType: file.type }
  })
  profileSrc.value = previewUrl
}




function authHeaders() {
  return { 
    Authorization: `Bearer ${userStore.accessToken}`,
    'Content-Type': 'application/json'
  }
}

// ⑥ 저장 로직
async function onSave() {
    // 1) 필수 입력 항목과 누락 시 보여줄 메시지를 배열로 정의
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

    // 2) 하나라도 누락되었으면 해당 메시지 alert 후 리턴
    for (const { key, msg } of requiredChecks) {
      const val = form[key];
      if (val === '' || val === null || val === undefined) {
        return alert(msg);
      }
    }

    console.log('▶ 서버로 보내는 form.employeePhotoUrl:', form.employeePhotoUrl)
    console.log('▶ preview 용 profileSrc:', profileSrc.value)

    // 3) 모두 통과했으면 서버에 요청
    try {
      console.log('onSave 직전 form.employeePhotoUrl:', form.employeePhotoUrl)
      const res = await axios.post(
        '/employees/enroll',
        form,
        { headers: authHeaders() }
      );
      console.log('등록 응답:', res.data)
      alert(`등록되었습니다 (ID: ${res.data})`);
      router.push('/employeeInfo/employeeList');
    } catch (err) {
      if (err.response) {
        console.error('HTTP', err.response.status)
        console.error('Response data:', err.response.data)
        alert(err.response.data.message || JSON.stringify(err.response.data))
      } else {
        console.error(err)
        alert('알 수 없는 오류가 발생했습니다.')
    }
  }
}


function onBackClick() {
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

.required-star { color: red; }

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
  margin-right: 0px;  /* 전체 오른쪽 여백 맞추기 */
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

.btn-back {
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
.btn-back:hover {
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