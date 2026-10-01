import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from 'firebase/auth'
import {
  get,
  onValue,
  ref,
  set,
  update,
  type Unsubscribe,
} from 'firebase/database'
import { auth, database } from '../lib/firebase'
import {
  isFibonacciValue,
  isValidAvatar,
  isValidParticipantName,
  isValidRoomCode,
  type FibonacciValue,
  type Participant,
  type Room,
  type RoomRound,
} from '../domain/room'

export interface RoomIdentity {
  name: string
  avatar: string
}

function normalizeRoom(snapshotValue: Record<string, unknown>): Room {
  const rawParticipants = (snapshotValue.participants ?? {}) as Record<
    string,
    Participant
  >
  const hostId = String(snapshotValue.hostId ?? '')
  const rawRound = (snapshotValue.round ?? {}) as Partial<RoomRound>

  return {
    code: String(snapshotValue.code ?? ''),
    hostId,
    participants: Object.fromEntries(
      Object.entries(rawParticipants).map(([participantId, participant]) => [
        participantId,
        { ...participant, isHost: participantId === hostId },
      ]),
    ),
    round: {
      id: String(rawRound.id ?? 'round-1'),
      phase: rawRound.phase === 'revealed' ? 'revealed' : 'voting',
      votes: {},
    },
    active: snapshotValue.active !== false,
    expiresAt: Number(snapshotValue.expiresAt ?? 0),
  }
}

function roomPath(roomCode: string): string {
  return `rooms/${roomCode}`
}

function privateVotesPath(roomCode: string, roundId: string): string {
  return `roomVotes/${roomCode}/${roundId}`
}

export async function getCurrentUser(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser
  }

  const existingUser = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })

  if (existingUser) {
    return existingUser
  }

  const credential = await signInAnonymously(auth)
  return credential.user
}

export async function createRoom(
  roomCode: string,
  identity: RoomIdentity,
): Promise<User> {
  const user = await getCurrentUser()
  validateRoomInput(roomCode, identity)

  const roomReference = ref(database, roomPath(roomCode))

  const participant: Participant = {
    id: user.uid,
    name: identity.name.trim(),
    avatar: identity.avatar.trim(),
    isHost: true,
  }

  await set(roomReference, {
    code: roomCode,
    hostId: user.uid,
    active: true,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    participants: {
      [user.uid]: { ...participant, hasVoted: false },
    },
    round: {
      id: `round-${Date.now()}`,
      phase: 'voting',
    },
  })

  return user
}

export async function joinRoom(
  roomCode: string,
  identity: RoomIdentity,
): Promise<User> {
  const user = await getCurrentUser()
  validateRoomInput(roomCode, identity)

  const roomSnapshot = await get(ref(database, roomPath(roomCode)))
  if (!roomSnapshot.exists()) {
    throw new Error('No existe una sala con ese código')
  }

  const room = normalizeRoom(roomSnapshot.val() as Record<string, unknown>)
  if (!room.active || room.expiresAt < Date.now()) {
    throw new Error('Esta sala ya no está disponible')
  }

  await set(ref(database, `${roomPath(roomCode)}/participants/${user.uid}`), {
    id: user.uid,
    name: identity.name.trim(),
    avatar: identity.avatar.trim(),
    isHost: user.uid === room.hostId,
    hasVoted: false,
  })

  return user
}

export function subscribeToRoom(
  roomCode: string,
  callback: (room: Room | null) => void,
): Unsubscribe {
  return onValue(ref(database, roomPath(roomCode)), (snapshot) => {
    callback(
      snapshot.exists()
        ? normalizeRoom(snapshot.val() as Record<string, unknown>)
        : null,
    )
  })
}

export function subscribeToVotes(
  roomCode: string,
  roundId: string,
  participantIds: string[],
  callback: (votes: Record<string, FibonacciValue>) => void,
): Unsubscribe {
  const votes: Record<string, FibonacciValue> = {}
  const unsubscribers = participantIds.map((participantId) =>
    onValue(
      ref(database, `${privateVotesPath(roomCode, roundId)}/${participantId}`),
      (snapshot) => {
        const value = snapshot.val()
        if (typeof value === 'number' && isFibonacciValue(value)) {
          votes[participantId] = value
        } else {
          delete votes[participantId]
        }
        callback({ ...votes })
      },
    ),
  )

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
}

export async function submitVote(
  roomCode: string,
  roundId: string,
  participantId: string,
  value: FibonacciValue,
): Promise<void> {
  if (!isFibonacciValue(value)) {
    throw new Error('El valor de voto no es válido')
  }

  await Promise.all([
    set(ref(database, `${privateVotesPath(roomCode, roundId)}/${participantId}`), value),
    set(
      ref(
        database,
        `${roomPath(roomCode)}/participants/${participantId}/hasVoted`,
      ),
      true,
    ),
  ])
}

export async function revealRoom(roomCode: string): Promise<void> {
  await update(ref(database, `${roomPath(roomCode)}/round`), {
    phase: 'revealed',
    revealedAt: Date.now(),
  })
}

export async function resetRoom(
  roomCode: string,
  participantIds: string[],
): Promise<void> {
  const nextRound: RoomRound = {
    id: `round-${Date.now()}`,
    phase: 'voting',
    votes: {},
  }
  const updates: Record<string, boolean | string | object> = {
    round: {
      id: nextRound.id,
      phase: nextRound.phase,
    },
  }

  participantIds.forEach((participantId) => {
    updates[`participants/${participantId}/hasVoted`] = false
  })

  await update(ref(database, roomPath(roomCode)), updates)
}

function validateRoomInput(roomCode: string, identity: RoomIdentity): void {
  if (!isValidRoomCode(roomCode)) {
    throw new Error('El código de sala no es válido')
  }
  if (!isValidParticipantName(identity.name)) {
    throw new Error('El nombre debe tener entre 1 y 24 caracteres')
  }
  if (!isValidAvatar(identity.avatar)) {
    throw new Error('El avatar seleccionado no es válido')
  }
}
