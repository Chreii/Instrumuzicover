import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Image as ImageIcon, Search, Loader2 } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, db } from '../firebase';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  cloudinaryConfig: { cloudName: string; uploadPreset: string };
}

export const MediaSelectorModal: React.FC<MediaSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  cloudinaryConfig
}) => {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    
    const q = query(collection(db, 'media'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mediaData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter for images
      setMedia(mediaData.filter((m: any) => m.type?.startsWith('image/')));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      if (!cloudinaryConfig.cloudName) alert("Please configure Cloudinary in Settings first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();

      if (data.secure_url) {
        // Save to Firestore media collection
        await addDoc(collection(db, 'media'), {
          url: data.secure_url,
          type: file.type,
          date: new Date().toISOString(),
          title: file.name
        });
        onSelect(data.secure_url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const filteredMedia = media.filter(m => 
    (m.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Select Media</h2>
                <p className="text-sm text-zinc-500">Choose from library or upload new</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text"
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                
                <label className="flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer transition-all disabled:opacity-50">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {uploading ? 'Uploading...' : 'Upload New'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p>Loading your media...</p>
                </div>
              ) : filteredMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredMedia.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => onSelect(item.url)}
                      className="group relative aspect-square bg-zinc-800 rounded-xl overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all"
                    >
                      <img 
                        src={item.url} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">Select</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p>No images found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
