import { Storage, Bucket } from "@google-cloud/storage";

const storage = new Storage({ keyFilename: "cred.json" });
let bucket: Bucket;

export async function initGcs() {
    bucket = storage.bucket("genius-aid");
}

export async function uploadFileFromPath(filepath: string, destination: string) {
    await bucket.upload(filepath, {
        destination,
    });
}
