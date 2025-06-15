<template>

  <!-- ① 모달 외곽: 배경 클릭하면 모달 닫기 -->
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- ② 모달 제목 -->
      <div class="model-text">
        <h3 class="modal-title">결재선 설정</h3>
      </div>

      <!-- ③ 상단 컨트롤: 탭, 정렬, 검색, 삭제 -->
      <div class="modal-header">
        <!-- ③-1) 조직도/리스트 탭 -->
        <div class="tab-group">
          <button class="active">조직도</button>
        </div>
        <!-- ③-2) 정렬 키 선택 & 검색창 -->
        <div class="sort-search-group">
          <select v-model="sortKey">
            <option value="name">이름</option>
            <option value="department">부서</option>
          </select>
          <input type="text" v-model="search" placeholder="검색" />
        </div>
        <!-- ③-3) 체크된 결재자 삭제 버튼 -->
        <button class="delete-btn btn-delete" @click="deleteSelectedApprovers">
          삭제
        </button>
      </div>

      <!-- ④ 본문 영역: 조직도, 액션 버튼, 결재선 테이블 -->
      <div class="modal-body">
        <!-- ④-1) 좌측: EHierarchy 컴포넌트로 조직도 렌더링 -->
        <div class="org-tree-area">
          <!-- Listen for employees-selected event -->
          <EHierarchy
            @loaded-hierarchy="onHierarchyLoaded"
            @employees-selected="onEmployeesSelected"
          />
        </div>

        <!-- ④-2) 중앙: 선택된 직원에 대한 ‘결재’ / ‘협조’ 버튼 -->
        <div class="action-btns">
          <button class="action-btn btn-save" @click="addApprover('결재')" :disabled="!selectedNode?.employeeId">
            결재
          </button>
          <button class="action-btn btn-save" @click="addApprover('협조')" :disabled="!selectedNode?.employeeId">
            협조
          </button>
        </div>

        <!-- ④-3) 우측: 현재 선택된 결재선 리스트 테이블 -->
        <div class="approver-table-area">
          <table class="approver-table">
            <thead>
              <tr>
                <!-- ④-3-1) 전체 선택 체크박스 -->
                <th>
                  <input type="checkbox" 
                          @change="toggleAllApprovers" 
                          :checked="allSelected"/>
                </th>
                <th>순서</th>
                <th>결재유형</th>
                <th>이름</th>
              </tr>
            </thead>
            <tbody>
              <!-- ④-3-2) 각 결재자 행 반복 렌더링 -->
              <tr v-for="(item, idx) in approverList" :key="item.employeeId">
                <td>
                  <input type="checkbox" 
                          :value="item.employeeId" 
                          v-model="selectedApprovers"/>
                </td>
                <td>{{ idx + 1 }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ⑤ 하단 버튼: 취소(닫기) / 등록(emit submit) -->
      <div class="modal-footer">
        <button class="footer-btn cancel btn-delete" @click="$emit('close')">취소</button>
        <button class="footer-btn submit btn-save" @click="submitSelection">등록</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EHierarchy from '@/components/eapproval/EHierarchy.vue'

// ⑥ Props 정의: 상위에서 받은 조직도(hierarchy)와 초기 결재선(initialApprovers)
const props = defineProps({
  hierarchy: { type: Array, default: () => [] },
  initialApprovers: { type: Array, default: () => [] }
})
const emit = defineEmits(['submit', 'close'])

// ⑦ 로컬 상태 변수 선언
const sortKey = ref('name')
const search = ref('')

// 결재선 리스트 및 선택 상태
const approverList = ref([])
const selectedApprovers = ref([])
const hierarchy = ref([])
// 현재 직원 목록 & 선택된 사원
const selectedNodes = ref([])
const selectedNode = ref(null)

// ⑧ 컴포넌트 마운트 시: initialApprovers 복사 + 조직도 로딩
onMounted(() => {
  // copy initial approvers
  approverList.value = props.initialApprovers.map((a, i) => ({
    step: a.step || i + 1,
    name: a.name,
    employeeId: a.employeeId,
    position: a.position,
    team: a.team,
    rank: a.rank,
    status: a.status,
    type: a.type,
    lineTypeLabel: a.lineTypeLabel,
    viewedAt: a.viewedAt,
    approvedAt: a.approvedAt,
    comment: a.comment
  }))
  selectedNodes.value = flattenAllEmployees(props.hierarchy)
})

// ⑨ 조직도 평탄화 헬퍼 함수
function flattenAllEmployees(tree) {
  const list = [];
  tree.forEach(head => {
    head.departments?.forEach(dept => {
      dept.teams?.forEach(team => {
        team.members?.forEach(emp => {
          // emp 자체에 teamName, departmentName, headName 을 붙여서
          list.push({
            ...emp,
            teamName:       team.teamName,
            departmentName: dept.departmentName,
            headName:       head.headName
          });
        });
      });
    });
  });
  return list;
}

// ⑩ 이벤트 핸들러들
function onEmployeesSelected(ids, emp) {
  console.log('선택된 ID:', ids)
  console.log('선택된 객체:', emp)

  selectedNodes.value = flattenAllEmployees(hierarchy.value).filter(emp =>
    ids.includes(Number(emp.employeeId))
  )

  // 수동으로 선택된 객체가 있을 경우 우선 사용
  selectedNode.value = emp || (selectedNodes.value.length > 0 ? selectedNodes.value[0] : null)

  console.log('선택된 사원 객체:', selectedNode.value)
}

// 직원 클릭
function selectEmployee(emp) {
  console.log('Selected:', emp)
  selectedNode.value = emp
}

// 검색 + 필터
const filteredNodes = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q
    ? selectedNodes.value.filter(
        e => e.employeeName.toLowerCase().includes(q) || e.positionName.toLowerCase().includes(q)
      )
    : selectedNodes.value
})
const filteredAndSortedNodes = computed(() => {
  const arr = [...filteredNodes.value]
  return sortKey.value === 'name'
    ? arr.sort((a, b) => a.employeeName.localeCompare(b.employeeName))
    : arr.sort((a, b) => (a.departmentName || '').localeCompare(b.departmentName))
})
function onHierarchyLoaded(loaded) {
  hierarchy.value = loaded
  selectedNodes.value = flattenAllEmployees(loaded)
}
// 결재/협조 버튼
function addApprover(type) {
  if (!selectedNode.value) return
  console.log('Adding:', type, selectedNode.value)
  if (!approverList.value.some(a => a.employeeId === selectedNode.value.employeeId)) {
    approverList.value.push({
      step: approverList.value.length + 1,
      name: selectedNode.value.employeeName,
      employeeId: selectedNode.value.employeeId,
      position: selectedNode.value.positionName,
      team: selectedNode.value.teamName || '',
      status: '대기중',
      type: type,
      lineTypeLabel: '양식 결재선',
      viewedAt: null,
      approvedAt: null,
      comment: ''
    })
  }
}

// 전체선택, 삭제, 등록
const allSelected = computed(() =>
  approverList.value.length && selectedApprovers.value.length === approverList.value.length
)
function toggleAllApprovers(e) { selectedApprovers.value = e.target.checked ? approverList.value.map(a => a.employeeId) : [] }
function deleteSelectedApprovers() { approverList.value = approverList.value.filter(a => !selectedApprovers.value.includes(a.employeeId)); selectedApprovers.value = [] }
function submitSelection() {   
  const approvers = approverList.value.map(item => ({
    ...item,
    employeeId: Number(item.employeeId) // ← string → number (Long)
  }))
  console.log('🟡 등록될 결재선 리스트:', approvers); // 이걸 추가
  emit('submit', approvers) }
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
    .btn-save:disabled {
      background: #b3e3f7;
      color: #fff;
      cursor: not-allowed;
      border-color: #b3e3f7;
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
      