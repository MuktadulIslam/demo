import React, { memo } from 'react';
import { Box } from '@react-three/drei';
import { WallDecoration } from './types';

interface DecorationComponentProps {
  decoration: WallDecoration & { fromLeftSide: number; fromFloor: number };
  wallSpec: {
    position: { x: number; y: number; z: number };
    rotation: [number, number, number];
    wallLength: number;
    wallThickness?: number;
    normal: { x: number; y: number; z: number };
  };
  wall: 'front' | 'back' | 'left' | 'right';
}

const DecorationComponent = memo(function DecorationComponent({ decoration, wallSpec, wall }: DecorationComponentProps) {
  // Calculate position relative to wall center
  const relativeX = decoration.fromLeftSide + (decoration.width / 2) - (wallSpec.wallLength / 2);
  const relativeY = decoration.fromFloor + (decoration.height / 2);

  // Wall thickness for realistic depth
  const offsetDistance = 0.01;

  // Calculate final position
  const finalPosition: [number, number, number] = [
    wallSpec.position.x + relativeX * (wall === 'left' || wall === 'right' ? 0 : 1) + wallSpec.normal.x * offsetDistance,
    relativeY,
    wallSpec.position.z + relativeX * (wall === 'left' || wall === 'right' ? 1 : 0) + wallSpec.normal.z * offsetDistance
  ];

  const decorationDepth = 0.02; // Small depth for wall decorations

  return (
    <Box
      key={`decoration-box-${decoration.id}`}
      position={finalPosition}
      rotation={wallSpec.rotation}
      args={[decoration.width, decoration.height, decorationDepth]}
    >
      <meshStandardMaterial color={decoration.color || "#FFD700"} />
    </Box>
  );
});

export default DecorationComponent;
