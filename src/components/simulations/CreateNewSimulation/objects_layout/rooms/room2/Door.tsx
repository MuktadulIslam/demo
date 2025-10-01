import React, { memo } from 'react';
import { Box } from '@react-three/drei';
import { Door } from './types';

interface DoorComponentProps {
  door: Door & { fromLeftSide: number; fromFloor: number };
  wallSpec: {
    position: { x: number; y: number; z: number };
    rotation: [number, number, number];
    wallLength: number;
    wallWidth: number;
    wallHeight: number;
    wallThickness?: number;
    normal: { x: number; y: number; z: number };
  };
  wall: 'front' | 'back' | 'left' | 'right';
}

const DoorComponent = memo(function DoorComponent({ door, wallSpec, wall }: DoorComponentProps) {
  // Calculate position relative to wall center
  const relativeX = door.fromLeftSide + (door.width / 2) - (wallSpec.wallLength / 2);
  const relativeY = door.fromFloor + (door.height / 2);

  // Calculate final position - door should be flush with the wall opening
  const finalPosition: [number, number, number] = [
    wallSpec.position.x + relativeX * (wall === 'left' || wall === 'right' ? 0 : 1),
    relativeY,
    wallSpec.position.z + relativeX * (wall === 'left' || wall === 'right' ? 1 : 0)
  ];

  // Determine door type based on ID or properties
  const isGlassDoor = door.id.includes('glass');
  const isBackDoor = door.id.includes('back');
  
  // Door styling based on type
  const woodFrameColor = isGlassDoor ? "#111211" : "#654321";   // Dark charcoal for glass, brown for solid
  const doorPanelColor = isGlassDoor ? "#616363" : "#8B4513";   // Glass color or wood color
  const handleColor = isGlassDoor ? "#F5F5DC" : "#C0C0C0";      // Beige for glass, silver for solid
  const frameThickness = 0.18;        // Wooden frame boundary
  const doorDepth = wallSpec.wallWidth * 0.8; // Door thickness (slightly less than wall)
  const panelThickness = isGlassDoor ? 0.01 : 0.04;  // Glass is thin, wood is thicker
  const doorGap = isGlassDoor ? 0.03 : 0.02;         // Smaller gap for solid doors
  const frameWidth = 0.12;           // Wooden frame strips
  const handleLength = isGlassDoor ? 1.2 : 0.8;      // Shorter handles for solid doors

  // Determine if it's a single or double door
  const isDoubleDoor = isGlassDoor; // Glass doors are double, solid doors are single
  
  // Calculate door panel dimensions
  const singleDoorWidth = isDoubleDoor ? (door.width - doorGap) / 2 : door.width;
  const leftDoorCenter = isDoubleDoor ? finalPosition[0] - (singleDoorWidth / 2) - (doorGap / 2) : finalPosition[0];
  const rightDoorCenter = finalPosition[0] + (singleDoorWidth / 2) + (doorGap / 2);

  return (
    <group key={`door-${door.id}`}>
      {/* LEFT DOOR PANEL */}
      <group key={`left-door-${door.id}`}>
        {/* Left door - Top wooden frame */}
        <Box
          position={[leftDoorCenter, relativeY + door.height / 2 - frameWidth / 2, finalPosition[2]]}
          rotation={wallSpec.rotation}
          args={[singleDoorWidth, frameWidth, doorDepth]}
        >
          <meshStandardMaterial
            color={woodFrameColor}
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Left door - Bottom wooden frame */}
        <Box
          position={[leftDoorCenter, relativeY - door.height / 2 + frameWidth / 2, finalPosition[2]]}
          rotation={wallSpec.rotation}
          args={[singleDoorWidth, frameWidth, doorDepth]}
        >
          <meshStandardMaterial
            color={woodFrameColor}
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Left door - Left wooden frame */}
        <Box
          position={[leftDoorCenter - singleDoorWidth / 2 + frameWidth / 2, relativeY, finalPosition[2]]}
          rotation={wallSpec.rotation}
          args={[frameWidth, door.height, doorDepth]}
        >
          <meshStandardMaterial
            color={woodFrameColor}
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Left door - Right wooden frame */}
        <Box
          position={[leftDoorCenter + singleDoorWidth / 2 - frameWidth / 2, relativeY, finalPosition[2]]}
          rotation={wallSpec.rotation}
          args={[frameWidth, door.height, doorDepth]}
        >
          <meshStandardMaterial
            color={woodFrameColor}
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Left door - Panel inside wooden frame */}
        <Box
          position={[leftDoorCenter, relativeY, finalPosition[2] + doorDepth * 0.05]}
          rotation={wallSpec.rotation}
          args={[singleDoorWidth - frameWidth * 2, door.height - frameWidth * 2, panelThickness]}
        >
          <meshStandardMaterial
            color={doorPanelColor}
            roughness={isGlassDoor ? 0.1 : 0.6}
            metalness={isGlassDoor ? 0.1 : 0.05}
          />
        </Box>

        {/* Additional wood panel details for solid doors */}
        {!isGlassDoor && (
          <>
            {/* Top raised panel */}
            <Box
              position={[leftDoorCenter, relativeY + door.height * 0.25, finalPosition[2] + doorDepth * 0.15]}
              rotation={wallSpec.rotation}
              args={[singleDoorWidth - frameWidth * 3, door.height * 0.35, 0.025]}
            >
              <meshStandardMaterial
                color="#A0522D"
                roughness={0.7}
                metalness={0.02}
              />
            </Box>
            
            {/* Bottom raised panel */}
            <Box
              position={[leftDoorCenter, relativeY - door.height * 0.25, finalPosition[2] + doorDepth * 0.15]}
              rotation={wallSpec.rotation}
              args={[singleDoorWidth - frameWidth * 3, door.height * 0.35, 0.025]}
            >
              <meshStandardMaterial
                color="#A0522D"
                roughness={0.7}
                metalness={0.02}
              />
            </Box>
          </>
        )}

        {/* Left door handles - Outside */}
        <Box
          position={[
            leftDoorCenter + (singleDoorWidth * (isDoubleDoor ? 0.35 : 0.4)),
            relativeY,
            finalPosition[2] + doorDepth * 0.52
          ]}
          rotation={wallSpec.rotation}
          args={[0.08, handleLength, 0.025]}
        >
          <meshStandardMaterial
            color={handleColor}
            roughness={isGlassDoor ? 0.3 : 0.1}
            metalness={isGlassDoor ? 0.2 : 0.8}
          />
        </Box>

        {/* Left door handles - Inside */}
        <Box
          position={[
            leftDoorCenter + (singleDoorWidth * (isDoubleDoor ? 0.35 : 0.4)),
            relativeY,
            finalPosition[2] - doorDepth * 0.52
          ]}
          rotation={wallSpec.rotation}
          args={[0.08, handleLength, 0.025]}
        >
          <meshStandardMaterial
            color={handleColor}
            roughness={isGlassDoor ? 0.3 : 0.1}
            metalness={isGlassDoor ? 0.2 : 0.8}
          />
        </Box>
      </group>

      {/* RIGHT DOOR PANEL - Only for double doors */}
      {isDoubleDoor && (
        <group key={`right-door-${door.id}`}>
        {/* Right door - Top wooden frame */}
        <Box
          position={[rightDoorCenter, relativeY + door.height / 2 - frameWidth / 2, finalPosition[2]]}
          rotation={wallSpec.rotation}
          args={[singleDoorWidth, frameWidth, doorDepth]}
        >
          <meshStandardMaterial
            color={woodFrameColor}
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Right door - Bottom wooden frame */}
        <Box
          position={[rightDoorCenter, relativeY - door.height / 2 + frameWidth / 2, finalPosition[2]]}
          rotation={wallSpec.rotation}
          args={[singleDoorWidth, frameWidth, doorDepth]}
        >
          <meshStandardMaterial
            color={woodFrameColor}
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Right door - Left wooden frame */}
        <Box
          position={[rightDoorCenter - singleDoorWidth / 2 + frameWidth / 2, relativeY, finalPosition[2]]}
          rotation={wallSpec.rotation}
          args={[frameWidth, door.height, doorDepth]}
        >
          <meshStandardMaterial
            color={woodFrameColor}
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Right door - Right wooden frame */}
        <Box
          position={[rightDoorCenter + singleDoorWidth / 2 - frameWidth / 2, relativeY, finalPosition[2]]}
          rotation={wallSpec.rotation}
          args={[frameWidth, door.height, doorDepth]}
        >
          <meshStandardMaterial
            color={woodFrameColor}
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Right door - Panel inside wooden frame */}
        <Box
          position={[rightDoorCenter, relativeY, finalPosition[2] + doorDepth * 0.05]}
          rotation={wallSpec.rotation}
          args={[singleDoorWidth - frameWidth * 2, door.height - frameWidth * 2, panelThickness]}
        >
          <meshStandardMaterial
            color={doorPanelColor}
            roughness={isGlassDoor ? 0.1 : 0.6}
            metalness={isGlassDoor ? 0.1 : 0.05}
          />
        </Box>

        {/* Additional wood panel details for solid doors */}
        {!isGlassDoor && (
          <>
            {/* Top raised panel */}
            <Box
              position={[rightDoorCenter, relativeY + door.height * 0.25, finalPosition[2] + doorDepth * 0.15]}
              rotation={wallSpec.rotation}
              args={[singleDoorWidth - frameWidth * 3, door.height * 0.35, 0.025]}
            >
              <meshStandardMaterial
                color="#A0522D"
                roughness={0.7}
                metalness={0.02}
              />
            </Box>
            
            {/* Bottom raised panel */}
            <Box
              position={[rightDoorCenter, relativeY - door.height * 0.25, finalPosition[2] + doorDepth * 0.15]}
              rotation={wallSpec.rotation}
              args={[singleDoorWidth - frameWidth * 3, door.height * 0.35, 0.025]}
            >
              <meshStandardMaterial
                color="#A0522D"
                roughness={0.7}
                metalness={0.02}
              />
            </Box>
          </>
        )}

        {/* Right door handles - Outside */}
        <Box
          position={[
            rightDoorCenter - (singleDoorWidth * 0.35),
            relativeY,
            finalPosition[2] + doorDepth * 0.52
          ]}
          rotation={wallSpec.rotation}
          args={[0.08, handleLength, 0.025]}
        >
          <meshStandardMaterial
            color={handleColor}
            roughness={isGlassDoor ? 0.3 : 0.1}
            metalness={isGlassDoor ? 0.2 : 0.8}
          />
        </Box>

        {/* Right door handles - Inside */}
        <Box
          position={[
            rightDoorCenter - (singleDoorWidth * 0.35),
            relativeY,
            finalPosition[2] - doorDepth * 0.52
          ]}
          rotation={wallSpec.rotation}  
          args={[0.08, handleLength, 0.025]}
        >
          <meshStandardMaterial
            color={handleColor}
            roughness={isGlassDoor ? 0.3 : 0.1}
            metalness={isGlassDoor ? 0.2 : 0.8}
          />
        </Box>
        </group>
      )}

      {/* OUTER DOOR FRAME - Surrounds entire opening */}
      {/* Top frame */}
      <Box
        position={[
          finalPosition[0],
          relativeY + door.height / 2 + frameThickness / 2,
          finalPosition[2]
        ]}
        rotation={wallSpec.rotation}
        args={[door.width + frameThickness * 2, frameThickness, doorDepth]}
      >
        <meshStandardMaterial
          color={woodFrameColor}
          roughness={0.8}
          metalness={0.1}
        />
      </Box>

      {/* Left frame */}
      <Box
        position={[
          finalPosition[0] - door.width / 2 - frameThickness / 2,
          relativeY,
          finalPosition[2]
        ]}
        rotation={wallSpec.rotation}
        args={[frameThickness, door.height, doorDepth]}
      >
        <meshStandardMaterial
          color={woodFrameColor}
          roughness={0.8}
          metalness={0.1}
        />
      </Box>

      {/* Right frame */}
      <Box
        position={[
          finalPosition[0] + door.width / 2 + frameThickness / 2,
          relativeY,
          finalPosition[2]
        ]}
        rotation={wallSpec.rotation}
        args={[frameThickness, door.height, doorDepth]}
      >
        <meshStandardMaterial
          color={woodFrameColor}
          roughness={0.8}
          metalness={0.1}
        />
      </Box>

      {/* Door threshold/sill */}
      <Box
        position={[
          finalPosition[0],
          0.05, // Just above floor level
          finalPosition[2]
        ]}
        rotation={wallSpec.rotation}
        args={[door.width + frameThickness, 0.1, doorDepth + 0.05]}
      >
        <meshStandardMaterial
          color="#D2B48C" // Light tan color for threshold
          roughness={0.9}
          metalness={0.0}
        />
      </Box>
    </group>
  );
});

export default DoorComponent;
