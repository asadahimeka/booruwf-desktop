import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
import VueMasonry from 'vue-masonry-css'
import installVuetify from './plugins/vuetify'
import App from './App.vue'

import '@/styles/custom.css'

Vue.use(VueCompositionAPI)
Vue.use(VueMasonry)
const vuetify = installVuetify()
const app = new Vue({
  vuetify,
  render: h => h(App),
})
app.$mount('#app')
