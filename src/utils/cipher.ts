import * as AES from "crypto-js/aes";
import * as enc from "crypto-js/enc-utf8";
import * as crypto from "crypto";

const secret = "QhkR7MaDZGTKDpKrv5mhzsAWQwp3kDi8Hb3UnmjwUjof6K6QzAw8y"

export const encryptFunction = async (text: string, privatekey: string): Promise<{status: boolean; cipher?: string; message?: string}> => {
  return new Promise(async(resolve)=>{
    try {

      if(!privatekey) privatekey = "";

      privatekey = privatekey + secret;

      const ciphertext: string = AES.encrypt(text, privatekey).toString();

      console.log(ciphertext);

      return resolve({status: true, cipher: ciphertext});

    } catch (e){
      console.log(e);
      return resolve({
        status: false,
        message: e.message
      })
    }
  })
}


export const decryptFunction = async (cipher: string, privatekey: string): Promise<{status: boolean; text?: string; message?: string;}> => {
  return new Promise(async (resolve)=>{
    try {

      if(!privatekey) privatekey = "";

      privatekey = privatekey + secret;

      const bytes  = AES.decrypt(cipher, privatekey);
      const text: string = bytes.toString(enc);

      return resolve({status: true, text});

    } catch (e){
      console.log(e);
      return resolve({
        status: false,
        message: e.message
      })
    }
  })
}

export const createHMACSHA256 = async (secret, message): Promise<{status: boolean, hash: string}> => {

  return new Promise (async (resolve) => {

    const hash = crypto.createHmac('sha256', secret).update(message).digest('hex');

    console.log('hash....', hash);

    return resolve({
      status: true,
      hash: hash
    })
  })

}