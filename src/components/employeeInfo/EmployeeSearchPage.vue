<template>
  <div class="employee-detail">
    <!-- 상단 제목 및 버튼 -->
    <div class="header-row">
      <h2 class="page-title">사원 상세 조회</h2>
      <div class="button-group-inline tall-buttons">
        <button class="btn back">목록</button>
        <button class="btn delete">삭제</button>
        <button class="btn save">저장</button>
      </div>
    </div>

    <!-- 상단 카드 -->
    <div class="card compact-card adjusted-card short-height-card overflow-scroll-wrapper">
      <div class="top-card-layout">
        <div class="profile-area">
          <div class="profile-wrapper">
            <img class="profile-img" src="/images/profile-placeholder.png" alt="Profile" />
            <button class="upload-btn-rounded">+</button>
          </div>
        </div>

        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item"><label class="label-bold">사원명</label><input class="same-size-input" value="김량량" /></div>
            <div class="info-item"><label class="label-bold">본부</label>
              <select class="same-size-input" v-model="selectedHead">
                <option value="">선택</option>
                <option v-for="(departments, head) in departmentMap" :key="head" :value="head">{{ head }}</option>
              </select>
            </div>
            <div class="info-item"><label class="label-bold">부서</label>
              <select class="same-size-input" v-model="selectedDepartment">
                <option value="">선택</option>
                <option v-for="dept in departmentMap[selectedHead] || []" :key="dept">{{ dept }}</option>
              </select>
            </div>
            <div class="info-item"><label class="label-bold">팀</label>
              <select class="same-size-input" v-model="selectedTeam">
                <option value="">선택</option>
                <option v-for="team in teamMap[selectedDepartment] || []" :key="team">{{ team }}</option>
              </select>
            </div>
            <div class="info-item"><label class="label-bold">사번</label><input class="same-size-input" value="1826058" /></div>
          </div>

          <div class="info-column">
            <div class="info-item"><label class="label-bold">직무</label><input class="same-size-input" value="PC게임개발" /></div>
            <div class="info-item"><label class="label-bold">직책</label><input class="same-size-input" value="팀원" /></div>
            <div class="info-item"><label class="label-bold">직급</label><input class="same-size-input" value="사원" /></div>
            <div class="info-item"><label class="label-bold">연락처</label><input class="same-size-input" value="010-7216-3380" /></div>
            <div class="info-item"><label class="label-bold">이메일</label><input class="same-size-input" value="zlions2127@gmail.com" /></div>
          </div>

          <div class="info-column">
            <div class="info-item"><label class="label-bold">근무형태</label><input class="same-size-input" value="정규직" /></div>
            <div class="info-item"><label class="label-bold">입사일</label><input type="date" class="same-size-input" value="2025-01-27" /></div>
            <div class="info-item"><label class="label-bold">퇴사일</label><input type="date" class="same-size-input" /></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 탭 메뉴 -->
    <div class="tabs">
      <button v-for="tab in tabs" :key="tab" :class="['tab', { active: currentTab === tab }]" @click="currentTab = tab">{{ tab }}</button>
    </div>

    <!-- 탭 내용 -->
    <div class="card tab-content overflow-scroll-wrapper">
      <div v-if="currentTab === '인사정보'">
        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item"><label class="label-bold">성별</label><input class="same-size-input" value="남" /></div>
            <div class="info-item"><label class="label-bold">국적</label><input class="same-size-input" value="대한민국" /></div>
            <div class="info-item"><label class="label-bold">생년월일</label><input class="same-size-input" value="1999-03-10" /></div>
            <div class="info-item"><label class="label-bold">직무</label><input class="same-size-input" value="PC게임개발" /></div>
            <div class="info-item"><label class="label-bold">직책</label><input class="same-size-input" value="팀원" /></div>
            <div class="info-item"><label class="label-bold">직급</label><input class="same-size-input" value="사원" /></div>
            <div class="info-item"><label class="label-bold">입사일</label><input type="date" class="same-size-input" value="2025-01-27" /></div>
            <div class="info-item"><label class="label-bold">퇴사일</label><input type="date" class="same-size-input" /></div>
            <div class="info-item"><label class="label-bold">4대 보험</label><input class="same-size-input" value="Y" /></div>
            <div class="info-item"><label class="label-bold">거래 은행</label><input class="same-size-input" value="농협" /></div>
            <div class="info-item"><label class="label-bold">예금주</label><input class="same-size-input" value="김량량" /></div>
            <div class="info-item"><label class="label-bold">계좌</label><input class="same-size-input" value="351-0920-7214-83" /></div>
          </div>
        </div>
      </div>

      <div v-else-if="currentTab === '개인정보'">
        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item"><label class="label-bold">주민등록번호</label><input class="same-size-input" value="990310-1450732" /></div>
            <div class="info-item"><label class="label-bold">주소</label><input class="same-size-input" value="경기도 광명시" /></div>
            <div class="info-item"><label class="label-bold">출신학교</label><input class="same-size-input" value="와플대학" /></div>
            <div class="info-item"><label class="label-bold">장애 여부</label><input class="same-size-input" value="비장애" /></div>
            <div class="info-item"><label class="label-bold">병역 여부</label><input class="same-size-input" value="군필" /></div>
            <div class="info-item"><label class="label-bold">부양 가족 수</label><input class="same-size-input" value="3" /></div>
            <div class="info-item"><label class="label-bold">결혼 여부</label><input class="same-size-input" value="기혼" /></div>
            <div class="info-item"><label class="label-bold">결혼 일자</label><input type="date" class="same-size-input" value="2023-01-27" /></div>
            <div class="info-item"><label class="label-bold">경력 년수</label><input class="same-size-input" /></div>
            <div class="info-item"><label class="label-bold">이전 근무 회사</label><input class="same-size-input" /></div>
            <div class="info-item"><label class="label-bold">최종 학력</label><input class="same-size-input" value="대졸" /></div>
            <div class="info-item"><label class="label-bold">전공</label><input class="same-size-input" value="컴퓨터공학과" /></div>
            <div class="info-item"><label class="label-bold">졸업년도</label><input type="date" class="same-size-input" value="2022-02-25" /></div>
          </div>
        </div>
      </div>

      <div v-else-if="currentTab === '인사발령'">
        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item"><label class="label-bold">최근 인사 발령일</label><input type="date" class="same-size-input" value="2024-03-10" /></div>
            <div class="info-item"><label class="label-bold">최근 직급 변경일</label><input type="date" class="same-size-input" /></div>
          </div>
        </div>
      </div>

      <div v-else-if="currentTab === '징계'">
        <div class="grid-info scrollable-grid">
          <div class="info-column">
            <div class="info-item"><label class="label-bold">징계 번호</label><input class="same-size-input" /></div>
            <div class="info-item"><label class="label-bold">징계 내용</label><input class="same-size-input" value="탕비실 절도" /></div>
          </div>
        </div>
      </div>

      <div v-else-if="currentTab === '계약'">
        <table class="contract-table">
          <thead>
            <tr><th>번호</th><th>요청일자</th><th>계약서류</th><th>계약일자</th><th>만료일자</th></tr>
          </thead>
          <tbody>
            <tr><td>4</td><td>2020.05.11</td><td><a href="#">노경계약서</a></td><td>2020.05.11</td><td>2022.05.10</td></tr>
            <tr><td>3</td><td>2018.04.11</td><td><a href="#">4대보험가입서</a></td><td>2018.04.12</td><td>2020.04.10</td></tr>
            <tr><td>2</td><td>2018.01.06</td><td><a href="#">개인정보제공동의서</a></td><td>2018.01.07</td><td>2020.01.05</td></tr>
            <tr><td>1</td><td>2017.12.28</td><td><a href="#">근로계약서</a></td><td>2017.12.28</td><td>2019.12.27</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const tabs = ['인사정보', '개인정보', '인사발령', '징계', '계약']
