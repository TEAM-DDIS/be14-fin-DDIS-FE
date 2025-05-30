<template>
  <div class="weekly-overtime-card">
    <!-- Legend -->
    <div class="legend">
      <div class="legend-item">
        <span class="dot extended"></span>시간 외
      </div>
      <div class="legend-item">
        <span class="dot night"></span>야간
      </div>
      <div class="legend-item">
        <span class="dot holiday"></span>휴일
      </div>
    </div>

    <!-- Bar -->
    <div class="bar">
      <div
        class="segment extended"
        :style="{ width: extendedPercent + '%' }"
      ></div>
      <div
        class="segment night"
        :style="{ width: nightPercent + '%' }"
      ></div>
      <div
        class="segment holiday"
        :style="{ width: holidayPercent + '%' }"
      ></div>
    </div>

    <!-- Total & Description -->
    <div class="total">{{ totalHours }}시간</div>
    <p class="desc">
      초과 근무는 주당 누적 12시간을 초과할 수 없으며,  
      초과 시 반드시 사전 승인을 받아야 합니다.
    </p>

    <!-- Apply Button -->
    <button class="apply-btn" @click="onApply">근무 신청</button>
  </div>
</template>

<script setup>
  import { computed, defineEmits, defineProps } from 'vue'

  const props = defineProps({
    extended: { type: Number, default: 5 },  // 연장 근무 시간
    night:    { type: Number, default: 2 },  // 야간 근무 시간
    holiday:  { type: Number, default: 2 }   // 휴일 근무 시간
  })

  const emits = defineEmits(['apply'])

  const totalHours = computed(() => props.extended + props.night + props.holiday)

  const extendedPercent = computed(() =>
    totalHours.value > 0 ? (props.extended  / totalHours.value) * 100 : 0
  )
  const nightPercent = computed(() =>
    totalHours.value > 0 ? (props.night     / totalHours.value) * 100 : 0
  )
  const holidayPercent = computed(() =>
    totalHours.value > 0 ? (props.holiday   / totalHours.value) * 100 : 0
  )

  function onApply() {
    emits('apply')
  }
</script>

<style scoped>
  .weekly-overtime-card {
    background: white;
    padding: 18px;
    border-radius: 20px;
    box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
    font-family: 'Pretendard', sans-serif;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 12px;
  }

  /* Legend */
  .legend {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #333;
  }
  .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 4px;
  }
  .dot.extended { background-color: #00A8E8; }
  .dot.night    { background-color: #FFD59E; }
  .dot.holiday  { background-color: #F7A6A6; }

  /* Bar */
  .bar {
    position: relative;
    height: 8px;
    background: #eee;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  .segment {
    height: 100%;
    float: left;
  }
  .segment.extended { background-color: #00A8E8; }
  .segment.night    { background-color: #FFD59E; }
  .segment.holiday  { background-color: #F7A6A6; }

  /* Total & Description */
  .total {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #333;
  }
  .desc {
    font-size: 11px;
    color: #666;
    line-height: 1.4;
    margin-bottom: 16px;
  }

  /* Apply Button */
  .apply-btn {
    display: block;
    width: 93px;
    height: 37px;
    background-color: #00A8E8;
    color: white;
    font-size: 14px;
    font-weight: bold;
    border: 1px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    margin: 16px 0 0 auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: background-color 0.2s, box-shadow 0.2s;
  }
  .apply-btn:hover {
    background-color: white;
      color: #00A8E8;
      border: 1px solid #00A8E8;
      box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
  }
</style>
