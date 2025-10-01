import React, { memo, useCallback } from 'react';

interface RoomControlsProps {
    length: number;
    width: number;
    onLengthChange: (length: number) => void;
    onWidthChange: (width: number) => void;
}

// Room controls component
const RoomControls = memo(function RoomControls({
    length,
    width,
    onLengthChange,
    onWidthChange,
}: RoomControlsProps) {
    const MAX_LENGTH = 40;
    const MIN_LENGTH = 6;
    const MAX_WIDTH = 40;
    const MIN_WIDTH = 6;

    const handleWidthInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= MIN_WIDTH && value <= MAX_WIDTH) {
            onWidthChange(value);
        }
    }, [onWidthChange]);

    const handleLengthInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= MIN_LENGTH && value <= MAX_LENGTH) {
            onLengthChange(value);
        }
    }, [onLengthChange]);

    return (
        <div className="z-40 absolute top-[50px] right-5 text-white font-sans text-sm bg-gray-900/90 bg-opacity-80 px-4 py-2 rounded-lg w-[270px]">
            <h3 className="m-0 mb-3 text-white text-lg font-bold">Room Controls</h3>

            <div className="mb-2">
                <label className="block mb-1">
                    Length: {length} tiles
                </label>
                <div className="flex gap-2.5 items-center">
                    <input
                        type="range"
                        min={MIN_LENGTH}
                        max={MAX_LENGTH}
                        step="1"
                        value={length}
                        onChange={(e) => onLengthChange(parseInt(e.target.value))}
                        className="flex-1 h-1.5 rounded bg-gray-300 outline-none appearance-none slider"
                    />
                    <input
                        type="number"
                        min={MIN_LENGTH}
                        max={MAX_LENGTH}
                        value={length}
                        onChange={handleLengthInputChange}
                        className="w-12 p-1 rounded border border-gray-600 bg-gray-800 text-white text-xs"
                    />
                </div>
            </div>

            <div className="mb-2">
                <label className="block mb-1">
                    Width: {width} tiles
                </label>
                <div className="flex gap-2.5 items-center">
                    <input
                        type="range"
                        min={MIN_WIDTH}
                        max={MAX_WIDTH}
                        step="1"
                        value={width}
                        onChange={(e) => onWidthChange(parseInt(e.target.value))}
                        className="flex-1 h-1.5 rounded bg-gray-300 outline-none appearance-none slider"
                    />
                    <input
                        type="number"
                        min={MIN_WIDTH}
                        max={MAX_WIDTH}
                        value={width}
                        onChange={handleWidthInputChange}
                        className="w-12 p-1 rounded border border-gray-600 bg-gray-800 text-white text-xs"
                    />
                </div>
            </div>

            <div className="border-t border-gray-600 mt-1.5">
                <div className="text-xs opacity-80">
                    <div>⚙️ Scroll to zoom</div>
                    <div>🔧 Ctrl+Shift+Z to toggle controls</div>
                    <div>🔧 Ctrl+Shift+F to freeze the OrbitControls</div>
                </div>
            </div>
        </div>
    );
});

export default RoomControls;