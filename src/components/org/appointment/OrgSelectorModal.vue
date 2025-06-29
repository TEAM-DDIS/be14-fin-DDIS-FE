<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <header class="modal-header">
        <p class="modal-title">조직 선택</p>
      </header>

      <div class="search-container">
        <div class="search-area">
          <div class="search-input-container">
            <img
              :src="searchIcon"
              alt="search"
              class="search-img"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="부서 혹은 팀 검색"
              class="search-input"
            />
            <ul
            v-if="searchQuery.trim()"
            class="search-result-list"
          >
            <li
              v-for="node in searchResults"
              :key="nodeKey(node)"
              :class="{ selected: isSelected(node) }"
              @click="selectNode(node)"
            >
              {{ nodeLabel(node) }}
            </li>
            <li v-if="searchResults.length===0" class="no-result">
              검색 결과가 없습니다.
            </li>
          </ul>
          </div>
        </div>

        <div class="body-container">
          <!-- ① 검색어가 있으면 리스트 표시 -->
          
        </div>
      </div>
      <OrgTree
        :hierarchy="filteredHierarchy"
        
        :show-ranks="props.showRanks"
        :show-jobs="props.showJobs"
        @dept-selected="handleSelect"
        @team-selected="handleSelect"
        
        @rank-selected="handleRankSelect"
        @job-selected="handleJobSelect"
      />

      <footer class="modal-footer">
        <button @click="$emit('close')" class="btn-close">닫기</button>
        <button @click="handleConfirm" :disabled="!isComplete" class="btn-select">선택</button>
      </footer>
    </div>
  </div>
  
</template>

<script setup>
  import { ref, computed } from 'vue'
  import OrgTree from '@/components/org/structure/HierarchyAppointment.vue'
  import searchIcon from '@/assets/icons/search.svg'

  const props = defineProps({
    hierarchy: Array,
    requiredKeys: Array,

    showRanks: {
      type: Boolean,
      default: true
    },
    showJobs: {
      type: Boolean,
      default: true
    }
  })

const emit = defineEmits(['select', 'close'])

const selectedOrg = ref({
  headId: null,
  departmentId: null,
  teamId: null,
  jobId: null,
  jobCode: null,
  jobName: null,
  positionCode: null,
  positionName: null,
  rankCode: null,
  rankName: null
})

 const searchQuery = ref('')

/** hierarchy 를 평탄화해 모든 노드를 배열로 **/
function flatten(tree) {
  const list = []
  tree.forEach(head => {
    head.departments?.forEach(dept => {
      list.push({ type:'department', ...dept, headId:head.headId })
      dept.teams?.forEach(team => {
        list.push({ type:'team', ...team, departmentId:dept.departmentId, headId:head.headId })
        // 직무/직급 노드도 포함하려면 추가로 push
        team.jobs?.forEach(job => {
          list.push({ type:'job', ...job, teamId:team.teamId, departmentId:dept.departmentId, headId:head.headId })
        })
        team.ranks?.forEach(rank => {
          list.push({ type:'rank', ...rank, teamId:team.teamId, departmentId:dept.departmentId, headId:head.headId })
        })
      })
    })
  })
  return list
}

/** 검색어에 일치하는 노드만 반환 **/
const allNodes = computed(() => flatten(props.hierarchy))
const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allNodes.value.filter(n =>
    (n.departmentName   || '').toLowerCase().includes(q) ||
    (n.teamName         || '').toLowerCase().includes(q) ||
    (n.jobName          || '').toLowerCase().includes(q) ||
    (n.rankName         || '').toLowerCase().includes(q)
  )
})

