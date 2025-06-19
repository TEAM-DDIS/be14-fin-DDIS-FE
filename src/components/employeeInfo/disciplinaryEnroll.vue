<template>
  <!-- 상단 헤더 -->
    <h1 class="page-title">
        <img
        src="@/assets/icons/back_btn.svg"
        alt="back"
        class="back-btn"
        @click="goBack"
        />징계 관리
    </h1>
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
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

axios.defaults.baseURL = 'http://localhost:8000'

const router = useRouter()
const fileInput = ref(null)

// 미리보기 URL, 실제 File 객체
const previewUrls = ref([])
const files = ref([])

// 사원 검색 옵션
const employeeOptions = ref([])

// 폼 데이터
const form = reactive({
  employeeName: '',
  employeeNumber: '',
  disciplinaryDescription: '',
  disciplinaryDate: ''
})

// 사원명 입력 시 자동 검색 & 번호 매핑
watch(() => form.employeeName, async name => {
  if (!name.trim()) {
    employeeOptions.value = []
    form.employeeNumber = ''
    return
  }
  try {
    const { data } = await axios.get('/employees/search', { params: { name } })
    employeeOptions.value = data
    const match = data.find(e => e.employeeName === name)
    form.employeeNumber = match ? String(match.employeeId) : ''
  } catch (e) {
    console.error(e)
  }
})

// 뒤로가기
function goBack() {
  router.back()
}

function onEmployeeNameChange() {
  const match = employeeOptions.value.find(e => e.employeeName === form.employeeName)
  form.employeeNumber = match ? String(match.employeeId) : ''
}

function triggerFileSelect() {
  fileInput.value?.click()
}

// 최대 5장으로 제한하고 previewUrls, files 동기화
function onFileChange(e) {
  const selected = Array.from(e.target.files)
  if (selected.length > 5) {
    alert('최대 5장까지 업로드할 수 있습니다.')
  }
  const limited = selected.slice(0, 5)
  files.value = limited

  // 기존 URL 해제
  previewUrls.value.forEach(URL.revokeObjectURL)
  // 새로 생성
  previewUrls.value = limited.map(f => URL.createObjectURL(f))
}

function onCancel() {
  router.back()
}

async function onSave() {
  if (
    !form.employeeName.trim() ||
    !form.employeeNumber.trim() ||
    !form.disciplinaryDescription.trim() ||
    !form.disciplinaryDate ||
    !files.value.length
  ) {
    alert('모든 항목을 채우고 이미지를 업로드해야 저장할 수 있습니다.')
    return
  }

  try {
    // 1) 파일 업로드
    const uploaded = []
    for (const f of files.value) {
      const { data: up } = await axios.get('/s3/upload-url', {
        params: { filename: f.name, contentType: f.type }
      })
      await fetch(up.url, {
        method: 'PUT',
        headers: { 'Content-Type': f.type },
        body: f
      })
      uploaded.push({ fileName: f.name, fileUrl: up.key, fileSize: f.size })
    }

    // 2) 징계 등록
    await axios.post('/disciplinary', {
      employeeId: Number(form.employeeNumber),
      disciplinaryDescription: form.disciplinaryDescription,
      disciplinaryDate: form.disciplinaryDate,
      files: uploaded
    })

    alert('징계가 정상 등록되었습니다.')
    router.push('/employeeInfo/disciplinary')
  } catch (err) {
    console.error(err)
    alert('등록 중 오류가 발생했습니다.')
  }
}
</script>





<style scoped>
/* 상단 헤더 */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
}
.desc {
  display: block;
  margin-left: 20px;
  margin-bottom: 10px;
}

.back-btn {
  width: 24px;
  margin-right: -2px;
  cursor: pointer;
}

/* 카드 영역 */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  width: 100%;
  margin: 20px 0 0 10px;
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
  margin-bottom: 30px;
  min-height: 700px;
}

/* 본문 영역 */
.content {
  display: flex;
  gap: 20px;
  height: 100%;
}

/* 왼쪽 업로드 영역 */
.upload-area {
  flex: 0.7;
  background-color: #f5f6f7;
  border-radius: 8px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  margin-left: 20px;
}
.placeholder-text {
  color: #999;
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
  border: 1px solid #d1d5db;
  padding: 20px 12px;
  font-size: 0.95rem;
}
.info-table th {
  background-color: #fafafa;
  text-align: left;
  width: 120px;
  color: #374151;
}
.info-table td input[type='text'],
.info-table td input[type='date'] {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
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
