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
        <div class="shortcut" @click="() => navigateTo('/eapproval/approve')">↗</div>
      </div>
      <hr class="section-divider" />
      <div class="approval-list">
        <div class="approval-item">
          상신
          <span class="count" @click="() => navigateTo('/eapproval/mydraft', '상신')">{{ draftCount }}</span>
        </div>
        <div class="approval-item">
          결재대기
          <span class="count" @click="() => navigateTo('/eapproval/approve')">{{ approveWaitingCount }}</span>
        </div>
        <div class="approval-item">
          반려
          <span class="count" @click="() => navigateTo('/eapproval/mydraft', '반려')">{{ rejectCount }}</span>
        </div>
      </div>
    </div>
    <!-- 근태 현황 -->
    <div class="attendance-wrapper">
      <div class="section-title-row">
        <div class="section-title">나의 근태 현황</div>
        <div class="shortcut" @click="() => navigateTo('/attendance/myAttendance')">↗</div>
      </div>
      <hr class="section-divider" />
      <div class="attendance-list">
        <div class="attendance-item">
          잔여 연차
          <span class="count" @click="() => navigateTo('/attendance/myLeave')">
            {{ remainLeave }}
          </span>
        </div>
        <div class="attendance-item">
          주 근무 시간
          <span class="count" @click="() => navigateTo('/attendance/myCommute')">
            {{ weeklyWorkHours }}
          </span>
        </div>
        <div class="attendance-item">
          주 초과 근무 시간
          <span class="count" @click="() => navigateTo('/attendance/myCommute')">
            {{ weeklyOvertimeHours }}
          </span>
        </div>
      </div>
    </div>
  </div>
  <BaseToast ref="toastRef" />

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BaseToast from '@/components/toast/BaseToast.vue' 
const router = useRouter()

const user = ref(null)
const draftCount = ref(0)
const approveWaitingCount = ref(0)
const rejectCount = ref(0)

const remainLeave = ref(0)
const weeklyWorkHours = ref(0)
const weeklyOvertimeHours = ref(0)
const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}
function navigateTo(path, tab = '') {
  if (tab) {
    router.push({ path, query: { tab } })
  } else {
    router.push(path)
  }
}

function convertMinutesToHours(min) {
  return Math.floor(min / 60)
}

function onImageError(e) {
  e.target.src = '/images/erpizza_profile.svg'
}

onMounted(async () => {
  const token = useUserStore().accessToken
  if (!token) {
    console.error('토큰 없음')
    return
  }

  const headers = { Authorization: `Bearer ${token}` }

  try {
    // 유저 정보
    const resUser = await fetch('https://api.isddishr.site/employees/myinfo', { headers })
    if (!resUser.ok) throw new Error('유저 정보 조회 실패')
    user.value = await resUser.json()

    // 잔여 연차
    const resLeave = await fetch('https://api.isddishr.site/attendance/leave/status/me', { headers })
    if (resLeave.ok) {
      const data = await resLeave.json()
      remainLeave.value = data?.remainingLeave ?? 0
    }

    // 주 근무 시간
    const resWork = await fetch('https://api.isddishr.site/attendance/work-duration-summary', { headers })
    if (resWork.ok) {
      const data = await resWork.json()
      weeklyWorkHours.value = convertMinutesToHours(data?.totalWorkDuration ?? 0)
    }

    // 주 초과 근무 시간
    const resOvertime = await fetch('https://api.isddishr.site/attendance/overtime-summary', { headers })
    if (resOvertime.ok) {
      const data = await resOvertime.json()
      weeklyOvertimeHours.value = convertMinutesToHours(data?.totalOvertime ?? 0)
    }

    // 상신 문서
    const resDrafts = await fetch('https://api.isddishr.site/drafts/query', { headers })
    if (resDrafts.ok) {
      const data = await resDrafts.json()
      draftCount.value = data.filter(doc => doc.status === '대기중').length
      rejectCount.value = data.filter(doc => doc.status === '반려').length
    }

    // 결재 대기 문서
    const resApprovals = await fetch('https://api.isddishr.site/approvals', { headers })
    if (resApprovals.ok) {
      const data = await resApprovals.json()
      approveWaitingCount.value = data.filter(doc => doc.status === '대기중').length
    }
  } catch (err) {
    console.error('데이터 불러오기 실패:', err)
    showToast('나의 현황 데이터를 불러오지 못했습니다.')
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
  color: var(--text-muted);
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
  gap: 7px;
  font-size: 14px;
  color: var(--text-sub);
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
  cursor: pointer;
  transition: color 0.2s;
}
.count:hover {
  color: var(--text-main);
}
.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 22px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: var(--text-main);
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
  color: var(--text-main);
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
    background: var(--bg-box);

  border-radius: 15px;
  padding: 20px;
  min-height: 200px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  font-size: 17px;
  font-weight: bold;
}

</style>
