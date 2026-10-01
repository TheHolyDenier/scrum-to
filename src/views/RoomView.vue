<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { fibonacciValues } from '../domain/room'
import { useRoomSession } from '../composables/useRoomSession'

const route = useRoute()
const roomCode = computed(() => String(route.params.roomCode))
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
</script>

<template>
  <main class="page-shell room-view">
    <p v-if="loading" class="status-message" role="status">Abriendo sala...</p>
    <p v-else-if="error && !room" class="status-message form-error" role="alert">
      {{ error }}
    </p>

    <template v-else-if="room">
      <header class="room-header">
        <div>
          <p class="eyebrow">Sala activa</p>
          <h1>{{ roomCode }}</h1>
        </div>
        <span class="phase-badge">
          {{ room.round.phase === 'voting' ? 'Votación' : 'Revelado' }}
        </span>
      </header>

      <p v-if="error" class="form-error" role="alert">{{ error }}</p>

      <section class="room-layout">
        <aside class="participants-panel room-panel" aria-labelledby="participants-title">
          <p class="eyebrow">Mesa</p>
          <h2 id="participants-title">Participantes</h2>
          <ul class="participant-list">
            <li v-for="participant in room.participants" :key="participant.id">
              <span class="avatar">{{ participant.avatar.slice(0, 1).toUpperCase() }}</span>
              <span>
                <strong>{{ participant.name }}</strong>
                <small v-if="participant.id === currentParticipant?.id">Tú</small>
              </span>
              <span
                class="vote-status"
                :class="{ voted: participant.hasVoted }"
                :aria-label="participant.hasVoted ? 'Ha votado' : 'No ha votado'"
              >
                {{ participant.hasVoted ? '✓' : '·' }}
              </span>
            </li>
          </ul>
        </aside>

        <section class="room-panel voting-panel" aria-labelledby="round-title">
          <p class="eyebrow">Ronda {{ room.round.id }}</p>
          <h2 id="round-title">
            {{ room.round.phase === 'voting' ? 'Elige tu carta' : 'Resultados' }}
          </h2>

          <div v-if="room.round.phase === 'voting'" class="card-row" aria-label="Valores Fibonacci">
            <button
              v-for="value in fibonacciValues"
              :key="value"
              class="playing-card"
              :class="{ selected: selectedVote === value }"
              type="button"
              :aria-pressed="selectedVote === value"
              @click="vote(value)"
            >
              {{ value }}
            </button>
          </div>

          <div v-else class="revealed-results">
            <div class="card-row" aria-label="Votos revelados">
              <span
                v-for="(value, participantId) in votes"
                :key="participantId"
                class="playing-card"
              >
                {{ value }}
              </span>
            </div>
            <dl v-if="statistics" class="statistics-grid">
              <div><dt>Media</dt><dd>{{ statistics.mean ?? '—' }}</dd></div>
              <div><dt>Mediana</dt><dd>{{ statistics.median ?? '—' }}</dd></div>
              <div><dt>Moda</dt><dd>{{ statistics.mode ?? 'Sin moda única' }}</dd></div>
            </dl>
            <p v-if="statistics" class="missing-votes">
              {{ statistics.submittedCount }} votos · {{ statistics.missingCount }} sin votar
            </p>
          </div>

          <div class="room-actions">
            <button v-if="isHost && room.round.phase === 'voting'" class="primary-button" type="button" @click="reveal">
              Revelar cartas
            </button>
            <button v-if="isHost && room.round.phase === 'revealed'" class="primary-button" type="button" @click="reset">
              Nueva ronda
            </button>
          </div>
        </section>
      </section>
    </template>
  </main>
</template>
