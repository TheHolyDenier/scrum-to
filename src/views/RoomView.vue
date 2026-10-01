<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { fibonacciValues } from '../domain/room'
import { useRoomSession } from '../composables/useRoomSession'
import { getAvatarColor } from '../lib/avatar'

const route = useRoute()
const roomCode = computed(() => String(route.params.roomCode))
const cardSuits = fibonacciValues.map(createRandomCardSuit)
const {
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
} = useRoomSession()

function createRandomCardSuit(): CardSuit {
  const suits = [
    { symbol: '♠', color: 'black' },
    { symbol: '♣', color: 'black' },
    { symbol: '♥', color: 'red' },
    { symbol: '♦', color: 'red' },
  ] as const

  return suits[Math.floor(Math.random() * suits.length)]
}

function getParticipantCardSuit(participantId: string): CardSuit {
  const hash = [...participantId].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  )
  const suits = [
    { symbol: '♠', color: 'black' },
    { symbol: '♣', color: 'black' },
    { symbol: '♥', color: 'red' },
    { symbol: '♦', color: 'red' },
  ] as const

  return suits[hash % suits.length]
}

type CardSuit = {
  symbol: string
  color: 'black' | 'red'
}
</script>

<template>
  <main class="room">
    <div class="room__felt">
      <p v-if="loading" class="room__status" role="status">Abriendo sala...</p>
      <p v-else-if="error && !room" class="room__status room__status--error" role="alert">
        {{ error }}
      </p>

      <template v-else-if="room">
        <header class="room__header">
          <div class="room__heading">
            <p class="room__eyebrow">Sala activa</p>
            <h1 id="room-title" class="room__title">{{ roomCode }}</h1>
          </div>
          <span class="room__phase">
            {{ room.round.phase === 'voting' ? 'Votación' : 'Revelado' }}
          </span>
        </header>

        <p v-if="error" class="room__error" role="alert">{{ error }}</p>

        <section class="room__layout">
          <aside
            class="room__panel room__panel--participants"
            aria-labelledby="participants-title"
          >
            <p class="room__eyebrow">Mesa</p>
            <h2 id="participants-title" class="room__section-title">Participantes</h2>
            <ul class="room__participants">
              <li
                v-for="participant in room.participants"
                :key="participant.id"
                class="room__participant"
              >
                <span
                  class="room__avatar"
                  :style="{ backgroundColor: getAvatarColor(participant.avatar) }"
                  aria-hidden="true"
                >
                  ✦
                </span>
                <span>
                  <strong>{{ participant.name }}</strong>
                  <small
                    v-if="participant.id === currentParticipant?.id"
                    class="room__self"
                    >Tú</small
                  >
                </span>
                <span
                  class="room__vote-status"
                  :class="{ 'room__vote-status--voted': participant.hasVoted }"
                  :aria-label="participant.hasVoted ? 'Ha votado' : 'No ha votado'"
                >
                  {{ participant.hasVoted ? '✓' : '·' }}
                </span>
              </li>
            </ul>
          </aside>

          <section class="room__panel room__panel--voting" aria-labelledby="round-title">
            <p class="room__eyebrow">Ronda {{ room.round.id }}</p>
            <h2 id="round-title" class="room__section-title">
              {{ room.round.phase === 'voting' ? 'Elige tu carta' : 'Resultados' }}
            </h2>

            <div
              v-if="room.round.phase === 'voting'"
              class="room__cards"
              aria-label="Valores Fibonacci"
            >
              <button
                v-for="(value, index) in fibonacciValues"
                :key="value"
                class="room__card"
                :class="{ 'room__card--selected': selectedVote === value }"
                type="button"
                :aria-pressed="selectedVote === value"
                @click="vote(value)"
              >
                <span
                  class="room__card-suit"
                  :class="`room__card-suit--${cardSuits[index].color}`"
                  aria-hidden="true"
                >
                  {{ cardSuits[index].symbol }}
                </span>
                <span class="room__card-value">{{ value }}</span>
              </button>
            </div>

            <div v-else class="room__results">
              <div class="room__revealed-votes" aria-label="Votos revelados">
                <span
                  v-for="participant in room.participants"
                  :key="participant.id"
                  class="room__revealed-vote"
                >
                  <span class="room__revealed-name">{{ participant.name }}</span>
                  <span
                    class="room__card room__card--result"
                    :class="`room__card--${getParticipantCardSuit(participant.id).color}`"
                  >
                    <span
                      class="room__card-suit"
                      :class="`room__card-suit--${getParticipantCardSuit(participant.id).color}`"
                      aria-hidden="true"
                    >
                      {{ getParticipantCardSuit(participant.id).symbol }}
                    </span>
                    <span class="room__card-value">{{
                      votes[participant.id] ?? '—'
                    }}</span>
                  </span>
                </span>
              </div>
              <dl v-if="statistics" class="room__statistics">
                <div>
                  <dt>Media</dt>
                  <dd>{{ statistics.mean ?? '—' }}</dd>
                </div>
                <div>
                  <dt>Mediana</dt>
                  <dd>{{ statistics.median ?? '—' }}</dd>
                </div>
                <div>
                  <dt>Moda</dt>
                  <dd>{{ statistics.mode ?? 'Sin moda única' }}</dd>
                </div>
              </dl>
              <p v-if="statistics" class="room__missing-votes">
                {{ statistics.submittedCount }} votos · {{ statistics.missingCount }} sin
                votar
              </p>
            </div>

            <div class="room__actions">
              <button
                v-if="isHost && room.round.phase === 'voting'"
                class="button button--primary"
                type="button"
                @click="reveal"
              >
                Revelar cartas
              </button>
              <button
                v-if="isHost && room.round.phase === 'revealed'"
                class="button button--primary"
                type="button"
                @click="reset"
              >
                Nueva ronda
              </button>
            </div>
          </section>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
