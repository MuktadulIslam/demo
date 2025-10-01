import React, { memo } from 'react';
import { Plane } from '@react-three/drei';
import { TiledFloorProps, FloorTileProps } from './types';

// Floor tile component with grout
function FloorTile({ position, isAlternate, color, alternateColor, tileSize }: FloorTileProps & { tileSize: number }) {
  return (
    <Plane
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
      args={[tileSize, tileSize]}
    >
      <meshStandardMaterial
        color={color} // Always use the same color, ignore isAlternate
        side={2}
      />
    </Plane>
  );
}

// Tiled floor component
const TiledFloor = memo(function TiledFloor({ width, length, color, alternateColor, groutSize = 0.05 }: TiledFloorProps) {
  const tiles: React.JSX.Element[] = [];
  const groutColor = "#e0e0e0"; // Light grey grout color
  const tileSize = 1; // 1x1 unit tiles
  const actualTileSize = tileSize - groutSize; // Tile size minus grout gap

  // Create base grout layer (background)
  const groutBase = (
    <Plane
      key="grout-base"
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      args={[length, width]}
    >
      <meshStandardMaterial color={groutColor} side={2} />
    </Plane>
  );

  // Create individual tiles (all same color)
  for (let x = 0; x < length; x++) {
    for (let z = 0; z < width; z++) {
      const posX = x - length / 2 + 0.5;
      const posZ = z - width / 2 + 0.5;

      tiles.push(
        <FloorTile
          key={`tile-${x}-${z}`}
          position={[posX, 0.01, posZ]}
          isAlternate={false} // Not used anymore
          color={color}
          alternateColor={color} // Same as main color
          tileSize={actualTileSize}
        />
      );
    }
  }

  return (
    <group position={[0, 0, 0]}>
      {groutBase}
      {tiles}
    </group>
  );
});

export default TiledFloor;
