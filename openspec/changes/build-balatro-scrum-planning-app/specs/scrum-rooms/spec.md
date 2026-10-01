# Spec Delta

## Purpose

Esta capacidad permite crear sesiones de Planning Poker accesibles desde el navegador, con participantes anónimos identificados por un nombre y un avatar. Mantiene el estado de cada sala sincronizado para que todos los navegadores vean la misma sesión.

## ADDED Requirements

### Requirement: Users can create a scrum room
El sistema SHALL permitir a un usuario crear una sala y SHALL devolver un código suficientemente único para compartirla.

#### Scenario: Room creation succeeds
- **WHEN** a user submits a valid room creation request
- **THEN** the system creates an active room with a unique code and assigns the creator as host

#### Scenario: Room code collision is avoided
- **WHEN** a generated room code already identifies an active room
- **THEN** the system generates or selects another code before completing creation

### Requirement: Users can join a room anonymously
El sistema SHALL permitir unirse a una sala activa mediante su código o enlace sin crear una cuenta permanente.

#### Scenario: Participant joins with valid identity
- **WHEN** a user provides a valid room code, a non-empty display name, and an allowed avatar
- **THEN** the user joins the room and becomes visible to all current participants

#### Scenario: Invalid room cannot be joined
- **WHEN** a user provides an unknown, expired, or inactive room code
- **THEN** the system rejects the join and explains that the room is unavailable

#### Scenario: Invalid identity is rejected
- **WHEN** a user submits an empty, oversized, or otherwise invalid display name or avatar
- **THEN** the system rejects the join without adding a malformed participant

### Requirement: The host can manage room lifecycle
El sistema SHALL identify al host de la sala y SHALL permitirle comenzar una ronda, revelar resultados y limpiar la ronda actual.

#### Scenario: Host action is accepted
- **WHEN** the current host requests a permitted lifecycle transition
- **THEN** the room state changes and all connected participants receive the updated state

#### Scenario: Non-host action is rejected
- **WHEN** a participant without host privileges requests a host-only lifecycle transition
- **THEN** the system rejects the request and preserves the current room state

### Requirement: Room state is synchronized
El sistema SHALL propagate cambios de sala, participantes, ronda y fase a todos los navegadores conectados sin requerir una recarga manual.

#### Scenario: Participant sees a new member
- **WHEN** a participant joins an active room
- **THEN** every connected browser updates its participant list to include the new member

#### Scenario: Reconnecting participant receives current state
- **WHEN** a participant reconnects to an active room
- **THEN** the client displays the latest room, phase, participant, and round state rather than stale local state

### Requirement: Room access is constrained
El sistema SHALL restrict room mutations to valid room participants and SHALL validate host-only mutations server-side or through equivalent authoritative data rules.

#### Scenario: Unknown client attempts a mutation
- **WHEN** a client that is not an active participant attempts to change room state
- **THEN** the mutation is rejected and no participant-visible state is changed

#### Scenario: Participant session expires
- **WHEN** a participant disconnects or its anonymous session becomes invalid
- **THEN** the room stops treating that session as authorized for future mutations
