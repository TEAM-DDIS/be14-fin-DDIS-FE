import { defineStore } from 'pinia'

export const useDraftStore = defineStore('draft', {
  state: () => ({
    empId:        null,      // ← 로그인한 사람 ID
    form:         {},        // 기본 구조는 컴포넌트 쪽에서 주입
    approvalLines: [],
    receiverList:  [],
    referenceList: [],
    uploadedFiles: [],
    savedAt:       null
  }),
  actions: {
    /** 덮어쓰기/병합 저장 */
    save(payload) {
      Object.assign(this, payload)
      this.savedAt = new Date().toISOString()
    },
    /** 완전 초기화 */
    clear() { this.$reset() }
  },
  // 새로고침 대비 persist
  persist: {
    key: 'pinia-draft',      // localStorage 키
    storage: localStorage
  }
})