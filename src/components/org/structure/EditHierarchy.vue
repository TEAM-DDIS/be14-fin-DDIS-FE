<template>
  <div class="org-container">
    <div
      class="node head-root"
      @click="toggleRoot"
      :class="{ 'expanded-root': expandedRoot }"
    >
      <i :class="expandedRoot ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"></i>
      DDIS <span class="rep">{{ getCompanyRep() }}</span>
    </div>
    <div class="control-buttons">
      <button @click="expandAll" class="control-btn">전체 보기</button>
      <button @click="collapseAll" class="control-btn">전체 닫기</button>
    </div>

    <ul v-show="expandedRoot" class="org-list">
      <li v-for="hq in headquarters" :key="hq.headCode">
        <div
          class="node head"
          @click="toggleHead(hq.headCode)"
          @dragover.prevent="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop('head', hq, $event)"
        >
          <i :class="expanded[hq.headCode] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'" />
          {{ hq.headName }}
          <button
              v-if="!expanded[hq.headCode]"
              @click.stop="expandHead(hq)"
              class="sub-btn"
            >+</button>
            <button
              v-else
              @click.stop="collapseHead(hq)"
              class="sub-btn"
            >-</button>
        </div>

        <ul v-show="expanded[hq.headCode]">
          <li
            v-for="dept in getDepartments(hq.headId)"
            :key="dept.departmentCode"
          >

            <div
              class="node dept"
              @click.stop="selectDepartment(dept)"
              draggable="true"
              @dragstart="onDragStart('department', dept)"
              @dragover.prevent="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop('department', dept, $event)"
            >
              <i
                :class="expanded[dept.departmentCode]
                  ? 'fa fa-chevron-down'
                  : 'fa fa-chevron-right'"
              />
              {{ dept.departmentName }}
              <button
                  v-if="!expanded[dept.departmentCode]"
                  @click.stop="expandDept(dept)"
                  class="sub-btn"
                >+</button>
                <button
                  v-else
                  @click.stop="collapseDept(dept)"
                  class="sub-btn"
                >-</button>
            </div>

            <ul v-show="expanded[dept.departmentCode]">
              <li
                v-for="team in getTeams(dept.departmentId)"
                :key="team.teamCode"
              >
                <div
                  class="node team"
                  @click.stop="selectTeam(team)"
                  draggable="true"
                  @dragstart="onDragStart('team', team)"
                  @dragover.prevent="onDragOver"
                  @dragleave="onDragLeave"
                  @drop="onDrop('team', team, $event)"
                >
                  <i
                    :class="expanded[team.teamCode]
                      ? 'fa fa-chevron-down'
                      : 'fa fa-chevron-right'"
                  />
                  {{ team.teamName }}
                  
                </div>
                <ul v-show="expanded[team.teamCode]">
                  <li
                    v-for="emp in getEmployeesByTeam(team.teamCode)"
                    :key="emp.employeeId"
                  >
                    <div class="node emp">
                      {{ emp.rankName }} {{ emp.positionName }}: {{ emp.employeeName }}
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    
    <div class="move-buttons">
      <button class="btn-cancel" @click="cancelChanges">취소</button>
      <button class="btn-confirm" :disabled="pendingMoves.length === 0" @click="saveChanges">
        저장
      </button>
      <span v-if="pendingMoves.length">(총 {{ pendingMoves.length }}건 대기 중)</span>
    </div>

    <BaseToast ref="toastRef" />

    <CancelModal
      v-if="showCancelModal"
      message="모든 변경을 취소하시겠습니까?"
      @confirm="onCancelConfirmed"
      @close="showCancelModal = false"
    />
  </div>
</template>

<script setup>
const emit = defineEmits(['dept-selected', 'team-selected', 'reload'])
const props = defineProps({
  headquarters: Array,
  departments:  Array,
  teams:        Array,
  employees:    Array,
})

