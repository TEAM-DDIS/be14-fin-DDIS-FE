<!-- 조직 및 직무 > 인사발령 -->
<template>
  <h1 class="page-title">인사발령 등록</h1>

  <div class="content-box">
    <div class="register-container">
      <!-- 기본 정보 폼 -->
      <div class="info-section">
        <table class="info-table">
          <tr>
            <th>사원명</th>
            <td><input v-model="form.name" type="text" placeholder="사원명 입력" /></td>
          </tr>
          <tr>
            <th>발령제목</th>
            <td><input v-model="form.title" type="text" placeholder="발령제목 입력" /></td>
          </tr>
          <tr>
            <th>발령유형</th>
            <td>
              <select v-model="form.type">
                <option value="승진">승진</option>
                <option value="전보">전보</option>
                <option value="전직">전직</option>
                <option value="직급조정">직급조정</option>
                <option value="직무">직무</option>
              </select>
            </td>
          </tr>
          <tr>
            <th>발령일자</th>
            <td><input v-model="form.effectiveDate" type="date" /></td>
          </tr>
        </table>
      </div>
      <!-- 조직 변경 테이블 -->
      <div class="org-section">
        <table class="org-table">
          <thead>
            <tr>
              <th>항목</th>
              <th>현재 소속 조직</th>
              <th>발령 조직</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(label, key) in orgFields" :key="key">
              <td>{{ label }}</td>
              <td><input :value="currentOrg[key]" disabled /></td>
              <td>
                <input v-model="form.org[key]" type="text" :placeholder="label + ' 입력'" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 버튼 -->
      <div class="button-group">
          <button class="btn-cancel" @click="cancel()">취소</button>
          <button class="btn-save" @click="submit()">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// 라우터
const router = useRouter()

// 폼 데이터
const form = reactive({
  name: '',
  title: '',
  type: '승진',
  effectiveDate: '',
  org: {
    head: '',
    department: '',
    team: '',
    position: '',
    rank: '',
    job: ''
  }
})

// 현재 조직 예시 (API 호출로 대체 가능)
const currentOrg = reactive({
  head: '개발본부',
  department: 'PC게임개발부서',
  team: 'PC 개발팀',
  position: '팀원',
  rank: '사원',
  job: 'PC게임개발'
})

// 테이블 필드 레이블
const orgFields = {
  head: '소속 본부',
  department: '소속 부서',
  team: '소속 팀',
  position: '소속 직책',
  rank: '소속 직급',
  job: '소속 직무'
}

// 저장
async function submit() {
  try {
    // payload 구성 예시
    await axios.post('http://localhost:3000/appointment', {
      employee_name: form.name,
      title: form.title,
      appointment_type: form.type,
      appointment_effective_date: form.effectiveDate,
      ...form.org
    })
    // 완료 후 목록으로 이동
    router.push('/appointment')
  } catch (err) {
    console.error('등록 실패', err)
    alert('등록 중 오류가 발생했습니다.')
  }
}
// 취소
function cancel() {
  router.back()
}
</script>

<style scoped>
.register-container {
  padding: 24px;
  background: #fff;
}
.content-box {
  background: #fff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin: 24px;
}
.page-title {
  margin-left: 20px;
  margin-bottom: 50px;
}

.info-section,
.org-section {
  margin-bottom: 24px;
}
.info-table,
.org-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.info-table th,
.info-table td,
.org-table th,
.org-table td {
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
}
.info-table th {
  width: 120px;
  background: #f9fafb;
  text-align: left;
}
.button-group {
  display: flex;
  gap: 100px;
  justify-content: center;
}
.btn-save {
  background: #00a8e8;
  color: #fff;
  padding: 10px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-cancel {
  background: #00a8e8;
  color: #fff;
  padding: 10px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-save:hover { background: #07749f; }
.btn-cancel:hover { background: #07749f; }
</style>