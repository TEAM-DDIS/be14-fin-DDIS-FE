<template>
  <h1 class="page-title">기안작성</h1>
  <div class="full-scroll">
    <div class="container">
      <h2>외근신청서</h2>

      <!-- 기본 정보 -->
      <table>
        <tr>
          <td>기안부서</td>
          <td><input v-model="form.department" type="text" readonly /></td>
          <td>직책</td>
          <td><input v-model="form.position" type="text" readonly /></td>
        </tr>
        <tr>
          <td>기안자</td>
          <td><input v-model="form.drafter" type="text" readonly /></td>
          <td>기안일자</td>
          <td><input v-model="form.draftDate" type="date" readonly /></td>
        </tr>
        <tr>
          <td>문서번호</td>
          <td>-</td>
          <td>보존연한</td>
          <td>
            <select v-model="form.retentionPeriod">
              <option>1년</option>
              <option>3년</option>
              <option>5년</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>수신자</td>
          <td class="flex-row">
            <input v-model="form.receiver" type="text" />
            <button class="button" @click="openReceiverModal">👤+</button>
          </td>
          <td>참조자</td>
          <td class="flex-row">
            <input v-model="form.reference" type="text" />
            <button class="button" @click="openReferenceModal">👤+</button>
          </td>
        </tr>
      </table>

      <div class="approval-header">
        <span class="section-title">결재선</span>
        <button class="button" @click="openApprovalModal">결재선 설정</button>
      </div>
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

      <div class="section-title">기안내용</div>
      <div class="scrollable-box">
        <label>제목</label>
        <input v-model="form.title" type="text" placeholder="제목을 입력하세요" />

        <div class="file-section">
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

        <label style="margin-top: 10px; display: block;">본문</label>
        <textarea v-model="form.body" placeholder="기안 내용을 작성하세요..."></textarea>
      </div>

      <!-- 외근자 정보 -->
      <div class="section-title">외근자</div>
      <table>
        <tr>
          <td>외근자</td>
          <td><input v-model="form.offsiteWorker" type="text" /></td>
          <td>소속 팀</td>
          <td><input v-model="form.offsiteTeam" type="text" /></td>
        </tr>
        <tr>
          <td>직급</td>
          <td><input v-model="form.offsitePosition" type="text" /></td>
          <td>성명</td>
          <td><input v-model="form.offsiteName" type="text" /></td>
        </tr>
        <tr>
          <td>외근적용일시</td>
          <td><input v-model="form.offsiteDate" type="date" /></td>
          <td>행선지</td>
          <td><input v-model="form.destination" type="text" /></td>
        </tr>
        <tr>
          <td>외근목적</td>
          <td colspan="3"><input v-model="form.offsitePurpose" type="text" /></td>
        </tr>
      </table>

      <!-- 업무내용 -->
      <div class="section-title">업무내용</div>
      <div>
        <textarea v-model="form.workDetails" placeholder="업무 내용을 작성하세요..."></textarea>
      </div>

      <!-- 비고 -->
      <div class="section-title">비고</div>
      <div>
        <input v-model="form.notes" type="text" placeholder="비고 사항을 입력하세요..." />
      </div>

      <div class="button-group">
        <button class="button gray" @click="openDraftSave">임시저장</button>
        <button class="button" @click="confirmSubmit">상신하기</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CreateDraftPreview",
  data() {
    return {
      form: {
    //   추후 데이터 받을 컬럼명으로 수정
        department: "",
        position: "",
        drafter: "",
        draftDate: "",
        retentionPeriod: "1년",
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
      employeeId: 1234,
      approvalLines: [],
      uploadedFiles: [],
      fileInput: null,
    };
  },
  mounted() {
    this.loadDrafterInfo();
  },
  methods: {
    async loadDrafterInfo() {
      try {
        const res = await fetch(`/api/employees/${this.employeeId}`);
        if (!res.ok) throw new Error("기안자 정보 조회 실패");
        const data = await res.json();
        this.form.department = data.departmentName;
        this.form.drafter = data.name;
        this.form.position = data.position;
      } catch (e) {
        alert(e.message);
      }
    },
    openReceiverModal() {
      alert("수신자 선택 모달 열기");
    },
    openReferenceModal() {
      alert("참조자 선택 모달 열기");
    },
    openApprovalModal() {
      alert("결재선 설정 모달 열기");
    },
    openDraftSave() {
      alert("임시저장 모듈 열기");
    },
    confirmSubmit() {
      if (confirm("상신하시겠습니까?")) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        this.form.draftDate = `${yyyy}-${mm}-${dd}`;
        console.log("제출 데이터:", this.form);
        alert("상신 처리 완료");
      }
    },
    handleFileUpload(event) {
      this.fileInput = event.target.files[0];
    },
    addFile() {
      if (this.fileInput) {
        this.uploadedFiles.push({
          name: this.fileInput.name,
          selected: false,
        });
        this.fileInput = null;
      }
    },
    removeSelectedFiles() {
      this.uploadedFiles = this.uploadedFiles.filter((file) => !file.selected);
    },
  },
};
</script>

<style scoped>
.page-title {
    margin-left: 20px;
    margin-bottom: 50px;
    color: #00a8e8;
}
body, html {
  height: 100%;
  margin: 0;
  padding: 0;
}
.full-scroll {
  height: 100vh;
  overflow-y: auto;
  /* background-color: #f8fafd; */
}
.container {
  font-family: Arial, sans-serif;
  max-width: 1000px;
  margin: 40px auto;
  background: #fff;
  padding: 40px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  border-radius: 15px;
}
h2 {
  text-align: center;
  margin-bottom: 40px;
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
}
.flex-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-title {
  font-weight: bold;
  margin-top: 40px;
  margin-bottom: 10px;
}
input[type="text"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
}
textarea {
  height: 200px;
}
.button {
  padding: 6px 12px;
  background-color: #0099ff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
.button.gray {
  background-color: #666;
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
.button-group {
  margin-top: 24px;
  text-align: center;
}
.approval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.scrollable-box {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 20px;
  background-color: #fafafa;
}
</style>
