import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

export const encryptPassword = async (password: string) => {
  const iv = randomBytes(16);

  // The key length is dependent on the algorithm.
  // In this case for aes256, it is 32 bytes.
  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
  const cipher = createCipheriv('aes-256-ctr', key, iv);

  const encryptedText = Buffer.concat([
    cipher.update(password),
    cipher.final(),
  ]);

  return {
    iv: iv.toString('hex'),
    key: key.toString('hex'),
    encryptedText: encryptedText.toString('hex'),
  };
};

export const dycrypt = (pass: string) => {
  const parts = pass.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid input format. Expected "iv:key:encryptedText"');
  }

  const [iv, key, encryptedText] = parts;
  // Convert base64-encoded strings to buffers
  const ivBuffer = Buffer.from(iv, 'hex'); // Assuming iv is hex-encoded
  const keyBuffer = Buffer.from(key, 'hex'); // Assuming key is hex-encoded
  const encryptedBuffer = Buffer.from(encryptedText, 'hex'); // Assuming encrypted text is base64-encoded

  const decipher = createDecipheriv('aes-256-ctr', keyBuffer, ivBuffer);

  // Perform the decryption
  const decryptedText = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  return decryptedText.toString();
};
