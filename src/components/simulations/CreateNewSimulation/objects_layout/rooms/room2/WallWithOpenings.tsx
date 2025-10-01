import React, { memo, useMemo } from 'react';
import { Box } from '@react-three/drei';
import { WallWithOpeningsProps, WallType } from './types';
import WindowComponent from './Window';
import DoorComponent from './Door';
import DecorationComponent from './Decoration';
import PosterComponent from './Poster';
import * as THREE from 'three';

const getWallSpecs = ({ roomLength, roomWidth, roomHeight, wall }: { roomLength: number, roomWidth: number, roomHeight: number, wall: WallType }) => {
  const wallThickness = 0.2; // 3D wall thickness
  
  switch (wall) {
    case 'front':
      return {
        position: { x: 0, y: roomHeight / 2, z: roomWidth / 2 + wallThickness / 2 },
        rotation: [0, 0, 0] as [number, number, number],
        wallLength: roomLength + wallThickness * 2, // Extend to cover side wall thickness
        wallWidth: wallThickness,
        wallHeight: roomHeight,
        normal: { x: 0, y: 0, z: 1 }
      };
    case 'back':
      return {
        position: { x: 0, y: roomHeight / 2, z: -roomWidth / 2 - wallThickness / 2 },
        rotation: [0, 0, 0] as [number, number, number], // No flip - keep as reference
        wallLength: roomLength + wallThickness * 2, // Extend to cover side wall thickness
        wallWidth: wallThickness,
        wallHeight: roomHeight,
        normal: { x: 0, y: 0, z: 1 }
      };
    case 'left':
      return {
        position: { x: -roomLength / 2 - wallThickness / 2, y: roomHeight / 2, z: 0 },
        rotation: [0, 0, 0] as [number, number, number],
        wallLength: wallThickness,
        wallWidth: roomWidth, // Don't extend - front/back walls cover the corners
        wallHeight: roomHeight,
        normal: { x: 1, y: 0, z: 0 }
      };
    case 'right':
      return {
        position: { x: roomLength / 2 + wallThickness / 2, y: roomHeight / 2, z: 0 },
        rotation: [0, 0, 0] as [number, number, number],
        wallLength: wallThickness,
        wallWidth: roomWidth, // Don't extend - front/back walls cover the corners
        wallHeight: roomHeight,
        normal: { x: -1, y: 0, z: 0 }
      };
    default:
      return {
        position: { x: 0, y: 0, z: 0 },
        rotation: [0, 0, 0] as [number, number, number],
        wallLength: 0,
        wallWidth: 0,
        wallHeight: 0,
        normal: { x: 0, y: 0, z: 0 }
      };
  }
};

// Function to check if opening is within wall bounds
const isWithinWallBounds = (
  opening: { fromLeftSide: number; fromFloor: number; width: number; height: number },
  wallLength: number,
  wallHeight: number
): boolean => {
  // Check horizontal bounds
  const leftEdge = opening.fromLeftSide;
  const rightEdge = opening.fromLeftSide + opening.width;

  // Check vertical bounds
  const bottomEdge = opening.fromFloor;
  const topEdge = opening.fromFloor + opening.height;

  return (
    leftEdge >= 0 &&
    rightEdge <= wallLength &&
    bottomEdge >= 0 &&
    topEdge <= wallHeight
  );
};

