<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const roomCode = ref('')
const name = ref('')
const avatar = ref('star')
const error = ref('')

function createRoom() {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase()
  continueToRoom(code, 'create')
}

function joinRoom() {
  const code = roomCode.value.trim().toUpperCase()
  if (code) {
    continueToRoom(code, 'join')
  } else {
    error.value = 'Introduce un código de sala'
  }
}

function continueToRoom(code: string, mode: 'create' | 'join') {
  if (!name.value.trim()) {
    error.value = 'Introduce tu nombre antes de continuar'
    return
  }
  error.value = ''
  sessionStorage.setItem(
    'scrumtro:identity',
    JSON.stringify({ name: name.value, avatar: avatar.value }),
  )
  router.push({ name: 'room', params: { roomCode: code }, query: { mode } })
}
</script>

<template>
  <main class="page-shell home-view">
    <section class="hero-card" aria-labelledby="home-title">
      <p class="eyebrow">Planning poker, con actitud</p>
      <h1 id="home-title">Scrum<span>Tro</span></h1>
      <p class="hero-copy">
        Crea una sala, reparte las cartas y descubre dónde converge tu equipo.
      </p>

      <div class="identity-form">
        <label for="participant-name">Tu nombre</label>
        <input
          id="participant-name"
          v-model="name"
          autocomplete="nickname"
          maxlength="24"
          placeholder="Ada"
        />
        <label for="participant-avatar">Tu avatar</label>
        <select id="participant-avatar" v-model="avatar">
          <option value="star">Estrella</option>
          <option value="sun">Sol</option>
          <option value="moon">Luna</option>
          <option value="bolt">Rayo</option>
        </select>
      </div>

      <div class="hero-actions">
        <button class="primary-button" type="button" @click="createRoom">
          Crear una sala
        </button>

        <form class="join-form" @submit.prevent="joinRoom">
          <label for="room-code">¿Tienes un código?</label>
          <div class="join-controls">
            <input
              id="room-code"
              v-model="roomCode"
              autocomplete="off"
              maxlength="8"
              placeholder="ABC123"
            />
            <button class="secondary-button" type="submit">Unirse</button>
          </div>
        </form>
      </div>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    </section>
  </main>
</template>
