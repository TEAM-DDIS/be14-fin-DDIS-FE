<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <header class="modal-header">
        <p class="modal-title">조직 선택</p>
      </header>

      <OrgTree
        :hierarchy="props.hierarchy"
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
}
.modal-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  width: 100%; 
  
}
.modal-content {
  background: var(--modal-box-bg);
  padding: 40px;
  border-radius: 12px;
  width: 500px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-bottom: 10px;
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