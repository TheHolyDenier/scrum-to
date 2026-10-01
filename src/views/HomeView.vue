<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAvatarColor } from '../lib/avatar'
import { getStoredIdentity, saveStoredIdentity } from '../lib/identity'

const router = useRouter()
const roomCode = ref('')
const storedIdentity = getStoredIdentity()
const name = ref(storedIdentity.name)
const avatar = ref(getAvatarColor(storedIdentity.avatar))
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
  saveStoredIdentity({ name: name.value.trim(), avatar: avatar.value })
  router.push({ name: 'room', params: { roomCode: code }, query: { mode } })
}
</script>

<template>
  <main class="home">
    <section class="home__card" aria-labelledby="home-title">
      <header class="home__header">
        <div class="home__brand" aria-hidden="true">
          <span class="home__brand-suit">♠</span>
          <span>♣</span>
          <span>♥</span>
          <span class="home__brand-suit">♦</span>
        </div>
        <p class="home__eyebrow">Planning poker · edición de mesa</p>
        <h1 id="home-title" class="home__title">
          Scrum<span class="home__title-accent">Tro</span>
        </h1>
        <p class="home__copy">
          Crea una sala, reparte las cartas y descubre dónde converge tu equipo.
        </p>
      </header>

      <div class="home__content">
        <section class="home__identity" aria-label="Identidad del participante">
          <div class="home__identity-row">
            <label class="home__chip-picker" title="Elegir color de ficha">
              <span
                class="home__chip-preview"
                :style="{ backgroundColor: getAvatarColor(avatar) }"
                aria-hidden="true"
              >
                ✦
              </span>
              <input
                id="participant-avatar"
                v-model="avatar"
                type="color"
                aria-label="Color de tu ficha"
              />
            </label>
            <label class="visually-hidden" for="participant-name">Tu nombre</label>
            <input
              id="participant-name"
              v-model="name"
              class="home__name-field"
              autocomplete="name"
              maxlength="24"
              placeholder="tu nombre"
            />
          </div>
        </section>

        <div class="home__actions" aria-label="Acciones de sala">
          <section
            class="home__action home__action--create"
            aria-labelledby="create-title"
          >
            <p class="home__action-kicker">Nueva mesa</p>
            <h2 id="create-title" class="home__action-title">Crear una sala</h2>
            <p class="home__action-copy">
              Genera un código y comparte el enlace con tu equipo.
            </p>
            <button class="button button--primary" type="button" @click="createRoom">
              Crear una sala
            </button>
          </section>

          <section class="home__action home__action--join" aria-labelledby="join-title">
            <p class="home__action-kicker">Mesa existente</p>
            <h2 id="join-title" class="home__action-title">Unirse a una sala</h2>
            <form class="home__join" @submit.prevent="joinRoom">
              <label class="home__label" for="room-code">Código de sala</label>
              <div class="home__join-controls">
                <input
                  id="room-code"
                  v-model="roomCode"
                  class="home__field"
                  autocomplete="off"
                  maxlength="8"
                  placeholder="ABC123"
                />
                <button class="button button--secondary" type="submit">Unirse</button>
              </div>
            </form>
          </section>
        </div>
        <p v-if="error" class="home__error" role="alert">{{ error }}</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  display: grid;
  width: min(100%, 1100px);
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 1rem;
  place-items: center;
}

.home__card {
  position: relative;
  isolation: isolate;
  width: min(100%, 720px);
  max-height: calc(100dvh - 2rem);
  overflow: hidden;
  padding: 2rem 1.25rem;
  border: 3px solid var(--color-ink);
  border-radius: 1.5rem;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.06) 25%, transparent 25%) 0 0 / 1rem
      1rem,
    var(--color-felt);
  box-shadow:
    0 0 0 5px var(--color-yellow),
    0 1rem 0 var(--color-ink);
  text-align: center;
}

.home__header {
  min-width: 0;
}

.home__content {
  min-width: 0;
}

