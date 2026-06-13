import React, { useState, useEffect } from 'react';
import { useGallery } from '../../hooks/useGallery';
import { useNavigate } from 'react-router-dom';
import { compressAndResizeImage } from '../../utils/imageCompressor';
import { uploadImage } from '../../services/storage';
import { 
  Plus, 
  Trash2, 
  Edit, 
  ArrowUp, 
  ArrowDown, 
  Upload as UploadIcon, 
  Check, 
  Database,
  ArrowLeft,
  X,
  FileImage,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const { 
    albums, 
    loading, 
    error, 
    addAlbum, 
    updateAlbum, 
    deleteAlbum, 
    reorderAlbums, 
    resetToDefaultData 
  } = useGallery();

  const navigate = useNavigate();

  // Authentication check on mount
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('wildlens_authenticated') === 'true';
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Dashboard / Editor States
  const [isEditing, setIsEditing] = useState(false);
  const [editAlbumId, setEditAlbumId] = useState(null);
  
  // Album Form States
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [photos, setPhotos] = useState([]); // Array of { name, url, description }

  // Form local status
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [photoUploadingIndex, setPhotoUploadingIndex] = useState(null);
  const [coverUploadError, setCoverUploadError] = useState('');
  const [photoUploadErrors, setPhotoUploadErrors] = useState({});

  const handleLogout = () => {
    sessionStorage.removeItem('wildlens_authenticated');
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Open editor to create new album
  const handleCreateNew = () => {
    setTitle('');
    setYear(new Date().getFullYear().toString());
    setGenre('Wildlife');
    setDescription('');
    setCoverImage('');
    setPhotos([]);
    setEditAlbumId(null);
    setIsEditing(true);
    setFormError('');
  };

  // Open editor to modify existing album
  const handleEditClick = (album) => {
    setTitle(album.title || '');
    setYear(album.year || '');
    setGenre(album.genre || '');
    setDescription(album.description || '');
    setCoverImage(album.image || '');
    setPhotos(album.photos ? [...album.photos] : []);
    setEditAlbumId(album.id);
    setIsEditing(true);
    setFormError('');
  };

  // Helper to compute album ID dynamically
  const getAlbumId = () => {
    if (editAlbumId) return editAlbumId;
    const slug = title.trim() ? title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : 'draft';
    const yr = year.trim() ? year.trim() : '2026';
    return `${slug}-${yr}`;
  };

  // Helper to compute photo ID dynamically
  const getPhotoId = (photo, index) => {
    const albumId = getAlbumId();
    const nameSlug = photo.name && photo.name.trim() 
      ? photo.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') 
      : `photo-${index}`;
    return `${albumId}_${nameSlug}`;
  };

  // Handle Cover Image upload file
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCoverUploading(true);
    setCoverUploadError('');
    try {
      const albumId = getAlbumId();
      const uploadUrl = await uploadImage(file, `albums/${albumId}`, 'cover');
      setCoverImage(uploadUrl);
    } catch (err) {
      console.error(err);
      setCoverUploadError('Upload failed: ' + (err.message || err.toString()));
    } finally {
      setCoverUploading(false);
    }
  };

  // Handle Photo Image file upload
  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoUploadingIndex(index);
    setPhotoUploadErrors(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    try {
      const albumId = getAlbumId();
      const photoId = getPhotoId(photos[index] || { name: '' }, index);
      const uploadUrl = await uploadImage(file, `albums/${albumId}/photos`, photoId);
      const updatedPhotos = [...photos];
      updatedPhotos[index].url = uploadUrl;
      setPhotos(updatedPhotos);
    } catch (err) {
      console.error(err);
      setPhotoUploadErrors(prev => ({
        ...prev,
        [index]: 'Upload failed: ' + (err.message || err.toString())
      }));
    } finally {
      setPhotoUploadingIndex(null);
    }
  };

  // Manage individual photos state inside form
  const handleAddPhoto = () => {
    setPhotos([...photos, { name: '', url: '', description: '' }]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos(photos.filter((_, idx) => idx !== index));
  };

  const handlePhotoChange = (index, field, value) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index][field] = value;
    setPhotos(updatedPhotos);
  };

  const handleMovePhoto = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === photos.length - 1) return;

    const newPhotos = [...photos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIndex];
    newPhotos[targetIndex] = temp;
    
    setPhotos(newPhotos);
  };

  // Album Save Action
  const handleSaveAlbum = async (e) => {
    e.preventDefault();
    if (!title.trim() || !year.trim() || !genre.trim() || !coverImage.trim() || !description.trim()) {
      setFormError('All main album metadata fields are required.');
      return;
    }

    // Verify photos array
    for (let i = 0; i < photos.length; i++) {
      if (!photos[i].name.trim() || !photos[i].url.trim()) {
        setFormError(`Photo #${i + 1} must have a name and image source.`);
        return;
      }
    }

    setIsSaving(true);
    setFormError('');
    try {
      const albumData = {
        title: title.trim(),
        year: year.trim(),
        genre: genre.trim(),
        image: coverImage.trim(),
        description: description.trim(),
        photos: photos.map(p => ({
          name: p.name.trim(),
          url: p.url.trim(),
          description: p.description?.trim() || ''
        }))
      };

      if (editAlbumId) {
        // Edit mode
        await updateAlbum(editAlbumId, albumData);
      } else {
        // Create mode
        await addAlbum(albumData);
      }

      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setFormError('Failed to save to database. Check console logs.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder entire albums
  const handleMoveAlbum = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === albums.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reorderedList = [...albums];
    
    const temp = reorderedList[index];
    reorderedList[index] = reorderedList[targetIndex];
    reorderedList[targetIndex] = temp;

    try {
      await reorderAlbums(reorderedList);
    } catch (err) {
      alert("Failed to update album ordering in database.");
    }
  };

  // Delete album confirm
  const handleDeleteClick = async (albumId, albumTitle) => {
    if (window.confirm(`Are you sure you want to permanently delete the album "${albumTitle}"?`)) {
      try {
        await deleteAlbum(albumId);
      } catch (err) {
        alert("Failed to delete album.");
      }
    }
  };

  // Reset demo
  const handleResetData = async () => {
    if (window.confirm("WARNING: This will erase all current albums and restore the original 4 mock galleries. Proceed?")) {
      try {
        await resetToDefaultData();
      } catch (err) {
        alert("Error resetting database.");
      }
    }
  };

  if (!isAuthenticated) {
    return null; // Redirecting...
  }

  // Dashboard Loader
  if (loading && !isEditing) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex flex-col justify-center items-center">
        <RefreshCw className="w-6 h-6 animate-spin text-white/40 mb-4" />
        <span className="text-[10px] tracking-[0.4em] uppercase text-white/40">Synchronizing Database</span>
      </div>
    );
  }

  const totalPhotosCount = albums.reduce((acc, curr) => acc + (curr.photos?.length || 0), 0);

  return (
    <div className="w-full min-h-screen bg-[#070707] text-white pt-32 pb-24 px-6 md:px-12 lg:px-24 animate-[fadeIn_0.5s_ease-out] overflow-y-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">CRM DASHBOARD</h1>
            <span className="text-[10px] bg-white/5 border border-white/15 px-3 py-1 rounded-full uppercase tracking-wider text-white/60">
              Admin Mode
            </span>
          </div>
          <p className="text-xs text-white/40 tracking-wider">Manage your photography albums, descriptions, and story flow.</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="border border-white/20 px-4 py-2 text-[10px] tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors cursor-pointer"
          >
            Lock Portal
          </button>
        </div>
      </div>

      {/* DATABASE BANNER & STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
        {/* Connection card */}
        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center border bg-green-500/10 border-green-500/30 text-green-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] tracking-widest text-white/40 uppercase font-bold">Data Store</p>
            <h3 className="text-sm font-semibold tracking-wider">
              Firebase Firestore
            </h3>
            <span className="flex items-center gap-1.5 mt-1 text-[9px] text-white/50">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Connected to cloud
            </span>
          </div>
        </div>

        {/* Stats card 1 */}
        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-xl flex flex-col justify-between">
          <p className="text-[9px] tracking-widest text-white/40 uppercase font-bold">Total Albums</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-3xl font-light leading-none">{albums.length}</h2>
            <span className="text-xs text-white/30 font-light">galleries active</span>
          </div>
        </div>

        {/* Stats card 2 */}
        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-xl flex flex-col justify-between">
          <p className="text-[9px] tracking-widest text-white/40 uppercase font-bold">Total Photographs</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-3xl font-light leading-none">{totalPhotosCount}</h2>
            <span className="text-xs text-white/30 font-light">stories uploaded</span>
          </div>
        </div>

        {/* Controls card */}
        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-xl flex items-center gap-3">
          <button 
            onClick={handleResetData}
            title="Reset DB back to original default photos"
            className="flex-1 bg-white/5 border border-white/15 py-3 px-4 rounded-lg text-[10px] uppercase font-semibold tracking-widest hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reseed Demo Data
          </button>
        </div>
      </div>



      {error && (
        <div className="mb-12 bg-red-500/5 border border-red-500/20 p-4 rounded-xl text-xs text-red-400 flex items-center gap-3">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          Error: {error}
        </div>
      )}

      {/* DASHBOARD CONTENT SWITCH */}
      {!isEditing ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-light tracking-widest uppercase text-white/80">Manage Stories</h2>
            <button
              onClick={handleCreateNew}
              className="bg-white text-black hover:bg-white/90 px-5 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Album
            </button>
          </div>

          {/* ALBUM LIST TABLE */}
          <div className="bg-white/[0.01] border border-white/10 rounded-2xl overflow-hidden">
            {albums.length === 0 ? (
              <div className="py-20 text-center text-sm text-white/30 font-light">
                No albums found. Click "Create Album" to start!
              </div>
            ) : (
              <div className="divide-y divide-white/15">
                {albums.map((album, idx) => (
                  <div 
                    key={album.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6 hover:bg-white/[0.015] transition-colors"
                  >
                    {/* Album Meta */}
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-20 bg-neutral-900 border border-white/10 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={album.image} 
                          alt={album.title} 
                          className="w-full h-full object-cover grayscale-[0.3]"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xl font-light text-white/40">{album.number}</span>
                          <h3 className="text-lg font-medium tracking-tight text-white">{album.title}</h3>
                          <span className="text-[10px] text-white/50 px-2 py-0.5 bg-white/5 border border-white/10 rounded font-semibold uppercase">{album.genre}</span>
                        </div>
                        <p className="text-xs text-white/40">Year: {album.year} &bull; {album.photos?.length || 0} Photographs</p>
                      </div>
                    </div>

                    {/* Actions & Reordering */}
                    <div className="flex items-center justify-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
                      {/* Album ordering buttons */}
                      <div className="flex bg-black border border-white/15 rounded-lg overflow-hidden mr-2">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveAlbum(idx, 'up')}
                          className={`p-2.5 hover:bg-white/10 border-r border-white/15 transition-colors cursor-pointer ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'text-white'}`}
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={idx === albums.length - 1}
                          onClick={() => handleMoveAlbum(idx, 'down')}
                          className={`p-2.5 hover:bg-white/10 transition-colors cursor-pointer ${idx === albums.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-white'}`}
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Edit / Delete */}
                      <button
                        onClick={() => handleEditClick(album)}
                        className="bg-white/5 border border-white/15 px-4 py-2.5 rounded-lg text-[10px] tracking-widest uppercase font-semibold hover:bg-white hover:text-black hover:border-white transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(album.id, album.title)}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-lg text-[10px] tracking-widest uppercase font-semibold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ALBUM EDITOR (CREATE / EDIT FORM) */
        <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl relative">
          <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-8">
            <h2 className="text-xl md:text-2xl font-light tracking-wide">
              {editAlbumId ? `EDIT ALBUM: ${title}` : 'CREATE NEW ALBUM'}
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-white/40 hover:text-white transition-colors cursor-pointer"
              title="Close editor"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSaveAlbum} className="space-y-8">
            {/* Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-white/50 mb-2">Album Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Serengeti Plains"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black border border-white/15 focus:border-white/40 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-white/50 mb-2">Year</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2025"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-black border border-white/15 focus:border-white/40 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-white/50 mb-2">Genre / Theme</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wildlife, Landscape"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-black border border-white/15 focus:border-white/40 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image Selection (Upload or Paste URL) */}
              <div className="flex flex-col justify-between">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-white/50 mb-2">Cover Image</label>
                  <div className="aspect-[4/3] bg-neutral-900 border border-white/15 rounded-lg overflow-hidden relative group">
                    {coverImage ? (
                      <>
                        <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setCoverImage('')}
                          className="absolute top-2 right-2 bg-black/80 p-1.5 rounded-full text-white/70 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center items-center gap-2 p-4 text-center">
                        <FileImage className="w-8 h-8 text-white/25" />
                        <span className="text-[10px] text-white/30 tracking-widest">No Cover Selected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  <input
                    type="text"
                    placeholder="Paste Image URL"
                    value={coverImage.startsWith('data:') ? '' : coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full bg-black border border-white/15 focus:border-white/40 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none transition-colors"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="cover-upload-file"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="cover-upload-file"
                      className="w-full bg-white/5 border border-white/15 hover:bg-white/10 py-2.5 rounded-lg text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {coverUploading ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <UploadIcon className="w-3 h-3" />
                      )}
                      Upload Local File
                    </label>
                    {coverUploadError && (
                      <p className="text-red-400 text-[10px] mt-2 text-center font-light leading-relaxed max-w-xs mx-auto">
                        {coverUploadError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Album Description */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-white/50 mb-2">Album Story Description</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the journey, expedition details, context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black border border-white/15 focus:border-white/40 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors resize-y leading-relaxed font-light"
              />
            </div>

            {/* Photos Sub-Form list */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-light tracking-wide">Photographs in Album ({photos.length})</h3>
                  <p className="text-[10px] text-white/40 mt-1">Assign names and details for each image story block.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="bg-white/5 border border-white/15 hover:bg-white hover:text-black py-2.5 px-4 rounded-lg text-[9px] uppercase tracking-widest font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Photograph
                </button>
              </div>

              {photos.length === 0 ? (
                <div className="py-12 border border-dashed border-white/10 rounded-xl text-center text-xs text-white/30 font-light">
                  No photographs added to this album story yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {photos.map((photo, idx) => (
                    <div 
                      key={idx}
                      className="bg-white/[0.015] border border-white/10 p-5 rounded-xl flex flex-col md:flex-row gap-5 relative group"
                    >
                      {/* Photo Thumbnail */}
                      <div className="w-full md:w-36 flex flex-col justify-between">
                        <div className="aspect-[4/3] bg-neutral-900 border border-white/10 rounded-lg overflow-hidden relative">
                          {photo.url ? (
                            <img src={photo.url} alt="Photo preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col justify-center items-center text-center p-2 text-white/20">
                              <FileImage className="w-6 h-6 mb-1" />
                              <span className="text-[9px] tracking-wider uppercase">Photo #{idx + 1}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2.5 space-y-2">
                          <input
                            type="text"
                            placeholder="Paste Image URL"
                            value={photo.url.startsWith('data:') ? '' : photo.url}
                            onChange={(e) => handlePhotoChange(idx, 'url', e.target.value)}
                            className="w-full bg-black border border-white/10 focus:border-white/30 rounded px-2 py-1.5 text-[10px] text-white placeholder-white/20 outline-none transition-colors"
                          />
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              id={`photo-file-upload-${idx}`}
                              onChange={(e) => handlePhotoUpload(e, idx)}
                              className="hidden"
                            />
                            <label
                              htmlFor={`photo-file-upload-${idx}`}
                              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-1.5 rounded text-[8px] uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              {photoUploadingIndex === idx ? (
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <UploadIcon className="w-2.5 h-2.5" />
                              )}
                              Upload Image
                            </label>
                            {photoUploadErrors[idx] && (
                              <p className="text-red-400 text-[9px] mt-1.5 text-center font-light leading-relaxed max-w-[150px] mx-auto">
                                {photoUploadErrors[idx]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Photo Fields */}
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <label className="block text-[8px] uppercase tracking-widest font-semibold text-white/40 mb-1.5">Photo Name / Title</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Eye of the Predator"
                              value={photo.name}
                              onChange={(e) => handlePhotoChange(idx, 'name', e.target.value)}
                              className="w-full bg-black border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 outline-none transition-colors"
                            />
                          </div>

                          <div className="text-white/40 font-mono text-sm leading-none pt-6">
                            #{String(idx + 1).padStart(2, '0')}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] uppercase tracking-widest font-semibold text-white/40 mb-1.5">Narrative Story / Description</label>
                          <textarea
                            rows={2}
                            placeholder="Detail behind the shot, environment, wait time, metadata details..."
                            value={photo.description}
                            onChange={(e) => handlePhotoChange(idx, 'description', e.target.value)}
                            className="w-full bg-black border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 outline-none transition-colors resize-y leading-relaxed font-light"
                          />
                        </div>
                      </div>

                      {/* Photo Sorting & Deleting Panel */}
                      <div className="flex md:flex-col justify-between items-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-4 gap-2 flex-row shrink-0">
                        <div className="flex md:flex-col border border-white/10 rounded bg-black overflow-hidden">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMovePhoto(idx, 'up')}
                            className={`p-1.5 hover:bg-white/10 transition-colors border-r md:border-r-0 md:border-b border-white/10 cursor-pointer ${idx === 0 ? 'opacity-25 cursor-not-allowed' : ''}`}
                            title="Move photo up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === photos.length - 1}
                            onClick={() => handleMovePhoto(idx, 'down')}
                            className={`p-1.5 hover:bg-white/10 transition-colors cursor-pointer ${idx === photos.length - 1 ? 'opacity-25 cursor-not-allowed' : ''}`}
                            title="Move photo down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-2 bg-red-500/10 border border-red-500/25 rounded hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                          title="Delete photograph block"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400 group-hover:text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {formError && (
              <div className="bg-red-500/15 border border-red-500/30 p-4 rounded-xl text-xs text-red-400">
                {formError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 border-t border-white/10 pt-8">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="border border-white/20 px-6 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || coverUploading || photoUploadingIndex !== null}
                className="bg-white text-black hover:bg-white/95 px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save Album
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
