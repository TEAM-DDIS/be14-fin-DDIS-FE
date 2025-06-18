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


</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

axios.defaults.baseURL = 'http://localhost:8000'

const router = useRouter()
const fileInput = ref(null)

// 업로드된 File 객체 리스트
const files = ref([])
// 미리보기용 URL 리스트
const previewUrls = ref([])

// 사원 검색 옵션
const employeeOptions = ref([])

// 폼 데이터 (template에 맞춰 필드만 선언)
const form = reactive({
  employeeName:   '',
  employeeId:     '',
  contractDescrip:'',
  requestDate:    '',
  contractDate:   '',
  endDate:        ''
})

// 사원명 입력 시 자동 검색 & 번호 매핑
watch(() => form.employeeName, async name => {
  if (!name.trim()) {
    employeeOptions.value = []
    form.employeeId = ''
    return
  }
  try {
    const { data } = await axios.get('/employees/search', { params: { name } })
    employeeOptions.value = data
    const match = data.find(e => e.employeeName === name)
    form.employeeId = match ? String(match.employeeId) : ''
  } catch (e) {
    console.error('사원 검색 오류', e)
  }
})

function triggerFileSelect() {
  fileInput.value?.click()
}

// 최대 5장 제한, previewUrls / files 업데이트
function onFileChange(e) {
  const selected = Array.from(e.target.files)
  if (selected.length > 5) {
    alert('최대 5장까지 업로드할 수 있습니다.')
  }
  const limited = selected.slice(0, 5)
  files.value = limited

  // 기존 URL 해제
  previewUrls.value.forEach(URL.revokeObjectURL)
  previewUrls.value = limited.map(f => URL.createObjectURL(f))
}

function onCancel() {
  router.back()
}

async function onSave() {
  // 필수 체크
  if (
    !form.employeeName.trim() ||
    !form.employeeId.trim() ||
    !form.contractDescrip.trim() ||
    !form.requestDate ||
    !form.contractDate ||
    !form.endDate ||
    !files.value.length
  ) {
    alert('모든 항목을 입력하고 파일을 업로드해야 저장할 수 있습니다.')
    return
  }

  try {
    // 1) 파일들 presigned URL 받아 업로드
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
      uploaded.push({
        fileName: f.name,
        fileUrl:  up.key,
        fileSize: f.size
      })
    }

    // 2) 계약 등록 API 호출
    await axios.post('/contracts', {
      employeeName:    form.employeeName,
      employeeId:      Number(form.employeeId),
      contractDescrip: form.contractDescrip,
      requestDate:     form.requestDate,
      contractDate:    form.contractDate,
      endDate:         form.endDate,
      files:           uploaded
    })

    alert('계약서가 정상 등록되었습니다.')
    router.push('/employeeInfo/Contract')
  } catch (err) {
    console.error('등록 오류', err)
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

/* 카드 영역: 높이를 늘려서 min-height 적용 */
.card {
  position: relative; 
  background: #fff;
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  width: 100%;
  margin: 20px 0 0 10px;
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
  margin-bottom: 30px;
  /* 높이를 아래로 늘립니다 */
  min-height: 700px;
}

/* 본문 영역: 좌우 2단 레이아웃 */
.content {
  display: flex;
  gap: 20px;
  height: 100%;
}

/* 왼쪽 업로드 영역: flex 비율을 줄여 너비가 좁아지게 함 */
.upload-area {
  flex: 0.7;
  background-color: #f5f6f7;
  border-radius: 8px;
  /* 카드가 min-height 700px이므로, 이보다 약간 작은 600px로 설정 */
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
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
.info-table td input[type='text']::placeholder {
  color: #bbb;
}

/* 경고문 */
.warning-text {
  display: flex;
  margin-top: 16px;
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.4;
  justify-content: flex-end;
}

/* 하단 버튼 행 */
.button-row {
  position: absolute;
  bottom: 20px;            /* 카드 padding-bottom(32px)보다 살짝 위로 */
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
