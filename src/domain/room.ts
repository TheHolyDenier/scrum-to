export const fibonacciValues = [1, 2, 3, 5, 8, 13] as const

export type FibonacciValue = (typeof fibonacciValues)[number]
export type RoomPhase = 'voting' | 'revealed'

export interface Participant {
  id: string
  name: string
  avatar: string
  isHost: boolean
}

export interface RoomRound {
  id: string
  phase: RoomPhase
  votes: Record<string, FibonacciValue | undefined>
}

export interface Room {
  code: string
  hostId: string
  participants: Record<string, Participant>
  round: RoomRound
  active: boolean
  expiresAt: number
}

export interface VoteStatistics {
  mean: number | null
  median: number | null
  mode: FibonacciValue | null
  hasUniqueMode: boolean
  submittedCount: number
  missingCount: number
}

const roomCodePattern = /^[A-Z0-9]{4,8}$/

export function isValidRoomCode(value: string): boolean {
  return roomCodePattern.test(value.trim().toUpperCase())
}

export function isValidParticipantName(value: string): boolean {
  const normalized = value.trim()
  return normalized.length >= 1 && normalized.length <= 24
}

export function isValidAvatar(value: string): boolean {
  return value.trim().length >= 1 && value.trim().length <= 32
}

export function isFibonacciValue(value: number): value is FibonacciValue {
  return fibonacciValues.includes(value as FibonacciValue)
}

export function submitVote(
  round: RoomRound,
  participantId: string,
  value: number,
): RoomRound {
  if (round.phase !== 'voting' || !isFibonacciValue(value)) {
    return round
  }

  return {
    ...round,
    votes: { ...round.votes, [participantId]: value },
  }
}

export function revealRound(round: RoomRound, requesterIsHost: boolean): RoomRound {
  if (!requesterIsHost || round.phase !== 'voting') {
    return round
  }

  return { ...round, phase: 'revealed' }
}

export function resetRound(round: RoomRound, requesterIsHost: boolean): RoomRound {
  if (!requesterIsHost || round.phase !== 'revealed') {
    return round
  }

  return {
    id: `${round.id}-next`,
    phase: 'voting',
    votes: {},
  }
}

export function calculateVoteStatistics(
  round: RoomRound,
  participantCount: number,
): VoteStatistics {
  const values = Object.values(round.votes)
    .filter((value): value is FibonacciValue => value !== undefined)
    .sort((a, b) => a - b)
  const frequencies = new Map<FibonacciValue, number>()

  values.forEach((value) => {
    frequencies.set(value, (frequencies.get(value) ?? 0) + 1)
  })

  const maxFrequency = Math.max(0, ...frequencies.values())
  const modes = [...frequencies.entries()]
    .filter(([, frequency]) => frequency === maxFrequency)
    .map(([value]) => value)

  const middle = Math.floor(values.length / 2)
  const median =
    values.length === 0
      ? null
      : values.length % 2 === 0
        ? (values[middle - 1] + values[middle]) / 2
        : values[middle]

  return {
    mean:
      values.length === 0
        ? null
        : values.reduce((sum, value) => sum + value, 0) / values.length,
    median,
    mode: modes.length === 1 && maxFrequency > 1 ? modes[0] : null,
    hasUniqueMode: modes.length === 1 && maxFrequency > 1,
    submittedCount: values.length,
    missingCount: Math.max(0, participantCount - values.length),
  }
}
