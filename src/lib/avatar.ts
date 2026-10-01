const legacyAvatarColors: Record<string, string> = {
  star: '#f5c451',
  sun: '#e84855',
  moon: '#2e86ab',
  bolt: '#8f5cff',
}

export function getAvatarColor(value: string): string {
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value
  }

  return legacyAvatarColors[value] ?? '#f5c451'
}
