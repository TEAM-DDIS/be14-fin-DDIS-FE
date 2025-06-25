<template>
  <!-- ① 모달 외곽: 배경 클릭하면 모달 닫기 -->
  <div class="modal-overlay" >
    <div class="modal-content">
      <!-- ② 모달 제목 -->
      <div class="model-text">
        <h3 class="modal-title">{{ mode === '수신자'  ? '수신자 선택'
            : mode === '참조자' ? '참조자 선택'
            :                    '결재선 설정' }}</h3>
      </div>

      <!-- ③ 상단 컨트롤: 탭, 정렬, 검색, 삭제 -->
      <div class="modal-header">
        <!-- ③-1) 조직도/리스트 탭 -->
        <div class="tab-group">
          <button class="active">조직도</button>
        </div>
        <!-- ③-2) 정렬 키 선택 & 검색창 -->
        <div class="sort-search-group">
          <select v-model="sortKey">
             <option value="name">사원명</option>
              <option value="id">사원번호</option>
              <option value="position">직책</option>
              <option value="rank">직급</option>
          </select>
          <input type="text" v-model="search" placeholder="검색" />
        </div>
        <button class="delete-btn btn-delete" @click="deleteSelected">
          삭제
        </button>
      </div>

      <!-- ④ 본문 영역: 조직도, 액션 버튼, 결재선 테이블 -->
      <div class="modal-body">
        <!-- ④-1) 좌측: EHierarchy 컴포넌트로 조직도 렌더링 -->
        <div class="org-tree-area">
          <!-- 검색바 및 검색결과 리스트 추가 -->
          <ul class="employee-search-result scrollbar" v-if="search.trim() && filteredAndSortedNodes.length">
            <li
              v-for="emp in filteredAndSortedNodes"
              :key="emp.employeeId"
              :class="{ selected: selectedNode?.employeeId === emp.employeeId }"
              @click="selectFromSearch(emp)"
              style="cursor:pointer;"
            >
              {{ emp.employeeName }} ({{ emp.positionName }}, {{ emp.rankName }})
            </li>
          </ul>
          <div v-else-if="search.trim() && filteredAndSortedNodes.length === 0" class="no-result">
            검색 결과가 없습니다.
          </div>
          <!-- 기존 조직도 -->
          <EHierarchy
            @loaded-hierarchy="onHierarchyLoaded"
            @employees-selected="onEmployeesSelected"
          />
        </div>

        <!-- ④-2) 중앙: 선택된 직원에 대한 '결재' / '협조' 버튼 -->
        <div class="action-btns">
          <template v-if="mode ==='결재선'">
            <button class="action-btn btn-save" @click="addApprover('결재')" :disabled="!selectedHierarchyEmployees.length">
              결재
            </button>
            <button class="action-btn btn-save" @click="addApprover('협조')" :disabled="!selectedHierarchyEmployees.length">
              협조
            </button>
          </template>
          <template v-else-if="mode === '수신자'">
            <button
              class="action-btn btn-save"
              @click="addApprover('수신자')"
              :disabled="!selectedHierarchyEmployees.length"
            >수신</button>
          </template>
          <template v-else-if="mode === '참조자'">
            <button class="action-btn btn-save"
            @click="addApprover('참조자')"
            :disabled="!selectedHierarchyEmployees.length"
            >참조
            </button>

          </template>
        </div>

        <!-- ④-3) 우측: 현재 선택된 결재선 리스트 테이블 -->
        <div class="approver-table-area">
          <table class="approver-table">
            <thead>
              <tr>
                <th><input type="checkbox" @change="toggleAll" :checked="allSelected"/></th>
                <!-- <th>
                  <input type="checkbox" 
                          @change="toggleAllApprovers" 
                          :checked="allSelected"/>
                </th> -->
                <th>순서</th>
                <th>결재유형</th>
                <th>이름</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="mode==='결재선'" v-for="(item, idx) in approverList" :key="item.employeeId">
                <td><input type="checkbox" :value="item.employeeId" v-model="selectedApprovers"/></td>

                <td>{{ idx + 1 }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.name }}</td>
              </tr>
              <tr v-else-if="mode==='수신자'"
                  v-for="(item, idx) in receiverList" :key="`수신자-${item.employeeId}`">
                <td>    
                    <input type="checkbox" :value="item.employeeId" v-model="selectedReceivers" />
                </td>
                <td>{{ idx + 1 }}</td>
                <td>수신</td>
                <td>{{ item.name }}</td>
              </tr>
              <tr v-else
                  v-for="(item, idx) in referenceList" :key="`참조자-${item.employeeId}`">
                <td>
                  <input type="checkbox" :value="item.employeeId" v-model="selectedReferences" />
                </td>
                <td>{{ idx + 1 }}</td>
                <td>참조</td>
                <td>{{ item.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ⑤ 하단 버튼: 취소(닫기) / 등록(emit submit) -->
      <div class="modal-footer">
        <button class="footer-btn cancel btn-delete" @click="$emit('close')">취소</button>
        <button class="footer-btn submit btn-save" @click="submitSelection">등록</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EHierarchy from '@/components/eapproval/EHierarchy.vue'

// ⑥ Props 정의: 상위에서 받은 조직도(hierarchy)와 초기 결재선(initialApprovers)
const props = defineProps({
  mode:             { type: String, default: '결재선' },
  hierarchy:        { type: Array,  default: () => [] },
  initialApprovers: { type: Array,  default: () => [] }
})
const emit = defineEmits(['submit', 'close', 'submitReceivers', 'submitCcs'])
const sortKey = ref('name')
const search  = ref('')
const searchType = ref('name')
const selectedNode = ref(null)

// — 각 모드별 리스트
const approverList    = ref([])
const receiverList    = ref([])
const referenceList   = ref([])
const hierarchyData   = ref([])

// — 각 모드별 선택 배열
const selectedApprovers = ref([])
const selectedReceivers = ref([])
const selectedReferences = ref([])

// — 조직도에서 선택된 사원 (다중 선택을 위해 배열로 변경)
const selectedHierarchyEmployees = ref([]) // 여러 직원을 담을 배열

// 초기 데이터 세팅
onMounted(() => {
  if (props.mode === '수신자') {
    receiverList.value = props.initialApprovers.map(a => ({
      employeeId: a.employeeId,
      name:       a.name || a.employeeName,  // ✅ name이 빠져 있으면 화면에 안 뜸
      position:   a.position
    }))
  }
  else if (props.mode === '참조자') {
    referenceList.value = props.initialApprovers.map(a => ({
      employeeId: a.employeeId,
      name:       a.name || a.employeeName,
      position:   a.position
    }))
  }
  else {
    approverList.value = props.initialApprovers.map((a, i) => ({
      step:          a.step || i + 1,
      employeeId:    a.employeeId,
      name:          a.name,
      position:      a.position,
      team:          a.team,
      status:        a.status,
      type:          a.type,
      rank:          a.rank,
      rankName:      a.rankName || a.rank,
      lineTypeLabel: a.lineTypeLabel,
      viewedAt:      a.viewedAt,
      approvedAt:    a.approvedAt,
      comment:       a.comment
    }))
  }

  // 조직도 초기화
  // selectedNodes.value = flattenAllEmployees(props.hierarchy) // 이제 필요 없음
})

// 조직도 helper (selectedEmployees를 기반으로 실제 객체 매핑)
function flattenAllEmployees(tree) {
  const list = [];
  tree.forEach(head => {
    head.departments?.forEach(dept => {
      dept.teams?.forEach(team => {
        team.members?.forEach(emp => {
          list.push({
            ...emp,
            teamName:       team.teamName,
            departmentName: dept.departmentName,
            headName:       head.headName,
            rankName:       emp.rankName || emp.rank // rankName 추가
          });
        });
      });
    });
  });
  return list;
}

// 조직도 이벤트 핸들러
function onHierarchyLoaded(loaded) {
  hierarchyData.value = loaded
  // selectedNodes.value = flattenAllEmployees(loaded) // 이제 필요 없음
}

// EHierarchy에서 선택된 직원 ID 배열과 객체 배열을 받아옴
function onEmployeesSelected(ids) {
  // ids는 선택된 employeeId 배열
  // hierarchyData에서 해당 employeeId를 가진 직원 객체를 찾아 selectedHierarchyEmployees에 저장
  selectedHierarchyEmployees.value = flattenAllEmployees(hierarchyData.value).filter(emp =>
    ids.includes(Number(emp.employeeId))
  );
  console.log('선택된 사원들 (selectedHierarchyEmployees):', selectedHierarchyEmployees.value);
}

function selectEmployee(emp) {
  // 단일 선택 로직은 이제 사용하지 않음 (체크박스 v-model로 대체)
}

// 좌측 필터·정렬 (selectedNodes -> selectedHierarchyEmployees 로 변경)
const filteredNodes = computed(() => {
  const q = search.value.trim().toLowerCase()
  const type = searchType.value
  if (!q) return flattenAllEmployees(hierarchyData.value)
  return flattenAllEmployees(hierarchyData.value).filter(emp => {
    if (type === 'name') {
      return emp.employeeName?.toLowerCase().includes(q)
    } else if (type === 'id') {
      return String(emp.employeeId)?.toLowerCase().includes(q)
    } else if (type === 'position') {
      return emp.positionName?.toLowerCase().includes(q)
    } else if (type === 'rank') {
      return emp.rankName?.toLowerCase().includes(q)
    }
    return false
  })
})

const filteredAndSortedNodes = computed(() => {
  const arr = [...filteredNodes.value]
  return searchType.value === 'name'
    ? arr.sort((a, b) => a.employeeName.localeCompare(b.employeeName))
    : arr.sort((a, b) => (a.departmentName || '').localeCompare(b.departmentName))
})

// — 화면에 뿌릴 리스트 (step, type 보강)
const displayList = computed(() => {
  if (props.mode === '수신자') {
    return receiverList.value.map((u, i) => ({
      employeeId: u.employeeId,
      name:       u.name,
      type:       '수신',
      step:       i + 1
    }))
  }
  else if (props.mode === '참조자') {
    return referenceList.value.map((u, i) => ({
      employeeId: u.employeeId,
      name:       u.name,
      type:       '참조',
      step:       i + 1
    }))
  }
  else {
    return approverList.value
  }
})

// — 현재 모드 리스트 참조
const currentList = computed(() => {
  if (props.mode === '수신자')   return receiverList.value
  if (props.mode === '참조자')   return referenceList.value
  return approverList.value
})

// — 체크박스 바인딩 대상 computed
const selectedList = computed({
  get() {
    if (props.mode === '수신자')   return selectedReceivers.value
    if (props.mode === '참조자')   return selectedReferences.value
    return selectedApprovers.value
  },
  set(v) {
    if (props.mode === '수신자')   selectedReceivers.value = v
    else if (props.mode === '참조자') selectedReferences.value = v
    else                              selectedApprovers.value = v
  }
})

// — 전체선택 상태
const allSelected = computed(() =>
  currentList.value.length > 0 &&
  selectedList.value.length === currentList.value.length
)

// — 전체선택 토글
function toggleAll(e) {
  selectedList.value = e.target.checked
    ? currentList.value.map(item => item.employeeId)
    : []
}

// — 선택 항목 삭제
function deleteSelected() {
  const keep = currentList.value.filter(item =>
    !selectedList.value.includes(item.employeeId)
  )

  if (props.mode === '수신자')      receiverList.value  = keep
  else if (props.mode === '참조자')  referenceList.value = keep
  else                              approverList.value  = keep

  selectedList.value = []
}

// Function to add selected employee as approver or cooperator
// function addApprover(type) {
//   if (selectedHierarchyEmployees.value.length > 0) {
//     selectedHierarchyEmployees.value.forEach(selectedEmp => {
//       const newMember = {
//         employeeId: selectedEmp.employeeId,
//         name: selectedEmp.employeeName,
//         team: selectedEmp.teamName, 
//         position: selectedEmp.positionName, 
//         rankName: selectedEmp.rankName || selectedEmp.rank, 
//         status: '대기중', // 결재선에만 해당될 수 있음
//         type: type,
//       };

//       let targetList;
//       let logMessage;
//       if (props.mode === '수신자') {
//         targetList = receiverList.value;
//         logMessage = '수신자 추가 후 receiverList:';
//       } else if (props.mode === '참조자') {
//         targetList = referenceList.value;
//         logMessage = '참조자 추가 후 referenceList:';
//       } else {
//         targetList = approverList.value;
//         logMessage = '결재자 추가 후 approverList:';
//       }

//       // Prevent duplicates based on employeeId for the target list
//       if (!targetList.some(a => a.employeeId === newMember.employeeId)) {
//         targetList.push(newMember);
//       }
//     });
//     console.log(logMessage, approverList.value, receiverList.value, referenceList.value);
//   }
// }

function addApprover(type) {
  // 1) 선택된 사원이 없으면 아무 것도 안 함
  if (selectedHierarchyEmployees.value.length === 0) return;

  // 2) 다중 선택된 사원 각각 처리
  selectedHierarchyEmployees.value.forEach(emp => {
    if (props.mode === '수신자') {
      // 중복 체크 후 receiverList에 추가
      if (!receiverList.value.some(u => u.employeeId === emp.employeeId)) {
        receiverList.value.push({
          employeeId: emp.employeeId,
          name:       emp.employeeName,
          position:   emp.positionName
        });
      }
    }
    else if (props.mode === '참조자') {
      // 중복 체크 후 referenceList에 추가
      if (!referenceList.value.some(u => u.employeeId === emp.employeeId)) {
        referenceList.value.push({
          employeeId: emp.employeeId,
          name:       emp.employeeName,
          position:   emp.positionName
        });
      }
    }
    else {
      // 결재선 모드: 중복 체크 후 approverList에 추가
      if (!approverList.value.some(a => a.employeeId === emp.employeeId)) {
        approverList.value.push({
          step:          approverList.value.length + 1,
          employeeId:    emp.employeeId,
          name:          emp.employeeName,
          position:      emp.positionName,
          rankName:      emp.rankName,
          team:          emp.teamName || '',
          status:        '대기중',
          type,
          lineTypeLabel: '양식 결재선',
          viewedAt:      null,
          approvedAt:    null,
          comment:       ''
        });
      }
    }
  });
    console.log('결재자 추가 후 approverList:', approverList.value);
  }

// — 최종 등록
function submitSelection() {
  let payload

  if (props.mode === '수신자') {
    payload = receiverList.value.map(u => ({
      employeeId: Number(u.employeeId),
      name:       u.name
    }))
    console.log('🔔 submitSelection called, mode=수신자, payload=', payload)
    emit('submitReceivers', payload)

  } else if (props.mode === '참조자') {
    payload = referenceList.value.map(u => ({
      employeeId: Number(u.employeeId),
      name:       u.name
    }))
    console.log('🔔 submitSelection called, mode=참조자, payload=', payload)
    emit('submitCcs', payload)

  } else {
    payload = approverList.value.map(a => ({
      ...a,
      employeeId: Number(a.employeeId)
    }))
    console.log('🔔 submitSelection called, mode=결재선, payload=', payload)
    emit('submit', payload)
  }

  console.log('✅ emit done, closing modal')
  emit('close')
}

// 검색 결과에서 사원 클릭 시 조직도에서 해당 사원 선택
function selectFromSearch(emp) {
  selectedNode.value = emp
  // 조직도에서 해당 사원만 선택되도록 이벤트 트리거
  // EHierarchy가 v-model이 아니므로, onEmployeesSelected를 직접 호출
  onEmployeesSelected([emp.employeeId])
}
</script>



  
    <style scoped>
    .employee-list {
      list-style: none;
      margin: 16px 0 0;
      padding: 0;
      max-height: 200px;
      overflow-y: auto;
    }
    .employee-list li {
      padding: 6px 8px;
      margin-bottom: 4px;
      cursor: pointer;
      border-radius: 4px;
    }
    .employee-list li.selected {
      background-color: #e0f4ff;
    }
    .no-result {
      color: #888;
      text-align: center;
    }
    
    /* ... 나머지 기존 스타일 유지 ... */
    
    
    
    
    /* 좌측 팀원 리스트 스타일 */
    
    /* =========================
       모달 전체 오버레이/컨테이너
    ========================= */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.15);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-content {
      background: #fff;
      border-radius: 18px;
      width: 900px;           /* 모달 가로 크기 넉넉히 */
      min-width: 700px;
      max-width: 98vw;
      min-height: 600px;      /* 모달 세로 최소 크기 넉넉히 */
      box-shadow: 0 2px 24px rgba(0,0,0,0.13);
      display: flex;
      flex-direction: column;
      position: relative;
      padding: 0 0 0 0;
    }
    
    /* =========================
       상단 제목/탭/정렬/검색/삭제
    ========================= */
    .model-text {
      padding: 24px 0 0 0;    /* 상단 여백 */
      text-align: center;
    }
    .modal-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 30px;
      margin-left: 0;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      padding: 0 18px 0 18px;
      border-bottom: 1.5px solid #e0e0e0;
      position: relative;
      flex-wrap: nowrap; /* 한 줄 유지 */
    }
    .tab-group {
      display: flex;
      gap: 4px;
    }
    .tab-group button {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-bottom: none;
      border-radius: 8px 8px 0 0;
      padding: 6px 18px;
      font-weight: 500;
      font-size: 15px;
      color: #333;
      cursor: pointer;
    }
    .tab-group .active {
      background: #fff;
      color: #00a8e8;
      border-bottom: 2px solid #fff;
      font-weight: bold;
    }
    .sort-search-group {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 12px;
      flex-shrink: 0;
    }
    .sort-search-group select {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 14px;
      width: 90px;
      min-width: 70px;
      max-width: 120px;
    }
    .sort-search-group input {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 14px;
      width: 120px;
      min-width: 80px;
      max-width: 180px;
    }
    .delete-btn {
      margin-left: auto;
      margin-bottom: 10px;
      flex-shrink: 0;
    }
    
    /* =========================
       조직도/결재선 본문 영역
    ========================= */
    .modal-body {
      display: flex;
      flex: 1;
      min-height: 400px;
      padding: 0 32px 0 32px; /* 좌우 여백 넉넉히 */
      gap: 24px;              /* 좌우 영역 간격 */
      margin-top: 8px;
      align-items: stretch;   /* 세로로 모두 같은 높이 */
      justify-content: center;
    }
    .org-tree-area, .approver-table-area {
      /* 조직도/결재자 영역 동일하게 */
      flex: 1 1 0;
      min-width: 320px;
      max-width: 420px;
      height: 410px;
      background: #fafbfc;
      border: 1px solid #e0e0e0;
      border-radius: 18px;
      padding: 24px 16px 24px 16px;
      overflow-y: auto;
      box-sizing: border-box;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
    }
    .action-btns {
      display: flex;
      flex-direction: column;
      gap: 24px;
      align-items: center;
      justify-content: center;
      margin: 0 8px;
      height: 420px;
      align-self: center;
    }
    .approver-table {
      width: 100%;
      border-collapse: collapse;
    }
    .approver-table th, .approver-table td {
      border: 1px solid #e0e0e0;
      padding: 8px 10px;
      font-size: 15px;
      text-align: center;
    }
    .approver-table th {
      background: #f8f9fa;
      color: #222;
      font-weight: 600;
    }
    
    /* =========================
       하단 버튼 영역
    ========================= */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px 32px 24px 0;
      border-top: 1.5px solid #e0e0e0;
      background: #fff;
      border-radius: 0 0 12px 12px;
    }
    .footer-btn {
      font-size: 15px;
      font-weight: 500;
      border: none;
      border-radius: 6px;
      padding: 8px 32px;
      cursor: pointer;
    }
    
    /* =========================
       버튼 스타일(공통)
    ========================= */
    /* 저장(등록/결재/협조) 버튼 스타일 */
    .btn-save {
      font-size: 14px;
      font-weight: bold;
      background-color: #00a8e8;
      color: white;
      border: 1px solid transparent;
      border-radius: 10px;
      padding: 10px 30px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: background-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .btn-save:hover {
      background-color: white;
      color: #00a8e8;
      border-color: #00a8e8;
      box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
    }
    .btn-save:disabled {
      background: #b3e3f7;
      color: #fff;
      cursor: not-allowed;
      border-color: #b3e3f7;
    }
    /* 삭제/취소 버튼 스타일 */
    .btn-delete {
      font-size: 14px;
      font-weight: bold;
      background-color: #D3D3D3;
      color: #000;
      border: none;
      border-radius: 10px;
      padding: 10px 30px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: background-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .btn-delete:hover {
      background-color: #000;
      color: #fff;
    }
    </style>
      