import { describe, expect, it } from 'vitest'
import {
  calculateVoteStatistics,
  isFibonacciValue,
  isValidAvatar,
  isValidParticipantName,
  isValidRoomCode,
  revealRound,
  resetRound,
  submitVote,
  type RoomRound,
} from './room'

const votingRound: RoomRound = {
  id: 'round-1',
  phase: 'voting',
  votes: {},
}

describe('room validation', () => {
  it('validates room identities and Fibonacci values', () => {
    expect(isValidRoomCode('ABC123')).toBe(true)
    expect(isValidRoomCode('bad code')).toBe(false)
    expect(isValidParticipantName('Ada')).toBe(true)
    expect(isValidParticipantName('')).toBe(false)
    expect(isValidAvatar('robot')).toBe(true)
    expect(isValidAvatar('')).toBe(false)
    expect(isFibonacciValue(0.5)).toBe(true)
    expect(isFibonacciValue(13)).toBe(true)
    expect(isFibonacciValue(4)).toBe(false)
  })
})

describe('round transitions', () => {
  it('accepts and replaces a vote only during voting', () => {
    const voted = submitVote(votingRound, 'p1', 5)
    expect(voted.votes.p1).toBe(5)
    expect(submitVote(voted, 'p1', 8).votes.p1).toBe(8)
    expect(submitVote(voted, 'p2', 4)).toEqual(voted)
    expect(submitVote({ ...voted, phase: 'revealed' }, 'p1', 8)).toEqual({
      ...voted,
      phase: 'revealed',
    })
  })

  it('allows only the host to reveal and reset', () => {
    const revealed = revealRound(submitVote(votingRound, 'p1', 5), true)
    expect(revealed.phase).toBe('revealed')
    expect(revealRound(votingRound, false)).toEqual(votingRound)
    expect(resetRound(revealed, false)).toEqual(revealed)
    expect(resetRound(revealed, true)).toEqual({
      id: 'round-1-next',
      phase: 'voting',
      votes: {},
    })
  })
})

describe('vote statistics', () => {
  it('calculates mean, median, mode, and missing votes', () => {
    const round = {
      ...votingRound,
      votes: { p1: 3, p2: 5, p3: 5, p4: 8 },
    } satisfies RoomRound

    expect(calculateVoteStatistics(round, 5)).toEqual({
      mean: 5.25,
      median: 5,
      mode: 5,
      hasUniqueMode: true,
      submittedCount: 4,
      missingCount: 1,
    })
  })

  it('handles ties and empty rounds without inventing a mode', () => {
    const tied = {
      ...votingRound,
      votes: { p1: 3, p2: 5 },
    } satisfies RoomRound

    expect(calculateVoteStatistics(tied, 2).mode).toBeNull()
    expect(calculateVoteStatistics(votingRound, 2)).toEqual({
      mean: null,
      median: null,
      mode: null,
      hasUniqueMode: false,
      submittedCount: 0,
      missingCount: 2,
    })
  })
})
