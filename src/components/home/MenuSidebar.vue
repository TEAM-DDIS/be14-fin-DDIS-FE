<template>
  <!-- 메뉴 사이드바 영역 -->
  <aside class="sidebar">
    <!-- 상위 메뉴 목록 렌더링 -->
    <div
      v-for="menu in topLevelMenus"   
      :key="menu.menuId"            
      :class="['menu-button', { active: selectedId === menu.menuId }]" 
      @click="$emit('select', menu.menuId)"  
    >
      {{ menu.menuName }}                 
    </div>
  </aside>
</template>

<script setup>
// 상위 메뉴 배열과 현재 선택된 메뉴 ID props로 받음
defineProps({
  topLevelMenus: Array,   // [{ menuId, menuName, ... }]
  selectedId: Number
})

// 상위 메뉴 선택 이벤트 정의
defineEmits(['select'])
</script>

<style scoped>
/* 사이드바 컨테이너 스타일 */
.sidebar {
  align-items: center;
  background: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  border-radius: 0 0 0 16px;
  gap: 14px;
  height: 100%;
  box-sizing: border-box;
  gap: 22px;
}

/* 개별 메뉴 버튼 스타일 */
.menu-button {
  width: 95%;
  background: white;
  border-radius: 23px;
  padding: 15px 0;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  border: none;
  transition: background-color 0.3s, box-shadow 0.3s;
  box-shadow: 0px 0px 5px 4px rgba(0, 0, 0, 0.03);
  user-select: none;
  font-size: 16px;
}

/* 선택된 메뉴 스타일 */
.menu-button.active {
  background-color: #d6d6d6;
  color: black;
  box-shadow: inset 0px 0px 10px 10px rgba(0, 0, 0, 0.1);
}

/* 마우스 호버 시 스타일 */
.menu-button:hover {
  background-color: #d6d6d6;
  box-shadow: inset 0px 0px 10px 10px rgba(0, 0, 0, 0.1);
} 
</style>
