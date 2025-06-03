<template>
  <!-- 1) 상단 헤더: 뒤로가기 + 타이틀 + 수정/삭제 버튼 -->
  <h1 class="page-title">공지사항</h1>
  <p class="desc">공지사항 상세조회</p>

  <!-- 2) 로딩 / 에러 표시 -->
  <div v-if="loading" class="status-text">로딩 중...</div>
  <div v-else-if="error" class="status-text error">{{ error }}</div>

  <!-- 3) 읽기 모드 -->
  <div v-else-if="!isEditing" class="detail-card">
    <!-- 번호 -->
    <div class="detail-field">
      <span class="label">번호</span>
      <div class="value">{{ notice.id }}</div>
    </div>

    <!-- 제목 -->
    <div class="detail-field">
      <span class="label">제목</span>
      <div class="value">{{ notice.title }}</div>
    </div>

    <!-- 작성자 -->
    <div class="detail-field">
      <span class="label">작성자</span>
      <div class="value">{{ notice.writer }}</div>
    </div>

    <!-- 작성일자 -->
    <div class="detail-field">
      <span class="label">작성일자</span>
      <div class="value">{{ notice.date }}</div>
    </div>

    <!-- 파일첨부 (읽기 전용) -->
    <div class="detail-field">
      <span class="label">파일첨부</span>
      <div class="value">
        <!-- fileList가 빈 배열일 때 에러가 나지 않도록 미리 빈 배열로 설정함 -->
        <template v-if="notice.fileList.length > 0">
          <ul class="attached-list-inline">
            <li
              v-for="(f, i) in notice.fileList"
              :key="i"
              class="file-item-inline"
            >
              <a :href="f.url" target="_blank" class="file-link">{{ f.name }}</a>
            </li>
          </ul>
        </template>
        <span v-else>-</span>
      </div>
    </div>

    <!-- 내용 -->
    <div class="detail-field content-field">
      <span class="label">내용</span>
      <div class="value content-box" v-html="notice.content"></div>
    </div>

    <div class="button-group">
      <button class="btn-save" @click="onEdit">수정</button>
      <button class="btn-delete" @click="onDelete">삭제</button>
    </div>
  </div>

  <!-- 4) 수정 모드 -->
  <div v-else class="post-enroll-wrapper">
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
      <label for="editTitle" class="form-label">
        제목 <span class="required">*</span>
      </label>
      <input
        id="editTitle"
        type="text"
        v-model="editableNotice.title"
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
            class="btn-save small"
            @click.stop="onClickAddFiles"
          >
            추가
          </button>
        </div>
      </div>
    </div>

    <!-- 기존 첨부파일 + 새로 추가된 파일 목록 -->
    <ul class="attached-list" v-if="allFiles.length">
      <li v-for="(file, idx) in allFiles" :key="idx" class="file-item">
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
    <p class="instructions" v-else>
      • 20MB 미만의 이미지(jpg, jpeg, png, gif) 또는 문서(doc,
      docx, ppt, pptx, xls, xlsx, pdf, hwp)만 첨부 가능합니다. (최대 5개)<br />
      • 개인정보가 포함된 문서는 등록 시 주의해 주세요. (주민등록번호·통장사본
      등)<br />
      • 첨부파일 내 특수기호 또는 이미지가 포함되어 있는 경우 일부 문자가
      정상적으로 노출되지 않을 수 있습니다.
    </p>

    <!-- 3) 본문 에디터 -->
    <div class="form-group">
      <label class="form-label">내용 <span class="required">*</span></label>
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
      <button type="button" class="btn-save" @click="onCancelEdit">
        취소
      </button>
      <button type="button" class="btn-save" @click="onSaveEdit">
        저장
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/* 라우터 훅 */
const route = useRoute()
const router = useRouter()

/* 로딩 / 에러 / 데이터 상태 */
/* notice에 반드시 fileList: []를 초기화해서 undefined.length 에러를 방지 */
const loading = ref(true)
const error = ref('')
const notice = ref({
  id: '',
  title: '',
  writer: '',
  date: '',
  fileList: [], // [{ name: '', url: '' }, ...] 형태
  content: ''
})

/* 수정 모드 상태 및 편집용 복사본 */
const isEditing = ref(false)
const editableNotice = ref({
  id: '',
  title: '',
  writer: '',
  date: '',
  fileList: [],
  content: ''
})

/* “읽기 모드 데이터 → 수정 모드 초기화” 함수 */
function enterEditMode() {
  editableNotice.value = {
    ...notice.value,
    fileList: [...notice.value.fileList] 
  }
  files.value = [] // 새로 추가하는 File 객체들 비우기
  isEditing.value = true
}

