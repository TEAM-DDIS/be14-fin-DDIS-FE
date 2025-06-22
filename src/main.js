import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'ag-grid-community/styles/ag-grid.css'
import ko from 'element-plus/es/locale/lang/ko'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import '@/assets/main.css'
import 'quill/dist/quill.snow.css'
import '@/assets/theme.css'

import { Buffer } from 'buffer'

window.global = window
window.Buffer = Buffer

// 🔹 Quill + QuillEditor
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// ✅ Quill core 모듈에서 quill-better-table 등록
import Quill from 'quill'
import QuillBetterTable from 'quill-better-table'
import 'quill-better-table/dist/quill-better-table.css'

// 기본 테이블 제거 후 better-table 등록
delete Quill.imports['modules/table']
Quill.register({
  'modules/better-table': QuillBetterTable
}, true)

const app = createApp(App)

app
  .use(createPinia())
  .use(router)
  .use(ElementPlus, { locale: ko })
  .component('QuillEditor', QuillEditor)
  .mount('#app')

export default router

