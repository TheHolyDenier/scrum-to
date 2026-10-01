# Spec Delta

## Purpose

Esta capacidad proporciona una identidad visual lúdica y reconocible para la herramienta de Scrum mediante una metáfora de cartas y póker. La estética debe ser original, usable y suficientemente clara para no ocultar el estado de la sesión.

## ADDED Requirements

### Requirement: The interface communicates room state clearly
La interfaz SHALL mostrar de forma distinguible la sala, la fase actual, la participación y las acciones disponibles, incluso cuando se apliquen efectos visuales decorativos.

#### Scenario: Voting state is understandable
- **WHEN** a participant opens an active voting round
- **THEN** the interface identifies the voting phase, available cards, selected card, and reveal status

#### Scenario: Revealed state is understandable
- **WHEN** the round is revealed
- **THEN** the interface prioritizes the revealed values, statistics, and next-round action over decorative effects

### Requirement: The interface is responsive and accessible
La interfaz SHALL funcionar en pantallas pequeñas y grandes, SHALL mantener contraste y foco de teclado adecuados, y SHALL proporcionar etiquetas textuales para controles y estados relevantes.

#### Scenario: Mobile participant votes
- **WHEN** a participant uses a narrow viewport
- **THEN** cards and controls remain selectable without horizontal scrolling or clipped essential content

#### Scenario: Keyboard user navigates voting
- **WHEN** a participant navigates with a keyboard or assistive technology
- **THEN** the available voting controls, current selection, errors, and phase changes have programmatically understandable labels and focus states

### Requirement: Visual assets are original or licensed
La aplicación SHALL usar únicamente ilustraciones, iconos, fuentes y efectos creados para el proyecto o con una licencia que permita su distribución.

#### Scenario: Asset inventory is reviewed
- **WHEN** an asset is added to the application
- **THEN** its source and license are recorded in the project documentation or asset inventory

#### Scenario: Balatro reference is used
- **WHEN** the visual design references Balatro
- **THEN** it uses general themes such as cards, poker, neon, and playful motion without copying extracted game assets, logos, characters, or proprietary artwork

### Requirement: Reduced motion is respected
La interfaz SHALL reducir o desactivar las animaciones no esenciales cuando el usuario haya habilitado la preferencia de movimiento reducido.

#### Scenario: Reduced motion preference is active
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** decorative transitions are reduced or removed while state changes remain understandable
