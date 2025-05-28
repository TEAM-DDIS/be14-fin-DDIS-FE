<!-- 조직 및 직무 > 조직 및 직무 소개 -->
<template>
  <div class="job-detail-page">
    <h1 class="title">{{ teamName }}</h1>
    
    <p v-if="teamIntro" class="team-intro">{{ teamIntro.introduction_context }}</p>

    <!-- 직무 선택 탭 -->
    <div class="job-tabs">
      <!-- <button 
        :class="{ active: selectedJobId === null }" 
        @click="selectedJobId = null"
      >
      </button> -->
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import data from '/server/db.json'  // 경로 맞게 조절

const route = useRoute()
const teamId = Number(route.params.teamId)
const jobs = data.job
const teams = data.team

const team = teams.find(t => t.team_id === teamId)
const teamName = team ? team.team_name : '알 수 없는 팀'
const teamIntro = data.introduction.find(i => i.introduction_type === '팀' && i.team_id === teamId)

const filteredJobs = computed(() => {
  return jobs.filter(job => job.team_id === teamId)
})

const selectedJobId = ref(
  filteredJobs.value.length > 0 ? filteredJobs.value[0].job_id : null
)

const selectedJobs = computed(() => {
  if (selectedJobId.value === null) {
    // 전체 직무 표시
    return filteredJobs.value
  } else {
    // 선택된 직무만 표시
    return filteredJobs.value.filter(job => job.job_id === selectedJobId.value)
  }
})
</script>

<style scoped>

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
  width: 800px;
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
</style>
