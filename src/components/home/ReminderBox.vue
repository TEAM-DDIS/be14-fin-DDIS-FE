<!-- 리마인더 박스 -->
<template>
  <div class="box reminder">
    REMINDER
    <div class="reminder-inner">
      <div class="reminder-box">내 일정</div>
      <div class="reminder-box">팀 일정</div>
      <div class="reminder-box">이벤트</div>
    </div>
  </div>
</template>

<style scoped>
.reminder {
  grid-area: reminder;
  display: flex;
  flex-direction: column;
}
.reminder-inner {
  margin-top: 15px;
  display: flex;
  gap: 20px;
  flex: 1;
}
.reminder-box {
  font-size: 15px;
  flex: 1;
  background-color: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.08);
}
.box {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  min-height: 200px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  font-size: 17px;
  font-weight: bold;
}
</style>

