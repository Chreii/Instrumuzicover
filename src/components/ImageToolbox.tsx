import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  ArrowUp, 
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Circle,
  Palette,
  Type as TypeIcon,
  Trash2,
  Video,
  Maximize2,
  Minimize2,
  Square,
  Layout
} from 'lucide-react';

interface ImageToolboxProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
}

export const ImageToolbox: React.FC<ImageToolboxProps> = ({ 
  isOpen, 
  onClose, 
  item, 
  onUpdate,
  onRemove
}) => {
  if (!isOpen || !item) return null;

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed top-24 right-6 w-80 admin-water-bg rounded-2xl shadow-2xl z-[510] overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-cyan-950/20 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/25 animate-pulse">
            {item.type === 'video' ? <Video className="w-4 h-4 text-cyan-400" /> : 
             item.type === 'text' ? <TypeIcon className="w-4 h-4 text-cyan-400" /> : 
             <TypeIcon className="w-4 h-4 text-cyan-400" />}
          </div>
          <h3 className="font-bold text-white flex items-center gap-1">
            <span>
              {item.type === 'video' ? 'Video Content' : 
               item.type === 'text' ? 'Text Content' : 'Image Content'}
            </span>
            <span>💧</span>
          </h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-cyan-900/40 rounded-lg text-cyan-300 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-250px)] water-scroll">
        {/* Video URL Section */}
        {item.type === 'video' && (
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Video URL</label>
            <input 
              type="text"
              value={item.url || ''}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="YouTube or Vimeo link..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <p className="text-[10px] text-zinc-600">Supports YouTube, Vimeo, and direct video links.</p>
          </div>
        )}

        {/* Heading Section */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Heading</label>
          <input 
            type="text"
            value={item.heading || ''}
            onChange={(e) => onUpdate({ heading: e.target.value })}
            placeholder="Add a heading..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500">Position</span>
              <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                <button 
                  onClick={() => onUpdate({ headingPosition: 'top' })}
                  className={`flex-1 flex items-center justify-center p-1.5 rounded-md transition-all ${
                    (item.headingPosition || 'top') === 'top' ? 'bg-blue-600 text-white' : 'text-zinc-500'
                  }`}
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => onUpdate({ headingPosition: 'bottom' })}
                  className={`flex-1 flex items-center justify-center p-1.5 rounded-md transition-all ${
                    item.headingPosition === 'bottom' ? 'bg-blue-600 text-white' : 'text-zinc-500'
                  }`}
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500">Color</span>
              <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                <input 
                  type="color" 
                  value={item.headingColor || item.textColor || '#ffffff'} 
                  onChange={(e) => onUpdate({ headingColor: e.target.value })}
                  className="w-5 h-5 rounded-md bg-transparent border-none cursor-pointer"
                />
                <span className="text-[9px] text-zinc-400 font-mono uppercase truncate">{item.headingColor || item.textColor || '#ffffff'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500">Font Size (px)</span>
            <input 
              type="number"
              value={item.headingSize || 24}
              onChange={(e) => onUpdate({ headingSize: parseInt(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Description</label>
          <textarea 
            value={item.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Add a description..."
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500">Position</span>
              <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                <button 
                  onClick={() => onUpdate({ descriptionPosition: 'top' })}
                  className={`flex-1 flex items-center justify-center p-1.5 rounded-md transition-all ${
                    item.descriptionPosition === 'top' ? 'bg-blue-600 text-white' : 'text-zinc-500'
                  }`}
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => onUpdate({ descriptionPosition: 'bottom' })}
                  className={`flex-1 flex items-center justify-center p-1.5 rounded-md transition-all ${
                    (item.descriptionPosition || 'bottom') === 'bottom' ? 'bg-blue-600 text-white' : 'text-zinc-500'
                  }`}
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500">Color</span>
              <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                <input 
                  type="color" 
                  value={item.descriptionColor || item.textColor || '#a1a1aa'} 
                  onChange={(e) => onUpdate({ descriptionColor: e.target.value })}
                  className="w-5 h-5 rounded-md bg-transparent border-none cursor-pointer"
                />
                <span className="text-[9px] text-zinc-400 font-mono uppercase truncate">{item.descriptionColor || item.textColor || '#a1a1aa'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500">Font Size (px)</span>
            <input 
              type="number"
              value={item.descriptionSize || 14}
              onChange={(e) => onUpdate({ descriptionSize: parseInt(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Image/Video Styling Section */}
        {(item.type === 'image' || item.type === 'video') && (
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {item.type === 'image' ? 'Image Styling' : 'Video Styling'}
            </label>
          
          {/* Aspect Ratio */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-500">Aspect Ratio</span>
            <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {[
                { label: 'Auto', value: 'auto' },
                { label: '1:1', value: '1/1' },
                { label: '4:3', value: '4/3' },
                { label: '16:9', value: '16/9' },
                { label: '21:9', value: '21/9' },
                { label: '9:16', value: '9/16' }
              ].map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => onUpdate({ aspectRatio: ratio.value })}
                  className={`flex items-center justify-center py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    (item.aspectRatio || (item.type === 'video' ? '16/9' : 'auto')) === ratio.value ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Object Fit & Position (Image Only) */}
          {item.type === 'image' && (
            <>
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500">Object Fit</span>
                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  {[
                    { label: 'Cover', value: 'cover', icon: <Maximize2 className="w-3 h-3" /> },
                    { label: 'Contain', value: 'contain', icon: <Minimize2 className="w-3 h-3" /> }
                  ].map((fit) => (
                    <button
                      key={fit.value}
                      onClick={() => onUpdate({ objectFit: fit.value })}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                        (item.objectFit || 'cover') === fit.value ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {fit.icon}
                      {fit.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500">Object Position</span>
                <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  {[
                    { value: 'top', icon: <ArrowUp className="w-3 h-3" /> },
                    { value: 'center', icon: <Circle className="w-3 h-3" /> },
                    { value: 'bottom', icon: <ArrowDown className="w-3 h-3" /> },
                    { value: 'left', icon: <ArrowLeft className="w-3 h-3" /> },
                    { value: 'right', icon: <ArrowRight className="w-3 h-3" /> }
                  ].map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => onUpdate({ objectPosition: pos.value })}
                      className={`flex items-center justify-center py-1.5 rounded-lg transition-all ${
                        (item.objectPosition || 'center') === pos.value ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {pos.icon}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Height Control */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-500">Height (e.g. 300px, 50vh, auto)</span>
            <div className="flex gap-2">
              <input 
                type="text"
                value={item.height || ''}
                onChange={(e) => onUpdate({ height: e.target.value })}
                placeholder="auto"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button 
                onClick={() => onUpdate({ height: 'auto' })}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-[10px] font-bold transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Common Layout Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Common Layout</label>
          
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-500">Alignment</span>
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => onUpdate({ align })}
                  className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${
                    (item.align || 'center') === align ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {align === 'left' && <AlignLeft className="w-4 h-4" />}
                  {align === 'center' && <AlignCenter className="w-4 h-4" />}
                  {align === 'right' && <AlignRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-zinc-800">
          <button 
            onClick={onRemove}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-all"
          >
            <Trash2 className="w-4 h-4" /> Remove Item
          </button>
        </div>
      </div>
    </motion.div>
  );
};
