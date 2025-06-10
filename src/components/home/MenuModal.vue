<template>
  <!-- 모달 전체를 감싸는 오버레이 (배경 클릭 시 모달 닫힘) -->
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      
      <!-- 모달 헤더: 제목과 닫기 버튼 -->
      <div class="modal-header">
        <span>메뉴 편집</span>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <!-- 모달 본문 -->
      <div class="modal-body">
        <!-- 좌측: 상위 메뉴 리스트 -->
        <div class="column-left">
          <Sidebar
            :topLevelMenus="topMenus"
            :selectedId="selectedTopId"
            @select="onSelectTop"
          />
        </div>

        <!-- 중간: 중/하위 메뉴 -->
        <div class="column-middle" v-if="currentSections.length">
          <SubSidebar
            :sections="currentSections"
            @add-favorite="addFavorite"
          />
        </div>

        <!-- 중간 화살표 이미지 (시각적 흐름) -->
        <div class="column-arrows">
          <img class="arrows" src="@/assets/icons/Polygon-2.svg" />
        </div>

        <!-- 우측: 자주 쓰는 메뉴 메뉴 리스트 -->
        <div class="column-right">
          <FavoriteMenu
            :employee-id="employeeId"
            ref="favoriteRefEl"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import Sidebar from './MenuSidebar.vue'
import SubSidebar from './MenuSubSidebar.vue'
import FavoriteMenu from './FavoriteMenu.vue'

// 부모 컴포넌트에서 전달된 사용자 ID props
const props = defineProps({
  employeeId: {
    type: Number,
    required: true
  }
})

// 전체 메뉴 리스트
const allMenus = ref([])

// 현재 선택된 상위 메뉴 ID
const selectedTopId = ref(null)

// 자주 쓰는 메뉴 메뉴 컴포넌트에 접근하기 위한 ref
const favoriteRefEl = ref()

// 최상위 메뉴 필터링 (parentMenuId가 null인 메뉴)
const topMenus = computed(() =>
  allMenus.value.filter(m => m.parentMenuId === null)
)

// 자식 메뉴 매핑용 Map (key: parentId, value: 자식 배열)
const childMap = ref({})

// 사용자 인증 토큰 가져오기
const userStore = useUserStore()
const token = userStore.token

// 컴포넌트가 마운트되면 메뉴 데이터를 API에서 불러옴
onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:8000/menus', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    allMenus.value = data

    // 자식 메뉴 매핑 생성
    const map = {}
    data.forEach(menu => {
      if (menu.parentMenuId !== null) {
        if (!map[menu.parentMenuId]) map[menu.parentMenuId] = []
        map[menu.parentMenuId].push(menu)
      }
    })
    childMap.value = map

    // 첫 번째 상위 메뉴를 기본 선택
    selectedTopId.value = topMenus.value[0]?.menuId ?? null
  } catch (err) {
    console.error('메뉴 불러오기 실패:', err)
    alert('메뉴 데이터를 불러올 수 없습니다.')
  }
})

// 상위 메뉴 클릭 시 선택 ID 변경
function onSelectTop(id) {
  selectedTopId.value = id
}

// 선택된 상위 메뉴에 따른 중/하위 메뉴 구성
const currentSections = computed(() => {
  const mids = childMap.value[selectedTopId.value] || []

  if (mids.length === 0) {
    // 하위 메뉴가 없을 경우 자기 자신을 보여줌
    const selectedTop = allMenus.value.find(m => m.menuId === selectedTopId.value)
    if (selectedTop) {
      return [{
        name: selectedTop.menuName,
        children: [selectedTop]
      }]
    }
    return []
  }

  // 중간 메뉴 → 하위 메뉴 구조 생성
  return mids.map(mid => ({
    name: mid.menuName,
    children: childMap.value[mid.menuId] || []
  }))
})

// 자주 쓰는 메뉴 추가 핸들러
async function addFavorite(menuItem) {
  const favoriteRef = favoriteRefEl.value
  if (!favoriteRef) {
    console.warn('FavoriteMenu ref가 없습니다')
    return
  }

  // 중복 확인
  const currentList = favoriteRef.getList()
  const isDup = currentList.find(m => m.menuId === menuItem.menuId)
  if (isDup) {
    alert('이미 추가된 메뉴입니다.')
    return
  }

  // API 호출로 자주 쓰는 메뉴 추가
  try {
    await axios.post('http://localhost:8000/menus/favorites', {
      employeeId: props.employeeId,
      menuId: menuItem.menuId,
      displayOrder: currentList.length + 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    // 자주 쓰는 메뉴 목록 갱신
    await favoriteRef.fetchFavorites()
  } catch (err) {
    console.error('즐겨찾기 추가 실패:', err)
    alert('추가에 실패했습니다.')
  }
}
</script>

<style scoped>
/* 모달 배경 오버레이 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 모달 본체 */
.modal-container {
  background: #fff;
  width: 770px;
  height: 700px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
}

/* 모달 상단 헤더 */
.modal-header {
  height: 30px;
  border-radius: 16px 16px 0px 0px;
  padding: 15px;
  font-weight: bold;
  font-size: 18px;
  background: #fff;
  display: flex;
  justify-content: space-between;
}

/* 모달 내용 부분 */
.modal-body {
  flex-direction: row;
  display: flex;
  width: 100%;
  height: 100%;
  flex-grow: 1;
  position: relative;
}

/* 중간 화살표 이미지 */
.arrows {
  padding-left: -5px;
  margin-left: -40px;
  /* margin-right: -60px; */
  position: absolute;
  width: 110px;
  height: 110px;
  z-index: 10;
  pointer-events: none;
}

/* 닫기 버튼 스타일 */
.close-btn {
  font-size: 30px;
  border: none;
  background: transparent;
  cursor: pointer;
}
.close-btn:hover {
  color: #00a8e8;
}
</style>
