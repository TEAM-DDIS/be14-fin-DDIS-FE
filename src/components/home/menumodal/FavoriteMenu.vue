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
  <BaseToast ref="toastRef" />

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import draggable from 'vuedraggable'
import { useUserStore } from '@/stores/user'
import { HR_ONLY_PATHS } from '@/constants/hronlypaths.js'
import BaseToast from '@/components/toast/BaseToast.vue'
// 인증 및 드래그 상태
const userStore = useUserStore()
const token = useUserStore().accessToken
const dragging = ref(false)
const draggingItem = ref(null)

// 자주 쓰는 메뉴 리스트
const favorites = ref([])
const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}
const isHrTeam = computed(() => {
  try {
    const payload = JSON.parse(atob(userStore.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.deptName === '인사부서' || payload.auth?.includes('ROLE_HR')
  } catch {
    return false
  }
})

// 자주 쓰는 메뉴 불러오기
const fetchFavorites = async () => {
  try {
    const { data } = await axios.get('http://localhost:5000/menus/favorites/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    favorites.value = data
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .filter(m => !(HR_ONLY_PATHS.includes(m.menuPath) && !isHrTeam.value))
  } catch (err) {
    console.error('자주 쓰는 메뉴 불러오기 실패:', err)
    showToast('자주 쓰는 메뉴 데이터를 불러올 수 없습니다.')
  }
}

// 자주 쓰는 메뉴 삭제
const remove = async (menuId) => {
  try {
    await axios.delete('http://localhost:5000/menus/favorites', {
      params: { menuId },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    favorites.value = favorites.value.filter(m => m.menuId !== menuId)
  } catch (err) {
    console.error('삭제 실패:', err)
    showToast('삭제 중 오류 발생했습니다.')
  }
}

// 순서 저장
const handleDragEnd = async () => {
  dragging.value = false
  draggingItem.value = null

  const orders = favorites.value.map((item, index) => ({
    menuId: item.menuId,
    displayOrder: index + 1
  }))

  try {
    await axios.patch('http://localhost:5000/menus/favorites/order', { orders }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    // 정렬 반영
    favorites.value.sort((a, b) => a.displayOrder - b.displayOrder)
  } catch (err) {
    console.error('순서 저장 실패:', err)
    showToast('드래그 후 순서 저장에 실패했습니다.')
  }
}

// 외부에 노출
defineExpose({ fetchFavorites, getList: () => favorites.value })

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
