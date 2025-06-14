<!-- 전자결재 > 기안작성 > (일반기안양식) -->
<template>
  <!-- ◆ 페이지 제목 -->
  <h1 class="page-title">기안작성</h1>
  <p class="desc">업무 기안 작성</p>
  <!-- ◆ 전체 레이아웃 박스: 페이지 중앙의 메인 컨테이너 -->
  <div class="main-box">
    <!-- ◆ 내부 컨텐츠 박스: 실제 폼이 들어갈 영역 -->
    <div class="container">
      <!-- 업무 기안 섹션 제목 -->
      <h2>업무 기안</h2>
      <!-- 굵은 구분선 -->
      <hr class="bold-divider" />
      <!-- ◆ 기본 정보 입력 테이블 (부서, 직책, 기안자 등) -->
      <table>
        <tbody>
          <tr>
            <td>기안부서</td>
            <td><input v-model="form.department" type="text" /></td>
            <td>직책</td>
            <td><input v-model="form.position" type="text" /></td>
          </tr>
          <tr>
            <td>기안자</td>
            <td><input v-model="form.drafter" type="text" /></td>
            <td>기안일자</td>
            <!-- 화면에는 날짜만 보여주기 -->
            <td>
              <input
                type="text"
                :value="form.draftDate"
                @input="updateDraftDate($event.target.value)"
                placeholder="YYYY-MM-DD"
                readonly
              />
              <!-- 실제 저장용 (숨김 또는 v-if) -->
              <input
                type="datetime-local"
                v-model="form.draftDate"
                class="hidden-input"
              />
            </td>
          </tr>
          <tr>
            <td>문서번호</td>
            <td>-</td>
            <td>보존연한</td>
            <td>
              <select v-model.number="form.retentionPeriod">
                <option :value="1">1년</option>
                <option :value="3">3년</option>
                <option :value="5">5년</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>수신자</td>
            <td class="flex-row">
              <input v-model="form.receiver" type="text" />
              <button class="button icon-button" @click="openReceiverModal">
                <img src="@/assets/icons/person-add.svg" alt="수신자 추가" class="icon-img" />
              </button>
              <SelectionModal
                v-if="showReceiverModal"
                mode="수신자"
                :defaultList="receiverList"
                @submit="onReceiverSubmit"
                @close="showReceiverModal = false"
              />
            </td>
            <td>참조자</td>
            <td class="flex-row">
              <input v-model="form.reference" type="text" />
              <button class="button icon-button" @click="openReferenceModal">
                <img src="@/assets/icons/person-add.svg" alt="참조자 추가" class="icon-img" />
              </button>
              <SelectionModal
                v-if="showReferenceModal"
                mode="참조자"
                :defaultList="referenceList"
                @submit="onReferenceSubmit"
                @close="showReferenceModal = false"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <!-- ◆ 결재선 설정 영역: 설정 버튼 -->
      <div class="approval-header">
        <span class="section-title">결재선</span>
        <button class="approval-button" @click="openApprovalModal">결재선 설정</button>
      </div>
      <hr class="section-divider" />
      <!-- 결재선 설정 모달 -->
      <SelectionModal
        v-if="showApprovalModal"
        :hierarchy="hierarchy || []"
        :initial-approvers="approvalLines"
        @submit="onApprovalLineSubmit"
        @close="showApprovalModal = false"
      />
      <!-- ◆ 결재자 목록 테이블 -->
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>성명</th>
            <th>팀명</th>
            <th>직책</th>
            <th>상태</th>
            <th>종류</th>
            <th>열람일시</th>
            <th>결재일시</th>
            <th>의견</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(line, index) in approvalLines" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ line.name }}</td>
            <td>{{ line.team }}</td>
            <td>{{ line.position }}</td>
            <td>{{ line.status }}</td>
            <td>{{ line.type }}</td>
            <td>{{ line.viewedAt }}</td>
            <td>{{ line.approvedAt }}</td>
            <td>{{ line.comment }}</td>
          </tr>
        </tbody>
      </table>
      <!-- ◆ 기안 내용 작성 영역 -->
      <div class="section-title">기안내용</div>
      <hr class="section-divider" />
      <!-- 제목, 첨부파일 테이블 -->
      <table class="file-table">
        <tbody>
          <tr>
            <td class="label-cell"><strong>제&nbsp;&nbsp;&nbsp;목</strong></td>
            <td colspan="2">
              <input type="text" v-model="form.title" class="full-width-input" />
            </td>
          </tr>
          <tr>
            <td class="label-cell"><strong>첨부파일</strong></td>
            <td colspan="2">
              <div class="file-input-row">
                <input type="file" @change="handleFileUpload" />
                <button class="button" @click="addFile">추가</button>
                <button class="button gray" @click="removeSelectedFiles">삭제</button>
              </div>
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
      <ul class="file-info-text">
        <li>20MB 미만의 이미지 또는 문서 파일만 첨부 가능합니다. (최대 5개)</li>
        <li>개인정보가 포함된 문서는 주의해주세요 (주민번호 뒷자리 마스킹 필수)</li>
        <li>특수기호 또는 이모지 포함 시 문자가 깨질 수 있습니다.</li>
      </ul>
      <!-- ◆ 본문 에디터 (Quill 사용) 영역 -->
      <table class="content-table">
        <div class="editor-wrapper">
          <div class="editor-toolbar-row">
            <label class="editor-label">본문</label>
            <div id="custom-toolbar" />
          </div>
          <QuillEditor
            v-model:content="form.body"
            contentType="html"
            theme="snow"
            :modules="quillModules"
            class="quill-editor-area"
          />
        </div>
      </table>
    </div>
  </div>
  <div class="button-group">
    <button class="button gray" @click="showDraftSaveModal = true">임시저장</button>
    <button class="button" @click="showSubmitModal = true">상신하기</button>
  </div>
  <DraftSaveModal
    v-if="showDraftSaveModal"
    @close="showDraftSaveModal = false"
    @submit="confirmDraftSave"
  />
  <SubmitModal
    v-if="showSubmitModal"
    @close="showSubmitModal = false"
    @submit="confirmSubmit"
  />
