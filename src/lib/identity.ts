export interface StoredIdentity {
  name: string
  avatar: string
}

const identityKey = 'scrumtro:identity'

export function getStoredIdentity(): StoredIdentity {
  const storedIdentity =
    localStorage.getItem(identityKey) ?? sessionStorage.getItem(identityKey)

  if (!storedIdentity) {
    return { name: '', avatar: 'star' }
  }

  try {
    const parsed = JSON.parse(storedIdentity) as Partial<StoredIdentity>
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      avatar: typeof parsed.avatar === 'string' ? parsed.avatar : 'star',
    }
  } catch {
    return { name: '', avatar: 'star' }
  }
}

export function saveStoredIdentity(identity: StoredIdentity): void {
  const serializedIdentity = JSON.stringify(identity)
  localStorage.setItem(identityKey, serializedIdentity)
  sessionStorage.setItem(identityKey, serializedIdentity)
}
