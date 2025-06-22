<template>
  <!-- 중/하위 메뉴 사이드바 (sections이 있을 때만 렌더링) -->
  <div class="sub-sidebar" v-if="sections.length > 0">
    
    <!-- 각 섹션 반복 (예: 중분류) -->
    <div
      v-for="(section, index) in sections"
      :key="index"
      class="submenu-section"
    >
      <!-- 섹션 타이틀 -->
      <div class="submenu-title">{{ section.name }}</div>

      <!-- 섹션 내 하위 메뉴 리스트 -->
      <ul class="submenu-list">
        <li
          v-for="item in section.children"
          :key="item.menuId"
          class="submenu-item"
        >
          {{ item.menuName }}

          <!-- 자주 쓰는 메뉴 추가 버튼 -->
          <button class="add-btn" @click="$emit('add-favorite', item)">＋</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
// props: 섹션 데이터 (중분류 이름 + 하위 메뉴들)
defineProps({
  sections: Array // 예시: [{ name: '문서관리', children: [{ menuId, menuName }] }]
})

// 이벤트: 메뉴 항목을 자주 쓰는 메뉴로 추가할 때 사용
defineEmits(['add-favorite'])
</script>

<style scoped>
/* 사이드바 전체 스타일 */
.sub-sidebar {
  position: relative !important; /* 부모 기준 위치 설정 */
  width: 280px;
  background: var(--bg-box); 
  padding: 15px 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 섹션 제목 스타일 */
.submenu-title {
  margin-top: 20px;
  font-weight: bold;
  font-size: 14px;
  padding-bottom: 4px;
  margin-bottom: 6px;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
  transition: color 0.2s ease;
}

/* 하위 메뉴 리스트 스타일 */
.submenu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  padding-left: 6px;
  gap: 10px;
}

/* 개별 하위 메뉴 항목 스타일 */
.submenu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 15px;
  font-size: 14px;
  margin-bottom: 3px;
  color: var(--text-main);
}

/* '＋' 버튼 스타일 */
.add-btn {
  padding: 0px;
  font-size: 13px;
  align-items: center;
  text-align: center;
  background-color: #fff;
  color: #000;
  border: none;
  border-radius: 120px;
  width: 23px;
  height: 23px;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0px 0px 4px 2px rgba(0, 0, 0, 0.08);
}

/* 버튼 호버 효과 */
.add-btn:hover {
  background-color: #000;
  color: #fff;
}
</style>
