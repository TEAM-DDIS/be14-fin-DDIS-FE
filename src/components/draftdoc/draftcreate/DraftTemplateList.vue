<template>
  <h1 class="page-title">기안작성</h1>
    <!-- <span class="desc">작성 양식 선택</span> -->
  <div class="form-storage-container">

    <!-- 기안양식함 -->
    <h3 class="box-title">기안양식함</h3>
    
    <div 
      class="storage-box fixed-height"
      :class="{ collapsed: !formsExpanded }"
    >
        <div class="storage-header">
        <div class="item-count">양식목록 {{ registeredForms.length }}건</div>
        <div class="expand-toggle" @click="toggleForms">
        <img :src="formsExpanded ? angleUp : angleDown" alt="토글 아이콘" class="toggle-icon" />
      </div>      
    </div>
      <hr class="divider" v-if="formsExpanded" />

      <div v-if="formsExpanded" class="box-content">
        <div class="search-area">
            <div class="search-container">
              <img src="@/assets/icons/search.svg" alt="검색이미지" class="search-logo" />
            </div>
          <input type="text" v-model="formSearchQuery" placeholder="양식 제목 검색" class="search-input" />
          <button class="button primary">조회</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>양식명</th>
                <th>보존기간</th>
                <th>양식담당자</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(form, index) in filteredForms"
                :key="index"
                @click="goToForm(form.path)"
                class="clickable-row"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ form.name }}</td>
                <td>{{ form.retention }}</td>
                <td>{{ form.manager }}</td>
              </tr>
              <tr v-if="filteredForms.length === 0">
                <td colspan="4">등록된 양식이 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 임시저장함 -->
    <h3 class="box-title">임시저장함</h3>
    <div class="storage-box fixed-height"
        :class="{ collapsed: !temporaryExpanded }"
    >
      <div class="storage-header">
        <div class="item-count">임시저장 {{ temporaryForms.length }}건</div>
        <div class="expand-toggle" @click="toggleTemporary">
        <img :src="temporaryExpanded ? angleUp : angleDown" class="toggle-icon" />
      </div> 
    </div>
      <hr class="divider" v-if="temporaryExpanded" />

      <div v-if="temporaryExpanded" class="box-content">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>임시저장일</th>
                <th>작성자</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in temporaryForms" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.title }}</td>
                <td>{{ item.date }}</td>
                <td>{{ item.author }}</td>
              </tr>
                <tr v-if="temporaryForms.length === 0">
                <td colspan="4">임시 저장된 양식이 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import angleDown from '@/assets/icons/angle-down.svg'
import angleUp from '@/assets/icons/angle-up.svg'

export default {
  name: "DraftFormStorage",
  data() {
    return {
      angleDown,
      angleUp,
      formSearchQuery: '',
      formsExpanded: true,
      temporaryExpanded: true,
      // 목업 데이터
      registeredForms: [
        { name: '일반사업기안', retention: '5년', manager: '인사팀 이쁜펭', path: '/org/draftlis/formA' },
        { name: '외근신청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/org/draftlis/formB' },
        { name: '출장신청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/form/business-trip' },
        { name: '인사발령 결재요청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/form/promotion' },
        { name: '초과근무신청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/form/overtime' },
        { name: '휴가신청서', retention: '5년', manager: '인사팀 이쁜펭', path: '/form/vacation' },
      ],
      temporaryForms: [
        { title: '사업기안 임시저장', date: '2025-05-22', author: '인사팀 이쁜펭' },
        { title: '휴가신청서 임시저장', date: '2025-05-22', author: '인사팀 이쁜펭' },
      ],
    };
  },
  computed: {
    filteredForms() {
      if (!this.formSearchQuery) {
        return this.registeredForms;
      }
      const query = this.formSearchQuery.toLowerCase();
      return this.registeredForms.filter(form => {
        return form.name.toLowerCase().includes(query);
      });
    }
  },
  methods: {
    toggleForms() {
      this.formsExpanded = !this.formsExpanded;
    },
    toggleTemporary() {
      this.temporaryExpanded = !this.temporaryExpanded;
    },
    goToForm(path) {
      this.$router.push(path);
    },
    handleFormInputChange() {
      // 검색어 변경 이벤트 (추가 작업 시)
    }
  }
};
</script>

<style scoped>

/* 타이틀명 */
.page-title {
    margin-left: 20px;
    margin-bottom: 50px;
    color: #00a8e8;
}
.desc {
    margin-left: 20px;
}

/* .form-storage-container {
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f2f2f2;
  min-height: 100vh; 
} */

.storage-box {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden;
  transition: background 0.2s;
}

/* 접힘(collapsed) 상태일 때 배경, 테두리 제거 & margin만 남김 */
.storage-box.collapsed {
  background-color: transparent !important;
  box-shadow: none !important;
  border-radius: 8px !important;
  margin-bottom: 20px !important;
  border: none !important;
}

/* 고정 높이 공통 */
.storage-box.fixed-height {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.storage-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
}

/* 공통 테이블, 버튼, 검색 스타일 */
.box-title {
  margin: 0;
  font-size: 1.2em;
  font-weight: bold;
}
.item-count {
  margin-left: 20px;
  font-size: 0.9em;
  color: #666;
}
.expand-toggle {
  margin-left: auto;
  font-size: 1.2em;
  cursor: pointer;
  padding: 0 10px;
}
.toggle-icon {
  width: 18px;
  height: 18px;
}
.divider {
  border: none;
  height: 1px;
  background-color: #ccc;
  margin: 0;
}
.box-content {
  padding: 20px;
}
.search-area {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.search-container {
  display: flex;
  align-items: center;
}
.search-logo {
  width: 25px;
  height: auto;
}
.search-input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
  min-width: 0;
}
.button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}
.button.primary {
  background-color: #00a8e8;
  color: white;
}
.table-container {
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex-grow: 1;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}
th {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: #f2f2f2;
}
tbody tr:hover {
  background-color: #e0e0e0;
}
.table-container table {
  border: none;
}
.table-container th,
.table-container td {
  border: 1px solid #eee;
}
.table-container tr:first-child th {
  border-top: none;
}
.table-container tr:last-child td {
  border-bottom: none;
}
.table-container tr td:first-child,
.table-container tr th:first-child {
  border-left: none;
}
.table-container tr td:last-child,
.table-container tr th:last-child {
  border-right: none;
}
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}
.clickable-row:hover {
  background-color: #eeeeee;
}
</style>