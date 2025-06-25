<template>
  <!-- 상단 헤더 -->
  <h1 class="page-title">계약서/법정서류 관리</h1>
  <p class="desc">계약서/법정서류 등록</p>

  <div class="card">
    <div class="content">
      <!-- 왼쪽: 이미지 업로드 & 미리보기 -->
      <div class="upload-area" @click="triggerFileSelect">
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          multiple
          @change="onFileChange"
          style="display: none"
        />
        <template v-if="!previewUrls.length">
          <span class="placeholder-text">
            계약서/법정서류 이미지를 업로드 해주세요. (최대 5장)
          </span>
        </template>
        <template v-else>
          <!-- 첫 번째 이미지만 크게 미리보기 -->
          <img
            :src="previewUrls[0]"
            alt="계약서 미리보기"
            class="preview-img"
          />
        </template>
      </div>

      <!-- 오른쪽: 정보 입력 테이블 -->
      <div class="form-area">
        <table class="info-table">
          <colgroup>
            <col style="width: 120px" />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <th>사원명</th>
              <td>
                <input
                  type="text"
                  v-model="form.employeeName"
                  list="employee-list"
                  placeholder="사원명 입력"
                />
                <datalist id="employee-list">
                  <option
                    v-for="emp in employeeOptions"
                    :key="emp.employeeId"
                    :value="emp.employeeName"
                  />
                </datalist>
              </td>
            </tr>
            <tr>
              <th>사원번호</th>
              <td>
                <input
                  type="text"
                  v-model="form.employeeId"
                  placeholder="사원번호 자동 입력"
                  readonly
                />
              </td>
            </tr>
            <tr>
              <th>계약서/법정서류</th>
              <td>
                <input
                  type="text"
                  v-model="form.contractDescrip"
                  placeholder="계약서/법정서류명 입력"
                />
              </td>
            </tr>
            <tr>
              <th>요청일자</th>
              <td>
                <input type="date" v-model="form.requestDate" />
              </td>
            </tr>
            <tr>
              <th>계약일자</th>
              <td>
                <input type="date" v-model="form.contractDate" />
              </td>
            </tr>
            <tr>
              <th>만료일자</th>
              <td>
                <input type="date" v-model="form.endDate" />
              </td>
            </tr>
            <tr v-if="files.length">
              <th>첨부파일</th>
              <td>
                <ul class="attached-list-inline">
                  <li
                    v-for="(f, i) in files"
                    :key="i"
                    class="file-item-inline"
                  >
                    • {{ f.name }}
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>

        <p class="warning-text">
          계약서를 무단 복제하거나 유출 시 1년 이하의 징역 또는 10억 원의 벌금이
          부과됩니다.
        </p>
      </div>
    </div>
              <!-- 하단 버튼 -->
        <div class="button-row">
          <button class="btn btn-cancel" @click="onCancel">취소</button>
          <button class="btn btn-save" @click="onSave">저장</button>
        </div>
  </div>
  <BaseToast ref="toastRef" />
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import BaseToast from '@/components/toast/BaseToast.vue'
import { useUserStore } from '@/stores/user'

// Axios 기본 URL 설정
axios.defaults.baseURL = 'http://localhost:5000'

// 라우터 & 스토어
const router = useRouter()
const userStore = useUserStore()

// 파일 업로드 관련
const fileInput = ref(null)
const files = ref([])            // 업로드할 File 객체 목록
const previewUrls = ref([])      // 미리보기용 URL 목록
const toastRef = ref(null)

  function showToast(msg) {
    toastRef.value?.show(msg)
  }

function triggerFileSelect() {
  fileInput.value?.click()
}

function onFileChange(e) {
  const selected = Array.from(e.target.files || [])
  if (selected.length > 5) {
    showToast('최대 5장까지 업로드할 수 있습니다.')
  }
  const limited = selected.slice(0, 5)
  files.value = limited

  // 기존 URL 해제
  previewUrls.value.forEach(URL.revokeObjectURL)
  // 새로 생성
  previewUrls.value = limited.map(f => URL.createObjectURL(f))
}

// 사원 자동완성 & 번호 매핑
const employeeOptions = ref([])
const form = reactive({
  employeeName:   '',
  employeeId:     '',
  contractDescrip:'',
  requestDate:    '',
  contractDate:   '',
  endDate:        ''
})

watch(() => form.employeeName, async name => {
  if (!name.trim()) {
    employeeOptions.value = []
    form.employeeId = ''
    return
  }
  try {
    const { data } = await axios.get(
      '/employees/search',
      { params: { name }, headers: authHeaders() }
    )
    employeeOptions.value = data
    const match = data.find(e => e.employeeName === name)
    form.employeeId = match ? String(match.employeeId) : ''
  } catch (err) {
    console.error('사원 검색 오류:', err)
  }
})

// 인증 헤더 헬퍼
function authHeaders() {
  // userStore.accessToken에는 순수 JWT 문자열만 저장되어 있어야 합니다
  return { Authorization: `Bearer ${userStore.accessToken}` }
}

