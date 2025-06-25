<template>
    <h1 class="page-title">
        <img
        src="@/assets/icons/back_btn.svg"
        alt="back"
        class="back-btn"
        @click="goBack"
       />공지사항
    </h1>
  <p class="desc">공지사항 상세조회</p>

  <!-- 로딩 / 에러 -->
  <div v-if="loading" class="status-text">로딩 중...</div>
  <div v-else-if="error" class="status-text error">{{ error }}</div>

  <!-- 읽기 모드 -->
  <div v-else-if="!isEditing" class="detail-card">
    <div class="detail-field">
      <span class="label">번호</span>
      <div class="value">{{ notice.id }}</div>
    </div>
    <div class="detail-field">
      <span class="label">제목</span>
      <div class="value">{{ notice.title }}</div>
    </div>
    <div class="detail-field">
      <span class="label">작성자</span>
      <div class="value">{{ notice.writer }}</div>
    </div>
    <div class="detail-field">
      <span class="label">작성일자</span>
      <div class="value">{{ notice.date }}</div>
    </div>

    <div class="detail-field">
      <span class="label">파일첨부</span>
      <div class="value">
        <ul v-if="notice.fileList.length" class="attached-list-inline">
          <li
            v-for="(f, i) in notice.fileList"
            :key="i"
            class="file-item-inline"
          >
            <a
              href="#"
              class="file-link"
              @click.prevent="downloadFile(f.key, f.name)"
            >
              {{ f.name }}
            </a>
          </li>
        </ul>
        <span v-else>-</span>
      </div>
    </div>

    <div class="detail-field content-field">
      <span class="label">내용</span>
      <div class="value content-box" v-html="notice.content"></div>
    </div>

    <div class="button-group">
      <button v-if="isHR" class="btn-delete" @click="onDelete">삭제</button>
      <button v-if="isHR" class="btn-save" @click="onEdit">수정</button>
    </div>
  </div>

  <!-- 수정 모드 -->
  <div v-else class="post-enroll-wrapper">
    <div class="form-row">
      <label class="form-label">번호</label>
      <input type="text" :value="notice.id" class="form-input" disabled />
    </div>
    <div class="form-row">
      <label class="form-label">제목 <span class="required">*</span></label>
      <input v-model="editableNotice.title" class="form-input" />
    </div>
    <div class="form-row">
      <label class="form-label">작성자</label>
      <input type="text" :value="notice.writer" class="form-input" disabled />
    </div>
    <div class="form-row">
      <label class="form-label">작성일자</label>
      <input type="text" :value="notice.date" class="form-input" disabled />
    </div>

    <input
      type="file"
      ref="fileInputRef"
      multiple
      style="display:none"
      @change="onFileChange"
    />
    <div
      class="form-row file-row"
      @dragover.prevent
      @drop.prevent="onDropFiles"
      @click="onClickAddFiles"
    >
      <label class="form-label">파일첨부</label>
      <div class="file-dropzone">
        <p>파일을 드래그하거나 추가하세요.</p>
        <button
          type="button"
          class="btn-save small"
          @click.stop="onClickAddFiles"
        >
          추가
        </button>
      </div>
    </div>
    <ul class="attached-list" v-if="allFiles.length">
      <li v-for="(f, idx) in allFiles" :key="idx" class="file-item">
        <span class="file-name">{{ f.name }}</span>
        <button
          type="button"
          class="btn-delete small"
          @click="removeFile(idx)"
        >
          ×
        </button>
      </li>
    </ul>
    <p v-else class="instructions">
      • 20MB 미만의 이미지(jpg, jpeg, png, gif) 또는 문서(doc, docx, ppt,
      pptx, xls, xlsx, pdf, hwp)만 첨부 가능합니다. (최대 5개)<br />
      • 개인정보가 포함된 문서는 등록 시 주의해 주세요.<br />
      • 특수기호 또는 이미지 포함 시 일부 문자가 정상 노출되지 않을 수
      있습니다.
    </p>

    <div class="form-group">
      <label class="form-label">내용 <span class="required">*</span></label>
      <div
        class="editor"
        contenteditable="true"
        ref="editorRef"
        :placeholder="editorPlaceholder"
        @input="onEditorInput"
      ></div>
    </div>

    <div class="action-footer">
      <button class="btn-cancel" @click="onCancelEdit">취소</button>
      <button class="btn-save" @click="onSaveEdit">저장</button>
    </div>
  </div>
  <BaseToast ref="toastRef" />
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BaseToast from '@/components/toast/BaseToast.vue'

axios.defaults.baseURL = 'http://localhost:5000'

const route     = useRoute()
const router    = useRouter()
const userStore = useUserStore()
const toastRef = ref(null)

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