.room {
  width: min(100%, 1200px);
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 1rem;
}

.room__felt {
  min-height: calc(100vh - 2rem);
  min-height: calc(100dvh - 2rem);
  padding: 1rem;
  border: 3px solid var(--color-ink);
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.09), transparent 18rem),
    linear-gradient(135deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%) 0 0 / 1rem
      1rem,
    var(--color-felt);
  box-shadow:
    0 0 0 5px var(--color-yellow),
    0 1rem 0 var(--color-ink);
}

.room__status {
  padding: 2rem;
  text-align: center;
}

.room__status--error,
.room__error {
  color: #ffb1a8;
}

.room__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
}

.room__eyebrow {
  margin: 0 0 0.75rem;
  color: var(--color-yellow);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.room__title {
  margin: 0;
  font-family: Georgia, serif;
  font-size: clamp(2.5rem, 8vw, 5rem);
  letter-spacing: -0.06em;
  text-shadow: 3px 3px 0 var(--color-ink);
}

.room__phase {
  border: 2px solid var(--color-ink);
  border-radius: 0.5rem;
  padding: 0.65rem 1rem;
  color: var(--color-ink);
  background: var(--color-yellow);
  font-weight: 800;
  text-transform: uppercase;
}

.room__error {
  margin: 1rem 0;
}

.room__layout {
  display: grid;
  grid-template-columns: minmax(13rem, 0.7fr) minmax(0, 1.8fr);
  gap: 1rem;
}

.room__panel {
  padding: 1.25rem;
  border: 2px solid rgba(255, 248, 223, 0.35);
  border-radius: 1rem;
  background: rgba(11, 42, 36, 0.8);
  box-shadow: 0 0.5rem 0 rgba(0, 0, 0, 0.25);
}

.room__section-title {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 5vw, 3.5rem);
}

.room__panel--participants .room__section-title {
  font-size: 1.8rem;
}

.room__participants {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.room__participant {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--color-cream);
}

.room__self {
  display: block;
  color: var(--color-yellow);
}

.room__avatar {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 0.25rem dashed var(--color-cream);
  border-radius: 50%;
  color: var(--color-cream);
  box-shadow:
    0 0 0 0.15rem var(--color-ink),
    inset 0 0 0 0.1rem rgba(0, 0, 0, 0.3);
  font-size: 0.75rem;
  font-weight: 900;
}

.room__vote-status {
  margin-left: auto;
  color: rgba(255, 248, 223, 0.45);
  font-size: 1.4rem;
}

