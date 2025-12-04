'use client';

interface AllowlistFullModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  cap: number;
}

export function AllowlistFullModal({ isOpen, onClose, count, cap }: AllowlistFullModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm border-4 border-red-500 bg-black p-6 shadow-[0_0_40px_rgba(255,0,0,0.3)]">
        {/* Glitch lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block bg-red-600 px-4 py-2 transform -rotate-1 border-2 border-red-900 mb-4">
            <span 
              className="text-white text-lg tracking-widest"
              style={{ 
                fontFamily: '"Press Start 2P", monospace',
                textShadow: '2px 2px 0 #000'
              }}
            >
              CLOSED
            </span>
          </div>
          
          <h2 
            className="text-red-500 text-base mb-2"
            style={{ 
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '0 0 10px rgba(255,0,0,0.5)'
            }}
          >
            ALLOWLIST FULL
          </h2>
          
          <p className="text-gray-400 font-mono text-sm">
            The registration has reached capacity
          </p>
        </div>
        
        {/* Stats */}
        <div className="border-2 border-red-500/30 bg-red-900/10 p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 font-mono text-xs">REGISTERED</span>
            <span className="text-red-400 font-mono text-sm">{count.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-mono text-xs">CAPACITY</span>
            <span className="text-red-400 font-mono text-sm">{cap.toLocaleString()}</span>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-800 border border-red-500/30">
            <div 
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: '100%' }}
            />
          </div>
        </div>
        
        {/* Message */}
        <p className="text-gray-500 font-mono text-xs text-center mb-6">
          Follow <span className="text-protardio-magenta">@protardio</span> for updates on Phase 2
        </p>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 border-2 border-gray-600 bg-transparent text-gray-400 font-mono text-xs uppercase tracking-wider hover:border-gray-400 hover:text-white transition-all active:scale-95"
        >
          CLOSE
        </button>
        
        {/* Sad face */}
        <p className="text-center text-gray-600 font-mono text-xs mt-4">
          :(
        </p>
      </div>
    </div>
  );
}
