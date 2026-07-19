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
          className="absolute inset-0 bg-slate-900/60  transition-opacity duration-300"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="relative bg-primary w-full max-w-xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 animate-modal-entrance flex flex-col max-h-[95vh] sm:max-h-[90vh]">
          <div className="p-5 sm:p-8 pb-4 border-b border-slate-100 flex justify-between items-start bg-transparent flex-shrink-0 relative">
            <div className="pr-10">
              <h3 className="text-xl sm:text-2xl font-bold text-primary tracking-tight leading-tight">{title}</h3>
              {subtitle && <p className="text-xs sm:text-sm text-[#86626E]/80 mt-1 sm:mt-1.5 font-medium leading-relaxed">{subtitle}</p>}
            </div>
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-primary border border-slate-100 shadow-sm hover:bg-primary transition-all text-[#86626E]/70 hover:text-white active:scale-90"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">close</span>
            </button>
          </div>
          
          <div className="p-5 sm:p-8 md:p-10 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
