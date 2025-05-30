<!-- 조직 및 직무 > 조직 및 직무 소개 -->
<template>
  <div class="org-page">
    <h1 class="page-title">조직 및 직무 소개</h1>
    <p class="desc">부서 별 소개</p>

    <div class="content-box">
      <div class="division-container">
        <div
          class="division-section"
          v-for="division in divisionsWithDepartments"
          :key="division.name"
        >
          <h2 class="division-title">{{ division.name }}</h2>
          <div class="department-grid">
            <div
              class="department-card"
              v-for="dept in division.departments"
              :key="dept.introduction_id"
            >
              <h3 class="department-name">{{ dept.introduction_name }}</h3>
              <p class="description">{{ dept.introduction_context }}</p>
              <div class="tags">
                <span
                  v-for="team in dept.teams"
                  :key="team.team_id"
                  class="tag"
                  @click="goToJob(team.team_id)"
                >
                  # {{ team.team_name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="edit-button" @click="openEditModal">편집</button>
    <!-- 모달 컴포넌트 -->
    <EditDeptModal
      v-if="showEditModal"
      :initial="currentDept"
      @close="closeEditModal"
      @save="saveEdit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EditDeptModal from './EditDeptModal.vue'

const orgData = ref({ introduction: [], team: [] })
const introductions = computed(() => orgData.value.introduction)
const teams = computed(() => orgData.value.team)

const divisions = [
  { id: 1, name: '개발본부', departmentIds: [1, 2] },
  { id: 2, name: '경영지원본부', departmentIds: [3, 4] },
  { id: 3, name: '사업본부', departmentIds: [5, 6] }
]

const router = useRouter()

const divisionsWithDepartments = computed(() =>
  divisions.map(div => {
    const departmentList = introductions.value.filter(
      intro => intro.introduction_type === '부서' && div.departmentIds.includes(intro.department_id)
    )
    const departmentsWithTeams = departmentList.map(dept => {
      const deptTeams = teams.value.filter(team => team.department_id === dept.department_id)
      return { ...dept, teams: deptTeams }
    })
    return { ...div, departments: departmentsWithTeams }
  })
)

function goToJob(teamId) {
  router.push({ path: `/jobdetail/${teamId}` })
}

// --- 모달 제어 ---
const showEditModal = ref(false)
const currentDept = reactive({ introduction_id: null, introduction_name: '', introduction_context: '' })

function openEditModal() {
  showEditModal.value = true
  const firstDept = divisionsWithDepartments.value[0]?.departments[0]
  if (firstDept) {
    currentDept.introduction_id = firstDept.introduction_id
    currentDept.introduction_name = firstDept.introduction_name
    currentDept.introduction_context = firstDept.introduction_context
  }
}
function closeEditModal() {
  showEditModal.value = false
}
function saveEdit(updated) {
  const idx = orgData.value.introduction.findIndex(d => d.introduction_id === updated.introduction_id)
  if (idx !== -1) {
    orgData.value.introduction[idx].introduction_context = updated.introduction_context
  }
  closeEditModal()
}

onMounted(async () => {
  try {
    const res = await fetch('/org.json')
    if (!res.ok) throw new Error(res.statusText)
    orgData.value = await res.json()
  } catch (e) {
    console.error('org.json load failed:', e)
  }
})
</script>

<style scoped>
/* .org-page {
  position: relative;
  padding: 20px 40px;
} */
  .page-title {
    margin-left: 20px;
    margin-bottom: 50px;
    color: #00a8e8;
  }
  .desc {
    display: block;
    margin-left: 20px;
    margin-bottom: 10px;
  }
  
.content-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 24px;
  max-width: 100%;
  overflow-x: auto;
}

.page-title {
  margin-left: 20px;
  margin-bottom: 50px;
}

.division-container {
  display: flex;
  gap: 40px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.division-section {
  flex: 1 1 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.division-title {
  background-color: #00a8e8;
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  padding: 16px 10px;
  border-radius: 20px;
  width: 140px;
  margin-bottom: 30px;
}

.department-grid {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 30px;
}

.department-card {
  background: #f2f2f2;
  border-radius: 12px;
  padding: 20px;
  width: 240px;
  height: 240px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.department-name {
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}

.description {
  font-size: 14px;
  color: #3c3c3c;
  margin-bottom: 30px;
  text-align: center;
  padding: 8px 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.tag {
  background-color: #3f3f3f;
  border-radius: 15px;
  padding: 8px 10px;
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
}

.edit-button {
  position: absolute;
  top: 24px;
  right: 24px;
  background-color: #00a8e8;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 30px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.edit-button:hover {
  background-color: #07749f;
}

@media (max-width: 768px) {
  .division-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>