import { reactive, ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BaseToast from '@/components/toast/BaseToast.vue'
import CancelModal from '@/components/org/structure/CancelModal.vue'

const router    = useRouter()
const userStore = useUserStore()
const toastRef  = ref(null)
const dragData = ref({ type: null, item: null }) 
const pendingMoves = ref([])
const showCancelModal = ref(false)

const expandedRoot = ref(true)
const expanded = reactive({}) 

const headquarters = ref([]) 
const departments = ref([]) 
const teams = ref([]) 
const employees = ref([]) 

const localHQ   = ref([])
const localDepts= ref([])
const localTeams= ref([])
const localEmps = ref([])

function showToast(msg) {
  toastRef.value?.show(msg)
}

function initialize() {
  localHQ.value    = [...props.headquarters]
  localDepts.value = [...props.departments]
  localTeams.value = [...props.teams]
  localEmps.value  = [...props.employees]

  expandedRoot.value = true
  Object.keys(expanded).forEach(k => expanded[k] = false)

  pendingMoves.value = []
}

onMounted(initialize)
watch(() => props.headquarters, initialize, { deep: true })

function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

const token = userStore.accessToken
const payload = parseJwtPayload(userStore.accessToken || token)
const isHR = payload?.role?.includes('ROLE_HR') || payload?.auth?.includes('ROLE_HR')

if (!isHR) {
  showToast('접근 권한이 없습니다.')
  router.push('/error403')
}


onMounted(async () => {
  try {
    const { data } = await axios.get(
      'http://localhost:5000/structure/hierarchy',
      { headers: { Authorization: `Bearer ${token}` } }
    )

    headquarters.value = data.map(h => ({
      headId: h.headId,
      headName: h.headName,
      headCode: h.headCode || '',
      departments: h.departments 
    }))

    const deptList = []
    const teamList = []
    const empList = []

    data.forEach(hq => {
      hq.departments.forEach(d => {
        deptList.push({
          departmentId: d.departmentId,
          departmentName: d.departmentName,
          departmentCode: d.departmentCode,
          headId: hq.headId
        })
        d.teams.forEach(t => {
          teamList.push({
            teamId: t.teamId,
            teamName: t.teamName,
            teamCode: t.teamCode,
            departmentId: d.departmentId
          })
          t.members.forEach(e => {
            empList.push({
              employeeId:   e.employeeId,
              employeeName: e.employeeName,
              positionCode: e.positionCode,
              positionName: e.positionName,
              rankCode:     e.rankCode,
              rankName:     e.rankName,
              headCode:     e.headCode || '',
              departmentCode: e.departmentCode || '',
              teamCode:     e.teamCode || '',
              email:        e.email || '',
              birthdate:    e.birthdate || ''
            })
          })
        })
      })
    })

    departments.value = deptList
    teams.value       = teamList
    employees.value   = empList

  } catch (err) {
    showToast('초기 데이터 로드에 실패했습니다.')
  }
})

function toggleRoot() {
  expandedRoot.value = !expandedRoot.value
}
function toggleHead(headCode) {
  expanded[headCode] = !expanded[headCode]
}
function toggleDept(deptCode) {
  expanded[deptCode] = !expanded[deptCode]
}
function toggleTeam(teamCode) {
  expanded[teamCode] = !expanded[teamCode]
}

function selectDepartment(dept) {
  toggleDept(dept.departmentCode)
  emit('dept-selected', dept)
}

function selectTeam(team) {
  toggleTeam(team.teamCode)
  emit('team-selected', team)
}


function onDragStart(type, item) {
  dragData.value = { type, item }
}

function onDragOver(event) {
  const node = event.currentTarget.querySelector('.node')
  if (node) node.classList.add('drag-over')
}

function onDragLeave(event) {
  const node = event.currentTarget.querySelector('.node')
  if (node) node.classList.remove('drag-over')
}

async function onDrop(targetType, targetItem, event) {
  const node = event.currentTarget.querySelector('.node')
  if (node) node.classList.remove('drag-over')

  const { type, item } = dragData.value
  console.log('onDrop', type, '→', targetType, item, 'to', targetItem)
  if (type === 'department' && targetType === 'head') {
    item.headId = targetItem.headId
    pendingMoves.value.push({
      type: 'department',
      itemId: item.departmentId,
      newParentId: item.headId,
      payload: {
        departmentName: item.departmentName,
        headId: item.headId
      }
    })
  }
  else if (type === 'team' && targetType === 'department') {
    item.departmentId = targetItem.departmentId
     pendingMoves.value.push({
      type: 'team',
      itemId: item.teamId,
      newParentId: item.departmentId,
      payload: {
        teamName: item.teamName,
        departmentId: item.departmentId
      }
    })
  }
    dragData.value = { type: null, item: null }
  }

function getDepartments(headId) {
  return localDepts.value.filter(d => d.headId === headId)
}
function getTeams(deptId) {
  return localTeams.value.filter(t => t.departmentId === deptId)
}
function getEmployeesByTeam(teamCode) {
  return localEmps.value.filter(e => e.teamCode === teamCode)
}

function getCompanyRep() {
  const ceo = employees.value.find(e => e.positionCode === 'P005')
  return ceo ? ceo.employeeName : ''
}

// 변경 이력 저장
async function saveChanges() {
  try {
    for (const mv of pendingMoves.value) {
      const url = `http://localhost:5000/org/update/${mv.type}/${mv.itemId}`
      await axios.put(
        url,
        mv.payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )
    }
    showToast('변경 사항이 저장되었습니다.')
    pendingMoves.value = []
    initialize()
    emit('reload')
  } catch (err) {
    console.error(err)
    showToast('저장 중 오류가 발생했습니다.')
  }
}
async function cancelChanges() {
  showCancelModal.value = true
}

function onCancelConfirmed() {
  initialize()
  emit('reload')
  showCancelModal.value = false
}

// 하이라키 열기, 닫기
function expandAll() {
  expandedRoot.value = true
  headquarters.value.forEach(hq => {
    expanded[hq.headCode] = true
  })
  departments.value.forEach(dept => {
    expanded[dept.departmentCode] = true
  })
  teams.value.forEach(team => {
    expanded[team.teamCode] = true
  })
}

function collapseAll() {
  expandedRoot.value = false
  Object.keys(expanded).forEach(key => {
    expanded[key] = false
  })
}

function expandHead(head) {
  expanded[head.headCode] = true
  head.departments.forEach(dept => {
    expanded[dept.departmentCode] = true
    dept.teams.forEach(team => {
      expanded[team.teamCode] = true
    })
  })
}

function collapseHead(head) {
  expanded[head.headCode] = false
  head.departments.forEach(dept => {
    expanded[dept.departmentCode] = false
    dept.teams.forEach(team => {
      expanded[team.teamCode] = false
    })
  })
}

function expandDept(dept) {
  expanded[dept.departmentCode] = true
  dept.teams.forEach(team => {
    expanded[team.teamCode] = true
  })
}

function collapseDept(dept) {
  expanded[dept.departmentCode] = false
  dept.teams.forEach(team => {
    expanded[team.teamCode] = false
  })
}
</script>

<style scoped>
.org-container {
  font-size: 14px;
  color: var(--text-main);
  padding: 0 12px;
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 4px;
  justify-content: flex-end;
}

.control-btn {
  background-color: #3f3f3f;
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.control-btn:hover {
  background-color: white;
  color: #3f3f3f;
  border-color: #3f3f3f;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.sub-btn {
  margin-left: 8px;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border: none;
  border-radius: 4px;
  background: #ddd;
  cursor: pointer;
}
.sub-btn:hover {
  background: #aaa;
}

.node.head-root {
  font-size: 20px;
  font-weight: bold;

  display: flex;
  align-items: center;
  cursor: pointer;
}
.node.head-root i {
  margin-right: 6px;
  font-size: 12px;
  color: #00a8e8;
}

.org-list,
.org-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.org-list li {
  position: relative;
  padding-left: 30px;
}

.org-list li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 14px;
  width: 2px;
  height: 100%;
  background: #ccc;
}

.org-list li::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 14px;
  width: 15px;
  height: 2px;
  background: #ccc;
}

.node {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
}
.node i {
  margin-right: 6px;
  font-size: 12px;
  color: #00a8e8;
}

.node.head,
.node.dept,
.node.team {
  font-weight: bold;
}
.node.head {
  font-size: 20px;
  margin-bottom: 12px;
}
.node.dept {
  font-size: 19px;
  margin-bottom: 8px;
}
.node.team {
  font-size: 18px;
  margin-bottom: 6px;
}
.node.emp {
  font-size: 16px;
  margin-bottom: 5px;
  color: #555;
  cursor: default;
}
.node i {
  margin-right: 6px;
  font-size: 12px;
  color: #00a8e8;
}

.node.head:hover,
.node.dept:hover,
.node.team:hover {
  color: #00a8e8;
  cursor: pointer;
}

.drag-over {
  border: 1px solid #2f80ed !important;
  background-color: #eaf4ff !important;
}

.move-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin: 20px 0px;
}

.btn-confirm {
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}

.btn-confirm:hover {
  background-color: #fff;
  color: #00a8e8;
  border: 1px solid #00a8e8;
}

.btn-cancel {
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
.btn-cancel:hover {
  background-color: #000;
  color: #fff;
}
</style>
