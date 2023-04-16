import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/DashboardView.vue')
    },
    {
      path: '/track',
      name: 'track',
      component: () => import('@/views/TrackView.vue')
    },
    {
      path: '/:pathMatch(.*)*', // catch all
      name: 'not-found',
      component: () => HomeView,
      // change url to home
      beforeEnter: (to, from, next) => {
        next({ name: 'home' })
      }
    },
    {
      path: '/tb',
      name: 'tb',
      component: () => import('@/views/TbView.vue')
    }
  ]
})

export default router