const currentTab = ref('인사정보')

const selectedHead = ref('개발본부')
const selectedDepartment = ref('PC게임개발부서')
const selectedTeam = ref('PC개발팀')

const departmentMap = {
  '개발본부': ['PC게임개발부서', '아트개발부서'],
  '경영지원본부': ['인사부서', '재무회계부서'],
  '사업본부': ['마케팅부서', '영업부서']
}

const teamMap = {
  'PC게임개발부서': ['PC개발팀', 'PC게임기획팀'],
  '아트개발부서': ['아트기획팀'],
  '인사부서': ['채용팀', '인사평가팀'],
  '재무회계부서': ['급여정산팀', '세무관리팀'],
  '마케팅부서': ['콘텐츠마케팅팀', '퍼포먼스팀'],
  '영업부서': ['B2B영업팀', 'B2C영업팀']
}

watch(selectedHead, () => {
  selectedDepartment.value = ''
  selectedTeam.value = ''
})

watch(selectedDepartment, () => {
  selectedTeam.value = ''
})
</script>

<style scoped>
.employee-detail {
  padding: 1rem;
  font-size: 14px;
  max-width: 100%;
  overflow-x: hidden;
  margin: 0 auto;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.button-group-inline {
  display: flex;
  gap: 0.5rem;
}

.button-group-inline .btn {
  background-color: #00a8e8;
  color: white;
  border: none;
  padding: 0.4rem 1.2rem;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

.button-group-inline .btn:hover {
  opacity: 0.9;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.overflow-scroll-wrapper {
  overflow-x: auto;
  width: 100%;
}

.top-card-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  min-width: 1024px;
}

.profile-area {
  flex-shrink: 0;
}

.profile-img {
  width: 200px;
  height: 260px;
  object-fit: cover;
  border-radius: 8px;
}

.upload-btn-rounded {
  margin-top: 0.5rem;
  background: #e0e0e0;
  border: none;
  border-radius: 12px;
  width: 30px;
  height: 30px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-info {
  display: grid;
  grid-template-columns: repeat(3, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
}

@media (max-width: 1024px) {
  .grid-info {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    white-space: normal;
  }
}

.info-column {
  display: contents;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-bold {
  font-weight: 600;
  width: 100px;
  text-align: right;
}

.same-size-input {
  width: 180px;
  height: 36px;
  padding: 0.6rem;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.tabs {
  display: flex;
  gap: 1px;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ccc;
}

.tab {
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  background: #e0e0e0;
  border: 1px solid #ccc;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}

.tab.active {
  background: #fff;
  font-weight: bold;
  border-bottom: 1px solid #fff;
}

.tab-content {
  background: #fff;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  padding: 1.5rem;
  overflow-x: auto;
}

.contract-table {
  width: 100%;
  border-collapse: collapse;
}

.contract-table th,
.contract-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: center;
}
</style>
