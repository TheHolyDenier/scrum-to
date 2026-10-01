# Design

## Context

El repositorio es actualmente un esqueleto Node con `index.js` y sin frontend, tests ni backend. La propuesta introduce una aplicación interactiva multiusuario, un modelo de datos compartido y una superficie visual nueva; por tanto, la arquitectura debe separar estado remoto, lógica pura de votación y componentes de presentación. Véase `proposal.md` para la motivación y `specs/` para el contrato observable.

## Goals / Non-Goals

**Goals:**

- Crear una SPA mantenible con Vue 3, Vite y TypeScript.
- Mantener una única fuente de verdad remota para salas, participantes, fases y votos.
- Hacer que las transiciones de votación y los cálculos estadísticos sean deterministas y fáciles de probar sin red.
- Permitir despliegue gratuito y configuración local reproducible.
- Mantener una identidad visual original, accesible, responsive y respetuosa con licencias.

**Non-Goals:**

- Cuentas permanentes, perfiles, historial de sesiones o persistencia de identidad entre salas.
- Integración con la API de Balatro o redistribución de sus recursos.
- Chat, backlog de historias, Jira/GitHub integrations, pagos o funciones avanzadas de moderación.
- Garantía de disponibilidad empresarial o escalado ilimitado dentro del nivel gratuito.

## Decisions

### Frontend y estructura de aplicación

Se usará Vue 3 + Vite + TypeScript en lugar de Nuxt. El producto inicial es una SPA sin necesidad de SSR, rutas server-side ni generación de contenido; Vite reduce la superficie de configuración y el coste operativo. La estructura separará páginas o vistas de sala, componentes de cartas/participantes, composables de sesión y módulos de dominio puros.

Se añadirá un router únicamente si las pantallas de entrada y sala lo justifican; el enlace de invitación debe poder resolver el código de sala desde la URL sin exigir una cuenta.

### Sincronización y persistencia

Se usará Firebase Realtime Database para sincronizar cambios pequeños y frecuentes con baja complejidad de suscripción. Firestore es una alternativa válida, pero el modelo de una sala efímera con estado anidado y listeners por sala encaja mejor con un árbol realtime.

El nodo de una sala contendrá metadatos de ciclo de vida, host, participantes y ronda activa. Los votos se almacenarán asociados al identificador anónimo de participante; la UI no recibirá valores individuales como valores visibles hasta que la fase sea `revealed`, o bien el cliente derivará una vista oculta de los datos. Las reglas de Firebase validarán formato, pertenencia a sala y acciones de host; no se confiará únicamente en guards del cliente.

### Identidad anónima y ciclo de vida

La entrada usará autenticación anónima de Firebase o un identificador de sesión equivalente, junto con un perfil de sala que contiene nombre y avatar permitidos. El nombre y avatar serán datos de presentación, no credenciales. Las salas tendrán un estado activo y una política de expiración/limpieza para evitar acumulación indefinida en el nivel gratuito.

El host será una propiedad del participante autenticado. La primera versión puede marcar al host como ausente si desconecta y documentar la recuperación manual; no se añadirá una transferencia automática compleja salvo que las pruebas de uso lo hagan necesaria.

### Máquina de estados de la ronda

La ronda tendrá al menos los estados `voting` y `revealed`, con una transición de reinicio que crea una identidad de ronda nueva y elimina los votos anteriores. Las transiciones se centralizarán en funciones de dominio para impedir que una acción de UI produzca combinaciones inválidas.

Los valores válidos serán `[1, 2, 3, 5, 8, 13]`. Media, mediana y moda se calcularán sobre la lista de votos válidos de la ronda revelada; los participantes sin voto no entran en el cálculo. La moda será única solo si una frecuencia es estrictamente mayor que las demás; en caso contrario se mostrará que no hay una moda única.

### Visualización y assets

Las cartas de votación serán componentes propios con tokens de diseño para colores, sombras, tipografía y estados. Se crearán recursos originales o se seleccionarán recursos con licencia compatible, registrando su procedencia. Los efectos de brillo, inclinación y transición serán progresivos: la información de fase, foco, error y estadísticas tendrá prioridad visual. Se respetará `prefers-reduced-motion`.

### Pruebas y validación

La lógica de dominio tendrá tests unitarios para transiciones, validación de votos y estadísticas. Los componentes nuevos tendrán tests de interacción para selección, privacidad previa a revelar, revelación, reset y estados de error. Se añadirán pruebas de integración con un adaptador de Firebase simulado o emulador para verificar sincronización y reglas sin depender del proyecto remoto de producción.

## Risks / Trade-offs

- [El nivel gratuito de Firebase tiene límites y puede acumular salas] → Usar salas efímeras con expiración, limitar tamaños de nombre/avatar y documentar cuotas; medir lecturas/escrituras en pruebas.
- [Un cliente malicioso puede intentar modificar datos directamente] → Definir reglas de Firebase con validación de identidad, pertenencia, fase y host; probar denegaciones con el emulador.
- [La privacidad previa a revelar puede filtrarse por el modelo de datos] → Separar datos privados de votos y vistas públicas, y verificar que los listeners y reglas no expongan valores antes de la revelación.
- [La inspiración visual puede derivar en infracción de propiedad intelectual] → Prohibir assets extraídos, logos y personajes; mantener un inventario de licencias y una dirección artística propia.
- [Desconexiones simultáneas pueden dejar un host ausente] → Mostrar el estado de conexión, conservar la sala durante una ventana de recuperación y documentar la limitación de la primera versión.
- [Animaciones y contraste pueden perjudicar accesibilidad o rendimiento] → Usar CSS optimizado, estados de foco explícitos, contraste verificable y reducción de movimiento.

## Migration Plan

1. Sustituir el esqueleto Node por el proyecto Vue/Vite/TypeScript y añadir scripts de desarrollo, build y test.
2. Implementar primero el dominio local y sus pruebas; después integrar el adaptador Firebase y las reglas del emulador.
3. Configurar variables públicas de Firebase mediante `.env.example`, sin incluir credenciales privadas en el repositorio.
4. Desplegar el frontend en un hosting gratuito compatible y ejecutar una sesión de validación con varios navegadores.
5. Si el despliegue falla, volver al build anterior estático; los datos de salas efímeras no requieren migración entre versiones.

## Open Questions

- Confirmar durante la implementación el proveedor de hosting gratuito concreto y la política exacta de expiración de salas, sin cambiar el contrato de la sala ni el flujo de votación.
