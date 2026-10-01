import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  calculateVoteStatistics,
  type FibonacciValue,
  type Room,
} from '../domain/room'
import {
  createRoom,
  getCurrentUser,
  joinRoom,
  resetRoom,
  revealRoom,
  subscribeToRoom,
  subscribeToVotes,
  submitVote,
  type RoomIdentity,
} from '../services/roomService'

export function useRoomSession() {
  const route = useRoute()
  const roomCode = String(route.params.roomCode).toUpperCase()
  const identity = getStoredIdentity()
  const room = ref<Room | null>(null)
  const votes = ref<Record<string, FibonacciValue>>({})
  const currentUserId = ref('')
  const selectedVote = ref<FibonacciValue | null>(null)
  const loading = ref(true)
  const error = ref('')
  let unsubscribeRoom: (() => void) | undefined
  let unsubscribeVotes: (() => void) | undefined

  const currentParticipant = computed(() =>
    room.value?.participants[currentUserId.value],
  )
  const isHost = computed(
    () => currentUserId.value !== '' && room.value?.hostId === currentUserId.value,
  )
  const statistics = computed(() =>
    room.value
      ? calculateVoteStatistics(
          { ...room.value.round, votes: votes.value },
          Object.keys(room.value.participants).length,
        )
      : null,
  )

  async function start(): Promise<void> {
    try {
      loading.value = true
      const user = await getCurrentUser()
      currentUserId.value = user.uid
      const mode = route.query.mode === 'create' ? 'create' : 'join'

      if (mode === 'create') {
        await createRoom(roomCode, identity)
      } else {
        await joinRoom(roomCode, identity)
      }

      unsubscribeRoom = subscribeToRoom(roomCode, (nextRoom) => {
        room.value = nextRoom
        if (!nextRoom) {
          return
        }
        unsubscribeVotes?.()
        const visibleParticipantIds =
          nextRoom.round.phase === 'revealed'
            ? Object.keys(nextRoom.participants)
            : [currentUserId.value]
        unsubscribeVotes = subscribeToVotes(
          roomCode,
          nextRoom.round.id,
          visibleParticipantIds,
          (nextVotes) => {
            votes.value = nextVotes
            selectedVote.value =
              nextVotes[currentUserId.value] ?? selectedVote.value
          },
        )
      })
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'No se pudo abrir la sala'
    } finally {
      loading.value = false
    }
  }

  async function vote(value: FibonacciValue): Promise<void> {
    if (!room.value || !currentUserId.value || room.value.round.phase !== 'voting') {
      return
    }
    try {
      error.value = ''
      selectedVote.value = value
      await submitVote(roomCode, room.value.round.id, currentUserId.value, value)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'No se pudo guardar el voto'
    }
  }

  async function reveal(): Promise<void> {
    if (!isHost.value) return
    await revealRoom(roomCode)
  }

  async function reset(): Promise<void> {
    if (!room.value || !isHost.value) return
    await resetRoom(
      roomCode,
      Object.keys(room.value.participants),
    )
    selectedVote.value = null
  }

  onMounted(start)
  onUnmounted(() => {
    unsubscribeRoom?.()
    unsubscribeVotes?.()
  })

  return {
    room,
    votes,
    currentParticipant,
    isHost,
    selectedVote,
    statistics,
    loading,
    error,
    vote,
    reveal,
    reset,
  }
}

function getStoredIdentity(): RoomIdentity {
  const storedIdentity = sessionStorage.getItem('scrumtro:identity')
  if (!storedIdentity) {
    return { name: 'Invitado', avatar: 'star' }
  }

  try {
    const parsed = JSON.parse(storedIdentity) as Partial<RoomIdentity>
    return {
      name: parsed.name ?? 'Invitado',
      avatar: parsed.avatar ?? 'star',
    }
  } catch {
    return { name: 'Invitado', avatar: 'star' }
  }
}
