<template>
  <!-- 제목 / 설명은 카드 밖 -->
  <h1 class="page-title">공지사항</h1>
  <p class="desc">공지사항 등록 화면</p>

  <!-- 카드 박스 -->
  <div class="post-enroll-wrapper">
    <!-- 숨겨진 파일 입력 -->
    <input
      type="file"
      ref="fileInputRef"
      multiple
      style="display: none;"
      @change="onFileChange"
    />

    <!-- 1) 제목 입력 -->
    <div class="form-row">
      <label for="title" class="form-label">
        제목 <span class="required">*</span>
      </label>
      <input
        id="title"
        type="text"
        v-model="title"
        placeholder="제목을 입력하세요."
        class="form-input"
      />
    </div>

    <!-- 2) 파일 첨부 영역 -->
    <div class="form-row file-row">
      <label class="form-label">파일첨부</label>
      <div
        class="file-dropzone"
        @dragover.prevent
        @drop.prevent="onDropFiles"
        @click="onClickAddFiles"
      >
        <p>파일을 드래그하거나 추가하세요.</p>
        <div class="file-buttons">
          <button
            type="button"
            class="btn-save"
            @click.stop="onClickAddFiles"
          >
            추가
          </button>
        </div>
      </div>
    </div>

    <!-- 첨부된 파일 목록 -->
    <ul class="attached-list" v-if="files.length">
      <li v-for="(file, idx) in files" :key="idx" class="file-item">
        <span class="file-name">{{ file.name }}</span>
        <button
          type="button"
          class="btn-delete small"
          @click="removeFile(idx)"
        >
          ×
        </button>
      </li>
    </ul>

    <!-- 안내 문구 -->
    <p class="instructions" v-if="!files.length">
      • 20MB 미만의 이미지(jpg, jpeg, png, gif) 또는 문서(doc,
      docx, ppt, pptx, xls, xlsx, pdf, hwp)만 첨부 가능합니다. (최대 5개)<br />
      • 개인정보가 포함된 문서는 등록 시 주의해 주세요. (주민등록번호·통장사본
      등)<br />
      • 첨부파일 내 특수기호 또는 이미지가 포함되어 있는 경우 일부 문자가
      정상적으로 노출되지 않을 수 있습니다.
    </p>

    <!-- 3) 본문 에디터 -->
    <div class="form-group">
      <label class="form-label">본문</label>
      <div
        class="editor"
        contenteditable="true"
        :placeholder="editorPlaceholder"
        @input="onEditorInput"
        ref="editorRef"
      ></div>
    </div>

    <!-- 4) 하단 버튼 -->
    <div class="action-footer">
      <!-- 취소 버튼에 동일한 btn-save 스타일을 주고, 클릭 시 목록 페이지로 이동 -->
      <button type="button" class="btn-save" @click="onCancel">
        취소
      </button>
      <button type="button" class="btn-save" @click="onSubmit">
        완료
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'     // <-- 여기에 useRouter를 import

/* 라우터 인스턴스 얻기 */
const router = useRouter()

/* 제목 */
const title = ref('')

/* 파일 첨부 상태 */
const files = ref([])
const fileInputRef = ref(null)

function onDropFiles(event) {
  const dropped = Array.from(event.dataTransfer.files)
  addFiles(dropped)
}

function onClickAddFiles() {
  fileInputRef.value.click()
}

function onFileChange(e) {
  const selected = Array.from(e.target.files)
  addFiles(selected)
  e.target.value = ''
}

function addFiles(newFiles) {
  if (files.value.length + newFiles.length > 5) {
    alert('첨부파일은 최대 5개까지 가능합니다.')
    return
  }
  newFiles.forEach((f) => {
    if (f.size <= 20 * 1024 * 1024) {
      files.value.push(f)
    } else {
      alert(`${f.name} 파일은 20MB를 초과하여 추가되지 않았습니다.`)
    }
  })
}

function removeFile(index) {
  files.value.splice(index, 1)
}

function onRemoveAllFiles() {
  files.value = []
}

/* 본문 에디터 */
const editorRef = ref(null)
const contentHtml = ref('')
const editorPlaceholder = '내용을 입력해주세요.'

function onEditorInput(e) {
  contentHtml.value = e.target.innerHTML
}

onMounted(() => {
  if (editorRef.value) {
    if (editorRef.value.innerText.trim() === '') {
      editorRef.value.classList.add('empty')
    }
    editorRef.value.addEventListener('focus', () => {
      editorRef.value.classList.remove('empty')
    })
    editorRef.value.addEventListener('blur', () => {
      if (editorRef.value.innerText.trim() === '') {
        editorRef.value.classList.add('empty')
      }
    })
  }
})

