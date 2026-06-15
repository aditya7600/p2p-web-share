/**
 * Cryptographic utilities for P2P Web Share
 * Handles AES-GCM End-to-End Encryption (E2EE) and SHA-256 integrity checks using Web Crypto API.
 */

// Generate a random 256-bit AES-GCM key
export async function generateEncryptionKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

// Export CryptoKey to a Hex string (for URL hash)
export async function exportKeyToHex(key) {
  const rawKey = await window.crypto.subtle.exportKey('raw', key);
  const rawBytes = new Uint8Array(rawKey);
  return Array.from(rawBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Import CryptoKey from a Hex string
export async function importKeyFromHex(hexString) {
  if (!hexString || hexString.length !== 64) {
    throw new Error('Invalid encryption key length. Key must be 64 hex characters (256-bit).');
  }
  
  const rawBytes = new Uint8Array(
    hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  
  return await window.crypto.subtle.importKey(
    'raw',
    rawBytes.buffer,
    {
      name: 'AES-GCM',
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a file chunk (ArrayBuffer) using AES-GCM
// Returns a combined ArrayBuffer: [12-byte IV][Ciphertext]
export async function encryptChunk(chunkBuffer, cryptoKey) {
  // Generate a random 12-byte Initialization Vector (IV)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the chunk
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    cryptoKey,
    chunkBuffer
  );

  // Combine IV and Ciphertext into a single ArrayBuffer
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  return combined.buffer;
}

// Decrypt an encrypted chunk (ArrayBuffer) using AES-GCM
// Expects combined ArrayBuffer: [12-byte IV][Ciphertext]
export async function decryptChunk(combinedBuffer, cryptoKey) {
  const combinedBytes = new Uint8Array(combinedBuffer);
  
  if (combinedBytes.length <= 12) {
    throw new Error('Encrypted chunk too small to contain IV.');
  }

  // Extract the 12-byte IV and the ciphertext
  const iv = combinedBytes.slice(0, 12);
  const ciphertext = combinedBytes.slice(12);

  // Decrypt the ciphertext
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    cryptoKey,
    ciphertext.buffer
  );

  return decrypted;
}

// Compute SHA-256 hash of an ArrayBuffer or Blob
// Returns the hex string representation of the hash
export async function computeSHA256(data) {
  let buffer;
  if (data instanceof Blob) {
    buffer = await data.arrayBuffer();
  } else if (data instanceof ArrayBuffer) {
    buffer = data;
  } else {
    throw new Error('Unsupported data type for SHA-256 hashing');
  }

  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}
