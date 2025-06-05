<!-- 조직 및 직무 > 조직 및 직무 소개 -->
<template>
  <div class="job-detail-page">
    <h1 class="page-title">
        <img src="@/assets/icons/back_btn.svg" alt="back" class="back-btn" @click="goBack"/>
        조직 및 직무 소개
    </h1>
    <p class="desc">팀 별 직무 소개</p>    
    <div class="content-box">
      <h2 class="title">{{ teamName }}</h2>
      
      <p v-if="teamIntro" class="team-intro">{{ teamIntro.introduction_context }}</p>

      <!-- 직무 선택 탭 -->
      <div class="job-tabs">
        <button
          v-for="job in filteredJobs" 
          :key="job.job_id"
          :class="{ active: selectedJobId === job.job_id }"
          @click="selectedJobId = job.job_id"
        >
          {{ job.job_name }}
        </button>
      </div>

      <!-- 선택된 직무만 보여주기 -->
      <div v-if="filteredJobs.length === 0" class="no-jobs">
        해당 팀의 직무 정보가 없습니다.
      </div>

      <div v-else class="job-cards-container">
        <div 
          v-for="job in selectedJobs" 
          :key="job.job_id" 
          class="job-card"
        >
          <h2 class="job-name">{{ job.job_name }}</h2>

          <section class="job-section">
            <h3>주요 역할</h3>
            <ul>
              <li v-for="(role, idx) in job.job_role" :key="idx">{{ role }}</li>
            </ul>
          </section>

          <section class="job-section">
            <h3>필요 역량</h3>
            <ul>
              <li v-for="(need, idx) in job.job_need" :key="idx">{{ need }}</li>
            </ul>
          </section>

          <section class="job-section">
            <h3>필수 조건</h3>
            <ul>
              <li v-for="(necessary, idx) in job.job_necessary" :key="idx">{{ necessary }}</li>
            </ul>
          </section>

          <section class="job-section">
            <h3>우대 사항</h3>
            <ul>
              <li v-for="(preference, idx) in job.job_preference" :key="idx">{{ preference }}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>

    <button class="edit-button" @click="openEditModal">편집</button>
      <!-- 모달 컴포넌트 -->
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
import EditJobModal from '@/components/org/introduction/EditJobModal.vue'

const route = useRoute()
const router = useRouter()
const teamId       = Number(route.params.teamId)

function goBack() {
  router.back()
}
// reactive 데이터
const jobs         = ref([])
const teams        = ref([])
const introductions= ref([])

// 페이지에서 바로 사용하는 값들도 ref로 선언
const teamName     = ref('알 수 없는 팀')
const teamIntro    = ref(null)
const selectedJobId= ref(null)

// fetch 로드 후 초기화
onMounted(async () => {
  try {
    const res   = await fetch('/org.json')
    const oData = await res.json()

    jobs.value          = oData.job
    teams.value         = oData.team
    introductions.value = oData.introduction

    // 팀 이름, 소개 설정
    const team = teams.value.find(t => t.team_id === teamId)
    if (team) {
      teamName.value  = team.team_name
      teamIntro.value = introductions.value.find(
        i => i.introduction_type === '팀' && i.team_id === teamId
      )
    }

    // 기본 selectedJobId (첫 번째 직무) 설정
    const myJobs = jobs.value.filter(j => j.team_id === teamId)
    selectedJobId.value = myJobs.length ? myJobs[0].job_id : null

  } catch (e) {
    console.error('org.json 로드 실패:', e)
  }
})

// 필터링된 직무 목록
const filteredJobs = computed(() =>
  jobs.value.filter(j => j.team_id === teamId)
)

// 현재 선택된 직무만
const selectedJobs = computed(() => {
  if (selectedJobId.value == null) return []
  return filteredJobs.value.filter(j => j.job_id === selectedJobId.value)
})

  // --- 모달 제어 ---
    const showEditModal = ref(false)
  // 여기에 “직무” 단위로 편집할 객체를 보관합니다
  const currentJob = reactive({
    job_id:             null,
    team_name:          '',
    job_name:           '',
    job_role:           [],
    job_need:           [],
    job_necessary:      [],
    job_preference:     []
  })

  function openEditModal() {
    const job = selectedJobs.value[0]
    if (!job) return

    // 현재 보고 있는 직무 데이터를 그대로 복사해서 넘겨줍니다
    currentJob.job_id         = job.job_id
    currentJob.team_name      = teamName.value
    currentJob.job_name       = job.job_name
    currentJob.job_role       = [...job.job_role]
    currentJob.job_need       = [...job.job_need]
    currentJob.job_necessary  = [...job.job_necessary]
    currentJob.job_preference = [...job.job_preference]

    showEditModal.value = true
  }

  function closeEditModal() {
    showEditModal.value = false
  }

  function saveEdit(updated) {
    // 여기서 updated.job_* 으로 서버에 저장하거나 로컬 state를 갱신하세요.
    // 예: jobs.value 배열에서 해당 job_id 찾아서 내용 덮어쓰기
    const idx = jobs.value.findIndex(j => j.job_id === updated.job_id)
    if (idx !== -1) {
      jobs.value[idx].job_name       = updated.job_name
      jobs.value[idx].job_role       = [...updated.job_role]
      jobs.value[idx].job_need       = [...updated.job_need]
      jobs.value[idx].job_necessary  = [...updated.job_necessary]
      jobs.value[idx].job_preference = [...updated.job_preference]
    }
    closeEditModal()
  }
</script>


<style scoped>
    .page-title{
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin: 24px;
}

.page-title {
  margin-left: 20px;
  margin-bottom: 50px;
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
  width: 100%;  
  border-radius: 12px;
  padding: 20px 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
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

.edit-button {
  position: absolute;
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
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.edit-button:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
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
