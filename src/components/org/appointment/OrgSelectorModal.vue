<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <p class="modal-title">조직 선택</p>
        <button class="modal-close" @click="$emit('close')">×</button>
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
        <button @click="handleConfirm" :disabled="!isComplete">선택</button>
        <button @click="$emit('close')">닫기</button>
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
      headId:       null,
      departmentId: null,
      teamId:       null,
      rankCode:     null,
      rankName:     null,
      jobId:        null
})

function handleSelect(item) {
  if ('teamId' in item) {
    console.log('[TEAM 선택됨]', item)
    selectedOrg.value.teamId = item.teamId
    selectedOrg.value.departmentId = item.departmentId
    selectedOrg.value.headId = findHeadIdByDepartmentId(item.departmentId)

  } else if ('departmentId' in item) {
    console.log('[DEPT 선택됨]', item)
    selectedOrg.value.departmentId = item.departmentId
    selectedOrg.value.team.teamId = null
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
   console.log('[RANK 선택됨]', rank)
}

function handleJobSelect(job) {
  selectedOrg.value.jobId = job.jobId
  selectedOrg.value.jobName = job.jobName       // ✅ 이거 빠졌으면 grid에 안 뜸!
  selectedOrg.value.jobCode = job.jobCode || null
  console.log('🟢 직무 선택됨:', job)
}

const isComplete = computed(() =>
  props.requiredKeys.every(key => {
    if (key === 'rank') return !!selectedOrg.value.rankCode
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
  font-size: 60px;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  min-width: 300px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-footer {
  margin-top: 20px;
  text-align: right;
}
</style>


OrgSelectorModal