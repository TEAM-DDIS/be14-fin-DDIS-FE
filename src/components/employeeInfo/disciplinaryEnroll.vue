<template>
  <!-- 상단 헤더 -->
  <h1 class="page-title">징계 관리</h1>
  <p class="desc">징계 등록</p>

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
            징계서류 이미지를 업로드 해주세요.
          </span>
        </template>
        <template v-else>
          <img :src="previewUrl" alt="징계서류 미리보기" class="preview-img" />
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
            <tr>
              <th>징계서류</th>
              <td>
                <input
                  type="text"
                  v-model="form.disciplinary"
                  placeholder="징계서류 입력"
                />
              </td>
            </tr>
            <tr>
              <th>징계내용</th>
              <td>
                <input 
                  type="text" 
                  v-model="form.disciplinarydescrip"
                  placeholder="징계내용 입력" 
                />
              </td>
            </tr>
            <tr>
              <th>징계일자</th>
              <td>
                <input type="date" v-model="form.disciplinarydate" />
              </td>
            </tr>
          </tbody>
        </table>
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
  disciplinary: '',
  disciplinarydescrip: '',
  disciplinarydate: ''
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

// 저장 버튼 클릭 시 처리 (유효성 검사 추가)
function onSave() {
  // 1) 필수 입력값 모두 채워졌는지 확인
  if (
    !form.employeeName.trim() ||
    !form.employeeNumber.trim() ||
    !form.disciplinary.trim() ||
    !form.disciplinarydescrip.trim() ||
    !form.disciplinarydate ||
    !previewUrl.value
  ) {
    alert('모든 항목을 입력하고 이미지를 업로드해야 저장할 수 있습니다.')
    return
  }

  // 2) 실제 저장 로직 (예: API 호출) 수행
  console.log('저장할 데이터:', { ...form, image: previewUrl.value })
  alert('저장되었습니다.')
  router.push('/employeeInfo/disciplinary')
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

/* 하단 버튼 행 */
.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}
.btn {
  min-width: 100px;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
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
  color: #fff;;
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
