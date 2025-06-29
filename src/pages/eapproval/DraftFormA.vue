<!-- 전자결재 > 기안작성 > (일반기안양식) -->
<template>
  <!-- ◆ 페이지 제목 -->
  <h1 class="page-title">
    <img
        src="@/assets/icons/back_btn.svg"
        alt="back"
        class="back-btn"
        @click="goBack"
      />
      기안작성
    </h1>
  <p class="desc">업무 기안 작성</p>
  <!-- ◆ 전체 레이아웃 박스 -->
  <div class="main-box">
    <!-- ◆ 폼 컨테이너 -->
    <div class="container">
      <!-- 🔷 기본 정보 입력 영역 -->
      <h2>업무 기안</h2>
      <hr class="bold-divider" />
      <table>
        <tbody>
          <tr>
            <th scope="row">기안부서</th>
            <td><input v-model="form.departmentName" type="text" readonly /></td>
            <th scope="row">직급</th>
            <td><input v-model="form.rankName" type="text" readonly /></td>
          </tr>
          <tr>
            <th scope="row">기안자</th>
            <td><input v-model="form.drafter" type="text" readonly /></td>
            <th scope="row">기안일자</th>
            <!-- 화면에는 날짜만 표시 -->
            <td>
              <input
                type="text"
                :value="form.draftDate"
                @input="updateDraftDate($event.target.value)"
                placeholder="YYYY-MM-DD"
                readonly
              />
              <!-- 실제 저장용 (숨김 필드) -->
              <input
                type="datetime-local"
                v-model="form.draftDate"
                class="hidden-input"
              />
            </td>
          </tr>
          <tr>
            <th scope="row">문서번호</th>
            <td>-</td>
            <th scope="row">보존연한</th>
            <td>
              <select v-model.number="form.retentionPeriod">
                <option :value="1">1년</option>
                <option :value="3">3년</option>
                <option :value="5">5년</option>
              </select>
            </td>
          </tr>
          <!-- 🔷 수신자 및 참조자 설정 -->
          <tr>
            <th scope="row">수신자</th>
            <td class="flex-row">
              <input v-model="form.receiver" type="text" />
              <button class="button icon-button" @click="openReceiverModal">
                <img src="@/assets/icons/person-add.svg" alt="수신자 추가" class="icon-img" />
              </button>
              <!-- 수신자 모달 -->
              <SelectionModal
                v-if="showReceiverModal"
                mode="수신자"
                :initial-approvers="receiverList"
                @submit-receivers="onReceiverSubmit"
                @close="showReceiverModal = false"
              />
            </td>
            <th scope="row">참조자</th>
            <td class="flex-row">
              <input v-model="form.reference" type="text" />
              <button class="button icon-button" @click="openReferenceModal">
                <img src="@/assets/icons/person-add.svg" alt="참조자 추가" class="icon-img" />
              </button>
              <!-- 참조자 모달 -->
              <SelectionModal
                v-if="showReferenceModal"
                mode="참조자"
                :initial-approvers="referenceList"
                @submit-ccs="onReferenceSubmit"
                @close="showReferenceModal = false"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 🔷 결재선 설정 버튼 -->
      <div class="approval-header">
        <span class="section-title">결재선</span>
        <button class="approval-button" @click="openApprovalModal">결재선 설정</button>
      </div>
      <hr class="section-divider" />

      <!-- 🔷 결재선 설정 모달 -->
      <SelectionModal
        v-if="showApprovalModal"
        :hierarchy="hierarchy || []"
        :initial-approvers="approvalLines"
        @submit="onApprovalLineSubmit"
        @close="showApprovalModal = false"
      />

      <!-- 🔷 결재자 테이블 출력 -->
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>성명</th>
            <th>팀명</th>
            <th>직급</th>
            <th>상태</th>
            <th>종류</th>
            <th>결재일시</th>
            <th>의견</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(line, index) in approvalLines" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ line.name }}</td>
            <td>{{ line.team }}</td>
            <td>{{ line.rankName }}</td>
            <td>{{ line.status }}</td>
            <td>{{ line.type }}</td>
            <td>{{ line.approvedAt }}</td>
            <td>{{ line.comment }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 🔷 제목 및 첨부파일 -->
    <div class="section-header">
      <div class="section-title">기안내용</div>
      <hr class="section-divider" />
      <table class="file-table">
        <tbody>
          <tr>
          <th scope="row">제목</th>
            <td colspan="2">
              <input type="text" v-model="form.title" class="full-width-input" />
            </td>
          </tr>
          <tr>
          <th scope="row">첨부파일</th>
            <td colspan="2">
              <!-- 🔷 첨부파일 등록 영역 -->
              <div class="file-input-row">
                <input type="file" @change="handleFileUpload" />
                <button class="button gray" @click="removeSelectedFiles">삭제</button>
                <button class="button" @click="addFile">추가</button>
              </div>
              <!-- 🔷 첨부파일 목록 -->
              <div class="file-list">
                <div v-for="(file, idx) in uploadedFiles" :key="idx" class="file-item">
                  <input type="checkbox" v-model="file.selected" />
                  {{ file.name }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- 🔷 첨부파일 유의사항 -->
      <ul class="file-info-text">
        <li>20MB 미만의 이미지 또는 문서 파일만 첨부 가능합니다. (최대 5개)</li>
        <li>개인정보가 포함된 문서는 주의해주세요 (주민번호 뒷자리 마스킹 필수)</li>
        <li>특수기호 또는 이모지 포함 시 문자가 깨질 수 있습니다.</li>
      </ul>

      <!-- 🔷 본문 작성 에디터 -->
      <div class="content-editor-section">
        <div class="editor-wrapper">
          <div class="editor-toolbar-row">
            <label class="editor-label">본문</label>
            <div id="custom-toolbar" />
          </div>
          <!-- 🔷 Quill 에디터 사용 -->
          <QuillEditor
            v-model:content="form.body"
            contentType="html"
            theme="snow"
            class="quill-editor-area"
          />
        </div>
      </div>
    </div>
  </div>

    <!-- 🔷 하단 버튼 (임시저장/상신하기) -->
    <div class="button-group">
      <button class="button gray" @click="handleCancel">취소</button>
      <button class="button" @click="showSubmitModal = true">상신</button>
    </div>
  </div>

  <!-- 🔷 모달 컴포넌트 영역 -->
  <!-- <DraftSaveModal
    v-if="showDraftSaveModal"
    @close="showDraftSaveModal = false"
    @submit="confirmDraftSave"
  /> -->
  <SubmitModal
    v-if="showSubmitModal"
    @close="showSubmitModal = false"
    @submit="confirmSubmit"
  />

<BaseToast ref="toastRef" />

</template>


<script setup>
import { QuillEditor } from '@vueup/vue-quill';
import { ref, reactive, onMounted } from 'vue';
import axios from "axios";
import SelectionModal from '@/components/eapproval/ApprovalLineModal.vue';
import SubmitModal from '@/components/eapproval/SubmitModal.vue';
import DraftSaveModal from '@/components/eapproval/DraftSaveModal.vue';
import BaseToast from '@/components/toast/BaseToast.vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router'  // 상단에 추가


const router = useRouter()              // setup() 안에서 선언
const userStore = useUserStore();
const toastRef = ref(null);
const showSubmitModal = ref(false);
const showReceiverModal = ref(false);
const showReferenceModal = ref(false);
const showApprovalModal = ref(false);
const showDraftSaveModal = ref(false);
const uploadedFiles = ref([]);
const fileInput = ref(null);
const fileError = ref('');
const approvalLines = ref([]);
const receiverList = ref([]);
const referenceList = ref([]);
const maxFileSize = 20 * 1024 * 1024;

const allowedTypes = [
  'application/pdf', 'image/png', 'image/jpeg', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/x-hwp', 'application/vnd.hancom.hwp', 'application/vnd.hancom.hwpx'
];

const form = reactive({
  departmentName: '',
  drafter: '',
  rankName: '',
  draftDate: '',
  retentionPeriod: '',
  receiver: '',
  reference: '',
  title: '',
  body: ''
});

function goBack() {
  router.back()
}

function showToast(msg) {
  toastRef.value?.show(msg);
}

function updateDraftDate(val) {
  form.draftDate = val;
}

async function loadDrafterInfo() {
  try {
    const res = await fetch("https://api.isddishr.site/drafter/me", {
    headers: { Authorization: `Bearer ${userStore.accessToken}`
      }
    });
    console.log("✅ 현재 accessToken:", userStore.accessToken);
    if (!res.ok) throw new Error("기안자 정보 조회 실패");
    const data = await res.json();
    form.departmentName = data.departmentName;
    form.drafter = data.name;
    form.rankName = data.rankName;
    await fetchAutoApprovalLine(data.empId);
  } catch (e) {
    console.error(e);
    alert(e.message);
  }
}

async function fetchAutoApprovalLine(empId) {
  try {
    const { data } = await axios.get("https://api.isddishr.site/approval-line", {
      params: { employeeId: empId },
      headers: { Authorization: `Bearer ${userStore.accessToken}` }
    });
    approvalLines.value = data.map((item, index) => ({
      step: index + 1,
      name: item.employeeName,
      employeeId: item.employeeId,
      rankName: item.rankName || '',
      role: item.role || '',
      team: item.teamName || '',
      status: '대기중',
      type: item.type,
      lineTypeLabel: item.lineTypeLabel || (item.lineType === 'ACTURE' ? '실제 결재선' : '양식 결재선'),
      approvedAt: null,
      comment: ''
    }));
  } catch (e) {
    console.error("자동 결재선 조회 실패", e);
  }
}

function openApprovalModal() { showApprovalModal.value = true; }
function openReceiverModal() { showReceiverModal.value = true; }
function openReferenceModal() { showReferenceModal.value = true; }

function onApprovalLineSubmit(lines) {
  approvalLines.value = lines;
  showApprovalModal.value = false;
}

function onReceiverSubmit(list) {
  receiverList.value = list;
  form.receiver = list.map(u => u.name || u.employeeName).join(', ');
  showReceiverModal.value = false;
}

function onReferenceSubmit(list) {
  referenceList.value = list;
  form.reference = list.map(u => u.name || u.employeeName).join(', ');
  showReferenceModal.value = false;
}

function handleFileUpload(e) {
  fileError.value = '';
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > maxFileSize) return fileError.value = '10MB 이하만 가능';
  if (!allowedTypes.includes(file.type)) return fileError.value = '허용되지 않는 형식';
  fileInput.value = file;
}

async function getUploadInfo(file) {
  const token = localStorage.getItem('token');
  const qs = new URLSearchParams({ filename: file.name, contentType: file.type }).toString();
  const res = await fetch(`https://api.isddishr.site/s3/upload-url?${qs}`, {
    headers: { Authorization: `Bearer ${userStore.accessToken}` }
  });
  if (!res.ok) throw new Error('Presign URL 요청 실패');
  return res.json();
}

async function uploadToS3(uploadUrl, file) {
  const res = await fetch(uploadUrl, {
    method: 'PUT', headers: { 'Content-Type': file.type }, body: file
  });
  if (!res.ok) throw new Error('S3 업로드 실패');
}

async function addFile() {
  const file = fileInput.value;
  if (!file) return;
  if (uploadedFiles.value.length >= 5) return showToast('최대 5개까지 업로드할 수 있습니다.');
  if (uploadedFiles.value.some(f => f.name === file.name && f.size === file.size)) {
    return showToast('이미 추가된 파일입니다.');
  }
  try {
    const { key, url } = await getUploadInfo(file);
    await uploadToS3(url, file);
    uploadedFiles.value.push({ name: file.name, size: file.size, type: file.type, key, selected: false });
    fileInput.value = null;
  } catch (e) {
    console.error(e);
    showToast('업로드 실패');
  }
}

function removeSelectedFiles() {
  uploadedFiles.value = uploadedFiles.value.filter(f => !f.selected);
}

async function confirmSubmit() {
  if (!form.retentionPeriod) return showToast('보존연한을 선택해주세요.');
  if (!form.title?.trim()) return showToast('제목을 입력해주세요.');
  if (!form.body?.trim() || form.body === '<p><br></p>') return showToast('본문 내용을 입력해주세요.');

  const submitData = {
    title: form.title,
    docContent: form.body,
    retentionPeriod: form.retentionPeriod,
    receivers: receiverList.value.map(u => u.employeeId),
    reference: referenceList.value.map(u => u.employeeId),
    formId: 1,
    approvalLines: approvalLines.value.map((line, index) => ({
      step: index + 1,
      employeeId: line.employeeId,
      position: line.position,
      rankName: line.rankName,
      type: line.type
    })),
    attachmentKeys: uploadedFiles.value.map(f => f.key),
    originalFileNames: uploadedFiles.value.map(f => f.name),
    fileTypes: uploadedFiles.value.map(f => f.type),
    fileSizes: uploadedFiles.value.map(f => f.size),
    contentDto: {
      receiver: receiverList.value.map(u => u.name),
      reference: referenceList.value.map(u => u.name)
    }
  };

  try {
    const res = await axios.post("https://api.isddishr.site/drafts/creation", submitData, {
      headers: { Authorization: `Bearer ${userStore.accessToken}` }
    });
    showToast('기안문이 상신되었습니다.');
    showSubmitModal.value = false;

    setTimeout(() => {
      router.push({ name: 'MyDraftBox' });
    }, 1000); // 1초 후 이동

} catch (e) {
    console.error("상신 실패", e);
    showToast("상신 실패: " + (e.response?.data?.message || e.message));
  }
}

function handleCancel() {
  window.history.back();
}

onMounted(() => {
  loadDrafterInfo();
  const now = new Date();
  form.draftDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
});
</script>

<style scoped>
/* ✅ 페이지 상단 제목 */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: var(--primary);
}

