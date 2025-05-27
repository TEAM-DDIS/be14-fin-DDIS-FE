<!-- 조직 및 직무 > 조직 및 직무 소개 -->
<template>
  <div class="org-page">
    <h1 class="page-title">조직 및 직무 소개</h1>

    <div class="division-container">
      <div class="division-section" v-for="division in divisionsWithDepartments" :key="division.name">
        <h2 class="division-title">{{ division.name }}</h2>
        <div class="department-grid">
          <div class="department-card" v-for="dept in division.departments" :key="dept.introduction_id">
            <h3 class="department-name">{{ dept.introduction_name }}</h3>
            <p class="description">{{ dept.introduction_context }}</p>
            <div class="tags">
              <span
                v-for="team in dept.teams"
                :key="team.team_id"
                class="tag"
                @click="goToJob(team.team_id)"
                style="cursor:pointer"
              >
                # {{ team.team_name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="edit-button">편집</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import data from '/server/db.json' // json 경로 맞게 조정하세요

const introductions = data.introduction // 배열임
const teams = data.team

const divisions = [
  { id: 1, name: '개발본부', departmentIds: [1, 2] },
  { id: 2, name: '경영지원본부', departmentIds: [3, 4] },
  { id: 3, name: '사업본부', departmentIds: [5, 6] }
]

const router = useRouter()

// divisions에 부서별 정보와 각 부서에 속한 팀 데이터 추가
const divisionsWithDepartments = computed(() =>
  divisions.map(div => {
    const departments = introductions.filter(
      intro => intro.introduction_type === '부서' &&
               div.departmentIds.includes(intro.department_id)
    )
    // 각 부서에 속한 팀 데이터(이름 + id)만 필터링해서 저장
    const departmentsWithTeams = departments.map(dept => {
      const deptTeams = teams.filter(team => team.department_id === dept.department_id)
      return { ...dept, teams: deptTeams }
    })
    return {
      ...div,
      departments: departmentsWithTeams
    }
  })
)

function goToJob(teamId) {
  // router.push({ path: `/jobdetail/${encodeURIComponent(jobName)}` })
    router.push({ path: `/jobdetail/${teamId}` })

}

</script>

<style scoped>
.org-page {
  padding: 20px 40px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 50px;
}

.division-container {
  display: flex;           /* 수평 정렬 */
  gap: 40px;               /* 본부 간 간격 */
  justify-content: flex-start; /* 왼쪽 정렬 */
}

.division-section {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  padding: 8px 0px;
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
  text-decoration: none;
}

.edit-button {
  position: absolute;
  font-weight: bold;
  top: 24px;
  right: 24px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