const loading      = ref(true)
const error        = ref('')
const notice       = ref({ id:'', title:'', writer:'', date:'', content:'', fileList:[] })

const isEditing      = ref(false)
const editableNotice = ref({ ...notice.value })
const files          = ref([])

const allFiles = computed(() => {
  const existing = editableNotice.value.fileList.map(f => ({
    name: f.name,
    key:  f.key,
    isNew:false
  }))
  const newly = files.value.map(f => ({
    name: f.name,
    fileObj: f,
    isNew: true
  }))
  return [...existing, ...newly]
})

const editorRef        = ref(null)
const editorPlaceholder = '내용을 입력해주세요.'

// 뒤로가기
function goBack() {
  router.back()
}

function authHeaders() {
  return { Authorization: `Bearer ${userStore.accessToken}` }
}

async function fetchNotice() {
  loading.value = true
  error.value   = ''
  try {
    const id  = route.params.id
    const { data: dto } = await axios.get(`/boards/${id}`, {
      headers: authHeaders()
    })
    notice.value = {
      id:      id,
      title:   dto.boardTitle,
      writer:  dto.employeeName,
      date:    new Date(dto.boardCreateAt).toLocaleString(),
      content: dto.boardContent,
      fileList:(dto.fileList||[]).map(f=>({ name:f.name, key:f.url }))
    }
  } catch (e) {
    error.value = e.response?.data?.message||'불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

async function downloadFile(key, name) {
  try {
    const { data: presignedUrl } = await axios.get('/s3/download-url', {
      params:{ filename:key, contentType:'' },
      headers:authHeaders()
    })
    // blob 방식으로 다운로드
    const res = await fetch(presignedUrl)
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('다운로드 실패', err)
    showToast('파일 다운로드 중 오류가 발생했습니다.')
  }
}

async function onDelete() {
  if (!confirm('정말 삭제하시겠습니까?')) return
  try {
    await axios.delete(`/boards/${notice.value.id}`,{ headers:authHeaders() })
    showToast('삭제되었습니다.')
    router.push('/post')
  } catch {
    showToast('삭제 중 오류가 발생했습니다.')
  }
}

function onEdit() {
  editableNotice.value = { ...notice.value }
  files.value = []
  isEditing.value = true
  nextTick(() => {
    if (editorRef.value) editorRef.value.innerHTML = notice.value.content
  })
}

function onCancelEdit() {
  isEditing.value = false
}

const fileInputRef = ref(null)
function onClickAddFiles() { fileInputRef.value.click() }
function onFileChange(e) {
  files.value.push(...Array.from(e.target.files))
  e.target.value=''
}
function onDropFiles(e) {
  files.value.push(...Array.from(e.dataTransfer.files))
}
function removeFile(idx) {
  const f = allFiles.value[idx]
  if (f.isNew) files.value = files.value.filter(x=>x.name!==f.name)
  else editableNotice.value.fileList = editableNotice.value.fileList.filter(x=>x.name!==f.name)
}

function onEditorInput(e) {
  editableNotice.value.content = e.target.innerHTML
}

async function onSaveEdit() {
  if (!editableNotice.value.title.trim()) return showToast('제목을 입력해주세요.')
  if (!editorRef.value.innerText.trim()) return showToast('내용을 입력해주세요.')

  const uploaded = []
  for (const f of files.value) {
    const { data } = await axios.get('/s3/upload-url',{
      params:{ filename:f.name, contentType:f.type },
      headers:authHeaders()
    })
    await fetch(data.url,{
      method:'PUT',
      headers:{ 'Content-Type':f.type },
      body:f
    })
    uploaded.push({ key:data.key, fileName:f.name, fileSize:f.size })
  }

  const payload = {
    boardTitle:   editableNotice.value.title,
    boardContent: editorRef.value.innerHTML,
    files:[
      ...editableNotice.value.fileList.map(f=>({
        key:f.key,
        fileName:f.name,
        fileSize:null
      })),
      ...uploaded
    ]
  }

  try {
    await axios.put(`/boards/${notice.value.id}`,payload,{
      headers:{ ...authHeaders(), 'Content-Type':'application/json' }
    })
    showToast('수정되었습니다.')
    isEditing.value=false
    await fetchNotice()
  } catch {
    showToast('수정 중 오류가 발생했습니다.')
  }
}

onMounted(fetchNotice)
</script>


<style scoped>
/* ================= 기본 공통 스타일 ================= */
/* page-title, desc */
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
  height: 24px;
  margin-right: -2px;
  cursor: pointer;
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
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-left: 20px;
  max-width: 100%;
  overflow-x: auto;
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
.btn-cancel:hover{
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
