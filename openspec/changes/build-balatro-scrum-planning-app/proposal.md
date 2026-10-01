# Proposal

## Why

Los equipos necesitan una forma rápida y accesible de estimar historias sin instalar software ni crear cuentas. La experiencia debe mantener la claridad de una herramienta de Scrum, pero ser suficientemente divertida y memorable para fomentar la participación; una interfaz original inspirada en la energía visual de Balatro puede diferenciarla sin depender de assets protegidos del juego.

## What Changes

- Crear una aplicación web responsive para sesiones de Planning Poker con Vue 3, Vite y TypeScript.
- Permitir que una persona cree una sala gratuita y que participantes anónimos se unan mediante un código o enlace.
- Permitir elegir un nombre visible y un avatar al entrar en una sala.
- Añadir una fase de votación con valores Fibonacci hasta 13, una fase de revelación sincronizada y controles para limpiar resultados y volver a votar.
- Mostrar media, mediana y moda de los votos una vez revelados, sin exponer resultados antes de tiempo.
- Sincronizar estado de sala, participantes, votos y fases en tiempo real entre navegadores mediante Firebase.
- Diseñar una interfaz moderna, lúdica y accesible, inspirada en cartas y efectos de un juego de póker, usando ilustraciones, iconografía y assets originales o con licencia compatible.
- Mantener el alcance inicial sin cuentas permanentes, pagos, funcionalidades sociales ni dependencia de assets extraídos de Balatro.

## Capabilities

### New Capabilities

- `scrum-rooms`: creación, acceso anónimo, identidad visual de participantes y sincronización del ciclo de vida de una sala de Scrum.
- `scrum-voting`: votación Fibonacci, fases de votación/revelación, reinicio de ronda y estadísticas de resultados.
- `balatro-inspired-ui`: experiencia visual responsive basada en cartas y juego de póker con assets propios o licenciados.

### Modified Capabilities

- Ninguna; el proyecto no tiene especificaciones existentes.

## Impact

- El proyecto actual es un esqueleto Node sin aplicación frontend, por lo que habrá que incorporar la estructura Vue/Vite/TypeScript y sus scripts de desarrollo, build y pruebas.
- Se añadirá una integración de cliente con Firebase Realtime Database (o el servicio equivalente elegido durante el diseño) y configuración segura para separar valores públicos de secretos.
- Se definirán modelos de sala, participante, ronda y voto, además de reglas de acceso y validación para evitar que clientes no autorizados modifiquen salas.
- La interfaz y los componentes necesitarán pruebas unitarias y de interacción, incluyendo transiciones de fase y cálculo de media, mediana y moda.
- El despliegue debe poder realizarse usando niveles gratuitos, con documentación de configuración local y límites operativos explícitos.
