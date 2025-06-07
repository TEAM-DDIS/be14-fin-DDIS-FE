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
          @change="onFileChange"
          style="display: none"
        />
        <template v-if="!previewUrl">
          <span class="placeholder-text">
            계약서/법정서류 이미지를 업로드 해주세요.
          </span>
        </template>
        <template v-else>
          <img :src="previewUrl" alt="계약서 미리보기" class="preview-img" />
        </template>
      </div>

      <!-- 오른쪽: 정보 입력 테이블 (세로 중앙 정렬) -->
      <div class="form-area">
        <table class="info-table">
          <colgroup>
            <col style="width: 120px" />
            <col />
          </colgroup>
          <tbody>
            <!-- 새로 추가: 사원명 -->
            <tr>
              <th>사원명</th>
              <td>
                <input
                  type="text"
                  v-model="form.employeeName"
                  placeholder="사원명 입력"
                />
              </td>
            </tr>
            <!-- 새로 추가: 사원번호 -->
            <tr>
              <th>사원번호</th>
              <td>
                <input
                  type="text"
                  v-model="form.employeeNumber"
                  placeholder="사원번호 입력"
                />
              </td>
            </tr>
            <!-- 기존 항목: 요청일자 -->
            <tr>
              <th>요청일자</th>
              <td>
                <input type="date" v-model="form.requestDate" />
              </td>
            </tr>
            <!-- 기존 항목: 계약서명/법정서류 -->
            <tr>
              <th>계약서명/법정서류</th>
              <td>
                <input
                  type="text"
                  v-model="form.contractName"
                  placeholder="계약서명 또는 법정서류 입력"
                />
              </td>
            </tr>
            <!-- 기존 항목: 계약일자 -->
            <tr>
              <th>계약일자</th>
              <td>
                <input type="date" v-model="form.contractDate" />
              </td>
            </tr>
            <!-- 기존 항목: 만료일자 -->
            <tr>
              <th>만료일자</th>
              <td>
                <input type="date" v-model="form.endDate" />
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
  </div>

  <!-- 하단 버튼 -->
  <div class="button-row">
    <button class="btn btn-cancel" @click="onCancel">취소</button>
    <button class="btn btn-save" @click="onSave">저장</button>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const fileInput = ref(null)
const previewUrl = ref('')

// 입력 폼 데이터에 사원명/사원번호 추가
const form = reactive({
  employeeName: '',
  employeeNumber: '',
  requestDate: '',
  contractName: '',
  contractDate: '',
  endDate: ''
})

// 파일 선택 창 열기
function triggerFileSelect() {
  fileInput.value && fileInput.value.click()
}

// 파일이 선택되면 미리보기 이미지 생성
function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    previewUrl.value = reader.result
  }
  reader.readAsDataURL(file)
}

// 취소 버튼 클릭 시 뒤로 가기
function onCancel() {
  router.back()
}

// 저장 버튼 클릭 시 처리
function onSave() {
  // form 데이터와 이미지 URL을 서버에 전송하는 로직을 여기에 추가하세요
  console.log('저장할 데이터:', { ...form, image: previewUrl.value })
  alert('저장되었습니다.')
  // 필요 시 다른 경로로 이동:
  router.push('/employeeInfo/Contract')
}
</script>

<style scoped>
/* 전체 컨테이너 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 상단 헤더 */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
  font-size: 1.5rem;
  font-weight: 600;
}
.desc {
  display: block;
  margin-left: 20px;
  margin-bottom: 10px;
  color: #555;
}

/* 카드 영역: 높이를 늘려서 min-height 적용 */
.card {
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
  margin-top: 16px;
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.4;
}

/* 하단 버튼 행 */
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
