import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchAlbumsFromFirestore, 
  createAlbumInFirestore, 
  updateAlbumInFirestore, 
  deleteAlbumFromFirestore, 
  reorderAlbumsInFirestore, 
  resetDatabaseToDefaults 
} from '../services/portfolioService';

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load portfolios on mount
  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true);
      try {
        const joinedAlbums = await fetchAlbumsFromFirestore();
        setAlbums(joinedAlbums);
        setError(null);
      } catch (err) {
        console.error("Error fetching portfolios:", err);
        setError(err.message || "Failed to load database content.");
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  // Add a new album
  const addAlbum = async (albumInput) => {
    setLoading(true);
    try {
      const newAlbum = await createAlbumInFirestore(albumInput, albums);
      setAlbums((prev) => [...prev, newAlbum]);
      return newAlbum;
    } catch (err) {
      console.error("Error adding new album:", err);
      setError("Failed to create new album.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing album
  const updateAlbum = async (albumId, updatedFields) => {
    setLoading(true);
    try {
      const updatedAlbum = await updateAlbumInFirestore(albumId, updatedFields, albums);
      setAlbums((prev) => prev.map(a => a.id === albumId ? updatedAlbum : a));
    } catch (err) {
      console.error("Error updating album:", err);
      setError("Failed to save album updates.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete album
  const deleteAlbum = async (albumId) => {
    setLoading(true);
    try {
      const updatedAlbums = await deleteAlbumFromFirestore(albumId, albums);
      setAlbums(updatedAlbums);
    } catch (err) {
      console.error("Error deleting album:", err);
      setError("Failed to delete album.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reorder albums sequence list
  const reorderAlbums = async (newOrderedAlbums) => {
    setLoading(true);
    try {
      const updatedAlbums = await reorderAlbumsInFirestore(newOrderedAlbums);
      setAlbums(updatedAlbums);
    } catch (err) {
      console.error("Error reordering albums:", err);
      setError("Failed to save custom layout sequence.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset database back to original defaults
  const resetToDefaultData = async () => {
    setLoading(true);
    try {
      const defaultAlbums = await resetDatabaseToDefaults();
      setAlbums(defaultAlbums);
      setError(null);
    } catch (err) {
      console.error("Error resetting database:", err);
      setError("Failed to perform database seed reset.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        albums,
        loading,
        error,
        isDemoMode: false,
        addAlbum,
        updateAlbum,
        deleteAlbum,
        reorderAlbums,
        resetToDefaultData
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
