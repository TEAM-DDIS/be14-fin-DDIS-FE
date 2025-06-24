<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="model-text">
        <h2 class="modal-title">사원 선택</h2>
      </div>
      <div class="modal-header">
        <div class="search-bar">
          <select v-model="searchType">
            <option value="name">사원명</option>
            <option value="id">사원번호</option>
            <option value="position">직책</option>
            <option value="rank">직급</option>
          </select>
          <input v-model="search" type="text" placeholder="검색어 입력" />
        </div>
        <button class="delete-btn btn-delete" @click="deleteSelectedEmployees">
          삭제
        </button>
      </div>

      <div class="modal-body">
        <div class="org-tree-area">
          <ul class="employee-search-result scrollbar" v-if="search.trim() && filteredAndSortedNodes.length">
            <li
              v-for="emp in filteredAndSortedNodes"
              :key="emp.employeeId"
              :class="{ selected: selectedNode?.employeeId === emp.employeeId }"
              @click="onEmployeesSelected([emp.employeeId], emp)"
            >
              {{ emp.employeeName }} ({{ emp.positionName }}, {{ emp.rankName }})
            </li>
          </ul>
          <div v-else-if="search.trim() && filteredAndSortedNodes.length === 0" class="no-result">
            검색 결과가 없습니다.
          </div>
          <Hierarchy
            @loaded-hierarchy="onHierarchyLoaded"
            @employees-selected="onEmployeesSelected"
          />
        </div>

        <div class="action-btns">
          <button class="action-btn btn-save" @click="addEmployee()" :disabled="!selectedNode?.employeeId">
            선택
          </button>
        </div>

        <div class="approver-table-area">
          <table class="approver-table">
            <colgroup>
              <col style="width: 45px;" />
              <col style="width: 50px;" />
              <col style="width: 120px;" />
              <col style="width: 90px;" />
            </colgroup>
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
                <td>
                  <input
                    type="checkbox"
                    :checked="selectedEmployees.includes(item.employeeId)"
                    :disabled="disabledEmployees.includes(item.employeeId)"
                    @change="onCheckboxChange(item.employeeId)"
                  />
                </td>
                <td>{{ idx + 1 }}</td>
                <td>{{ item.employeeId }}</td>
                <td>{{ item.employeeName }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-btn">
          <button class="btn-delete" @click="$emit('close')">취소</button>
          <button class="btn-save" @click="submitSelection">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Hierarchy from '@/components/org/appointment/GetHierarchy.vue'

const props = defineProps({
  hierarchy: { type: Array, default: () => [] },
  initialEmployees: { type: Array, default: () => [] }
})
const emit = defineEmits(['submit', 'close', 'update'])

const searchType = ref('name')
const search = ref('')

const employeeList = ref([])
const selectedEmployees = ref([])
const disabledEmployees = ref([])
const hierarchy = ref([])
const selectedNodes = ref([])
const selectedNode = ref(null)

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

  selectedNodes.value = flattenAllEmployees(props.hierarchy)
})

