<!-- src/views/JobDetailPage.vue -->
<template>
  <div class="job-detail-page">
    <h1 class="page-title">
      <img
        src="@/assets/icons/back_btn.svg"
        alt="back"
        class="back-btn"
        @click="goBack"
      />
      조직 및 직무 소개
    </h1>
    <p class="desc">팀 별 직무 소개</p>

    <div class="content-box">
      <h2 class="title">{{ teamName }}</h2>

      <p v-if="teamIntro" class="team-intro">
        {{ teamIntro.introductionContext }}
      </p>

      <!-- 직무 선택 탭 -->
      <div class="job-tabs">
        <button
          v-for="job in filteredJobs"
          :key="job.jobId"
          :class="{ active: selectedJobId === job.jobId }"
          @click="selectedJobId = job.jobId"
        >
          {{ job.jobName }}
        </button>
      </div>

      <!-- 직무가 없으면 메시지 -->
      <div v-if="filteredJobs.length === 0" class="no-jobs">
        해당 팀의 직무 정보가 없습니다.
      </div>

      <!-- 선택된 직무만 보여주기 -->
      <div v-else class="job-cards-container">
        <div
          v-for="job in selectedJobs"
          :key="job.jobId"
          class="job-card"
        >
          <h2 class="job-name">{{ job.jobName }}</h2>

          <section class="job-section">
            <h3>주요 역할</h3>
            <ul>
              <li v-for="(role, idx) in job.jobRole" :key="idx">
                {{ role }}
              </li>
            </ul>
          </section>

          <section class="job-section">
            <h3>필요 역량</h3>
            <ul>
              <li v-for="(need, idx) in job.jobNeed" :key="idx">
                {{ need }}
              </li>
            </ul>
          </section>

          <section class="job-section">
            <h3>필수 조건</h3>
            <ul>
              <li v-for="(necessary, idx) in job.jobNecessary" :key="idx">
                {{ necessary }}
              </li>
            </ul>
          </section>

          <section class="job-section">
            <h3>우대 사항</h3>
            <ul>
              <li v-for="(preference, idx) in job.jobPreference" :key="idx">
                {{ preference }}
              </li>
            </ul>
          </section>
        </div>
      </div>

      <button
        v-if="isHR"
        class="edit-button"
        @click="openEditModal"
        :disabled="selectedJobs.length === 0"
      >
        직무 소개 편집
      </button>
    </div>

    <!-- 편집 버튼 -->


    <!-- EditJobModal -->
    <EditJobModal
      v-if="showEditModal"
      :initial="currentJob"
      @close="closeEditModal"
      @save="saveEdit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import EditJobModal from '@/components/org/introduction/EditJobModal.vue'

const route = useRoute()
const router = useRouter()

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

// 선택한 팀의 teamId 가져오기
const teamId = Number(route.params.teamId)

function goBack() {
  router.back()
}

// 리액티브 상태 선언
const teamName = ref('알 수 없는 팀')
const teamIntro = ref(null)    // { teamId, teamName, introductionContext }
const jobs = ref([])           // JobIntroductionQueryDTO[]
const selectedJobId = ref(null)

// 모달 제어용
const showEditModal = ref(false)
const currentJob = reactive({
  jobId: null,
  teamName: '',
  jobName: '',
  jobRole: [],
  jobNeed: [],
  jobNecessary: [],
  jobPreference: []
})

// 계산 속성: 필터된 직무, 선택된 직무
const filteredJobs = computed(() => jobs.value)