.home__card::before,
.home__card::after {
  position: absolute;
  z-index: -1;
  color: rgba(255, 248, 223, 0.08);
  font-family: Georgia, serif;
  font-size: 13rem;
  line-height: 0.7;
}

.home__card::before {
  top: -1rem;
  left: -1rem;
  content: '♠';
}

.home__card::after {
  right: -1rem;
  bottom: -1rem;
  content: '♦';
}

.home__brand {
  display: flex;
  justify-content: center;
  gap: 0.7rem;
  margin-bottom: 1.25rem;
  color: var(--color-red);
  font-family: Georgia, serif;
  font-size: 1.8rem;
  text-shadow: 2px 2px 0 var(--color-ink);
}

.home__brand-suit {
  color: var(--color-cream);
}

.home__eyebrow {
  margin: 0 0 0.75rem;
  color: var(--color-yellow);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.home__title {
  margin: 0 0 1rem;
  color: var(--color-cream);
  font-family: Georgia, serif;
  font-size: clamp(3.5rem, 17vw, 7rem);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.08em;
  text-shadow: 4px 4px 0 var(--color-ink);
}

.home__title-accent {
  color: var(--color-yellow);
}

.home__copy {
  margin: 0;
  color: var(--color-cream);
  line-height: 1.6;
}

.home__identity {
  margin-top: 1.5rem;
  text-align: center;
}

.home__section-title,
.home__action-title {
  margin: 0;
  color: var(--color-cream);
  font-family: Georgia, serif;
  font-size: clamp(1.6rem, 7vw, 2.4rem);
  line-height: 1;
}

.home__section-copy,
.home__action-copy {
  margin: 0.55rem 0 0;
  color: rgba(255, 248, 223, 0.72);
  font-size: 0.9rem;
  line-height: 1.45;
}

.home__identity-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 1rem;
}

.home__chip-picker {
  position: relative;
  display: grid;
  flex: 0 0 auto;
  width: 3.4rem;
  height: 3.4rem;
  place-items: center;
  border-radius: 50%;
  cursor: pointer;
}

.home__chip-preview {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  border: 0.35rem dashed var(--color-cream);
  border-radius: 50%;
  color: var(--color-cream);
  box-shadow:
    0 0 0 0.2rem var(--color-ink),
    inset 0 0 0 0.15rem rgba(0, 0, 0, 0.3);
  font-size: 1.2rem;
  font-weight: 900;
}

.home__chip-picker input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  opacity: 0;
}

.home__name-field {
  width: min(100%, 15rem);
  color: var(--color-cream);
  background: rgba(0, 0, 0, 0.25);
  text-align: center;
}

.home__label {
  color: var(--color-cream);
  font-size: 0.9rem;
}

.home__actions {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
  text-align: left;
}

.home__action {
  display: grid;
  gap: 0.6rem;
  padding: 1.25rem;
  border: 2px solid rgba(255, 248, 223, 0.25);
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.08);
}

.home__action--create {
  border-color: rgba(245, 196, 81, 0.55);
}

.home__action--join {
  border-color: rgba(46, 134, 171, 0.65);
}

.home__action-kicker {
  margin: 0;
  color: var(--color-yellow);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.home__join {
  display: grid;
  gap: 0.6rem;
  text-align: left;
}

.home__join-controls {
  display: flex;
  gap: 0.6rem;
}

.home__field {
  width: 100%;
}

.home__join-controls .home__field {
  flex: 1;
}

.home__error {
  margin: 1rem 0 0;
  color: #ffb1a8;
}

@media (max-width: 600px) {
  .home {
    padding: 1rem;
  }

  .home__card {
    max-height: none;
    padding: 1.75rem 1rem;
  }
}

@media (min-width: 700px) {
  .home {
    padding: 3rem 2rem;
  }

  .home__card {
    padding: 4rem;
  }

  .home__actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
  }

  .home__action {
    padding: 1.5rem;
  }
}
</style>
