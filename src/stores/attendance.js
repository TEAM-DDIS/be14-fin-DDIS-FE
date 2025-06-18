import { defineStore } from 'pinia'

export const useAttendanceStore = defineStore('attendance', {
    state: () => ({
        checkIn: null,
        checkOut: null,
        isCheckedIn: false,
        workSeconds: 0
    }),
    actions: {
        setCheckIn(time) {
        this.checkIn = time
        this.isCheckedIn = true
        },
        setCheckOut(time) {
        this.checkOut = time
        this.isCheckedIn = false
        },
        reset() {
        this.checkIn = null
        this.checkOut = null
        this.isCheckedIn = false
        this.workSeconds = 0
        }
    }
})
