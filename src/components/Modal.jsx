import React from 'react';
import Portal from './Portal';
import { useStore } from '../store/useStore';

const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  const { settings } = useStore();
  
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop with Blur */}
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 animate-modal-entrance flex flex-col max-h-[90vh]">
          <div className="p-8 pb-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 flex-shrink-0">
            <div className="pr-12">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">{title}</h3>
              {subtitle && <p className="text-sm text-slate-500 mt-1.5 font-medium leading-relaxed">{subtitle}</p>}
            </div>
            <button 
              onClick={onClose} 
              className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-600 active:scale-90"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          
          <div className="p-10 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
