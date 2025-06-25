<template>
  <teleport to="body">
    <div v-if="show" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">나의 실적 목록</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
               <!-- 연도 선택 드롭다운 -->
                
        <div class="filter-row">       
          
            <label for="yearFilter">연도별 보기:</label>
            <select id="yearFilter" v-model="selectedYear">
              <option value="All">전체</option>
              <option 
                v-for="yr in years" 
                :key="yr" 
                :value="yr"
              >
                {{ yr }}년
              </option>
            </select>
          
        
        </div>
        <table class="my-perf-table">
          <thead>
            <tr>
              <th>목표명</th>
              <th>실적 수치</th>
              <th>자기 평가</th>
              <th>평가 점수</th>
            </tr>
          </thead>
            
          <tbody>
            <tr
              v-for="item in filteredPerformances"
              :key="item.performanceId"
              class="clickable-row"
              @click="$emit('select', item.goalId)"
            >
              <td>{{ item.goalTitle }}</td>
              <td>{{ item.actual }}</td>
              <td>{{ item.comment }}</td>
              <td>{{ item.reviewScore }}</td>
            </tr>
            <tr v-if="filteredPerformances.length === 0">
              <td colspan="4" class="empty-row">등록된 실적이 없습니다.</td>
            </tr>
          </tbody>

        </table>
        <div class="score-summary">
          총 평가 점수: <strong>{{ totalReviewScore }}</strong>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  performances: {
    type: Array,
    default: () => []
  }
})
// 1) 선택된 연도 상태
const selectedYear = ref('All')

// 2) performances 배열에서 고유 연도 리스트 뽑기
const years = computed(() => {
  const ys = new Set(props.performances.map(p => p.year))
  return Array.from(ys).sort((a, b) => b - a)
})

const totalReviewScore = computed(() => {
  return filteredPerformances.value
    .map(p => Number(p.reviewScore) || 0)
    .reduce((sum, score) => sum + score, 0)
})
// 3) 선택된 연도에 따라 필터링
const filteredPerformances = computed(() =>
  props.performances.filter(p =>
    selectedYear.value === 'All' || p.year === selectedYear.value
  )
)

// props.performances가 바뀔 때 selectedYear 자동 리셋(optional)
watch(() => props.performances, () => {
  selectedYear.value = 'All'
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-title{
  text-align: center;
}
.score-summary {
  margin-top: 8px;
  text-align: right;
  font-weight: bold;
  color: #00a8e8;
  padding-top: 10px;
}
.filter-row {
  display: flex;
  align-items: center;
  margin: 16px 0;
}



.filter-right {
  font-weight: bold;
  color: #00a8e8;
}
.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
}
.btn-close {
  position: absolute;
  top: 12px; right: 12px;
  border: none; background: none;
  font-size: 24px; cursor: pointer;
}
.btn-close:hover{
  color:#00a8e8
}
.my-perf-table {
  width: 100%; border-collapse: collapse;
  margin-top: 16px;
}
.my-perf-table th,
.my-perf-table td {
  border: 1px solid #e0e0e0;
  padding: 8px; text-align: left;
}
.empty-row {
  text-align: center; color: #888;
}
.clickable-row { 
    cursor: pointer; 
}
.clickable-row:hover { 
    background: #f0f8ff; 
}
.filter-row select {
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
</style>
