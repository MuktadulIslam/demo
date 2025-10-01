import { memo } from 'react';

interface ModelLoadingIndicatorProps {
  totalModels: number;
  loadedModels: number;
  failedModels: number;
  totalBytes: number;
  loadedBytes: number;
  isInitializing: boolean;
}

const MAX_DECIMALS = 1;

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const magnitude = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, magnitude);

  return `${value.toFixed(magnitude === 0 ? 0 : MAX_DECIMALS)} ${units[magnitude]}`;
};

const ModelLoadingIndicator = memo(function ModelLoadingIndicator({ 
  totalModels, 
  loadedModels, 
  failedModels, 
  totalBytes,
  loadedBytes,
  isInitializing 
}: ModelLoadingIndicatorProps) {
  const progressPercentage = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
  const isComplete = loadedModels + failedModels >= totalModels;

  // Don't show anything if not initializing, no models to load, or loading is complete
  if (!isInitializing || totalModels === 0 || isComplete) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-lg p-6 text-white max-w-md mx-4 border border-gray-700 shadow-xl z-50">
        <div className="flex flex-col items-center space-y-4">
          {/* Loading spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          
          {/* Status text */}
          <div className="text-xl font-medium text-center">
            🔄 Restoring 3D Models
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="h-3 rounded-full transition-all duration-300 ease-out bg-blue-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Statistics */}
          <div className="text-sm text-gray-300 space-y-2 w-full">
            <div className="flex justify-between">
              <span>Progress:</span>
              <span className="font-mono">
                {loadedModels + failedModels} / {totalModels} ({progressPercentage}%)
              </span>
            </div>

            <div className="flex justify-between">
              <span className='mr-1'>Data transferred:</span>
              <span className="font-mono">
                {formatBytes(loadedBytes)} / {totalBytes === 0 ? 'calculating…' : formatBytes(totalBytes)}
              </span>
            </div>
            
            {loadedModels > 0 && (
              <div className="flex justify-between">
                <span className="text-green-400">✓ Loaded:</span>
                <span className="font-mono text-green-400">{loadedModels}</span>
              </div>
            )}
            
            {failedModels > 0 && (
              <div className="flex justify-between">
                <span className="text-red-400">✗ Failed:</span>
                <span className="font-mono text-red-400">{failedModels}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ModelLoadingIndicator;