<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { fibonacciValues } from '../domain/room'

const route = useRoute()
const roomCode = computed(() => String(route.params.roomCode))
</script>

<template>
  <main class="page-shell room-view">
    <header class="room-header">
      <div>
        <p class="eyebrow">Sala activa</p>
        <h1>{{ roomCode }}</h1>
      </div>
      <span class="phase-badge">Votación</span>
    </header>

    <section class="room-panel" aria-labelledby="room-title">
      <p class="eyebrow">Próximamente</p>
      <h2 id="room-title">Prepara tus cartas</h2>
      <p>La sala ya tiene ruta propia. Aquí vivirá la mesa de votación sincronizada.</p>
      <div class="card-row" aria-label="Valores Fibonacci disponibles">
        <span v-for="value in fibonacciValues" :key="value" class="playing-card">
          {{ value }}
        </span>
      </div>
    </section>
  </main>
</template>
