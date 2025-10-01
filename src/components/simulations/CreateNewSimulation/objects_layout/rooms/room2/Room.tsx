import React, { memo } from 'react';
import TiledFloor from './TiledFloor';
import Ceiling from './Ceiling';
import WallWithOpenings from './WallWithOpenings';
import { getRoomConfig } from './roomConfig';

interface RoomProps {
  length: number;     // length of x-axis 
  width: number;      // length of z-axis 
}

const Room = memo(function Room({ width, length }: RoomProps) {
  const { dimensions, colors, doors = [], windows = [], wallDecorations = [] } = getRoomConfig(width, length);
  const { width: roomWidth, length: roomLength, height: roomHeight } = dimensions;

  return (
    <group>
      {/* Tiled floor */}
      <TiledFloor
        width={roomWidth}
        length={roomLength}
        color={colors.floor}
        alternateColor={colors?.alternateFloor}
        groutSize={0.025} // 0.05 unit grout gap for floor
      />

      {/* Ceiling with recessed lighting */}
      <Ceiling
        width={roomWidth}
        length={roomLength}
        height={roomHeight}
        color={colors.ceiling}
        groutSize={0.05} // 0.1 unit grout gap for ceiling (wider)
      />

      {/* Walls with openings */}
      <WallWithOpenings
        wall="front"
        roomWidth={roomWidth}
        roomLength={roomLength}
        roomHeight={roomHeight}
        color={colors.walls}
        doors={doors}
        windows={windows}
        wallDecorations={wallDecorations}
      />

      <WallWithOpenings
        wall="back"
        roomWidth={roomWidth}
        roomLength={roomLength}
        roomHeight={roomHeight}
        color={colors.walls}
        doors={doors}
        windows={windows}
        wallDecorations={wallDecorations}
      />

      <WallWithOpenings
        wall="left"
        roomWidth={roomWidth}
        roomLength={roomLength}
        roomHeight={roomHeight}
        color={colors.walls}
        doors={doors}
        windows={windows}
        wallDecorations={wallDecorations}
      />

      <WallWithOpenings
        wall="right"
        roomWidth={roomWidth}
        roomLength={roomLength}
        roomHeight={roomHeight}
        color={colors.walls}
        doors={doors}
        windows={windows}
        wallDecorations={wallDecorations}
      />
    </group>
  );
});

export default Room;
