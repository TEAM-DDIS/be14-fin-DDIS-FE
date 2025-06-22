<!-- src/views/IntroductionPage.vue -->
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
              <!-- 부서 이름 -->
              <h3 class="department-name">{{ dept.departmentName }}</h3>
              <!-- 부서 소개 내용 -->
              <p class="description">{{ dept.introductionContext }}</p>

              <!-- 팀 목록: 태그(# teamName) 형태 -->
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

    <!-- EditDeptModal: showEditModal이 true일 때만 렌더링 -->
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
import { useUserStore } from '@/stores/user'
import EditDeptModal from '@/components/org/introduction/EditDeptModal.vue'

// 인사팀에서만 편집버튼 
const userStore = useUserStore()
const token = localStorage.getItem('token')
const payload = parseJwtPayload(userStore.accessToken || token)
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

// 1) orgData에 department 배열을 담습니다.
const orgData = ref({
  introduction: []  // DepartmentIntroductionQueryDTO[]
})

// 2) divisions: 하드코딩된 본부 정보 (부서 ID 매핑용)
//    실제로는 이 배열을 API로 받아오거나, 데이터베이스에 맞춰 바꿔도 됩니다.
const divisions = [
  { id: 1, name: '개발본부', departmentIds: [1, 2] },
  { id: 2, name: '경영지원본부', departmentIds: [3, 4] },
  { id: 3, name: '사업본부', departmentIds: [5, 6] }
]

const router = useRouter()

// 3) divisionsWithDepartments: divisions 배열을 순회하며,
//    orgData.introduction에서 해당 본부에 속하는 부서들만 걸러서 반환
const divisionsWithDepartments = computed(() =>
  divisions.map(div => {
    // 이 본부에 속하는 부서들만 필터
    const departmentList = orgData.value.introduction.filter(
      intro => div.departmentIds.includes(intro.departmentId)
    )

    // 각 dept 객체 안에 { departmentId, departmentName, introductionContext, teams } 형태로 매핑
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

// ─── 모달 제어 로직 ────────────────────────────────────────────────
// showEditModal: 모달 표시 여부
const showEditModal = ref(false)
// currentDept: EditDeptModal에 뿌려줄 현재 부서 정보
const currentDept = reactive({
  departmentId: null,
  introductionContext: ''
})

// openEditModal: 모달을 열 때 호출
// 만약 특정 부서를 넘기고 싶으면 openEditModal(dept) 형태로 사용 가능
function openEditModal(dept) {
  showEditModal.value = true

  if (dept) {
    // 특정 dept 객체를 넘긴 경우 해당 dept 값으로 세팅
    currentDept.departmentId = dept.departmentId
    currentDept.introductionContext = dept.introductionContext
  } else {
    // 파라미터가 없는 경우(최상단 버튼 클릭 시), 첫 번째 본부의 첫 번째 부서를 기본으로 세팅
    const firstDept = divisionsWithDepartments.value[0]?.departments[0]
    if (firstDept) {
      currentDept.departmentId = firstDept.departmentId
      currentDept.introductionContext = firstDept.introductionContext
    }
  }
}

// closeEditModal: 모달을 닫을 때 호출
function closeEditModal() {
  showEditModal.value = false
}

// saveEdit: 모달 내부에서 “저장” 버튼을 눌러 전달된 값을 반영
function saveEdit(updated) {
  // updated: { departmentId, introductionContext }
  const idx = orgData.value.introduction.findIndex(
    d => d.departmentId === updated.departmentId
  )
  if (idx !== -1) {
    // 로컬 상태에 바로 반영 (화면 갱신)
    orgData.value.introduction[idx].introductionContext =
      updated.introductionContext
    // (선택) 실제 서버에 PUT 요청을 보내 저장하고 싶다면 여기서 fetch 호출
    // 예:
    // await fetch(`https://api.isddishr.site/org/update/department/${updated.departmentId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ introductionContext: updated.introductionContext })
    // })
  }

  closeEditModal()
}
// ────────────────────────────────────────────────────────────────────────

// 부트스트랩: 컴포넌트 마운트 시 백엔드에서 부서 목록을 가져옵니다.
onMounted(async () => {
  try {
    // 실제 백엔드 주소에 맞춰 수정하세요 (예: https://api.isddishr.site)
    const BASE = 'https://api.isddishr.site/introduction'
    const res = await fetch(`${BASE}/department`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    // data 형식: DepartmentIntroductionQueryDTO[] 배열
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
  color: #00a8e8;
}
.desc {
  display: block;
  margin-left: 20px;
  margin-bottom: 10px;
  font-size: 18px;
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
  /* 높이를 고정할 필요가 없으면 height 속성을 제거하세요 */
  /* height: 240px; */
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
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 12px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  display: block;
  margin-left: auto;
  margin-right: 40px;
  margin-top: 30px;
  margin-bottom: 20px;
}

.edit-button:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

@media (max-width: 768px) {
  .division-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>
