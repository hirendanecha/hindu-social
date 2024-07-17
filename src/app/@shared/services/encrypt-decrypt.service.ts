import { Injectable } from '@angular/core';
// import * as CryptoJS from 'crypto-js';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EncryptDecryptService {
  private key = environment.EncryptKey;
  private iv = environment.EncryptIV;
  constructor() {}
  encryptUsingAES256(text: string): string {
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(text),
      CryptoJS.enc.Utf8.parse(this.key),
      {
        keySize: 128 / 8,
        iv: CryptoJS.enc.Utf8.parse(this.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return encrypted?.toString();
  }

  decryptUsingAES256(decString: string): string {
    const decrypted = CryptoJS.AES.decrypt(
      decString,
      CryptoJS.enc.Utf8.parse(this.key),
      {
        keySize: 128 / 8,
        iv: CryptoJS.enc.Utf8.parse(this.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return decrypted?.toString(CryptoJS.enc.Utf8);
  }
}