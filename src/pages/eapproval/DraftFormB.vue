<!-- 전자결재 > 기안작성 > (일반기안양식) -->
<template>
  <!-- ◆ 페이지 제목 -->
  <h1 class="page-title">기안작성</h1>
  <p class="desc">연차신청서 작성</p>

  <!-- ◆ 전체 레이아웃 박스 -->
  <div class="main-box">
    <!-- ◆ 폼 컨테이너 -->
    <div class="container">
      <!-- 🔷 기본 정보 입력 영역 -->
      <h2>연차신청서</h2>
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
          <!-- 🔷 수신자 및 참조자 설정 -->
          <tr>
            <td>수신자</td>
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
            <td>참조자</td>
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

      <!-- 🔷 연차일 작성 -->
      <table class="info-table annual-table">
        <colgroup>
          <col style="width:25%">
          <col style="width:25%">
          <col style="width:25%">
          <col style="width:25%">
        </colgroup>
        <tbody>
          <tr>
            <td class="annual-label">총 연차 일수</td>
            <td class="annual-value">{{ form.annualTotal }}</td>
            <td class="annual-label">사용가능 연차일수</td>
            <td class="annual-value">{{ form.annualAvailable }}</td>
          </tr>
          <tr>
            <td class="annual-label">사용 연차 누계</td>
            <td class="annual-value">{{ form.annualUsed }}</td>
            <td class="annual-label">신청 연차 일수</td>
            <td class="annual-value">
              <input type="number" v-model.number="form.annualRequest" min="0" />
            </td>
          </tr>
          <tr>
            <td>휴가종류</td>
            <td colspan="3">
              <label><input type="radio" name="leaveType" value="연차" v-model="form.leaveType" /> 연차</label>
              <label style="margin-left:24px;"><input type="radio" name="leaveType" value="오전반차" v-model="form.leaveType" /> 오전반차</label>
              <label style="margin-left:24px;"><input type="radio" name="leaveType" value="오후반차" v-model="form.leaveType" /> 오후반차</label>
            </td>
          </tr>
          <tr>
            <td rowspan="2">휴가기간</td>
            <td colspan="2" class="period-label-cell" style="text-align:center;">시작일자</td>
            <td colspan="2" class="period-label-cell" style="text-align:center;">종료일자</td>
          </tr>
          <tr>
            <td colspan="2" class="period-input-cell">
              <input type="date" v-model="form.startDate" />
            </td>
            <td colspan="2" class="period-input-cell">
              <input type="date" v-model="form.endDate" />
            </td>
          </tr>
          <tr>
            <td>휴가사유</td>
            <td colspan="3">
              <textarea v-model="form.reason" style="width:100%;height:180px;"></textarea>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

    <!-- 🔷 하단 버튼 (임시저장/상신하기) -->
    <div class="button-group">
      <button class="button gray" @click="showDraftSaveModal = true">취소</button>
      <button class="button" @click="showSubmitModal = true">상신</button>
    </div>
  </div>

  <!-- 🔷 모달 컴포넌트 영역 -->
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
import axios from "axios";
import SelectionModal from '@/components/eapproval/ApprovalLineModal.vue';
import SubmitModal from '@/components/eapproval/SubmitModal.vue';
import DraftSaveModal from '@/components/eapproval/DraftSaveModal.vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore()