/* 수정 모드에서 기존 파일 + 새 파일을 합쳐 화면에 렌더링할 계산 속성 */
const files = ref([]) // 새로 추가된 File 객체들을 보관
const allFiles = computed(() => {
  // 기존에 서버에 있던 파일들은 { name, url, fileObj: null } 형태
  const existing = editableNotice.value.fileList.map(f => ({
    name: f.name,
    url: f.url,
    fileObj: null
  }))
  // 새로 추가된 파일들은 { name, url: null, fileObj: File }
  const newly = files.value.map(f => ({
    name: f.name,
    url: null,
    fileObj: f
  }))
  return [...existing, ...newly]
})

/* 예시 더미 데이터 (실제 API 호출로 대체) */
const dummyNotices = [
  {
    id: 1,
    title: '[안내] 시스템 개선 결과 공유',
    writer: '김량량',
    date: '2025-05-25',
    fileList: [
      {
        name: '설문_기반_인사_시스템_개선_결과.hwp',
        url: '/files/설문_기반_인사_시스템_개선_결과.hwp'
      }
    ],
    content: `
      <p>안녕하세요, 인사팀입니다.</p>
      <p>최근 사내 인사 시스템 사용자를 대상으로 설문 조사를 진행하였고, 이를 바탕으로 주요 불편 사항을 분석하였습니다.</p>
      <p>그 결과, 근태 관리의 간소화, 휴가 신청 프로세스 개선, 알림 기능 강화 등 여러 기능이 반영된 새로운 ERP 시스템이 도입됩니다.</p>
      <p>개선된 시스템은 오는 6월부터 전사적으로 적용될 예정이며, 별도 교육 세션도 마련될 계획입니다.</p>
      <p>앞으로도 더 나은 근무 환경을 위해 지속적으로 의견을 수렴하겠습니다. 감사합니다.</p>
    `
  },
  {
    id: 2,
    title: '[안내] 여름 휴가 일정 공지',
    writer: '박인사',
    date: '2025-06-01',
    fileList: [
      {
        name: '여름휴가_일정.xlsx',
        url: '/files/여름휴가_일정.xlsx'
      }
    ],
    content: `
      <p>안녕하세요, 인사팀입니다.</p>
      <p>2025년 여름 휴가 일정을 아래와 같이 공지드립니다.</p>
      <ul>
        <li>휴가 기간: 2025-07-15 ~ 2025-07-31</li>
        <li>재충전을 위해 전 직원이 최소 3일 이상의 연속 휴가를 사용해 주시기 바랍니다.</li>
        <li>휴가 계획은 6월 15일까지 인사팀에 제출해 주세요.</li>
      </ul>
      <p>문의 사항은 인사팀으로 연락 바랍니다. 감사합니다.</p>
    `
  }
]

