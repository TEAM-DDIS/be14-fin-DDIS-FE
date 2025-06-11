<template>
  <!-- 자주 쓰는 메뉴 전체 컨테이너 -->
  <div class="favorite-menu">

    <!-- 드래그 가능한 자주 쓰는 메뉴 리스트 -->
    <draggable
      v-model="favorites"              
      item-key="menuId"                
      class="favorite-list"
      handle=".drag-handle"           
      @start="dragging = true"        
      @end="handleDragEnd"             
    >
      <!-- 항목 템플릿 슬롯 -->
      <template #item="{ element, index, handle }">
        <div
          class="favorite-item"
          :class="{ dragging: draggingItem === element.menuId }"
          @mousedown="draggingItem = element.menuId"
          @mouseup="draggingItem = null"
        >
          <!-- 자주 쓰는 메뉴 제거 버튼 -->
          <button class="remove-button" @click="remove(element.menuId)">−</button>
          <span class="menu-name">{{ element.menuName }}</span>
          <!-- 드래그 핸들 표시 -->
          <span class="drag-handle">≡</span>
        </div>
      </template>
    </draggable>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import draggable from 'vuedraggable'
import { useUserStore } from '@/stores/user'

// 사용자 토큰
const userStore = useUserStore()
const token = userStore.token

// 드래그 관련 상태
const dragging = ref(false)
const draggingItem = ref(null)

// props: 사원 ID
const props = defineProps({
  employeeId: {
    type: Number,
    required: true
  }
})

// 자주 쓰는 메뉴 리스트
const favorites = ref([])

// API 호출로 자주 쓰는 메뉴 목록 가져오기
const fetchFavorites = async () => {
  try {
    const { data } = await axios.get(
      `http://localhost:8000/menus/favorites/${props.employeeId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
    // 표시 순서대로 정렬
    favorites.value = data.sort((a, b) => a.displayOrder - b.displayOrder)
  } catch (err) {
    console.error('자주 쓰는 메뉴 불러오기 실패:', err)
    alert('자주 쓰는 메뉴 데이터를 불러올 수 없습니다.')
  }
}

// 외부에서 자주 쓰는 메뉴 목록을 얻기 위한 메서드
function getList() {
  return favorites.value
}

// 자주 쓰는 메뉴 항목 삭제
async function remove(menuId) {
  try {
    await axios.delete('http://localhost:8000/menus/favorites', {
      params: {
        employeeId: props.employeeId,
        menuId
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    favorites.value = favorites.value.filter(m => m.menuId !== menuId)
  } catch (err) {
    console.error('삭제 실패:', err)
    alert('삭제 중 오류 발생')
  }
}

// 드래그 종료 후 순서 저장 처리
async function handleDragEnd() {
  dragging.value = false
  draggingItem.value = null

  // 새 순서 정보 구성
  const orders = favorites.value.map((item, index) => ({
    menuId: item.menuId,
    displayOrder: index + 1
  }))

  const payload = {
    employeeId: Number(props.employeeId),
    orders
  }

  // 순서 PATCH 요청
  try {
    await axios.patch('http://localhost:8000/menus/favorites/order', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('순서 저장 성공')
  } catch (err) {
    console.error('순서 저장 실패:', err.response?.data || err.message)
    alert('드래그 후 순서 저장 실패')
  }
}

// 외부 접근을 위해 메서드 노출
defineExpose({
  fetchFavorites,
  getList
})

// 컴포넌트 마운트 시 데이터 로딩
onMounted(fetchFavorites)
</script>

<style scoped>
/* 전체 자주 쓰는 메뉴 영역 */
.favorite-menu {
  width: 310px;
  background-color: #D9D9D9;
  padding: 20px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 0 0 16px 0;
  border-left: 1px solid #ccc;
}

/* 자주 쓰는 메뉴 리스트 컨테이너 */
.favorite-list {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
  align-items: center;
}

/* 개별 자주 쓰는 메뉴 항목 */
.favorite-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 30px;
  width: 180px;
  gap: 8px;
}

/* 메뉴 이름 텍스트 */
.menu-name {
  flex: 1;
  padding-left: 8px;
}

/* 자주 쓰는 메뉴 제거 버튼 */
.remove-button {
  position: absolute;
  top: -3px;
  left: -4px;
  padding: 0px;
  background-color: #fff;
  color: #000;
  border: none;
  border-radius: 50%;
  width: 23px;
  height: 23px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0px 0px 4px 2px rgba(0, 0, 0, 0.08);
  z-index: 1;
}
.remove-button:hover {
  background-color: #e65050;
  color: #fff;
}

/* 드래그 핸들 영역 */
.drag-handle {
  font-size: 18px;
  cursor: grab;
  user-select: none;
  padding: 0 4px;
}
</style>
