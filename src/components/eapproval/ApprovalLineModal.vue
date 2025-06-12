<!-- 결재라인 모달 -->

<template>
  <!-- 모달 전체 오버레이 (배경 클릭 시 닫힘) -->
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- ◆ 모달 제목 (상단 중앙) -->
      <div class="model-text">
        <h3 class="modal-title">결재선 설정</h3>
      </div>
      <!-- 상단: 조직도 탭, 정렬, 검색, 삭제 버튼 -->
      <div class="modal-header">
        <div class="tab-group">
          <!-- 조직도 탭(고정) -->
          <button class="active">조직도</button>
        </div>
        <div class="sort-search-group">
          <!-- 정렬 기준 선택 -->
          <select v-model="sortKey">
            <option value="이름">이름</option>
            <option value="부서">부서</option>
          </select>
          <!-- 검색 입력창 -->
          <input type="text" v-model="search" placeholder="검색" />
        </div>
        <!-- 결재자 삭제 버튼 (선택된 결재자 삭제) -->
        <button class="delete-btn btn-delete" @click="deleteSelectedApprovers">삭제</button>
      </div>
      <div class="modal-body">
        <!-- 좌측: 조직도 트리 (Hierarchy 컴포넌트) -->
        <div class="org-tree-area">
          <Hierarchy />
        </div>
        <!-- 중앙: 결재/협조 버튼 -->
        <div class="action-btns">
          <button class="action-btn btn-save">결재</button>
          <button class="action-btn btn-save">협조</button>
        </div>
        <!-- 우측: 결재선 테이블 -->
        <div class="approver-table-area">
          <table class="approver-table">
            <thead>
              <tr>
                <th><!-- 체크박스 --> </th>
                <th>순서</th>
                <th>결재유형</th>
                <th>이름</th>
              </tr>
            </thead>
            <tbody>
              <!-- 결재선 목록 렌더링, 체크박스 선택 가능 -->
              <tr v-for="(item, idx) in approverList" :key="item.id">
                <td>
                  <input type="checkbox" :value="item.id" v-model="selectedApprovers" />
                </td>
                <td>{{ idx + 1 }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- 하단: 취소/등록 버튼 -->
      <div class="modal-footer">
        <button class="footer-btn cancel btn-delete" @click="$emit('close')">취소</button>
        <button class="footer-btn submit btn-save">등록</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// =========================
// 결재선 설정 모달 (조직도/결재선)
// =========================
import { ref } from 'vue';
import Hierarchy from '@/components/org/structure/Hierarchy.vue'; // 조직도 트리 컴포넌트

// 상단 탭/정렬/검색 상태
const tab = ref('조직도'); // 현재 탭(고정)
const sortKey = ref('이름'); // 정렬 기준
const search = ref('');     // 검색어

// 결재선 mock 데이터 (실제 연동 시 API로 대체)
const approverList = ref([
  { id: 1, type: '결재', name: '홍길동' },
  { id: 2, type: '협조', name: '김철수' },
]);

// 선택된 결재자 id 배열 (체크박스)
const selectedApprovers = ref([]);

// 체크박스 토글 함수
function toggleApprover(id) {
  const idx = selectedApprovers.value.indexOf(id);
  if (idx === -1) selectedApprovers.value.push(id);
  else selectedApprovers.value.splice(idx, 1);
}

// 선택된 결재자 삭제 함수
function deleteSelectedApprovers() {
  approverList.value = approverList.value.filter(item => !selectedApprovers.value.includes(item.id));
  selectedApprovers.value = [];
}
</script>

<style scoped>
/* =========================
   모달 전체 오버레이/컨테이너
========================= */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 18px;
  width: 900px;           /* 모달 가로 크기 넉넉히 */
  min-width: 700px;
  max-width: 98vw;
  min-height: 600px;      /* 모달 세로 최소 크기 넉넉히 */
  box-shadow: 0 2px 24px rgba(0,0,0,0.13);
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 0 0 0 0;
}

/* =========================
   상단 제목/탭/정렬/검색/삭제
========================= */
.model-text {
  padding: 24px 0 0 0;    /* 상단 여백 */
  text-align: center;
}
.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
  margin-left: 0;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 0 18px 0 18px;
  border-bottom: 1.5px solid #e0e0e0;
  position: relative;
  flex-wrap: nowrap; /* 한 줄 유지 */
}
.tab-group {
  display: flex;
  gap: 4px;
}
.tab-group button {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 6px 18px;
  font-weight: 500;
  font-size: 15px;
  color: #333;
  cursor: pointer;
}
.tab-group .active {
  background: #fff;
  color: #00a8e8;
  border-bottom: 2px solid #fff;
  font-weight: bold;
}
.sort-search-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
  flex-shrink: 0;
}
.sort-search-group select {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  width: 90px;
  min-width: 70px;
  max-width: 120px;
}
.sort-search-group input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  width: 120px;
  min-width: 80px;
  max-width: 180px;
}
.delete-btn {
  margin-left: auto;
  margin-bottom: 10px;
  flex-shrink: 0;
}

/* =========================
   조직도/결재선 본문 영역
========================= */
.modal-body {
  display: flex;
  flex: 1;
  min-height: 400px;
  padding: 0 32px 0 32px; /* 좌우 여백 넉넉히 */
  gap: 24px;              /* 좌우 영역 간격 */
  margin-top: 8px;
  align-items: stretch;   /* 세로로 모두 같은 높이 */
  justify-content: center;
}
.org-tree-area, .approver-table-area {
  /* 조직도/결재자 영역 동일하게 */
  flex: 1 1 0;
  min-width: 320px;
  max-width: 420px;
  height: 410px;
  background: #fafbfc;
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  padding: 24px 16px 24px 16px;
  overflow-y: auto;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}
.action-btns {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  justify-content: center;
  margin: 0 8px;
  height: 420px;
  align-self: center;
}
.approver-table {
  width: 100%;
  border-collapse: collapse;
}
.approver-table th, .approver-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 10px;
  font-size: 15px;
  text-align: center;
}
.approver-table th {
  background: #f8f9fa;
  color: #222;
  font-weight: 600;
}

/* =========================
   하단 버튼 영역
========================= */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 32px 24px 0;
  border-top: 1.5px solid #e0e0e0;
  background: #fff;
  border-radius: 0 0 12px 12px;
}
.footer-btn {
  font-size: 15px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  padding: 8px 32px;
  cursor: pointer;
}

/* =========================
   버튼 스타일(공통)
========================= */
/* 저장(등록/결재/협조) 버튼 스타일 */
.btn-save {
  font-size: 14px;
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
.btn-save:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
/* 삭제/취소 버튼 스타일 */
.btn-delete {
  font-size: 14px;
  font-weight: bold;
  background-color: #D3D3D3;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-delete:hover {
  background-color: #000;
  color: #fff;
}
</style>
  