.back-btn {
  width: 24px;
  height: 24px;
  margin-right: -10px;
  cursor: pointer;
}

.desc {
    display: block;
    margin-bottom: 10px;
    margin-left: 20px;
    font-size: 18px;
  }

.section-header{
  margin-top: 50px;
}

/* ✅ 전체 페이지 초기화 및 높이 설정 */
body, html {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* 🔷 헤더(th)는 회색 배경 */
table thead th {
  background-color: var(--grid-head) !important;
  font-weight: bold;
  color: var(--text-main);
}

/* 🔷 본문(td)는 흰 배경 */
table tbody td {
  background-color: var(--bg-box) !important;
  font-weight: normal;
  color: var(--text-main);
}

/* ✅전체 화면 스크롤 영역 (사용하지 않음) */
.full-scroll {
  height: 100vh;
  overflow-y: auto;
  /* background-color: #f8fafd; */
}

/* ✅ 메인 박스: 전체 레이아웃 래퍼 */
.main-box {
  background-color: var(--bg-box);
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 1px 1px 20px 1px rgba(0,0,0,0.05);
  margin: 24px;
  width: 100%;
  max-width: 1475px;
  display: flex;
  flex-direction: column;
  min-height: fit-content;
  overflow: visible;
  color: var(--text-main);
}

/* ✅ 내부 컨텐츠 컨테이너 */
.container {
  min-width: 850px;
  max-width: 1200px;
  margin: 20px auto;
  table-layout: fixed;
}

.container th[scope="row"] {
  background-color: var(--grid-head);
  font-weight: 600;
  text-align: left;
  padding: 10px;
  width: 120px;
  white-space: nowrap;
  color: var(--text-main);
}

/* ✅ 에디터 전체 영역 정렬 */
.editor-wrapper {
  background: #f8f9fa;
  border: 1px solid #e3e6ea;
  padding: 0;
  margin-top: 12px;
  min-height: 400px;
}

/* ✅ 에디터 상단 툴바 정렬 (라벨 + 툴바) */
.editor-toolbar-row {
  display: flex;
  flex-direction: column;        /* 라벨과 툴바가 위아래 정렬되는 경우 */
  padding: 0;
  margin: 0;
  border: none;
  gap: 0;
}

/* ✅ 에디터 라벨 (본문) */
.editor-label {
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  background-color: var(--bg-box);
  border: 1px solid #ccc;
  color: var(--text-main);
}
/* ✅ 툴바 영역 (커스텀 툴바 오른쪽 정렬) */
#custom-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
}
 /* ✅ Quill 에디터 입력창 스타일 */
