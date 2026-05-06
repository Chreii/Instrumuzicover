import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Image as ImageIcon, Trash2, Video, AlignLeft, AlignCenter, AlignRight, Circle, Type } from 'lucide-react';

interface EditableRowProps {
  row: any;
  sectionId: string;
  isEditMode: boolean;
  selectedItemId?: string;
  onDrop: (data: any, position: 'top' | 'bottom' | 'left' | 'right' | 'center', slotIndex?: number) => void;
  onSelectItem: (itemId: string) => void;
  onDelete?: () => void;
  onUpdateRow?: (updates: any) => void;
}

export const EditableRow: React.FC<EditableRowProps> = ({ 
  row, 
  sectionId,
  isEditMode, 
  selectedItemId,
  onDrop,
  onSelectItem,
  onDelete,
  onUpdateRow
}) => {
  const [dragPosition, setDragPosition] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

    const getEmbedUrl = (url: string) => {
      if (!url) return '';
      // YouTube
      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^?&"'>]+)/);
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
      // Vimeo
      const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      return url;
    };

    const renderItem = (item: any) => {
      if (!item) return null;

      const textAlign = item.align || 'center';
      const headingColor = item.headingColor || item.textColor || '#ffffff';
      const descriptionColor = item.descriptionColor || item.textColor || '#a1a1aa';
      const headingSize = item.headingSize || 24;
      const descriptionSize = item.descriptionSize || 14;

      const content = (
        <div className={`flex flex-col gap-4 w-full ${
          textAlign === 'left' ? 'items-start text-left' :
          textAlign === 'right' ? 'items-end text-right' : 'items-center text-center'
        }`}>
          {/* Top Content */}
          <div className="flex flex-col gap-2 w-full">
            {item.heading && (item.headingPosition || 'top') === 'top' && (
              <h3 className="font-bold leading-tight" style={{ color: headingColor, fontSize: `${headingSize}px` }}>{item.heading}</h3>
            )}
            {item.description && item.descriptionPosition === 'top' && (
              <p className="leading-relaxed" style={{ color: descriptionColor, fontSize: `${descriptionSize}px` }}>{item.description}</p>
            )}
          </div>
          
          <div className="relative w-full group/item cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelectItem(item.id); }}>
            {item.type === 'image' && (
              <div 
                className={`w-full overflow-hidden rounded-2xl shadow-lg transition-all ${
                  isEditMode && selectedItemId === item.id ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-zinc-950' : ''
                }`}
                style={{ 
                  aspectRatio: item.aspectRatio && item.aspectRatio !== 'auto' ? item.aspectRatio : undefined,
                  height: item.height || ((!item.aspectRatio || item.aspectRatio === 'auto') ? '256px' : 'auto')
                }}
              >
                <img 
                  src={item.url} 
                  alt="" 
                  className="w-full h-full transition-all duration-500"
                  style={{ 
                    objectFit: item.objectFit || 'cover',
                    objectPosition: item.objectPosition || 'center'
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            {item.type === 'video' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div 
                    className={`w-full rounded-2xl overflow-hidden shadow-lg transition-all ${
                      isEditMode && selectedItemId === item.id ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-zinc-950' : ''
                    }`}
                    style={{ 
                      aspectRatio: item.aspectRatio && item.aspectRatio !== 'auto' ? item.aspectRatio : '16/9',
                      height: item.height || 'auto'
                    }}
                  >
                    {item.url ? (
                      <iframe 
                        src={getEmbedUrl(item.url)}
                        className="w-full h-full border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center gap-2 text-zinc-500">
                        <Video className="w-8 h-8" />
                        <span className="text-xs">No video URL provided</span>
                      </div>
                    )}
                    {isEditMode && <div className="absolute inset-0 z-10" />}
                  </div>
                </motion.div>
            )}
            {item.type === 'text' && isEditMode && (
              <div className={`p-4 rounded-xl border-2 border-dashed transition-all ${
                selectedItemId === item.id ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-800 hover:border-zinc-700'
              }`}>
                <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs uppercase tracking-widest font-bold">
                  <Type className="w-3 h-3" /> Text Block
                </div>
              </div>
            )}
          </div>

          {/* Bottom Content */}
          <div className="flex flex-col gap-2 w-full">
            {item.heading && item.headingPosition === 'bottom' && (
              <h3 className="font-bold leading-tight" style={{ color: headingColor, fontSize: `${headingSize}px` }}>{item.heading}</h3>
            )}
            {item.description && (item.descriptionPosition || 'bottom') === 'bottom' && (
              <p className="leading-relaxed" style={{ color: descriptionColor, fontSize: `${descriptionSize}px` }}>{item.description}</p>
            )}
          </div>
        </div>
      );

      return content;
    };

  if (!isEditMode) {
    return (
      <div className={`grid gap-12 ${
        row.layout === '1-col' ? 'grid-cols-1' : 
        row.layout === '2-col' ? 'grid-cols-1 md:grid-cols-2' : 
        row.layout === '3-col' ? 'grid-cols-1 md:grid-cols-3' :
        'grid-cols-1 md:grid-cols-4'
      }`}>
        {(row.items || []).map((item: any, i: number) => {
          // Skip rendering video items with no URL in non-edit mode
          if (item.type === 'video' && !item.url) return null;
          
          return (
            <div key={i}>
              {renderItem(item)}
            </div>
          );
        })}
      </div>
    );
  }

  const colCount = row.layout === '1-col' ? 1 : row.layout === '2-col' ? 2 : row.layout === '3-col' ? 3 : 4;
  const slots = Array.from({ length: colCount });

  const handleDragOver = (e: React.DragEvent, position: 'top' | 'bottom' | 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setDragPosition(position);
    setActiveSlot(null);
  };

  const handleSlotDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlot(index);
    setDragPosition(null);
  };

  const handleDrop = (e: React.DragEvent, position: 'top' | 'bottom' | 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setDragPosition(null);
    try {
      const dataTransfer = e.dataTransfer.getData('application/json');
      if (!dataTransfer) return;
      const data = JSON.parse(dataTransfer);
      onDrop(data, position);
    } catch (err) {
      console.error("Drop failed", err);
    }
  };

  const handleSlotDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlot(null);
    try {
      const dataTransfer = e.dataTransfer.getData('application/json');
      if (!dataTransfer) return;
      const data = JSON.parse(dataTransfer);
      
      // If it's an action, we need to trigger the global event with slot info
      if (data.type === 'action') {
        window.dispatchEvent(new CustomEvent('section-drop', { 
          detail: { 
            id: sectionId,
            type: data.type,
            value: data.value,
            rowIndex: undefined, // Will be handled by the parent's handleRowDrop
            slotIndex: index
          } 
        }));
      } else {
        onDrop(data, 'center', index);
      }
    } catch (err) {
      console.error("Slot drop failed", err);
    }
  };

  return (
    <div className="relative group/row py-6">
      {/* Row Controls (Edit Mode) */}
      {isEditMode && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 shadow-xl opacity-0 group-hover/row:opacity-100 transition-all">
          <div className="flex items-center gap-2 border-r border-zinc-800 pr-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Width</span>
            <input 
              type="text"
              value={row.width || '100%'}
              onChange={(e) => onUpdateRow?.({ width: e.target.value })}
              className="w-12 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-white outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-1">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                onClick={() => onUpdateRow?.({ align })}
                className={`p-1 rounded transition-all ${
                  (row.align || 'center') === align ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {align === 'left' && <AlignLeft className="w-3 h-3" />}
                {align === 'center' && <AlignCenter className="w-3 h-3" />}
                {align === 'right' && <AlignRight className="w-3 h-3" />}
              </button>
            ))}
          </div>
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="ml-1 p-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded transition-all"
              title="Delete Row"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Row Drop Zones (Outer) */}
      <div className="absolute -inset-x-4 -inset-y-2 pointer-events-none z-20">
        <div 
          className="absolute top-0 left-0 w-full h-[20%] pointer-events-auto"
          onDragOver={(e) => handleDragOver(e, 'top')}
          onDragLeave={() => setDragPosition(null)}
          onDrop={(e) => handleDrop(e, 'top')}
        />
        <div 
          className="absolute bottom-0 left-0 w-full h-[20%] pointer-events-auto"
          onDragOver={(e) => handleDragOver(e, 'bottom')}
          onDragLeave={() => setDragPosition(null)}
          onDrop={(e) => handleDrop(e, 'bottom')}
        />
      </div>

      {/* Insertion Indicators */}
      <AnimatePresence>
        {dragPosition && (
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            className={`absolute left-0 w-full h-1 bg-emerald-500 z-50 shadow-[0_0_15px_rgba(16,185,129,0.5)] ${
              dragPosition === 'top' ? 'top-0' : 'bottom-0'
            }`}
          />
        )}
      </AnimatePresence>

      {/* The Grid */}
      <div 
        className={`grid gap-8 relative z-10 transition-all duration-500 ${
          row.layout === '1-col' ? 'grid-cols-1' : 
          row.layout === '2-col' ? 'grid-cols-1 md:grid-cols-2' : 
          row.layout === '3-col' ? 'grid-cols-1 md:grid-cols-3' :
          'grid-cols-1 md:grid-cols-4'
        } ${
          (row.align || 'center') === 'left' ? 'mr-auto' :
          (row.align || 'center') === 'right' ? 'ml-auto' : 'mx-auto'
        }`}
        style={{ width: row.width || '100%' }}
      >
        {slots.map((_, index) => {
          const item = row.items?.[index];
          return (
            <div 
              key={index}
              onDragOver={(e) => handleSlotDragOver(e, index)}
              onDragLeave={() => setActiveSlot(null)}
              onDrop={(e) => handleSlotDrop(e, index)}
              className={`relative min-h-[200px] rounded-2xl transition-all duration-300 ${
                !item ? 'border-2 border-dashed border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center' : ''
              } ${activeSlot === index ? 'border-emerald-500 bg-emerald-500/5 scale-[1.02] z-30' : ''}`}
            >
              {item ? (
                renderItem(item)
              ) : (
                <div className="text-center p-6">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-2 border border-zinc-700">
                    <Plus className="w-5 h-5 text-zinc-500" />
                  </div>
                  <p className="text-zinc-600 text-xs font-medium uppercase tracking-wider">Empty Slot</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
