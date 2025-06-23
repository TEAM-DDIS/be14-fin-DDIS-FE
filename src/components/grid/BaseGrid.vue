<template>
  <ag-grid-vue
  :class="['custom-theme', isDarkMode ? 'ag-theme-alpine-dark' : 'ag-theme-alpine']"
    :style="`width:${width}; height:${height}`"
    :columnDefs="columnDefs"
    :rowData="rowData"
    :defaultColDef="defaultColDef"
    :pagination="pagination"
    :paginationPageSize="pageSize"
    rowSelection="multiple"
    @grid-ready="onGridReady"
    @rowClicked="e => emit('row-click', e)"
    @cellClicked="e => emit('cell-click', e)"
  />
</template>

<script setup>
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

ModuleRegistry.registerModules([AllCommunityModule])

const props = defineProps({
  columnDefs:    { type: Array, required: true },
  rowData:       { type: Array, required: true },
  width:         { type: String, default: '100%' },
  height:        { type: String, default: '600px' },
  pagination:    { type: Boolean, default: true },
  pageSize:      { type: Number, default: 10 }
})
const emit = defineEmits(['ready','row-click','cell-click'])

const defaultColDef = {
  sortable: true,
  filter:   true,
  resizable:true,
}

function onGridReady(params) {
  emit('ready', params)
}
</script>

<style scoped>

</style>