/* ID에 맞는 공지사항 불러오기 */
async function fetchNotice(id) {
  loading.value = true
  error.value = ''
  try {
    const found = dummyNotices.find((item) => item.id === Number(id))
    if (!found) {
      throw new Error('해당 ID의 공지사항을 찾을 수 없습니다.')
    }
    // (실제 API 호출 시 await fetch(...)로 대체)
    await new Promise((res) => setTimeout(res, 200))
    notice.value = { ...found }
  } catch (err) {
    error.value = err.message || '공지사항을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

/* 컴포넌트 마운트 시, params.id로 데이터 로드 */
onMounted(() => {
  const id = route.params.id
  fetchNotice(id)
})

/* 뒤로가기(목록) 함수 */
function goToList() {
  router.push('/post')
}

/* ========== 읽기 모드 핸들러 ========== */
/* “수정” 버튼 클릭 시 */
function onEdit() {
  enterEditMode()
}

/* “삭제” 버튼 클릭 시 */
function onDelete() {
  if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
    // TODO: 실제 삭제 API 호출
    alert(`공지사항 ID ${notice.value.id} 가(이) 삭제되었습니다.`)
    router.push('/post')
  }
}

/* ========== 수정 모드 파일 업로드 로직 ========== */
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
  // 기존 + 새로운 파일 개수 제한: 최대 5개
  if (allFiles.value.length + newFiles.length > 5) {
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
  const target = allFiles.value[index]
  if (target.fileObj) {
    // 새로 추가된 파일 중에서 삭제
    const idxInNew = files.value.findIndex(
      (f) => f.name === target.name && f.size === target.fileObj.size
    )
    if (idxInNew !== -1) {
      files.value.splice(idxInNew, 1)
    }
  } else {
    // 기존에 있던 파일 목록에서 삭제
    const idxInOld = editableNotice.value.fileList.findIndex(
      (f) => f.name === target.name && f.url === target.url
    )
    if (idxInOld !== -1) {
      editableNotice.value.fileList.splice(idxInOld, 1)
    }
  }
}

/* ========== 수정 모드 에디터 로직 ========== */
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

/* “수정 모드 취소” */
function onCancelEdit() {
  isEditing.value = false
}

/* “수정 모드 저장” */
function onSaveEdit() {
  // 필수 입력 체크
  if (!editableNotice.value.title.trim()) {
    alert('제목을 입력해주세요.')
    return
  }
  if (!editorRef.value || editorRef.value.innerText.trim() === '') {
    alert('본문을 입력해주세요.')
    return
  }

  // FormData 생성 (파일 업로드 포함)
  const formData = new FormData()
  formData.append('id', editableNotice.value.id)
  formData.append('title', editableNotice.value.title)
  formData.append('content', contentHtml.value)

  // 기존 파일 유지 목록
  const existingNames = editableNotice.value.fileList.map((f) => f.name)
  formData.append('existingFiles', JSON.stringify(existingNames))

  // 새로 추가된 파일만 FormData에 append
  files.value.forEach((f) => {
    formData.append('newFiles', f)
  })

  console.log('서버 전송용 FormData:', formData)
  // TODO: 실제 API 호출 (예: await fetch('/api/notice/update', { method: 'POST', body: formData }) 등)
  alert('수정이 완료되었습니다.')

  // 로컬 상태에 반영 (더미용)
  notice.value = {
    id: editableNotice.value.id,
    writer: editableNotice.value.writer,
    date: editableNotice.value.date,
    title: editableNotice.value.title,
    content: contentHtml.value,
    fileList: [
      ...editableNotice.value.fileList,
      ...files.value.map((f) => ({ name: f.name, url: '#' }))
    ]
  }

  isEditing.value = false
}
</script>

<style scoped>
/* ================= 기본 공통 스타일 ================= */
/* page-title, desc */
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

/* 로딩 / 에러 메시지 */
.status-text {
  font-size: 16px;
  text-align: center;
  color: #666;
  margin-top: 40px;
}
.status-text.error {
  color: #e74c3c;
}

/* ================= 읽기 모드 스타일 ================= */
.detail-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
  margin: 20px 0 0 10px;
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
  margin-bottom: 30px;
}
.detail-field {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}
.detail-field .label {
  width: 100px;
  font-weight: 500;
  color: #333;
  flex-shrink: 0;
}
.detail-field .value {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  color: #333;
  word-break: break-word;
  box-sizing: border-box;
}
.file-link {
  color: #00a8e8;
  text-decoration: none;
}
.file-link:hover {
  text-decoration: underline;
}
.content-field .value.content-box {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
}
@media (max-width: 600px) {
  .detail-field {
    flex-direction: column;
  }
  .detail-field .label {
    margin-bottom: 6px;
  }
}
.button-group {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin: 0 20px 20px;
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
  background-color: #fff;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.15);
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
/* 읽기 모드 첨부파일 목록 (inline 형태) */
.attached-list-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.file-item-inline a {
  padding: 6px 12px;
  background: #eef6ff;
  border-radius: 6px;
  font-size: 14px;
  color: #00a8e8;
  text-decoration: none;
}
.file-item-inline a:hover {
  text-decoration: underline;
}

/* ================= 수정 모드 스타일 ================= */
.post-enroll-wrapper {
  background: #fff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 24px 10px;
}

/* form-row 공통 */
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.form-label {
  width: 100px;
  margin-right: 12px;
  font-weight: 500;
  color: #333;
}
.required {
  color: #e74c3c;
}

/* 입력칸 공통 (제목, 파일드롭존, 첨부리스트) */
.form-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
}
.form-input:hover {
  border-color: #1f2937;
}
.form-input:focus {
  outline: none;
  border-color: #1f2937;
}

/* 파일 첨부 드롭존 */
.file-row {
  margin-bottom: 8px;
}
.file-dropzone {
  flex: 1;
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
.btn-save.small {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.btn-delete.small {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.btn-save.small:hover {
  background-color: #fff;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.15);
}
.btn-delete.small:hover {
  background-color: #000;
  color: #fff;
  box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.15);
}

/* 첨부된 파일 목록 */
.attached-list {
  list-style: none;
  margin: 10px 0 0 112px; /* 레이블 100px + 간격 12px */
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
.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80%;
}

/* 안내 문구 */
.instructions {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-left: 112px; /* 레이블 100px + 간격 12px */
}

/* 본문 에디터 */
.form-group {
  margin-bottom: 24px;
}
.form-group .form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}
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
.editor:hover {
  border-color: #1f2937;
}
.editor:focus {
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
</style>
