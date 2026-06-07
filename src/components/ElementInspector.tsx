import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Type, 
  Image as ImageIcon, 
  Sliders, 
  Save, 
  RotateCcw, 
  X, 
  Check,
  Code,
  Layout,
  MousePointer,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface CustomOverride {
  text?: string;
  src?: string;
  style?: {
    fontSize?: string;
    color?: string;
    backgroundColor?: string;
    opacity?: number;
    letterSpacing?: string;
    padding?: string;
  };
}

interface ElementInspectorProps {
  isEditMode: boolean;
}

export const ElementInspector: React.FC<ElementInspectorProps> = ({ isEditMode }) => {
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null);
  const [selector, setSelector] = useState<string>('');
  
  // Element attributes
  const [originalText, setOriginalText] = useState<string>('');
  const [editText, setEditText] = useState<string>('');
  const [originalSrc, setOriginalSrc] = useState<string>('');
  const [editSrc, setEditSrc] = useState<string>('');
  
  // Custom Styles overrides
  const [editFontSize, setEditFontSize] = useState<string>('');
  const [editColor, setEditColor] = useState<string>('');
  const [editBgColor, setEditBgColor] = useState<string>('');
  const [editOpacity, setEditOpacity] = useState<number>(100);
  const [editLetterSpacing, setEditLetterSpacing] = useState<string>('');

  const [globalOverrides, setGlobalOverrides] = useState<Record<string, CustomOverride>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'styles' | 'info'>('content');

  // Real-time subscription to database overrides
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "custom_overrides"), (snapshot) => {
      const overrides: Record<string, CustomOverride> = {};
      snapshot.forEach((doc) => {
        overrides[doc.id] = doc.data() as CustomOverride;
      });
      setGlobalOverrides(overrides);
    }, (error) => {
      console.error("Error fetching custom overrides:", error);
    });
    return () => unsub();
  }, []);

  // Calculate unique CSS selector for any DOM element
  const getCleanSelector = (el: HTMLElement): string => {
    if (el.id) return `#${el.id}`;
    
    // Avoid calculating past major app shell blocks or body/html
    const path: string[] = [];
    let current: HTMLElement | null = el;
    
    while (current && current.tagName !== 'BODY' && current.tagName !== 'HTML') {
      let tagName = current.tagName.toLowerCase();
      
      // If it has a specific class that identifies it uniquely, we can use it
      const classList = Array.from(current.classList).filter(c => 
        !c.includes('hover:') && 
        !c.includes('active:') && 
        !c.includes('transition') && 
        !c.includes('duration') && 
        !c.includes('animate') &&
        !c.startsWith('border-') &&
        !c.startsWith('text-') &&
        !c.startsWith('bg-')
      );
      
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current?.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(current);
          path.unshift(`${tagName}:nth-of-type(${index + 1})`);
        } else {
          path.unshift(tagName);
        }
      } else {
        path.unshift(tagName);
      }
      current = parent;
    }
    return path.join(' > ');
  };

  // Check if element is editable/inspected target candidate
  const isInspectionTarget = (el: HTMLElement): boolean => {
    // Avoid selecting inspector panels or active modals
    if (
      el.closest('.inspector-ui') || 
      el.closest('#inspector-sidebar') || 
      el.closest('.auth-modal') ||
      el.closest('.edit-toolbox') ||
      el.closest('.admin-toolbox')
    ) {
      return false;
    }

    const tagName = el.tagName.toUpperCase();

    // Elements we want to inspect
    const targetTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'BUTTON', 'A', 'LI', 'LABEL', 'FIGCAPTION', 'SMALL', 'DIV'];
    
    if (tagName === 'IMG') return true;

    if (targetTags.includes(tagName)) {
      // For general container tags (like div), only target if they contain directly a text node as child (immediate text leaf)
      if (tagName === 'DIV') {
        const children = Array.from(el.childNodes);
        const hasDirectText = children.some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
        const hasNoComplexChildren = el.children.length === 0 || (el.children.length === 1 && ['SPAN', 'A', 'I', 'svg'].includes(el.children[0].tagName));
        return !!(hasDirectText && hasNoComplexChildren);
      }
      
      const text = el.textContent?.trim() || '';
      return text.length > 0;
    }

    return false;
  };

  // Hover and Click Listener effect
  useEffect(() => {
    if (!isEditMode) {
      setHoveredEl(null);
      setHoveredRect(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Find element at coordinates
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (!target) return;

      if (isInspectionTarget(target)) {
        if (target !== hoveredEl && target !== selectedEl) {
          setHoveredEl(target);
          setHoveredRect(target.getBoundingClientRect());
        }
      } else {
        setHoveredEl(null);
        setHoveredRect(null);
      }
    };

    const handleMouseClick = (e: MouseEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (!target) return;

      if (isInspectionTarget(target)) {
        e.preventDefault();
        e.stopPropagation();

        setSelectedEl(target);
        const rect = target.getBoundingClientRect();
        setSelectedRect(rect);
        
        const sel = getCleanSelector(target);
        setSelector(sel);

        // Fetch values
        const elementTag = target.tagName.toUpperCase();
        
        if (elementTag === 'IMG') {
          const imgSrc = (target as HTMLImageElement).src;
          setOriginalSrc(imgSrc);
          setEditSrc(globalOverrides[sel]?.src || imgSrc);
          setOriginalText('');
          setEditText('');
          setActiveTab('content');
        } else {
          const elText = target.textContent?.trim() || '';
          setOriginalText(elText);
          setEditText(globalOverrides[sel]?.text !== undefined ? (globalOverrides[sel].text || '') : elText);
          setOriginalSrc('');
          setEditSrc('');
          setActiveTab('content');
        }

        // Fetch style settings
        const currentStyle = globalOverrides[sel]?.style || {};
        setEditFontSize(currentStyle.fontSize || '');
        setEditColor(currentStyle.color || '');
        setEditBgColor(currentStyle.backgroundColor || '');
        setEditOpacity(currentStyle.opacity !== undefined ? currentStyle.opacity : 100);
        setEditLetterSpacing(currentStyle.letterSpacing || '');

        setHoveredEl(null);
        setHoveredRect(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleMouseClick, { capture: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick, { capture: true });
    };
  }, [isEditMode, hoveredEl, selectedEl, globalOverrides]);

  // Apply overrides hook
  useEffect(() => {
    if (Object.keys(globalOverrides).length === 0) return;

    const applyAllOverrides = () => {
      Object.entries(globalOverrides).forEach(([sel, override]) => {
        try {
          const elements = document.querySelectorAll(sel);
          elements.forEach((node) => {
            const el = node as HTMLElement;
            if (!el) return;

            // Apply Text Override
            if (override.text !== undefined && el.tagName !== 'IMG') {
              if (el.children.length === 0) {
                if (el.textContent !== override.text) el.textContent = override.text;
              } else {
                // Safely replace direct text children without purging elements like SVGs/Spans
                Array.from(el.childNodes).forEach(child => {
                  if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
                    if (child.textContent !== override.text) child.textContent = override.text;
                  }
                });
              }
            }

            // Apply Image Src Override
            if (override.src !== undefined && el.tagName === 'IMG') {
              const img = el as HTMLImageElement;
              if (img.src !== override.src) img.src = override.src;
            }

            // Apply Style Overrides
            if (override.style) {
              const s = override.style;
              if (s.fontSize) el.style.fontSize = s.fontSize;
              if (s.color) el.style.color = s.color;
              if (s.backgroundColor) el.style.backgroundColor = s.backgroundColor;
              if (s.opacity !== undefined) el.style.opacity = String(s.opacity / 100);
              if (s.letterSpacing) el.style.letterSpacing = s.letterSpacing;
              if (s.padding) el.style.padding = s.padding;
            }
          });
        } catch (e) {
          // Skip invalid selector errors
        }
      });
    };

    applyAllOverrides();
    const interval = setInterval(applyAllOverrides, 700); // Poll frequently to override dynamic updates
    return () => clearInterval(interval);
  }, [globalOverrides]);

  // Save changes to database
  const handleSaveOverride = async () => {
    if (!selector) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, "custom_overrides", selector);
      
      const payload: CustomOverride = {};
      
      if (selectedEl?.tagName === 'IMG') {
        payload.src = editSrc;
      } else {
        payload.text = editText;
      }

      // Add styles override if modified
      const stylePayload: any = {};
      if (editFontSize) stylePayload.fontSize = editFontSize;
      if (editColor) stylePayload.color = editColor;
      if (editBgColor) stylePayload.backgroundColor = editBgColor;
      if (editOpacity !== 100) stylePayload.opacity = editOpacity;
      if (editLetterSpacing) stylePayload.letterSpacing = editLetterSpacing;

      if (Object.keys(stylePayload).length > 0) {
        payload.style = stylePayload;
      }

      await setDoc(docRef, payload);
      
      setShowNotification("Successfully saved and published choice to Firestore database!");
      setTimeout(() => setShowNotification(null), 4000);
      setSelectedEl(null);
      setSelectedRect(null);
    } catch (error) {
      console.error("Error saving override:", error);
      alert("Error saving override: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSaving(false);
    }
  };

  // Reset override to default block
  const handleResetOverride = async () => {
    if (!selector) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, "custom_overrides", selector);
      await deleteDoc(docRef);
      
      // Clear style overrides on active element
      if (selectedEl) {
        selectedEl.style.fontSize = '';
        selectedEl.style.color = '';
        selectedEl.style.backgroundColor = '';
        selectedEl.style.opacity = '';
        selectedEl.style.letterSpacing = '';
        
        // Restore default text / image
        if (selectedEl.tagName === 'IMG') {
          (selectedEl as HTMLImageElement).src = originalSrc;
        } else {
          selectedEl.textContent = originalText;
        }
      }

      setShowNotification("Reset element override successfully! Default layout restored.");
      setTimeout(() => setShowNotification(null), 4000);
      setSelectedEl(null);
      setSelectedRect(null);
    } catch (error) {
      console.error("Error deleting override:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditMode) return null;

  return (
    <>
      {/* 1. Global Hover Outline Indicator */}
      {hoveredRect && (
        <div 
          className="fixed pointer-events-none z-[9999] border-2 border-dashed border-[#22d3ee] bg-[#22d3ee]/10 transition-all duration-75 flex flex-col justify-start items-start"
          style={{
            top: hoveredRect.top,
            left: hoveredRect.left,
            width: hoveredRect.width,
            height: hoveredRect.height,
          }}
        >
          <div className="absolute -top-6 left-0 bg-cyan-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-200 animate-pulse" />
            <span>{(hoveredEl?.tagName || 'ELEMENT').toUpperCase()} • Inspect Fluid element 🌊</span>
          </div>
        </div>
      )}

      {/* 2. Selected Outline Indicator */}
      {selectedRect && (
        <div 
          className="fixed pointer-events-none z-[9998] border-2 border-[#06b6d4] bg-[#06b6d4]/15 water-ripple-pulse"
          style={{
            top: selectedRect.top,
            left: selectedRect.left,
            width: selectedRect.width,
            height: selectedRect.height,
          }}
        />
      )}

      {/* 3. Sliding Inspector Sidebar */}
      <AnimatePresence>
        {selectedEl && (
          <motion.div
            id="inspector-sidebar"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="inspector-ui fixed right-0 top-0 bottom-0 w-full max-w-md admin-water-bg water-scroll z-[10001] shadow-2xl overflow-y-auto flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between text-zinc-100 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/25">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight text-white font-mono flex items-center gap-1.5">
                    <span>Live UI Inspector</span>
                    <span className="text-base">🌊</span>
                  </h3>
                  <p className="text-cyan-300/60 text-xs">Analyze & Overwrite any Element</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedEl(null); setSelectedRect(null); }}
                className="p-1.5 hover:bg-cyan-900/40 rounded-md transition-all text-cyan-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target identifier info */}
            <div className="px-6 py-4 bg-cyan-950/20 border-b border-cyan-500/20 flex flex-col gap-2 z-10">
              <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target CSS Path Selector</span>
              </div>
              <div className="text-xs bg-cyan-950/40 p-2 rounded border border-cyan-900/60 text-cyan-200 font-mono break-all line-clamp-2 select-all">
                {selector}
              </div>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-1.5 py-0.5 rounded-full font-bold">
                  Tag: {selectedEl.tagName}
                </span>
                <span className="text-[10px] bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 px-1.5 py-0.5 rounded-full font-mono">
                  State: {globalOverrides[selector] ? 'Custom Override Active 💧' : 'Default Code State'}
                </span>
              </div>
            </div>

            {/* Tab selection */}
            <div className="grid grid-cols-3 border-b border-cyan-500/20 px-2 bg-cyan-950/30 z-10">
              <button 
                onClick={() => setActiveTab('content')}
                className={`py-3 text-xs font-bold font-mono border-b-2 flex items-center justify-center gap-1 ${activeTab === 'content' ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5' : 'border-transparent text-cyan-300/60 hover:text-cyan-100'}`}
              >
                <Layout className="w-3.5 h-3.5" />
                Content
              </button>
              <button 
                onClick={() => setActiveTab('styles')}
                className={`py-3 text-xs font-bold font-mono border-b-2 flex items-center justify-center gap-1 ${activeTab === 'styles' ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5' : 'border-transparent text-cyan-300/60 hover:text-cyan-100'}`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Styling
              </button>
              <button 
                onClick={() => setActiveTab('info')}
                className={`py-3 text-xs font-bold font-mono border-b-2 flex items-center justify-center gap-1 ${activeTab === 'info' ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5' : 'border-transparent text-cyan-300/60 hover:text-cyan-100'}`}
              >
                <MousePointer className="w-3.5 h-3.5" />
                DOM Info
              </button>
            </div>

            {/* Main scrollable tabs form */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              
              {/* Tab Content */}
              {activeTab === 'content' && (
                <div className="space-y-5">
                  {selectedEl.tagName === 'IMG' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                          Image URL Address
                        </label>
                        <input
                          type="text"
                          value={editSrc}
                          onChange={(e) => setEditSrc(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                          placeholder="https://example.com/image.png"
                        />
                      </div>

                      <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-800/80">
                        <span className="text-xs text-zinc-400 block mb-2 font-bold font-mono">Original Source Preview:</span>
                        <img 
                          src={originalSrc} 
                          alt="Original" 
                          className="max-h-24 max-w-full rounded border border-zinc-800 object-contain mx-auto" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  ) : (
                     <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5 text-cyan-400" />
                          Display Text Override
                        </label>
                        <textarea
                          rows={4}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-cyan-950/40 border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
                          placeholder="Type changes to live website content..."
                        />
                      </div>

                      <div className="p-3 bg-cyan-950/20 rounded-lg border border-cyan-500/10">
                        <span className="text-[10px] text-cyan-300/60 uppercase font-bold font-mono block mb-1">Original Text:</span>
                        <p className="text-zinc-400 text-xs italic">
                          "{originalText || '(Empty)'}"
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-cyan-500/5 text-cyan-300 rounded-lg border border-cyan-500/10 text-xs flex gap-2.5">
                    <HelpCircle className="w-4 h-4 mt-0.5 shrink-0 text-cyan-400" />
                    <p>
                      Modifying this field alters the element directly in real-time across the entire application and matches perfectly on any browser!
                    </p>
                  </div>
                </div>
              )}

              {/* Tab Styles */}
              {activeTab === 'styles' && (
                <div className="space-y-5 z-10">
                  <div className="space-y-4">
                    {/* Font Size Override */}
                    <div>
                      <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider mb-2 font-mono">
                        Font Size (rem / px)
                      </label>
                      <input
                        type="text"
                        value={editFontSize}
                        onChange={(e) => setEditFontSize(e.target.value)}
                        className="w-full bg-cyan-950/40 border border-cyan-500/20 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:ring-1 focus:ring-cyan-400 font-mono"
                        placeholder="e.g. 1.25rem, 24px, 3rem"
                      />
                    </div>

                    {/* Text Color Override */}
                    <div>
                      <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider mb-2 font-mono">
                        Text Color Hex
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editColor.startsWith('#') && editColor.length === 7 ? editColor : '#ffffff'}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-10 h-10 border border-cyan-500/20 rounded bg-cyan-950 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="flex-1 bg-cyan-950/40 border border-cyan-500/20 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:ring-1 focus:ring-cyan-400 font-mono"
                          placeholder="e.g. #7ab18a, rgb(255, 255, 255)"
                        />
                      </div>
                    </div>

                    {/* Background Color Override */}
                    <div>
                      <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider mb-2 font-mono">
                        Background Color Hex / Transparent
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editBgColor.startsWith('#') && editBgColor.length === 7 ? editBgColor : '#000000'}
                          onChange={(e) => setEditBgColor(e.target.value)}
                          className="w-10 h-10 border border-cyan-500/20 rounded bg-cyan-950 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editBgColor}
                          onChange={(e) => setEditBgColor(e.target.value)}
                          className="flex-1 bg-cyan-950/40 border border-cyan-500/20 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:ring-1 focus:ring-cyan-400 font-mono"
                          placeholder="e.g. #18181b, transparent"
                        />
                      </div>
                    </div>

                    {/* Opacity Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider font-mono">
                          Opacity (%)
                        </label>
                        <span className="text-xs text-cyan-300 font-mono font-bold">{editOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editOpacity}
                        onChange={(e) => setEditOpacity(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 h-1 bg-cyan-950 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Letter Spacing Override */}
                    <div>
                      <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider mb-2 font-mono">
                        Letter Spacing
                      </label>
                      <input
                        type="text"
                        value={editLetterSpacing}
                        onChange={(e) => setEditLetterSpacing(e.target.value)}
                        className="w-full bg-cyan-950/40 border border-cyan-500/20 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:ring-1 focus:ring-cyan-400 font-mono"
                        placeholder="e.g. 0.05em, 2px, -0.02em"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Info */}
              {activeTab === 'info' && (
                <div className="space-y-4 z-10">
                  <div className="space-y-2.5">
                    <span className="block text-xs font-bold text-cyan-200 uppercase tracking-wider font-mono">
                      CSS Styling Classes Inside DOM
                    </span>
                    <div className="bg-cyan-950/40 p-4 border border-cyan-500/20 rounded-xl space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono block">HTML Node:</span>
                        <span className="text-zinc-200 font-mono text-xs">&lt;{selectedEl.tagName.toLowerCase()}&gt;</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono block">Class Names list:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {Array.from(selectedEl.classList).map((cls, i) => (
                            <span key={i} className="bg-cyan-900/30 text-[10px] text-cyan-300 border border-cyan-500/20 px-1.5 py-0.5 rounded font-mono">
                              {cls}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono block">Node Parent:</span>
                        <span className="text-zinc-400 text-xs font-mono">&lt;{selectedEl.parentElement?.tagName.toLowerCase() || 'none'}&gt;</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Actions Footer */}
            <div className="p-6 border-t border-cyan-500/20 bg-cyan-950/40 flex gap-3 z-10">
              <button
                onClick={handleSaveOverride}
                disabled={isSaving}
                className="flex-1 bg-cyan-700 hover:bg-cyan-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white py-2.5 rounded-xl font-bold font-mono text-sm shadow transition-all duration-150 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save & Publish 🌊
              </button>
              
              {globalOverrides[selector] && (
                <button
                  onClick={handleResetOverride}
                  disabled={isSaving}
                  className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 py-2.5 px-3.5 rounded-xl text-sm font-bold transition-all duration-150 flex items-center justify-center gap-1.5"
                  title="Remove override and restore code defaults"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Real-time floating Notification Card overlay */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            id="custom-notification"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-cyan-950/90 border border-cyan-400/40 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 z-[10002] transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
              <Check className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-zinc-100 text-xs font-semibold leading-none">{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
