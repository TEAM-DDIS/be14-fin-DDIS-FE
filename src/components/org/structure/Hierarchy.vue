<template>
  <div class="org-container">
    <h3 class="company-title">
      DDIS <span class="rep">{{ getCompanyRep() }}</span>
    </h3>
    <div class="control-buttons">
      <button @click="expandAll" class="control-btn">전체 보기</button>
      <button @click="collapseAll" class="control-btn">전체 닫기</button>
    </div>

    <div class="org-box">
      <ul class="org-list">
        <li v-for="head in hierarchy" :key="head.headId">
          <div class="node head" @click="toggle('h' + head.headId)">
            <i
              :class="expanded['h' + head.headId] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"
            />
            {{ head.headName }}
            <button
              v-if="!expanded['h' + head.headId]"
              @click.stop="expandHead(head)"
              class="sub-btn"
            >+</button>
            <button
              v-else
              @click.stop="collapseHead(head)"
              class="sub-btn"
            >-</button>
          </div>

          <ul v-show="expanded['h' + head.headId]" class="org-list">
            <li v-for="dept in head.departments" :key="dept.departmentId">
              <div class="node dept" @click.stop="onDepartmentClick(dept)">
                <i
                  :class="expanded['d' + dept.departmentId] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"
                />
                {{ dept.departmentName }}
                <button
                  v-if="!expanded['d' + dept.departmentId]"
                  @click.stop="expandDept(dept)"
                  class="sub-btn"
                >+</button>
                <button
                  v-else
                  @click.stop="collapseDept(dept)"
                  class="sub-btn"
                >-</button>
              </div>

              <div v-show="expanded['d' + dept.departmentId]" class="dept-children">
                <div v-if="dept.deptManager" class="node emp emp-manager">
                  부장: {{ dept.deptManager.employeeName }}
                </div>

                <ul class="team-list">
                  <li v-for="team in dept.teams" :key="team.teamId">
                    <div class="node team" @click.stop="onTeamClick(team)">
                      <i
                        :class="expanded['t' + team.teamId] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"
                      />
                      {{ team.teamName }}
                    </div>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const accessToken = useUserStore().accessToken

const emit = defineEmits(['dept-selected', 'team-selected'])

const hierarchy = ref([])
const expanded = reactive({})

onMounted(async () => {
  try {
    const res = await fetch('https://api.isddishr.site/structure/hierarchy', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    
    // 이사회 상위로
    hierarchy.value = data.sort((a, b) => {
      if (a.headId === 4) return -1
      if (b.headId === 4) return 1
      return a.headId - b.headId
    })
  } catch (err) {
    console.error('❌ 조직 계층 로드 실패:', err)
    hierarchy.value = []
  }
})

function toggle(key) {
  expanded[key] = !expanded[key]
}

function onDepartmentClick(dept) {
  toggle('d' + dept.departmentId)
  emit('dept-selected', dept)
}

function onTeamClick(team) {
  toggle('t' + team.teamId)
  emit('team-selected', team)
}

function getCompanyRep() {
  for (const head of hierarchy.value) {
    if (head.headManager?.positionCode === 'P005') {
      return head.headManager.employeeName
    }
  }
  return ''
}

function expandAll() {
  hierarchy.value.forEach(head => {
    expanded['h' + head.headId] = true
    head.departments.forEach(dept => {
      expanded['d' + dept.departmentId] = true
      dept.teams.forEach(team => {
        expanded['t' + team.teamId] = true
      })
    })
  })
}

function collapseAll() {
  hierarchy.value.forEach(head => {
    expanded['h' + head.headId] = false
    head.departments.forEach(dept => {
      expanded['d' + dept.departmentId] = false
      dept.teams.forEach(team => {
        expanded['t' + team.teamId] = false
      })
    })
  })
}

function expandHead(head) {
  expanded['h' + head.headId] = true
  head.departments.forEach(dept => {
    expanded['d' + dept.departmentId] = true
    dept.teams.forEach(team => {
      expanded['t' + team.teamId] = true
    })
  })
}

function collapseHead(head) {
  expanded['h' + head.headId] = false
  head.departments.forEach(dept => {
    expanded['d' + dept.departmentId] = false
    dept.teams.forEach(team => {
      expanded['t' + team.teamId] = false
    })
  })
}

function expandDept(dept) {
  expanded['d' + dept.departmentId] = true
  dept.teams.forEach(team => {
    expanded['t' + team.teamId] = true
  })
}

function collapseDept(dept) {
  expanded['d' + dept.departmentId] = false
  dept.teams.forEach(team => {
    expanded['t' + team.teamId] = false
  })
}

</script>

<style scoped>
.org-container {
  font-size: 14px;
  color: var(--text-main);
  padding: 0 12px;
  margin-bottom: 20px;
}
.company-title {
  font-size: 18px;
  margin-bottom: 8px;
}
.company-title .rep {
  font-size: 14px;
  color: #666;
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
  border: 1px solid var(--btn-border);
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
  background: var(--bg-main);
  color: var(--modal-text);
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

.org-list,
.org-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.org-box {
  height: 400px;
  overflow-y: auto;

  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.2) rgba(0,0,0,0.05);
}

.org-box::-webkit-scrollbar {
  width: 6px;
}
.org-box::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 3px;
}
.org-box::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  border-radius: 3px;
  margin: 4px 0;
}
.org-box::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0,0,0,0.3);
}

.org-box::-webkit-scrollbar-corner {
  background: transparent;
}

.org-list li {
  position: relative;
  padding-left: 24px;
}
.org-list li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8px;
  width: 2px;
  height: 100%;
  background: #ccc;
}
.org-list li::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 8px;
  width: 15px;
  height: 2px;
  background: #ccc;
}

.node {
  display: flex;
  align-items: center;
  cursor: pointer;
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
.node.emp-manager {
  font-size: 16px;
  margin-bottom: 8px;
  color: #000;
  font-weight: bold;
  padding-left: 16px;
}

.node.head:hover,
.node.dept:hover,
.node.team:hover {
  color: #00a8e8;
  cursor: pointer;
}

.dept-children {
  margin-left: 8px;
}

.team-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.team-list > li {
  position: relative;
  padding-left: 24px;
}

.member-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.member-list > li {
  position: relative;
  padding-left: 24px;
}

</style>