async function getUploadInfo(file) {
  const token = localStorage.getItem('token')
  const qs = new URLSearchParams({ filename: file.name, contentType: file.type }).toString()
  const res = await fetch(`https://api.isddishr.site/s3/upload-url?${qs}`, {
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
        annualTotal: 0,
        annualAvailable: 0,
        annualUsed: 0,
        annualRequest: 0,
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
      showDraftSaveModal: false,
      startLabelClass: '',
      endLabelClass: '',
      startInputClass: '',
      endInputClass: '',
      startLabelStyle: 'background: #f8f9fa;',
      endLabelStyle: 'background: #f8f9fa;',
      startInputStyle: '',
      endInputStyle: '',
    };
  },
  // created() {
  //   //  🔷 컴포넌트 생성 시, 자동 저장 메서드를 디바운싱하여 설정 (5초 간격)
  //   this.autoSave = debounce(this.saveDraftAuto, 5000)
  // },
  mounted() {
    //  🔷  컴포넌트 마운트 시 기안자 정보 불러오고, 날짜 초기화 및 임시저장 데이터 복원
    this.loadDrafterInfo();
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    this.form.draftDate = `${yyyy}-${mm}-${dd}`; // datetime-local 초기값
       /* ③ 로컬 캐시가 있으면 복원 ─────────────── */
    // const cached = localStorage.getItem('draft-auto-cache')  // ★ NEW
    // if (cached) {
    //   try {
    //     const {
    //       form, approvalLines,
    //       receiverList, referenceList, uploadedFiles
    //     } = JSON.parse(cached)
    //     Object.assign(this.form, form)
    //     this.approvalLines = approvalLines
    //     this.receiverList  = receiverList
    //     this.referenceList = referenceList
    //     this.uploadedFiles = uploadedFiles
    //     console.log('🟢 임시저장본 복원 완료')              // ★ NEW
    //   } catch { console.warn('⚠️ 캐시 파싱 실패') }        // ★ NEW
    // }
    },
    formattedDraftDate() {
    return this.form.draftDate?.slice(0, 10) || '';
  },
  //   beforeUnmount() {                                           // ★ NEW
  // // 🔷 임시 저장 로직: 서버 저장 + 로컬 캐시
  //   this.saveDraftAuto()
  // },
  //   watch: {                                                    // ★ NEW
  //   form:          { deep:true, handler() { this.autoSave() } },
  //   approvalLines: { deep:true, handler() { this.autoSave() } },
  //   receiverList:  { deep:true, handler() { this.autoSave() } },
  //   referenceList: { deep:true, handler() { this.autoSave() } },
  //   uploadedFiles: { deep:true, handler() { this.autoSave() } }
  // },
  methods: {
    async saveDraftAuto() {                                   // ★ NEW
      const payload = {
        employeeId:   userStore.user.employeeId,
        form:         { ...this.form },
        approvalLines:[ ...this.approvalLines ],
        receiverList: [ ...this.receiverList ],
        referenceList:[ ...this.referenceList ],
        uploadedFiles:[ ...this.uploadedFiles ],
        savedAt:      new Date().toISOString()
      }

    //   /* /1) 서버에 temp 저장 */
    //   try {
    //     await axios.post('https://api.isddishr.site/drafts/temp', payload, {
    //       headers:{ Authorization:`Bearer ${userStore.getItem('token')}` }
    //     })
    //     console.log('💾 [auto] 서버 임시저장 성공')
    //   } catch(e){
    //     console.warn('⚠️ [auto] 서버 임시저장 실패:', e.message)
    //   }

    //   /* 2) 로컬 캐시 */
    //   localStorage.setItem('draft-auto-cache', JSON.stringify(payload))
    },
    // ① 기안자 정보 불러오기 -  서버에서 현재 로그인한 기안자 정보 조회 후 기본 폼 채움
    async loadDrafterInfo() {
      try {
        const res = await fetch("https://api.isddishr.site/drafter/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (!res.ok) {
          console.error("\u274C 서버 응답 상태:", res.status);
          throw new Error("기안자 정보 조회 실패");
        }
        const data = await res.json();
        // console.log("\u2705 기안자 정보:", data);
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
     // ② 자동 결재선 조회 - 기안자의 사번(empId)로 자동 결재라인 조회하여 approvalLines에 세팅
     async fetchAutoApprovalLine(empId) {

  // console.log("▶ fetchAutoApprovalLine 호출, empId =", empId);
  try {
    // response 객체에서 바로 data만 꺼내오기
    const { data } = await axios.get(
      "https://api.isddishr.site/approval-line",
      {
        params:     { employeeId: empId },
        headers:    { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }
    );
    // 꺼낸 data를 바로 map
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
    // console.log("📋 화면에 출력될 결재선:", this.approvalLines);

  } catch (error) {
    console.error("❌ 자동 결재선 조회 실패:", error);
  }
    },
    // ③ 임시저장 모달 열기/닫기
    openApprovalModal() { this.showApprovalModal = true; },
    openReceiverModal() { this.showReceiverModal = true; },
    openReferenceModal() { this.showReferenceModal = true; },
    // ④ 사용자 선택 모달 결과 처리
    onApprovalLineSubmit(lines) {
      // console.log('🟢 수신된 커스텀 결재선:', lines);
      this.approvalLines = lines;
      this.showApprovalModal = false;
    },
    onReceiverSubmit(list) {
      this.receiverList = list;
      this.form.receiver = list.map(u => u.name || u.employeeName).join(', ');
      this.showReceiverModal = false;
    },
    onReferenceSubmit(list) {
      this.referenceList = list;
      this.showReferenceModal = false;
      this.form.reference = list.map(u => u.name || u.employeeName).join(', ');
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
      if (!this.fileInput) return;
      const file = this.fileInput;
      if (this.uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
        this.fileError = '이미 추가됨';
        return;
      }
      try {
        const { key, url } = await getUploadInfo(file);
        await uploadToS3(url, file);
        this.uploadedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          key,
          selected: false
        });
        // console.log('업로드 후 uploadedFiles:', this.uploadedFiles);
        this.fileInput = null;
      } catch(e) {
        console.error(e);
        this.fileError = '업로드 실패';
      }
    },
    removeSelectedFiles(){ 
      this.uploadedFiles=this.uploadedFiles.filter(f=>!f.selected) 
    },

async confirmDraftSave() {
  try {
    // 1) 디바운스 기다리지 말고 즉시 저장
    await this.saveDraftAuto()                       // ← 자동저장 메서드 재사용

    // 2) 사용자 안내
    // alert('임시저장 완료! ‟임시저장함"에서 확인하세요.')
        alert('기안 양식 화면으로 이동합니다.')
    this.showDraftSaveModal = false
  } catch (err) {
    alert('임시저장 실패: ' + (err.response?.data?.message || err.message))
  }
},
    // ⑥ 최종 상신하기: rankName·role 포함  -  상신 버튼 클릭 시 실행되는 최종 제출 로직
    //   1. 입력 데이터 정리
    //   2. 서버에 POST 요청으로 상신 처리
    //   3. 성공 시 사용자 안내 및 페이지 이동
    async confirmSubmit() {
      const now = new Date();
      const attachmentKeys = this.uploadedFiles.map(f => f.key);
      const originalFileNames = this.uploadedFiles.map(f => f.name);
      const fileTypes = this.uploadedFiles.map(f => f.type);
      const fileSizes = this.uploadedFiles.map(f => f.size);

      const submitData = {
        title: this.form.title,
        docContent: this.form.body,
        retentionPeriod: this.form.retentionPeriod,
        receivers: this.receiverList.map(u => u.employeeId),
        reference: this.referenceList.map(u => u.employeeId),
        formId: 1,
        approvalLines: this.approvalLines.map((line, index) => ({
          step: index + 1,
          employeeId: line.employeeId,
          position: line.position,
          rankName: line.rankName,
          type: line.type,
        })),
        attachmentKeys,
        originalFileNames,
        fileTypes,
        fileSizes,
        contentDto: {
          receiver: this.receiverList.map(u => u.name),
          reference: this.referenceList.map(u => u.name),
        }
      };
      // console.log("상신 데이터", JSON.stringify(submitData, null, 2));
      
      // (b) 서버에 POST 요청
       try {
        const res = await axios.post(
          "https://api.isddishr.site/drafts/creation", submitData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const { docId } = res.data;
        // (c) 성공 시 알림 및 이동
        // alert(`상신 완료! 문서번호: ${docId}`);
        alert(`기안문이 상신되었습니다.`);
        this.showSubmitModal = false;
        this.$router.push({name: 'MyDraftBox'});
      } catch (error) {
        console.error("상신 실패", error);
        alert("상신 실패: " + (error.response?.data?.message || error.message));
      }
    },
    // ⑦ 파일 업로드 처리
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
     async addFile() {
      if (!this.fileInput) return;
      const file = this.fileInput;
      // 중복 체크
      if (this.uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
        this.fileError = '이미 추가됨';
        return;
      }
      try {
        // presign URL + key 가져오기
        const { key, url } = await getUploadInfo(file);
        // S3에 업로드
        await uploadToS3(url, file);
      this.uploadedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
         key,             // ← 나중에 백엔드로 보낼 key
        selected: false
      });
        this.fileInput = null;
      } catch(e) {
        console.error(e);
        this.fileError = '업로드 실패';
      }
    } 
      },
    removeSelectedFiles() {
      this.uploadedFiles = this.uploadedFiles.filter(file => !file.selected);
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

/* ✅전체 화면 스크롤 영역 (사용하지 않음) */
.full-scroll {
  height: 100vh;
  overflow-y: auto;
  /* background-color: #f8fafd; */
}

/* ✅ 메인 박스: 전체 레이아웃 래퍼 */
.main-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 24px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  min-height: fit-content;
}

/* ✅ 내부 컨텐츠 컨테이너 */
.container {
  font-family: Arial, sans-serif;
  min-width: 850px;
  max-width: 1600px;
  max-height: 1500px;
  margin: 20px auto;
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
  gap: 12px;
  margin-bottom: 70px;
  margin-left: 985px;
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
  /* overflow-y: auto; */
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 20px;
  background-color: #fafafa;
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
}

.info-table .flex-row {
  height: 100%;
  display: flex;
  align-items: center; /* 내부 요소 수직 가운데 정렬 */
}

.info-table input[type="text"],
.info-table select {
  height: 38px; /* input과 select의 높이를 td 높이에 맞게 조정 */
  box-sizing: border-box;
}

/* 기존 테이블 스타일 */
th {
  font-weight: 600;
  background: #f8f9fa;
  border: 1px solid #e3e6ea;
  padding: 8px;
  text-align: left;
}

td {
  font-weight: normal;
  border: 1px solid #e3e6ea;
  padding: 8px;
  text-align: left;
  white-space: normal;    /* ✅ 줄바꿈 허용 */
  word-break: break-word; /* ✅ 단어 중간이라도 줄바꿈 */
}

/* 테이블 공통 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.annual-table td, .annual-table th {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
  font-size: 15px;
  font-weight: normal;
  background: #fff;
}
.annual-table tr td:first-child {
  background: #f8f9fa;
  font-weight: bold;
  width: 140px;
}
.annual-table input[type="text"],
.annual-table input[type="date"],
.annual-table textarea {
  border-radius: 6px;
  border: 1px solid #ccc;
  padding: 6px 10px;
  font-size: 15px;
  background: #fff;
}
.annual-table textarea {
  resize: none;
}

.annual-table input[type="radio"] {
  margin-right: 4px;
}

.annual-table .annual-value {
  width: 13%;
  min-width: 30px;
  text-align: center;
  background: #fff;
  font-weight: bold;
}

.annual-table .period-label-cell {
  background: #f8f9fa !important;
  font-weight: bold;
  width: 50%;
}

.annual-table .period-input-cell {
  background: #fff !important;
  width: 50%;
}

.annual-table .annual-value input[type="number"] {
  width: 80px;
  text-align: right;
}
</style>