/* 취소 및 제출 로직 */
function onCancel() {
  // 입력값을 리셋하는 로직
  title.value = ''
  files.value = []
  if (editorRef.value) {
    editorRef.value.innerHTML = ''
  }
  // ----> 공지사항 목록 페이지로 이동
  router.push('/post')
}

function onSubmit() {
  if (!title.value.trim()) {
    alert('제목을 입력해주세요.')
    return
  }
  if (!editorRef.value || editorRef.value.innerText.trim() === '') {
    alert('본문을 입력해주세요.')
    return
  }
  const formData = new FormData()
  formData.append('title', title.value)
  formData.append('content', contentHtml.value)
  files.value.forEach((f) => {
    formData.append('files', f)
  })
  console.log('서버 전송용 FormData:', formData)
  alert('등록이 완료되었습니다.')
  onCancel()
}
</script>

<style scoped>
.post-enroll-wrapper {
  background: #fff;
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  width: 100%;
  height: 100%;
  min-width: 0;
  max-width: 100%;
  margin: 20px 0 0 10px;
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
  margin-bottom: 30px;
}

/* page-title, desc (카드 밖) */
.page-title {
  margin-left: 20px;
  margin-bottom: 50px;
  color: #00a8e8;
}
.desc {
  display: block;
  margin-left: 20px;
  margin-bottom: 10px;
}

/* 1) 제목/파일 행 정렬용 공통 */
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.form-row .form-label {
  width: 100px; /* 레이블 고정 너비 */
  margin-right: 12px;
}

/* 파일행만 따로 스타일 */
.file-row {
  margin-bottom: 8px;
}

/* 2) 본문 에디터 등은 세로 스택 */
.form-group {
  margin-bottom: 24px;
}
.form-group .form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

/* 레이블 공통 */
.form-label {
  font-weight: 500;
  color: #333;
}
.required {
  color: #e74c3c;
}

/* 입력칸 공통 */
.form-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
}

/* 제목 입력칸 호버 시에도 테두리 색을 어둡게 */
.form-input:hover {
  border-color: #1f2937;
}
.form-input:focus {
  outline: none;
  border-color: #1f2937;
}

/* 파일 첨부 드롭존 */
.file-dropzone {
  flex: 1; /* label 옆 공간 채우기 */
  position: relative;
  height: 50px;
  border: 1px solid #c8c8c8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  box-sizing: border-box;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}
.file-dropzone:hover {
  border-color: #1f2937;
  background-color: #f9fcff;
}
.file-dropzone p {
  margin: 0;
  color: #888;
  font-size: 14px;
}
.file-buttons {
  display: flex;
  gap: 8px;
}
.file-buttons .btn-save,
.file-buttons .btn-delete {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.file-buttons .btn-save:hover {
  background-color: #fff;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.15);
}
.file-buttons .btn-delete:hover {
  background-color: #000;
  color: #fff;
  box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.15);
}

.attached-list {
  list-style: none;
  margin: 10px 0 0 110px; /* 레이블 영역만큼 들여쓰기 */
  padding: 0;
}
.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #444;
}
.file-item .file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80%;
}
.file-item .btn-delete.small {
  padding: 4px 8px;
  font-size: 12px;
}

/* 안내 문구 */
.instructions {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-left: 115px; /* 레이블 영역만큼 들여쓰기 */
}

/* 본문 에디터 */
.editor {
  min-height: 300px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
}

/* 본문 입력칸(에디터) 호버 시에도 테두리 색을 어둡게 */
.editor:hover {
  border-color: #1f2937;
}

.editor:focus {
  /* 포커스 시에도 테두리 두께 변화 없이 색만 어둡게 */
  outline: none;
  border: 1px solid #1f2937;
}

.editor.empty:before {
  content: attr(placeholder);
  position: absolute;
  top: 12px;
  left: 16px;
  color: #aaa;
  pointer-events: none;
  font-size: 14px;
}

/* 하단 버튼 */
.action-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

/* btn-save, btn-delete 스타일 */
.btn-save {
  background-color: #00a8e8;
  color: #fff;
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
  background-color: #fff;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

/* 삭제/추가 버튼만 쓰는 .btn-delete 스타일 (작은 사이즈에 쓰임) */
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

.btn-delete.small {
  padding: 4px 8px;
  font-size: 12px;
}
</style>
