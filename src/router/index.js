import { createRouter, createWebHistory } from 'vue-router'
import CancellaionView from '../views/CancellationView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/cancelreservation',
      name: 'cancelReservation',
      component: CancellaionView
    },
    {
      path: '/reservation',
      name: 'createReservation',
      component: () => import('../views/ReservationView.vue')
    }
  ]
})

export default router
