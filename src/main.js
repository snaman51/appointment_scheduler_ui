import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// import DatetimePicker from 'vuetify-datetime-picker'
import 'vuetify/styles'

import 'vuetify/dist/vuetify.min.css';
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const app = createApp(App)

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'light',
        //
      },
  })
app.use(vuetify);

app.use(router)
// app.use(DatetimePicker)

app.mount('#app')