::v-deep(.quill-editor-area .ql-container.ql-snow) {
  min-height: 300px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px;
  background: #fff;
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
} 
/* Quill 에디터 외곽 회색 선 제거 */
::v-deep(.quill-editor-area .ql-container.ql-snow) {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
/* 에디터 내부 여백 제거 */
::v-deep(.quill-editor-area .ql-editor) {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
/* ✅ Quill 테이블 스타일 커스터마이징 */
::v-deep(.quill-editor-area .ql-editor table) {
  width: 100%;
  border-collapse: collapse;
}
::v-deep(.quill-editor-area .ql-editor table td),
::v-deep(.quill-editor-area .ql-editor table th) {
  border: 1px solid #ccc;
  padding: 6px 10px;
  text-align: center;
  background-color: #fff;
}
::v-deep(.quill-editor-area .ql-editor table th) {
  background-color: #f0f0f0;
  font-weight: bold;
}

/* ✅ 제목 영역 구분선 */
.bold-divider {
  height: 2px;
  background-color: #dddddd;
  border: none;
  margin: 16px 0;
}

/* 이하 동일 (생략된 스타일 변경 없음) */
.file-input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.custom-file-label {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  cursor: pointer;
  position: relative;
  font-size: 14px;
  color: #555;
}

.hidden-file-input {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-button-group {
  justify-content: flex-end; /* 🔧 오른쪽 정렬 */
  display: flex;
  gap: 8px;
}

.section-divider {
  width: 100%;
  margin: 12px 0 24px 0;
  box-sizing: border-box;
  border: none;
  border-top: 2px solid #ccc;
}

/* 결재선 설정 버튼 */
.approval-button {
  font-size: 14px;
  font-weight: bold;
  background-color: var(--primary);
  color: var(--text-on-primary, #fff);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 15px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  margin-top: 0px;
  margin-bottom: 5px;
}

.approval-button:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

h2 {
  text-align: center;
  margin-bottom: 18px;
}

hr {
  text-align: center;
  margin-bottom: 18px;
  border: 1px solid #ccc;
}

th {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
  background-color: #f8f9fa;
}

table {
  table-layout: fixed;
  border-collapse: collapse;
  margin-bottom: 16px;
}


table td:nth-child(odd) {
  background-color: #f8f9fa;
}

table td:nth-child(even) {
  background-color: #ffffff;
}

.flex-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title {
  font-weight: bold;
  margin-top: 0px;
  margin-bottom: 0px;
}

input[type="text"],
input[type="date"],
input[type="file"],
select,
textarea {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
  border-radius: 8px;
  transition: border 0.2s ease;
  height: 36px; /* ✅ 추가된 높이 조정 */
  font-size: 14px; /* ✅ 추가된 글자 크기 조정 */
  font-family : 'inherit';
  line-height: 1.5; /* ✅ 라인 정렬 */
  background: var(--bg-box);
  color: var(--text-main);
}

/* input:focus,
select:focus,
textarea:focus {
  outline: none;
  border: 1px solid #e0e0e0;
} */

textarea {
  height: 200px;
}

.button {
  font-size: 14px;
  white-space: nowrap;
  font-weight: bold;
  background-color: var(--primary);
  color: var(--text-on-primary, #fff);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.button.gray {
  font-size: 14px;
  font-weight: bold;
  background-color: #D3D3D3;
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

.button:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.button.gray:hover {
  background-color: #000;
  color: #fff;
}

.icon-button {
  background-color: var(--primary);
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.icon-button .icon-img {
  width: 30px;
  height: 15px;
  transition: filter 0.3s ease;
}

.icon-button:hover {
  background-color: var(--bg-main);
}

.icon-button:hover .icon-img {
  filter: invert(39%) sepia(99%) saturate(746%) hue-rotate(165deg) brightness(91%) contrast(101%);
}

.file-section {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.file-list {
  margin-top: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.file-info-text li {
  margin-bottom: 2px;
}
.file-info-text {
  color: var(--modal-text);/* 어두운 회색 */
  font-size: 14px;
  line-height: 1.6;
  padding-left: 20px;
  margin-bottom: 30px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
  margin-top: 30px;
  margin-left: auto;
  margin-right: 100px;
}

.approval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 50px;
  margin-bottom: 10px;
}

.scrollable-box {
  max-height: 300px;
  /* overflow-y: auto; */
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 20px;
  background-color: #fafafa;
}

/* 에디터 전체 박스 */
.editor-wrapper {
  border: 1px solid var(--ag-row-border-color);
  background: var(--bg-box);
  padding: 0;
  margin-top: 12px;
  min-height: 400px;
}

/* 본문 입력창 */
::v-deep(.quill-editor-area .ql-container.ql-snow) {
  border: none;
  min-height: 350px;
  background: var(--bg-box);
  font-size: 15px;
  line-height: 1.7;
  padding: 0 8px 8px 8px;
  font-family: inherit;
  color: var(--text-main);
}

/* 에디터 내부 텍스트 여백 */
::v-deep(.quill-editor-area .ql-editor) {
  padding: 12px 8px;
  min-height: 320px;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-main);
  background: var(--bg-box);
}

.editor-label {
  font-size: 15px;               /* 글자 크기 */
  font-weight: bold;             /* 글자 굵게 */
  white-space: nowrap;           /* 줄바꿈 없이 한 줄로 표시 */
  background-color: var(--bg-box);     /* 파란 배경 색 */
  text-align: center;            /* 텍스트 가운데 정렬 */
  display: flex;                 /* Flexbox 사용 */
  align-items: center;           /* 수직 가운데 정렬 */
  justify-content: center;       /* 수평 가운데 정렬 */
  width: 100%;                   /* 부모 영역 기준 전체 너비 */
  height: 38px;                  /* 부모 영역 기준 전체 높이 */
  margin: 0;                     /* 바깥 여백 제거 */
  padding: 0;                    /* 안쪽 여백 제거 */
  border: none;                  /* 외곽선 제거 */
  border-radius: 0;              /* 둥근 모서리 제거 */
}

.hidden-input {
  display: none;
}

/* ==== 표 스타일: 헤더는 굵게, 본문은 일반체 ==== */
.info-table th,
.info-table td {
  height: 55px; /* 고정 높이 설정 */
  vertical-align: middle; /* 내용 수직 가운데 정렬 */
  padding: 8px; /* 기존 패딩 유지 */
  border-radius: 0;              /* 둥근 모서리 제거 */

}
.info-table .flex-row {
  height: 100%;
  display: flex;
  align-items: center; /* 내부 요소 수직 가운데 정렬 */
  border-radius: 0;              /* 둥근 모서리 제거 */
}

.info-table input[type="text"],
.info-table select {
  height: 38px; /* input과 select의 높이를 td 높이에 맞게 조정 */
  box-sizing: border-box;
  border-radius: 0;              /* 둥근 모서리 제거 */
  font-family: inherit;
}

/* 기존 테이블 스타일 */
th {
  font-weight: 600;
  background: var(--grid-head);
  border: 1px solid var(--ag-row-border-color);
  padding: 8px;
  text-align: left;
  color: var(--text-main);
}

td {
  font-weight: normal;
  border: 1px solid var(--ag-row-border-color);
  padding: 8px;
  text-align: left;
  white-space: normal;    /* ✅ 줄바꿈 허용 */
  word-break: break-word; /* ✅ 단어 중간이라도 줄바꿈 */
  color: var(--text-main);
  background: var(--bg-box);
  border-radius: 0;              /* 둥근 모서리 제거 */

}

/* 테이블 공통 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

/* Quill Editor의 최소 높이 설정 */
.quill-editor-area {
  min-height: 200px; /* QuillEditor 컴포넌트 자체의 최소 높이 */
  /* overflow: hidden; 이 속성은 이제 필요하지 않거나 다른 곳으로 이동 */
}

/* Quill Editor의 본문 입력 영역 (ql-editor) 스타일 */
.quill-editor-area ::v-deep(.ql-editor) {
  min-height: 200px; /* 본문 영역의 최소 높이 */
  height: 300px; /* 본문 영역의 고정 높이 */
  max-height: 300px; /* 본문 영역의 최대 높이 (고정 높이와 동일하게) */
  overflow-y: auto; /* 내용 초과 시 수직 스크롤바 생성 */
  box-sizing: border-box;
  padding: 12px; /* 에디터 내부 여백 */
}

/* Quill Editor의 컨테이너 (ql-container) 스타일 */
.quill-editor-area ::v-deep(.ql-container) {
  /* height, overflow-y 설정은 ql-editor로 이동 */
  border: 1px solid #e3e6ea; /* 컨테이너 테두리 */
  box-sizing: border-box;
}

/* Quill Editor의 툴바 (ql-toolbar) 스타일 */
.quill-editor-area ::v-deep(.ql-toolbar) {
  border: 1px solid #e3e6ea; /* 툴바 테두리 */
  border-bottom: none; /* 툴바 하단 테두리는 컨테이너와 겹치지 않도록 제거 */
}

body[data-theme='dark'] ::v-deep(td),
body[data-theme='dark'] ::v-deep(th) {
  border-radius: 0 !important;
}

/* ===================== 공통 테이블 스타일 ===================== */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  table-layout: fixed;
}
th, td {
  border: 1px solid var(--ag-row-border-color, #e3e6ea);
  padding: 8px;
  font-size: 14px;
  text-align: left;
  word-break: break-word;
}
th {
  font-weight: 600;
  background: var(--grid-head, #f8f9fa);
  color: var(--text-main, #222);
}
td {
  font-weight: normal;
  color: var(--text-main, #222);
  background: var(--bg-box, #fff);
  white-space: normal;
}
.container th[scope="row"] {
  width: 120px;
  white-space: nowrap;
  padding: 10px;
}

body[data-theme='dark'] ::v-deep(td),
body[data-theme='dark'] ::v-deep(th) {
  border-radius: 0 !important;
}

/* ===================== 버튼 스타일 ===================== */
.button, .approval-button {
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  border-radius: 10px;
  border: 1px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s, color 0.2s, border-color 0.2s;
  cursor: pointer;
  padding: 10px 30px;
  background-color: var(--primary);
  color: var(--text-on-primary, #fff);
}
.button.gray {
  background-color: #D3D3D3;
  color: #000;
  border: none;
}
.button:hover, .approval-button:hover {
  background-color: var(--bg-main, #fff);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
.button.gray:hover {
  background-color: #000;
  color: #fff;
}

.icon-button {
  background-color: var(--primary);
  padding: 6px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}
.icon-button:hover {
  background-color: var(--bg-main, #fff);
}
.icon-button .icon-img {
  width: 30px;
  height: 15px;
  transition: filter 0.3s ease;
}
.icon-button:hover .icon-img {
  filter: invert(39%) sepia(99%) saturate(746%) hue-rotate(165deg) brightness(91%) contrast(101%);
}

/* ===================== 입력란 스타일 ===================== */
input[type="text"],
input[type="date"],
input[type="file"],
select,
textarea {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 8px;
  height: 36px;
  font-size: 14px;
  line-height: 1.5;
  background: var(--bg-box, #fff);
  color: var(--text-main, #222);
  transition: border 0.2s ease;
}


/* ===================== 에디터/본문 ===================== */
.editor-wrapper {
  background: #f8f9fa;
  border: 1px solid #e3e6ea;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin-top: 12px;
  min-height: 400px;
}
body[data-theme='dark'] ::v-deep(.editor-wrapper) {
  border: 2px solid #fff !important;
}

::v-deep(.quill-editor-area .ql-container.ql-snow) {
  min-height: 300px;
  border: none;
  border-radius: 0;
  padding: 8px;
  background: var(--bg-box, #fff);
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
  color: var(--text-main, #222);
}
::v-deep(.quill-editor-area .ql-editor) {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
  padding: 12px 8px;
  min-height: 320px;
  font-family: 'Arial', sans-serif;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-main, #222);
  background: var(--bg-box, #fff);
}

body[data-theme='dark'] ::v-deep(.quill-editor-area .ql-toolbar.ql-snow button),
body[data-theme='dark'] ::v-deep(.quill-editor-area .ql-toolbar.ql-snow .ql-picker-label),
body[data-theme='dark'] ::v-deep(.quill-editor-area .ql-toolbar.ql-snow .ql-picker-item),
body[data-theme='dark'] ::v-deep(.quill-editor-area .ql-toolbar.ql-snow .ql-stroke),
body[data-theme='dark'] ::v-deep(.quill-editor-area .ql-toolbar.ql-snow .ql-fill),
body[data-theme='dark'] ::v-deep(.quill-editor-area .ql-toolbar.ql-snow .ql-picker),
body[data-theme='dark'] ::v-deep(.quill-editor-area .ql-toolbar.ql-snow .ql-picker-options) {
  color: #fff !important;
  stroke: #fff !important;
  fill: #fff !important;
  border-color: #fff !important;
}

/* ===================== 기타/섹션 구분 ===================== */
.section-header {
  margin-top: 50px;
}
.bold-divider {
  height: 2px;
  background-color: #dddddd;
  border: none;
  margin: 16px 0;
}
.section-divider {
  width: 100%;
  margin: 12px 0 24px 0;
  box-sizing: border-box;
  border: none;
  border-top: 2px solid #ccc;
}

/* ... 나머지 스타일(레이아웃, 파일, flex 등)은 기존대로 유지 ... */
/* 에디터 툴바/본문 배경 반전 */
::v-deep(.quill-editor-area .ql-toolbar.ql-snow) {
  background: #f8f9fa;
}
::v-deep(.quill-editor-area .ql-container.ql-snow) {
  background: #fff;
}
body[data-theme='dark'] ::v-deep(.quill-editor-area .ql-toolbar.ql-snow) {
  background: var(--bg-main);
}
body[data-theme='dark'] ::v-deep(.quill-editor-area .ql-container.ql-snow) {
  background: var(--bg-box);
}
</style>