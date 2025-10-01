import React, { useEffect, memo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { WallDecoration } from './types';

interface PosterComponentProps {
  decoration: WallDecoration & { fromLeftSide: number; fromFloor: number };
  wallSpec: {
    position: { x: number; y: number; z: number };
    rotation: [number, number, number];
    wallLength: number;
    wallThickness?: number;
    normal: { x: number; y: number; z: number };
  };
  wall: 'front' | 'back' | 'left' | 'right';
  imagePath: string;
}

const PosterComponent = memo(function PosterComponent({ 
  decoration, 
  wallSpec, 
  wall,
  imagePath
}: PosterComponentProps) {
  // Calculate position relative to wall center
  const relativeX = decoration.fromLeftSide + (decoration.width / 2) - (wallSpec.wallLength / 2);
  const relativeY = decoration.fromFloor + (decoration.height / 2);

  // Wall offset distance for the poster - slightly in front of the wall
  const offsetDistance = 0.2; // Increased offset to make poster more visible

  // Calculate final position
  const finalPosition: [number, number, number] = [
    wallSpec.position.x + relativeX * (wall === 'left' || wall === 'right' ? 0 : 1) + wallSpec.normal.x * offsetDistance,
    relativeY,
    wallSpec.position.z + relativeX * (wall === 'left' || wall === 'right' ? 1 : 0) + wallSpec.normal.z * offsetDistance
  ];

  // Determine correct rotation based on wall orientation
  let posterRotation: [number, number, number] = [0, 0, 0];
  
  if (wall === 'front') {
    posterRotation = [0, Math.PI, 0]; // Rotate to face inside the room
  } else if (wall === 'back') {
    posterRotation = [0, 0, 0]; // Default rotation
  } else if (wall === 'left') {
    posterRotation = [0, Math.PI / 2, 0]; // Rotate 90 degrees
  } else if (wall === 'right') {
    posterRotation = [0, -Math.PI / 2, 0]; // Rotate -90 degrees
  }

  // Load image texture
  const texture = useLoader(THREE.TextureLoader, imagePath);

  return (
    <mesh
      position={finalPosition}
      rotation={posterRotation}
    >
      <planeGeometry args={[decoration.width, decoration.height]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
});

export default PosterComponent;
