import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/main.css'

import topbar from 'topbar'


// topbar config
topbar.config({
    autoRun      : true,
    barThickness : 4,
    barColors    : {
        '0'      : 'rgba(26,  188, 156, 1)',
        '.25'    : 'rgba(52,  152, 219, 1)',
        '.50'    : 'rgba(241, 196, 15,  1)',
        '.75'    : 'rgba(230, 126, 34,  1)',
        '1.0'    : 'rgba(211, 84,  0,   1)'
    },
    shadowBlur   : 10,
    shadowColor  : 'rgba(0,   0,   0,   .6)',
})

const app = createApp(App)

app.use(router)

app.mount('#app')