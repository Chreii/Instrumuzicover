/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useContext, Component } from 'react';
import newLogoUrl from './assets/images/regenerated_image_1780817274627.png';
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
  PlusCircle,
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

import { EditableSection } from './components/EditableSection';
import { SectionToolbox } from './components/SectionToolbox';
import { MediaSelectorModal } from './components/MediaSelectorModal';
import { EditableRow } from './components/EditableRow';
import { ImageToolbox } from './components/ImageToolbox';
import { ElementInspector } from './components/ElementInspector';

const DIFFICULTIES = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];
const INSTRUMENTS = [
  'Bass', 'Vocal', 'Drum Set', 'Piano', 'Piano Solo', 'Fingerstyle', 'Guitar Solo', 'Lead Guitar', 'Piano Cover', 'Instrumental', 'Rhythm Guitar', 'Acoustic Guitar'
];

interface AuthContextType {
  user: FirebaseUser | null;
  isAdmin: boolean;
  isAuthReady: boolean;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  cloudinaryConfig: { cloudName: string; uploadPreset: string };
  saveCloudinaryConfig: (cloudName: string, uploadPreset: string) => void;
  login: (usernameOrEvent?: string | React.MouseEvent, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  showLoginSuccessModal: boolean;
  setShowLoginSuccessModal: (show: boolean) => void;
  showExitConfirmation: boolean;
  setShowExitConfirmation: (show: boolean) => void;
}

const AuthContext = React.createContext<AuthContextType>({ 
  user: null, 
  isAdmin: false,
  isAuthReady: false, 
  isEditMode: false,
  setIsEditMode: () => {},
  cloudinaryConfig: { cloudName: '', uploadPreset: '' },
  saveCloudinaryConfig: () => {},
  login: async (usernameOrEvent?: string | React.MouseEvent, password?: string) => {}, 
  logout: async () => {},
  showLoginModal: false,
  setShowLoginModal: () => {},
  showLoginSuccessModal: false,
  setShowLoginSuccessModal: () => {},
  showExitConfirmation: false,
  setShowExitConfirmation: () => {}
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

const formatInstrumentName = (instrument: string | undefined) => {
  if (!instrument) return 'Track';
  const formatted = instrument.replace(/\s*Guitar\s*/i, ' ').trim();
  return formatted || instrument;
};

const getInstrumentSortWeight = (instrument: string | undefined) => {
  const lower = (instrument || '').toLowerCase();
  if (lower.includes('vocal')) return 1;
  if (lower.includes('acoustic')) return 2;
  if (lower.includes('bass')) return 3;
  if (lower.includes('lead')) return 4;
  if (lower.includes('rhythm')) return 5;
  if (lower.includes('drum')) return 6;
  return 99;
};

const getInstrumentIcon = (instrument: string | undefined, className: string = "w-4 h-4 text-emerald-500") => {
  if (!instrument) return <Music className={className} />;
  const lower = instrument.toLowerCase();
  if (lower.includes('guitar') || lower.includes('bass') || lower.includes('fingerstyle')) return <Guitar className={className} />;
  if (lower.includes('drum')) return <Drum className={className} />;
  if (lower.includes('vocal')) return <Mic2 className={className} />;
  if (lower.includes('piano')) return <Piano className={className} />;
  return <Music className={className} />;
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

const Logo = ({ className = "w-14 h-14", imgStyle }: { className?: string; imgStyle?: React.CSSProperties }) => {
  const [logoUrl, setLogoUrl] = useState<string>(newLogoUrl);

  useEffect(() => {
    const savedLogo = localStorage.getItem('app_logo');
    if (savedLogo) {
      if (savedLogo.includes('pixabay.com') || savedLogo === 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780633186/zsjuxacfxlrdsl0f3nac.png' || savedLogo === 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780632694/pua45jexzmemmkjrmvox.png' || savedLogo === 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780817182694.png') {
        localStorage.setItem('app_logo', newLogoUrl);
        setLogoUrl(newLogoUrl);
      } else {
        setLogoUrl(savedLogo);
      }
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
        style={imgStyle}
        referrerPolicy="no-referrer" 
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

const NAV_LINKS_BASE = [
  { path: '/', label: 'Home', defaultImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780386406/z0qi9o5x50rv3ou4z2qc.png', activeImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780722519/acoyqf3jsqzhylhd5etc.png', sizeClass: 'w-[50px] h-[50px]' },
  { path: '/performance', label: 'Performance', defaultImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780700550/efvnjew5nmukquocbufq.png', activeImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780814118/p38vxt5agjsugpyz1h3w.png', sizeClass: 'w-[50px] h-[50px]' },
  { path: '/playlist', label: 'Playlist', defaultImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780700309/yymfiet6emdyzfelpcwp.png', activeImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780817766/gvofkpvyhfyvhowlcfa9.png', sizeClass: 'w-[50px] h-[50px]' },
  { path: '/media', label: 'Media', adminOnly: true, defaultImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780700285/yxzcywnjki2a0jqshbul.png', activeImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780722520/bezuanlpvepkhkr2vj5c.png', sizeClass: 'w-[50px] h-[50px]' },
  { path: '/products', label: 'Product', defaultImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780700326/sywrukeionny716yatvy.png', activeImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780722522/hiph7fga5hkdo94uka9o.png', sizeClass: 'w-[50px] h-[50px]' },
  { path: '/contact', label: 'Contact', defaultImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780700247/ihjqppqrtuuppulowthw.png', activeImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780722518/ctmpm2nubfdj7h7nacm5.png', sizeClass: 'w-[50px] h-[50px]' },
  { path: '/about', label: 'About', defaultImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780700255/yao2lqrtdp7u6vbn9w1v.png', activeImg: 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780812507/rtprsgnlcgqdygwmim4b.png', sizeClass: 'w-[50px] h-[50px]' },
];

const NavItem = ({ path, label, defaultImg, activeImg, isActive, sizeClass }: any) => {
  return (
    <Link to={path} className="relative group px-1 mx-0.5 sm:px-2 rounded-full flex items-center justify-center transition-all h-[56px] min-w-[56px] lg:minw-[70px]">
      <motion.div
        className="flex flex-col xl:flex-row items-center gap-1 xl:gap-2 relative z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img 
          src={isActive ? activeImg : defaultImg} 
          alt={label} 
          className={`${sizeClass || 'w-7 h-7 sm:w-8 sm:h-8'} object-contain transition-opacity duration-300 drop-shadow-sm`}
          style={{ opacity: isActive ? 1 : 0.7 }}
          referrerPolicy="no-referrer"
        />
        <span className={`text-[10px] sm:text-xs xl:text-sm font-semibold tracking-wide transition-colors duration-300 ${isActive ? 'text-[#b5d98d] drop-shadow-[0_0_8px_rgba(209,254,184,0.4)]' : 'text-[#7ab18a] group-hover:text-[#7ab18a]'}`}>
          {label}
        </span>
      </motion.div>
      {isActive && (
        <motion.div
          layoutId="navbar-active-indicator"
          className="absolute inset-0 rounded-[28px] bg-[#D1FEB8]/10 shadow-[0_0_20px_rgba(209,254,184,0.2)] border border-[#D1FEB8]/30 z-0"
          initial={false}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        >
          <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#D1FEB8] rounded-full shadow-[0_0_10px_#D1FEB8]" />
        </motion.div>
      )}
      {!isActive && (
        <div className="absolute inset-0 rounded-[28px] bg-white/0 group-hover:bg-white/5 border border-transparent group-hover:border-white/10 transition-colors duration-300 z-0" />
      )}
    </Link>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isAdmin, login, logout } = useContext(AuthContext);
  const location = useLocation();

  const activeLinks = NAV_LINKS_BASE.filter(link => !link.adminOnly || isAdmin);

  return (
    <nav className="fixed top-6 md:top-8 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] max-w-[1374px] transition-all duration-300 pointer-events-none">
      <div 
        className="relative h-[70px] w-full rounded-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.15),0_0_25px_rgba(209,254,184,0.15)] flex items-center justify-between px-6 py-0 -mt-[25px] mb-0 pointer-events-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(35px)',
          WebkitBackdropFilter: 'blur(35px)',
          border: '1px solid rgba(209, 254, 184, 0.35)',
        }}
      >
        {/* Ambient Inner Glow/Highlight */}
        <div className="absolute inset-0 rounded-[40px] pointer-events-none border border-white/10" style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -1px 4px rgba(0,0,0,0.2)' }} />

        {/* Logo Area */}
        <div className="flex-shrink-0 flex items-center gap-3 relative z-10 w-[120px] md:w-[200px]">
          <Link to="/" className="relative flex items-center justify-center transition-transform hover:scale-105 duration-500">
            <Logo className="w-14 h-14 sm:w-16 sm:h-16" imgStyle={{ height: '60px', width: '60px', marginTop: '1px' }} />
          </Link>
          <span className="hidden lg:block text-lg font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#7ab18a] via-[#b5d98d] to-[#7ab18a] bg-[length:200%_auto] animate-[shine_4s_linear_infinite] drop-shadow-[0_0_10px_rgba(122,177,138,0.2)]">
            Instrumuzicover
          </span>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center justify-center flex-1 h-full mx-2 lg:mx-4">
          <div className="flex items-center space-x-1">
            {activeLinks.map(link => (
              <NavItem 
                key={link.path}
                {...link}
                isActive={location.pathname === link.path}
              />
            ))}
          </div>
        </div>

        {/* Right Area: Action button & Mobile Toggle */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 sm:gap-4 relative z-10 w-[90px] sm:w-[120px] md:w-[200px]">
          {/* Action button */}
          {user ? (
            <div className="relative hidden sm:block">
              <button 
                onClick={() => setShowLogoutConfirm(!showLogoutConfirm)} 
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-[24px] transition-all duration-300 hover:scale-105 group"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(209,254,184,0.25)',
                  boxShadow: '0 0 15px rgba(209,254,184,0.1)'
                }}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover group-hover:shadow-[0_0_10px_#D1FEB8] transition-shadow border border-[#D1FEB8]/30" />
                ) : (
                  <User className="w-5 h-5 text-[#7ab18a]" />
                )}
                <span className="hidden xl:block text-xs font-bold text-[#7ab18a] truncate max-w-[80px]">
                  {isAdmin ? 'Admin' : (user.displayName || 'User')}
                </span>
              </button>
              
              <AnimatePresence>
                {showLogoutConfirm && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLogoutConfirm(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute top-[calc(100%+20px)] right-0 bg-[rgba(20,20,20,0.85)] backdrop-blur-2xl border border-[#D1FEB8]/20 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(209,254,184,0.1)] p-4 flex flex-col gap-3 z-50 min-w-[220px]"
                    >
                      <p className="text-sm text-zinc-200 font-medium text-center">Ready to log out?</p>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => { logout(); setShowLogoutConfirm(false); }} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2.5 px-4 rounded-[16px] transition-colors border border-red-500/20 shadow-inner">
                          Logout
                        </button>
                        <button onClick={() => setShowLogoutConfirm(false)} className="w-full bg-white/5 hover:bg-white/10 text-zinc-300 font-medium py-2.5 px-4 rounded-[16px] transition-colors border border-white/10 shadow-inner">
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={login}
              className="px-5 py-2.5 rounded-[24px] font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 group overflow-hidden relative hidden sm:block"
              style={{ 
                background: 'rgba(255,255,255,0.06)', 
                border: '1px solid rgba(209,254,184,0.3)',
                boxShadow: '0 0 20px rgba(209,254,184,0.15)'
              }}
            >
              <span className="relative z-10 text-[#D1FEB8] drop-shadow-[0_0_5px_rgba(209,254,184,0.5)]">Log In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D1FEB8]/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
            </button>
          )}

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2 rounded-full text-[#7ab18a] hover:bg-white/10 transition-colors ml-auto relative group pointer-events-auto z-50"
          >
            {isOpen ? <X className="w-7 h-7 drop-shadow-[0_0_8px_#7ab18a]" /> : <img src="https://res.cloudinary.com/dj52ig0l7/image/upload/v1780716914/bgfasuaaieliwlfulzz9.png" alt="Menu" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(122,177,138,0.6)] group-hover:drop-shadow-[0_0_12px_rgba(122,177,138,0.8)] transition-all" referrerPolicy="no-referrer" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute top-[calc(100%+16px)] left-0 right-0 z-40 md:hidden p-4 rounded-[32px] overflow-hidden pointer-events-auto"
            style={{
              background: 'rgba(20, 20, 20, 0.75)',
              backdropFilter: 'blur(45px)',
              WebkitBackdropFilter: 'blur(45px)',
              border: '1px solid rgba(209, 254, 184, 0.25)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 35px rgba(209,254,184,0.1)'
            }}
          >
            <div className="flex flex-col gap-2">
              {activeLinks.map(link => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    onClick={() => setIsOpen(false)} 
                    className={`flex items-center gap-4 p-3.5 rounded-[20px] transition-all duration-300 ${isActive ? 'bg-[#D1FEB8]/15 border border-[#D1FEB8]/40 shadow-[inset_0_0_20px_rgba(209,254,184,0.15)]' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <img 
                      src={isActive ? link.activeImg : link.defaultImg} 
                      alt={link.label} 
                      className={`w-10 h-10 object-contain transition-opacity duration-300 drop-shadow-md ${isActive ? 'opacity-100 filter drop-shadow-[0_0_8px_rgba(209,254,184,0.6)]' : 'opacity-70'}`}
                      referrerPolicy="no-referrer"
                    />
                    <span className={`text-base font-bold tracking-wide ${isActive ? 'text-[#b5d98d] drop-shadow-[0_0_5px_rgba(209,254,184,0.3)]' : 'text-zinc-300'}`}>
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
            
            {user ? (
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-4">
                <div className="flex items-center gap-4 px-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full border-2 border-[#D1FEB8]/40 shadow-[0_0_15px_rgba(209,254,184,0.2)]" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border-2 border-[#D1FEB8]/40 shadow-[0_0_15px_rgba(209,254,184,0.2)]">
                      <User className="w-6 h-6 text-[#D1FEB8]" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-bold text-lg">{user.displayName || 'User'}</p>
                    <p className="text-zinc-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3.5 rounded-[20px] transition-colors border border-red-500/20 shadow-inner"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-white/10">
                <button 
                  onClick={() => { login(); setIsOpen(false); }}
                  className="flex items-center justify-center w-full py-4 rounded-[20px] font-bold transition-all duration-300 relative overflow-hidden"
                  style={{ 
                    background: 'rgba(255,255,255,0.08)', 
                    border: '1px solid rgba(209,254,184,0.4)',
                    boxShadow: '0 0 20px rgba(209,254,184,0.15)'
                  }}
                >
                   <span className="text-[#D1FEB8] drop-shadow-[0_0_5px_rgba(209,254,184,0.5)]">Log In to Instrumuzicover</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}


const Hero = ({ backgroundColor }: { backgroundColor?: string }) => (
  <section 
    className="relative overflow-hidden transition-colors duration-300"
    style={{ 
      backgroundColor: backgroundColor || 'transparent',
      paddingTop: '70px',
      paddingBottom: '17px'
    }}
  >
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left lg:max-w-2xl mx-auto lg:mx-0"
        >
          <h1 
            className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight drop-shadow-xl"
            style={{ fontFamily: 'Courier New, Courier, monospace', textAlign: 'center', fontWeight: 'bold', textDecorationLine: 'none', color: '#b5d98d' }}
          >
            Elevating <span style={{ color: '#7ab18a' }}>Music Production</span> Skills
          </h1>
          <p 
            className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md"
            style={{ textAlign: 'center', color: '#21a721', fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold' }}
          >
            Explore high-quality virtual instruments and professional music sheets designed to capture the sound of creativity.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center lg:justify-end w-full lg:w-auto"
        >
          <div className="relative w-full max-w-5xl lg:max-w-none lg:w-[135%] lg:-ml-[35%] xl:w-[150%] xl:-ml-[150px] z-10">
            {/* Logo Container Frame - rendered directly to preserve its natural aspect ratio */}
            <img 
              src="https://res.cloudinary.com/dj52ig0l7/image/upload/v1780691013/umvpbwlqxiurxsddw4w4.png"
              alt="Logo Container Frame"
              className="w-full h-auto object-contain block relative z-10"
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
    <section id="products" className="py-16 bg-transparent transition-colors duration-300">
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
  <section id="about" className="py-16 bg-transparent transition-colors duration-300">
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-16 items-center">
        <div className="relative order-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80&w=400" alt="Studio" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
              <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400" alt="Microphone" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
            </div>
            <div className="pt-8 space-y-4">
              <img src="/src/assets/images/regenerated_image_1780633271469.png" alt="Piano" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
              <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400" alt="DJ" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-50" />
        </div>
        
        <div className="order-1 text-center flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7ab18a] via-[#b5d98d] to-[#7ab18a] bg-[length:200%_auto] animate-[shine_3s_linear_infinite] mb-8 tracking-tight">About Instrumuzicover</h2>
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
  <section id="contact" className="py-16 bg-transparent transition-colors duration-300">
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
  <footer className="bg-transparent pt-10 pb-10 transition-colors duration-300">
    <div className="leaf-separator">
      <span>🍃</span>
    </div>
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Logo className="w-14 h-14" />
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#7ab18a' }}>Instrumuzicover</span>
          </div>
          <p className="max-w-sm mb-8" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#b5d98d' }}>
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
        
        <div style={{ color: '#7ab18a' }}>
          <h4 className="font-bold mb-6" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#7ab18a', fontSize: '20px' }}>Quick Links</h4>
          <ul className="space-y-4" style={{ color: '#7ab18a', fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold' }}>
            <li><Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" style={{ color: '#b5d98d' }}>Home</Link></li>
            <li><Link to="/performance" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" style={{ color: '#b5d98d' }}>Performance</Link></li>
            <li><Link to="/playlist" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" style={{ color: '#b5d98d' }}>Playlist</Link></li>
            {isAdmin && (
              <li><Link to="/media" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" style={{ color: '#b5d98d' }}>Media</Link></li>
            )}
            <li><Link to="/products" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" style={{ color: '#b5d98d' }}>Product</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" style={{ color: '#b5d98d' }}>Contact</Link></li>
            <li><Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" style={{ color: '#b5d98d' }}>About</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-6" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#7ab18a', fontSize: '20px' }}>Newsletter</h4>
          <p className="text-sm mb-4" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#b5d98d' }}>Subscribe to get updates on new releases and offers.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email" className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-emerald-600 dark:text-white" />
            <button className="bg-zinc-900 dark:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Join</button>
          </div>
        </div>
      </div>
      
      <div className="leaf-separator">
        <span>🍃</span>
      </div>
      
      <div className="flex flex-row justify-between items-center gap-4 text-sm text-zinc-400">
        <p style={{ color: '#b5d98d', fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold' }}>© 2026 Instrumuzicover. All rights reserved.</p>
        <div className="flex gap-8" style={{ color: '#b5d98d', fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold' }}>
          <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-400" style={{ color: '#b5d98d' }}>Privacy Policy</a>
          <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-400" style={{ color: '#b5d98d' }}>Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
  );
};

const ProductsPage = () => {
  const { isAdmin } = useContext(AuthContext);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);
  const [isNotified, setIsNotified] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setIsNotifying(true);
    try {
      await addDoc(collection(db, 'product_notifications'), {
        email: notifyEmail,
        timestamp: new Date().toISOString()
      });
      setIsNotified(true);
      setNotifyEmail('');
      setTimeout(() => setIsNotified(false), 5000);
    } catch (err) {
      console.log("Error storing product notification:", err);
    } finally {
      setIsNotifying(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: newsletterEmail,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.log("Error subscribing to newsletter:", err);
    }
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 5000);
  };

  return (
    <div className="product-page-wrapper-custom min-h-screen">
      <style>{`
        .product-page-wrapper-custom {
          min-height: 100vh;
          color: #082626;
          background:
            radial-gradient(circle at 12% 20%, rgba(155, 232, 89, 0.38), transparent 28%),
            radial-gradient(circle at 88% 30%, rgba(93, 205, 58, 0.28), transparent 32%),
            linear-gradient(135deg, #f9fff5 0%, #edfce8 45%, #fbfff9 100%);
          overflow-x: hidden;
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
          position: relative;
        }

        .product-page-wrapper-custom * {
          box-sizing: border-box;
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
        }

        .product-page-wrapper-custom .product-page {
          position: relative;
          min-height: 100vh;
          padding: 120px 7% 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .product-page-wrapper-custom .product-page::before,
        .product-page-wrapper-custom .product-page::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          background: rgba(107, 203, 62, 0.2);
          filter: blur(45px);
          z-index: 0;
        }

        .product-page-wrapper-custom .product-page::before {
          width: 300px;
          height: 300px;
          top: 80px;
          left: -90px;
        }

        .product-page-wrapper-custom .product-page::after {
          width: 380px;
          height: 380px;
          right: -120px;
          bottom: 90px;
        }

        .product-page-wrapper-custom .product-hero {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1320px;
          min-height: 680px;
          border-radius: 42px;
          padding: 80px 7%;
          overflow: hidden;
          background:
            linear-gradient(120deg, rgba(255,255,255,0.75), rgba(238,255,230,0.58)),
            radial-gradient(circle at 5% 65%, rgba(54, 173, 24, 0.25), transparent 35%),
            radial-gradient(circle at 95% 35%, rgba(88, 204, 56, 0.25), transparent 32%);
          box-shadow:
            0 30px 80px rgba(42, 112, 35, 0.16),
            inset 0 0 0 1px rgba(255,255,255,0.8);
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          align-items: center;
          gap: 70px;
        }

        .product-page-wrapper-custom .product-hero::before {
          content: "";
          position: absolute;
          inset: 18px;
          border-radius: 34px;
          border: 2px solid rgba(255,255,255,0.68);
          pointer-events: none;
          z-index: 1;
        }

        .product-page-wrapper-custom .music-lines {
          position: absolute;
          inset: 0;
          opacity: 0.25;
          background:
            repeating-linear-gradient(
              -12deg,
              transparent 0,
              transparent 42px,
              rgba(92, 180, 47, 0.18) 44px,
              transparent 47px
            );
          mask-image: linear-gradient(to right, transparent, #000 25%, #000 75%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, #000 25%, #000 75%, transparent);
          pointer-events: none;
        }

        .product-page-wrapper-custom .leaf {
          position: absolute;
          width: 48px;
          height: 24px;
          background: linear-gradient(135deg, #8dea3d, #168c25);
          border-radius: 100% 0 100% 0;
          transform: rotate(-35deg);
          box-shadow: inset -6px -3px 12px rgba(0,0,0,0.15);
          opacity: 0.95;
          z-index: 2;
        }

        .product-page-wrapper-custom .leaf::after {
          content: "";
          position: absolute;
          width: 80%;
          height: 1px;
          top: 50%;
          left: 8%;
          background: rgba(255,255,255,0.65);
          transform: rotate(-20deg);
        }

        .product-page-wrapper-custom .leaf.one {
          top: 45px;
          left: 60px;
        }

        .product-page-wrapper-custom .leaf.two {
          top: 95px;
          right: 75px;
          transform: rotate(28deg);
          width: 36px;
          height: 18px;
        }

        .product-page-wrapper-custom .leaf.three {
          bottom: 105px;
          right: 95px;
          transform: rotate(-20deg);
          width: 55px;
          height: 27px;
        }

        .product-page-wrapper-custom .leaf.four {
          bottom: 150px;
          left: 120px;
          transform: rotate(32deg);
          width: 38px;
          height: 19px;
        }

        .product-page-wrapper-custom .hero-content {
          position: relative;
          z-index: 3;
        }

        .product-page-wrapper-custom .badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 12px 20px;
          border-radius: 999px;
          color: #147a22;
          font-weight: 800;
          font-size: 14px;
          background: rgba(232, 255, 218, 0.88);
          border: 1px solid rgba(92, 180, 47, 0.22);
          box-shadow: 0 10px 28px rgba(34, 126, 28, 0.13);
          margin-bottom: 30px;
        }

        .product-page-wrapper-custom h1 {
          font-size: clamp(46px, 6vw, 84px);
          line-height: 1.05;
          letter-spacing: -4px;
          color: #082929;
          margin-bottom: 25px;
        }

        .product-page-wrapper-custom h1 span {
          color: #20a627;
          position: relative;
          display: inline-block;
        }

        .product-page-wrapper-custom h1 span::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 3px;
          width: 100%;
          height: 14px;
          background: url("data:image/svg+xml,%3Csvg width='300' height='35' viewBox='0 0 300 35' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 23C66 8 139 8 295 18' stroke='%2320A627' stroke-width='7' stroke-linecap='round'/%3E%3C/svg%3E") center/100% 100% no-repeat;
          transform: translateY(14px);
        }

        .product-page-wrapper-custom .subtitle {
          max-width: 540px;
          font-size: 18px;
          line-height: 1.8;
          color: #1f3d3b;
          margin-bottom: 36px;
        }

        .product-page-wrapper-custom .notify-card {
          max-width: 530px;
          padding: 18px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.76);
          box-shadow:
            0 18px 40px rgba(38, 111, 28, 0.13),
            inset 0 0 0 1px rgba(255,255,255,0.8);
          backdrop-filter: blur(14px);
        }

        .product-page-wrapper-custom .notify-card input {
          flex: 1;
          height: 54px;
          border: none;
          outline: none;
          background: transparent;
          padding: 0 18px;
          font-size: 15px;
          color: #173936;
        }

        .product-page-wrapper-custom .notify-card input::placeholder {
          color: #7a928e;
        }

        .product-page-wrapper-custom .notify-card button {
          height: 54px;
          padding: 0 28px;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          color: white;
          font-size: 15px;
          font-weight: 800;
          background: linear-gradient(135deg, #6bd932, #02911e);
          box-shadow: 0 14px 28px rgba(18, 149, 31, 0.32);
          transition: 0.3s ease;
          white-space: nowrap;
        }

        .product-page-wrapper-custom .notify-card button:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 35px rgba(18, 149, 31, 0.43);
        }

        .product-page-wrapper-custom .coming-card {
          position: relative;
          z-index: 3;
          padding: 45px;
          min-height: 420px;
          border-radius: 36px;
          background: rgba(255,255,255,0.84);
          box-shadow:
            0 30px 80px rgba(34, 109, 32, 0.18),
            inset 0 0 0 1px rgba(255,255,255,0.85);
          backdrop-filter: blur(18px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .product-page-wrapper-custom .coming-card::before {
          content: "";
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: rgba(103, 220, 62, 0.18);
          filter: blur(25px);
          top: -80px;
          right: -80px;
        }

        .product-page-wrapper-custom .coming-box {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .product-page-wrapper-custom .product-icon {
          width: 130px;
          height: 130px;
          border-radius: 38px;
          display: grid;
          place-items: center;
          margin: 0 auto 28px;
          color: white;
          font-size: 54px;
          background: linear-gradient(135deg, #75df35, #068e22);
          box-shadow:
            0 22px 40px rgba(18, 149, 31, 0.35),
            inset 0 0 0 1px rgba(255,255,255,0.35);
          transform: rotate(-4deg);
        }

        .product-page-wrapper-custom .coming-box h2 {
          font-size: clamp(32px, 4vw, 52px);
          letter-spacing: -2px;
          color: #092b29;
          margin-bottom: 14px;
        }

        .product-page-wrapper-custom .coming-box p {
          color: #31514d;
          line-height: 1.7;
          font-size: 16px;
          max-width: 390px;
          margin: 0 auto 26px;
        }

        .product-page-wrapper-custom .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 22px;
          border-radius: 999px;
          color: #117923;
          font-weight: 800;
          background: #efffec;
          box-shadow: inset 0 0 0 1px rgba(58, 188, 61, 0.18);
        }

        .product-page-wrapper-custom .status-pill i {
          animation: spin 2.4s linear infinite;
        }

        .product-page-wrapper-custom .floating-note {
          position: absolute;
          color: rgba(30, 157, 36, 0.24);
          font-size: 44px;
          z-index: 1;
          animation: float 5s ease-in-out infinite;
        }

        .product-page-wrapper-custom .note-one {
          left: 8%;
          top: 22%;
        }

        .product-page-wrapper-custom .note-two {
          right: 10%;
          bottom: 18%;
          animation-delay: 1s;
        }

        .product-page-wrapper-custom .note-three {
          right: 28%;
          top: 12%;
          font-size: 30px;
          animation-delay: 1.7s;
        }

        .product-page-wrapper-custom .footer {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1320px;
          margin: 46px auto 0;
          padding: 55px 5% 28px;
          border-radius: 36px;
          background: rgba(255,255,255,0.56);
          box-shadow: 0 20px 60px rgba(55, 110, 44, 0.12);
          backdrop-filter: blur(16px);
        }

        .product-page-wrapper-custom .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr 1.2fr;
          gap: 60px;
          margin-bottom: 34px;
        }

        .product-page-wrapper-custom .footer h3 {
          font-size: 22px;
          margin-bottom: 22px;
          color: #092b29;
        }

        .product-page-wrapper-custom .footer h3 i {
          color: #25a92b;
          margin-right: 8px;
        }

        .product-page-wrapper-custom .footer p {
          color: #244440;
          line-height: 1.8;
          max-width: 350px;
        }

        .product-page-wrapper-custom .footer-links {
          list-style: none;
          display: grid;
          gap: 12px;
        }

        .product-page-wrapper-custom .footer-links a {
          text-decoration: none;
          color: #143734;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          transition: 0.25s ease;
        }

        .product-page-wrapper-custom .footer-links a:hover {
          color: #159b28;
          transform: translateX(5px);
        }

        .product-page-wrapper-custom .newsletter {
          display: flex;
          max-width: 390px;
          margin-top: 24px;
          background: white;
          border-radius: 999px;
          padding: 8px;
          box-shadow: 0 12px 30px rgba(43, 103, 39, 0.12);
        }

        .product-page-wrapper-custom .newsletter input {
          height: 48px;
          box-shadow: none;
          border: none;
          padding: 0 18px;
          border-radius: 999px;
          width: 100%;
        }

        .product-page-wrapper-custom .newsletter button {
          border: none;
          min-width: 100px;
          border-radius: 999px;
          background: linear-gradient(135deg, #57ce31, #07931f);
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .product-page-wrapper-custom .footer-bottom {
          border-top: 1px solid rgba(36, 94, 40, 0.13);
          padding-top: 22px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 14px;
          color: #173936;
        }

        .product-page-wrapper-custom .footer-bottom a {
          color: #173936;
          text-decoration: none;
          margin-left: 24px;
        }

        .product-page-wrapper-custom .footer-bottom a:hover {
          color: #159b28;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-18px) rotate(8deg);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1050px) {
          .product-page-wrapper-custom .product-hero {
            grid-template-columns: 1fr;
            padding: 60px 6%;
            gap: 45px;
          }

          .product-page-wrapper-custom .coming-card {
            max-width: 760px;
          }

          .product-page-wrapper-custom .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 700px) {
          .product-page-wrapper-custom .product-page {
            padding: 100px 4% 40px;
          }

          .product-page-wrapper-custom .product-hero {
            border-radius: 28px;
            padding: 45px 22px;
          }

          .product-page-wrapper-custom .product-hero::before {
            inset: 10px;
            border-radius: 22px;
          }

          .product-page-wrapper-custom h1 {
            letter-spacing: -2px;
          }

          .product-page-wrapper-custom .notify-card {
            border-radius: 26px;
            flex-direction: column;
            align-items: stretch;
            padding: 14px;
          }

          .product-page-wrapper-custom .notify-card input {
            width: 100%;
          }

          .product-page-wrapper-custom .notify-card button {
            width: 100%;
          }

          .product-page-wrapper-custom .coming-card {
            padding: 32px 20px;
            border-radius: 26px;
            min-height: 360px;
          }

          .product-page-wrapper-custom .product-icon {
            width: 105px;
            height: 105px;
            font-size: 44px;
            border-radius: 30px;
          }

          .product-page-wrapper-custom .footer-grid {
            grid-template-columns: 1fr;
            gap: 38px;
          }

          .product-page-wrapper-custom .footer-bottom {
            flex-direction: column;
          }

          .product-page-wrapper-custom .footer-bottom a {
            margin-left: 0;
            margin-right: 18px;
          }
        }
      `}</style>
      <main className="product-page">
        <section className="product-hero">
          <div className="music-lines"></div>

          <span className="leaf one"></span>
          <span className="leaf two"></span>
          <span className="leaf three"></span>
          <span className="leaf four"></span>

          <i className="fa-solid fa-music floating-note note-one"></i>
          <i className="fa-solid fa-headphones floating-note note-two"></i>
          <i className="fa-solid fa-guitar floating-note note-three"></i>

          <div className="hero-content">
            <div className="badge">
              <i className="fa-solid fa-leaf"></i>
              Product Page
            </div>

            <h1>
              Our products are <br />
              <span>coming soon</span>
            </h1>

            <p className="subtitle">
              We are preparing a fresh collection of virtual instruments, music sheets,
              and creative tools designed to elevate your sound.
            </p>

            {isNotified ? (
              <div className="max-w-[530px] p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
                <span>🔔</span> Awesome! You will be notified immediately when we launch.
              </div>
            ) : (
              <form className="notify-card" onSubmit={handleNotifySubmit}>
                <input 
                  type="email" 
                  placeholder="Enter your email for updates" 
                  required 
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                />
                <button type="submit" disabled={isNotifying}>
                  {isNotifying ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <i className="fa-solid fa-bell"></i>
                      Notify Me
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="coming-card">
            <div className="coming-box">
              <div className="product-icon">
                <i className="fa-solid fa-box-open"></i>
              </div>

              <h2>Coming Soon</h2>

              <p>
                New music products are on the way. Stay tuned for something inspiring,
                creative, and powerful.
              </p>

              <div className="status-pill">
                <i className="fa-solid fa-spinner animate-spin"></i>
                In Development
              </div>
            </div>
          </div>
        </section>

        <footer className="footer animate-fade-in">
          <div className="footer-grid">
            <div>
              <h3>Instrumuzicover</h3>
              <p>
                The ultimate destination for virtual instruments and music sheets.
                Elevate your production with professional tools.
              </p>

              <div className="socials" style={{ marginTop: '24px' }}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram"></i></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-twitter"></i></a>
                <a href="https://www.youtube.com/@dylanchrey" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube"></i></a>
              </div>
            </div>

            <div>
              <h3><i className="fa-solid fa-leaf"></i>Quick Links</h3>
              <ul className="footer-links">
                <li><Link to="/">Home <span>›</span></Link></li>
                <li><Link to="/performance">Performance <span>›</span></Link></li>
                <li><Link to="/playlist">Playlist <span>›</span></Link></li>
                <li><Link to="/products">Product <span>›</span></Link></li>
                <li><Link to="/contact">Contact <span>›</span></Link></li>
                <li><Link to="/about">About <span>›</span></Link></li>
                {isAdmin && <li><Link to="/media">Media <span>›</span></Link></li>}
              </ul>
            </div>

            <div>
              <h3><i className="fa-solid fa-leaf"></i>Newsletter</h3>
              {newsletterSubscribed ? (
                <p className="text-emerald-700 font-bold text-sm bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  🌱 Thank you! You've successfully subscribed to our newsletter.
                </p>
              ) : (
                <>
                  <p>
                    Subscribe to get updates on new releases and offers.
                  </p>
                  <form className="newsletter" onSubmit={handleNewsletterSubmit}>
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                      required 
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                    <button type="submit">Join</button>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Instrumuzicover. All rights reserved.</p>
            <div>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

const ContactPage = () => {
  const { isAdmin } = useContext(AuthContext);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.message) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        ...formData,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.log("Error storing contact message:", err);
    }
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
      setTimeout(() => setIsSent(false), 5000);
    }, 1200);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: newsletterEmail,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.log("Error subscribing to newsletter:", err);
    }
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 5000);
  };

  return (
    <div className="contact-page-wrapper-custom min-h-screen">
      <style>{`
        .contact-page-wrapper-custom {
          min-height: 100vh;
          color: #082626;
          background:
            radial-gradient(circle at 15% 15%, rgba(145, 224, 83, 0.35), transparent 28%),
            radial-gradient(circle at 85% 30%, rgba(106, 206, 62, 0.28), transparent 30%),
            linear-gradient(135deg, #f8fff4 0%, #eefce9 45%, #fafff8 100%);
          overflow-x: hidden;
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
          position: relative;
        }

        .contact-page-wrapper-custom * {
          box-sizing: border-box;
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
        }

        .contact-page-wrapper-custom .page {
          position: relative;
          min-height: 100vh;
          padding: 120px 7% 60px;
        }

        .contact-page-wrapper-custom .page::before,
        .contact-page-wrapper-custom .page::after {
          content: "";
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: rgba(105, 196, 60, 0.18);
          filter: blur(40px);
          z-index: 0;
        }

        .contact-page-wrapper-custom .page::before {
          top: 80px;
          left: -90px;
        }

        .contact-page-wrapper-custom .page::after {
          right: -100px;
          bottom: 120px;
        }

        .contact-page-wrapper-custom .contact-section {
          position: relative;
          z-index: 2;
          max-width: 1320px;
          margin: 0 auto;
          min-height: 720px;
          border-radius: 42px;
          padding: 70px 7%;
          background:
            linear-gradient(120deg, rgba(255,255,255,0.72), rgba(236,255,230,0.55)),
            radial-gradient(circle at 0% 60%, rgba(58, 173, 27, 0.25), transparent 35%),
            radial-gradient(circle at 95% 40%, rgba(88, 204, 56, 0.24), transparent 30%);
          box-shadow:
            0 30px 80px rgba(42, 112, 35, 0.15),
            inset 0 0 0 1px rgba(255,255,255,0.8);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 70px;
          align-items: center;
        }

        .contact-page-wrapper-custom .contact-section::before {
          content: "";
          position: absolute;
          inset: 18px;
          border-radius: 34px;
          border: 2px solid rgba(255,255,255,0.65);
          pointer-events: none;
        }

        .contact-page-wrapper-custom .music-lines {
          position: absolute;
          inset: 0;
          opacity: 0.24;
          background:
            repeating-linear-gradient(
              -12deg,
              transparent 0,
              transparent 42px,
              rgba(92, 180, 47, 0.18) 44px,
              transparent 47px
            );
          mask-image: linear-gradient(to right, transparent, #000 25%, #000 75%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, #000 25%, #000 75%, transparent);
          pointer-events: none;
        }

        .contact-page-wrapper-custom .leaf {
          position: absolute;
          width: 45px;
          height: 22px;
          background: linear-gradient(135deg, #7ee235, #188c25);
          border-radius: 100% 0 100% 0;
          transform: rotate(-35deg);
          box-shadow: inset -6px -3px 12px rgba(0,0,0,0.15);
          opacity: 0.9;
          z-index: 1;
        }

        .contact-page-wrapper-custom .leaf::after {
          content: "";
          position: absolute;
          width: 80%;
          height: 1px;
          top: 50%;
          left: 8%;
          background: rgba(255,255,255,0.6);
          transform: rotate(-20deg);
        }

        .contact-page-wrapper-custom .leaf.one {
          top: 45px;
          left: 60px;
        }

        .contact-page-wrapper-custom .leaf.two {
          top: 110px;
          right: 55px;
          transform: rotate(25deg);
          width: 34px;
          height: 17px;
        }

        .contact-page-wrapper-custom .leaf.three {
          bottom: 130px;
          right: 90px;
          transform: rotate(-20deg);
          width: 52px;
          height: 26px;
        }

        .contact-page-wrapper-custom .leaf.four {
          bottom: 170px;
          left: 120px;
          transform: rotate(30deg);
          width: 38px;
          height: 19px;
        }

        .contact-page-wrapper-custom .left-content {
          position: relative;
          z-index: 3;
        }

        .contact-page-wrapper-custom .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 18px;
          border-radius: 999px;
          color: #147a22;
          font-weight: 700;
          font-size: 14px;
          background: rgba(232, 255, 218, 0.85);
          border: 1px solid rgba(92, 180, 47, 0.2);
          box-shadow: 0 10px 28px rgba(34, 126, 28, 0.12);
          margin-bottom: 30px;
        }

        .contact-page-wrapper-custom h1 {
          font-size: clamp(42px, 5vw, 72px);
          line-height: 1.08;
          letter-spacing: -3px;
          color: #082929;
          margin-bottom: 24px;
        }

        .contact-page-wrapper-custom h1 span {
          color: #20a627;
          position: relative;
          display: inline-block;
        }

        .contact-page-wrapper-custom h1 span::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 2px;
          width: 100%;
          height: 13px;
          background: url("data:image/svg+xml,%3Csvg width='300' height='35' viewBox='0 0 300 35' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 23C66 8 139 8 295 18' stroke='%2320A627' stroke-width='7' stroke-linecap='round'/%3E%3C/svg%3E") center/100% 100% no-repeat;
          transform: translateY(13px);
        }

        .contact-page-wrapper-custom .intro {
          max-width: 460px;
          font-size: 17px;
          line-height: 1.8;
          color: #1f3d3b;
          margin-bottom: 34px;
        }

        .contact-page-wrapper-custom .info-cards {
          display: grid;
          gap: 18px;
          max-width: 430px;
        }

        .contact-page-wrapper-custom .info-card {
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 17px 24px;
          border-radius: 999px;
          background: rgba(255,255,255,0.78);
          box-shadow:
            0 15px 35px rgba(38, 111, 28, 0.13),
            inset 0 0 0 1px rgba(255,255,255,0.75);
          backdrop-filter: blur(14px);
        }

        .contact-page-wrapper-custom .info-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: white;
          font-size: 22px;
          background: linear-gradient(135deg, #65d93a, #079223);
          box-shadow: 0 12px 25px rgba(17, 160, 31, 0.35);
          flex: 0 0 auto;
        }

        .contact-page-wrapper-custom .info-card small {
          display: block;
          font-size: 14px;
          color: #31514d;
          margin-bottom: 4px;
        }

        .contact-page-wrapper-custom .info-card strong {
          font-size: 16px;
          color: #082929;
        }

        .contact-page-wrapper-custom .socials {
          display: flex;
          gap: 16px;
          margin-top: 5px;
        }

        .contact-page-wrapper-custom .socials a {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: white !important;
          background: #0d7f2c;
          text-decoration: none;
          font-size: 14px;
          transition: 0.3s ease;
        }

        .contact-page-wrapper-custom .socials a:hover {
          transform: translateY(-4px);
          background: #25b52d;
        }

        .contact-page-wrapper-custom .form-card {
          position: relative;
          z-index: 3;
          padding: 46px;
          border-radius: 36px;
          background: rgba(255,255,255,0.86);
          box-shadow:
            0 30px 80px rgba(34, 109, 32, 0.18),
            inset 0 0 0 1px rgba(255,255,255,0.85);
          backdrop-filter: blur(18px);
        }

        .contact-page-wrapper-custom .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .contact-page-wrapper-custom .field {
          margin-bottom: 24px;
        }

        .contact-page-wrapper-custom .field label {
          display: flex;
          align-items: center;
          gap: 9px;
          font-weight: 700;
          font-size: 14px;
          color: #113231;
          margin-bottom: 10px;
        }

        .contact-page-wrapper-custom .field label i {
          color: #15912b;
        }

        .contact-page-wrapper-custom .input-wrap {
          position: relative;
        }

        .contact-page-wrapper-custom .input-wrap i {
          position: absolute;
          top: 50%;
          left: 20px;
          transform: translateY(-50%);
          color: #168c2d;
          font-size: 18px;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: #f1fff0;
        }

        .contact-page-wrapper-custom input,
        .contact-page-wrapper-custom textarea {
          width: 100%;
          border: 1px solid rgba(67, 129, 75, 0.18);
          outline: none;
          border-radius: 16px;
          background: rgba(255,255,255,0.95);
          color: #153735;
          font-size: 16px;
          box-shadow: 0 10px 24px rgba(36, 88, 32, 0.06);
          transition: 0.25s ease;
        }

        .contact-page-wrapper-custom input {
          height: 66px;
          padding: 0 20px 0 75px;
        }

        .contact-page-wrapper-custom textarea {
          min-height: 160px;
          resize: vertical;
          padding: 22px;
          line-height: 1.6;
        }

        .contact-page-wrapper-custom input:focus,
        .contact-page-wrapper-custom textarea:focus {
          border-color: #3abc3d;
          box-shadow: 0 0 0 5px rgba(75, 199, 57, 0.12);
        }

        .contact-page-wrapper-custom .send-btn {
          position: relative;
          width: 100%;
          height: 72px;
          border: none;
          border-radius: 18px;
          cursor: pointer;
          color: white;
          font-weight: 800;
          font-size: 18px;
          background: linear-gradient(135deg, #6bd932, #02911e);
          box-shadow: 0 18px 35px rgba(18, 149, 31, 0.35);
          overflow: hidden;
          transition: 0.3s ease;
        }

        .contact-page-wrapper-custom .send-btn i {
          margin-right: 12px;
        }

        .contact-page-wrapper-custom .send-btn::after {
          content: "";
          position: absolute;
          width: 44px;
          height: 44px;
          right: 28px;
          top: 50%;
          transform: translateY(-50%);
          border-radius: 50%;
          background: rgba(255, 245, 85, 0.75);
          box-shadow: 0 0 24px rgba(255, 245, 85, 0.8);
        }

        .contact-page-wrapper-custom .send-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 45px rgba(18, 149, 31, 0.45);
        }

        .contact-page-wrapper-custom .footer {
          position: relative;
          z-index: 2;
          max-width: 1320px;
          margin: 46px auto 0;
          padding: 55px 5% 28px;
          border-radius: 36px;
          background: rgba(255,255,255,0.56);
          box-shadow: 0 20px 60px rgba(55, 110, 44, 0.12);
          backdrop-filter: blur(16px);
        }

        .contact-page-wrapper-custom .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr 1.2fr;
          gap: 60px;
          margin-bottom: 34px;
        }

        .contact-page-wrapper-custom .footer h3 {
          font-size: 22px;
          margin-bottom: 22px;
          color: #092b29;
        }

        .contact-page-wrapper-custom .footer h3 i {
          color: #25a92b;
          margin-right: 8px;
        }

        .contact-page-wrapper-custom .footer p {
          color: #244440;
          line-height: 1.8;
          max-width: 350px;
        }

        .contact-page-wrapper-custom .footer-links {
          list-style: none;
          display: grid;
          gap: 12px;
        }

        .contact-page-wrapper-custom .footer-links a {
          text-decoration: none;
          color: #143734;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          transition: 0.25s ease;
        }

        .contact-page-wrapper-custom .footer-links a:hover {
          color: #159b28;
          transform: translateX(5px);
        }

        .contact-page-wrapper-custom .newsletter {
          display: flex;
          max-width: 390px;
          margin-top: 24px;
          background: white;
          border-radius: 999px;
          padding: 8px;
          box-shadow: 0 12px 30px rgba(43, 103, 39, 0.12);
        }

        .contact-page-wrapper-custom .newsletter input {
          height: 48px;
          box-shadow: none;
          border: none;
          padding: 0 18px;
          border-radius: 999px;
        }

        .contact-page-wrapper-custom .newsletter button {
          border: none;
          min-width: 100px;
          border-radius: 999px;
          background: linear-gradient(135deg, #57ce31, #07931f);
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .contact-page-wrapper-custom .footer-bottom {
          border-top: 1px solid rgba(36, 94, 40, 0.13);
          padding-top: 22px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 14px;
          color: #173936;
        }

        .contact-page-wrapper-custom .footer-bottom a {
          color: #173936;
          text-decoration: none;
          margin-left: 24px;
        }

        .contact-page-wrapper-custom .footer-bottom a:hover {
          color: #159b28;
        }

        @media (max-width: 1050px) {
          .contact-page-wrapper-custom .contact-section {
            grid-template-columns: 1fr;
            padding: 55px 6%;
            gap: 45px;
          }

          .contact-page-wrapper-custom .form-card {
            max-width: 760px;
          }

          .contact-page-wrapper-custom .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 700px) {
          .contact-page-wrapper-custom .page {
            padding: 100px 4% 40px;
          }

          .contact-page-wrapper-custom .contact-section {
            border-radius: 28px;
            padding: 42px 22px;
          }

          .contact-page-wrapper-custom .contact-section::before {
            inset: 10px;
            border-radius: 22px;
          }

          .contact-page-wrapper-custom h1 {
            letter-spacing: -1.8px;
          }

          .contact-page-wrapper-custom .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .contact-page-wrapper-custom .form-card {
            padding: 28px 20px;
            border-radius: 26px;
          }

          .contact-page-wrapper-custom .info-card {
            border-radius: 24px;
            align-items: flex-start;
          }

          .contact-page-wrapper-custom .footer-grid {
            grid-template-columns: 1fr;
            gap: 38px;
          }

          .contact-page-wrapper-custom .footer-bottom {
            flex-direction: column;
          }

          .contact-page-wrapper-custom .footer-bottom a {
            margin-left: 0;
            margin-right: 18px;
          }
        }
      `}</style>
      <main className="page">
        <section className="contact-section">
          <div className="music-lines"></div>

          <span className="leaf one"></span>
          <span className="leaf two"></span>
          <span className="leaf three"></span>
          <span className="leaf four"></span>

          <div className="left-content">
            <div className="badge">
              <i className="fa-solid fa-leaf"></i>
              Get In Touch
            </div>

            <h1>
              Ready to transform <br />
              your <span>sound?</span>
            </h1>

            <p className="intro">
              Get in touch with us for custom requests, support, or collaboration
              opportunities.
            </p>

            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">
                  <i className="fa-regular fa-envelope"></i>
                </div>
                <div>
                  <small>Email us at</small>
                  <strong>hello@instrumuzicover.com</strong>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fa-solid fa-paper-plane"></i>
                </div>
                <div>
                  <small>Response time</small>
                  <strong>Within 24 hours</strong>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fa-solid fa-earth-americas"></i>
                </div>
                <div>
                  <small>Follow our journey</small>
                  <div className="socials">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram"></i></a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-twitter"></i></a>
                    <a href="https://www.youtube.com/@dylanchrey" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form className="form-card" onSubmit={handleSubmit}>
            {isSent && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
                <span>🍃</span> Message sent successfully! We will get back to you soon.
              </div>
            )}
            <div className="form-row">
              <div className="field">
                <label>
                  <i className="fa-regular fa-user"></i>
                  First Name
                </label>
                <div className="input-wrap">
                  <i className="fa-regular fa-user"></i>
                  <input 
                    type="text" 
                    placeholder="John" 
                    required 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>

              <div className="field">
                <label>
                  <i className="fa-regular fa-user"></i>
                  Last Name
                </label>
                <div className="input-wrap">
                  <i className="fa-regular fa-user"></i>
                  <input 
                    type="text" 
                    placeholder="Doe" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="field">
              <label>
                <i className="fa-regular fa-envelope"></i>
                Email Address
              </label>
              <div className="input-wrap">
                <i className="fa-regular fa-envelope"></i>
                <input 
                  type="email" 
                  placeholder="john@example.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <label>
                <i className="fa-regular fa-message"></i>
                Message
              </label>
              <textarea 
                placeholder="How can we help?" 
                required 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="send-btn" disabled={isSending}>
              {isSending ? (
                <span>Sending...</span>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  Send Message
                </>
              )}
            </button>
          </form>
        </section>

        <footer className="footer animate-fade-in">
          <div className="footer-grid">
            <div>
              <h3>Instrumuzicover</h3>
              <p>
                The ultimate destination for virtual instruments and music sheets.
                Elevate your production with professional tools.
              </p>

              <div className="socials" style={{ marginTop: '24px' }}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram"></i></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-twitter"></i></a>
                <a href="https://www.youtube.com/@dylanchrey" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-youtube"></i></a>
              </div>
            </div>

            <div>
              <h3><i className="fa-solid fa-leaf"></i>Quick Links</h3>
              <ul className="footer-links">
                <li><Link to="/">Home <span>›</span></Link></li>
                <li><Link to="/performance">Performance <span>›</span></Link></li>
                <li><Link to="/playlist">Playlist <span>›</span></Link></li>
                <li><Link to="/products">Product <span>›</span></Link></li>
                <li><Link to="/contact">Contact <span>›</span></Link></li>
                <li><Link to="/about">About <span>›</span></Link></li>
                {isAdmin && <li><Link to="/media">Media <span>›</span></Link></li>}
              </ul>
            </div>

            <div>
              <h3><i className="fa-solid fa-leaf"></i>Newsletter</h3>
              {newsletterSubscribed ? (
                <p className="text-emerald-700 font-bold text-sm bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  🌱 Thank you! You've successfully subscribed to our newsletter.
                </p>
              ) : (
                <>
                  <p>
                    Subscribe to get updates on new releases and offers.
                  </p>
                  <form className="newsletter" onSubmit={handleNewsletterSubmit}>
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                      required 
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                    <button type="submit">Join</button>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Instrumuzicover. All rights reserved.</p>
            <div>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

const NewPerformanceSection = ({ backgroundColor }: { backgroundColor?: string }) => {
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
    <section 
      className="pt-8 pb-16 transition-colors duration-300"
      style={{ backgroundColor: backgroundColor || 'transparent' }}
    >
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Separator Line (between Hero and New Performance Section) */}
        <div className="leaf-separator">
          <span>🍃</span>
        </div>

        <div className="flex justify-center mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', fontSize: '35px', color: '#7ab18a' }}>New Performance</h2>
            <p className="max-w-2xl" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'normal', color: '#b5d98d' }}>Check out the latest performance uploaded by our community.</p>
          </div>
        </div>

        <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative w-full mb-8 px-4 sm:px-6 md:px-8"
          >
            <div 
              className="relative w-full aspect-video rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer shadow-2xl"
              onClick={() => setSelectedVideoIndex(0)}
            >
              {/* Video Thumbnail */}
              <img 
                src={latestPerformance.image} 
                alt={latestPerformance.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                referrerPolicy="no-referrer" 
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Play className="w-10 h-10 ml-1.5" />
                </div>
              </div>
              
              {/* Views - Bottom Left */}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] bg-black/40 px-3 py-1 rounded-full">
                <Eye className="w-4 h-4" />
                {latestPerformance.views} views
              </div>
   
              {/* Date - Bottom Right */}
              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] bg-black/40 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4" />
                {(() => {
                  const d = new Date(latestPerformance.dateUploaded);
                  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                })()}
              </div>
            </div>

            {/* Frame Container Overlay in front of the video and extending slightly beyond it */}
            <div 
              className="absolute -top-4 sm:-top-8 md:-top-12 -bottom-4 sm:-bottom-8 md:-bottom-12 -left-1 sm:-left-3 md:-left-6 -right-1 sm:-right-3 md:-right-6 z-30 pointer-events-none"
              style={{ 
                backgroundImage: "url('https://res.cloudinary.com/dj52ig0l7/image/upload/v1780633685/hybpiqlnxum5t90jgisn.png')",
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: 'transparent'
              }}
            />
          </motion.div>
 
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center"
          >
            <h3 className="text-3xl font-bold mb-2" style={{ color: '#7ab18a', fontFamily: 'Courier New, Courier, monospace' }}>{latestPerformance.title}</h3>
            <p className="text-xl mb-2" style={{ color: '#b5d98d', fontFamily: 'Courier New, Courier, monospace' }}>by {latestPerformance.artist}</p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#00bc7d' }}>
                <span className="text-[#00bc7d]">{getInstrumentIcon(latestPerformance.instrument, "w-5 h-5 text-[#00bc7d]")}</span>
                {formatInstrumentName(latestPerformance.instrument)}
              </div>
              <div className={`flex items-center gap-2 text-sm font-bold ${getDifficultyColor(latestPerformance.difficulty)}`} style={{ fontFamily: 'Courier New, Courier, monospace' }}>
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

        {/* Separator Line */}
        <div className="leaf-separator">
          <span>🍃</span>
        </div>

        {/* New Sections: Latest and Popular */}
        <div className="flex flex-col gap-12">
          {/* Latest Performances */}
          <div className="flex flex-col items-center">
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', fontSize: '35px', color: '#7ab18a' }}>Latest Performances</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {performances.slice(1, 4).map((perf, idx) => (
                <motion.div 
                  key={perf.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedVideoIndex(performances.indexOf(perf))}
                  className="group cursor-pointer"
                >
                  <div className="relative w-full mb-3 px-3 sm:px-4 md:px-5">
                    <div className="aspect-video rounded-xl overflow-hidden relative shadow-md">
                      <img src={perf.image} alt={perf.title} className="w-full h-full object-cover group-hover:scale-105" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    {/* Frame Container Overlay */}
                    <div 
                      className="absolute -top-3 sm:-top-5 md:-top-7 -bottom-3 sm:-bottom-5 md:-bottom-7 -left-1 sm:-left-1.5 md:-left-2 -right-1 sm:-right-1.5 md:-right-2 z-30 pointer-events-none"
                      style={{ 
                        backgroundImage: "url('https://res.cloudinary.com/dj52ig0l7/image/upload/v1780633685/hybpiqlnxum5t90jgisn.png')",
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: 'transparent'
                      }}
                    />
                  </div>
                  <div className="text-center pt-1">
                    <h4 className="text-xl font-bold mb-1 line-clamp-1" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#7ab18a' }}>{perf.title}</h4>
                    <div className="flex items-center justify-center gap-2 text-base mb-2">
                      <User className="w-5 h-5" style={{ color: '#b5d98d' }} />
                      <span style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#b5d98d' }}>{perf.artist}</span>
                    </div>
                    <div className="flex justify-center gap-2">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        {getInstrumentIcon(perf.instrument, "w-4 h-4 text-[#7ab18a]")}
                        <span style={{ color: '#7ab18a', fontWeight: 'bold', fontFamily: 'Courier New, Courier, monospace' }}>{formatInstrumentName(perf.instrument)}</span>
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
              <h3 className="text-2xl font-bold" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', fontSize: '35px', color: '#7ab18a' }}>Popular</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {[...performances].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3).map((perf, idx) => (
                <motion.div 
                  key={perf.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedVideoIndex(performances.indexOf(perf))}
                  className="group cursor-pointer"
                >
                  <div className="relative w-full mb-3 px-3 sm:px-4 md:px-5">
                    <div className="aspect-video rounded-xl overflow-hidden relative shadow-md">
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
                    {/* Frame Container Overlay */}
                    <div 
                      className="absolute -top-3 sm:-top-5 md:-top-7 -bottom-3 sm:-bottom-5 md:-bottom-7 -left-1 sm:-left-1.5 md:-left-2 -right-1 sm:-right-1.5 md:-right-2 z-30 pointer-events-none"
                      style={{ 
                        backgroundImage: "url('https://res.cloudinary.com/dj52ig0l7/image/upload/v1780633685/hybpiqlnxum5t90jgisn.png')",
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: 'transparent'
                      }}
                    />
                  </div>
                  <div className="text-center pt-1">
                    <h4 className="text-xl font-bold mb-1 line-clamp-1" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#7ab18a' }}>{perf.title}</h4>
                    <div className="flex items-center justify-center gap-2 text-base mb-2">
                      <User className="w-5 h-5" style={{ color: '#b5d98d' }} />
                      <span style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#b5d98d' }}>{perf.artist}</span>
                    </div>
                    <div className="flex justify-center gap-2">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        {getInstrumentIcon(perf.instrument, "w-4 h-4 text-[#7ab18a]")}
                        <span style={{ color: '#7ab18a', fontWeight: 'bold', fontFamily: 'Courier New, Courier, monospace' }}>{formatInstrumentName(perf.instrument)}</span>
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

const DynamicEditablePage = ({ 
  collectionName, 
  fixedSections = [],
  renderExtraSection
}: { 
  collectionName: string, 
  fixedSections?: any[],
  renderExtraSection?: (section: any) => React.ReactNode
}) => {
  const { isEditMode, setIsEditMode, isAdmin, showExitConfirmation, setShowExitConfirmation } = useContext(AuthContext);
  const location = useLocation();
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [targetRowIndex, setTargetRowIndex] = useState<number | undefined>();
  const [targetSlotIndex, setTargetSlotIndex] = useState<number | undefined>();

  const cloudinaryConfig = {
    cloudName: localStorage.getItem('cloudinary_cloud_name') || '',
    uploadPreset: localStorage.getItem('cloudinary_upload_preset') || ''
  };

  const handleAddRows = async (columnCount: number, sectionId?: string, position?: 'top' | 'bottom', referenceRowId?: string, rowCount: number = 1) => {
    const targetId = sectionId || selectedSectionId;
    if (!targetId || !isAdmin) return;
    const section = sections.find(s => s.id === targetId);
    if (!section) return;

    try {
      const sectionRef = doc(db, collectionName, targetId);
      const finalRowCount = rowCount || 1;
      const newRows = Array.from({ length: finalRowCount }).map(() => ({
        id: Math.random().toString(36).substring(2, 9),
        layout: `${columnCount}-col`,
        items: [],
        width: columnCount === 1 ? '30%' : '100%',
        align: 'center'
      }));

      const currentRows = section.rows || [];
      let updatedRows = [...currentRows];

      if (referenceRowId) {
        const refIndex = updatedRows.findIndex(r => r.id === referenceRowId);
        if (refIndex !== -1) {
          if (position === 'top') {
            updatedRows.splice(refIndex, 0, ...newRows);
          } else {
            updatedRows.splice(refIndex + 1, 0, ...newRows);
          }
        }
      } else {
        if (position === 'top') {
          updatedRows.unshift(...newRows);
        } else {
          updatedRows.push(...newRows);
        }
      }

      await updateDoc(sectionRef, { 
        rows: updatedRows,
        type: 'dynamic'
      });
    } catch (error) {
      console.error("Error updating layout:", error);
    }
  };

  const handleAddItem = async (type: 'image' | 'video' | 'text', url?: string, rowIndex?: number, slotIndex?: number, initialContent?: any) => {
    const targetId = targetSectionId || selectedSectionId;
    if (!targetId || !isAdmin) return;
    const section = sections.find(s => s.id === targetId);
    if (!section) return;

    try {
      const sectionRef = doc(db, collectionName, targetId);
      const itemUrl = url || (type === 'image' ? 'https://picsum.photos/seed/music/800/600' : '');
      
      const currentRows = section.rows || [];
      let updatedRows = JSON.parse(JSON.stringify(currentRows));

      const newItem = { 
        id: Math.random().toString(36).substring(2, 9),
        type, 
        url: itemUrl,
        heading: initialContent?.heading || '',
        description: initialContent?.description || '',
        align: 'center',
        textColor: '#ffffff',
        fontSize: 'base',
        headingPosition: 'top',
        ...initialContent
      };

      if (updatedRows.length === 0) {
        updatedRows.push({
          id: Math.random().toString(36).substring(2, 9),
          layout: '1-col',
          items: [newItem]
        });
      } else {
        const targetRow = (rowIndex !== undefined && updatedRows[rowIndex]) ? updatedRows[rowIndex] : updatedRows[updatedRows.length - 1];
        if (!targetRow.items) targetRow.items = [];
        
        if (slotIndex !== undefined) {
          targetRow.items[slotIndex] = newItem;
        } else {
          targetRow.items.push(newItem);
        }
      }

      await updateDoc(sectionRef, { 
        rows: updatedRows,
        type: 'dynamic'
      });
      setIsMediaModalOpen(false);
      setTargetSectionId(null);
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
    }
  };

  const handleUpdateItem = async (updates: any) => {
    if (!selectedItemId || !isAdmin) return;
    
    let targetSection: any = null;
    let targetRowIndex: number = -1;
    let targetItemIndex: number = -1;

    for (const section of sections) {
      if (!section.rows) continue;
      for (let rIdx = 0; rIdx < section.rows.length; rIdx++) {
        const row = section.rows[rIdx];
        const iIdx = (row.items || []).findIndex((item: any) => item?.id === selectedItemId);
        if (iIdx !== -1) {
          targetSection = section;
          targetRowIndex = rIdx;
          targetItemIndex = iIdx;
          break;
        }
      }
      if (targetSection) break;
    }

    if (!targetSection) return;

    try {
      const sectionRef = doc(db, collectionName, targetSection.id);
      const updatedRows = JSON.parse(JSON.stringify(targetSection.rows));
      updatedRows[targetRowIndex].items[targetItemIndex] = {
        ...updatedRows[targetRowIndex].items[targetItemIndex],
        ...updates
      };

      await updateDoc(sectionRef, { rows: updatedRows });
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleUpdateSection = async (updates: any) => {
    const targetId = selectedSectionId;
    if (!targetId || !isAdmin) return;
    try {
      const sectionRef = doc(db, collectionName, targetId);
      await updateDoc(sectionRef, updates);
    } catch (error) {
      console.error("Error updating section:", error);
    }
  };

  const handleUpdateRow = async (sectionId: string, rowIndex: number, updates: any) => {
    if (!isAdmin) return;
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section || !section.rows) return;
      
      const sectionRef = doc(db, collectionName, sectionId);
      const updatedRows = JSON.parse(JSON.stringify(section.rows));
      updatedRows[rowIndex] = { ...updatedRows[rowIndex], ...updates };
      
      await updateDoc(sectionRef, { rows: updatedRows });
    } catch (error) {
      console.error("Error updating row:", error);
    }
  };

  const handleRemoveItem = async () => {
    if (!selectedItemId || !isAdmin) return;
    
    let targetSection: any = null;
    let targetRowIndex: number = -1;
    let targetItemIndex: number = -1;

    for (const section of sections) {
      if (!section.rows) continue;
      for (let rIdx = 0; rIdx < section.rows.length; rIdx++) {
        const row = section.rows[rIdx];
        const iIdx = (row.items || []).findIndex((item: any) => item?.id === selectedItemId);
        if (iIdx !== -1) {
          targetSection = section;
          targetRowIndex = rIdx;
          targetItemIndex = iIdx;
          break;
        }
      }
      if (targetSection) break;
    }

    if (!targetSection) return;

    try {
      const sectionRef = doc(db, collectionName, targetSection.id);
      const updatedRows = JSON.parse(JSON.stringify(targetSection.rows));
      updatedRows[targetRowIndex].items.splice(targetItemIndex, 1);

      await updateDoc(sectionRef, { rows: updatedRows });
      setSelectedItemId(null);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleDeleteRow = async (sectionId: string, rowIndex: number) => {
    if (!isAdmin) return;
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section || !section.rows) return;
      
      const sectionRef = doc(db, collectionName, sectionId);
      const updatedRows = [...section.rows];
      updatedRows.splice(rowIndex, 1);
      
      await updateDoc(sectionRef, { rows: updatedRows });
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  };

  const getSelectedItem = () => {
    if (!selectedItemId) return null;
    for (const section of sections) {
      if (!section.rows) continue;
      for (const row of section.rows) {
        const item = (row.items || []).find((i: any) => i?.id === selectedItemId);
        if (item) return item;
      }
    }
    return null;
  };

  const handleRowDrop = (sectionId: string, rowIndex: number, data: any, position: string, slotIndex?: number) => {
    if (data.type === 'layout') {
      const section = sections.find(s => s.id === sectionId);
      if (!section || !section.rows || !section.rows[rowIndex]) return;
      const row = section.rows[rowIndex];
      handleAddRows(data.value || 1, sectionId, position as any, row.id, data.rowCount);
    } else if (data.type === 'action') {
      window.dispatchEvent(new CustomEvent('section-drop', { 
        detail: { 
          id: sectionId,
          type: data.type,
          value: data.value,
          rowIndex,
          slotIndex,
          position,
          rowCount: data.rowCount
        } 
      }));
    }
  };

  useEffect(() => {
    const handleSectionDrop = (e: any) => {
      if (!e.detail) return;
      const { id, type, value, position, slotIndex, rowIndex, rowCount } = e.detail;
      
      if (type === 'layout') {
        handleAddRows(value || 1, id, position, undefined, rowCount);
      } else if (type === 'action') {
        if (value === 'add-image') {
          setTargetSectionId(id);
          setTargetRowIndex(rowIndex);
          setTargetSlotIndex(slotIndex);
          setIsMediaModalOpen(true);
        } else if (value === 'add-video') {
          handleAddItem('video', '', rowIndex, slotIndex);
        } else if (value === 'add-heading') {
          handleAddItem('text', '', rowIndex, slotIndex, { heading: 'New Heading', headingSize: 48 });
        } else if (value === 'add-description') {
          handleAddItem('text', '', rowIndex, slotIndex, { description: 'Add your description text here...', descriptionSize: 18 });
        }
      }
    };

    window.addEventListener('section-drop', handleSectionDrop);
    return () => window.removeEventListener('section-drop', handleSectionDrop);
  }, [sections]);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbSections = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
      
      let finalSections = [...dbSections];

      fixedSections.forEach(fixed => {
        if (!dbSections.some(s => s.id === fixed.id || s.type === fixed.type)) {
          finalSections.push(fixed);
        }
      });

      setSections(finalSections.sort((a, b) => a.order - b.order));
    }, (error) => {
      console.error("Firestore snapshot error:", error);
    });
    return () => unsubscribe();
  }, [collectionName]);

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

  const handleAddBelow = async (index: number) => {
    if (!isAdmin) return;
    
    try {
      const newOrder = sections[index].order + 1;
      const batchPromises = [];
      for (let i = index + 1; i < sections.length; i++) {
        const s = sections[i];
        const sectionRef = doc(db, collectionName, s.id);
        batchPromises.push(updateDoc(sectionRef, { order: s.order + 1 }));
      }
      
      await Promise.all(batchPromises);

      const newSection = {
        type: 'blank',
        title: '',
        content: '',
        order: newOrder,
        backgroundColor: 'transparent',
        textColor: '#ffffff',
        createdAt: new Date().toISOString(),
        rows: []
      };
      
      await addDoc(collection(db, collectionName), newSection);
    } catch (error) {
      console.error("Error adding section:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      if (selectedSectionId === id) setSelectedSectionId(null);
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0 || !isAdmin) return;
    const current = sections[index];
    const prev = sections[index - 1];

    try {
      const currentRef = doc(db, collectionName, current.id);
      const prevRef = doc(db, collectionName, prev.id);
      
      const updates = [];
      
      const isCurrentFixed = fixedSections.some(f => f.id === current.id);
      const isPrevFixed = fixedSections.some(f => f.id === prev.id);

      if (isCurrentFixed) {
        const { id, ...data } = current;
        updates.push(setDoc(currentRef, { ...data, order: prev.order }));
      } else {
        updates.push(updateDoc(currentRef, { order: prev.order }));
      }

      if (isPrevFixed) {
        const { id, ...data } = prev;
        updates.push(setDoc(prevRef, { ...data, order: current.order }));
      } else {
        updates.push(updateDoc(prevRef, { order: current.order }));
      }

      await Promise.all(updates);
    } catch (error) {
      console.error("Error moving up:", error);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= sections.length - 1 || !isAdmin) return;
    const current = sections[index];
    const next = sections[index + 1];

    try {
      const currentRef = doc(db, collectionName, current.id);
      const nextRef = doc(db, collectionName, next.id);
      
      const updates = [];

      const isCurrentFixed = fixedSections.some(f => f.id === current.id);
      const isNextFixed = fixedSections.some(f => f.id === next.id);

      if (isCurrentFixed) {
        const { id, ...data } = current;
        updates.push(setDoc(currentRef, { ...data, order: next.order }));
      } else {
        updates.push(updateDoc(currentRef, { order: next.order }));
      }

      if (isNextFixed) {
        const { id, ...data } = next;
        updates.push(setDoc(nextRef, { ...data, order: current.order }));
      } else {
        updates.push(updateDoc(nextRef, { order: current.order }));
      }

      await Promise.all(updates);
    } catch (error) {
      console.error("Error moving down:", error);
    }
  };

  const handleDuplicate = async (section: any) => {
    if (!isAdmin) return;
    try {
      const { id, ...data } = section;
      const newSection = {
        ...data,
        order: section.order + 0.5,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, collectionName), newSection);
    } catch (error) {
      console.error("Error duplicating section:", error);
    }
  };

  const handleMoveToPage = async (section: any, targetPage: string) => {
    if (!isAdmin) return;
    
    let targetCollection = 'home_sections';
    if (targetPage === '/performance') targetCollection = 'performance_sections';
    else if (targetPage === '/playlist') targetCollection = 'playlist_sections';
    else if (targetPage === '/products') targetCollection = 'products_sections';
    else if (targetPage === '/about') targetCollection = 'about_sections';
    else if (targetPage === '/contact') targetCollection = 'contact_sections';

    try {
      const { id, ...data } = section;
      await addDoc(collection(db, targetCollection), {
        ...data,
        order: 999,
        createdAt: new Date().toISOString()
      });
      await deleteDoc(doc(db, collectionName, id));
      if (selectedSectionId === id) setSelectedSectionId(null);
    } catch (error) {
      console.error("Error moving to page:", error);
    }
  };

  const handleColorChange = async (sectionId: string, color: string) => {
    if (!isAdmin) return;
    try {
      const sectionRef = doc(db, collectionName, sectionId);
      const isFixed = fixedSections.some(f => f.id === sectionId);
      
      if (isFixed) {
        const section = sections.find(s => s.id === sectionId);
        if (section) {
          const { id, ...data } = section;
          await setDoc(sectionRef, { ...data, backgroundColor: color });
        }
      } else {
        await updateDoc(sectionRef, { backgroundColor: color });
      }
    } catch (error) {
      console.error("Error changing color:", error);
    }
  };

  return (
    <div 
      className="flex flex-col relative"
      onClick={() => {
        if (isEditMode) {
          setSelectedSectionId(null);
          setSelectedItemId(null);
        }
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <SectionToolbox 
          isOpen={isEditMode && selectedSectionId !== null && selectedItemId === null}
          onClose={() => setSelectedSectionId(null)}
          onAddRows={(colCount, rowCount) => handleAddRows(colCount, undefined, undefined, undefined, rowCount)}
          onAddImage={() => {
            setTargetSectionId(selectedSectionId);
            setIsMediaModalOpen(true);
          }}
          onAddVideo={() => handleAddItem('video')}
          section={sections.find(s => s.id === selectedSectionId)}
          onUpdateSection={handleUpdateSection}
        />

        <ImageToolbox 
          isOpen={isEditMode && selectedItemId !== null}
          onClose={() => setSelectedItemId(null)}
          item={getSelectedItem()}
          onUpdate={handleUpdateItem}
          onRemove={handleRemoveItem}
        />

        <MediaSelectorModal 
          isOpen={isMediaModalOpen}
          onClose={() => {
            setIsMediaModalOpen(false);
            setTargetSectionId(null);
            setTargetRowIndex(undefined);
            setTargetSlotIndex(undefined);
          }}
          onSelect={(url) => handleAddItem('image', url, targetRowIndex, targetSlotIndex)}
          cloudinaryConfig={cloudinaryConfig}
        />

        {/* Global Exit Confirmation modal has been moved to App root to support all pages */}
      </div>

      {sections.map((section, index) => (
        <div 
          key={section.id} 
          onClick={(e) => {
            if (isEditMode) {
              e.stopPropagation();
              setSelectedSectionId(section.id);
              setSelectedItemId(null);
            }
          }}
          className={`relative transition-all ${isEditMode && selectedSectionId === section.id ? 'z-50' : ''}`}
        >
          <EditableSection 
            id={section.id}
            isEditMode={isEditMode}
            isSelected={selectedSectionId === section.id && selectedItemId === null}
            hideHighlight={selectedItemId !== null}
            onAddBelow={() => handleAddBelow(index)}
            onDelete={() => handleDelete(section.id)}
            onMoveUp={index > 0 ? () => handleMoveUp(index) : undefined}
            onMoveDown={index < sections.length - 1 ? () => handleMoveDown(index) : undefined}
            onDuplicate={() => handleDuplicate(section)}
            onMoveToPage={(page) => handleMoveToPage(section, page)}
            onColorChange={(color) => handleColorChange(section.id, color)}
          >
            {section.type === 'hero' && <Hero backgroundColor={location.pathname === '/' ? 'transparent' : section.backgroundColor} />}
            {section.type === 'new-perf' && <NewPerformanceSection backgroundColor={location.pathname === '/' ? 'transparent' : section.backgroundColor} />}
            {section.type === 'text' && (
              <section className="py-20 px-4" style={{ backgroundColor: location.pathname === '/' ? 'transparent' : (section.backgroundColor || 'transparent') }}>
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-4xl font-bold mb-6" style={{ color: section.textColor }}>{section.title}</h2>
                  <p className="text-lg leading-relaxed" style={{ color: section.textColor }}>{section.content}</p>
                </div>
              </section>
            )}
            {section.type === 'blank' && (
              <section 
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-emerald-500/5'); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('bg-emerald-500/5'); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-emerald-500/5');
                  try {
                    const data = JSON.parse(e.dataTransfer.getData('application/json'));
                    if (data.type === 'layout') {
                      handleAddRows(data.value || 1, section.id, 'bottom');
                    }
                  } catch (err) {}
                }}
                className="py-32 px-4 flex items-center justify-center bg-zinc-900/50 border-y border-zinc-800/50 transition-all"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700">
                    <Plus className="w-8 h-8 text-zinc-500" />
                  </div>
                  <p className="text-zinc-500 font-medium">Blank Section</p>
                  <p className="text-zinc-600 text-sm">Drag a layout tool here to start building</p>
                </div>
              </section>
            )}
            {section.type === 'dynamic' && (
              <section className="py-20 px-4" style={{ backgroundColor: location.pathname === '/' ? 'transparent' : (section.backgroundColor || 'transparent') }}>
                <div className="max-w-7xl mx-auto flex flex-col gap-12">
                  {(section.title || section.description) && (
                    <div className="text-center mb-8 space-y-4">
                      {section.title && (
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{section.title}</h2>
                      )}
                      {section.description && (
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">{section.description}</p>
                      )}
                    </div>
                  )}
                  {(section.rows || []).map((row: any, rowIndex: number) => (
                    <EditableRow 
                      key={row.id}
                      row={row}
                      sectionId={section.id}
                      isEditMode={isEditMode}
                      selectedItemId={selectedItemId || undefined}
                      onDrop={(data, position, slotIndex) => handleRowDrop(section.id, rowIndex, data, position, slotIndex)}
                      onSelectItem={(itemId) => setSelectedItemId(itemId)}
                      onDelete={() => handleDeleteRow(section.id, rowIndex)}
                      onUpdateRow={(updates) => handleUpdateRow(section.id, rowIndex, updates)}
                    />
                  ))}
                  {(!section.rows || section.rows.length === 0) && (
                    <div 
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-emerald-500', 'bg-emerald-500/5'); }}
                      onDragLeave={(e) => { e.currentTarget.classList.remove('border-emerald-500', 'bg-emerald-500/5'); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-emerald-500', 'bg-emerald-500/5');
                        try {
                          const data = JSON.parse(e.dataTransfer.getData('application/json'));
                          if (data.type === 'layout') {
                            handleAddRows(data.value || 1, section.id, 'bottom');
                          }
                        } catch (err) {}
                      }}
                      className="py-20 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center transition-all"
                    >
                      <PlusCircle className="w-12 h-12 text-zinc-700 mb-4" />
                      <p className="text-zinc-500 font-medium">Empty Dynamic Section</p>
                      <p className="text-zinc-600 text-sm">Drag a layout tool here to start building</p>
                    </div>
                  )}
                </div>
              </section>
            )}
            {renderExtraSection && renderExtraSection(section)}
          </EditableSection>
        </div>
      ))}
    </div>
  );
};

const HomePage = () => {
  return (
    <DynamicEditablePage 
      collectionName="home_sections"
      fixedSections={[
        { id: 'hero', type: 'hero', order: -100 },
        { id: 'new-perf', type: 'new-perf', order: 0 }
      ]}
    />
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
        {getInstrumentIcon(track.instrument || track.title || '', "w-7 h-7 text-emerald-500")}
      </div>
      <div className="flex flex-col truncate w-40 flex-none ml-2">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {track.instrument ? formatInstrumentName(track.instrument) : (track.title || 'Track')}
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
      return allAudio
        .filter(m =>
          m.title?.toLowerCase() === currentItem.title?.toLowerCase() &&
          m.artist?.toLowerCase() === currentItem.artist?.toLowerCase()
        )
        .sort((a, b) => getInstrumentSortWeight(a.instrument) - getInstrumentSortWeight(b.instrument));
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
    <div className="min-h-screen bg-transparent pt-24 pb-32 transition-colors duration-300">
      <DynamicEditablePage 
        collectionName="playlist_sections"
        fixedSections={[{ id: 'playlist-player', type: 'playlist', order: 0 }]}
        renderExtraSection={(section) => section.type === 'playlist' && (
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
                      const tracks = allAudio
                        .filter(m => m.title?.toLowerCase() === item.title?.toLowerCase() && m.artist?.toLowerCase() === item.artist?.toLowerCase())
                        .sort((a, b) => getInstrumentSortWeight(a.instrument) - getInstrumentSortWeight(b.instrument));
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
                              {item.artist || 'Unknown Artist'} {item.instrument ? `• ${formatInstrumentName(item.instrument)}` : ''}
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
        )}
      />

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
  const { isAdmin } = useContext(AuthContext);
  return (
    <div className="about-page-wrapper-custom min-h-screen">
      <style>{`
        .about-page-wrapper-custom {
          font-family: "Poppins", sans-serif !important;
          color: #263238;
          background:
            radial-gradient(circle at top left, rgba(126, 203, 68, 0.25), transparent 30%),
            radial-gradient(circle at top right, rgba(144, 210, 88, 0.22), transparent 28%),
            linear-gradient(180deg, #fbfff4 0%, #f5ffe9 55%, #eefbdc 100%) !important;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        .about-page-wrapper-custom::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 15% 18%, rgba(131, 207, 75, 0.18), transparent 16%),
            radial-gradient(circle at 84% 40%, rgba(83, 178, 55, 0.16), transparent 18%),
            radial-gradient(circle at 50% 82%, rgba(141, 214, 97, 0.14), transparent 25%);
          z-index: 1;
        }

        .about-page-wrapper-custom * {
          box-sizing: border-box;
        }

        .page-custom {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 120px 0 30px;
          position: relative;
          z-index: 2;
        }

        .about-card {
          position: relative;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 70px;
          align-items: center;
          padding: 64px 70px;
          min-height: 510px;
          border-radius: 58px;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.84), rgba(247,255,237,0.66)),
            radial-gradient(circle at bottom right, rgba(115, 204, 65, 0.23), transparent 35%);
          box-shadow:
            0 30px 70px rgba(94, 161, 51, 0.2),
            inset 0 0 0 2px rgba(143, 201, 103, 0.25);
          overflow: hidden;
        }

        .about-card::before,
        .about-card::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .about-card::before {
          width: 720px;
          height: 260px;
          border: 8px solid rgba(143, 207, 98, 0.22);
          left: -170px;
          top: 95px;
          transform: rotate(-8deg);
        }

        .about-card::after {
          width: 780px;
          height: 240px;
          border: 5px solid rgba(120, 194, 74, 0.18);
          right: -210px;
          bottom: -20px;
          transform: rotate(-9deg);
        }

        .leaf {
          position: absolute;
          color: #67b843;
          font-size: 30px;
          filter: drop-shadow(0 8px 12px rgba(69, 146, 34, 0.25));
          opacity: 0.85;
          z-index: 2;
        }

        .leaf.one { top: 75px; left: 42%; transform: rotate(-18deg); }
        .leaf.two { bottom: 58px; left: 12%; transform: rotate(15deg); font-size: 38px; }
        .leaf.three { right: 42px; top: 145px; transform: rotate(-20deg); font-size: 44px; }
        .leaf.four { right: 250px; bottom: 70px; transform: rotate(28deg); }

        .image-collage-centered {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 410px;
          z-index: 3;
          position: relative;
        }

        .center-logo-only {
          width: 280px;
          height: 280px;
          border-radius: 50%;
          object-fit: cover;
          background: #dff4ca;
          padding: 8px;
          box-shadow:
            0 20px 45px rgba(67, 144, 35, 0.25),
            0 0 0 12px rgba(184, 230, 143, 0.35);
          z-index: 4;
          transition: transform 0.5s ease;
        }

        .center-logo-only:hover {
          transform: scale(1.05);
        }

        .about-content {
          position: relative;
          z-index: 4;
          max-width: 520px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #3f8e32;
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 18px;
        }

        .eyebrow span {
          font-size: 20px;
        }

        .about-content h2 {
          font-size: clamp(34px, 4vw, 46px);
          line-height: 1.12;
          margin-bottom: 24px;
          color: #2d3038;
          letter-spacing: -1px;
        }

        .about-content h2 strong {
          color: #65b93d;
          font-weight: 700;
        }

        .about-content p {
          font-size: 15px;
          line-height: 1.9;
          color: #3d454d;
          margin-bottom: 22px;
        }

        .subscribe-btn {
          margin-top: 18px;
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 13px 28px 13px 13px;
          border-radius: 40px;
          text-decoration: none;
          color: #fff !important;
          font-size: 15px;
          font-weight: 700;
          background: linear-gradient(135deg, #9fdf67, #4ab931);
          box-shadow:
            0 14px 26px rgba(65, 174, 44, 0.28),
            inset 0 0 0 6px rgba(255, 255, 255, 0.28);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .subscribe-btn:hover {
          transform: translateY(-3px);
          box-shadow:
            0 18px 36px rgba(65, 174, 44, 0.35),
            inset 0 0 0 6px rgba(255, 255, 255, 0.28);
        }

        .play-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.72);
          color: #55b938;
          font-size: 15px;
          flex: 0 0 auto;
        }

        .slider-dots {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin: 27px 0 5px;
        }

        .slider-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #9ccd78;
        }

        .slider-dots span.active {
          width: 25px;
          border-radius: 20px;
          background: linear-gradient(90deg, #81ca55, #43ae32);
        }

        .footer-custom {
          position: relative;
          margin-top: 45px;
          padding: 52px 0 25px;
          background: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(243,255,227,0.55));
          border-top: 1px solid rgba(131, 187, 91, 0.2);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr 1.2fr 1fr;
          gap: 40px;
          align-items: start;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .footer-brand img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
        }

        .footer-brand h3,
        .footer-title {
          color: #2d7c28;
          font-size: 17px;
          font-weight: 700;
          margin: 0;
        }

        .footer-text {
          font-size: 14px;
          color: #455346;
          line-height: 1.8;
          max-width: 260px;
        }

        .socials-custom {
          display: flex;
          gap: 12px;
          margin-top: 22px;
        }

        .socials-custom a {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.8);
          color: #3d9531;
          text-decoration: none;
          box-shadow: 0 8px 18px rgba(64, 130, 38, 0.13);
          font-weight: 700;
        }

        .footer-links-custom {
          list-style: none;
          margin-top: 18px;
          padding: 0;
        }

        .footer-links-custom li {
          margin-bottom: 10px;
        }

        .footer-links-custom a {
          text-decoration: none;
          color: #35503c !important;
          font-size: 14px;
          transition: color 0.2s ease;
        }

        .footer-links-custom a:hover {
          color: #4db636 !important;
        }

        .newsletter-custom p {
          margin-top: 20px;
          color: #4a7543;
          line-height: 1.8;
          font-size: 14px;
        }

        .email-box-custom {
          margin-top: 28px;
          display: flex;
          max-width: 330px;
          padding: 6px;
          border-radius: 40px;
          background: rgba(255,255,255,0.88);
          box-shadow: 0 12px 28px rgba(79, 143, 45, 0.13);
        }

        .email-box-custom input {
          border: none;
          outline: none;
          background: transparent;
          flex: 1;
          padding: 0 18px;
          font-family: inherit;
          color: #333;
        }

        .email-box-custom button {
          border: none;
          padding: 12px 24px;
          border-radius: 30px;
          color: #fff;
          background: linear-gradient(135deg, #92d85d, #41b330);
          font-weight: 700;
          cursor: pointer;
        }

        .footer-art {
          display: flex;
          justify-content: center;
        }

        .headphones-custom {
          width: 210px;
          max-width: 100%;
          filter: drop-shadow(0 22px 30px rgba(70, 130, 35, 0.22));
        }

        .footer-bottom-custom {
          margin-top: 36px;
          padding-top: 22px;
          border-top: 1px solid rgba(114, 163, 82, 0.25);
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          color: #4d8142;
          font-size: 13px;
        }

        .footer-bottom-custom a {
          color: #4d8142 !important;
          text-decoration: none;
          margin-left: 25px;
        }

        @media (max-width: 1050px) {
          .about-card {
            grid-template-columns: 1fr;
            padding: 45px;
            gap: 45px;
          }

          .image-collage-centered {
            max-width: 580px;
            width: 100%;
            margin: 0 auto;
          }

          .about-content {
            max-width: 100%;
          }

          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 700px) {
          .page-custom {
            width: min(100% - 24px, 1180px);
            padding-top: 25px;
          }

          .about-card {
            border-radius: 34px;
            padding: 28px 20px;
          }

          .image-collage-centered {
            min-height: 300px;
          }

          .center-logo-only {
            width: 200px;
            height: 200px;
          }

          .about-content h2 {
            font-size: 34px;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }

          .footer-bottom-custom {
            flex-direction: column;
          }

          .footer-bottom-custom a {
            margin-left: 0;
            margin-right: 20px;
          }
        }
      `}</style>

      <main className="page-custom">
        <section className="about-card">
          <span className="leaf one">🍃</span>
          <span className="leaf two">🌿</span>
          <span className="leaf three">🌿</span>
          <span className="leaf four">🍃</span>

          <div className="image-collage-centered">
            <img src={newLogoUrl} alt="Instrumuzicover emblem" className="center-logo-only" referrerPolicy="no-referrer" />
          </div>

          <div className="about-content">
            <div className="eyebrow">
              <span>🍃</span>
              Our Story
            </div>

            <h2>About <strong>Instrumuzicover</strong></h2>

            <p>
              I specialize in reimagining iconic tracks and modern hits through the
              power of virtual instruments. My goal is to explore the intersection of
              technology and artistry, delivering high-quality digital performances
              that breathe new life into your favorite music.
            </p>

            <p>
              Your support is the engine behind this channel. Every subscriber
              provides the motivation I need to push the boundaries of digital
              production and increase my upload frequency. By joining this community,
              you are directly fueling the creation of more immersive, virtual music
              covers. Click the YouTube button and subscribe to the channel!
            </p>

            <a href="https://www.youtube.com/@dylanchrey" target="_blank" rel="noopener noreferrer" className="subscribe-btn">
              <span className="play-icon">▶</span>
              YouTube Subscribe
            </a>
          </div>
        </section>

        <div className="slider-dots">
          <span></span>
          <span className="active"></span>
          <span></span>
        </div>

        <footer className="footer-custom">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <img src={newLogoUrl} alt="Instrumuzicover logo" referrerPolicy="no-referrer" />
                <h3>Instrumuzicover</h3>
              </div>

              <p className="footer-text">
                The ultimate destination for virtual instruments and music sheets.
                Elevate your production with professional tools.
              </p>

              <div className="socials-custom">
                <a href="#" aria-label="Instagram">◎</a>
                <a href="#" aria-label="Twitter">𝕏</a>
                <a href="https://www.youtube.com/@dylanchrey" target="_blank" rel="noopener noreferrer" aria-label="YouTube">▶</a>
              </div>
            </div>

            <div>
              <h4 className="footer-title">🍃 Quick Links</h4>
              <ul className="footer-links-custom">
                <li><Link to="/">Home ›</Link></li>
                <li><Link to="/performance">Performance ›</Link></li>
                <li><Link to="/playlist">Playlist ›</Link></li>
                {isAdmin && <li><Link to="/media">Media ›</Link></li>}
                <li><Link to="/products">Product ›</Link></li>
                <li><Link to="/contact">Contact ›</Link></li>
                <li><Link to="/about">About ›</Link></li>
              </ul>
            </div>

            <div className="newsletter-custom">
              <h4 className="footer-title">🍃 Newsletter</h4>
              <p>Subscribe to get updates on new releases and offers.</p>

              <form className="email-box-custom" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter your email" required />
                <button type="submit">Join</button>
              </form>
            </div>

            <div className="footer-art">
              <img src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400" alt="Green headphones" className="headphones-custom" referrerPolicy="no-referrer" />
            </div>
          </div>

          <div className="footer-bottom-custom">
            <p>© 2026 Instrumuzicover. All rights reserved.</p>

            <div>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </footer>
      </main>
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
    <section className="pt-8 pb-12 bg-transparent transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row items-center justify-between gap-6 mb-12">
          <div className="md:flex-1 flex items-center justify-start">
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', fontSize: '35px', color: '#b5d98d' }}>Performances</h2>
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
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
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
                  <h3 className="text-lg font-bold mb-1 line-clamp-1" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#b5d98d' }}>{perf.title}</h3>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <User className="w-4 h-4 text-[#21a721]" />
                    <span style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#21a721' }}>{perf.artist}</span>
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      {getInstrumentIcon(perf.instrument, "w-3.5 h-3.5 text-[#7ab18a]")}
                      <span style={{ color: '#7ab18a', fontWeight: 'bold', fontFamily: 'Courier New, Courier, monospace' }}>{formatInstrumentName(perf.instrument)}</span>
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
  const [startTime, setStartTime] = useState(0);
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const currentVideo = videos[currentIndex];

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
            {(relatedVideos.length > 1) && (
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
                    <div className="max-h-60 overflow-y-auto">
                      {relatedVideos.map((rv, idx) => {
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
                              {getInstrumentIcon(rv.instrument, "w-8 h-8 text-emerald-500")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-200">{formatInstrumentName(rv.instrument)}</p>
                              <p className={`text-[10px] font-bold truncate ${getDifficultyColor(rv.difficulty)}`}>{rv.difficulty}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                {formatInstrumentName(currentVideo.instrument)}
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
    <section className="pt-8 pb-8 bg-transparent transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold mb-1 tracking-tight" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', fontSize: '35px', color: '#b5d98d' }}>Instruments</h2>
          <p style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#21a721' }}>Finding the frequency your soul vibrates at.</p>
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
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Courier New, Courier, monospace', fontWeight: 'bold', color: '#b5d98d' }}>{inst.name}</h3>
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
  const [title, setTitle] = useState(() => {
    if (file) {
      return file.name.replace(/\.[^/.]+$/, "");
    }
    return '';
  });
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

  const startUpload = async (file: File | null, details?: any, preventReset: boolean = false) => {
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
      if (!preventReset) {
        setIsUploading(false);
        setUploadStatus(null);
        setUploadProgress(null);
        setPendingFile(null);
        setUploadType(null);
        setShowDetailsModal(false);
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadStatus("Processing files...");

    const fileArray = Array.from(files);

    if (fileArray.length === 1) {
      const file = fileArray[0];
      if (uploadType === 'audio') {
        const audio = new Audio(URL.createObjectURL(file));
        audio.onloadedmetadata = () => {
          if (audio.duration < 30) {
            startUpload(file, { title: file.name.replace(/\.[^/.]+$/, "") });
          } else {
            setPendingFile(file);
            setShowDetailsModal(true);
            setIsUploading(false);
          }
        };
      } else if (uploadType === 'image') {
        startUpload(file, { title: file.name.replace(/\.[^/.]+$/, "") });
      } else {
        setPendingFile(file);
        setShowDetailsModal(true);
        setIsUploading(false);
      }
    } else {
      // Multiple files - upload sequentially with basic details
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const isLast = i === fileArray.length - 1;
        setUploadStatus(`Uploading file ${i + 1} of ${fileArray.length}...`);
        await startUpload(file, { title: file.name.replace(/\.[^/.]+$/, "") }, !isLast);
      }
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
    <div className="pt-24 pb-16 min-h-screen bg-[#0d0e10] transition-colors duration-300">
      <style>{`
        /* Main media nature container */
        .media-nature-section {
          position: relative;
          max-width: 1700px;
          margin: 40px auto 120px;
          padding: 45px 38px 90px;
          border-radius: 38px;
          overflow: hidden;
          background:
            radial-gradient(circle at 8% 8%, rgba(143, 255, 105, 0.12), transparent 26%),
            radial-gradient(circle at 92% 18%, rgba(153, 255, 77, 0.10), transparent 30%),
            radial-gradient(circle at 45% 100%, rgba(72, 200, 63, 0.08), transparent 35%),
            linear-gradient(135deg, rgba(24, 26, 27, 0.94), rgba(8, 10, 11, 0.98));
          border: 1px solid rgba(142, 255, 109, 0.16);
          box-shadow:
            0 0 55px rgba(88, 255, 80, 0.08),
            inset 0 0 0 1px rgba(255,255,255,0.03);
        }

        /* Soft inner glowing border */
        .media-nature-section::before {
          content: "";
          position: absolute;
          inset: 16px;
          border-radius: 28px;
          border: 1px solid rgba(174, 255, 145, 0.13);
          pointer-events: none;
          z-index: 1;
        }

        /* Background musical/nature lines */
        .media-nature-section::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(
              -12deg,
              transparent 0,
              transparent 54px,
              rgba(130, 255, 96, 0.045) 56px,
              transparent 59px
            );
          opacity: 0.55;
          pointer-events: none;
          z-index: 0;
        }

        /* Keep content above decorations */
        .media-header,
        .media-grid,
        .media-nature-section-content {
          position: relative;
          z-index: 5;
        }

        /* Header */
        .media-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 46px;
        }

        .media-header h1 {
          color: #ffffff;
          font-size: clamp(36px, 4vw, 56px);
          line-height: 1;
          margin-bottom: 12px;
          text-shadow: 0 0 18px rgba(118, 255, 86, 0.18);
        }

        .media-header p {
          color: #bfd1c5;
          font-size: 18px;
          letter-spacing: 0.3px;
        }

        /* Header buttons */
        .media-actions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .settings-btn {
          width: 54px;
          height: 54px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          color: #b8c9bd;
          background: rgba(255,255,255,0.06);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.05),
            0 12px 26px rgba(0,0,0,0.28);
        }

        .upload-btn {
          height: 54px;
          padding: 0 28px;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          color: white;
          font-size: 17px;
          font-weight: 800;
          background: linear-gradient(135deg, #73ef47, #00a85a);
          box-shadow:
            0 0 0 4px rgba(0, 168, 90, 0.20),
            0 14px 30px rgba(0, 200, 94, 0.28),
            inset 0 2px 8px rgba(255,255,255,0.45);
          transition: 0.25s ease;
        }

        .upload-btn:hover {
          transform: translateY(-3px);
          box-shadow:
            0 0 0 5px rgba(0, 168, 90, 0.25),
            0 20px 40px rgba(0, 200, 94, 0.36);
        }

        .upload-btn i {
          margin-right: 8px;
        }

        /* Media grid */
        .media-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 34px 22px;
        }

        /* Example card styling */
        .media-card {
          position: relative;
          min-height: 260px;
          border-radius: 14px;
          overflow: hidden;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 20px 45px rgba(0,0,0,0.28),
            inset 0 0 0 1px rgba(255,255,255,0.025);
          transition: 0.25s ease;
        }

        .media-card:hover {
          transform: translateY(-6px);
          border-color: rgba(127, 255, 95, 0.45);
          box-shadow:
            0 25px 50px rgba(0,0,0,0.36),
            0 0 26px rgba(129, 255, 82, 0.14);
        }

        .media-card img {
          width: 100%;
          height: 220px;
          display: block;
          object-fit: cover;
        }

        .media-card-title {
          color: white;
          font-weight: 800;
          font-size: 14px;
          text-align: center;
          padding: 12px 8px 0;
        }

        /* Vines on both sides */
        .media-vine {
          position: absolute;
          width: 140px;
          height: 430px;
          z-index: 2;
          pointer-events: none;
          opacity: 0.82;
        }

        .media-vine::before {
          content: "";
          position: absolute;
          inset: 0;
          border-right: 3px solid rgba(115, 235, 84, 0.42);
          border-radius: 50%;
          filter: drop-shadow(0 0 13px rgba(111, 255, 77, 0.28));
        }

        .media-vine-left {
          left: 12px;
          top: 170px;
          transform: rotate(8deg);
        }

        .media-vine-right {
          right: 12px;
          top: 135px;
          transform: rotate(188deg);
        }

        .media-vine span {
          position: absolute;
          width: 42px;
          height: 22px;
          border-radius: 100% 0 100% 0;
          background: linear-gradient(135deg, #baff64, #28b338 60%, #0c6424);
          box-shadow:
            inset -6px -4px 12px rgba(0,0,0,0.25),
            0 0 18px rgba(126, 255, 88, 0.18);
        }

        .media-vine span::after {
          content: "";
          position: absolute;
          width: 75%;
          height: 1px;
          top: 50%;
          left: 10%;
          background: rgba(255,255,255,0.65);
          transform: rotate(-18deg);
        }

        .media-vine span:nth-child(1) {
          top: 65px;
          left: 58px;
          transform: rotate(-24deg);
        }

        .media-vine span:nth-child(2) {
          top: 180px;
          left: 20px;
          width: 54px;
          height: 28px;
          transform: rotate(32deg);
        }

        .media-vine span:nth-child(3) {
          top: 310px;
          left: 72px;
          width: 38px;
          height: 19px;
          transform: rotate(-35deg);
        }

        /* Root decorations */
        .media-root {
          position: absolute;
          width: 420px;
          height: 145px;
          bottom: 18px;
          z-index: 2;
          pointer-events: none;
          opacity: 0.7;
        }

        .media-root::before,
        .media-root::after {
          content: "";
          position: absolute;
          border-bottom: 3px solid rgba(135, 210, 83, 0.38);
          border-radius: 50%;
          filter: drop-shadow(0 0 10px rgba(124, 255, 81, 0.18));
        }

        .media-root::before {
          width: 370px;
          height: 95px;
          left: 0;
          bottom: 36px;
          transform: rotate(-8deg);
        }

        .media-root::after {
          width: 260px;
          height: 70px;
          left: 72px;
          bottom: 14px;
          transform: rotate(12deg);
        }

        .media-root-left {
          left: 80px;
        }

        .media-root-right {
          right: 80px;
          transform: scaleX(-1);
        }

        /* Leaf clusters */
        .media-leaf-cluster {
          position: absolute;
          width: 170px;
          height: 150px;
          z-index: 2;
          pointer-events: none;
        }

        .media-leaf-cluster span {
          position: absolute;
          width: 54px;
          height: 28px;
          border-radius: 100% 0 100% 0;
          background: linear-gradient(135deg, #c9ff70, #28b338 60%, #0b6824);
          box-shadow:
            inset -7px -5px 12px rgba(0,0,0,0.24),
            0 0 22px rgba(136, 255, 91, 0.16);
        }

        .media-leaf-cluster span::after {
          content: "";
          position: absolute;
          width: 78%;
          height: 1px;
          top: 50%;
          left: 9%;
          background: rgba(255,255,255,0.68);
          transform: rotate(-18deg);
        }

        .media-leaf-cluster span:nth-child(1) {
          left: 50px;
          top: 10px;
          transform: rotate(-28deg);
        }

        .media-leaf-cluster span:nth-child(2) {
          left: 82px;
          top: 54px;
          width: 64px;
          height: 32px;
          transform: rotate(18deg);
        }

        .media-leaf-cluster span:nth-child(3) {
          left: 22px;
          top: 72px;
          width: 44px;
          height: 22px;
          transform: rotate(42deg);
        }

        .media-cluster-top {
          top: 28px;
          right: 60px;
        }

        .media-cluster-bottom {
          left: 55px;
          bottom: 40px;
          transform: rotate(185deg);
        }

        /* Glowing floating particles */
        .media-nature-section .glow-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c8ff63;
          box-shadow: 0 0 18px #c8ff63;
          z-index: 2;
          pointer-events: none;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-15px) scale(1.15); opacity: 0.95; }
        }

        /* Responsive */
        @media (max-width: 1500px) {
          .media-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        @media (max-width: 1200px) {
          .media-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 900px) {
          .media-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .media-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .media-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }

        @media (max-width: 650px) {
          .media-nature-section {
            padding: 34px 18px 75px;
            border-radius: 26px;
          }

          .media-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 26px 14px;
          }

          .media-card {
            min-height: 190px;
          }

          .media-card img {
            height: 160px;
          }

          .media-vine,
          .media-root,
          .media-leaf-cluster {
            opacity: 0.45;
          }
        }
      `}</style>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <main className="media-nature-section animate-fade-in">
          {/* Vines on both sides */}
          <div className="media-vine media-vine-left">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="media-vine media-vine-right">
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* Root decorations */}
          <div className="media-root media-root-left"></div>
          <div className="media-root media-root-right"></div>

          {/* Leaf clusters */}
          <div className="media-leaf-cluster media-cluster-top">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="media-leaf-cluster media-cluster-bottom">
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* Glowing floating particles */}
          <div className="glow-dot" style={{ top: '15%', left: '12%', animation: 'float 6s ease-in-out infinite' }}></div>
          <div className="glow-dot" style={{ top: '45%', right: '15%', animation: 'float 8s ease-in-out infinite 1s' }}></div>
          <div className="glow-dot" style={{ bottom: '25%', left: '20%', animation: 'float 5s ease-in-out infinite 2s' }}></div>
          <div className="glow-dot" style={{ top: '75%', right: '8%', animation: 'float 7s ease-in-out infinite 0.5s' }}></div>

          <div className="media-nature-section-content">
            {/* Header */}
            <div className="media-header">
              <div>
                <h1 className="font-extrabold tracking-tight">Media</h1>
                <p>Upload and preserve your musical memories.</p>
              </div>
              <div className="media-actions">
                {isAdmin && (
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="settings-btn flex items-center justify-center transition-all hover:scale-105"
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
                      className="upload-btn flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{uploadStatus || 'Uploading...'}</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up"></i>
                          Upload Media
                        </>
                      )}
                    </button>

                    {showUploadOptions && !isUploading && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-950/95 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-500/20 overflow-hidden z-20">
                        <button 
                          onClick={() => triggerUpload('image')}
                          className="w-full text-left px-6 py-4 hover:bg-emerald-950/30 text-white font-medium transition-colors flex items-center gap-3"
                        >
                          <ImageIcon className="w-5 h-5 text-emerald-400" />
                          Image
                        </button>
                        <button 
                          onClick={() => triggerUpload('audio')}
                          className="w-full text-left px-6 py-4 hover:bg-emerald-950/30 text-white font-medium transition-colors flex items-center gap-3"
                        >
                          <Music className="w-5 h-5 text-emerald-400" />
                          Audio
                        </button>
                        <button 
                          onClick={() => triggerUpload('sheet')}
                          className="w-full text-left px-6 py-4 hover:bg-emerald-950/30 text-white font-medium transition-colors flex items-center gap-3"
                        >
                          <FileText className="w-5 h-5 text-emerald-400" />
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
                multiple
              />
            </div>

            {/* Cloudinary Settings dropdown panel */}
            {showSettings && isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 p-6 rounded-3xl bg-zinc-900/80 backdrop-blur-md border border-emerald-500/25 settings-dropdown-container text-white relative z-50"
              >
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Cloud className="w-5 h-5" />
                  <h2 className="font-bold text-lg">Cloudinary Upload Settings</h2>
                </div>
                <p className="text-sm text-zinc-300 mb-6">
                  Configure Cloudinary to bypass Firebase CORS issues. Make sure your upload preset is set to <strong>Unsigned</strong> in your Cloudinary settings.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Cloud Name</label>
                    <input
                      type="text"
                      value={tempCloudName}
                      onChange={(e) => setTempCloudName(e.target.value)}
                      placeholder="e.g. dxyz12345"
                      className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Unsigned Upload Preset</label>
                    <input
                      type="text"
                      value={tempUploadPreset}
                      onChange={(e) => setTempUploadPreset(e.target.value)}
                      placeholder="e.g. preset_name"
                      className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
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
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-emerald-500/20"
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

            {/* Media Grid */}
            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 border border-dashed border-emerald-500/20 bg-black/30 rounded-3xl">
                <div className="w-20 h-20 bg-emerald-950/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/10">
                  <ImageIcon className="w-10 h-10 text-emerald-400/80" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No media yet</h3>
                <p className="text-zinc-400 mb-8 max-w-sm text-center">Start by uploading your first musical performance, sheet music, or illustration.</p>
                {isAdmin && (
                  <button 
                    onClick={() => setShowUploadOptions(true)}
                    className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-6 py-3 rounded-full"
                  >
                    Click here to upload
                  </button>
                )}
              </div>
            ) : (
              <div className="media-grid">
                {images.map((img) => {
                  return (
                    <div 
                      key={img.id} 
                      className="media-card group"
                      onClick={() => setSelectedImage(img)}
                    >
                      {img.type?.startsWith('audio/') ? (
                        <div className="w-full h-[220px] flex flex-col items-center justify-center bg-zinc-950/80 gap-3 border-b border-zinc-800">
                          <Music className="w-11 h-11 text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-400/80 bg-emerald-950/50 border border-emerald-900 px-2 py-0.5 rounded uppercase tracking-widest">{img.instrument || 'Audio'}</span>
                        </div>
                      ) : (img.type === 'application/pdf' || img.type?.includes('zip') || img.url.endsWith('.zip')) ? (
                        <div className="w-full h-[220px] flex flex-col items-center justify-center bg-zinc-950/80 gap-3 border-b border-zinc-800">
                          <FileText className="w-11 h-11 text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-400/80 bg-emerald-950/50 border border-emerald-900 px-2 py-0.5 rounded uppercase tracking-widest">{img.instrument || 'Sheet'}</span>
                        </div>
                      ) : (
                        <img 
                          src={img.url} 
                          alt={img.title || "User upload"} 
                          referrerPolicy="no-referrer"
                        />
                      )}

                      {/* Menu overlay actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity media-menu-container z-20">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === img.id ? null : img.id);
                          }}
                          className="p-1.5 bg-black/80 hover:bg-emerald-900 border border-emerald-500/30 text-white rounded-full backdrop-blur-md transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === img.id && (
                          <div className="absolute top-full right-0 mt-1 w-36 bg-zinc-950 border border-emerald-500/20 rounded-xl shadow-2xl overflow-hidden z-50">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadMedia(img.url, img.title);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-emerald-950/30 text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-2 border-b border-zinc-900"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-400" />
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
                                className="w-full text-left px-4 py-2.5 hover:bg-emerald-950/30 text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-2 border-b border-zinc-900"
                              >
                                <Play className="w-3.5 h-3.5 text-blue-400" />
                                {img.inPlaylist ? 'From Playlist' : 'To Playlist'}
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
                                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-950/30 text-emerald-400 text-xs font-semibold transition-colors flex items-center gap-2 border-b border-zinc-900"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  Edit Info
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingMedia(img);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 hover:bg-red-950/30 text-red-400 text-xs font-semibold transition-colors flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Title block */}
                      <div className="media-card-title truncate pb-3 bg-zinc-950/90 border-t border-zinc-900 px-3 flex flex-col justify-center">
                        <span className="truncate block text-zinc-100">{(!img.artist && !img.instrument) ? (img.title || 'Untitled').replace(/\.mp3$/, '') : (img.title || 'Untitled')}</span>
                        {img.artist && (
                          <span className="block text-[10px] text-zinc-400 font-normal mt-0.5 truncate">{img.artist}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Lightbox / Viewer modal */}
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
                <div className="w-full max-w-md p-8 bg-zinc-950 rounded-2xl shadow-2xl flex flex-col items-center justify-center border border-zinc-800">
                  <Music className="w-24 h-24 text-emerald-400 mb-4" />
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
                <div className="w-full max-w-4xl h-[80vh] bg-zinc-950 rounded-2xl shadow-2xl flex flex-col border border-zinc-800 overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
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
                    <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedImage.url)}&embedded=true`} className="w-full h-full bg-white" title="PDF Viewer" />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
                      <FileText className="w-24 h-24 text-emerald-400 mb-6" />
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
                  className="max-w-[80vw] max-h-[70vh] object-contain rounded-lg shadow-2xl border border-zinc-800"
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

const PerformanceHero = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 bg-transparent transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-[32px] p-8 md:p-12 lg:p-16 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#7ab18a]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#b5d98d]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Column: Context & Typography */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-xs text-[#b5d98d] font-mono tracking-wider uppercase"
              >
                <span className="w-2 h-2 rounded-full bg-[#7ab18a] animate-pulse" />
                VIRTUAL PERFORMANCE SUITE
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
                style={{ fontFamily: 'Courier New, Courier, monospace', color: '#b5d98d' }}
              >
                Virtual Instrument <span style={{ color: '#7ab18a' }}>Showcases</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-base sm:text-lg leading-relaxed text-zinc-300 max-w-xl font-medium"
                style={{ fontFamily: 'Courier New, Courier, monospace' }}
              >
                Experience our curated digital performances where mathematical precision meets acoustic artistry. Every cover and performance showcases the limit of high-definition tactile rendering, sample modeling, and exquisite digital synthesizers.
              </motion.p>

              {/* Stats / Badges row */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 pt-4 text-xs font-mono text-zinc-400"
              >
                <div className="flex flex-col px-4 py-2 bg-zinc-950/40 rounded-xl border border-zinc-800/40">
                  <span className="text-lg font-bold text-[#b5d98d]">Studio</span>
                  <span>Master Quality</span>
                </div>
                <div className="flex flex-col px-4 py-2 bg-zinc-950/40 rounded-xl border border-zinc-800/40">
                  <span className="text-lg font-bold text-[#7ab18a]">24-Bit</span>
                  <span>Lossless Audio</span>
                </div>
                <div className="flex flex-col px-4 py-2 bg-zinc-950/40 rounded-xl border border-zinc-800/40">
                  <span className="text-lg font-bold text-white">4K UHD</span>
                  <span>Digital Video</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Visualizer Synthesizer Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-full max-w-md bg-zinc-950/60 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group shadow-2xl"
              >
                {/* Tech corner designs */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#7ab18a]/50" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#7ab18a]/50" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#7ab18a]/50" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#7ab18a]/50" />

                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                  <span className="text-xs font-mono tracking-widest text-[#7ab18a] uppercase font-bold">DIGITAL SIGNAL SPECTRA</span>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500/80 animate-ping" />
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                </div>

                {/* Simulated Waveform & Equalizer */}
                <div className="flex items-end justify-between h-40 gap-1 px-2 pt-4 border border-zinc-900 bg-zinc-950/80 rounded-lg relative overflow-hidden">
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 grid grid-rows-4 pointer-events-none opacity-[0.03]">
                    <div className="border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-b border-white" />
                  </div>

                  <EqualizerBar delay={0.0} />
                  <EqualizerBar delay={0.15} />
                  <EqualizerBar delay={0.05} />
                  <EqualizerBar delay={0.3} />
                  <EqualizerBar delay={0.1} />
                  <EqualizerBar delay={0.4} />
                  <EqualizerBar delay={0.2} />
                  <EqualizerBar delay={0.55} />
                  <EqualizerBar delay={0.25} />
                  <EqualizerBar delay={0.45} />
                  <EqualizerBar delay={0.15} />
                  <EqualizerBar delay={0.6} />
                  <EqualizerBar delay={0.35} />
                  <EqualizerBar delay={0.5} />
                  <EqualizerBar delay={0.2} />
                  <EqualizerBar delay={0.7} />
                  <EqualizerBar delay={0.3} />
                  <EqualizerBar delay={0.4} />
                  <EqualizerBar delay={0.1} />
                  <EqualizerBar delay={0.55} />
                  <EqualizerBar delay={0.25} />
                  <EqualizerBar delay={0.45} />
                  <EqualizerBar delay={0.15} />
                  <EqualizerBar delay={0.6} />
                </div>

                <div className="mt-4 pt-3 flex justify-between items-center text-[11px] font-mono text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b5d98d]" />
                    <span>L-CH SENSITIVITY</span>
                  </div>
                  <span>96.4 kHz / 32-bit float</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const EqualizerBar = ({ delay }: { delay: number }) => (
  <motion.div 
    className="w-full bg-gradient-to-t from-[#7ab18a]/80 to-[#b5d98d] rounded-t-sm"
    style={{ height: '10%' }}
    animate={{ 
      height: ["10%", "85%", "25%", "95%", "15%", "70%", "45%", "90%", "10%"] 
    }}
    transition={{ 
      duration: 2.2, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay: delay 
    }}
  />
);

const PerformancePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="pt-20">
      <PerformanceHero />
      <DynamicEditablePage 
        collectionName="performance_sections"
        fixedSections={[
          { id: 'instruments', type: 'instruments', order: 0 },
          { id: 'performances', type: 'performances', order: 1 }
        ]}
        renderExtraSection={(section) => (
          <>
            {section.type === 'instruments' && <InstrumentsSection onInstrumentClick={setSearchQuery} />}
            {section.type === 'performances' && <PerformanceSection externalSearchQuery={searchQuery} onExternalSearchChange={setSearchQuery} />}
          </>
        )}
      />
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
  const location = useLocation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLoginSuccessModal, setShowLoginSuccessModal] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
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
    if (location.pathname === '/') {
      document.body.style.backgroundImage = `url('https://res.cloudinary.com/dj52ig0l7/image/upload/v1780378965/ns6vsegmj57d8oak0rh6.png')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'top center';
      document.body.style.backgroundAttachment = 'scroll';
      document.body.style.backgroundRepeat = 'no-repeat';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.backgroundRepeat = '';
    }
  }, [location.pathname]);

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

    let savedLogo = localStorage.getItem('app_logo');
    if (savedLogo && savedLogo.includes('pixabay.com')) {
      localStorage.setItem('app_logo', 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780632694/pua45jexzmemmkjrmvox.png');
      savedLogo = 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780632694/pua45jexzmemmkjrmvox.png';
    } else if (!savedLogo) {
      savedLogo = 'https://res.cloudinary.com/dj52ig0l7/image/upload/v1780632694/pua45jexzmemmkjrmvox.png';
    }
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
        isEditMode,
        setIsEditMode,
        cloudinaryConfig,
        saveCloudinaryConfig,
        login, 
        logout, 
        showLoginModal, 
        setShowLoginModal, 
        showLoginSuccessModal, 
        setShowLoginSuccessModal,
        showExitConfirmation,
        setShowExitConfirmation
      }}>
        <div 
          className={`min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300 ${
            location.pathname === '/' ? 'bg-transparent text-white dark' : 
            (location.pathname === '/about' || location.pathname === '/contact' || location.pathname === '/products' ? 'bg-[#fbfff4] text-[#263238]' : 'bg-zinc-950 text-white dark')
          }`}
        >
          <Navbar />
          <ElementInspector isEditMode={isEditMode} />
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
          {location.pathname !== '/about' && location.pathname !== '/contact' && location.pathname !== '/products' && <Footer />}
          <LoginModal />
          {showLoginSuccessModal && <LoginSuccessModal onClose={() => setShowLoginSuccessModal(false)} />}
          <AnimatePresence>
            {showExitConfirmation && (
              <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-4 text-emerald-400">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-xl font-bold text-white">Exit Edit Mode?</h3>
                  </div>
                  <p className="text-zinc-400 mb-6 leading-relaxed">
                    Your changes are automatically saved to the database. Are you sure you want to finish editing?
                  </p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        setIsEditMode(false);
                        setShowExitConfirmation(false);
                      }}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors"
                    >
                      Yes, Finish Editing
                    </button>
                    <button 
                      onClick={() => setShowExitConfirmation(false)}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
                    >
                      Keep Editing
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
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
