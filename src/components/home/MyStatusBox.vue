<!-- 나의 현황 박스 -->
<template>
  <div class="box my-status">
    <div class="profile-wrapper" v-if="user">
      <img
        :src="user.employeePhotoUrl || '/images/erpizza_profile.svg'"
        alt="프로필"
        class="avatar"
        @error="onImageError"
      />
      <div class="info">
        <div class="name">{{ user.employeeName }} <span class="rank">{{ user.rankName }}</span></div>
        <div class="team">{{ user.teamName }}</div>
      </div>
    </div>

    <!-- 결재 현황 -->
    <div class="approval-wrapper">
      <div class="section-title-row">
        <div class="section-title">나의 결재 현황</div>
        <div class="shortcut" @click="goToApproval">↗</div>
      </div>
      <hr class="section-divider" />
      <div class="approval-list">
        <div class="approval-item">상신 <span class="count">3</span></div>
        <div class="approval-item">결재대기 <span class="count">1</span></div>
        <div class="approval-item">반려 <span class="count">1</span></div>
      </div>
    </div>

    <!-- 근태 현황 -->
    <div class="attendance-wrapper">
      <div class="section-title-row">
        <div class="section-title">나의 근태 현황</div>
        <div class="shortcut" @click="goToAttendance">↗</div>
      </div>
      <hr class="section-divider" />
      <div class="attendance-list">
        <div class="attendance-item">잔여 연차 <span class="count">3</span></div>
        <div class="attendance-item">주 근무 시간 <span class="count">26</span></div>
        <div class="attendance-item">주 초과 근무 시간 <span class="count">8</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const user = ref(null)

function onImageError(e) {
  e.target.src = '/images/erpizza_profile.svg'
}
function goToApproval() {
  // 예: 라우팅 또는 alert 테스트
  alert('결재 현황으로 이동할 수 있어요!')
}
function goToAttendance() {
  // 예: 라우팅 또는 alert 테스트
  alert('결재 현황으로 이동할 수 있어요!')
}
onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('토큰 없음')
    return
  }

  try {
    const res = await fetch('http://localhost:8000/employees/myinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) throw new Error('응답 실패')

    const data = await res.json()
    user.value = data
  } catch (err) {
    console.error('내 정보 불러오기 실패:', err)
  }
})
</script>

<style scoped>
.profile-wrapper{
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  flex-direction: column;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  /* margin-right: 12px; */
}
.name{
  margin-top: 5px;
  padding: 2px;;
  font-size: 17px;
  font-weight: 600;
  text-align: center;
}
.team{
  font-size:15px;
  font-weight: 600;
  color: #c1c1c1;
  text-align:center;
}
.approval-wrapper,
.attendance-wrapper{
  padding: 0px 15px 0px 15px;
}

.approval-list,
.attendance-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #444;
}

.approval-item,
.attendance-item {
  font-weight: 500;
  display: flex;
  justify-content: space-between;
}

.count {
  font-size: 16px;
  font-weight: bold;
  color: #00A8E8;
}
.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #222;
}

.shortcut {
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  color: #00A8E8;
  cursor: pointer;
  transition: color 0.2s;
}
.shortcut:hover {
  color: #000;
}

.section-divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 6px 0 12px;
}
.my-status {
  grid-area: my-status;
  min-height: 400px !important;
}
.box {
  margin-top: 30px;
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  min-height: 200px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  font-size: 17px;
  font-weight: bold;
}

</style>
