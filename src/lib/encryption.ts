import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

export class EncryptionService {
  private static instance: EncryptionService;
  private key: Buffer;

  private constructor() {
    this.key = Buffer.from(ENCRYPTION_KEY, 'hex');
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, this.key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipher(ALGORITHM, this.key);
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  encryptField(text: string): string {
    if (!text) return text;
    const { encrypted, iv, tag } = this.encrypt(text);
    return `${iv}:${tag}:${encrypted}`;
  }

  decryptField(encryptedField: string): string {
    if (!encryptedField) return encryptedField;
    
    const [iv, tag, encrypted] = encryptedField.split(':');
    if (!iv || !tag || !encrypted) {
      return encryptedField; // Return as-is if not properly encrypted
    }
    
    return this.decrypt(encrypted, iv, tag);
  }

  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  encryptJSON(obj: any): string {
    return this.encryptField(JSON.stringify(obj));
  }

  decryptJSON(encrypted: string): any {
    try {
      const decrypted = this.decryptField(encrypted);
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }
}

export const encryption = EncryptionService.getInstance();