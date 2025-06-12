<template>
    <!-- 모달 전체 오버레이: 백그라운드 클릭 시 닫힘 -->
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <!-- 모달 제목 -->
        <div class="model-text">
          <h3 class="modal-title">결재선 설정</h3>
        </div>
  
        <!-- 상단: 탭/정렬/검색/삭제 -->
        <div class="modal-header">
          <div class="tab-group">
            <button class="active">조직도</button>
          </div>
          <div class="sort-search-group">
            <!-- 정렬 키 선택 => 이름 또는 부서 -->
            <select v-model="sortKey">
              <option value="name">이름</option>
              <option value="department">부서</option>
            </select>
            <!-- 검색어 입력 -->
            <input type="text" v-model="search" placeholder="검색" />
          </div>
          <!-- 선택된 결재자 삭제 -->
          <button class="delete-btn btn-delete" @click="deleteSelectedApprovers">
            삭제
          </button>
        </div>
  
        <div class="modal-body">
          <!-- 좌측: 조직도 및 팀원 목록 -->
          <div class="org-tree-area">
            <EHierarchy />
            <ul class="employee-list">
              <li
                v-for="emp in sortedAndFilteredNodes"
                :key="emp.employeeId"
                @click="selectEmployee(emp)"
                :class="{ selected: emp.employeeId === selectedNode?.employeeId }"
              >
                {{ emp.employeeName }} ({{ emp.positionName }})
              </li>
              <li v-if="!sortedAndFilteredNodes.length" class="no-result">
                검색 결과가 없습니다.
              </li>
            </ul>
          </div>
  
          <!-- 중앙: 결재/협조 버튼 -->
          <div class="action-btns">
            <button
              class="action-btn btn-save"
              @click="addApprovers('결재')"
              :disabled="!selectedNode"
            >
              결재
            </button>
            <button
              class="action-btn btn-save"
              @click="addApprovers('협조')"
              :disabled="!selectedNode"
            >
              협조
            </button>
          </div>
  
          <!-- 우측: 결재선 테이블 (순서, 결재유형, 이름만 표시) -->
          <div class="approver-table-area">
            <table class="approver-table">
              <thead>
                <tr>
                  <th><input type="checkbox" @change="toggleAllApprovers" :checked="allSelected" /></th>
                  <th>순서</th>
                  <th>결재유형</th>
                  <th>이름</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in approverList" :key="item.employeeId">
                  <td>
                    <input
                      type="checkbox"
                      :value="item.employeeId"
                      v-model="selectedApprovers"
                    />
                  </td>
                  <td>{{ idx + 1 }}</td>
                  <td>{{ item.type }}</td>
                  <td>{{ item.name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        <!-- 하단: 취소 / 등록 -->
        <div class="modal-footer">
          <button class="footer-btn cancel btn-delete" @click="$emit('close')">
            취소
          </button>
          <button
            class="footer-btn submit btn-save"
            @click="$emit('submit', approverList)"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import EHierarchy from '@/components/draftdoc/EHierarchy.vue'
  
  const props = defineProps({
    hierarchy: Array,
    initialApprovers: {
      type: Array,
      default: () => []
    }
  })
  const emit = defineEmits(['submit', 'close'])
  
  const sortKey = ref('name')
  const search = ref('')
  
  const approverList = ref([])
  const selectedApprovers = ref([])
  const selectedNodes = ref([])
  const selectedNode = ref(null)
  
  // 초기 결재선 매핑 (props.initialApprovers 사용 시)
  onMounted(() => {
    approverList.value = props.initialApprovers.map((a, idx) => ({
      step: a.stepNo ?? idx + 1,
      type: a.typeLabel || '결재',
      name: a.employeeName,
      employeeId: a.employeeId
    }))
  })
  
  function onTeamSelected(node) {
    selectedNodes.value = node.members || []
    selectedNode.value = null
    selectedApprovers.value = []
  }
  
  function selectEmployee(emp) {
    selectedNode.value = emp
  }
  
  const filteredNodes = computed(() => {
    const q = search.value.trim().toLowerCase()
    return q
      ? selectedNodes.value.filter(
          emp =>
            emp.employeeName.toLowerCase().includes(q) ||
            emp.positionName.toLowerCase().includes(q)
        )
      : selectedNodes.value
  })
  
  const sortedAndFilteredNodes = computed(() => {
    const list = [...filteredNodes.value]
    return sortKey.value === 'name'
      ? list.sort((a, b) => a.employeeName.localeCompare(b.employeeName))
      : list.sort((a, b) => (a.departmentName || '').localeCompare(b.departmentName))
  })
  
  function addApprovers(typeLabel) {
    console.log(`${typeLabel} 버튼 클릭:`, selectedNode.value)
    if (!selectedNode.value) return
    const emp = selectedNode.value
    if (!approverList.value.some(a => a.employeeId === emp.employeeId)) {
      approverList.value.push({
        step: approverList.value.length + 1,
        type: typeLabel,
        name: emp.employeeName,
        employeeId: emp.employeeId
      })
    }
  }
  
  const allSelected = computed(
    () =>
      approverList.value.length > 0 &&
      selectedApprovers.value.length === approverList.value.length
  )
  
  function toggleAllApprovers(e) {
    selectedApprovers.value = e.target.checked
      ? approverList.value.map(a => a.employeeId)
      : []
  }
  
  function deleteSelectedApprovers() {
    approverList.value = approverList.value.filter(
      item => !selectedApprovers.value.includes(item.employeeId)
    )
    selectedApprovers.value = []
  }
  </script>
  
  <style scoped>
  .employee-list {
    list-style: none;
    margin: 16px 0 0;
    padding: 0;
    max-height: 200px;
    overflow-y: auto;
  }
  .employee-list li {
    padding: 6px 8px;
    margin-bottom: 4px;
    cursor: pointer;
    border-radius: 4px;
  }
  .employee-list li.selected {
    background-color: #e0f4ff;
  }
  .no-result {
    color: #888;
    text-align: center;
  }
  
  /* ... 나머지 기존 스타일 유지 ... */
  
  
  
  
  /* 좌측 팀원 리스트 스타일 */
  
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
    