// 저장(계약 등록) 로직
async function onSave() {
  // 필수 입력 체크
  if (
    !form.employeeName.trim() ||
    !form.employeeId.trim()     ||
    !form.contractDescrip.trim()||
    !form.requestDate          ||
    !form.contractDate         ||
    !form.endDate              ||
    files.value.length === 0
  ) {
    showToast('모든 항목을 입력하고 파일을 업로드해야 저장할 수 있습니다.')
    return
  }

  try {
    // 1) S3 파일 업로드
    const uploaded = []
    for (const f of files.value) {
      const { data: up } = await axios.get(
        '/s3/upload-url',
        {
          params: { filename: f.name, contentType: f.type },
          headers: authHeaders()
        }
      )
      await fetch(up.url, {
        method: 'PUT',
        headers: { 'Content-Type': f.type },
        body: f
      })
      uploaded.push({ fileName: f.name, fileUrl: up.key, fileSize: f.size })
    }

    // 2) 계약 등록 API 호출
    await axios.post(
      '/contracts',
      {
        employeeId:      Number(form.employeeId),
        contractDescrip: form.contractDescrip,
        requestDate:     form.requestDate,
        contractDate:    form.contractDate,
        endDate:         form.endDate,
        files:           uploaded
      },
      { headers: authHeaders() }
    )

    showToast('계약서가 정상 등록되었습니다.')
    router.push('/employeeInfo/Contract')
  } catch (err) {
    console.error('등록 오류:', err.response?.status, err.response?.data)
    showToast(err.response?.data?.message || `등록에 실패했습니다 (HTTP ${err.response?.status}).`)
  }
}

// 취소
function onCancel() {
  router.back()
}
</script>

<style scoped>
/* 상단 헤더 */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: var(--primary);  
}
.desc {
  display: block;
  margin-left: 20px;
  margin-bottom: 10px;
  font-size: 18px;
}

/* 카드 영역: 높이를 늘려서 min-height 적용 */
.card {
  position: relative; 
  background: var(--bg-box);
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  width: 98%;
  margin: 0 0 30px 20px;
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
  /* 높이를 아래로 늘립니다 */
  min-height: 700px;
}

/* 본문 영역: 좌우 2단 레이아웃 */
.content {
  display: flex;
  gap: 20px;
  height: 100%;
  padding: 20px 12px;
}

/* 왼쪽 업로드 영역: flex 비율을 줄여 너비가 좁아지게 함 */
.upload-area {
  flex: 0.7;
  background-color: var(--modal-box-bg);
  border-radius: 12px;
  /* 카드가 min-height 700px이므로, 이보다 약간 작은 600px로 설정 */
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  margin-left: 20px;
}
.placeholder-text {
  color: var(--text-sub);
  font-size: 1rem;
}
.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 오른쪽 입력 폼 영역: flex 비율을 늘려 나머지를 차지하게 함 */
/* 그리고 세로 중앙 정렬을 위해 justify-content: center 추가 */
.form-area {
  flex: 1.3;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 세로 중앙 정렬 */
  align-items: flex-start; /* 왼쪽 정렬 유지 */
  margin-left: 50px;
}
.info-table {
  width: 100%;
  border-collapse: collapse;
}
.info-table th,
.info-table td {
  /* 세로 패딩을 넉넉히 둡니다 */
  border: 1px solid #ddd;
  padding: 20px 12px;
  font-size: 0.95rem;
}
.info-table th {
  background-color: var(--bg-label-cell);
  text-align: left;
  width: 120px;
  color: var(--text-main);
}
.info-table td input[type='text'],
.info-table td input[type='date'] {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 8px;
  font-size: 0.9rem;
  font-family: 'inherit';
  box-sizing: border-box;
  background-color: var(--modal-box-bg);
  color: var(--text-main);
}
.info-table td input[type='text']::placeholder {
  color: var(--text-main);
}
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: var(--icon-filter, brightness(0))
}

/* 경고문 */
.warning-text {
  display: flex;
  margin-top: 16px;
  font-size: 0.85rem;
  color: var(--text-sub);
  line-height: 1.4;
  justify-content: flex-end;
}

/* 하단 버튼 행 */
.button-row {
  position: absolute;
  bottom: 40px;            /* 카드 padding-bottom(32px)보다 살짝 위로 */
  right: 40px;             /* 카드 padding-right 값과 동일 */
  display: flex;
  gap: 12px;
}
.btn-cancel {
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
.btn-cancel:hover {
  background-color: #000;
  color: #fff;
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

/* 반응형 간단 예시 */
@media (max-width: 1000px) {
  .content {
    flex-direction: column;
  }
  .upload-area,
  .form-area {
    width: 100%;
    flex: 1;
  }
  .upload-area {
    height: 300px;
  }
  .form-area {
    justify-content: flex-start;
  }
  .info-table {
    width: 100%;
  }
}
</style>