function flattenAllEmployees(tree) {
  const list = []
  tree.forEach(head => {
    head.departments?.forEach(dept => {
      dept.teams?.forEach(team => {
        team.members?.forEach(emp => {
          list.push({
            ...emp,
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

function onEmployeesSelected(ids, emp) {
  console.log('선택된 ID:', ids)
  console.log('선택된 객체:', emp)

  selectedNodes.value = flattenAllEmployees(hierarchy.value).filter(emp =>
    ids.includes(Number(emp.employeeId))
  )
  selectedNode.value = emp || (selectedNodes.value.length > 0 ? selectedNodes.value[0] : null)
  console.log('선택된 사원 객체:', selectedNode.value)
}

const filteredNodes = computed(() => {
 const q = search.value.trim().toLowerCase()
  const type = searchType.value

  if (!q) return selectedNodes.value

  return selectedNodes.value.filter(emp => {
    if (type === 'name') {
      return emp.employeeName?.toLowerCase().includes(q)
    } else if (type === 'id') {
      return emp.employeeId?.toLowerCase().includes(q)
    } else if (type === 'position') {
      return emp.positionName?.toLowerCase().includes(q)
    } else if (type === 'rank') {
      return emp.rankName?.toLowerCase().includes(q)
    }    
    return false
  })
})

const filteredAndSortedNodes = computed(() => {
  const arr = [...filteredNodes.value]
  return searchType.value === 'name'
    ? arr.sort((a, b) => a.employeeName.localeCompare(b.employeeName))
    : arr.sort((a, b) => (a.departmentName || '').localeCompare(b.departmentName))
})

function onHierarchyLoaded(loaded) {
  hierarchy.value = loaded
  selectedNodes.value = flattenAllEmployees(loaded)
}

function addEmployee() {
  if (!selectedNode.value) return

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

function onCheckboxChange(id) {
  if (disabledEmployees.value.includes(id)) return
  selectedEmployees.value = [id]
}

function submitSelection() {
  disabledEmployees.value.push(...selectedEmployees.value)

  selectedEmployees.value = []
  const payload = employeeList.value.map(item => ({
    ...item,
    employeeId: Number(item.employeeId)
  }))
  emit('submit', payload)
}

  disabledEmployees.value.push(...selectedEmployees.value)
  selectedEmployees.value = []

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
  background: var(--modal-bg);
  border-radius: 12px;
  width: 900px;
  min-width: 700px;
  max-width: 98vw;
  min-height: 600px;
  box-shadow: 0 2px 24px rgba(0,0,0,0.13);
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 0 0 0 0;
}

.model-text {
  padding: 24px 0 0 0;
  text-align: center;
  color: var(--text-main);
}
.modal-title {
  margin-bottom: 30px;
  margin-left: 0;
  color: var(--text-main);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 0 18px 0 18px;
  border-bottom: 1.5px solid var(--border-color);
  position: relative;
  flex-wrap: nowrap;
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

.modal-body {
  display: flex;
  flex: 1;
  min-height: 400px;
  padding: 0 32px 0 32px; 
  gap: 24px;
  margin-top: 8px;
  align-items: stretch;
  justify-content: center;
}
.org-tree-area, .approver-table-area {
  flex: 1 1 0;
  min-width: 320px;
  max-width: 420px;
  height: 410px;
  background: #fff;
  border: none;
  border-radius: 12px;
  padding: 24px 16px 24px 16px;
  overflow-y: auto;
  box-sizing: border-box;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background: var(--modal-box-bg);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
  margin-left: 12px;
  flex-shrink: 0;
}

.search-bar select {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 14px;
  min-width: 90px;
  background: var(--modal-box-bg);
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  color: var(--text-main);
}

.search-bar input {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  width: 180px;
  background: var(--modal-box-bg);
  color: var(--text-main);
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.employee-search-result {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  width: 100%;
  font-size: 14px;
  max-height: 180px;
  overflow-y: auto;
  background: var(--modal-bg);
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
}

.employee-search-result li {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
  transition: background 0.2s;
  overflow-y: auto;
}

.employee-search-result.scrollbar {
  scrollbar-width: none;
}

.employee-search-result li:last-child {
  border-bottom: none;
}

.employee-search-result li:hover {
  background-color: var(--ag-primary-hover);
}

.employee-search-result li.selected {
  background-color: var(--ag-primary);;
  font-weight: bold;
}

.no-result {
  padding: 12px;
  color: #888;
  font-size: 14px;
  text-align: center;
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
  table-layout: fixed;
  border-collapse: collapse;
}



.approver-table th, .approver-table td {
  border: 1px solid var(--border-color);
  padding: 4px 6px;
  font-size: 15px;
  text-align: left; 
  overflow: hidden;
}
.approver-table th {
  background-color: var(--bg-label-cell);
  color: var(--text-main);
  font-weight: 600;
}
.approver-table td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 32px 24px 0;
  border-top: 1.5px solid var(--border-color);
  background: var(--modal-bg);
  border-radius: 0 0 12px 12px;
}
.footer-btn {
  right: 20px;
  gap: 15px;
  margin-bottom: 12px;
}

.btn-save {
  font-size: 14px;
  font-weight: bold;
  background-color: var(--primary);
  color: var(--text-on-primary);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-save:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
.btn-save:disabled {
  background: var(--bg-body);
  color: #727272b8;
  cursor: not-allowed;
  border-color: #ddd;
}
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
  margin-right: 12px;
  box-sizing: border-box;
}
.btn-delete:hover {
  background-color: #000;
  color: #fff;
}
</style>
  