/** 리스트와 트리 선택 공통 함수 **/
function nodeKey(n) {
  return `${n.type}-${n.headId}-${n.departmentId||''}-${n.teamId||''}-${n.jobId||''}-${n.rankCode||''}`
}
function nodeLabel(n) {
  if (n.type==='department') return `부서: ${n.departmentName}`
  if (n.type==='team')       return `팀: ${n.teamName}`
  if (n.type==='job')        return `직무: ${n.jobName}`
  if (n.type==='rank')       return `직급: ${n.rankName}`
  return ''
}
function isSelected(n) {
  return (
    (n.type==='department' && selectedOrg.value.departmentId===n.departmentId) ||
    (n.type==='team'       && selectedOrg.value.teamId===n.teamId) ||
    (n.type==='job'        && selectedOrg.value.jobId===n.jobId) ||
    (n.type==='rank'       && selectedOrg.value.rankCode===n.rankCode)
  )
}
function selectNode(n) {
  // 클릭된 노드로 선택 정보 세팅
  if (n.type==='department') {
    selectedOrg.value = { headId:n.headId, departmentId:n.departmentId, teamId:null, jobId:null, rankCode:null }
  }
  if (n.type==='team') {
    selectedOrg.value = { headId:n.headId, departmentId:n.departmentId, teamId:n.teamId, jobId:null, rankCode:null }
  }
  if (n.type==='job') {
    selectedOrg.value.jobId = n.jobId
  }
  if (n.type==='rank') {
    selectedOrg.value.rankCode = n.rankCode
  }
}
function handleSelect(item) {
  if ('teamId' in item) {
    // console.log('[TEAM 선택됨]', item)
    selectedOrg.value.teamId = item.teamId
    selectedOrg.value.departmentId = item.departmentId
    selectedOrg.value.headId = findHeadIdByDepartmentId(item.departmentId)

  } else if ('departmentId' in item) {
    // console.log('[DEPT 선택됨]', item)
    selectedOrg.value.departmentId = item.departmentId
    selectedOrg.value.teamId = null
    selectedOrg.value.headId = findHeadIdByDepartmentId(item.departmentId)
  }
}

function findHeadIdByDepartmentId(deptId) {
  for (const head of props.hierarchy) {
    if (head.departments?.some(dept => dept.departmentId === deptId)) {
      return head.headId
    }
  }
  return null
}

 function handleRankSelect(rank) {
   selectedOrg.value.rankCode = rank.rankCode
   selectedOrg.value.rankName = rank.rankName
   selectedOrg.value.positionCode = rank.positionCode ?? null
   selectedOrg.value.positionName = rank.positionName ?? null
   // console.log('[RANK 선택됨]', rank)
}

function handleJobSelect(job) {
  selectedOrg.value.jobId = job.jobId
  selectedOrg.value.jobName = job.jobName
  selectedOrg.value.jobCode = job.jobCode || null
}

const isComplete = computed(() =>
  props.requiredKeys.every(key => {
    if (key === 'rank') return !!selectedOrg.value.rankCode
    if (key === 'position') return !!selectedOrg.value.positionCode
    return !!selectedOrg.value[`${key}Id`]
  })
)

function handleConfirm() {
  if (isComplete.value) {
    emit('select', selectedOrg.value)
    emit('close')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
}
.modal-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  width: 100%; 
}
.modal-content {
  background: var(--modal-bg2);
  padding: 40px;
  border-radius: 12px;
  width: 500px;
  height: 60vh;
  overflow: hidden;
  overflow-y: scroll;
}
.modal-content::-webkit-scrollbar {
  scrollbar-width: none;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-container {
  padding: 12px 16px;
  height: 50px;
}

.search-area {
  width: 100%;
  max-width: 480px;
  margin: 0 auto 0;
  box-sizing: border-box; 
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.search-img {
  width: 25px;
  height: 25px;
   flex-shrink: 0;
}
.search-input {
  flex: 1;
  width: 100%;
  padding: 6px 12px;
  font-size: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  background-color: var(--modal-bg);
  color: var(--text-main);
}

.search-result-list {
position: absolute;
  top: 100%;
  right: 0; 
  width: calc(100% - 33px);
  max-height: 200px;
  padding: 0;
  margin: 0;
  list-style: none;
  background: var(--modal-bg);
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow-y: auto;
  z-index: 1000;
}
.search-result-list li {
  padding: 5px 12px; 
  cursor:pointer;
}
.search-result-list li:hover {
  background-color: var(--ag-primary-hover);
}
.search-result-list li.selected {
  background-color: var(--ag-primary);
  font-weight:bold;
}
.no-result { 
  padding:12px; 
  text-align:center; 
  color: var(--text-sub); 
}


.modal-footer {
  position: sticky;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
  /* margin-bottom: 30px; */
  bottom: 10px;
  top: 10px;
}
.btn-select {
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
}
.btn-select:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.btn-close {
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

  display: flex;
  justify-content: flex-end;
  float: right;
}
.btn-close:hover {
  background-color: #000;
  color: #fff;
}
</style>