</template>

<script>
import { QuillEditor } from '@vueup/vue-quill';
import { ref, reactive } from 'vue'
import axios from "axios";
import SelectionModal from '@/components/eapproval/ApprovalLineModal.vue';
import SubmitModal from '@/components/eapproval/SubmitModal.vue';
import DraftSaveModal from '@/components/eapproval/DraftSaveModal.vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore()

async function getUploadInfo(file) {
  const token = localStorage.getItem('token')
  const qs = new URLSearchParams({ filename: file.name, contentType: file.type }).toString()
  const res = await fetch(`http://localhost:8000/s3/upload-url?${qs}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Presign URL 요청 실패')
  return res.json()
}

async function uploadToS3(uploadUrl, file) {
  const res = await fetch(uploadUrl, {
    method: 'PUT', headers: { 'Content-Type': file.type }, body: file
  })
  if (!res.ok) throw new Error('S3 업로드 실패')
}

export default {
  name: "CreateDraftPreview",
  components: {
    SelectionModal,
    QuillEditor,
    SubmitModal,
    DraftSaveModal
  },
  data() {
    return {
      form: {
        department: "",
        position: "",
        drafter: "",
        draftDate: "",
        retentionPeriod: "",
        receiver: "",
        reference: "",
        title: "",
        body: "",
      },
      approvalLines: [],
      receiverList: [],
      referenceList: [],
      uploadedFiles: [],
      fileInput: null,
      fileError: "",
      maxFileSize: 10 * 1024 * 1024,
      allowedTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ],
      showApprovalModal: false,
      showReceiverModal: false,
      showReferenceModal: false,
      showSubmitModal: false,
      showDraftSaveModal: false
    };
  },
  mounted() {
    this.loadDrafterInfo();
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    this.form.draftDate = `${yyyy}-${mm}-${dd}`; // datetime-local 초기값
    },
    formattedDraftDate() {
    return this.form.draftDate?.slice(0, 10) || '';
  },
  methods: {
    async loadDrafterInfo() {
      try {
        const res = await fetch("http://localhost:8000/drafter/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (!res.ok) {
          console.error("\u274C 서버 응답 상태:", res.status);
          throw new Error("기안자 정보 조회 실패");
        }
        const data = await res.json();
        console.log("\u2705 기안자 정보:", data);
        this.form.department = data.department;
        this.form.drafter = data.name;
        this.form.position = data.position;
        await this.fetchAutoApprovalLine(data.employeeId);
      } catch (e) {
        console.error("\u274C loadDrafterInfo 오류:", e);
        alert(e.message);
      }
    },
    updateDraftDate(val) {
      this.form.draftDate = val;
    },


    async fetchAutoApprovalLine(employeeId) {
      try {
        const response = await axios.get("http://localhost:8000/approval-line", {
          params: { employeeId, formId: 1 },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        this.approvalLines = response.data.flatMap(step =>
          step.approverList.map(approver => {
            const lineType = approver.lineType || "ACTUAL";
            // ★ stepNo 가 1 이면 '기안', 아니면 기존 INTERNAL/EXTERNAL 구분
            const typeLabel = step.stepNo === 1
              ? "기안"
              : (approver.type === "INTERNAL" ? "결재" : approver.typeLabel || "");

            const lineTypeLabel = lineType === "ACTUAL"
              ? "실제 결재선"
              : "양식 결재선";

            return {
              step:          step.stepNo,
              name:          approver.employeeName,
              employeeId:    approver.employeeId,
              position:      approver.positionName,
              team:          approver.teamName || "",
              status:        "대기중",
              type:          typeLabel,      // ← 여기서 기안/결재 구분
              lineTypeLabel,                // ← 실제/양식 결재선
              viewedAt:      null,
              approvedAt:    null,
              comment:       ""
            };
          })
        );

        console.log("📋 화면에 출력될 결재선:", this.approvalLines);

      } catch (error) {
        console.error("❌ 자동 결재선 조회 실패:", error);
      }




    },
    openApprovalModal() { this.showApprovalModal = true; },
    openReceiverModal() { this.showReceiverModal = true; },
    openReferenceModal() { this.showReferenceModal = true; },
    onApprovalLineSubmit(lines) {
      console.log('🟢 수신된 커스텀 결재선:', lines);
      this.approvalLines = lines;
      this.showApprovalModal = false;
    },
    onReceiverSubmit(list) {
      this.receiverList = list;
      this.showReceiverModal = false;
      this.form.receiver = list.map(u => u.name).join(', ');
    },
    onReferenceSubmit(list) {
      this.referenceList = list;
      this.showReferenceModal = false;
      this.form.reference = list.map(u => u.name).join(', ');
    },
     handleFileUpload(e) {
      this.fileError = ''
      const file = e.target.files[0]
      if (!file) return
      if (file.size > this.maxFileSize) { this.fileError='10MB 이하만 가능'; return }
      if (!this.allowedTypes.includes(file.type)) { this.fileError='허용되지 않는 형식'; return }
      this.fileInput = file
    },
    async addFile() {
      if (!this.fileInput) return
      const file = this.fileInput
      if (this.uploadedFiles.some(f=>f.name===file.name&&f.size===file.size)) { this.fileError='이미 추가됨'; return }
      try {
        const { key, url } = await getUploadInfo(file)
        await uploadToS3(url, file)
        this.uploadedFiles.push({ name:file.name, size:file.size, type:file.type, key, selected:false })
        this.fileInput = null
      } catch(e){ console.error(e); this.fileError='업로드 실패' }
    },
    removeSelectedFiles(){ 
      this.uploadedFiles=this.uploadedFiles.filter(f=>!f.selected) 
    },
   

    async confirmDraftSave() {
      const now = new Date();
      const draftData = {
        form: { ...this.form },
        approvalLines: [...this.approvalLines],
        receiverList: [...this.receiverList],
        referenceList: [...this.referenceList],
        uploadedFiles: [...this.uploadedFiles],
        savedAt: now.toISOString(),
      };
      try {
        await axios.post("/drafts/temp", draftData);
        alert("임시저장 완료! 임시저장함에서 확인하세요.");
      } catch (error) {
        alert("임시저장 실패: " + (error.response?.data?.message || error.message));
      }
    },
    async confirmSubmit() {
      const now = new Date();
      const submitData = {
        title: this.form.title,
        docContent: this.form.body,
        retentionPeriod: this.form.retentionPeriod,
        receiver: this.receiverList.map(u => u.id),
        reference: this.referenceList.map(u => u.id),
        formId: 1,
        approvalLines: this.approvalLines.map((line, index) => ({
          step: index + 1,
          employeeId: line.employeeId,
          position: line.position,
          type: line.type,
        }))
      };
       console.log("상신 데이터", JSON.stringify(submitData, null, 2));
      try {
        const res = await axios.post("http://localhost:8000/drafts/creation", submitData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const { docId } = res.data;
        alert(`상신 완료! 문서번호: ${docId}`);
        this.showSubmitModal = false;
        this.$router.push(`/drafts/${docId}`);
      } catch (error) {
        console.error("상신 실패", error);
        alert("상신 실패: " + (error.response?.data?.message || error.message));
      }
    },
    handleFileUpload(event) {
      this.fileError = "";
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > this.maxFileSize) {
        this.fileError = "첨부파일은 10MB 이하만 가능합니다.";
        return;
      }
      if (!this.allowedTypes.includes(file.type)) {
        this.fileError = "허용되지 않는 파일 형식입니다.";
        return;
      }
      this.fileInput = file;
    },
    addFile() {
      if (this.fileInput) {
        const isDuplicate = this.uploadedFiles.some(
          f => f.name === this.fileInput.name && f.size === this.fileInput.size
        );
        if (isDuplicate) {
          this.fileError = "이미 추가된 파일입니다.";
          return;
        }
        this.uploadedFiles.push({
          name: this.fileInput.name,
          size: this.fileInput.size,
          type: this.fileInput.type,
          selected: false,
        });
        this.fileInput = null;
        this.fileError = "";
      }
    },
    removeSelectedFiles() {
      this.uploadedFiles = this.uploadedFiles.filter(file => !file.selected);
    },
  },
};
</script>


<style scoped>
/* ✅ 페이지 상단 제목 */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
}

.desc {
    display: block;
    margin-left: 20px;
    margin-bottom: 10px;
    font-size: 18px;
  }

/* ✅ 전체 페이지 초기화 및 높이 설정 */
body, html {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* ✅ 전체 화면 스크롤 영역 (사용하지 않음) */
.full-scroll {
  height: 100vh;
  overflow-y: auto;
  /* background-color: #f8fafd; */
}

/* ✅ 메인 박스: 전체 레이아웃 래퍼 */
.main-box {
  max-width: 1500px;
  margin: 20px auto;
  background: #fff;
  padding: 18px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

/* ✅ 내부 컨텐츠 컨테이너 */
.container {
  font-family: Arial, sans-serif;
  max-width: 1350px;
  margin: 20px auto;
}

/* ✅ 에디터 전체 영역 정렬 */
.editor-wrapper {
  display: flex;
  flex-direction: column;
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
  background: #0070e0;
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
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 15px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  margin-top: 80px;
  margin-bottom: 5px;
}

.approval-button:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
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
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;

  font-size: 14px;
  font-weight: bold;
}

table td:nth-child(odd) {
  background-color: #f8f9fa;
  border-radius: 8px;
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
  margin-top: 60px;
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
  border: 1px solid #ccc;
  border-radius: 8px;
  transition: border 0.2s ease;
  height: 36px; /* ✅ 추가된 높이 조정 */
  font-size: 14px; /* ✅ 추가된 글자 크기 조정 */
  line-height: 1.5; /* ✅ 라인 정렬 */
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border: 1px solid #000;
}

textarea {
  height: 200px;
}

.button {
  font-size: 14px;
  white-space: nowrap;
  font-weight: bold;
  background-color: #00a8e8;
  color: white;
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
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.button.gray:hover {
  background-color: #000;
  color: #fff;
}

.icon-button {
  background-color: #00a8e8;
  border: none;
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
  background-color: #ffffff;
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

.file-info-text {
  color: #555; /* 어두운 회색 */
  font-size: 14px;
  line-height: 1.6;
  padding-left: 20px;
  margin-bottom: 30px;
}

.file-info-text li {
  margin-bottom: 2px;

}

.button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.approval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
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
  border: 1px solid #ccc;
  background: #ffffff;
  padding: 0;
  margin-top: 12px;
  min-height: 400px;
}

/* 본문 입력창 */
::v-deep(.quill-editor-area .ql-container.ql-snow) {
  border: none;
  min-height: 350px;
  background: #ffffff;
  font-size: 15px;
  line-height: 1.7;
  padding: 0 8px 8px 8px;
}

/* 에디터 내부 텍스트 여백 */
::v-deep(.quill-editor-area .ql-editor) {
  padding: 12px 8px;
  min-height: 320px;
  font-family: 'Arial', sans-serif;
  font-size: 15px;
  line-height: 1.7;
}

.editor-label {
  font-size: 15px;               /* 글자 크기 */
  font-weight: bold;             /* 글자 굵게 */
  white-space: nowrap;           /* 줄바꿈 없이 한 줄로 표시 */
  background-color: #f8f9fa;     /* 파란 배경 색 */
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
</style>