.room__vote-status--voted {
  color: #8be3b0;
}

.room__panel--voting {
  min-width: 0;
}

.room__cards {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 2rem;
}

.room__card {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 8rem;
  aspect-ratio: 3 / 4;
  place-items: center;
  overflow: hidden;
  border: 3px solid var(--color-ink);
  border-radius: 0.7rem;
  color: var(--color-ink);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.55), transparent 40%),
    var(--color-paper);
  box-shadow: 0.35rem 0.35rem 0 var(--color-ink);
  font-family: Georgia, serif;
  font-size: 2rem;
  font-weight: 900;
  transform: rotate(-2deg);
  animation: room-card-deal 480ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.room__card-suit {
  position: absolute;
  top: 0.45rem;
  left: 0.55rem;
  font-family: Georgia, serif;
  font-size: 1.25rem;
  line-height: 1;
}

.room__card-suit--red {
  color: var(--color-red);
}

.room__card-suit--black {
  color: var(--color-ink);
}

.room__card-value {
  position: relative;
  z-index: 1;
}

.room__card:nth-child(even) {
  transform: rotate(2deg) translateY(0.6rem);
  animation-delay: 70ms;
}

.room__card:nth-child(3) {
  animation-delay: 140ms;
}

.room__card:nth-child(4) {
  animation-delay: 210ms;
}

.room__card:nth-child(5) {
  animation-delay: 280ms;
}

.room__card:nth-child(6) {
  animation-delay: 350ms;
}

.room__card:nth-child(7) {
  animation-delay: 420ms;
}

.room__card:not(.room__card--result):hover {
  transform: translateY(-0.45rem) rotate(-2deg) scale(1.03);
}

.room__card--selected {
  border-color: var(--color-red);
  box-shadow:
    0 0 0 0.25rem rgba(232, 72, 85, 0.3),
    0.35rem 0.35rem 0 var(--color-ink);
  transform: translateY(-0.5rem) rotate(-2deg) scale(1.03);
}

.room__card--result {
  width: min(100%, 5.5rem);
  min-height: 7rem;
  justify-self: center;
  cursor: default;
  animation: room-card-reveal 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.room__card--result::before {
  content: '♥';
}

.room__card--result::after {
  content: '♣';
}

@keyframes room-card-deal {
  from {
    opacity: 0;
    transform: translateY(1rem) rotate(0) scale(0.85);
  }

  to {
    opacity: 1;
  }
}

@keyframes room-card-reveal {
  from {
    opacity: 0;
    transform: perspective(24rem) rotateY(90deg) translateY(0.5rem);
  }

  to {
    opacity: 1;
    transform: perspective(24rem) rotateY(0) translateY(0);
  }
}

.room__revealed-votes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.room__revealed-vote {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
}

.room__revealed-name {
  max-width: 100%;
  overflow: hidden;
  color: var(--color-cream);
  font-size: 0.9rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room__statistics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin: 2rem 0 0;
}

.room__statistics div {
  padding: 1rem;
  border: 1px solid rgba(255, 248, 223, 0.2);
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.2);
  text-align: center;
}

.room__statistics dt {
  color: var(--color-yellow);
  font-size: 0.8rem;
  text-transform: uppercase;
}

.room__statistics dd {
  margin: 0.35rem 0 0;
  font-size: 1.3rem;
  font-weight: 800;
}

.room__missing-votes {
  margin: 1rem 0 0;
  color: rgba(255, 248, 223, 0.7);
  text-align: center;
}

.room__actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 600px) {
  .room {
    padding: 0.75rem;
  }

  .room__felt {
    min-height: calc(100vh - 1.5rem);
    padding: 0.75rem;
  }

  .room__header {
    align-items: stretch;
    flex-direction: column;
  }

  .room__layout {
    grid-template-columns: 1fr;
  }

  .room__cards,
  .room__revealed-votes {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .room__card {
    min-height: 5.25rem;
  }

  .room__card--result {
    min-height: 6.5rem;
  }

  .room__panel {
    padding: 1rem;
  }

  .room__statistics {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 700px) {
  .room {
    padding: 2rem;
  }

  .room__felt {
    padding: 2rem;
  }

  .room__panel {
    padding: 2rem;
  }
}
</style>
