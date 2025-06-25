<template>
  <!-- 상단 헤더 -->
    <h1 class="page-title">징계 관리</h1>
  <p class="desc">징계 등록</p>

  <div class="card">
    <div class="content">
      <!-- 왼쪽: 첫 번째 이미지 미리보기 -->
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
            징계서류 이미지를 업로드 해주세요. (최대 5장)
          </span>
        </template>
        <template v-else>
          <!-- 첫 번째 파일만 크게 -->
          <img
            :src="previewUrls[0]"
            alt="징계서류 미리보기"
            class="preview-img"
          />
        </template>
      </div>

      <!-- 오른쪽: 입력폼 + 첨부파일 리스트 -->
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
                  @input="onEmployeeNameChange"
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
                  v-model="form.employeeNumber"
                  placeholder="사원번호 자동 입력"
                  readonly
                />
              </td>
            </tr>
            <tr>
              <th>징계내용</th>
              <td>
                <input
                  type="text"
                  v-model="form.disciplinaryDescription"
                  placeholder="징계내용 입력"
                />
              </td>
            </tr>
            <tr>
              <th>징계일자</th>
              <td>
                <input type="date" v-model="form.disciplinaryDate" />
              </td>
            </tr>
            <tr>
              <th>첨부파일</th>
              <td>
                <!-- 파일명 리스트 -->
                <ul class="attached-file-list">
                  <li v-for="(f, i) in files" :key="i">
                    {{ f.name }}
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
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
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import BaseToast from '@/components/toast/BaseToast.vue'

// ————————————————————————————————————————————————————————————————
// 1) Axios 기본 URL 설정
// ————————————————————————————————————————————————————————————————
axios.defaults.baseURL = 'http://localhost:5000'

// ————————————————————————————————————————————————————————————————
// 2) 라우터 & 스토어
// ————————————————————————————————————————————————————————————————
const router = useRouter()
const userStore = useUserStore()

// ————————————————————————————————————————————————————————————————
// 3) 파일 업로드 관련
// ————————————————————————————————————————————————————————————————
const fileInput = ref(null)
const files = ref([])            // 실제 File 객체 목록
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

// ————————————————————————————————————————————————————————————————
// 4) 사원 자동 완성 & 번호 매핑
// ————————————————————————————————————————————————————————————————
const employeeOptions = ref([])

const form = reactive({
  employeeName: '',
  employeeNumber: '',
  disciplinaryDescription: '',
  disciplinaryDate: ''
})

watch(() => form.employeeName, async name => {
  if (!name.trim()) {
    employeeOptions.value = []
    form.employeeNumber = ''
    return
  }
  try {
    const { data } = await axios.get(
      '/employees/search',
      { params: { name } }
    )
    employeeOptions.value = data
    const match = data.find(e => e.employeeName === name)
    form.employeeNumber = match ? String(match.employeeId) : ''
  } catch (err) {
    console.error('사원 검색 오류:', err)
  }
})

function onEmployeeNameChange() {
  const match = employeeOptions.value.find(
    e => e.employeeName === form.employeeName
  )
  form.employeeNumber = match ? String(match.employeeId) : ''
}

// ————————————————————————————————————————————————————————————————
// 5) 인증 헤더 헬퍼
// ————————————————————————————————————————————————————————————————
function authHeaders() {
  return { Authorization: `Bearer ${userStore.accessToken}` }
}

// ————————————————————————————————————————————————————————————————
// 6) 저장 (계약 등록) 로직
// ————————————————————————————————————————————————————————————————
async function onSave() {
  // 1) 토큰 로그 (디버깅용)
  console.log('▶ accessToken =', userStore.accessToken)
  console.log('▶ auth header =', `Bearer ${userStore.accessToken}`)

  // 2) 필수 입력 체크
  if (
    !form.employeeName.trim() ||
    !form.employeeNumber.trim() ||
    !form.disciplinaryDescription.trim() ||
    !form.disciplinaryDate ||
    files.value.length === 0
  ) {
    return showToast('모든 항목을 입력하고, 파일을 업로드해야 저장할 수 있습니다.')
  }

  try {
    // 3) S3 업로드 (동일)
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

    // 4) 징계 등록 API 호출
    const payload = {
      employeeId: Number(form.employeeNumber),
      disciplinaryDescription: form.disciplinaryDescription,
      disciplinaryDate: form.disciplinaryDate,
      files: uploaded
    }
    await axios.post(
      '/disciplinary',      
      payload,
      { headers: authHeaders() }
    )

    showToast('징계가 정상 등록되었습니다.')
    router.push('/employeeInfo/disciplinary')
  } catch (err) {
    console.error('등록 중 오류:', err.response?.status, err.response?.data)
    showToast(err.response?.data?.message || `등록에 실패했습니다 (HTTP ${err.response?.status}).`)
  }
}

// ————————————————————————————————————————————————————————————————
// 7) 취소 버튼
// ————————————————————————————————————————————————————————————————
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

.back-btn {
  width: 24px;
  margin-right: -2px;
  cursor: pointer;
}

/* 카드 영역 */
.card {
  background: var(--bg-box);
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  width: 98%;
  margin: 0 20px 30px 20px;
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
  min-height: 700px;
}

/* 본문 영역 */
.content {
  display: flex;
  gap: 20px;
  height: 100%;
  padding: 20px 12px;
  margin-top: 30px;
}

/* 왼쪽 업로드 영역 */
.upload-area {
  flex: 0.7;
  background-color: var(--modal-box-bg);
  border-radius: 12px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
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

/* 오른쪽 폼 영역 */
.form-area {
  flex: 1.3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin-left: 50px;
}
.info-table {
  width: 100%;
  border-collapse: collapse;
}
.info-table th,
.info-table td {
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
.info-table td input::placeholder {
  color: #bbb;
}

/* 하단 버튼 */
.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
  margin-right: 18px;
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

/* 반응형 */
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
}

.attached-file-list {
  margin: 0;               /* 위아래 여백 제거 */
  padding: 0 0 0 12px;     /* 좌측 들여쓰기만 살짝(입력칸 패딩에 맞춰 조정) */
  list-style: disc inside;  /* 불릿 마커도 안쪽에 배치 */
}

/* 각 항목 간격도 최소화 */
.attached-file-list li {
  margin: 2px 0;           /* 항목 간 간격 */
  line-height: 1.2;        /* 줄 높이 축소 */
}

</style>
