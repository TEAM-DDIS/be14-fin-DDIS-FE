<!-- 전자결재 > 기안작성 > (외근신청서) -->

<template>
    <h1 class="page-title">기안작성</h1>
    <p class="desc">외근신청서 작성</p>
  
    <div class="main-box">
      <div class="container">
        <h2>외근신청서</h2>
        <hr class="bold-divider" />
        <table>
          <tbody>
            <tr>
              <td>기안부서</td>
              <td><input v-model="form.departmentName" type="text" readonly /></td>
              <td>직급</td>
              <td><input v-model="form.rankName" type="text" readonly /></td>
            </tr>
            <tr>
              <td>기안자</td>
              <td><input v-model="form.drafter" type="text" readonly /></td>
              <td>기안일자</td>
              <td>
                <input
                  type="text"
                  :value="form.draftDate"
                  @input="updateDraftDate($event.target.value)"
                  placeholder="YYYY-MM-DD"
                  readonly
                />
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
                  :initial-approvers="receiverList"
                  @submit-receivers="onReceiverSubmit"
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
                  :initial-approvers="referenceList"
                  @submit-reference="onReferenceSubmit"
                  @close="showReferenceModal = false"
                />
              </td>
            </tr>
          </tbody>
        </table>
  
        <div class="approval-header">
          <span class="section-title">결재선</span>
          <button class="approval-button" @click="openApprovalModal">결재선 설정</button>
        </div>
        <hr class="section-divider" />
  
        <SelectionModal
          v-if="showApprovalModal"
          :hierarchy="hierarchy || []"
          :initial-approvers="approvalLines"
          @submit="onApprovalLineSubmit"
          @close="showApprovalModal = false"
        />
  
        <table class="line-table">
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
  
        <div class="section-title">기안내용</div>
        <hr class="section-divider" />
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
                  <button class="button gray" @click="removeSelectedFiles">삭제</button>
                  <button class="button" @click="addFile">추가</button>
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
  
        <div class="content-editor-section">
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
        </div>
  
        <div class="section-title" style="background-color: yellow; border: 2px solid red; padding: 10px;">외근자</div>
        <hr class="section-divider" />
        <table class="info-table" style="background-color: lightblue; border: 2px solid blue;">
          <tbody>
            <tr>
              <th>외근자</th>
              <td><input v-model="form.offsiteWorker" type="text" /></td>
              <th>소속 팀</th>
              <td><input v-model="form.offsiteTeam" type="text" /></td>
            </tr>
            <tr>
              <th>직급</th>
              <td><input v-model="form.offsitePosition" type="text" /></td>
              <th>성명</th>
              <td><input v-model="form.offsiteName" type="text" /></td>
            </tr>
            <tr>
              <th>외근적용일시</th>
              <td><input v-model="form.offsiteDate" type="date" /></td>
              <th>행선지</th>
              <td><input v-model="form.destination" type="text" /></td>
            </tr>
            <tr>
              <th>외근목적</th>
              <td colspan="3"><input v-model="form.offsitePurpose" type="text" /></td>
            </tr>
          </tbody>
        </table>
  
        <div class="section-title">업무내용</div>
        <hr class="section-divider" />
        <table class="info-table">
          <tbody>
            <tr>
              <td>
                <textarea v-model="form.workDetails" placeholder="업무 내용을 작성하세요..."></textarea>
              </td>
            </tr>
          </tbody>
        </table>
  
        <div class="section-title">비고</div>
        <hr class="section-divider" />
        <table class="info-table">
          <tbody>
            <tr>
              <td>
                <input v-model="form.notes" type="text" placeholder="비고 사항을 입력하세요..." />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <div class="button-group">
        <button class="button gray" @click="showDraftSaveModal = true">임시저장</button>
        <button class="button" @click="showSubmitModal = true">상신하기</button>
      </div>
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
  import { ref, reactive, watch, onBeforeMount } from 'vue'
  import debounce from 'lodash-es/debounce'
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
    name: "DraftFormB",
    components: {
      SelectionModal,
      QuillEditor,
      SubmitModal,
      DraftSaveModal
    },
    data() {
      return {
        form: {
          departmentName: "",
          approvalLine_rankName:"",
          drafter: "",
          draftDate: "",
          retentionPeriod: "",
          receiver: "",
          reference: "",
          title: "",
          body: "",
          offsiteWorker: "",
          offsiteTeam: "",
          offsitePosition: "",
          offsiteName: "",
          offsiteDate: "",
          destination: "",
          offsitePurpose: "",
          workDetails: "",
          notes: "",
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
    created() {
      this.autoSave = debounce(this.saveDraftAuto, 5000)
    },
    mounted() {
      this.loadDrafterInfo();
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      this.form.draftDate = `${yyyy}-${mm}-${dd}`;
      const cached = localStorage.getItem('draft-auto-cache')
      if (cached) {
        try {
          const {
            form, approvalLines,
            receiverList, referenceList, uploadedFiles
          } = JSON.parse(cached)
          Object.assign(this.form, form)
          this.approvalLines = approvalLines
          this.receiverList  = receiverList
          this.referenceList = referenceList
          this.uploadedFiles = uploadedFiles
          console.log('🟢 임시저장본 복원 완료')
        } catch { console.warn('⚠️ 캐시 파싱 실패') }
      }
    },
    formattedDraftDate() {
      return this.form.draftDate?.slice(0, 10) || '';
    },
    beforeUnmount() {
      this.saveDraftAuto()
    },
    watch: {
      form:          { deep:true, handler() { this.autoSave() } },
      approvalLines: { deep:true, handler() { this.autoSave() } },
      receiverList:  { deep:true, handler() { this.autoSave() } },
      referenceList: { deep:true, handler() { this.autoSave() } },
      uploadedFiles: { deep:true, handler() { this.autoSave() } }
    },
    methods: {
      async saveDraftAuto() {
        const payload = {
          employeeId:   userStore.user.employeeId,
          form:         { ...this.form },
          approvalLines:[ ...this.approvalLines ],
          receiverList: [ ...this.receiverList ],
          referenceList:[ ...this.referenceList ],
          uploadedFiles:[ ...this.uploadedFiles ],
          savedAt:      new Date().toISOString()
        }
  
        try {
          await axios.post('http://localhost:8000/drafts/temp', payload, {
            headers:{ Authorization:`Bearer ${userStore.getItem('token')}` }
          })
          console.log('💾 [auto] 서버 임시저장 성공')
        } catch(e){
          console.warn('⚠️ [auto] 서버 임시저장 실패:', e.message)
        }
  
        localStorage.setItem('draft-auto-cache', JSON.stringify(payload))
      },
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
          this.form.departmentName = data.departmentName;
          this.form.drafter = data.name;
          this.form.rankName = data.rankName;
          await this.fetchAutoApprovalLine(data.empId);
        } catch (e) {
          console.error("\u274C loadDrafterInfo 오류:", e);
          alert(e.message);
        }
      },
      updateDraftDate(val) {
        this.form.draftDate = val;
      },
      async fetchAutoApprovalLine(empId) {
        console.log("▶ fetchAutoApprovalLine 호출, empId =", empId);
        try {
          const { data } = await axios.get(
            "http://localhost:8000/approval-line",
            {
              params:     { employeeId: empId },
              headers:    { Authorization: `Bearer ${localStorage.getItem("token")}` }
            }
          );
          this.approvalLines = data.map(item => ({
            step:          item.step,
            name:          item.employeeName,
            employeeId:    item.employeeId,
            rankName:      item.rankName || "",
            role:          item.role || "",
            team:          item.teamName     || "",
            status:        "대기중",
            type:          item.type,
            lineTypeLabel: item.lineTypeLabel
                        || (item.lineType === "ACTURE"
                            ? "실제 결재선"
                            : "양식 결재선"),
            viewedAt:      null,
            approvedAt:    null,
            comment:       ""
          }));
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
        this.fileError = ""
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
        try {
          await this.saveDraftAuto()
  
          alert('임시저장 완료! ‟임시저장함"에서 확인하세요.')
          this.showDraftSaveModal = false
        } catch (err) {
          alert('임시저장 실패: ' + (err.response?.data?.message || err.message))
        }
      },
      async confirmSubmit() {
        const now = new Date();
        const attachmentKeys = this.uploadedFiles.map(f => f.key);
        const originalFileNames = this.uploadedFiles.map(f => f.name);
        const fileTypes         = this.uploadedFiles.map(f => f.type);
        const fileSizes         = this.uploadedFiles.map(f => f.size);
  
        const submitData = {
          title: this.form.title,
          docContent: this.form.body,
          retentionPeriod: this.form.retentionPeriod,
          receivers: this.receiverList.map(u => u.employeeId),
          reference: this.referenceList.map(u => u.employeeId),
          formId: 2,
          approvalLines: this.approvalLines.map((line, index) => ({
            step: index + 1,
            employeeId: line.employeeId,
            position: line.position,
            rankName:   line.rankName,
            type: line.type,
          })),
          attachmentKeys,
          originalFileNames,
          fileTypes,
          fileSizes,
          offsiteWorker: this.form.offsiteWorker,
          offsiteTeam: this.form.offsiteTeam,
          offsitePosition: this.form.offsitePosition,
          offsiteName: this.form.offsiteName,
          offsiteDate: this.form.offsiteDate,
          destination: this.form.destination,
          offsitePurpose: this.form.offsitePurpose,
          workDetails: this.form.workDetails,
          notes: this.form.notes,
        };
  
         console.log("상신 데이터", JSON.stringify(submitData, null, 2));
  
         try {
          const res = await axios.post(
            "http://localhost:8000/drafts/creation", submitData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });
          const { docId } = res.data;
  
          alert(`상신 완료! 문서번호: ${docId}`);
          this.showSubmitModal = false;
          this.$router.push({name: 'MyDraftBox'});
        } catch (error) {
          console.error("상신 실패", error);
          alert("상신 실패: " + (error.response?.data?.message || error.message));
        }
      },
    },
  };
  </script>
  
  <style scoped>
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
  
  body, html {
    height: 100%;
    margin: 0;
    padding: 0;
  }
  
  .main-box {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px 32px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin: 24px;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    min-height: 1200px;
    overflow-y: auto;
  }
  
  .container {
    font-family: Arial, sans-serif;
    min-width: 850px;
    max-width: 1600px;
    max-height: unset;
    margin: 20px auto;
    flex-grow: 1;
  }
  
  .editor-wrapper {
    display: flex;
    flex-direction: column;
  }
  
  .editor-toolbar-row {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
    border: none;
    gap: 0;
  }
  
  .editor-label {
    font-size: 14px;
    font-weight: bold;
    white-space: nowrap;
  }
  
  #custom-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
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
  
  ::v-deep(.quill-editor-area .ql-container.ql-snow) {
    border-bottom: none !important;
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
  
  ::v-deep(.quill-editor-area .ql-editor) {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
  
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
  
  .bold-divider {
    height: 2px;
    background-color: #dddddd;
    border: none;
    margin: 16px 0;
  }
  
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
    margin-top: 0px;
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
    border: 1px solid #ccc;
    border-radius: 8px;
    transition: border 0.2s ease;
    height: 36px;
    font-size: 14px;
    line-height: 1.5;
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
    color: #555;
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
    margin-top: 20px;
    margin-bottom: 10px;
  }
  
  .scrollable-box {
    max-height: 300px;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 20px;
    background-color: #fafafa;
  }
  
  .editor-wrapper {
    border: 1px solid #ccc;
    background: #ffffff;
    padding: 0;
    margin-top: 12px;
    min-height: 400px;
  }
  
  ::v-deep(.quill-editor-area .ql-container.ql-snow) {
    border: none;
    min-height: 350px;
    background: #ffffff;
    font-size: 15px;
    line-height: 1.7;
    padding: 0 8px 8px 8px;
  }
  
  ::v-deep(.quill-editor-area .ql-editor) {
    padding: 12px 8px;
    min-height: 320px;
    font-family: 'Arial', sans-serif;
    font-size: 15px;
    line-height: 1.7;
  }
  
  .editor-label {
    font-size: 15px;
    font-weight: bold;
    white-space: nowrap;
    background-color: #f8f9fa;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 38px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 0;
  }
  
  .hidden-input {
    display: none;
  }
  
  .info-table th,
  .info-table td {
    height: 55px;
    vertical-align: middle;
    padding: 8px;
  }
  
  .info-table .flex-row {
    height: 100%;
    display: flex;
    align-items: center;
  }
  
  .info-table input[type="text"],
  .info-table select {
    height: 38px;
    box-sizing: border-box;
  }
  
  th {
    font-weight: 600;
    background: #e3e6ea;
    border: 1px solid #e3e6ea;
    padding: 8px;
    text-align: left;
  }
  .file-table th {
    background: #e3e6ea;
  }
  table:not(.line-table) th {
    background: #e3e6ea;
  }
  .line-table th {
    background: #f8f9fa;
  }
  
  td {
    font-weight: normal;
    border: 1px solid #e3e6ea;
    padding: 8px;
    text-align: left;
    white-space: normal;
    word-break: break-word;
    height: 48px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
  }
  
  table td:nth-child(odd) {
    background-color: #f8f9fa;
    border-radius: 8px;
  }
  
  table td:nth-child(even) {
    background-color: #ffffff;
  }
  
  .quill-editor-area {
    min-height: 200px;
  }
  
  .quill-editor-area ::v-deep(.ql-editor) {
    min-height: 200px;
    height: 300px;
    max-height: 300px;
    overflow-y: auto;
    box-sizing: border-box;
    padding: 12px;
  }
  
  ::v-deep(.quill-editor-area .ql-container) {
    border: 1px solid #e3e6ea;
    box-sizing: border-box;
  }
  
  ::v-deep(.quill-editor-area .ql-toolbar) {
    border: 1px solid #e3e6ea;
    border-bottom: none;
  }
  </style>
  