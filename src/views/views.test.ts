import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { nextTick } from 'vue'
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
    { path: '/', name: 'home', component: HomeView },
    { path: '/room', redirect: { name: 'home' } },
    { path: '/room/:roomCode', name: 'room', component: RoomView },
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

  it('redirects an incomplete room URL to the entry view', async () => {
    await router.push('/room')
    await router.isReady()

    const wrapper = mount(App, {
      global: { plugins: [router] },
    })

    expect(router.currentRoute.value.name).toBe('home')
    expect(wrapper.find('#participant-name').exists()).toBe(true)
  })

  it('restores the participant identity in the entry form', async () => {
    localStorage.setItem(
      'scrumtro:identity',
      JSON.stringify({ name: 'Ada', avatar: 'moon' }),
    )

    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: { plugins: [router] },
    })
    await nextTick()

    expect(wrapper.find('#participant-name').element).toHaveProperty('value', 'Ada')
    expect(wrapper.find('#participant-avatar').element).toHaveProperty('value', '#2e86ab')

    localStorage.removeItem('scrumtro:identity')
  })

  it('exposes labelled voting controls and keyboard-friendly focus targets', async () => {
    await router.push('/room/ABC123')
    await router.isReady()

    const wrapper = mount(App, {
      global: { plugins: [router] },
    })

    const votingCards = wrapper.findAll('button[aria-pressed]')

    expect(votingCards).toHaveLength(7)
    expect(wrapper.find('[aria-label="Valores Fibonacci"]').exists()).toBe(true)
    expect(wrapper.find('h1').attributes('id')).toBe('room-title')
  })
})
