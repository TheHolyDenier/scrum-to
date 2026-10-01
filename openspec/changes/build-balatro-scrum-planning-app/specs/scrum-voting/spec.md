# Spec Delta

## Purpose

Esta capacidad define el ciclo de estimación: selección privada de una carta Fibonacci, revelación coordinada y análisis de los votos. Permite repetir rondas sin perder la claridad sobre el estado actual.

## ADDED Requirements

### Requirement: Participants can submit Fibonacci votes
El sistema SHALL ofrecer los valores Fibonacci 0.5, 1, 2, 3, 5, 8 y 13, y SHALL aceptar como máximo un voto activo por participante y ronda.

#### Scenario: Participant submits a valid vote
- **WHEN** a participant selects an available Fibonacci value during voting
- **THEN** the system stores or replaces that participant's vote for the current round

#### Scenario: Participant changes vote before reveal
- **WHEN** a participant selects a different available value before results are revealed
- **THEN** the current-round vote is replaced and the previous value is not counted separately

#### Scenario: Invalid vote is rejected
- **WHEN** a client submits a value outside the configured Fibonacci set or submits after reveal
- **THEN** the system rejects the vote and preserves the valid round state

### Requirement: Votes remain private before reveal
El sistema SHALL ocultar el valor individual de cada voto durante la fase de votación y SHALL expose only aggregate progress that does not reveal values.

#### Scenario: Voting progress is visible without values
- **WHEN** one or more participants have voted and the room is still in voting phase
- **THEN** participants can see who has voted or the vote count, but cannot see individual values

#### Scenario: Reveal exposes the current round
- **WHEN** the host reveals the round
- **THEN** all participants see each submitted value associated with the participant who submitted it at the same time

### Requirement: The host can reset a revealed round
El sistema SHALL allow the host to clear the current round and return the room to a fresh voting phase without carrying old votes into the next round.

#### Scenario: Round reset succeeds
- **WHEN** the host clears a revealed round
- **THEN** the system removes current-round votes, increments or replaces the round identity, and returns all participants to voting phase

#### Scenario: Reset is unavailable to participants
- **WHEN** a non-host requests a round reset
- **THEN** the system rejects the request and retains the revealed results

### Requirement: Revealed results include descriptive statistics
El sistema SHALL calculate and display the arithmetic mean, median, and mode from the valid submitted votes after reveal.

#### Scenario: Statistics are calculated
- **WHEN** a revealed round contains valid votes
- **THEN** the system displays the mean, median, and mode using only those votes

#### Scenario: Even number of votes has a median
- **WHEN** a revealed round contains an even number of valid votes
- **THEN** the median is the arithmetic mean of the two central sorted values

#### Scenario: No unique mode exists
- **WHEN** no value occurs more frequently than every other value
- **THEN** the system indicates that there is no single mode instead of selecting an arbitrary value

#### Scenario: Participant has not voted
- **WHEN** a participant has not submitted a vote at reveal time
- **THEN** that participant is excluded from statistics and the interface indicates the number of missing votes
