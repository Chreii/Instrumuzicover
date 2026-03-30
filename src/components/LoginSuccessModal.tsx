import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, X } from 'lucide-react';

interface LoginSuccessModalProps {
  onClose: () => void;
}

const LoginSuccessModal = ({ onClose }: LoginSuccessModalProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Login Successful</h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          You are logged in as Administrator. You are allowed to make changes and upload new videos.
        </p>
        <button 
          onClick={onClose}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all"
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
};

export default LoginSuccessModal;
