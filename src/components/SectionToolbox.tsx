import React from 'react';
import { motion } from 'motion/react';
import { Layout, Image as ImageIcon, Type, X, Square, Columns2, Columns3, Video, FileText, LayoutGrid, Rows2, Rows3, AlignJustify } from 'lucide-react';

interface SectionToolboxProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRows: (columnCount: number, rowCount?: number) => void;
  onAddImage: () => void;
  onAddVideo: () => void;
  section?: any;
  onUpdateSection: (updates: any) => void;
}

export const SectionToolbox: React.FC<SectionToolboxProps> = ({ 
  isOpen, 
  onClose, 
  onAddRows, 
  onAddImage,
  onAddVideo,
  section,
  onUpdateSection
}) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed top-24 right-6 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-[500] overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <Layout className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="font-bold text-white">Section Tools</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Layout Section */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Layout</label>
          
          <div className="flex gap-4 items-stretch">
            {/* Rows Side */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Rows2 className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Rows</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { count: 1, icon: <Square className="w-5 h-5" /> },
                  { count: 2, icon: <Rows2 className="w-5 h-5" /> },
                  { count: 3, icon: <Rows3 className="w-5 h-5" /> },
                  { count: 4, icon: <AlignJustify className="w-5 h-5" /> }
                ].map((item) => (
                  <button 
                    key={`row-${item.count}`}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify({ type: 'layout', value: 1, rowCount: item.count }))}
                    onClick={() => onAddRows(1, item.count)}
                    className="flex items-center justify-center p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl transition-all group cursor-grab active:cursor-grabbing"
                    title={`Add ${item.count} Rows`}
                  >
                    <div className="text-zinc-400 group-hover:text-blue-500 transition-colors">
                      {item.icon}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="w-px bg-zinc-800 self-stretch" />

            {/* Columns Side */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Columns2 className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Columns</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { count: 1, icon: <Square className="w-5 h-5" /> },
                  { count: 2, icon: <Columns2 className="w-5 h-5" /> },
                  { count: 3, icon: <Columns3 className="w-5 h-5" /> },
                  { count: 4, icon: <LayoutGrid className="w-5 h-5" /> }
                ].map((item) => (
                  <button 
                    key={`col-${item.count}`}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify({ type: 'layout', value: item.count }))}
                    onClick={() => onAddRows(item.count)}
                    className="flex items-center justify-center p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl transition-all group cursor-grab active:cursor-grabbing"
                    title={`${item.count} Column Row`}
                  >
                    <div className="text-zinc-400 group-hover:text-emerald-500 transition-colors">
                      {item.icon}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Content</label>
          <div className="grid grid-cols-1 gap-2">
            <button 
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify({ type: 'action', value: 'add-heading' }))}
              onClick={() => onAddRows(1)} // Default to adding a row if clicked, but we want drag-drop
              className="w-full flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl text-left transition-all group cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                <Type className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Heading</div>
                <div className="text-xs text-zinc-500">Large title text</div>
              </div>
            </button>
            <button 
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify({ type: 'action', value: 'add-description' }))}
              className="w-full flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl text-left transition-all group cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                <FileText className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Description</div>
                <div className="text-xs text-zinc-500">Smaller body text</div>
              </div>
            </button>
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Media</label>
          <div className="grid grid-cols-1 gap-2">
            <button 
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify({ type: 'action', value: 'add-image' }))}
              onClick={onAddImage}
              className="w-full flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl text-left transition-all group cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                <ImageIcon className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Add Image</div>
                <div className="text-xs text-zinc-500">From your media library</div>
              </div>
            </button>
            <button 
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify({ type: 'action', value: 'add-video' }))}
              onClick={onAddVideo}
              className="w-full flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl text-left transition-all group cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                <Video className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Add Video</div>
                <div className="text-xs text-zinc-500">YouTube, Vimeo or direct link</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
        <p className="text-[10px] text-zinc-600 text-center">
          Select a section on the left to apply these tools.
        </p>
      </div>
    </motion.div>
  );
};
