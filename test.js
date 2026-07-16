import { encrypt, decrypt } from './server/models/User.js';

// Test
const password = 'Admin@123';
const encrypted = encrypt(password);
console.log('Original:', password);
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypt(encrypted));
console.log('Wrong decrypt test:', decrypt(encrypted) === 'wrong' ? 'Match' : 'No match');