const selectedJobs = computed(() => {
  if (selectedJobId.value == null) return []
  return filteredJobs.value.filter(j => j.jobId === selectedJobId.value)
})

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  try {
    const BASE = 'https://ddis-be-alb-1219702514.ap-northeast-2.elb.amazonaws.com/introduction'

    // 1) 팀 상세 정보 조회
    const teamRes = await fetch(`${BASE}/team/${teamId}`)
    if (!teamRes.ok) throw new Error(`HTTP ${teamRes.status}`)
    const teamData = await teamRes.json()
    teamName.value = teamData.teamName
    teamIntro.value = teamData

    // 2) 해당 팀의 직무 목록 조회
    const jobsRes = await fetch(`${BASE}/team/${teamId}/job`)
    if (!jobsRes.ok) throw new Error(`HTTP ${jobsRes.status}`)
    let jobsData = await jobsRes.json()

    // 문자열로 내려온 배열 필드를 실제 배열로 변환
    jobsData = jobsData.map(job => {
      const parsedRole = Array.isArray(job.jobRole)
        ? job.jobRole
        : JSON.parse(job.jobRole || '[]')
      const parsedNeed = Array.isArray(job.jobNeed)
        ? job.jobNeed
        : JSON.parse(job.jobNeed || '[]')
      const parsedNecessary = Array.isArray(job.jobNecessary)
        ? job.jobNecessary
        : JSON.parse(job.jobNecessary || '[]')
      const parsedPreference = Array.isArray(job.jobPreference)
        ? job.jobPreference
        : JSON.parse(job.jobPreference || '[]')

      return {
        jobId: job.jobId,
        teamName: teamData.teamName,
        jobName: job.jobName,
        jobRole: parsedRole,
        jobNeed: parsedNeed,
        jobNecessary: parsedNecessary,
        jobPreference: parsedPreference
      }
    })

    jobs.value = jobsData

    // 기본으로 첫 번째 직무 선택
    if (jobsData.length > 0) {
      selectedJobId.value = jobsData[0].jobId
    }
  } catch (err) {
    console.error('❌ 데이터 로드 실패:', err)
  }
})

// 모달 열기 / 닫기 / 저장 로직
function openEditModal() {
  const job = selectedJobs.value[0]
  if (!job) return

  currentJob.jobId = job.jobId
  currentJob.teamName = job.teamName
  currentJob.jobName = job.jobName
  currentJob.jobRole = [...job.jobRole]
  currentJob.jobNeed = [...job.jobNeed]
  currentJob.jobNecessary = [...job.jobNecessary]
  currentJob.jobPreference = [...job.jobPreference]

  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
}

function saveEdit(updated) {
  // 로컬 상태 jobs에서 해당 jobId를 찾아 덮어쓰기
  const idx = jobs.value.findIndex(j => j.jobId === updated.jobId)
  if (idx !== -1) {
    jobs.value[idx].jobName = updated.jobName
    jobs.value[idx].jobRole = [...updated.jobRole]
    jobs.value[idx].jobNeed = [...updated.jobNeed]
    jobs.value[idx].jobNecessary = [...updated.jobNecessary]
    jobs.value[idx].jobPreference = [...updated.jobPreference]
  }
  // (선택) 서버에 PUT/POST 요청으로 저장할 수 있음

  closeEditModal()
}
</script>

<style scoped>
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
}
.back-btn {
  width: 24px;
  margin-right: -10px;
  cursor: pointer;
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
}

.title {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

.team-intro {
  text-align: center;
  font-size: 16px;
  color: #555;
  width: 600px;
  margin: 30px auto 50px auto;
}

.job-tabs {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.job-tabs button {
  padding: 8px 16px;
  border: 1px solid gray;
  background-color: #ffffff;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.job-tabs button.active,
.job-tabs button:hover {
  background-color: #878787;
  color: white;
}

.no-jobs {
  text-align: center;
  color: #888;
  margin-top: 40px;
}

.job-cards-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 50px;
  margin-bottom: 50px;
}

.job-card {
  background: #ffffff;
  max-width: 800px;
  width: 80%;
  border-radius: 12px;
  padding: 20px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.job-name {
  font-size: 24px;
  margin-bottom: 30px;
  font-weight: 700;
  border-bottom: 3px solid #c1c1c1;
  padding-bottom: 30px;
}

.job-section {
  margin-bottom: 20px;
}

.job-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #000000;
}

.job-section ul {
  list-style-type: disc;
  padding-left: 20px;
  color: #444;
  display: inline-block;
  text-align: left;
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
  padding: 10px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  display: block;
  margin-left: auto;
  margin-right: 20px;
  margin-bottom: 20px;
}
.edit-button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.edit-button:hover:not(:disabled) {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

@media (max-width: 840px) {
  .content-box {
    margin: 16px;
    padding: 16px 24px;
  }
  .team-intro {
    width: 100%;
    margin: 20px 0;
  }
  .job-card {
    padding: 16px;
  }
}
</style>
