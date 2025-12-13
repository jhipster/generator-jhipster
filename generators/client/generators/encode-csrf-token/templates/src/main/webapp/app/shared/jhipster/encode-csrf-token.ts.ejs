/**
 * Generates a CSRF token suitable for WebSocket communication with Spring Security.
 */
export function encodeCsrfToken(rawToken: string | undefined): string {
  const encoder = new TextEncoder();
  const tokenBytes = encoder.encode(rawToken);
  const tokenSize = tokenBytes.length;

  // 1. Generate random bytes R
  const randomBytes = new Uint8Array(tokenSize);
  crypto.getRandomValues(randomBytes);

  // 2. Compute XOR(R, T)
  const xored = new Uint8Array(tokenSize);
  for (let i = 0; i < tokenSize; i++) {
    // eslint-disable-next-line no-bitwise
    xored[i] = randomBytes[i] ^ tokenBytes[i];
  }

  // 3. Concatenate [R][X]
  const combined = new Uint8Array(tokenSize * 2);
  combined.set(randomBytes, 0);
  combined.set(xored, tokenSize);

  // 4. Base64 URL encode
  return btoa(String.fromCharCode(...combined))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
