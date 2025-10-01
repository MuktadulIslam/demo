import React, { memo } from 'react';
import { Plane, Circle } from '@react-three/drei';

interface CeilingProps {
  width: number;
  length: number;
  height: number;
  color: string;
  groutSize?: number;
}

interface CeilingTileProps {
  position: [number, number, number];
  color: string;
  isLightTile?: boolean;
  sizeX: number;
  sizeZ: number;
}

// Individual ceiling tile component
function CeilingTile({ position, color, isLightTile = false, sizeX, sizeZ }: CeilingTileProps) {
  const lightSize = 0.6; // Small light size within the tile
  const boundaryDiameter = lightSize + 0.1;
  const renderLight = isLightTile && sizeX >= boundaryDiameter && sizeZ >= boundaryDiameter;
  
  return (
    <group>
      {/* Main tile - always same color */}
      <Plane
        rotation={[Math.PI / 2, 0, 0]}
        position={position}
        args={[sizeX, sizeZ]}
      >
        <meshStandardMaterial color={color} />
      </Plane>
      
      {/* Small circular light in center of tile if it's a light tile */}
      {renderLight && (
        <group>
          {/* Light boundary/rim */}
          <Circle
            rotation={[Math.PI / 2, 0, 0]}
            position={[position[0], position[1] - 0.003, position[2]]} // Slightly above the light
            args={[(lightSize / 2) + 0.05, 32]} // Slightly larger radius for boundary
          >
            <meshStandardMaterial 
              color="#888888" // Dark grey boundary
              metalness={0.3}
              roughness={0.7}
            />
          </Circle>
          
          {/* Main light */}
          <Circle
            rotation={[Math.PI / 2, 0, 0]}
            position={[position[0], position[1] - 0.005, position[2]]} // Slightly lower than main tile
            args={[lightSize / 2, 32]} // radius and segments for smooth circle
          >
            <meshStandardMaterial 
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.2}
            />
          </Circle>
        </group>
      )}
    </group>
  );
}

// Main ceiling component with tiled pattern and integrated lights
const Ceiling = memo(function Ceiling({ width, length, height, color, groutSize = 0.1 }: CeilingProps) {
  const tiles: React.JSX.Element[] = [];
  const groutColor = "#d0d0d0"; // Light grey grout for ceiling
  const tileSize = 2; // 2x2 unit tiles
  const actualTileSize = tileSize - groutSize; // Tile size minus grout gap
  
  // Calculate how many tiles fit in each direction
  const tilesX = Math.ceil(length / tileSize);
  const tilesZ = Math.ceil(width / tileSize);
  
  // Create base grout layer (background)
  const groutBase = (
    <Plane
      key="ceiling-grout-base"
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, height, 0]}
      args={[length, width]}
    >
      <meshStandardMaterial color={groutColor} />
    </Plane>
  );

  // Create individual ceiling tiles
  for (let x = 0; x < tilesX; x++) {
    for (let z = 0; z < tilesZ; z++) {
      const posX = (x * tileSize) - (tilesX * tileSize) / 2 + tileSize / 2;
      const posZ = (z * tileSize) - (tilesZ * tileSize) / 2 + tileSize / 2;
      
      const half = actualTileSize / 2;
      
      // X direction clipping
      const roomLeft = -length / 2;
      const roomRight = length / 2;
      const intendedLeftX = posX - half;
      const intendedRightX = posX + half;
      const clippedLeftX = Math.max(intendedLeftX, roomLeft);
      const clippedRightX = Math.min(intendedRightX, roomRight);
      const sizeX = clippedRightX - clippedLeftX;
      const adjustedPosX = (clippedLeftX + clippedRightX) / 2;
      
      // Z direction clipping
      const roomFront = -width / 2;
      const roomBack = width / 2;
      const intendedFrontZ = posZ - half;
      const intendedBackZ = posZ + half;
      const clippedFrontZ = Math.max(intendedFrontZ, roomFront);
      const clippedBackZ = Math.min(intendedBackZ, roomBack);
      const sizeZ = clippedBackZ - clippedFrontZ;
      const adjustedPosZ = (clippedFrontZ + clippedBackZ) / 2;
      
      const isLightTile = (x % 2 === 1) && (z % 3 === 1);
      
      if (sizeX > 0 && sizeZ > 0) {
        tiles.push(
          <CeilingTile
            key={`ceiling-tile-${x}-${z}`}
            position={[adjustedPosX, height - 0.01, adjustedPosZ]}
            color={color}
            isLightTile={isLightTile}
            sizeX={sizeX}
            sizeZ={sizeZ}
          />
        );
      }
    }
  }

  return (
    <group position={[0, 0, 0]}>
      {groutBase}
      {tiles}
    </group>
  );
});

export default Ceiling;
