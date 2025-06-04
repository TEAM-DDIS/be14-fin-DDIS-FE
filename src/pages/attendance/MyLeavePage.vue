<template>
    <h1 class="page-title">내 연차 관리</h1>
    <div class="my-leave-page">
        <div class="leave-count-card">
            <span class="desc">연차 현황</span>
            <LeaveCountCard/>
        </div>
        <div class="my-leave-used-card">
            <span class="desc">연차 사용 내역</span>
            <MyLeaveUsedCard/>
        </div>
        <div class="my-leave-regist-card">
            <span class="desc">연차 신청 내역</span>
            <MyLeaveRegistCard/>
        </div>
    </div>
</template>

<script setup>
    import LeaveCountCard from '@/components/leave/LeaveCountCard.vue';
    import MyLeaveRegistCard from '@/components/leave/MyLeaveRegistCard.vue';
    import MyLeaveUsedCard from '@/components/leave/MyLeaveUsedCard.vue';
</script>

<style scoped>
  .page-title {
      margin-left: 20px;
      margin-bottom: 50px;
      color: #00a8e8;
    }

  .desc {
    display: block;
    margin-bottom: 10px;
  }

  .my-leave-page {
    padding: 20px;
  }

  .leave-count-card {
    margin-bottom: 50px;
  }

  .my-leave-used-card {
    margin-bottom: 50px;
  }
</style>
