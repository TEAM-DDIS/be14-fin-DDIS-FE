<!-- 결재라인 모달 -->

<template>
  <!-- 🟦 모달 배경 (클릭 시 닫기 기능) -->
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content">
      <!-- 🟦 모달 상단 타이틀 -->
      <div class="modal-title">{{ mode }} 지정</div>

      <!-- 🟦 모달 본문 영역 -->
      <div class="modal-body">
        <!-- 🟨 좌측: 조직도 + 검색 + 구성원 리스트 -->
        <div class="sidebar">
          <!-- 조직도 컴포넌트 (스크롤 제한 영역) -->
          <div class="org-tree-scroll">
            <OrgTree @selectMember="selectMember" />
          </div>

          <!-- 사원 검색창 -->
          <div class="search-box">
            <input type="text" v-model="searchText" placeholder="사원검색" />
            <button @click="searchMember">🔍</button>
          </div>

          <!-- 검색된 사원 목록 테이블 -->
          <table class="member-list">
            <thead>
              <tr>
                <th>이름</th>
                <th>직책</th>
                <th>부서</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="member in filteredMembers"
                :key="member.id"
                @click="selectMember(member)"
                :class="{ selected: selectedMember && member.id === selectedMember.id }"
              >
                <td>{{ member.name }}</td>
                <td>{{ member.position }}</td>
                <td>{{ member.dept }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 🟩 가운데: 추가 버튼 (선택된 사원을 오른쪽 목록으로 이동) -->
        <div class="center-btns">
          <button
            class="arrow-btn"
            :disabled="!selectedMember"
            @click="addSelected"
          >
            {{ mode }}<br />▶
          </button>
        </div>

        <!-- 🟦 우측: 선택된 지정 대상자 테이블 -->
        <div class="approver-table-wrap">
          <div class="section-header">
            {{ mode === "결재자" ? "결재자" : mode }}
          </div>
          <table class="approval-list">
            <thead>
              <tr>
                <th>순서</th>
                <th>이름</th>
                <th>직책</th>
                <th>부서</th>
                <!-- 결재자 지정 시 결재/협조 선택 -->
                <th v-if="mode === '결재자'">결재선</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(person, idx) in selectedList" :key="person.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ person.name }}</td>
                <td>{{ person.position }}</td>
                <td>{{ person.dept }}</td>
                <!-- 결재자일 때만 선택 박스 노출 -->
                <td v-if="mode === '결재자'">
                  <select v-model="person.type">
                    <option value="결재">결재</option>
                    <option value="협조">협조</option>
                  </select>
                </td>
                <!-- 삭제 버튼 -->
                <td>
                  <button @click="removeSelected(idx)">삭제</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 🟪 모달 하단 버튼 -->
      <div class="modal-footer">
        <button @click="submitSelected" class="footer-btn blue">확인</button>
        <button @click="emit('close')" class="footer-btn gray">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/* 🔹 외부 컴포넌트 및 Composition API import */
import OrgTree from '@/components/org/structure/Hierarchy.vue';
import { ref, computed, watch } from 'vue';

/* 🔹 부모 컴포넌트로부터 전달되는 emit, props 설정 */
const emit = defineEmits(['close', 'submit']);
const props = defineProps({
  mode: { type: String, required: true }, // 지정 모드: 결재자 / 수신자 / 참조자
  defaultList: { type: Array, default: () => [] }, // 기본 지정된 목록
});

/* 🔹 전체 사원 목록 (예시 데이터) */
const allMembers = ref([
  { id: 1, name: '김철수', position: '관리자', dept: '경영지원팀' },
  { id: 2, name: '이영희', position: '사원', dept: '개발사업부' },
]);

/* 🔹 검색어 및 상태 변수 */
const searchText = ref('');
const selectedMember = ref(null); // 현재 선택된 사원
const selectedList = ref([...props.defaultList]); // 최종 지정된 사원 목록

/* 🔹 defaultList가 변경될 때 selectedList도 동기화 */
watch(() => props.defaultList, (val) => {
  selectedList.value = [...val];
});

/* 🔹 검색어 기반 필터링 */
const filteredMembers = computed(() =>
  allMembers.value.filter(
    m =>
      m.name.includes(searchText.value) ||
      m.position.includes(searchText.value) ||
      m.dept.includes(searchText.value)
  )
);

