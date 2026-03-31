/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useContext, Component } from 'react';
import LoginSuccessModal from './components/LoginSuccessModal';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  FileText, 
  Mail, 
  Play, 
  Pause,
  ChevronRight, 
  Instagram, 
  Twitter, 
  Youtube,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  Layers,
  Edit2,
  Eye,
  User,
  Calendar,
  BarChart2,
  Mic2,
  Guitar,
  Drum,
  Piano,
  Search,
  Upload,
  Camera,
  Trash2,
  Image as ImageIcon,
  MoreVertical,
  LogOut,
  AlertCircle,
  Loader2,
  Settings,
  Cloud,
  Video,
  Download,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  ListMusic,
  ChevronDown,
  ChevronUp,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  auth, 
  db, 
  storage,
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  getDoc, 
  addDoc,
  setDoc, 
  updateDoc,
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  where, 
  deleteDoc,
  handleFirestoreError, 
  OperationType,
  FirebaseUser,
  increment
} from './firebase';

const DIFFICULTIES = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];
const INSTRUMENTS = [
  'Bass', 'Vocal', 'Drum Set', 'Piano', 'Piano Solo', 'Fingerstyle', 'Guitar Solo', 'Lead Guitar', 'Piano Cover', 'Instrumental', 'Rhythm Guitar', 'Acoustic Guitar'
];

interface AuthContextType {
  user: FirebaseUser | null;
  isAdmin: boolean;
  isAuthReady: boolean;
  cloudinaryConfig: { cloudName: string; uploadPreset: string };
  saveCloudinaryConfig: (cloudName: string, uploadPreset: string) => void;
  login: (usernameOrEvent?: string | React.MouseEvent, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  showLoginSuccessModal: boolean;
  setShowLoginSuccessModal: (show: boolean) => void;
}

const AuthContext = React.createContext<AuthContextType>({ 
  user: null, 
  isAdmin: false,
  isAuthReady: false, 
  cloudinaryConfig: { cloudName: '', uploadPreset: '' },
  saveCloudinaryConfig: () => {},
  login: async (usernameOrEvent?: string | React.MouseEvent, password?: string) => {}, 
  logout: async () => {},
  showLoginModal: false,
  setShowLoginModal: () => {},
  showLoginSuccessModal: false,
  setShowLoginSuccessModal: () => {}
});

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): any {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    const self = this as any;
    const { hasError, error } = self.state;
    if (hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsedError = JSON.parse(error?.message || '{}');
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} during ${parsedError.operationType} on ${parsedError.path}`;
        } else {
          errorMessage = error?.message || errorMessage;
        }
      } catch (e) {
        errorMessage = error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
          <div className="bg-zinc-900 border border-red-900/50 p-8 rounded-2xl max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
            <p className="text-zinc-400 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full font-bold transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return self.props.children;
  }
}

const initialPerformances = [
  { 
    title: "Summer Jazz Festival", 
    artist: "Jazz Collective",
    instrument: "Piano Solo",
    difficulty: "Advanced",
    dateUploaded: "3/15/2026",
    views: "1200",
    image: "https://images.pexels.com/photos/36631842/pexels-photo-36631842.png",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  { 
    title: "Summer Jazz Festival", 
    artist: "Jazz Collective",
    instrument: "Bass",
    difficulty: "Intermediate",
    dateUploaded: "3/16/2026",
    views: "450",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  { 
    title: "Acoustic Nights", 
    artist: "The Strays",
    instrument: "Acoustic Guitar",
    difficulty: "Intermediate",
    dateUploaded: "3/10/2026",
    views: "850",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80&w=400",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  { 
    title: "Symphony Under the Stars", 
    artist: "L.A. Philharmonic",
    instrument: "Piano Cover",
    difficulty: "Advanced",
    dateUploaded: "3/05/2026",
    views: "2500",
    image: "https://images.pexels.com/photos/36631756/pexels-photo-36631756.png",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  { 
    title: "Indie Showcase", 
    artist: "Neon Dreams",
    instrument: "Lead Guitar",
    difficulty: "Intermediate",
    dateUploaded: "2/28/2026",
    views: "1100",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=400",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  { 
    title: "Winter Blues", 
    artist: "Deep South",
    instrument: "Bass",
    difficulty: "Beginner",
    dateUploaded: "2/15/2026",
    views: "420",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  { 
    title: "Spring Awakening", 
    artist: "The Bloomers",
    instrument: "Vocal",
    difficulty: "Intermediate",
    dateUploaded: "2/10/2026",
    views: "930",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=400",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  { 
    title: "City Beats", 
    artist: "Urban Pulse",
    instrument: "Drum Set",
    difficulty: "Advanced",
    dateUploaded: "2/01/2026",
    views: "3200",
    image: "https://images.pexels.com/photos/36631862/pexels-photo-36631862.png",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  { 
    title: "Mountain Melodies", 
    artist: "High Altitude",
    instrument: "Fingerstyle",
    difficulty: "Advanced",
    dateUploaded: "1/25/2026",
    views: "1800",
    image: "https://images.unsplash.com/photo-1459749411177-042180ce6742?auto=format&fit=crop&q=80&w=400",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  { 
    title: "Beachside Rhythms", 
    artist: "Coastal Vibes",
    instrument: "Rhythm Guitar",
    difficulty: "Beginner",
    dateUploaded: "1/15/2026",
    views: "560",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  { 
    title: "Golden Hour Sessions", 
    artist: "Sunset Theory",
    instrument: "Instrumental",
    difficulty: "Intermediate",
    dateUploaded: "1/05/2026",
    views: "1400",
    image: "https://images.pexels.com/photos/36616608/pexels-photo-36616608.png?auto=compress&cs=tinysrgb&w=400",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  { 
    title: "Urban Groove", 
    artist: "Metro Sound",
    instrument: "Guitar Solo",
    difficulty: "Advanced",
    dateUploaded: "12/28/2025",
    views: "2100",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  { 
    title: "Midnight Jazz", 
    artist: "Night Owls",
    instrument: "Piano Solo",
    difficulty: "Advanced",
    dateUploaded: "12/15/2025",
    views: "1900",
    image: "https://images.unsplash.com/photo-1415201374777-01918182b7ff?auto=format&fit=crop&q=80&w=400",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
];

const TrackWaveform = React.memo(({ 
  audioUrl, 
  isPlaying, 
  isMuted, 
  currentTime, 
  duration,
  onSeek
}: { 
  audioUrl: string; 
  isPlaying: boolean; 
  isMuted: boolean; 
  currentTime: number; 
  duration: number;
  onSeek?: (time: number) => void;
}) => {
  const [peaks, setPeaks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchAndProcessAudio = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const channelData = audioBuffer.getChannelData(0);
        const numBars = 100;
        const samplesPerPixel = Math.floor(channelData.length / numBars);
        const extractedPeaks = [];
        
        for (let i = 0; i < numBars; i++) {
          const start = i * samplesPerPixel;
          const end = start + samplesPerPixel;
          let max = 0;
          for (let j = start; j < end; j++) {
            const abs = Math.abs(channelData[j]);
            if (abs > max) max = abs;
          }
          extractedPeaks.push(max);
        }
        
        const maxPeak = Math.max(...extractedPeaks);
        const normalizationFactor = Math.max(maxPeak, 0.1); 
        const normalizedPeaks = extractedPeaks.map(p => p / normalizationFactor);
        
        setPeaks(normalizedPeaks);
        setIsLoading(false);
        await audioContext.close();
      } catch (error) {
        console.error("Error generating waveform:", error);
        const fallbackPeaks = Array.from({ length: 100 }, () => 0.2 + Math.random() * 0.8);
        setPeaks(fallbackPeaks);
        setIsLoading(false);
      }
    };

    if (audioUrl) {
      fetchAndProcessAudio();
    }
  }, [audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = 48 * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `48px`;
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || peaks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const barSpacing = width / peaks.length;
      const progress = duration > 0 ? currentTime / duration : 0;
      
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      
      peaks.forEach((peak, i) => {
        const x = Math.floor(i * barSpacing);
        const nextX = Math.floor((i + 1) * barSpacing);
        const barWidth = Math.max(1, nextX - x - 1);
        
        const isPlayed = (i / peaks.length) < progress;
        const barHeight = Math.max(2, peak * height * 0.85);
        const y = (height - barHeight) / 2;
        
        ctx.fillStyle = isPlayed ? '#10b981' : '#3f3f46';
        const radius = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      });

      const playheadX = Math.round(progress * width);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    };

    draw();
  }, [peaks, isPlaying, isMuted, currentTime, duration]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || !canvasRef.current || duration <= 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekProgress = x / rect.width;
    onSeek(seekProgress * duration);
  };

  if (isLoading) {
    return (
      <div className="w-full h-12 flex items-center justify-center gap-1">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ height: [4, 24, 4] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
            className="w-1 bg-emerald-500/30 rounded-full"
          />
        ))}
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      onClick={handleClick}
      className="w-full h-12 cursor-pointer"
    />
  );
});

const getInstrumentIcon = (instrument: string | undefined) => {
  if (!instrument) return <Music className="w-7 h-7 text-emerald-500" />;
  const lower = instrument.toLowerCase();
  if (lower.includes('guitar') || lower.includes('bass') || lower.includes('fingerstyle')) return <Guitar className="w-7 h-7 text-emerald-500" />;
  if (lower.includes('drum')) return <Drum className="w-7 h-7 text-emerald-500" />;
  if (lower.includes('vocal')) return <Mic2 className="w-7 h-7 text-emerald-500" />;
  if (lower.includes('piano')) return <Piano className="w-7 h-7 text-emerald-500" />;
  return <Music className="w-7 h-7 text-emerald-500" />;
};

const getDifficultyColor = (difficulty: string | undefined) => {
  if (!difficulty) return 'text-zinc-400';
  switch (difficulty.toLowerCase()) {
    case 'beginner': return 'text-emerald-500';
    case 'easy': return 'text-[#7fff00]';
    case 'intermediate': return 'text-yellow-400';
    case 'advanced': return 'text-orange-500';
    case 'expert': return 'text-red-600';
    default: return 'text-zinc-400';
  }
};

const DifficultyGauge = ({ difficulty, className = "w-5 h-5" }: { difficulty: string | undefined, className?: string }) => {
  if (!difficulty) return <div className={`rounded-full border-2 border-zinc-700 ${className}`} />;
  const diff = difficulty.toLowerCase();
  
  let rotation = -90; // 9 o'clock
  let color = "#9ca3af"; // gray-400
  let arcEnd = "20 100";
  
  if (diff === 'easy') {
    rotation = -45; // 10:30 o'clock
    color = "#7fff00"; // chartreuse
    arcEnd = "43.43 43.43";
  } else if (diff === 'intermediate') {
    rotation = 0; // 12 o'clock
    color = "#facc15"; // yellow-400
    arcEnd = "100 20";
  } else if (diff === 'advanced') {
    rotation = 45; // 1:30 o'clock
    color = "#f97316"; // orange-500
    arcEnd = "156.57 43.43";
  } else if (diff === 'expert') {
    rotation = 90; // 3 o'clock
    color = "#dc2626"; // red-600
    arcEnd = "180 100";
  }

  return (
    <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Arc */}
      <path 
        d="M20 100 A 80 80 0 0 1 180 100" 
        stroke="currentColor" 
        strokeWidth="24" 
        strokeLinecap="round" 
        className="text-zinc-200 dark:text-zinc-700"
      />
      {/* Active Arc */}
      <path 
        d={`M20 100 A 80 80 0 0 1 ${arcEnd}`}
        stroke={color} 
        strokeWidth="24" 
        strokeLinecap="round" 
      />
      {/* Needle */}
      <g transform={`rotate(${rotation}, 100, 100)`}>
        <path d="M100 100 L100 25" stroke="#9ca3af" strokeWidth="10" strokeLinecap="round" />
        <circle cx="100" cy="100" r="15" fill="#9ca3af" />
        <circle cx="100" cy="100" r="7" fill="white" />
      </g>
    </svg>
  );
};

const incrementViewCount = async (perf: any) => {
  if (!perf?.id) return;
  try {
    const perfRef = doc(db, 'performances', perf.id);
    await updateDoc(perfRef, { views: increment(1) });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `performances/${perf.id}`);
  }
};

const Logo = ({ className = "w-14 h-14" }: { className?: string }) => {
  const [logoUrl, setLogoUrl] = useState<string>('https://pixabay.com/images/download/u_op8btczor7-green-10179478_1280.png');

  useEffect(() => {
    const savedLogo = localStorage.getItem('app_logo');
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

  useEffect(() => {
    const handleGlobalUpdate = (e: any) => {
      setLogoUrl(e.detail);
    };
    window.addEventListener('logoUpdated', handleGlobalUpdate);
    return () => window.removeEventListener('logoUpdated', handleGlobalUpdate);
  }, []);

  return (
    <div className={`relative group ${className}`}>
      <img 
        src={logoUrl} 
        alt="Logo" 
        className="w-full h-full object-contain rounded-lg" 
        referrerPolicy="no-referrer" 
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, login, logout } = useContext(AuthContext);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-zinc-400 p-2 -ml-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <Logo className="w-14 h-14" />
              <span className="hidden sm:block text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#42ae66] via-white to-[#42ae66] bg-[length:200%_auto] animate-[shine_3s_linear_infinite]">Instrumuzicover</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-emerald-400 electric-card' : 'text-zinc-400 hover:text-emerald-400'}`}>Home</Link>
              <Link to="/performance" className={`text-sm font-medium transition-colors ${location.pathname === '/performance' ? 'text-emerald-400 electric-card' : 'text-zinc-400 hover:text-emerald-400'}`}>Performance</Link>
              <Link to="/playlist" className={`text-sm font-medium transition-colors ${location.pathname === '/playlist' ? 'text-emerald-400 electric-card' : 'text-zinc-400 hover:text-emerald-400'}`}>Playlist</Link>
              {isAdmin && (
                <Link to="/media" className={`text-sm font-medium transition-colors ${location.pathname === '/media' ? 'text-emerald-400 electric-card' : 'text-zinc-400 hover:text-emerald-400'}`}>Media</Link>
              )}
              <Link to="/products" className={`text-sm font-medium transition-colors ${location.pathname === '/products' ? 'text-emerald-400 electric-card' : 'text-zinc-400 hover:text-emerald-400'}`}>Product</Link>
              <Link to="/contact" className={`text-sm font-medium transition-colors ${location.pathname === '/contact' ? 'text-emerald-400 electric-card' : 'text-zinc-400 hover:text-emerald-400'}`}>Contact</Link>
              <Link to="/about" className={`text-sm font-medium transition-colors ${location.pathname === '/about' ? 'text-emerald-400 electric-card' : 'text-zinc-400 hover:text-emerald-400'}`}>About</Link>
            </div>
            {user ? (
              <div className="flex items-center gap-4">
                {!isAdmin && (
                  <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
                    ) : (
                      <User className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="text-xs font-bold text-white truncate max-w-[100px]">{user.displayName || 'User'}</span>
                  </div>
                )}
                {isAdmin && (
                  <button className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700 text-white hover:bg-zinc-700 transition-colors">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold">Admin</span>
                  </button>
                )}
                <button 
                  onClick={logout}
                  className="text-zinc-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="hover:opacity-80 transition-opacity flex items-center justify-center"
              >
                <img 
                  src="data:image/png;base64,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" 
                  alt="Login" 
                  className="h-10 w-auto object-contain"
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-zinc-900 border-b border-zinc-800 px-4 pt-2 pb-6 flex flex-col gap-4"
        >
          <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-400">Home</Link>
          <Link to="/performance" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-400">Performance</Link>
          <Link to="/playlist" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-400">Playlist</Link>
          {isAdmin && (
            <Link to="/media" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-400">Media</Link>
          )}
          <Link to="/products" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-400">Product</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-400">Contact</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-400">About</Link>
          {user ? (
            <div className="flex flex-col gap-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-3">
                {user.photoURL && <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />}
                <div>
                  <p className="text-white font-bold">{user.displayName}</p>
                  <p className="text-zinc-500 text-sm">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={() => { logout(); setIsOpen(false); }}
                className="flex items-center gap-2 text-red-500 font-bold"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { login(); setIsOpen(false); }}
              className="hover:opacity-80 transition-opacity flex items-center justify-center py-2"
            >
              <img 
                src="data:image/png;base64,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" 
                alt="Login" 
                className="h-10 w-auto object-contain"
              />
            </button>
          )}
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-24 overflow-hidden bg-white dark:bg-black transition-colors duration-300">
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/50 dark:bg-emerald-900/10 rounded-l-[100px] transform translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-60 transform -translate-x-1/2 translate-y-1/2" />
    </div>
    
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
            Elevating <span className="text-emerald-600 dark:text-emerald-400">Music Production</span> Skills
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10 max-w-md mx-auto leading-relaxed">
            Explore high-quality virtual instruments and professional music sheets designed to capture the sound of creativity.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://pixabay.com/images/download/u_op8btczor7-green-10179478_1280.png" 
              alt="Music Studio" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const FeaturedProducts = () => {
  const products = [
    { title: "Grand Piano VST", type: "Virtual Instrument", price: "$49", image: "https://images.unsplash.com/photo-1520522186724-284e1ee1e67e?auto=format&fit=crop&q=80&w=400" },
    { title: "Symphonic Strings", type: "Virtual Instrument", price: "$79", image: "https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?auto=format&fit=crop&q=80&w=400" },
    { title: "Modern Pop Sheets", type: "Music Sheets", price: "$15", image: "https://images.unsplash.com/photo-1507838596018-bd74d6bbacb3?auto=format&fit=crop&q=80&w=400" },
    { title: "Vintage Synth Pack", type: "Sample Pack", price: "$29", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=400" },
  ];

  return (
    <section id="products" className="py-16 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Featured Products</h2>
            <p className="text-zinc-600 dark:text-zinc-400">Curated tools for modern composers and producers.</p>
          </div>
          <button className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -8 }}
              className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-700 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-6">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">{product.type}</p>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">{product.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-zinc-900 dark:text-white">{product.price}</span>
                  <button className="p-2 bg-zinc-900 dark:bg-emerald-600 text-white rounded-lg hover:bg-zinc-800 dark:hover:bg-emerald-700 transition-colors">
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => (
  <section id="about" className="py-16 bg-white dark:bg-black transition-colors duration-300">
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-16 items-center">
        <div className="relative order-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=400" alt="Studio" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
              <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400" alt="Microphone" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
            </div>
            <div className="pt-8 space-y-4">
              <img src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=400" alt="Piano" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
              <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400" alt="DJ" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-50" />
        </div>
        
        <div className="order-1 text-center flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#42ae66] via-white to-[#42ae66] bg-[length:200%_auto] animate-[shine_3s_linear_infinite] mb-8 tracking-tight">About Instrumuzicover</h2>
          <div className="space-y-6 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p>
              I specialize in reimagining iconic tracks and modern hits through the power of virtual instruments. My goal is to explore the intersection of technology and artistry, delivering high-quality digital performances that breathe new life into your favorite music.
            </p>
            <p>
              Your support is the engine behind this channel. Every subscriber provides the motivation I need to push the boundaries of digital production and increase my upload frequency. By joining this community, you are directly fueling the creation of more immersive, virtual music covers. Click the youtube button and subscribe to the channel!
            </p>
          </div>
          <a 
            href="https://www.youtube.com/@instrumuzicover" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-8 transition-transform hover:scale-110 active:scale-95 inline-block"
            aria-label="Subscribe on YouTube"
          >
            <img 
              src="https://pixabay.com/images/download/u_op8btczor7-youtube-10181647_1920.png" 
              alt="YouTube Subscribe" 
              className="w-[115px] h-[115px] object-contain drop-shadow-lg"
              referrerPolicy="no-referrer"
            />
          </a>
        </div>
      </div>
    </div>
  </section>
);

const Contact = () => (
  <section id="contact" className="py-16 bg-white dark:bg-black transition-colors duration-300">
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-emerald-600 dark:bg-emerald-700 rounded-[40px] p-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-8 tracking-tight leading-tight">Ready to transform your sound?</h2>
            <p className="text-emerald-100 text-lg mb-12 max-w-md">
              Get in touch with us for custom requests, support, or collaboration opportunities.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-emerald-200">Email us at</p>
                  <p className="font-bold">hello@instrumuzicover.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-emerald-200">Follow our journey</p>
                  <div className="flex gap-4 mt-1">
                    <Instagram className="w-5 h-5 cursor-pointer hover:text-emerald-200 transition-colors" />
                    <Twitter className="w-5 h-5 cursor-pointer hover:text-emerald-200 transition-colors" />
                    <a href="https://www.youtube.com/@dylanchrey" target="_blank" rel="noopener noreferrer">
                      <Youtube className="w-5 h-5 cursor-pointer hover:text-emerald-200 transition-colors" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 text-zinc-900 dark:text-white shadow-2xl">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">First Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all" placeholder="John" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">Email Address</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all" placeholder="john@example.com" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all resize-none" placeholder="How can we help?"></textarea>
              </div>
              <button className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => {
  const { isAdmin } = useContext(AuthContext);
  
  return (
  <footer className="bg-white dark:bg-black border-t border-zinc-100 dark:border-zinc-800 pt-20 pb-10 transition-colors duration-300">
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Logo className="w-14 h-14" />
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Instrumuzicover</span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8">
            The ultimate destination for virtual instruments and music sheets. Elevate your production with professional tools.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer">
              <Instagram className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer">
              <Twitter className="w-5 h-5" />
            </div>
            <a 
              href="https://www.youtube.com/@dylanchrey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-zinc-900 dark:text-white mb-6">Quick Links</h4>
          <ul className="space-y-4 text-zinc-500 dark:text-zinc-400">
            <li><Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Home</Link></li>
            <li><Link to="/performance" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Performance</Link></li>
            <li><Link to="/playlist" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Playlist</Link></li>
            {isAdmin && (
              <li><Link to="/media" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Media</Link></li>
            )}
            <li><Link to="/products" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Product</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Contact</Link></li>
            <li><Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-zinc-900 dark:text-white mb-6">Newsletter</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Subscribe to get updates on new releases and offers.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email" className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-emerald-600 dark:text-white" />
            <button className="bg-zinc-900 dark:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Join</button>
          </div>
        </div>
      </div>
      
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8 flex flex-row justify-between items-center gap-4 text-sm text-zinc-400">
        <p>© 2026 Instrumuzicover. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-400">Privacy Policy</a>
          <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-400">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
  );
};

const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <>
      <Hero />
      <NewPerformanceSection />
    </>
  );
};

const ProductsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20">
      <FeaturedProducts />
    </div>
  );
};

const ContactPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20">
      <Contact />
    </div>
  );
};

const NewPerformanceSection = () => {
  const [latestPerformance, setLatestPerformance] = useState<any>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [performances, setPerformances] = useState<any[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState<any>(null);
  const [deletingPerformance, setDeletingPerformance] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { user, isAdmin } = useContext(AuthContext);

  useEffect(() => {
    const q = query(collection(db, 'performances'), orderBy('dateUploaded', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setLatestPerformance(data[0]);
        setPerformances(data);
      } else {
        setLatestPerformance(null);
        setPerformances([]);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'performances'));
    return () => unsubscribe();
  }, []);

  const handleUpload = async (newVideo: any) => {
    if (!isAdmin) return;
    try {
      const perfRef = doc(collection(db, 'performances'));
      await setDoc(perfRef, {
        ...newVideo,
        userId: user?.uid,
        dateUploaded: new Date().toISOString(),
        views: 0
      });
      setIsUploadModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'performances');
    }
  };

  if (!latestPerformance) return null;

  return (
    <section className="pt-8 pb-16 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">New Performance</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">Check out the latest performance uploaded by our community.</p>
          </div>
        </div>

        <div className="flex flex-col items-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer shadow-2xl mb-8"
            onClick={() => setSelectedVideoIndex(0)}
          >
            <img src={latestPerformance.image} alt={latestPerformance.title} className="w-full h-full object-cover transition-transform duration-500" referrerPolicy="no-referrer" />
            
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <Play className="w-10 h-10 ml-2" />
              </div>
            </div>
            
            {/* Views - Bottom Left */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1 text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              <Eye className="w-4 h-4" />
              {latestPerformance.views} views
            </div>
 
            {/* Date - Bottom Right */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              <Calendar className="w-4 h-4" />
              {(() => {
                const d = new Date(latestPerformance.dateUploaded);
                return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
              })()}
            </div>
          </motion.div>
 
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center"
          >
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{latestPerformance.title}</h3>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-2">by {latestPerformance.artist}</p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <span className="text-emerald-500">{getInstrumentIcon(latestPerformance.instrument)}</span>
                {latestPerformance.instrument}
              </div>
              <div className={`flex items-center gap-2 text-sm font-bold ${getDifficultyColor(latestPerformance.difficulty)}`}>
                <DifficultyGauge difficulty={latestPerformance.difficulty} className="w-5 h-5" />
                {latestPerformance.difficulty}
              </div>
            </div>
 
            <button 
              onClick={() => {
                if (latestPerformance.youtubeUrl) {
                  window.open(latestPerformance.youtubeUrl, '_blank');
                } else {
                  setSelectedVideoIndex(0);
                }
              }}
              className="group transition-all active:scale-95 cursor-pointer"
            >
              <img 
                src="https://files.catbox.moe/r4knqu.png" 
                alt="Watch on Youtube" 
                className="w-48 h-auto block group-hover:hidden" 
                referrerPolicy="no-referrer"
              />
              <img 
                src="https://files.catbox.moe/nbdl3a.png" 
                alt="Watch on Youtube" 
                className="w-48 h-auto hidden group-hover:block" 
                referrerPolicy="no-referrer"
              />
            </button>
          </motion.div>
        </div>

        <Link to="/performance" className="hidden mt-8 flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
          View All Performances <ArrowRight className="w-4 h-4" />
        </Link>

        {/* New Sections: Latest and Popular */}
        <div className="mt-20 flex flex-col gap-12">
          {/* Latest Performances */}
          <div className="flex flex-col items-center">
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Latest Performances</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {performances.slice(1, 4).map((perf, idx) => (
                <motion.div 
                  key={perf.id}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedVideoIndex(performances.indexOf(perf))}
                  className="group cursor-pointer"
                >
                  <div className="aspect-video rounded-xl overflow-hidden relative mb-1 shadow-md">
                    <img src={perf.image} alt={perf.title} className="w-full h-full object-cover group-hover:scale-105" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center pt-1">
                    <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 line-clamp-1">{perf.title}</h4>
                    <div className="flex items-center justify-center gap-2 text-zinc-600 dark:text-zinc-400 text-base mb-2">
                      <User className="w-5 h-5" />
                      <span>{perf.artist}</span>
                    </div>
                    <div className="flex justify-center gap-2">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-500">
                        {getInstrumentIcon(perf.instrument)}
                        {perf.instrument}
                      </div>
                      <div className={`flex items-center gap-1.5 text-sm font-bold ${getDifficultyColor(perf.difficulty)}`}>
                        <DifficultyGauge difficulty={perf.difficulty} className="w-4 h-4" />
                        {perf.difficulty}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Popular Performances */}
          <div className="flex flex-col items-center">
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Popular</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {[...performances].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3).map((perf, idx) => (
                <motion.div 
                  key={perf.id}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedVideoIndex(performances.indexOf(perf))}
                  className="group cursor-pointer"
                >
                  <div className="aspect-video rounded-xl overflow-hidden relative mb-1 shadow-md">
                    <img src={perf.image} alt={perf.title} className="w-full h-full object-cover group-hover:scale-105" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {perf.views || 0}
                    </div>
                  </div>
                  <div className="text-center pt-1">
                    <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 line-clamp-1">{perf.title}</h4>
                    <div className="flex items-center justify-center gap-2 text-zinc-600 dark:text-zinc-400 text-base mb-2">
                      <User className="w-5 h-5" />
                      <span>{perf.artist}</span>
                    </div>
                    <div className="flex justify-center gap-2">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-500">
                        {getInstrumentIcon(perf.instrument)}
                        {perf.instrument}
                      </div>
                      <div className={`flex items-center gap-1.5 text-sm font-bold ${getDifficultyColor(perf.difficulty)}`}>
                        <DifficultyGauge difficulty={perf.difficulty} className="w-4 h-4" />
                        {perf.difficulty}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedVideoIndex !== null && (
        <VideoPlayerModal 
          videos={performances} 
          initialIndex={selectedVideoIndex} 
          onClose={() => setSelectedVideoIndex(null)} 
          onView={incrementViewCount}
        />
      )}
      {isUploadModalOpen && <UploadModal onUpload={handleUpload} onClose={() => setIsUploadModalOpen(false)} />}
      {editingPerformance && (
        <EditPerformanceModal 
          performance={editingPerformance} 
          onSave={async (updated) => {
            try {
              const { id, ...data } = updated;
              const perfRef = doc(db, 'performances', id);
              await updateDoc(perfRef, data);
              setEditingPerformance(null);
            } catch (error) {
              handleFirestoreError(error, OperationType.UPDATE, `performances/${editingPerformance.id}`);
            }
          }} 
          onClose={() => setEditingPerformance(null)} 
        />
      )}
      {deletingPerformance && (
        <DeleteConfirmationModal 
          performance={deletingPerformance} 
          onConfirm={async () => {
            try {
              const perfRef = doc(db, 'performances', deletingPerformance.id);
              await deleteDoc(perfRef);
              setDeletingPerformance(null);
            } catch (error) {
              handleFirestoreError(error, OperationType.DELETE, `performances/${deletingPerformance.id}`);
            }
          }} 
          onClose={() => setDeletingPerformance(null)} 
        />
      )}
    </section>
  );
};

const TrackRow = React.memo(({ 
  track, 
  isPlaying, 
  isMuted, 
  currentTime, 
  duration, 
  onSeek, 
  onSolo, 
  onMute, 
  onVolumeChange,
  isSoloed,
  volume
}: { 
  track: any, 
  isPlaying: boolean, 
  isMuted: boolean, 
  currentTime: number, 
  duration: number, 
  onSeek: (time: number) => void,
  onSolo: () => void,
  onMute: () => void,
  onVolumeChange: (vol: number) => void,
  isSoloed: boolean,
  volume: number
}) => {
  return (
    <div className="flex items-center gap-4 py-1 px-4 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/20 rounded-lg transition-colors">
      <div className="-ml-2">
        {getInstrumentIcon(track.instrument || track.title || '')}
      </div>
      <div className="flex flex-col truncate w-40 flex-none ml-2">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {track.instrument || track.title || 'Track'}
        </span>
        <span className={`text-xs font-bold ${getDifficultyColor(track.difficulty)}`}>
          {track.difficulty ? track.difficulty.charAt(0).toUpperCase() + track.difficulty.slice(1) : 'Unknown'}
        </span>
      </div>
      <div className="flex-1 min-w-[120px] ml-1 mr-4">
        {track.url && (
          <TrackWaveform 
            audioUrl={track.url}
            isPlaying={isPlaying}
            isMuted={isMuted}
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
          />
        )}
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onSolo}
          className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
            isSoloed
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600'
          }`}
          title="Solo this track"
        >
          S
        </button>
        <button 
          onClick={onMute}
          className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
            isMuted
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600'
          }`}
          title="Mute this track"
        >
          M
        </button>
        <input 
          type="range" 
          min="0" max="1" step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-20 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
});

const PlaylistPage = () => {
  const { isAdmin } = useContext(AuthContext);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [playlistGroups, setPlaylistGroups] = useState<any[]>([]);
  const [allAudio, setAllAudio] = useState<any[]>([]);

  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [trackVolumes, setTrackVolumes] = useState<Record<string, number>>({});
  const [trackMutes, setTrackMutes] = useState<Record<string, boolean>>({});
  const [soloedTracks, setSoloedTracks] = useState<Record<string, boolean>>({});
  const [isSpamAlertOpen, setIsSpamAlertOpen] = useState(false);

  const spamCounter = useRef<{ count: number, lastTime: number }>({ count: 0, lastTime: 0 });

  const isAnySoloed = React.useMemo(() => Object.values(soloedTracks).some(v => v), [soloedTracks]);

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    setProgress(0);
    setDuration(0);
  }, [currentSongIndex]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const qGroups = query(collection(db, 'playlist_groups'));
    const unsubGroups = onSnapshot(qGroups, (snapshot) => {
      setPlaylistGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qAudio = query(collection(db, 'media'));
    const unsubAudio = onSnapshot(qAudio, (snapshot) => {
      const mediaData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const audioData = mediaData.filter((m: any) => m.type?.startsWith('audio/'));
      setAllAudio(audioData);
      setPlaylist(audioData.filter((m: any) => m.inPlaylist));
    });

    return () => { unsubGroups(); unsubAudio(); };
  }, []);

  const playbackQueue = React.useMemo(() => {
    const groups = playlistGroups.map(g => ({ ...g, isGroup: true }));
    const singles = playlist.map(t => ({ ...t, isGroup: false }));
    return [...groups, ...singles];
  }, [playlistGroups, playlist]);

  const currentItem = currentSongIndex !== null ? playbackQueue[currentSongIndex] : null;

  const currentTracks = React.useMemo(() => {
    if (!currentItem) return [];
    if (currentItem.isGroup) {
      return allAudio.filter(m =>
        m.title?.toLowerCase() === currentItem.title?.toLowerCase() &&
        m.artist?.toLowerCase() === currentItem.artist?.toLowerCase()
      );
    } else {
      return [currentItem];
    }
  }, [currentItem, allAudio]);

  // Play/Pause Sync
  useEffect(() => {
    if (!currentItem || currentTracks.length === 0) return;
    
    if (isPlaying) {
      // Use the primary track's time or current progress as the sync point
      const primaryAudio = audioRefs.current[currentTracks[0].id];
      const syncTime = primaryAudio ? primaryAudio.currentTime : progress;
      
      currentTracks.forEach(track => {
        const audio = audioRefs.current[track.id];
        if (audio) {
          audio.currentTime = syncTime;
          audio.play().catch(e => console.error("Autoplay failed:", e));
        }
      });
    } else {
      currentTracks.forEach(track => {
        const audio = audioRefs.current[track.id];
        if (audio) {
          audio.pause();
        }
      });
    }
  }, [isPlaying, currentItem, currentTracks]);

  // Volume/Mute Sync
  useEffect(() => {
    if (!currentItem) return;
    
    // Get primary time for syncing unmuted tracks
    const primaryAudio = audioRefs.current[currentTracks[0]?.id];
    const syncTime = primaryAudio ? primaryAudio.currentTime : progress;

    currentTracks.forEach(track => {
      const audio = audioRefs.current[track.id];
      if (audio) {
        const masterVol = isMuted ? 0 : volume;
        const isMutedManually = trackMutes[track.id] || false;
        const isSoloed = soloedTracks[track.id] || false;
        
        // If any track is soloed, only soloed tracks are audible.
        // If no tracks are soloed, all tracks are audible (unless manually muted).
        const isAudible = !isMutedManually && (isAnySoloed ? isSoloed : true);
        
        const trackVol = trackVolumes[track.id] !== undefined ? trackVolumes[track.id] : (track.defaultVolume !== undefined ? track.defaultVolume : 1);
        const targetVol = isAudible ? (masterVol * trackVol) : 0;
        
        // Only update if values actually changed to prevent audio engine stress
        const targetMuted = targetVol === 0;
        if (audio.muted !== targetMuted) {
          audio.muted = targetMuted;
        }
        if (Math.abs(audio.volume - targetVol) > 0.01) {
          audio.volume = targetVol;
        }
      }
    });
  }, [volume, isMuted, trackVolumes, trackMutes, soloedTracks, currentItem, currentTracks, isAnySoloed]);

  // Robust Multi-track Synchronization
  useEffect(() => {
    if (!isPlaying || currentTracks.length <= 1) return;

    let animationId: number;
    // Initialize to current time to prevent immediate sync on effect restart (e.g. when toggling solo/mute)
    let lastSyncTime = performance.now();

    const sync = (now: number) => {
      // Check sync every 1500ms to minimize seeking interruptions
      // Seeking is the primary cause of "static" or "clicks"
      if (now - lastSyncTime < 1500) {
        animationId = requestAnimationFrame(sync);
        return;
      }
      lastSyncTime = now;

      const primaryTrack = currentTracks[0];
      const primaryAudio = audioRefs.current[primaryTrack.id];
      if (!primaryAudio || primaryAudio.paused) {
        animationId = requestAnimationFrame(sync);
        return;
      }

      const primaryTime = primaryAudio.currentTime;
      
      currentTracks.slice(1).forEach(track => {
        const audio = audioRefs.current[track.id];
        if (audio && !audio.seeking && !audio.paused) {
          // Only sync audible tracks to prevent background seeking glitches
          const isMutedManually = trackMutes[track.id] || false;
          const isSoloed = soloedTracks[track.id] || false;
          const isAudible = !isMutedManually && (isAnySoloed ? isSoloed : true);
          
          if (!isAudible) return;

          const drift = Math.abs(audio.currentTime - primaryTime);
          // Relaxed threshold (200ms) for better stability and less static
          if (drift > 0.2) {
            audio.currentTime = primaryTime;
          }
        }
      });
      animationId = requestAnimationFrame(sync);
    };

    animationId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, currentTracks, trackMutes, soloedTracks, isAnySoloed]);

  const handlePlayPause = () => {
    if (currentSongIndex === null && playbackQueue.length > 0) {
      setCurrentSongIndex(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentSongIndex !== null && currentSongIndex < playbackQueue.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setIsPlaying(true);
    } else {
      // End of playlist: stop
      setIsPlaying(false);
      setProgress(0);
      currentTracks.forEach(track => {
        const audio = audioRefs.current[track.id];
        if (audio) {
          audio.currentTime = 0;
          audio.pause();
        }
      });
    }
  };

  const handlePrev = () => {
    if (currentSongIndex !== null && currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
      setIsPlaying(true);
    } else if (playbackQueue.length > 0) {
      setCurrentSongIndex(playbackQueue.length - 1);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    // Throttle progress updates to ~10Hz (100ms) to reduce React re-renders
    // This significantly improves performance when many tracks are expanded
    const now = Date.now();
    if ((window as any)._lastProgressUpdate && now - (window as any)._lastProgressUpdate < 100) {
      return;
    }
    (window as any)._lastProgressUpdate = now;
    
    setProgress(audio.currentTime);
    setDuration(audio.duration || 0);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setProgress(newTime);
    currentTracks.forEach(track => {
      const audio = audioRefs.current[track.id];
      if (audio) {
        audio.currentTime = newTime;
      }
    });
  };

  const handleTimeUpdateRef = useRef(handleTimeUpdate);
  handleTimeUpdateRef.current = handleTimeUpdate;

  const handleNextRef = useRef(handleNext);
  handleNextRef.current = handleNext;

  // Cleanup old tracks when currentTracks changes
  useEffect(() => {
    const currentTrackIds = new Set(currentTracks.map(t => t.id));
    Object.keys(audioRefs.current).forEach(id => {
      if (!currentTrackIds.has(id)) {
        const audio = audioRefs.current[id];
        if (audio) {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
        }
        delete audioRefs.current[id];
      }
    });
  }, [currentTracks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((audio: any) => {
        if (audio) {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
        }
      });
      audioRefs.current = {};
    };
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddGroup = async () => {
    if (!isAdmin || !newSongTitle || !newSongArtist) return;
    try {
      await addDoc(collection(db, 'playlist_groups'), {
        title: newSongTitle,
        artist: newSongArtist,
        userId: auth.currentUser?.uid || 'anonymous',
        createdAt: new Date().toISOString()
      });
      setIsAddModalOpen(false);
      setNewSongTitle('');
      setNewSongArtist('');
    } catch (error) {
      console.error("Error adding group:", error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checkSpam = () => {
    const now = Date.now();
    if (now - spamCounter.current.lastTime < 1000) {
      spamCounter.current.count += 1;
    } else {
      spamCounter.current.count = 1;
    }
    spamCounter.current.lastTime = now;

    if (spamCounter.current.count >= 6) {
      setIsPlaying(false);
      setIsSpamAlertOpen(true);
      spamCounter.current.count = 0;
      return true;
    }
    return false;
  };

  const toggleTrackMute = (id: string) => {
    if (checkSpam()) return;
    setTrackMutes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTrackSolo = (id: string) => {
    if (checkSpam()) return;
    setSoloedTracks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setTrackVolume = (id: string, vol: number) => {
    setTrackVolumes(prev => ({ ...prev, [id]: vol }));
  };

  const saveDefaultVolume = async (trackId: string, vol: number) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'media', trackId), { defaultVolume: vol });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `media/${trackId}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-32 transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
              <ListMusic className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Playlist</h1>
              <p className="text-zinc-600 dark:text-zinc-400">Your curated collection of tracks</p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Song</span>
            </button>
          )}
        </div>

        {playbackQueue.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <ListMusic className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Your playlist is empty</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Add songs from the Media page{isAdmin ? ' or create a new song group' : ''}.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {playbackQueue.map((item, index) => {
                const isPlayingThis = currentSongIndex === index;

                if (item.isGroup) {
                  const tracks = allAudio.filter(m => m.title?.toLowerCase() === item.title?.toLowerCase() && m.artist?.toLowerCase() === item.artist?.toLowerCase());
                  const isExpanded = expandedGroups[item.id];

                  return (
                    <div key={`group-${item.id}`} className="flex flex-col">
                      <div 
                        onClick={() => { setCurrentSongIndex(index); setIsPlaying(true); }}
                        className={`flex items-center gap-4 p-4 px-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${isPlayingThis ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}`}
                      >
                        <div className="w-10 h-10 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center relative group">
                          {isPlayingThis && isPlaying ? (
                            <div className="flex gap-0.5 items-end h-4">
                              <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-emerald-500" />
                              <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-emerald-500" />
                              <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1 bg-emerald-500" />
                            </div>
                          ) : (
                            <Play className={`w-4 h-4 ${isPlayingThis ? 'text-emerald-500' : 'text-zinc-400 group-hover:text-emerald-500'} transition-colors ml-0.5`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isPlayingThis ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
                            {item.title}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                            {item.artist} • {tracks.length} tracks detected
                          </p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                          className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800/50 px-4 py-1">
                          {tracks.length === 0 ? (
                            <p className="text-sm text-zinc-500 py-2">No matching tracks found in Media.</p>
                          ) : (
                            tracks.map(track => (
                              <TrackRow
                                key={track.id}
                                track={track}
                                isPlaying={isPlaying && isPlayingThis}
                                isMuted={trackMutes[track.id] || (isAnySoloed && !soloedTracks[track.id])}
                                currentTime={isPlayingThis ? progress : 0}
                                duration={isPlayingThis ? duration : 0}
                                isSoloed={soloedTracks[track.id] || false}
                                volume={trackVolumes[track.id] !== undefined ? trackVolumes[track.id] : (track.defaultVolume !== undefined ? track.defaultVolume : 1)}
                                onSeek={(time) => {
                                  setProgress(time);
                                  currentTracks.forEach(t => {
                                    const audio = audioRefs.current[t.id];
                                    if (audio) audio.currentTime = time;
                                  });
                                }}
                                onSolo={() => toggleTrackSolo(track.id)}
                                onMute={() => toggleTrackMute(track.id)}
                                onVolumeChange={(vol) => setTrackVolume(track.id, vol)}
                              />
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div 
                      key={`single-${item.id}`}
                      onClick={() => { setCurrentSongIndex(index); setIsPlaying(true); }}
                      className={`flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${isPlayingThis ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}`}
                    >
                      <div className="w-10 h-10 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center relative group">
                        {isPlayingThis && isPlaying ? (
                          <div className="flex gap-0.5 items-end h-4">
                            <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-emerald-500" />
                            <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-emerald-500" />
                            <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1 bg-emerald-500" />
                          </div>
                        ) : (
                          <Play className={`w-4 h-4 ${isPlayingThis ? 'text-emerald-500' : 'text-zinc-400 group-hover:text-emerald-500'} transition-colors ml-0.5`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isPlayingThis ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
                          {item.title || item.url.split('/').pop()?.split('?')[0] || 'Unknown Title'}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                          {item.artist || 'Unknown Artist'} {item.instrument ? `• ${item.instrument}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Song Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Add New Song</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
              Enter the exact title and artist. Any audio files in the Media page with matching details will be automatically grouped here.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newSongTitle} 
                  onChange={e => setNewSongTitle(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition-colors dark:text-white"
                  placeholder="e.g. Bohemian Rhapsody"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Artist</label>
                <input 
                  type="text" 
                  value={newSongArtist} 
                  onChange={e => setNewSongArtist(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition-colors dark:text-white"
                  placeholder="e.g. Queen"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddGroup}
                disabled={!newSongTitle || !newSongArtist}
                className="px-5 py-2.5 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Song
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Music Player Bar */}
      <AnimatePresence>
        {currentItem && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 z-[100] px-4 py-3 sm:py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          >
            <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              {/* Song Info */}
              <div className="flex items-center gap-4 w-full sm:w-1/3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-zinc-900 dark:text-white truncate">{currentItem.title || 'Unknown Title'}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{currentItem.artist || 'Unknown Artist'}</p>
                </div>
              </div>

              {/* Controls & Progress */}
              <div className="flex-1 w-full flex flex-col items-center gap-2">
                <div className="flex items-center gap-6">
                  <button onClick={handlePrev} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handlePlayPause} 
                    className="w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button onClick={handleNext} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="w-full flex items-center gap-3 text-xs text-zinc-500 font-medium">
                  <span>{formatTime(progress)}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={progress} 
                    onChange={handleProgressChange}
                    className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                  />
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-3 w-1/3 justify-end">
                <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={isMuted ? 0 : volume} 
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    if (Number(e.target.value) > 0) setIsMuted(false);
                  }}
                  className="w-24 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                />
              </div>
            </div>
            
            {/* Hidden Audio Elements for Multitrack */}
            {currentTracks.map((track, idx) => (
              <audio 
                key={track.id}
                ref={el => {
                  if (el) {
                    audioRefs.current[track.id] = el;
                  }
                }}
                src={track.url} 
                onTimeUpdate={idx === 0 ? (e) => handleTimeUpdateRef.current(e) : undefined}
                onLoadedMetadata={idx === 0 ? (e) => handleTimeUpdateRef.current(e) : undefined}
                onEnded={idx === 0 ? () => handleNextRef.current() : undefined}
                preload="auto"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isSpamAlertOpen && <SpamAlertModal onClose={() => setIsSpamAlertOpen(false)} />}
    </div>
  );
};

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20">
      <About />
    </div>
  );
};

const SpamAlertModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-md w-full relative text-center" 
        onClick={e => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Playback Interrupted</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
          Rapidly toggling tracks can disrupt the synchronization. We've paused playback to ensure everything stays in time. Please wait a moment before resuming.
        </p>
        <button 
          onClick={onClose}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
        >
          Got it
        </button>
      </motion.div>
    </div>
  );
};

const EditPerformanceModal = ({ performance, onSave, onClose }: { performance: any, onSave: (updated: any) => void, onClose: () => void }) => {
  const [title, setTitle] = useState(performance.title);
  const [artist, setArtist] = useState(performance.artist);
  const [difficulty, setDifficulty] = useState(performance.difficulty);
  const [instrument, setInstrument] = useState(performance.instrument);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...performance, title, artist, difficulty, instrument });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Edit Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Artist</label>
            <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Instrument</label>
            <select value={instrument} onChange={(e) => setInstrument(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
              {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 mt-6">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ performance, onConfirm, onClose }: { performance: any, onConfirm: () => void, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Delete Performance</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">Are you sure you want to delete "{performance.title}"? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors font-medium">Delete</button>
        </div>
      </div>
    </div>
  );
};

const PerformanceSection = ({ externalSearchQuery, onExternalSearchChange }: { externalSearchQuery?: string, onExternalSearchChange?: (q: string) => void }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onExternalSearchChange || setInternalSearchQuery;
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPerformance, setEditingPerformance] = useState<any>(null);
  const [deletingPerformance, setDeletingPerformance] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { user, isAdmin, isAuthReady } = useContext(AuthContext);
  
  useEffect(() => {
    if (isAuthReady) {
      console.log("PerformanceSection Auth Ready:", { userEmail: user?.email, isAdmin });
    }
  }, [user, isAdmin, isAuthReady]);

  const itemsPerPage = 8;
  const [performances, setPerformances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'performances'), orderBy('dateUploaded', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setPerformances(data);
      setIsLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'performances'));
    return () => unsubscribe();
  }, []);

  const handleUpload = async (newVideo: any) => {
    if (!isAdmin) return;
    try {
      const perfRef = doc(collection(db, 'performances'));
      await setDoc(perfRef, {
        ...newVideo,
        userId: user?.uid,
        dateUploaded: new Date().toISOString(),
        views: 0
      });
      setSearchQuery(''); // Clear search to show new video
      setCurrentPage(1); // Reset to first page
      setIsUploadModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'performances');
    }
  };

  const handleView = React.useCallback(async (perf: any) => {
    await incrementViewCount(perf);
  }, []);

  const handleEditSave = async (updated: any) => {
    if (!isAdmin || !editingPerformance) return;
    try {
      const { id, ...data } = updated;
      const perfRef = doc(db, 'performances', id);
      await updateDoc(perfRef, data);
      setEditingPerformance(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `performances/${editingPerformance.id}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!isAdmin || !deletingPerformance) return;
    try {
      const perfRef = doc(db, 'performances', deletingPerformance.id);
      await deleteDoc(perfRef);
      setDeletingPerformance(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `performances/${deletingPerformance.id}`);
    }
  };

  const filteredPerformances = performances.filter((perf: any) => {
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = perf.title?.toLowerCase().includes(searchLower) || false;
    const artistMatch = perf.artist?.toLowerCase().includes(searchLower) || false;
    const instrumentMatch = searchLower === 'pianoexact' 
      ? perf.instrument?.toLowerCase() === 'piano'
      : perf.instrument?.toLowerCase().includes(searchLower) || false;
    
    // Special case for Guitar to include Fingerstyle
    const isGuitarSearch = searchLower === 'guitar';
    const isFingerstyle = perf.instrument?.toLowerCase().includes('fingerstyle') || false;
    
    return titleMatch || artistMatch || instrumentMatch || (isGuitarSearch && isFingerstyle);
  });

  const totalPages = Math.ceil(filteredPerformances.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPerformances = filteredPerformances.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="pt-8 pb-12 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row items-center justify-between gap-6 mb-12">
          <div className="md:flex-1 flex items-center justify-start">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Performances</h2>
          </div>
          
          <div className="w-[30%] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search performances, artists, or instruments..."
              value={searchQuery === 'PianoExact' ? 'Piano' : searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full pl-12 pr-6 py-3.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="md:flex-1 flex justify-end">
            {isAdmin ? (
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="transition-all hover:scale-105 hover:opacity-90 active:scale-95"
              >
                <img src="https://i.ibb.co/dshZr7GS/Upload.png" alt="Upload" className="h-12 w-auto" referrerPolicy="no-referrer" />
              </button>
            ) : (
              <div className="w-24 h-10" /> // Spacer to keep search centered
            )}
          </div>
        </div>
        
        <div className="relative px-12 sm:px-16 lg:px-20">
          {/* Floating Pagination Arrows */}
          {totalPages > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`absolute left-0 lg:left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl text-emerald-500 transition-all hover:scale-110 active:scale-95 ${
                  currentPage === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`absolute right-0 lg:right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl text-emerald-500 transition-all hover:scale-110 active:scale-95 ${
                  currentPage === totalPages ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedPerformances.map((perf: any, i: number) => (
              <motion.div 
                key={startIndex + i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                onClick={() => setSelectedVideoIndex(startIndex + i)}
                className="group relative cursor-pointer"
              >
                <div className="aspect-video rounded-2xl overflow-hidden relative mb-1">
                  <img src={perf.image} alt={perf.title} className="w-full h-full object-cover group-hover:scale-105" referrerPolicy="no-referrer" />
                  
                  {isAdmin && (
                    <div className="absolute top-2 right-2 z-30">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === perf.id ? null : perf.id);
                        }}
                        className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {openDropdownId === perf.id && (
                        <div 
                          className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-700 overflow-hidden"
                          onClick={e => e.stopPropagation()}
                        >
                          <button 
                            onClick={() => {
                              setEditingPerformance(perf);
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              setDeletingPerformance(perf);
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom Gradient Overlay for Text Visibility */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <Play className="w-8 h-8 ml-1" />
                    </div>
                  </div>
                  {/* Badges on Thumbnail */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    <Eye className="w-3 h-3" />
                    {perf.views}
                  </div>
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    <Calendar className="w-3 h-3" />
                    {(() => {
                      const d = new Date(perf.dateUploaded);
                      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                    })()}
                  </div>
                </div>
                <div className="pt-1 pb-4 px-2 flex flex-col items-center text-center">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 line-clamp-1">{perf.title}</h3>
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm mb-2">
                    <User className="w-4 h-4" />
                    <span>{perf.artist}</span>
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                      {getInstrumentIcon(perf.instrument)}
                      {perf.instrument}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${getDifficultyColor(perf.difficulty)}`}>
                      <DifficultyGauge difficulty={perf.difficulty} className="w-3.5 h-3.5" />
                      {perf.difficulty}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Page Indicator */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentPage === i + 1 ? 'w-8 bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      {isUploadModalOpen && <UploadModal onUpload={handleUpload} onClose={() => setIsUploadModalOpen(false)} />}
      {editingPerformance && (
        <EditPerformanceModal 
          performance={editingPerformance} 
          onSave={handleEditSave} 
          onClose={() => setEditingPerformance(null)} 
        />
      )}
      {deletingPerformance && (
        <DeleteConfirmationModal
          performance={deletingPerformance}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingPerformance(null)}
        />
      )}
      {selectedVideoIndex !== null && (
        <VideoPlayerModal 
          videos={filteredPerformances} 
          initialIndex={selectedVideoIndex} 
          onClose={() => setSelectedVideoIndex(null)} 
          onView={handleView}
        />
      )}
    </section>
  );
};