const WallWithOpenings = memo(function WallWithOpenings({
  wall,
  roomWidth,
  roomLength,
  roomHeight,
  color,
  doors,
  windows,
  wallDecorations
}: WallWithOpeningsProps) {
  const wallSpec = getWallSpecs({ roomLength, roomWidth, roomHeight, wall });

  const isHorizontal = wall === 'front' || wall === 'back';
  const perpendicularKey = isHorizontal ? 'z' : 'x';
  const insideSign = wall === 'front' ? -1 : wall === 'back' ? 1 : wall === 'left' ? 1 : -1;
  const wallThickness = isHorizontal ? wallSpec.wallWidth : wallSpec.wallLength;
  const wallAlongLength = isHorizontal ? wallSpec.wallLength : wallSpec.wallWidth;
  const alongKey = isHorizontal ? 'x' : 'z';
  const thickness = wallThickness;
  const skirtingHeight = 0.4;
  const skirtingDepth = 0.02;
  const skirtingColor = 'white';

  // Filter openings for this wall and convert to new positioning system
  const wallDoors = doors
    .filter(d => d.wall === wall)
    .map(door => ({
      ...door,
      position: door.position ?? 5,
      fromLeftSide: door.fromLeftSide,
      fromFloor: door.fromFloor
    }))
    .filter(door => isWithinWallBounds(door, wallAlongLength, roomHeight));

  const wallWindows = windows
    .filter(w => w.wall === wall)
    .map(window => ({
      ...window,
      position: window.position ?? 0,
      fromLeftSide: window.fromLeftSide
    }))
    .filter(window => isWithinWallBounds(window, wallAlongLength, roomHeight));

  const wallDecos = wallDecorations
    .filter(d => d.wall === wall)
    .map(decoration => ({
      ...decoration,
      position: decoration.position ?? 0,
      fromLeftSide: decoration.fromLeftSide
    }))
    .filter(decoration => isWithinWallBounds(decoration, wallAlongLength, roomHeight));

  const openings = [...wallDoors, ...wallWindows];

  return (
    <group>
      {openings.length > 0 ? (
        <>
          {openings.map((opening, index) => {
            const openingCenter = opening.fromLeftSide + (opening.width / 2);
            const wallSegments = [];
            if (opening.fromLeftSide > 0.1) {
              const leftAlongSize = opening.fromLeftSide;
              const leftPosition = {
                x: wallSpec.position.x,
                y: wallSpec.position.y,
                z: wallSpec.position.z
              };
              leftPosition[alongKey] = wallSpec.position[alongKey] - (wallAlongLength / 2) + (leftAlongSize / 2);
              const leftArgs: [number, number, number] = isHorizontal ? [leftAlongSize, wallSpec.wallHeight, thickness] : [thickness, wallSpec.wallHeight, leftAlongSize];
              wallSegments.push(
                <Box
                  key={`${wall}-left-segment-${index}`}
                  position={[leftPosition.x, leftPosition.y, leftPosition.z]}
                  rotation={wallSpec.rotation}
                  args={leftArgs}
                >
                  <meshStandardMaterial color={color} />
                </Box>
              );
            }
            if (opening.fromLeftSide + opening.width < wallAlongLength - 0.1) {
              const rightAlongSize = wallAlongLength - (opening.fromLeftSide + opening.width);
              const rightPosition = {
                x: wallSpec.position.x,
                y: wallSpec.position.y,
                z: wallSpec.position.z
              };
              rightPosition[alongKey] = wallSpec.position[alongKey] + (wallAlongLength / 2) - (rightAlongSize / 2);
              const rightArgs: [number, number, number] = isHorizontal ? [rightAlongSize, wallSpec.wallHeight, thickness] : [thickness, wallSpec.wallHeight, rightAlongSize];
              wallSegments.push(
                <Box
                  key={`${wall}-right-segment-${index}`}
                  position={[rightPosition.x, rightPosition.y, rightPosition.z]}
                  rotation={wallSpec.rotation}
                  args={rightArgs}
                >
                  <meshStandardMaterial color={color} />
                </Box>
              );
            }
            if (opening.fromFloor + opening.height < wallSpec.wallHeight - 0.1) {
              const topHeight = wallSpec.wallHeight - (opening.fromFloor + opening.height);
              const topPosition = {
                x: wallSpec.position.x,
                y: wallSpec.position.y + (wallSpec.wallHeight / 2) - (topHeight / 2),
                z: wallSpec.position.z
              };
              topPosition[alongKey] = wallSpec.position[alongKey] + (openingCenter - wallAlongLength / 2);
              const topArgs: [number, number, number] = isHorizontal ? [opening.width, topHeight, thickness] : [thickness, topHeight, opening.width];
              wallSegments.push(
                <Box
                  key={`${wall}-top-segment-${index}`}
                  position={[topPosition.x, topPosition.y, topPosition.z]}
                  rotation={wallSpec.rotation}
                  args={topArgs}
                >
                  <meshStandardMaterial color={color} />
                </Box>
              );
            }
            if (opening.fromFloor > 0.1) {
              const bottomHeight = opening.fromFloor;
              const bottomPosition = {
                x: wallSpec.position.x,
                y: bottomHeight / 2,
                z: wallSpec.position.z
              };
              bottomPosition[alongKey] = wallSpec.position[alongKey] + (openingCenter - wallAlongLength / 2);
              const bottomArgs: [number, number, number] = isHorizontal ? [opening.width, bottomHeight, thickness] : [thickness, bottomHeight, opening.width];
              wallSegments.push(
                <Box
                  key={`${wall}-bottom-segment-${index}`}
                  position={[bottomPosition.x, bottomPosition.y, bottomPosition.z]}
                  rotation={wallSpec.rotation}
                  args={bottomArgs}
                >
                  <meshStandardMaterial color={color} />
                </Box>
              );
            }
            const skirtingSegments = [];
            if (opening.fromLeftSide > 0.1) {
              const leftSkirtingWidth = opening.fromLeftSide;
              const leftSkirtingPosition = {
                x: wallSpec.position.x,
                y: skirtingHeight / 2,
                z: wallSpec.position.z
              };
              leftSkirtingPosition[perpendicularKey] += insideSign * (wallThickness / 2 + skirtingDepth / 2);
              leftSkirtingPosition[alongKey] = wallSpec.position[alongKey] - (wallAlongLength / 2) + (leftSkirtingWidth / 2);
              const leftSkirtingArgs: [number, number, number] = isHorizontal ? [leftSkirtingWidth, skirtingHeight, skirtingDepth] : [skirtingDepth, skirtingHeight, leftSkirtingWidth];
              skirtingSegments.push(
                <Box
                  key={`${wall}-left-skirting-${index}`}
                  position={[leftSkirtingPosition.x, leftSkirtingPosition.y, leftSkirtingPosition.z]}
                  rotation={wallSpec.rotation}
                  args={leftSkirtingArgs}
                >
                  <meshStandardMaterial color={skirtingColor} />
                </Box>
              );
            }
            if (opening.fromLeftSide + opening.width < wallAlongLength - 0.1) {
              const rightSkirtingWidth = wallAlongLength - (opening.fromLeftSide + opening.width);
              const rightSkirtingPosition = {
                x: wallSpec.position.x,
                y: skirtingHeight / 2,
                z: wallSpec.position.z
              };
              rightSkirtingPosition[perpendicularKey] += insideSign * (wallThickness / 2 + skirtingDepth / 2);
              rightSkirtingPosition[alongKey] = wallSpec.position[alongKey] + (wallAlongLength / 2) - (rightSkirtingWidth / 2);
              const rightSkirtingArgs: [number, number, number] = isHorizontal ? [rightSkirtingWidth, skirtingHeight, skirtingDepth] : [skirtingDepth, skirtingHeight, rightSkirtingWidth];
              skirtingSegments.push(
                <Box
                  key={`${wall}-right-skirting-${index}`}
                  position={[rightSkirtingPosition.x, rightSkirtingPosition.y, rightSkirtingPosition.z]}
                  rotation={wallSpec.rotation}
                  args={rightSkirtingArgs}
                >
                  <meshStandardMaterial color={skirtingColor} />
                </Box>
              );
            }
            if (opening.fromFloor > skirtingHeight + 0.1) {
              const bottomSkirtingWidth = opening.width;
              const bottomSkirtingPosition = {
                x: wallSpec.position.x,
                y: skirtingHeight / 2,
                z: wallSpec.position.z
              };
              bottomSkirtingPosition[perpendicularKey] += insideSign * (wallThickness / 2 + skirtingDepth / 2);
              bottomSkirtingPosition[alongKey] = wallSpec.position[alongKey] + (openingCenter - wallAlongLength / 2);
              const bottomSkirtingArgs: [number, number, number] = isHorizontal ? [bottomSkirtingWidth, skirtingHeight, skirtingDepth] : [skirtingDepth, skirtingHeight, bottomSkirtingWidth];
              skirtingSegments.push(
                <Box
                  key={`${wall}-bottom-skirting-${index}`}
                  position={[bottomSkirtingPosition.x, bottomSkirtingPosition.y, bottomSkirtingPosition.z]}
                  rotation={wallSpec.rotation}
                  args={bottomSkirtingArgs}
                >
                  <meshStandardMaterial color={skirtingColor} />
                </Box>
              );
            }
            return [...wallSegments, ...skirtingSegments];
          })}
        </>
      ) : (
        <>
          <Box
            key={`${wall}-full-wall`}
            position={[wallSpec.position.x, wallSpec.position.y, wallSpec.position.z]}
            rotation={wallSpec.rotation}
            args={[wallSpec.wallLength, wallSpec.wallHeight, wallSpec.wallWidth]}
          >
            <meshStandardMaterial color={color} />
          </Box>

          {(() => {
            const skirtingPosition = {
              x: wallSpec.position.x,
              y: skirtingHeight / 2,
              z: wallSpec.position.z
            };
            skirtingPosition[perpendicularKey] += insideSign * (wallThickness / 2 + skirtingDepth / 2);
            const skirtingArgs: [number, number, number] = isHorizontal ? [wallAlongLength, skirtingHeight, skirtingDepth] : [skirtingDepth, skirtingHeight, wallAlongLength];
            return (
              <Box
                key={`${wall}-full-skirting`}
                position={[skirtingPosition.x, skirtingPosition.y, skirtingPosition.z]}
                rotation={wallSpec.rotation}
                args={skirtingArgs}
              >
                <meshStandardMaterial color={skirtingColor} />
              </Box>
            );
          })()}
        </>
      )}

      {/* Add doors */}
      {wallDoors.map((door, index) => (
        <DoorComponent
          key={index}
          door={door}
          wallSpec={wallSpec}
          wall={wall}
        />
      ))}

      {/* Add windows on top of the wall */}
      {wallWindows.map((window, index) => (
        <WindowComponent
          key={index}
          window={window}
          wallSpec={{ ...wallSpec, wallWidth: wallSpec.wallWidth }}
          wall={wall}
        />
      ))}

      {/* Add wall decorations on top of the wall */}
      {wallDecos.map((decoration, index) => {
        // Check if it's a poster with imagePath
        if (decoration.type === 'picture' && 'imagePath' in decoration) {
          return (
            <PosterComponent
              key={index}
              decoration={decoration}
              wallSpec={wallSpec}
              wall={wall}
              imagePath={decoration.imagePath as string}
            />
          );
        } else {
          // Default decoration component
          return (
            <DecorationComponent
              key={index}
              decoration={decoration}
              wallSpec={wallSpec}
              wall={wall}
            />
          );
        }
      })}
    </group>
  );
});

export default WallWithOpenings;