/* 🔹 사원 선택 함수 */
function selectMember(member) {
  selectedMember.value = member;
}

/* 🔹 검색 버튼 클릭 (v-model 필터링 기반이므로 기능 없음) */
function searchMember() {
  // 불필요 – 자동 필터링
}

/* 🔹 선택된 사원을 오른쪽 목록에 추가 */
function addSelected() {
  if (
    selectedMember.value &&
    !selectedList.value.some(a => a.id === selectedMember.value.id)
  ) {
    if (props.mode === "결재자") {
      selectedList.value.push({ ...selectedMember.value, type: "결재" });
    } else {
      selectedList.value.push({ ...selectedMember.value });
    }
  }
}

/* 🔹 오른쪽 목록에서 제거 */
function removeSelected(idx) {
  selectedList.value.splice(idx, 1);
}

/* 🔹 확인 버튼 클릭 시 submit 이벤트 발생 */
function submitSelected() {
  emit('submit', selectedList.value);
}
</script>

<style scoped>
/* 기존 style 복사해서 동일하게 사용하세요! */
</style>


<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  width: 950px;
  min-height: 560px;
  max-height: 90vh;    /* 화면 기준 최대 높이 제한(세로 스크롤 생김) */
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.modal-title {
  color: #000000; 
  font-size: 20px;
  font-weight: bold;
  padding: 16px 22px;
  margin-top: 8px; 
  margin-bottom: 8px;
  text-align: center;
}
.modal-body {
  border-radius: 10px;
    display: flex; 
    flex-direction: row; 
    flex: 1; 
    min-height: 420px; 
    background: #ffffff;
    padding: 18px 0;
}
.sidebar {
    width: 260px;
    background: #ededed;
    padding: 14px 10px 0 18px;
    border-right: 1px solid #d8d8d8;
    display: flex;
    flex-direction: column;
}
/* 조직도 트리만 별도 스크롤 */
.org-tree-scroll {
    max-height: 220px;  /* 원하는 높이로 조정 */
    overflow-y: auto;
    margin-bottom: 8px;
}
.search-box {
    margin: 16px 0 8px 0; 
    display: flex;
}
.search-box input { 
    flex: 1;
}
.member-list { width: 100%; 
    margin-top: 6px; 
    border-collapse: collapse; 
    font-size: 0.98rem;
}
.member-list th, .member-list td { 
    border: 1px solid #d0d0d0; 
    padding: 4px 7px; 
}
.member-list tr:hover { 
    background: #dbefff; 
    cursor: pointer; 
}
.member-list th { 
    background: #f0f0f0; 
}
.member-list tr.selected { 
    background: #b6eaff; 
}
.center-btns {
    min-width: 90px; 
    display: flex; 
    flex-direction: column;
    align-items: center; 
    justify-content: center;
}
.arrow-btn {
    padding: 14px 12px; 
    font-size: 1.04rem; 
    margin-bottom: 8px;
    background: #00a8e8;
    color: #fff; 
    border: none; 
    border-radius: 8px; 
    cursor: pointer;
    font-weight: 500; 
    letter-spacing: 1px;
}
.arrow-btn:disabled { 
    background: #b6c5d6; 
    cursor: not-allowed; 
}
.approver-table-wrap {
    flex: 1; 
    padding: 0 24px; 
    display: flex; 
    flex-direction: column;
}
.section-header {
    font-size: 1.06rem; 
    font-weight: bold; 
    margin: 4px 0 8px 0; 
    padding-left: 2px;
}
.approval-list {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
}
.approval-list th, .approval-list td {
    border: 1px solid #ccc;
    text-align: center;
    padding: 6px 0;
    /* 예시: 긴 텍스트 말줄임 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.approval-list th { 
    background: #f0f0f0; 
}
.modal-footer {
    display: flex; 
    justify-content: flex-end; 
    gap: 12px; 
    background: #f5f5f5; 
    padding: 16px 24px;
}
.footer-btn {
    padding: 8px 28px; 
    border-radius: 5px; 
    border: none; 
    font-size: 1.05rem;
    font-weight: 500; 
    cursor: pointer;
}
.footer-btn.blue { 
    background: #00a8e8; 
    color: #fff; }
.footer-btn.gray { 
    background: #aaa; 
    color: #fff; }
</style>
