/**
 * Web Crypto API AES-GCM client-side encryption utilities.
 * Uses PBKDF2 key derivation with 100,000 iterations and AES-GCM-256.
 */

export interface EncryptedVaultPayload {
  format: 'HealthVault-Encrypted-Vault';
  version: '1.0';
  saltHex: string;
  ivHex: string;
  ciphertextHex: string;
  createdAt: string;
  exportedBy: string;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

export function isWebCryptoAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.crypto && !!window.crypto.subtle;
}

/**
 * Derives an AES-GCM 256-bit key from a user passphrase using PBKDF2
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts an arbitrary JS object into an AES-GCM encrypted payload
 */
export async function encryptVaultData(data: unknown, passphrase: string, userName: string = 'User'): Promise<EncryptedVaultPayload> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not supported in this browser environment.');
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const enc = new TextEncoder();
  const jsonString = JSON.stringify(data);
  const encodedPlaintext = enc.encode(jsonString);

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedPlaintext
  );

  return {
    format: 'HealthVault-Encrypted-Vault',
    version: '1.0',
    saltHex: bufferToHex(salt.buffer),
    ivHex: bufferToHex(iv.buffer),
    ciphertextHex: bufferToHex(ciphertext),
    createdAt: new Date().toISOString(),
    exportedBy: userName,
  };
}

/**
 * Decrypts an AES-GCM encrypted payload with the user passphrase
 */
export async function decryptVaultData<T = any>(payload: EncryptedVaultPayload, passphrase: string): Promise<T> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not supported in this browser environment.');
  }

  if (payload.format !== 'HealthVault-Encrypted-Vault') {
    throw new Error('Invalid vault file format.');
  }

  const salt = new Uint8Array(hexToBuffer(payload.saltHex));
  const iv = new Uint8Array(hexToBuffer(payload.ivHex));
  const ciphertextBuffer = hexToBuffer(payload.ciphertextHex);

  const key = await deriveKey(passphrase, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertextBuffer
    );

    const dec = new TextDecoder();
    const jsonString = dec.decode(decryptedBuffer);
    return JSON.parse(jsonString) as T;
  } catch (err) {
    throw new Error('Decryption failed. Incorrect password or corrupted payload.');
  }
}
