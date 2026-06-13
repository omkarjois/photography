import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  writeBatch 
} from 'firebase/firestore';

// Helper to create standard URL-friendly ID from title
const generateSlug = (title, year) => {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${year}`;
};

// Fetch all albums and photos, join in-memory, sort, and return them
export const fetchAlbumsFromFirestore = async () => {
  const albumsCol = collection(db, 'albums');
  const photosCol = collection(db, 'photos');

  // Helper promise that rejects after 5 seconds to prevent loader hanging
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Database connection timed out. Please check your keys in .env.local and verify your Firestore security rules.")), 5000)
  );

  // Fetch collections concurrently
  const fetchPromise = Promise.all([
    getDocs(albumsCol),
    getDocs(photosCol)
  ]);

  // Race fetching against our 5-second connection timeout
  const [albumsSnap, photosSnap] = await Promise.race([
    fetchPromise,
    timeoutPromise
  ]);
  
  const photosList = [];
  photosSnap.forEach((doc) => {
    photosList.push({ ...doc.data(), id: doc.id });
  });
  
  const joinedAlbums = [];
  albumsSnap.forEach((albumDoc) => {
    const albumData = albumDoc.data();
    // Find matching photos
    const albumPhotos = photosList
      .filter(p => p.albumId === albumDoc.id)
      .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    
    joinedAlbums.push({
      ...albumData,
      id: albumDoc.id,
      photos: albumPhotos
    });
  });

  // Sort albums by number sequence
  joinedAlbums.sort((a, b) => (a.number || '').localeCompare(b.number || ''));
  return joinedAlbums;
};

// Create a new album and batch save to Firestore
export const createAlbumInFirestore = async (albumInput, currentAlbums) => {
  const albumId = generateSlug(albumInput.title, albumInput.year);
  
  // Check for uniqueness of ID
  const exists = currentAlbums.some(a => a.id === albumId);
  const finalId = exists ? `${albumId}-${Date.now().toString().slice(-4)}` : albumId;

  const nextNum = String(currentAlbums.length + 1).padStart(2, '0');
  
  const newAlbumMeta = {
    id: finalId,
    title: albumInput.title,
    year: albumInput.year,
    genre: albumInput.genre,
    image: albumInput.image,
    description: albumInput.description,
    number: nextNum
  };

  const batch = writeBatch(db);
  
  // Save album meta
  batch.set(doc(db, 'albums', finalId), newAlbumMeta);
  
  // Save photos in separate 'photos' collection
  if (albumInput.photos) {
    albumInput.photos.forEach((photo, idx) => {
      const photoSlug = photo.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const photoId = `${finalId}_${photoSlug}`;
      const photoData = {
        id: photoId,
        albumId: finalId,
        name: photo.name,
        url: photo.url,
        description: photo.description || '',
        sequence: idx
      };
      batch.set(doc(db, 'photos', photoId), photoData);
    });
  }
  await batch.commit();

  return {
    ...newAlbumMeta,
    photos: albumInput.photos || []
  };
};

// Update an album and rewrite its photo collection in Firestore
export const updateAlbumInFirestore = async (albumId, updatedFields, currentAlbums) => {
  const originalAlbum = currentAlbums.find(a => a.id === albumId);
  if (!originalAlbum) throw new Error("Album not found.");

  const mergedMeta = {
    id: albumId,
    title: updatedFields.title ?? originalAlbum.title,
    year: updatedFields.year ?? originalAlbum.year,
    genre: updatedFields.genre ?? originalAlbum.genre,
    image: updatedFields.image ?? originalAlbum.image,
    description: updatedFields.description ?? originalAlbum.description,
    number: originalAlbum.number
  };

  const updatedPhotosList = updatedFields.photos ?? originalAlbum.photos;

  const batch = writeBatch(db);
  
  // Update parent album document
  batch.set(doc(db, 'albums', albumId), mergedMeta);
  
  // Delete all old photos first
  const photosCol = collection(db, 'photos');
  const photosSnap = await getDocs(photosCol);
  photosSnap.forEach((photoDoc) => {
    if (photoDoc.data().albumId === albumId) {
      batch.delete(doc(db, 'photos', photoDoc.id));
    }
  });
  
  // Write new photos list
  updatedPhotosList.forEach((photo, idx) => {
    const photoSlug = photo.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const photoId = `${albumId}_${photoSlug}`;
    const photoData = {
      id: photoId,
      albumId: albumId,
      name: photo.name,
      url: photo.url,
      description: photo.description || '',
      sequence: idx
    };
    batch.set(doc(db, 'photos', photoId), photoData);
  });
  
  await batch.commit();

  return {
    ...mergedMeta,
    photos: updatedPhotosList
  };
};

// Delete an album and associated photos, then update remaining sequences in Firestore
export const deleteAlbumFromFirestore = async (albumId, currentAlbums) => {
  const batch = writeBatch(db);
  
  // Delete parent album document
  batch.delete(doc(db, 'albums', albumId));
  
  // Delete all photos linking to it
  const photosCol = collection(db, 'photos');
  const photosSnap = await getDocs(photosCol);
  photosSnap.forEach((photoDoc) => {
    if (photoDoc.data().albumId === albumId) {
      batch.delete(doc(db, 'photos', photoDoc.id));
    }
  });
  
  await batch.commit();

  // Filter and re-index sequence list
  const remaining = currentAlbums.filter(a => a.id !== albumId);
  const reindexed = remaining.map((album, idx) => ({
    ...album,
    number: String(idx + 1).padStart(2, '0')
  }));

  // Update Firestore sequence in bulk
  const sequenceBatch = writeBatch(db);
  reindexed.forEach((album) => {
    sequenceBatch.set(doc(db, 'albums', album.id), { number: album.number }, { merge: true });
  });
  await sequenceBatch.commit();

  return reindexed;
};

// Reorder albums sequence numbers in Firestore
export const reorderAlbumsInFirestore = async (newOrderedAlbums) => {
  const reindexed = newOrderedAlbums.map((album, idx) => ({
    ...album,
    number: String(idx + 1).padStart(2, '0')
  }));

  const batch = writeBatch(db);
  reindexed.forEach((album) => {
    batch.set(doc(db, 'albums', album.id), { number: album.number }, { merge: true });
  });
  await batch.commit();

  return reindexed;
};

// Clear database and reseed default album records
export const resetDatabaseToDefaults = async () => {
  const batch = writeBatch(db);
  
  // Clear albums
  const albumsCol = collection(db, 'albums');
  const albumsSnap = await getDocs(albumsCol);
  albumsSnap.forEach((docSnap) => {
    batch.delete(doc(db, 'albums', docSnap.id));
  });
  
  // Clear photos
  const photosCol = collection(db, 'photos');
  const photosSnap = await getDocs(photosCol);
  photosSnap.forEach((docSnap) => {
    batch.delete(doc(db, 'photos', docSnap.id));
  });
  
  await batch.commit();
  
  // Reseed collections
  const seedBatch = writeBatch(db);
  defaultData.forEach((album) => {
    const albumMeta = { ...album };
    delete albumMeta.photos;
    
    seedBatch.set(doc(db, 'albums', album.id), albumMeta);
    
    if (album.photos) {
      album.photos.forEach((photo, idx) => {
        const photoSlug = photo.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const photoId = `${album.id}_${photoSlug}`;
        const photoData = {
          id: photoId,
          albumId: album.id,
          name: photo.name,
          url: photo.url,
          description: photo.description || '',
          sequence: idx
        };
        seedBatch.set(doc(db, 'photos', photoId), photoData);
      });
    }
  });
  await seedBatch.commit();

  return defaultData;
};
