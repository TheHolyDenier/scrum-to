import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { describe, expect, it } from 'vitest'
import App from '../App.vue'
import HomeView from './HomeView.vue'
import RoomView from './RoomView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/room/:roomCode', component: RoomView },
  ],
})

describe('ScrumTro base views', () => {
  it('renders the home view', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('ScrumTro')
    expect(wrapper.text()).toContain('Crear una sala')
  })

  it('renders the room code from the route', async () => {
    await router.push('/room/ABC123')
    await router.isReady()

    const wrapper = mount(App, {
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('ABC123')
    expect(wrapper.text()).toContain('Prepara tus cartas')
  })
})
