import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Trash2, Settings, MoveUp, MoveDown, Plus, Palette, Copy, ExternalLink, ArrowRight } from 'lucide-react';

interface EditableSectionProps {
  id: string;
  children: React.ReactNode;
  isEditMode: boolean;
  isSelected?: boolean;
  hideHighlight?: boolean;
  onAddBelow: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onMoveToPage?: (page: string) => void;
  onColorChange?: (color: string) => void;
  onSettings?: () => void;
}

export const EditableSection: React.FC<EditableSectionProps> = ({ 
  id, 
  children, 
  isEditMode, 
  isSelected,
  hideHighlight,
  onAddBelow, 
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onMoveToPage,
  onColorChange,
  onSettings
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dragPosition, setDragPosition] = useState<'top' | 'bottom' | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPagePicker, setShowPagePicker] = useState(false);

  if (!isEditMode) return <>{children}</>;

  const colors = [
    'transparent',
    '#000000',
    '#18181b',
    '#27272a',
    '#064e3b',
    '#1e3a8a',
    '#581c87',
    '#701a75',
    '#450a0a'
  ];

  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Performance', path: '/performance' },
    { name: 'Playlist', path: '/playlist' },
    { name: 'Product', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleDragOver = (e: React.DragEvent, position: 'top' | 'bottom') => {
    e.preventDefault();
    setDragPosition(position);
  };

  const handleDragLeave = () => {
    setDragPosition(null);
  };

  const handleDrop = (e: React.DragEvent, position: 'top' | 'bottom') => {
    e.preventDefault();
    setDragPosition(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const event = new CustomEvent('section-drop', { 
        detail: { 
          id, 
          position,
          ...data 
        } 
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Drop parsing failed", err);
    }
  };

  return (
    <div 
      className="relative group/section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowColorPicker(false);
        setShowPagePicker(false);
      }}
    >
      {/* Selection Bars / Border */}
      {!hideHighlight && (
        <div className={`absolute inset-0 border-2 transition-all pointer-events-none z-40 ${
          isSelected ? 'border-emerald-500 bg-emerald-500/10' : 
          isHovered ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-dashed border-zinc-700'
        }`} />
      )}

      {/* Insertion Bar Indicator */}
      <AnimatePresence>
        {dragPosition && (
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            className={`absolute left-0 w-full h-1 bg-emerald-500 z-[60] shadow-[0_0_15px_rgba(16,185,129,0.5)] ${
              dragPosition === 'top' ? 'top-0' : 'bottom-0'
            }`}
          />
        )}
      </AnimatePresence>

      {/* Left Controls Overlay */}
      <AnimatePresence>
        {(isHovered || isSelected) && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute top-4 left-4 z-50 flex flex-col gap-2"
          >
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-visible">
              {onMoveUp && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onMoveUp(); }} 
                  className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border-r border-zinc-800"
                  title="Move Up"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
              )}
              {onMoveDown && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onMoveDown(); }} 
                  className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border-r border-zinc-800"
                  title="Move Down"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
              )}
              {onColorChange && (
                <div className="relative border-r border-zinc-800">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); setShowPagePicker(false); }} 
                    className={`p-2 hover:bg-zinc-800 transition-colors ${showColorPicker ? 'text-emerald-500 bg-zinc-800' : 'text-zinc-400 hover:text-white'}`}
                    title="Background Color"
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {showColorPicker && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute top-full left-0 mt-2 p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[100] min-w-[180px]"
                      >
                        <div className="grid grid-cols-5 gap-1.5 mb-3">
                          {colors.map(color => (
                            <button
                              key={color}
                              onClick={(e) => {
                                e.stopPropagation();
                                onColorChange(color);
                                setShowColorPicker(false);
                              }}
                              className="w-6 h-6 rounded-md border border-zinc-700 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }}
                            >
                              {color === 'transparent' && <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 rounded-md" />}
                            </button>
                          ))}
                        </div>
                        
                        <div className="pt-3 border-t border-zinc-800">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Custom Color</p>
                          <div className="flex gap-2">
                            <div className="relative w-8 h-8 rounded-lg border border-zinc-700 overflow-hidden flex-shrink-0">
                              <input 
                                type="color"
                                className="absolute inset-[-5px] w-[calc(100%+10px)] h-[calc(100%+10px)] cursor-pointer"
                                onChange={(e) => onColorChange(e.target.value)}
                              />
                            </div>
                            <input 
                              type="text"
                              placeholder="#000000"
                              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^#[0-9A-F]{6}$/i.test(val)) {
                                  onColorChange(val);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {onDuplicate && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDuplicate(); }} 
                  className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border-r border-zinc-800"
                  title="Duplicate Section"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
              {onMoveToPage && (
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowPagePicker(!showPagePicker); setShowColorPicker(false); }} 
                    className={`p-2 hover:bg-zinc-800 transition-colors ${showPagePicker ? 'text-emerald-500 bg-zinc-800' : 'text-zinc-400 hover:text-white'}`}
                    title="Move to Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {showPagePicker && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute top-full left-0 mt-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[100] min-w-[160px]"
                      >
                        {pages.map(page => (
                          <button
                            key={page.path}
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveToPage(page.path);
                              setShowPagePicker(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-between group"
                          >
                            {page.name}
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Controls Overlay */}
      <AnimatePresence>
        {(isHovered || isSelected) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 right-4 z-50 flex gap-2"
          >
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden">
              {isSelected && (
                <div className="px-3 py-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest flex items-center">
                  Editing
                </div>
              )}
              {onSettings && (
                <button onClick={(e) => { e.stopPropagation(); onSettings(); }} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Add Section Button (Bottom) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-50">
        <button 
          onClick={onAddBelow}
          className="group/add flex items-center justify-center w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
        >
          <Plus className="w-6 h-6" />
          
          {/* Tooltip */}
          <span className="absolute left-full ml-4 px-3 py-1 bg-zinc-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover/add:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-800">
            Add New Section
          </span>
        </button>
      </div>
    </div>
  );
};
