import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import App from '../App.vue'
import HomeView from './HomeView.vue'
import RoomView from './RoomView.vue'

vi.mock('../composables/useRoomSession', () => ({
  useRoomSession: () => ({
    room: ref({
      code: 'ABC123',
      hostId: 'user-1',
      active: true,
      expiresAt: Date.now() + 1000,
      participants: {},
      round: { id: 'round-1', phase: 'voting', votes: {} },
    }),
    votes: ref({}),
    currentParticipant: ref(null),
    isHost: ref(true),
    selectedVote: ref(null),
    statistics: ref(null),
    loading: ref(false),
    error: ref(''),
    vote: vi.fn(),
    reveal: vi.fn(),
    reset: vi.fn(),
  }),
}))

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
    expect(wrapper.text()).toContain('Elige tu carta')
  })
})