const VideoPlayerModal = ({ videos, initialIndex, onClose, onView }: { videos: any[], initialIndex: number, onClose: () => void, onView?: (perf: any) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showRelated, setShowRelated] = useState(false);
  const [activeVolumeBarUrl, setActiveVolumeBarUrl] = useState<string | null>(null);
  const [relatedView, setRelatedView] = useState<'versions' | 'media'>('versions');
  const [images, setImages] = useState<any[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [playingAudios, setPlayingAudios] = useState<string[]>([]);
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
  const playingAudiosRef = useRef<string[]>([]);
  const lastPlayingAudiosRef = useRef<string[]>([]);
  const playerRef = useRef<any>(null);
  const audiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const currentVideo = videos[currentIndex];

  useEffect(() => {
    playingAudiosRef.current = playingAudios;
  }, [playingAudios]);

  useEffect(() => {
    return () => {
      audiosRef.current.forEach(audio => {
        audio.pause();
        audio.src = "";
      });
      audiosRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'media'));
    return () => unsubscribe();
  }, []);
  const lastViewedIndex = React.useRef<number | null>(null);

  useEffect(() => {
    if (onView && currentVideo && lastViewedIndex.current !== currentIndex) {
      onView(currentVideo);
      lastViewedIndex.current = currentIndex;
    }
  }, [currentIndex, currentVideo, onView]);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(currentVideo.youtubeUrl);

  // Related videos: same title and artist, but different URL
  const relatedVideos = videos.filter(v => 
    v.title === currentVideo.title && 
    v.artist === currentVideo.artist
  );

  // Related media: same title and artist
  const relatedMedia = React.useMemo(() => images.filter(m => 
    m.title?.trim().toLowerCase() === currentVideo.title?.trim().toLowerCase() && 
    m.artist?.trim().toLowerCase() === currentVideo.artist?.trim().toLowerCase()
  ), [currentVideo, images]);

  const lastPlayerStateRef = useRef<number | null>(null);
  const lastSyncTimeRef = useRef<number>(0);

  // Pre-initialize all related audio tracks for the current video
  useEffect(() => {
    // Clear existing audios
    audiosRef.current.forEach(audio => {
      audio.pause();
      audio.src = "";
    });
    audiosRef.current.clear();
    lastPlayingAudiosRef.current = [];

    // Initialize new audios for this video
    relatedMedia.forEach(m => {
      if (m.type?.startsWith('audio/')) {
        const audio = new Audio(m.url);
        audio.preload = "auto";
        const shouldBeHeard = playingAudiosRef.current.includes(m.url);
        audio.muted = !shouldBeHeard;
        audiosRef.current.set(m.url, audio);
      }
    });

    // If video is already playing, start these audios
    if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
      const state = playerRef.current.getPlayerState();
      const time = playerRef.current.getCurrentTime();
      if (state === 1) {
        audiosRef.current.forEach(audio => {
          audio.currentTime = time;
          audio.play().catch(() => {});
        });
      }
    }

    return () => {
      audiosRef.current.forEach(audio => {
        audio.pause();
        audio.src = "";
      });
      audiosRef.current.clear();
    };
  }, [currentVideo, relatedMedia]);

  const muteRelatedAudio = () => {
    audiosRef.current.forEach(audio => {
      audio.muted = true;
      audio.volume = 0.0;
      audio.pause();
    });
    setPlayingAudios([]);
  };

  // Sync muted state when playingAudios changes
  useEffect(() => {
    audiosRef.current.forEach((audio, url) => {
      const shouldBeHeard = playingAudios.includes(url);
      
      if (shouldBeHeard) {
        if (audio.paused) {
          audio.currentTime = playerRef.current?.getCurrentTime() || 0;
          audio.play().catch(() => {});
        }
        audio.muted = false;
      } else {
        // Only pause, don't mute here, as muting is handled by muteRelatedAudio
        audio.pause();
      }
    });
  }, [playingAudios]);

  useEffect(() => {
    let player: any;
    const initPlayer = () => {
      if ((window as any).YT && (window as any).YT.Player && videoId) {
        player = new (window as any).YT.Player('youtube-player', {
          videoId: videoId,
          playerVars: {
            autoplay: 1, // Reverted to 1 for immediate start
            start: Math.floor(startTime),
            rel: 0,
            modestbranding: 1,
            mute: 0 // Explicitly unmuted
          },
          events: {
            onReady: (event: any) => {
              playerRef.current = event.target;
              event.target.playVideo();
              audiosRef.current.forEach((audio, url) => {
                if (playingAudiosRef.current.includes(url)) {
                  audio.play().catch(() => {});
                }
              });
            },
            onStateChange: (event: any) => {
              const playerState = event.data;
              if (playerState === lastPlayerStateRef.current) return;
              lastPlayerStateRef.current = playerState;

              const videoTime = event.target.getCurrentTime();
              
              if (playerState === 1) { // PLAYING
                // Restore buttons
                setPlayingAudios(lastPlayingAudiosRef.current);
                
                // Resume audios that were playing
                lastPlayingAudiosRef.current.forEach(url => {
                  const audio = audiosRef.current.get(url);
                  if (audio) {
                    audio.currentTime = videoTime;
                    if (audio.paused) {
                      audio.play().catch(() => {});
                    }
                  }
                });

                playerRef.current?.unMute();
              } else {
                // Save current playing audios
                lastPlayingAudiosRef.current = playingAudiosRef.current;
                
                // Pause all audios
                audiosRef.current.forEach((audio) => {
                  audio.pause();
                });
                // Turn off buttons
                setPlayingAudios([]); 
              }
            }
          }
        });
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      // Fallback if API not ready yet
      const checkYT = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          initPlayer();
          clearInterval(checkYT);
        }
      }, 100);
      return () => clearInterval(checkYT);
    }

    return () => {
      if (player && player.destroy) {
        player.destroy();
      }
    };
  }, [videoId]);

  // Sync audio with video drift
  useEffect(() => {
    if (!playerRef.current) return;

    let animationId: number;
    const sync = () => {
      if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
        const playerState = playerRef.current.getPlayerState();
        const videoTime = playerRef.current.getCurrentTime();

        if (playerState === 1) { // PLAYING
          audiosRef.current.forEach((audio) => {
            const drift = Math.abs(videoTime - audio.currentTime);
            // Tightened threshold to 0.02 seconds for 100% synchronization
            if (drift > 0.02) {
              audio.currentTime = videoTime;
            }
          });
        }
        
        // Check for unmute
        if (typeof playerRef.current.isMuted === 'function') {
          const isVideoMuted = playerRef.current.isMuted();
          if (!isVideoMuted && playingAudiosRef.current.length > 0) {
            muteRelatedAudio();
          }
        }
      }
      animationId = requestAnimationFrame(sync);
    };

    animationId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleVersionSwitch = (newIdx: number) => {
    if (playerRef.current && playerRef.current.getCurrentTime) {
      setStartTime(playerRef.current.getCurrentTime());
    }
    setCurrentIndex(newIdx);
    setShowRelated(false);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setStartTime(0); // Reset time for different performance
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < videos.length - 1) {
      setStartTime(0); // Reset time for different performance
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDownload = async (e: React.MouseEvent, rm: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (downloadingUrl === rm.url) return;
    
    // Open a blank window synchronously to bypass popup blocker
    const fallbackWindow = window.open('about:blank', '_blank');
    
    let downloadUrl = rm.url;
    // Force download for Cloudinary URLs if possible (but not for raw files which don't support transformations)
    if (downloadUrl.includes('res.cloudinary.com') && !downloadUrl.includes('/raw/upload/')) {
      const parts = downloadUrl.split('/upload/');
      if (parts.length === 2) {
        downloadUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
      }
    }

    setDownloadingUrl(rm.url);
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      
      // Format: Artist - Title (Instrument)
      const artistName = rm.artist || currentVideo.artist || 'Unknown Artist';
      const titleName = rm.title || currentVideo.title || 'Unknown Title';
      const instrumentName = rm.instrument || currentVideo.instrument || 'Unknown Instrument';
      const extension = rm.url.split('.').pop()?.split('?')[0] || (rm.type?.startsWith('audio/') ? 'mp3' : rm.type?.includes('zip') ? 'zip' : 'pdf');
      a.download = `${artistName} - ${titleName} (${instrumentName}).${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      
      if (fallbackWindow) fallbackWindow.close();
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: use the already opened window to navigate
      if (fallbackWindow) {
        fallbackWindow.location.href = downloadUrl;
      }
    } finally {
      setDownloadingUrl(null);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-12 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="flex items-center justify-center w-full max-w-[1200px] gap-2 sm:gap-6">
        {/* Navigation Arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(e); }}
          className={`flex-shrink-0 z-20 p-2 sm:p-4 rounded-full bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-zinc-900 dark:text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${
            currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        <div 
          className="relative w-full max-w-5xl flex flex-col gap-4"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Bar: Back and Versions */}
          <div className="flex justify-between items-center w-full z-30">
            {/* Top Left: Back Button */}
            <button 
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-zinc-900 dark:text-white rounded-full backdrop-blur-md transition-all border border-zinc-300 dark:border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold text-sm">Back</span>
            </button>

            {/* Top Right: Related Videos Button */}
            {(relatedVideos.length > 1 || relatedMedia.length > 0) && (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRelated(!showRelated);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md transition-all border ${
                    showRelated 
                    ? 'bg-emerald-500 text-white border-emerald-400' 
                    : 'bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-zinc-900 dark:text-white border-zinc-300 dark:border-white/10'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                  <span className="font-semibold text-sm">Related</span>
                </button>

                {/* Related Videos Dropdown */}
                {showRelated && (
                  <div 
                    className="absolute top-full right-0 mt-2 w-72 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                  >
                    {(relatedVideos.length > 1 && relatedMedia.length > 0) && (
                      <div className="flex border-b border-zinc-100 dark:border-white/5">
                        <button 
                          onClick={() => setRelatedView('versions')}
                          className={`flex-1 p-3 text-[10px] font-bold uppercase tracking-wider ${relatedView === 'versions' ? 'bg-zinc-100 dark:bg-white/10 text-emerald-500' : 'text-zinc-500'}`}
                        >
                          Video ({relatedVideos.length})
                        </button>
                        <button 
                          onClick={() => setRelatedView('media')}
                          className={`flex-1 p-3 text-[10px] font-bold uppercase tracking-wider ${relatedView === 'media' ? 'bg-zinc-100 dark:bg-white/10 text-emerald-500' : 'text-zinc-500'}`}
                        >
                          Audio ({relatedMedia.length})
                        </button>
                      </div>
                    )}
                    <div className="max-h-60 overflow-y-auto">
                      {(relatedMedia.length === 0 || (relatedVideos.length > 1 && relatedView === 'versions')) ? (
                        relatedVideos.map((rv, idx) => {
                          const matchingMedias = relatedMedia.filter(m => m.instrument?.trim().toLowerCase() === rv.instrument?.trim().toLowerCase());
                          return (
                            <div
                              key={idx}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                const globalIdx = videos.findIndex(v => v.youtubeUrl === rv.youtubeUrl);
                                if (globalIdx !== -1) handleVersionSwitch(globalIdx);
                              }}
                              className={`w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors text-left cursor-pointer ${
                                rv.youtubeUrl === currentVideo.youtubeUrl ? 'bg-emerald-500/10 text-emerald-500' : 'text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              <div className="w-16 aspect-video rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {React.cloneElement(getInstrumentIcon(rv.instrument) as React.ReactElement, { className: "w-8 h-8 text-emerald-500" })}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-200">{rv.instrument}</p>
                                <p className={`text-[10px] font-bold truncate ${getDifficultyColor(rv.difficulty)}`}>{rv.difficulty}</p>
                              </div>
                              {matchingMedias.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {matchingMedias.map((rm, mIdx) => (
                                    <button
                                      key={mIdx}
                                      onClick={(e) => handleDownload(e, rm)}
                                      className={`p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${downloadingUrl === rm.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      title={`Download ${rm.type?.startsWith('audio/') ? 'Audio' : 'Sheet'}`}
                                      disabled={downloadingUrl === rm.url}
                                    >
                                      {downloadingUrl === rm.url ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                      ) : (
                                        <Download className="w-4 h-4 text-zinc-500 hover:text-emerald-500" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        relatedMedia.map((rm, idx) => (
                          <div key={idx} className="w-full flex items-center gap-3 p-3 text-zinc-700 dark:text-zinc-300">
                            <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0">
                              {React.cloneElement(getInstrumentIcon(rm.instrument || rm.title) as React.ReactElement, { className: "w-6 h-6 text-emerald-500" })}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-200">{rm.instrument || rm.title}</p>
                              <p className={`text-[10px] font-bold truncate ${rm.difficulty ? getDifficultyColor(rm.difficulty) : 'text-zinc-500'}`}>{rm.difficulty || (rm.type?.startsWith('audio/') ? 'Audio' : 'File')}</p>
                            </div>
                            <div className="relative flex items-center gap-2">
                              {rm.type?.startsWith('audio/') && (
                                <button
                                  onClick={() => setActiveVolumeBarUrl(activeVolumeBarUrl === rm.url ? null : rm.url)}
                                  className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                >
                                  <Volume2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDownload(e, rm)}
                                className={`p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 ${downloadingUrl === rm.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={downloadingUrl === rm.url}
                                title={`Download ${rm.type?.startsWith('audio/') ? 'Audio' : 'Sheet'}`}
                              >
                                {downloadingUrl === rm.url ? (
                                  <Loader2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                                )}
                              </button>
                              {rm.type?.startsWith('audio/') && (
                                <>
                                  <button
                                    onClick={() => {
                                      const isCurrentlyHeard = playingAudios.includes(rm.url);
                                      
                                      if (isCurrentlyHeard) {
                                        const newAudios = playingAudios.filter(a => a !== rm.url);
                                        setPlayingAudios(newAudios);
                                        if (newAudios.length === 0) {
                                          playerRef.current?.unMute();
                                        }
                                      } else {
                                        setPlayingAudios([...playingAudios, rm.url]);
                                        playerRef.current?.mute();
                                      }
                                    }}
                                    className={`p-2 rounded-full transition-all ${playingAudios.includes(rm.url) ? 'bg-emerald-500 text-white scale-110' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:scale-105'}`}
                                  >
                                    {playingAudios.includes(rm.url) ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                  </button>
                                  {activeVolumeBarUrl === rm.url && (
                                    <div className="absolute top-full mt-2 right-0 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg shadow-xl z-10">
                                      <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        defaultValue={audiosRef.current.get(rm.url)?.volume ?? 1.0}
                                        onChange={(e) => {
                                          const volume = parseFloat(e.target.value);
                                          const audio = audiosRef.current.get(rm.url);
                                          if (audio) {
                                            audio.volume = volume;
                                          }
                                        }}
                                        className="w-16 accent-emerald-500"
                                      />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {/* Audio elements are managed dynamically in audiosRef */}
              </div>

            )}
          </div>

          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <div id="youtube-player" className="w-full h-full"></div>
            {!videoId && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                Invalid Video URL
              </div>
            )}
          </div>

          {/* Bottom Info Bar - Outside Video */}
          <div className="flex flex-col items-center text-center mt-4">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{currentVideo.title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-1">{currentVideo.artist}</p>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="text-emerald-500 flex items-center gap-1.5">
                {getInstrumentIcon(currentVideo.instrument)}
                {currentVideo.instrument}
              </span>
              <span className="text-zinc-400">•</span>
              <span className={`font-bold flex items-center gap-1.5 ${getDifficultyColor(currentVideo.difficulty)}`}>
                <DifficultyGauge difficulty={currentVideo.difficulty} className="w-4 h-4" />
                {currentVideo.difficulty}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleNext(e); }}
          className={`flex-shrink-0 z-20 p-2 sm:p-4 rounded-full bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-zinc-900 dark:text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${
            currentIndex === videos.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>
    </div>
  );
};

const UploadModal = ({ onUpload, onClose }: { onUpload: (video: any) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    difficulty: 'Beginner',
    instrument: 'Bass',
    youtubeUrl: ''
  });

  const { user } = useContext(AuthContext);

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const newVideo = {
      title: formData.title,
      artist: formData.artist,
      instrument: formData.instrument,
      difficulty: formData.difficulty,
      image: getYoutubeThumbnail(formData.youtubeUrl),
      youtubeUrl: formData.youtubeUrl
    };
    
    try {
      await onUpload(newVideo);
      // Modal is closed by onUpload success or manually if needed
    } catch (error) {
      console.error("Upload failed in modal:", error);
      // Error is handled by handleFirestoreError in onUpload
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Details</h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Title</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Song Title"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Artist</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Artist Name"
                  value={formData.artist}
                  onChange={e => setFormData({...formData, artist: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Difficulty</label>
                <select 
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.difficulty}
                  onChange={e => setFormData({...formData, difficulty: e.target.value})}
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Instrument</label>
                <select 
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.instrument}
                  onChange={e => setFormData({...formData, instrument: e.target.value})}
                >
                  {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">YouTube URL</label>
              <input 
                required
                type="url" 
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.youtubeUrl}
                onChange={e => setFormData({...formData, youtubeUrl: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              className="w-full transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] mt-4 flex justify-center"
            >
              <img src="https://i.ibb.co/dshZr7GS/Upload.png" alt="Upload Performance" className="h-14 w-auto" referrerPolicy="no-referrer" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const audioCache: Record<string, HTMLAudioElement> = {};

const preloadAudio = (url: string) => {
  if (!audioCache[url]) {
    const audio = new Audio(url);
    audio.preload = "auto";
    audioCache[url] = audio;
  }
  return audioCache[url];
};

const InstrumentsSection = ({ onInstrumentClick }: { onInstrumentClick?: (instrument: string) => void }) => {
  const [instruments, setInstruments] = useState([
    { name: "Guitar", image: "https://i.ibb.co/HT4qr1Gs/Guitar.png" },
    { name: "Piano", image: "https://i.ibb.co/Z6bYM4RL/Piano-Card.png" },
    { name: "Drum Set", image: "https://i.ibb.co/zWYD0y56/Drum-Set.png" },
    { name: "Instrumental", image: "https://i.ibb.co/Z6L1kwbN/Instrumental.png" },
  ]);
  const [hoveredInstrument, setHoveredInstrument] = useState<string | null>(null);
  const [hoveredPopupIndex, setHoveredPopupIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleDocumentClick = () => {
      if (isMobile && hoveredInstrument) {
        setHoveredInstrument(null);
        setHoveredPopupIndex(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [isMobile, hoveredInstrument]);

  const handleMouseEnter = (name: string) => {
    if (isMobile) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredInstrument(name);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredInstrument(null);
      setHoveredPopupIndex(null);
    }, 300);
  };

  const sounds: Record<string, string> = {
    "Guitar": "https://cdn.pixabay.com/audio/2026/03/25/audio_8c4e2499cc.mp3",
    "Guitar Solo": "https://cdn.pixabay.com/audio/2026/03/25/audio_f3c9af4e73.mp3",
    "Guitar Fingerstyle": "https://cdn.pixabay.com/audio/2026/03/25/audio_31d6e0c3b1.mp3",
    "Piano": "https://cdn.pixabay.com/audio/2026/03/25/audio_478f869596.mp3",
    "Piano Solo": "https://cdn.pixabay.com/audio/2026/03/25/audio_850e668130.mp3",
    "Piano Cover": "https://cdn.pixabay.com/audio/2026/03/25/audio_e3e1025f10.mp3",
    "Drum Set": "https://cdn.pixabay.com/audio/2026/03/25/audio_aa850b2728.mp3",
    "Instrumental": "https://s3.amazonaws.com/freecodecamp/drums/Heater-6.mp3",
    "Instrumental Bass": "https://cdn.pixabay.com/audio/2026/03/21/audio_a1511931d5.mp3",
    "Instrumental Acoustic": "https://cdn.pixabay.com/audio/2026/03/25/audio_2952f322cc.mp3",
    "Instrumental Piano": "https://cdn.pixabay.com/audio/2026/03/25/audio_1a899a6135.mp3"
  };

  useEffect(() => {
    // Preload all sounds to prevent delay
    Object.values(sounds).forEach(url => preloadAudio(url));
  }, []);

  const playSound = (instrumentName: string) => {
    const url = sounds[instrumentName];
    if (url) {
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
      playTimeoutRef.current = setTimeout(() => {
        // Stop all currently playing sounds
        Object.values(audioCache).forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });

        const audio = preloadAudio(url);
        audio.currentTime = 0;
        audio.volume = 0.4;
        audio.play().catch(e => console.log("Audio play failed (user interaction might be needed):", e));
      }, 200);
    }
  };

  return (
    <section className="pt-8 pb-8 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight">Instruments</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Finding the frequency your soul vibrates at.</p>
        </div>
        
        <div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative"
          onMouseLeave={handleMouseLeave}
        >
          {instruments.map((inst, i) => {
            return (
            <motion.div 
              key={i}
              onMouseEnter={() => handleMouseEnter(inst.name)}
              whileHover={{ y: -10, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              className={`group relative ${inst.name === 'Instrumental' ? 'cursor-default' : 'cursor-pointer'} hover:z-50 ${(hoveredInstrument === 'Guitar' || hoveredInstrument === 'Piano' || hoveredInstrument === 'Instrumental') ? 'blur-[2px] opacity-70' : ''}`}
              style={{ transition: 'filter 500ms ease, opacity 500ms ease' }}
              onClick={(e) => {
                if (isMobile) {
                  e.stopPropagation();
                  if (inst.name === 'Guitar' || inst.name === 'Piano' || inst.name === 'Instrumental') {
                    if (hoveredInstrument !== inst.name) {
                      setHoveredInstrument(inst.name);
                      return;
                    } else {
                      setHoveredInstrument(null);
                      return;
                    }
                  }
                }
                if (inst.name !== 'Instrumental') {
                  playSound(inst.name);
                  onInstrumentClick && onInstrumentClick(inst.name);
                }
              }}
            >
              <div 
                className="aspect-square overflow-hidden relative rounded-2xl"
              >
                <img 
                  src={inst.image} 
                  alt={inst.name} 
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105`} 
                  referrerPolicy="no-referrer" 
                />
              </div>

              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{inst.name}</h3>
              </div>
            </motion.div>
          );
          })}

          {/* Pop-up images for Guitar */}
          <div 
            onMouseEnter={() => handleMouseEnter('Guitar')}
            onClick={(e) => { e.stopPropagation(); playSound('Guitar Solo'); onInstrumentClick && onInstrumentClick('Guitar Solo'); if (isMobile) setHoveredInstrument(null); }}
            className={`absolute top-0 left-0 w-[calc((100%-2rem)/2)] lg:w-[calc((100%-6rem)/4)] aspect-square rounded-full overflow-hidden shadow-2xl transition-all duration-500 ease-out z-50 cursor-pointer group/popup ${
              hoveredInstrument === 'Guitar' 
                ? 'opacity-100 pointer-events-auto' 
                : 'opacity-0 pointer-events-none'
            }`}
            style={{ 
              transform: hoveredInstrument === 'Guitar' 
                ? (isMobile ? 'translateX(0) scale(1.1)' : 'translateX(calc(100% + 2rem)) scale(1)')
                : 'translateX(0) scale(0)',
              willChange: 'transform, opacity' 
            }}
          >
            <img src="https://i.ibb.co/gL7Xn0NK/Guitar-Solo.png" className="w-full h-full object-cover transition-transform duration-500 group-hover/popup:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white px-4 py-1.5 text-sm font-bold whitespace-nowrap drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none">Solo</div>
          </div>
          <div 
            onMouseEnter={() => handleMouseEnter('Guitar')}
            onClick={(e) => { e.stopPropagation(); playSound('Guitar Fingerstyle'); onInstrumentClick && onInstrumentClick('Fingerstyle'); if (isMobile) setHoveredInstrument(null); }}
            className={`absolute top-0 left-0 w-[calc((100%-2rem)/2)] lg:w-[calc((100%-6rem)/4)] aspect-square rounded-full overflow-hidden shadow-2xl transition-all duration-500 delay-75 ease-out z-50 cursor-pointer group/popup ${
              hoveredInstrument === 'Guitar' 
                ? 'opacity-100 pointer-events-auto' 
                : 'opacity-0 pointer-events-none'
            }`}
            style={{ 
              transform: hoveredInstrument === 'Guitar' 
                ? (isMobile ? 'translateX(calc(100% + 2rem)) scale(1.1)' : 'translateX(calc(200% + 4rem)) scale(1)')
                : 'translateX(0) scale(0)',
              willChange: 'transform, opacity' 
            }}
          >
            <img src="https://i.ibb.co/KpMfdLJd/Guitar-Fingerstyle.png" className="w-full h-full object-cover transition-transform duration-500 group-hover/popup:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white px-4 py-1.5 text-sm font-bold whitespace-nowrap drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none">Fingerstyle</div>
          </div>

          {/* Pop-up images for Piano */}
          <div 
            onMouseEnter={() => handleMouseEnter('Piano')}
            onClick={(e) => { e.stopPropagation(); playSound('Piano Solo'); onInstrumentClick && onInstrumentClick('Piano Solo'); if (isMobile) setHoveredInstrument(null); }}
            className={`absolute top-0 left-0 w-[calc((100%-2rem)/2)] lg:w-[calc((100%-6rem)/4)] aspect-square rounded-full overflow-hidden shadow-2xl transition-all duration-500 ease-out z-50 cursor-pointer group/popup ${
              hoveredInstrument === 'Piano' 
                ? 'opacity-100 pointer-events-auto' 
                : 'opacity-0 pointer-events-none'
            }`}
            style={{ 
              transform: hoveredInstrument === 'Piano' 
                ? (isMobile ? 'translateX(0) scale(1.1)' : 'translateX(calc(200% + 4rem)) scale(1)')
                : 'translateX(calc(100% + 2rem)) scale(0)',
              willChange: 'transform, opacity' 
            }}
          >
            <img src="https://i.ibb.co/spSjPZt4/Piano-Solo.png" className="w-full h-full object-cover transition-transform duration-500 group-hover/popup:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white px-4 py-1.5 text-sm font-bold whitespace-nowrap drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none">Solo</div>
          </div>
          <div 
            onMouseEnter={() => handleMouseEnter('Piano')}
            onClick={(e) => { e.stopPropagation(); playSound('Piano Cover'); onInstrumentClick && onInstrumentClick('Piano Cover'); if (isMobile) setHoveredInstrument(null); }}
            className={`absolute top-0 left-0 w-[calc((100%-2rem)/2)] lg:w-[calc((100%-6rem)/4)] aspect-square rounded-full overflow-hidden shadow-2xl transition-all duration-500 delay-75 ease-out z-50 cursor-pointer group/popup ${
              hoveredInstrument === 'Piano' 
                ? 'opacity-100 pointer-events-auto' 
                : 'opacity-0 pointer-events-none'
            }`}
            style={{ 
              transform: hoveredInstrument === 'Piano' 
                ? (isMobile ? 'translateX(calc(100% + 2rem)) scale(1.1)' : 'translateX(calc(300% + 6rem)) scale(1)')
                : 'translateX(calc(100% + 2rem)) scale(0)',
              willChange: 'transform, opacity' 
            }}
          >
            <img src="https://i.ibb.co/k6ByL84N/Piano-Cover.png" className="w-full h-full object-cover transition-transform duration-500 group-hover/popup:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white px-4 py-1.5 text-sm font-bold whitespace-nowrap drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none">Cover</div>
          </div>

          {/* Pop-up images for Instrumental */}
          {[
            { title: "Lead", image: "https://i.ibb.co/YFd656pW/Lead.png", dPos: "0px", delay: "0ms" },
            { title: "Bass", image: "https://i.ibb.co/TDxtpkfG/Bass.png", dPos: "calc(50% + 1rem)", delay: "50ms" },
            { title: "Piano", image: "https://i.ibb.co/qFJx0gxC/Piano.png", dPos: "calc(100% + 2rem)", delay: "100ms" },
            { title: "Vocal", image: "https://i.ibb.co/YT0fZqq1/Vocal.png", dPos: "calc(150% + 3rem)", delay: "150ms" },
            { title: "Rhythm", image: "https://i.ibb.co/k2NSyWSf/Rhythm.png", dPos: "calc(200% + 4rem)", delay: "200ms" },
            { title: "Acoustic", image: "https://i.ibb.co/tw8XMKg4/Acoustic.png", dPos: "calc(250% + 5rem)", delay: "250ms" },
            { title: "Instrumental", image: "https://i.ibb.co/Z6L1kwbN/Instrumental.png", dPos: "calc(300% + 6rem)", delay: "300ms" },
          ].map((popup, idx) => {
            const angle = (idx * 360) / 7;
            const radius = '30vw';
            return (
            <div 
              key={idx}
              onMouseEnter={() => { handleMouseEnter('Instrumental'); setHoveredPopupIndex(idx); }}
              onMouseLeave={() => { setHoveredPopupIndex(null); }}
              onClick={(e) => { 
                e.stopPropagation();
                playSound(popup.title === 'Bass' ? 'Instrumental Bass' : popup.title === 'Acoustic' ? 'Instrumental Acoustic' : popup.title === 'Piano' ? 'Instrumental Piano' : 'Instrumental'); 
                onInstrumentClick && onInstrumentClick(popup.title); 
                if (isMobile) setHoveredInstrument(null);
              }}
              className={`absolute z-50 cursor-pointer group/popup shadow-2xl overflow-hidden rounded-full transition-all duration-500 ease-out
                top-1/2 left-1/2 w-[32vw] h-[32vw] sm:w-[28vw] sm:h-[28vw]
                lg:top-0 lg:left-0 lg:w-[calc((100%-6rem)/4)] lg:h-auto lg:aspect-square
                ${hoveredInstrument === 'Instrumental' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
              `}
              style={{
                transform: hoveredInstrument === 'Instrumental' 
                  ? (isMobile 
                      ? `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}) rotate(-${angle}deg) scale(${hoveredPopupIndex === idx ? 1.1 : 1})`
                      : `translateX(${popup.dPos}) scale(${hoveredPopupIndex === idx ? 1 : 0.8})`)
                  : (isMobile
                      ? `translate(-50%, -50%) scale(0)`
                      : `translateX(calc(300% + 6rem)) scale(0)`),
                transitionDelay: hoveredInstrument === 'Instrumental' && hoveredPopupIndex === null ? popup.delay : '0ms',
                willChange: 'transform, opacity',
                zIndex: hoveredPopupIndex === idx ? 200 : (50 + idx)
              }}
            >
              <img src={popup.image} className="w-full h-full object-cover transition-transform duration-300 group-hover/popup:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white px-4 py-1.5 text-sm font-bold whitespace-nowrap drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none">{popup.title}</div>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
};

const MediaDetailsModal = ({ onSave, onClose, uploadType, file }: { onSave: (details: any) => void, onClose: () => void, uploadType: 'image' | 'audio' | 'sheet' | null, file: File | null }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [instrument, setInstrument] = useState('Bass');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, artist, difficulty, instrument });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Media Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Artist</label>
            <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Instrument</label>
            <select value={instrument} onChange={(e) => setInstrument(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
              {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 mt-6">
            Save Details
          </button>
        </form>
      </div>
    </div>
  );
};

const EditMediaModal = ({ media, onSave, onClose }: { media: any, onSave: (id: string, details: any) => void, onClose: () => void }) => {
  const [title, setTitle] = useState(media.title || '');
  const [artist, setArtist] = useState(media.artist || '');
  const [difficulty, setDifficulty] = useState(media.difficulty || 'Intermediate');
  const [instrument, setInstrument] = useState(media.instrument || 'Piano');

  const isImage = !media.type?.startsWith('audio/') && 
                 !(media.type === 'application/pdf' || media.type?.includes('zip') || media.url.endsWith('.zip'));
  
  const isShortAudio = media.type?.startsWith('audio/') && !media.artist && !media.instrument;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-zinc-100 dark:border-zinc-800 relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Edit Name</h2>
        </div>

        <div className="space-y-4">
          <div>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Name"
            />
          </div>
          
          {!isImage && !isShortAudio && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Artist</label>
                <input 
                  type="text" 
                  value={artist} 
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Artist Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Difficulty</label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                  >
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Instrument</label>
                  <select 
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                  >
                    {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => onSave(media.id, (isImage || isShortAudio) ? { title } : { title, artist, difficulty, instrument })}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const DeleteMediaModal = ({ media, onConfirm, onClose }: { media: any, onConfirm: (id: string, path?: string, type?: string, url?: string) => void, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-zinc-100 dark:border-zinc-800 relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Delete Media?</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Are you sure you want to delete "{media.title || 'this media'}"? This action cannot be undone and will remove the file from storage.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-2xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(media.id, media.path, media.type, media.url)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InstrumentIcon = ({ instrument, className = "w-4 h-4" }: { instrument?: string, className?: string }) => {
  if (!instrument) return null;
  const lower = instrument.toLowerCase();
  if (lower.includes('guitar')) return <Guitar className={className} />;
  if (lower.includes('drum')) return <Drum className={className} />;
  if (lower.includes('piano')) return <Piano className={className} />;
  if (lower.includes('vocal')) return <Mic2 className={className} />;
  if (lower.includes('bass')) return <Music className={className} />;
  return <Music className={className} />;
};

const MediaPage = () => {
  const [images, setImages] = useState<{id: string, url: string, date: string, type: string, path?: string, title?: string, artist?: string, difficulty?: string, instrument?: string, inPlaylist?: boolean}[]>([]);
  const [selectedImage, setSelectedImage] = useState<{url: string, type: string, title?: string, artist?: string, difficulty?: string, instrument?: string, inPlaylist?: boolean} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'audio' | 'sheet' | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingMedia, setEditingMedia] = useState<any | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<any | null>(null);
  const { user, isAdmin, cloudinaryConfig, saveCloudinaryConfig } = React.useContext(AuthContext);
  const [tempCloudName, setTempCloudName] = useState(cloudinaryConfig.cloudName);
  const [tempUploadPreset, setTempUploadPreset] = useState(cloudinaryConfig.uploadPreset);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUploadOptions && !(event.target as HTMLElement).closest('.upload-dropdown-container')) {
        setShowUploadOptions(false);
      }
      if (showSettings && !(event.target as HTMLElement).closest('.settings-dropdown-container')) {
        setShowSettings(false);
      }
      if (activeMenuId && !(event.target as HTMLElement).closest('.media-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUploadOptions, showSettings, activeMenuId]);

  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mediaData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setImages(mediaData);
    }, (error) => {
      console.error("Error fetching media:", error);
    });

    window.scrollTo(0, 0);
    return () => unsubscribe();
  }, []);

  const triggerUpload = (type: 'image' | 'audio' | 'sheet') => {
    setUploadType(type);
    setShowUploadOptions(false);
    if (fileInputRef.current) {
      const accept = type === 'image' ? 'image/*' : type === 'audio' ? 'audio/*' : 'application/zip,application/x-zip-compressed,.zip';
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const syncCloudinary = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in to sync files.");
      return;
    }
    setIsUploading(true);
    setUploadStatus("Syncing from Cloudinary...");
    
    try {
      const response = await fetch('/api/media/sync');
      if (!response.ok) {
        throw new Error('Failed to fetch from Cloudinary. Make sure CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set in environment variables.');
      }
      
      const data = await response.json();
      const resources = data.resources || [];
      
      let addedCount = 0;
      
      for (const resource of resources) {
        // Check if already in database
        const existing = images.find(img => img.path === `cloudinary/${resource.public_id}`);
        if (!existing) {
          // Add to database
          let type = 'application/octet-stream';
          if (resource.resource_type === 'image') {
            type = `image/${resource.format || 'jpeg'}`;
          } else if (resource.resource_type === 'video') {
            type = `audio/${resource.format || 'mp3'}`; // Assuming video is audio in this app context
          } else if (resource.resource_type === 'raw') {
            if (resource.format === 'zip' || resource.public_id.endsWith('.zip')) type = 'application/zip';
            else if (resource.format === 'pdf' || resource.public_id.endsWith('.pdf')) type = 'application/pdf';
          }
          
          await addDoc(collection(db, 'media'), {
            url: resource.secure_url,
            path: `cloudinary/${resource.public_id}`,
            date: new Date(resource.created_at).toISOString(),
            type: type,
            title: resource.public_id.split('/').pop() || 'Synced File',
            artist: 'Unknown Artist',
            difficulty: 'Beginner',
            instrument: 'Bass'
          });
          addedCount++;
        }
      }
      
      alert(`Sync complete! Added ${addedCount} new files.`);
    } catch (error: any) {
      console.error("Sync failed:", error);
      alert(`Failed to sync. Error: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadStatus(null);
    }
  };

  const startUpload = async (file: File | null, details?: any) => {
    if (!file && uploadType !== 'audio') {
      alert("No file selected.");
      return;
    }
    if (!auth.currentUser) {
      alert("You must be logged in to upload files.");
      return;
    }
    setIsUploading(true);
    setUploadStatus("Preparing upload...");
    setUploadProgress(0);
    setShowDetailsModal(false); // Close modal immediately
    
    try {
      let downloadURL = '';
      let storagePath = '';
      let cloudinarySuccess = false;

      // Check if Cloudinary is configured
      if (cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset) {
        try {
          setUploadStatus(`Uploading to Cloudinary...`);
          console.log("Starting Cloudinary upload...");
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', cloudinaryConfig.uploadPreset);
          
          let resourceType = 'auto';
          if (file.type.startsWith('audio/')) {
            resourceType = 'video';
          } else if (file.type === 'application/pdf') {
            resourceType = 'image';
          } else if (file.type.startsWith('image/')) {
            resourceType = 'image';
          } else if (file.name.endsWith('.zip') || file.type.includes('zip')) {
            resourceType = 'raw';
          }
          
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`);
          
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(percentComplete);
            }
          };

          const promise = new Promise((resolve, reject) => {
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
              } else {
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  reject(new Error(errorData.error?.message || 'Cloudinary upload failed'));
                } catch (e) {
                  reject(new Error('Cloudinary upload failed'));
                }
              }
            };
            xhr.onerror = () => reject(new Error('Cloudinary upload failed due to network error'));
          });

          xhr.send(formData);
          const data: any = await promise;
          
          downloadURL = data.secure_url;
          storagePath = `cloudinary/${data.public_id}`;
          console.log("Cloudinary upload successful:", downloadURL);
          cloudinarySuccess = true;
        } catch (cloudinaryError) {
          console.warn("Cloudinary upload failed, falling back to Firebase:", cloudinaryError);
        }
      }
      
      if (!cloudinarySuccess) {
        // Fallback to Firebase (likely to fail due to CORS, but kept as backup)
        setUploadStatus(`Uploading to Firebase...`);
        console.log(`Starting Firebase upload for ${file.name}... Size: ${file.size} bytes, Type: ${file.type}`);
        storagePath = `media/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        const promise = new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress(progress);
            }, 
            (error) => reject(error), 
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
        
        downloadURL = await promise;
        console.log("Firebase upload completed.");
      }
      
      setUploadStatus(`Saving to database...`);
      setUploadProgress(null);
      
      try {
        await addDoc(collection(db, 'media'), {
          url: downloadURL,
          path: storagePath,
          date: new Date().toISOString(),
          type: file.type || (file.name.endsWith('.zip') ? 'application/zip' : 'application/octet-stream'),
          ...(details || {})
        });
      } catch (err: any) {
        console.error("Firestore save failed:", err);
        handleFirestoreError(err, OperationType.CREATE, 'media');
      }
      
      console.log("Media saved successfully.");
      setPendingFile(null);
    } catch (error: any) {
      console.error("Upload process failed:", error);
      const errorMessage = error.message || 'Unknown error';
      alert(`Failed to upload. Error: ${errorMessage}\n\nTip: Make sure your Cloudinary Cloud Name and Unsigned Upload Preset are correct.`);
    } finally {
      setIsUploading(false);
      setUploadStatus(null);
      setUploadProgress(null);
      setPendingFile(null);
      setUploadType(null);
      setShowDetailsModal(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (uploadType === 'audio') {
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        if (audio.duration < 30) {
          startUpload(file, { title: file.name });
        } else {
          setPendingFile(file);
          setShowDetailsModal(true);
        }
      };
    } else if (uploadType === 'image') {
      startUpload(file);
    } else {
      setPendingFile(file);
      setShowDetailsModal(true);
    }
    
    if (event.target) {
      event.target.value = '';
    }
  };

  const deleteImage = async (id: string, path?: string, type?: string, url?: string) => {
    try {
      setUploadStatus("Deleting media...");
      setIsUploading(true);
      
      if (path) {
        if (path.startsWith('cloudinary/')) {
          const publicId = path.replace('cloudinary/', '');
          let resourceType = type?.startsWith('audio/') ? 'video' : (type === 'application/pdf' || type?.includes('zip')) ? 'raw' : 'image';
          
          if (url) {
            if (url.includes('/image/upload/')) resourceType = 'image';
            else if (url.includes('/video/upload/')) resourceType = 'video';
            else if (url.includes('/raw/upload/')) resourceType = 'raw';
          }
          
          console.log(`Deleting from Cloudinary: ${publicId} (${resourceType})`);
          const response = await fetch('/api/media/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId, resourceType })
          });
          
          if (!response.ok) {
            const error = await response.json();
            console.error("Cloudinary delete failed:", error);
          } else {
            console.log("Cloudinary delete successful");
          }
        } else {
          const storageRef = ref(storage, path);
          await deleteObject(storageRef).catch(err => console.warn("Storage delete failed (might not exist):", err));
        }
      }
      
      await deleteDoc(doc(db, 'media', id));
      setDeletingMedia(null);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete media.");
    } finally {
      setIsUploading(false);
      setUploadStatus(null);
    }
  };

  const updateMedia = async (id: string, details: any) => {
    try {
      await updateDoc(doc(db, 'media', id), details);
      setEditingMedia(null);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update media.");
    }
  };

  const downloadMedia = async (url: string, title?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = title || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download media.");
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">Media</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">Upload and preserve your musical memories.</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                title="Cloudinary Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            {isAdmin && (
              <div className="relative upload-dropdown-container">
              <button 
                onClick={() => setShowUploadOptions(!showUploadOptions)}
                disabled={isUploading}
                className="transition-all hover:scale-105 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:active:scale-100"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full font-bold min-w-[200px] justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" /> 
                    <div className="flex flex-col items-start leading-tight">
                      <span>{uploadStatus || 'Uploading...'}</span>
                      {uploadProgress !== null && (
                        <span className="text-xs opacity-80">{uploadProgress}% complete</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <img src="https://i.ibb.co/dshZr7GS/Upload.png" alt="Upload Media" className="h-14 w-auto" referrerPolicy="no-referrer" />
                )}
              </button>

              {showUploadOptions && !isUploading && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden z-50">
                  <button 
                    onClick={() => triggerUpload('image')}
                    className="w-full text-left px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-medium transition-colors flex items-center gap-3"
                  >
                    <ImageIcon className="w-5 h-5 text-emerald-500" />
                    Image
                  </button>
                  <button 
                    onClick={() => triggerUpload('audio')}
                    className="w-full text-left px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-medium transition-colors flex items-center gap-3"
                  >
                    <Music className="w-5 h-5 text-emerald-500" />
                    Audio
                  </button>
                  <button 
                    onClick={() => triggerUpload('sheet')}
                    className="w-full text-left px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-medium transition-colors flex items-center gap-3"
                  >
                    <FileText className="w-5 h-5 text-emerald-500" />
                    Sheet
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept={uploadType === 'image' ? 'image/*' : uploadType === 'audio' ? 'audio/*' : uploadType === 'sheet' ? 'application/zip,application/x-zip-compressed,.zip' : '*/*'}
          />
        </div>

        {showSettings && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 settings-dropdown-container"
          >
            <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-500">
              <Cloud className="w-5 h-5" />
              <h2 className="font-bold">Cloudinary Upload Settings</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Configure Cloudinary to bypass Firebase CORS issues. Make sure your upload preset is set to <strong>Unsigned</strong> in your Cloudinary settings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Cloud Name</label>
                <input
                  type="text"
                  value={tempCloudName}
                  onChange={(e) => setTempCloudName(e.target.value)}
                  placeholder="e.g. dxyz12345"
                  className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Unsigned Upload Preset</label>
                <input
                  type="text"
                  value={tempUploadPreset}
                  onChange={(e) => setTempUploadPreset(e.target.value)}
                  placeholder="e.g. preset_name"
                  className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    saveCloudinaryConfig(tempCloudName, tempUploadPreset);
                    setShowSettings(false);
                    alert("Cloudinary settings saved!");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-emerald-600/20"
                >
                  Save Settings
                </button>
              </div>
              <p className="text-xs text-zinc-500">
                Note: Cloudinary settings are saved to your local storage.
              </p>
            </div>
          </motion.div>
        )}

        {showDetailsModal && (
          <MediaDetailsModal 
            file={pendingFile}
            onSave={(details) => startUpload(pendingFile, details)}
            onClose={() => {
              setShowDetailsModal(false);
              setPendingFile(null);
              setUploadType(null);
            }}
            uploadType={uploadType}
          />
        )}

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
              <ImageIcon className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No media yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">Start by uploading your first musical moment.</p>
            {isAdmin && (
              <button 
                onClick={() => setShowUploadOptions(true)}
                className="text-emerald-600 font-bold hover:text-emerald-500 transition-colors"
              >
                Click here to upload
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {images.map((img) => {
              const isImage = !img.type?.startsWith('audio/') && 
                             !(img.type === 'application/pdf' || img.type?.includes('zip') || img.url.endsWith('.zip'));
              
              return (
                <div 
                  key={img.id} 
                  className="flex flex-col gap-2 group relative"
                >
                  <div 
                    onClick={() => setSelectedImage(img)}
                    className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-300 cursor-pointer hover:border-emerald-500/50"
                  >
                    {img.type?.startsWith('audio/') ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-zinc-950">
                        <Music className="w-8 h-8 text-emerald-500" />
                      </div>
                    ) : (img.type === 'application/pdf' || img.type?.includes('zip') || img.url.endsWith('.zip')) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-zinc-950">
                        <FileText className="w-8 h-8 text-emerald-500" />
                      </div>
                    ) : (
                      <img 
                        src={img.url} 
                        alt={img.title || "User upload"} 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Admin Menu Button */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity media-menu-container">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === img.id ? null : img.id);
                          }}
                          className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === img.id && (
                          <div className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden z-50">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadMedia(img.url, img.title);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-medium transition-colors flex items-center gap-2"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-500" />
                              Download
                            </button>
                            {img.type?.startsWith('audio/') && (
                              <button 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const mediaRef = doc(db, 'media', img.id);
                                    await updateDoc(mediaRef, { inPlaylist: !img.inPlaylist });
                                  } catch (error) {
                                    console.error("Failed to update playlist status:", error);
                                  }
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-medium transition-colors flex items-center gap-2"
                              >
                                <Play className="w-3.5 h-3.5 text-blue-500" />
                                {img.inPlaylist ? 'Remove from Playlist' : 'Add to Playlist'}
                              </button>
                            )}
                            {isAdmin && (
                              <>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingMedia(img);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-medium transition-colors flex items-center gap-2"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-emerald-500" />
                                  Edit
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingMedia(img);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-red-600 dark:text-red-500 text-xs font-medium transition-colors flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  
                  {/* Always visible info - centered */}
                  <div className="px-1 text-center">
                    <p className="text-white font-bold text-xs truncate leading-tight">
                      {(!img.artist && !img.instrument) ? img.title.replace(/\.mp3$/, '') : (img.title || 'Untitled')}
                    </p>
                    {(!img.type?.startsWith('audio/') && 
                      !(img.type === 'application/pdf' || img.type?.includes('zip') || img.url.endsWith('.zip'))) ? null : 
                      (!img.artist && !img.instrument) ? null : (
                      <>
                        <p className="text-zinc-400 text-[10px] truncate leading-tight mt-0.5">{img.artist || 'Unknown'}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <InstrumentIcon instrument={img.instrument} className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500/80 text-[9px] font-bold uppercase truncate">{img.instrument}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lightbox / Image Viewer */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-10 h-10" />
            </button>
            <div 
              className="relative max-w-full max-h-full flex flex-col items-center w-fit"
              onClick={e => e.stopPropagation()}
            >
              {selectedImage.type?.startsWith('audio/') ? (
                <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl flex flex-col items-center justify-center border border-zinc-800">
                  <Music className="w-24 h-24 text-emerald-500 mb-4" />
                  {selectedImage.title && <h3 className="text-xl font-bold text-white mb-1">{selectedImage.title}</h3>}
                  {selectedImage.artist && <p className="text-zinc-400 mb-6">{selectedImage.artist}</p>}
                  <audio 
                    controls 
                    src={selectedImage.url} 
                    className="w-full" 
                    autoPlay 
                    ref={el => {
                      if (el) {
                        (el as any)._isMediaAudio = true;
                      } else {
                        const audioElements = document.querySelectorAll('audio');
                        audioElements.forEach(audio => {
                          if ((audio as any)._isMediaAudio) {
                            audio.pause();
                            audio.removeAttribute('src');
                            audio.load();
                          }
                        });
                      }
                    }}
                  />
                </div>
              ) : (selectedImage.type === 'application/pdf' || selectedImage.type?.includes('zip') || selectedImage.url.endsWith('.zip')) ? (
                <div className="w-full max-w-4xl h-[80vh] bg-zinc-900 rounded-2xl shadow-2xl flex flex-col border border-zinc-800 overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <div>
                      {selectedImage.title && <h3 className="text-lg font-bold text-white">{selectedImage.title}</h3>}
                      {selectedImage.artist && <p className="text-zinc-400 text-sm">{selectedImage.artist}</p>}
                    </div>
                    <a 
                      href={selectedImage.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      {selectedImage.type === 'application/pdf' ? 'Open in New Tab' : 'Download File'}
                    </a>
                  </div>
                  {selectedImage.type === 'application/pdf' ? (
                    <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedImage.url)}&embedded=true`} className="w-full h-full" title="PDF Viewer" />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-900">
                      <FileText className="w-24 h-24 text-emerald-500 mb-6" />
                      <h4 className="text-2xl font-bold text-white mb-2">ZIP Archive</h4>
                      <p className="text-zinc-400 max-w-md mb-8">
                        This is a ZIP archive containing sheet music or related files.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <img 
                  src={selectedImage.url} 
                  alt="Full view" 
                  className="max-w-[80vw] max-h-[70vh] object-contain rounded-lg shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="mt-6 text-center flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full uppercase tracking-widest">
                    {selectedImage.type?.split('/')[1] || 'image'}
                  </span>
                  {selectedImage.difficulty && (
                    <span className={`px-3 py-1 bg-zinc-800 ${getDifficultyColor(selectedImage.difficulty)} text-xs font-bold rounded-full uppercase tracking-widest border border-zinc-700`}>
                      {selectedImage.difficulty}
                    </span>
                  )}
                  {selectedImage.instrument && (
                    <span className="px-3 py-1 bg-zinc-800 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-widest border border-zinc-700">
                      {selectedImage.instrument}
                    </span>
                  )}
                </div>
                {(!selectedImage.type?.includes('zip') && !selectedImage.url.endsWith('.zip') && !(selectedImage.type?.startsWith('audio/') && (selectedImage.artist || selectedImage.instrument))) && (
                  <button
                    disabled={isCopying}
                    onClick={async () => {
                      setIsCopying(true);
                      try {
                        let cleanUrl = selectedImage.url;
                        
                        if (cleanUrl.startsWith('data:')) {
                          try {
                            const res = await fetch(cleanUrl);
                            const blob = await res.blob();
                            const storagePath = `media/converted_${Date.now()}.png`;
                            const storageRef = ref(storage, storagePath);
                            const snapshot = await uploadBytes(storageRef, blob);
                            cleanUrl = await getDownloadURL(snapshot.ref);
                            
                            const imgToUpdate = images.find(img => img.url === selectedImage.url);
                            if (imgToUpdate) {
                              const docRef = doc(db, 'media', imgToUpdate.id);
                              await updateDoc(docRef, { url: cleanUrl, path: storagePath });
                              setSelectedImage({ ...selectedImage, url: cleanUrl });
                            }
                          } catch (e) {
                            console.error("Failed to convert base64 to permanent link", e);
                            setIsCopying(false);
                            return;
                          }
                        }
                        
                        let finalUrl = cleanUrl;

                        if (selectedImage.type === 'image/png' && !finalUrl.endsWith('.png')) {
                          finalUrl = finalUrl + '#image.png';
                        }
                        
                        await navigator.clipboard.writeText(finalUrl);
                        
                        // Visual feedback
                        const originalText = document.getElementById('copy-btn-text')?.innerText;
                        const btn = document.getElementById('copy-btn');
                        if (btn) {
                          const originalClass = btn.className;
                          btn.innerText = 'Copied!';
                          btn.className = 'px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2';
                          setTimeout(() => {
                            btn.innerText = originalText || '';
                            btn.className = originalClass;
                          }, 2000);
                        }
                      } catch (err) {
                        console.error('Failed to copy text: ', err);
                        alert(`Failed to copy ${!selectedImage.type?.startsWith('audio/') ? 'image' : 'audio'} address.`);
                      } finally {
                        setIsCopying(false);
                      }
                    }}
                    id="copy-btn"
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <span id="copy-btn-text" className="flex items-center gap-2">
                      {!selectedImage.type?.startsWith('audio/') ? <><ImageIcon className="w-4 h-4" /> Copy Image Address</> : <><Music className="w-4 h-4" /> Copy Audio Address</>}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {editingMedia && (
          <EditMediaModal 
            media={editingMedia}
            onSave={updateMedia}
            onClose={() => setEditingMedia(null)}
          />
        )}

        {deletingMedia && (
          <DeleteMediaModal 
            media={deletingMedia}
            onConfirm={deleteImage}
            onClose={() => setDeletingMedia(null)}
          />
        )}
      </div>
    </div>
  );
};

const PerformancePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20">
      <InstrumentsSection onInstrumentClick={setSearchQuery} />
      <PerformanceSection externalSearchQuery={searchQuery} onExternalSearchChange={setSearchQuery} />
    </div>
  );
};

const Spark = ({ x, y, onComplete }: { x: number, y: number, onComplete: () => void, key?: any }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed w-3 h-3 rounded-full bg-emerald-500 pointer-events-none animate-spark spark-glow"
      style={{ left: x - 6, top: y - 6 }}
    />
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLoginSuccessModal, setShowLoginSuccessModal] = useState(false);
  const [sparks, setSparks] = useState<{id: number, x: number, y: number}[]>([]);
  const [cloudinaryConfig, setCloudinaryConfig] = useState({
    cloudName: localStorage.getItem('cloudinary_cloud_name') || '',
    uploadPreset: localStorage.getItem('cloudinary_upload_preset') || ''
  });

  const saveCloudinaryConfig = (cloudName: string, uploadPreset: string) => {
    localStorage.setItem('cloudinary_cloud_name', cloudName);
    localStorage.setItem('cloudinary_upload_preset', uploadPreset);
    setCloudinaryConfig({ cloudName, uploadPreset });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          const userEmail = firebaseUser.email ? firebaseUser.email.toLowerCase().trim() : '';
          const isAdminUser = userEmail === 'dylanchrey@gmail.com' || userEmail === 'chreii05@chreii.com';
          
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
              photoURL: firebaseUser.photoURL || '',
              role: isAdminUser ? 'admin' : 'user'
            });
          }
        } catch (error) {
          console.error("Error fetching or creating user document:", error);
          // Continue to log them in locally even if Firestore fails
        }
        
        const userEmail = firebaseUser.email ? firebaseUser.email.toLowerCase().trim() : '';
        const isAdminUser = userEmail === 'dylanchrey@gmail.com' || userEmail === 'chreii05@chreii.com';
        console.log("User logged in:", userEmail, "isAdmin:", isAdminUser);
        setUser(firebaseUser);
        setIsAdmin(isAdminUser);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const login = async (usernameOrEvent?: string | React.MouseEvent, password?: string) => {
    // If called from onClick without arguments, usernameOrEvent will be the event object
    if (typeof usernameOrEvent !== 'string' || !password) {
      setShowLoginModal(true);
      return;
    }

    const username = usernameOrEvent;
    try {
      // Map username to email if it's the specific one requested
      const email = username.toLowerCase().trim() === 'chreii05' ? 'chreii05@chreii.com' : username.trim();
      console.log("Attempting login with:", email);
      await signInWithEmailAndPassword(auth, email, password);
      setShowLoginModal(false);
      if (email === 'dylanchrey@gmail.com' || email === 'chreii05@chreii.com') {
        setShowLoginSuccessModal(true);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      let message = "Login failed. Please try again.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Invalid username or password. Please make sure you have created the user in Firebase Console.";
      } else if (error.code === 'auth/network-request-failed') {
        message = "Network error. Please check your connection.";
      } else {
        message = error.message || message;
      }
      alert(message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const id = Date.now();
      setSparks(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    const updateFavicon = (url: string) => {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = url;
    };

    const savedLogo = localStorage.getItem('app_logo') || 'https://pixabay.com/images/download/u_op8btczor7-green-10179478_1280.png';
    updateFavicon(savedLogo);

    const handleGlobalUpdate = (e: any) => {
      updateFavicon(e.detail);
    };
    window.addEventListener('logoUpdated', handleGlobalUpdate);
    return () => window.removeEventListener('logoUpdated', handleGlobalUpdate);
  }, []);

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ 
        user, 
        isAdmin, 
        isAuthReady, 
        cloudinaryConfig,
        saveCloudinaryConfig,
        login, 
        logout, 
        showLoginModal, 
        setShowLoginModal, 
        showLoginSuccessModal, 
        setShowLoginSuccessModal 
      }}>
        <div className="min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300 bg-black text-white dark">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/performance" element={<PerformancePage />} />
              <Route path="/playlist" element={<PlaylistPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/media" element={<MediaPage />} />
            </Routes>
          </main>
          <Footer />
          <LoginModal />
          {showLoginSuccessModal && <LoginSuccessModal onClose={() => setShowLoginSuccessModal(false)} />}
          {sparks.map(s => <Spark key={s.id} x={s.x} y={s.y} onComplete={() => setSparks(prev => prev.filter(p => p.id !== s.id))} />)}
        </div>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

const LoginModal = () => {
  const { showLoginModal, setShowLoginModal, login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!showLoginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(username, password);
      setUsername('');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full relative"
      >
        <button 
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-zinc-400">Please enter your credentials to login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Username</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              placeholder="Enter password"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-500">
            Note: This app uses Firebase Email/Password authentication. 
            Ensure it is enabled in your Firebase Console.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
