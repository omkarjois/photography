import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { compressAndResizeImage } from '../utils/imageCompressor';

// Synchronous Base64 data URL to Blob helper
const dataURItoBlob = (dataURI) => {
  try {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (e) {
    console.error("Error converting base64 data URI to Blob:", e);
    throw new Error("Failed to parse image data.");
  }
};

// Compress and process images uploaded by the admin dashboard to Firebase Storage
export const uploadImage = async (file, folderPath, fileName) => {
  try {
    // 1. Compress image to web format (max width 1200px, quality 0.75)
    const compressedBase64 = await compressAndResizeImage(file);
    
    // 2. Convert base64 dataUrl back to a binary Blob synchronously
    const blob = dataURItoBlob(compressedBase64);
    
    // 3. Define storage filename path using provided parameters
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const storagePath = `${folderPath}/${fileName}.${fileExtension}`;
    
    // 4. Create storage reference and upload bytes
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, blob);
    
    // 5. Get public download URL
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Storage upload helper error:", error);
    throw error;
  }
};
