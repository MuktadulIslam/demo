import React, { memo } from 'react';
import { Box } from '@react-three/drei';
import { Window } from './types';

interface WindowComponentProps {
  window: Window & { fromLeftSide: number; fromFloor: number };
  wallSpec: {
    position: { x: number; y: number; z: number };
    rotation: [number, number, number];
    wallLength: number;
    wallWidth: number;
    normal: { x: number; y: number; z: number };
  };
  wall: 'front' | 'back' | 'left' | 'right';
}

const WindowComponent = memo(function WindowComponent({ window, wallSpec, wall }: WindowComponentProps) {
  const isHorizontal = wall === 'front' || wall === 'back';
  const alongLength = isHorizontal ? wallSpec.wallLength : wallSpec.wallWidth;
  const relativeX = window.fromLeftSide + (window.width / 2) - (alongLength / 2);
  const relativeY = window.fromFloor + (window.height / 2);
  
  const frameColor = window.frameColor || "#654321"; // Darker brown wood color
  const frameThickness = window.frameThickness || 0.18; // Thicker frame like door
  const wallThickness = isHorizontal ? wallSpec.wallWidth : wallSpec.wallLength;
  const windowDepth = wallThickness * 0.9; // Window depth matches wall thickness like door
  const glassThickness = 0.015; // Thin glass
  const sillThickness = 0.08; // Window sill thickness

  // Calculate final position - window should be flush with the wall opening like door
  const finalPosition: [number, number, number] = [
    wallSpec.position.x + relativeX * (wall === 'left' || wall === 'right' ? 0 : 1),
    relativeY,
    wallSpec.position.z + relativeX * (wall === 'left' || wall === 'right' ? 1 : 0)
  ];

  return (
    <group key={`realistic-window-group-${window.id}`}>

      {/* OUTER WINDOW FRAME - Surrounds entire opening and extends through wall */}
      {/* Top frame */}
      <Box
        position={[
          finalPosition[0],
          relativeY + window.height / 2 + frameThickness / 2 -frameThickness,
          finalPosition[2]
        ]}
        rotation={wallSpec.rotation}
        args={isHorizontal ? [window.width, frameThickness, windowDepth + 0.02] : [windowDepth + 0.02, frameThickness, window.width]}
      >
        <meshStandardMaterial
          color={frameColor}
          roughness={0.8}
          metalness={0.1}
        />
      </Box>

      {/* Bottom frame */}
      <Box
        position={[
          finalPosition[0],
          relativeY - window.height / 2 + frameThickness / 2,
          finalPosition[2]
        ]}
        rotation={wallSpec.rotation}
        args={isHorizontal ? [window.width, frameThickness, windowDepth + 0.02] : [windowDepth + 0.02, frameThickness, window.width]}
      >
        <meshStandardMaterial
          color={frameColor}
          roughness={0.8}
          metalness={0.1}
        />
      </Box>

      {/* Left frame */}
      <Box
        position={[
          finalPosition[0] - (isHorizontal ? window.width / 2 - frameThickness / 2 : 0),
          relativeY,
          finalPosition[2] - (!isHorizontal ? window.width / 2 + frameThickness / 2 - frameThickness : 0)
        ]}
        rotation={wallSpec.rotation}
        args={isHorizontal ? [frameThickness, window.height, windowDepth + 0.02] : [windowDepth + 0.02, window.height, frameThickness]}
      >
        <meshStandardMaterial
          color={frameColor}
          roughness={0.8}
          metalness={0.1}
        />
      </Box>

      {/* Right frame */}
      <Box
        position={[
          finalPosition[0] + (isHorizontal ? window.width / 2 - frameThickness / 2 : 0),
          relativeY,
          finalPosition[2] + (!isHorizontal ? window.width / 2 + frameThickness / 2 - frameThickness : 0)
        ]}
        rotation={wallSpec.rotation}
        args={isHorizontal ? [frameThickness, window.height, windowDepth + 0.02] : [windowDepth + 0.02, window.height, frameThickness]}
      >
        <meshStandardMaterial
          color={frameColor}
          roughness={0.8}
          metalness={0.1}
        />
      </Box>

      {/* Window sill - extends outward from wall */}
      <Box
        position={[
          finalPosition[0],
          relativeY - window.height / 2 - frameThickness - sillThickness / 2,
          finalPosition[2] + (isHorizontal ? windowDepth * 0.25 : 0)
        ]}
        rotation={wallSpec.rotation}
        args={isHorizontal ? [window.width + frameThickness * 3, sillThickness, windowDepth * 0.5] : [windowDepth * 0.5, sillThickness, window.width + frameThickness * 3]}
      >
        <meshStandardMaterial
          color="#D2B48C" // Light tan color for sill
          roughness={0.9}
          metalness={0.0}
        />
      </Box>

      {/* INNER WINDOW FRAMES for grid pattern */}
      {/* Vertical mullion (center divider) */}
      <Box
        position={[
          finalPosition[0],
          relativeY,
          finalPosition[2] + (isHorizontal ? windowDepth * 0.1 : 0)
        ]}
        rotation={wallSpec.rotation}
        args={isHorizontal ? [frameThickness * 0.7, window.height - frameThickness, windowDepth * 0.2] : [windowDepth * 0.2, window.height - frameThickness, frameThickness * 0.7]}
      >
        <meshStandardMaterial
          color={frameColor}
          roughness={0.8}
          metalness={0.1}
        />
      </Box>

      {/* Horizontal mullion (center divider) */}
      <Box
        position={[
          finalPosition[0],
          relativeY,
          finalPosition[2] + (isHorizontal ? windowDepth * 0.1 : 0)
        ]}
        rotation={wallSpec.rotation}
        args={isHorizontal ? [window.width - frameThickness, frameThickness * 0.7, windowDepth * 0.2] : [windowDepth * 0.2, frameThickness * 0.7, window.width - frameThickness]}
      >
        <meshStandardMaterial
          color={frameColor}
          roughness={0.8}
          metalness={0.1}
        />
      </Box>

      {/* Glass Panes - divided into 4 sections for realism */}
      {/* Top Left Glass */}
      <Box
        position={[
          finalPosition[0] - (isHorizontal ? window.width / 4 : 0),
          relativeY + window.height / 4,
          finalPosition[2] + (isHorizontal ? windowDepth * 0.2 : -window.width / 4)
        ]}
        rotation={wallSpec.rotation}
        args={isHorizontal ? [window.width / 2 - frameThickness * 0.9, window.height / 2 - frameThickness * 0.9, glassThickness] : [glassThickness, window.height / 2 - frameThickness * 0.9, window.width / 2 - frameThickness * 0.9]}
      >
        <meshPhysicalMaterial
          color="#E6F3FF"
          opacity={1}
          roughness={0.05}
          metalness={0}
          transmission={0.8}
          thickness={0.01}
          ior={1.5}
        />
      </Box>

      {/* Top Right Glass */}
      <Box
        position={[
          finalPosition[0] + (isHorizontal ? window.width / 4 : 0),
          relativeY + window.height / 4,
          finalPosition[2] + (isHorizontal ? windowDepth * 0.2 : window.width / 4)
        ]}
        rotation={wallSpec.rotation}
        args={isHorizontal ? [window.width / 2 - frameThickness * 0.9, window.height / 2 - frameThickness * 0.9, glassThickness] : [glassThickness, window.height / 2 - frameThickness * 0.9, window.width / 2 - frameThickness * 0.9]}
      >
        <meshPhysicalMaterial
          color="#E6F3FF"
          opacity={1}
          roughness={0.05}
          metalness={0}
          transmission={0.8}
          thickness={0.01}
          ior={1.5}
        />
      </Box>

      {/* Bottom Left Glass */}
      <Box
        position={[
          finalPosition[0] - (isHorizontal ? window.width / 4 : 0),
          relativeY - window.height / 4,
          finalPosition[2] + (isHorizontal ? windowDepth * 0.2 : -window.width / 4)
        ]}
        rotation={wallSpec.rotation}
        args={isHorizontal ? [window.width / 2 - frameThickness * 0.9, window.height / 2 - frameThickness * 0.9, glassThickness] : [glassThickness, window.height / 2 - frameThickness * 0.9, window.width / 2 - frameThickness * 0.9]}
      >
        <meshPhysicalMaterial
          color="#E6F3FF"
          opacity={1}
          roughness={0.05}
          metalness={0}
          transmission={0.8}
          thickness={0.01}
          ior={1.5}
        />
      </Box>

      {/* Bottom Right Glass */}
      <Box
        position={[
          finalPosition[0] + (isHorizontal ? window.width / 4 : 0),
          relativeY - window.height / 4,
          finalPosition[2] + (isHorizontal ? windowDepth * 0.2 : window.width / 4)
        ]}
        rotation={wallSpec.rotation}
        args={isHorizontal ? [window.width / 2 - frameThickness * 0.9, window.height / 2 - frameThickness * 0.9, glassThickness] : [glassThickness, window.height / 2 - frameThickness * 0.9, window.width / 2 - frameThickness * 0.9]}
      >
        <meshPhysicalMaterial
          color="#E6F3FF"
          opacity={1}
          roughness={0.05}
          metalness={0}
          transmission={0.8}
          thickness={0.01}
          ior={1.5}
        />
      </Box>
    </group>
  );
});

export default WindowComponent;
