<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- 모달 제목 -->
      <div class="model-text">
        <h3 class="modal-title">사원 선택</h3>
      </div>

      <!-- 상단: 탭/정렬/검색/삭제 -->
      <div class="modal-header">
        <div class="tab-group">
          <button class="active">조직도</button>
        </div>
        <div class="sort-search-group">
          <select v-model="sortKey">
            <option value="name">이름</option>
            <option value="department">부서</option>
          </select>
          <input type="text" v-model="search" placeholder="검색" />
        </div>
        <button class="delete-btn btn-delete" @click="deleteSelectedEmployees">
          삭제
        </button>
      </div>

      <!-- 본문 -->
      <div class="modal-body">
        <!-- 좌측: 조직도 트리 + 직원 리스트 -->
        <div class="org-tree-area">
          <!-- Listen for employees-selected event -->
          <EHierarchy
            @loaded-hierarchy="onHierarchyLoaded"
            @employees-selected="onEmployeesSelected"
          />
        </div>

        <!-- 중앙: 선택 버튼 -->
        <div class="action-btns">
          <button class="action-btn btn-save" @click="addEmployee()" :disabled="!selectedNode?.employeeId">
            선택
          </button>
        
        </div>

        <!-- 우측: 결재선 테이블 -->
        <div class="approver-table-area">
          <table class="approver-table">
            <thead>
              <tr>
                <th><input type="checkbox" @change="toggleAllEmployees" :checked="allSelected"/></th>
                <th>순서</th>
                <th>사원번호</th>
                <th>사원명</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in employeeList" :key="item.employeeId">
                <td><input type="checkbox" :value="item.employeeId" v-model="selectedEmployees"/></td>
                <td>{{ idx + 1 }}</td>
                <td>{{ item.employeeId }}</td>
                <td>{{ item.employeeName }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 하단: 취소/등록 -->
      <div class="modal-footer">
        <button class="footer-btn cancel btn-delete" @click="$emit('close')">취소</button>
        <button class="footer-btn submit btn-save" @click="submitSelection">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EHierarchy from '@/components/eapproval/EHierarchy.vue'

const props = defineProps({
  hierarchy: { type: Array, default: () => [] },
  initialEmployees: { type: Array, default: () => [] }
})
const emit = defineEmits(['submit', 'close', 'update'])

// 정렬 및 검색 상태
const sortKey = ref('name')
const search = ref('')

// 결재선 리스트 및 선택 상태
const employeeList = ref([])
const selectedEmployees = ref([])
const hierarchy = ref([])
// 현재 직원 목록 & 선택된 사원
const selectedNodes = ref([])
const selectedNode = ref(null)

// 초기 부모 결재선 복사 & 전체 직원 세팅
onMounted(() => {
  employeeList.value = props.initialEmployees.map((e, i) => ({

    employeeId:     e.employeeId,
    employeeName:   e.employeeName,
    headName:       e.headName,
    departmentName: e.departmentName,
    teamName:       e.teamName,
    jobName:        e.jobName,
    positionName:   e.positionName,
    rankName:       e.rankName
  }))

  // 기존과 같이, 트리로부터 전체 사원 리스트 플래트닝
  selectedNodes.value = flattenAllEmployees(props.hierarchy)
})


// flatten helper
function flattenAllEmployees(tree) {
  const list = []
  tree.forEach(head => {
    head.departments?.forEach(dept => {
      dept.teams?.forEach(team => {
        team.members?.forEach(emp => {
          list.push({
            // 기존 emp 필드 그대로 복사
            ...emp,
            // 부모 노드 정보 추가
            headId:       head.headId,
            headName:     head.headName,
            headCode:     head.headCode,

            departmentId: dept.departmentId,
            departmentName: dept.departmentName,
            departmentCode: dept.departmentCode,

            teamId:       team.teamId,
            teamName:     team.teamName,
            teamCode:     team.teamCode,

            jobId:          emp.jobId,
            jobName:        emp.jobName,
            jobCode:        emp.jobCode,

            positionCode:   emp.positionCode,
            positionName:   emp.positionName,

            rankCode:       emp.rankCode,
            rankName:       emp.rankName,
          })
        })
      })
    })
  })
  return list
}


// EHierarchy 선택 이벤트 수신
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

// 사원 정보 load
function onHierarchyLoaded(loaded) {
  hierarchy.value = loaded
  selectedNodes.value = flattenAllEmployees(loaded)
}
// 결재/협조 버튼
function addEmployee() {
  if (!selectedNode.value) return

  // 중복 방지
  if (employeeList.value.some(e => e.employeeId === selectedNode.value.employeeId)) {
    return
  }

  employeeList.value.push({
    employeeId:       selectedNode.value.employeeId,
    employeeName:     selectedNode.value.employeeName,
    headName:         selectedNode.value.headName,
    headCode:         selectedNode.value.headCode,
    departmentName:   selectedNode.value.departmentName,
    departmentCode:   selectedNode.value.departmentCode,
    teamName:         selectedNode.value.teamName,
    teamCode:         selectedNode.value.teamCode,
    jobName:          selectedNode.value.jobName,
    jobCode:          selectedNode.value.jobCode,
    positionName:     selectedNode.value.positionName,
    positionCode:     selectedNode.value.positionCode,
    rankName:         selectedNode.value.rankName,
    rankCode:         selectedNode.value.rankCode
  })
   emit('update', employeeList.value)
}


// 전체선택, 삭제, 등록
const allSelected = computed(() =>
  employeeList.value.length && selectedEmployees.value.length === employeeList.value.length
)
function toggleAllEmployees(e) { 
  selectedEmployees.value = e.target.checked ? employeeList.value.map(a => a.employeeId) : [] }

function submitSelection() {   
  const employees = employeeList.value.map(item => ({
    ...item,
    employeeId: Number(item.employeeId) // ← string → number (Long)
  }))
  emit('submit', employees)
 }

  function deleteSelectedEmployees() {
  employeeList.value = employeeList.value.filter(
    a => !selectedEmployees.value.includes(a.employeeId)
  );
  selectedEmployees.value = [];
   emit('update', employeeList.value)
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
  