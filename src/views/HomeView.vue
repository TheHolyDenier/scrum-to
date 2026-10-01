<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const roomCode = ref('')

function createRoom() {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase()
  router.push({ name: 'room', params: { roomCode: code } })
}

function joinRoom() {
  const code = roomCode.value.trim().toUpperCase()
  if (code) {
    router.push({ name: 'room', params: { roomCode: code } })
  }
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
    </section>
  </main>
</template>
