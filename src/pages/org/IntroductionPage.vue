<!-- 조직 및 직무 > 조직 소개 > 부서 소개 -->
<template>
  <div class="org-page">
    <h1 class="page-title">조직 및 직무 소개</h1>
    <p class="desc">부서 별 소개</p>

    <div class="content-box">
      <div class="division-container">
        <div
          class="division-section"
          v-for="division in divisionsWithDepartments"
          :key="division.id"
        >
          <h2 class="division-title">{{ division.name }}</h2>
          <div class="department-grid">
            <div
              class="department-card"
              v-for="dept in division.departments"
              :key="dept.departmentId"
            >
              <h3 class="department-name">{{ dept.departmentName }}</h3>
              <p class="description">{{ dept.introductionContext }}</p>
              <div class="tags">
                <span
                  v-for="team in dept.teams"
                  :key="team.teamId"
                  class="tag"
                  @click="goToTeam(team.teamId)"
                >
                  # {{ team.teamName }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button v-if="isHR" class="edit-button" @click="openEditModal()">
        부서 소개 편집
      </button>
    </div>

    <EditDeptModal
      v-if="showEditModal"
      :initial="currentDept"
      @close="closeEditModal"
      @save="saveEdit"
    />
  </div>
  <BaseToast ref="toastRef" />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import EditDeptModal from '@/components/org/introduction/EditDeptModal.vue'
import BaseToast from '@/components/toast/BaseToast.vue'

const userStore = useUserStore()
const token = userStore.accessToken
const payload = parseJwtPayload(token)
const isHR = payload?.role?.includes('ROLE_HR') || payload?.auth?.includes('ROLE_HR')


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

const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}

const orgData = ref({
  introduction: []
})

const divisions = [
  { id: 1, name: '개발본부', departmentIds: [1, 2] },
  { id: 2, name: '경영지원본부', departmentIds: [3, 4] },
  { id: 3, name: '사업본부', departmentIds: [5, 6] }
]

const router = useRouter()

// 해당 본부의 소속 부서
const divisionsWithDepartments = computed(() =>
  divisions.map(div => {
    const departmentList = orgData.value.introduction.filter(
      intro => div.departmentIds.includes(intro.departmentId)
    )

    const departmentsWithTeams = departmentList.map(dept => ({
      departmentId: dept.departmentId,
      departmentName: dept.departmentName,
      introductionContext: dept.introductionContext,
      teams: Array.isArray(dept.teams) ? dept.teams : []
    }))

    return {
      id: div.id,
      name: div.name,
      departments: departmentsWithTeams
    }
  })
)

function goToTeam(teamId) {
  router.push({ path: `/jobdetail/${teamId}` })
}

const showEditModal = ref(false)

const currentDept = reactive({
  departmentId: null,
  introductionContext: ''
})

function openEditModal(dept) {
  showEditModal.value = true

  if (dept) {
    currentDept.departmentId = dept.departmentId
    currentDept.introductionContext = dept.introductionContext
  } else {
    const firstDept = divisionsWithDepartments.value[0]?.departments[0]
    if (firstDept) {
      currentDept.departmentId = firstDept.departmentId
      currentDept.introductionContext = firstDept.introductionContext
    }
  }
}

function closeEditModal() {
  showEditModal.value = false
}

function saveEdit(updated) {
  const payload = {
    introductionContext: updated.introductionContext
  }

  fetch(`https://api.isddishr.site/introduction/update/department/${updated.departmentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then(data => {
      // 로컬 배열에도 반영
      const idx = orgData.value.introduction.findIndex(
        d => d.departmentId === data.departmentId
      )
      if (idx !== -1) {
        orgData.value.introduction[idx].introductionContext = data.introductionContext
      }
      closeEditModal()
      showToast('부서 소개 수정이 완료되었습니다.')
    })
    .catch(err => {
      console.error('❌ 부서 소개 수정 실패:', err)
      alert('부서 소개 수정에 실패했습니다.')
    })
}


onMounted(async () => {
  const BASE = 'https://api.isddishr.site/introduction'
  try {
    const res = await fetch(`${BASE}/department`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    orgData.value.introduction = data
  } catch (e) {
    console.error('❌ 부서 조회 실패:', e)
  }
})
</script>

<style scoped>
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: var(--primary); 
}
.desc {
  display: block;
  margin-left: 20px;
  margin-bottom: 10px;
  font-size: 18px;
}

.content-box {
  background: var(--bg-box); 
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-left: 20px;
  margin-right: 20px;
  max-width: 100%;
  overflow-x: auto;
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
  background: var(--modal-box-bg);
  border-radius: 12px;
  padding: 20px;
  width: 240px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.department-name {
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}

.description {
  font-size: 14px;
  color: var(--text-main);
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
  border: 2px solid transparent;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.tag:hover {
  background-color: white;
  color: #3f3f3f;
  border-color: #3f3f3f;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.edit-button {
  align-self: flex-end;
  top: 24px;
  right: 24px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: var(--primary);
  color: var(--text-on-primary);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 12px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  display: block;
  margin: 30px 40px 20px auto;
}

.edit-button:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

@media (max-width: 768px) {
  .division-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>
