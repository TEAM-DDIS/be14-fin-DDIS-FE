<!-- 내일정, 팀일정 박스 -->
<template>
  <div class="box calendar">달력 영역</div>
</template>

<style scoped>
.calendar {
  grid-area: calendar;
  min-height: 430px;
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
