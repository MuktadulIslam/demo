import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import * as THREE from 'three'
import { PlacedObject, SelectableObjectRef } from '../types';
import { useRoomContext } from './RoomDimensionsContext';

interface MeshContextType {
  // Current Object management (being dragged for placement)
  currentObject: React.ReactNode | null;
  setCurrentObject: React.Dispatch<React.SetStateAction<React.ReactNode | null>>;
  currentObjectRef: SelectableObjectRef | null;
  setCurrentObjectRef: React.Dispatch<React.SetStateAction<SelectableObjectRef | null>>;
  currentObjectOriginId: string | null;
  setCurrentObjectOriginId: React.Dispatch<React.SetStateAction<string | null>>;

  // Objects management
  objects: PlacedObject[];
  setObjects: React.Dispatch<React.SetStateAction<PlacedObject[]>>;
  addObject: (object: PlacedObject) => void;
  removeObject: (objectId: string) => void;
  updateObjectPosition: (objectId: string, newPosition: [number, number, number]) => void;
  updateObjectDragLimits: (objectId: string, objectBox: THREE.Box3) => void;

  // Selected object management
  selectedObjectRef: SelectableObjectRef | null;
  selectedObjectId: string | null;
  selectedObjectPosition: [number, number, number] | null;
  setObject: (meshRef: SelectableObjectRef, objectId: string, position: [number, number, number]) => void;
  clearObject: () => void;
  // Object controls visibility
  isObjectControlsVisible: boolean;
}

const MeshContext = createContext<MeshContextType | undefined>(undefined);

export const useMeshContext = () => {
  const context = useContext(MeshContext);
  if (context === undefined) {
    throw new Error('useMeshContext must be used within a MeshProvider');
  }
  return context;
};

interface MeshProviderProps {
  children: ReactNode;
}

export function MeshProvider({ children }: MeshProviderProps) {
  // Objects state
  const [objects, setObjects] = useState<PlacedObject[]>([]);
  const { dimensions: groundSize } = useRoomContext();
  // Current object being placed
  const [currentObject, setCurrentObject] = useState<React.ReactNode | null>(null);
  const [currentObjectRef, setCurrentObjectRef] = useState<SelectableObjectRef | null>(null);
  const [currentObjectOriginId, setCurrentObjectOriginId] = useState<string | null>(null);

  // Selected object state
  const [selectedObjectRef, setSelectedObjectRef] = useState<SelectableObjectRef | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedObjectPosition, setSelectedObjectPosition] = useState<[number, number, number] | null>(null);

  // Object controls visibility
  const [isObjectControlsVisible, setObjectControlsVisible] = useState<boolean>(false);

  const addObject = (object: PlacedObject) => {
    setObjects(prev => [...prev, object]);
  };

  const removeObject = (objectId: string) => {
    setObjects(prev => {
      const index = prev.findIndex(obj => obj.id === objectId);
      if (index === -1) return prev; // Object not found, return same reference

      const newArray = [...prev];
      newArray.splice(index, 1);
      return newArray;
    });

    // If the deleted object is currently selected, clear selection
    if (selectedObjectId === objectId) {
      clearObject();
    }
  };

  const updateObjectPosition = (objectId: string, newPosition: [number, number, number]) => {
    setObjects(prev => {
      const targetObject = prev.find(obj => obj.id === objectId);
      if (!targetObject) return prev;

      // Check if position is actually different
      const currentPos = targetObject.position;
      if (currentPos[0] === newPosition[0] &&
        currentPos[1] === newPosition[1] &&
        currentPos[2] === newPosition[2]) {
        return prev; // No change needed
      }

      return prev.map(obj => {
        if (obj.id === objectId) {
          // Reuse the same object, just update position array values
          if (obj.position) {
            obj.position[0] = newPosition[0];
            obj.position[1] = newPosition[1];
            obj.position[2] = newPosition[2];
            return obj;
          } else {
            // Create new position array only if it doesn't exist
            return { ...obj, position: newPosition };
          }
        }
        return obj;
      });
    });
  };

  const updateObjectDragLimits = (objectId: string, objectBox: THREE.Box3) => {
    objectBox.getSize(new THREE.Vector3())
    const meshDimensitons = [objectBox.max.x - objectBox.min.x, objectBox.max.y - objectBox.min.y, objectBox.max.z - objectBox.min.z]

    const collisionPreventionThreshold = 0.001;
    const minX = -groundSize.length / 2 + meshDimensitons[0] / 2 + collisionPreventionThreshold;
    const maxX = groundSize.length / 2 - meshDimensitons[0] / 2 - collisionPreventionThreshold;
    const minZ = -groundSize.width / 2 + meshDimensitons[2] / 2 + collisionPreventionThreshold;
    const maxZ = groundSize.width / 2 - meshDimensitons[2] / 2 - collisionPreventionThreshold;

    setObjects(prev => {
      const targetObject = prev.find(obj => obj.id === objectId);
      if (!targetObject) return prev;

      // Check if dragLimits already exist and have the same values
      const currentLimits = targetObject.dragLimits;
      if (currentLimits &&
        currentLimits[0][0] === minX && currentLimits[0][1] === maxX &&
        currentLimits[1][0] === 0 && currentLimits[1][1] === 0 &&
        currentLimits[2][0] === minZ && currentLimits[2][1] === maxZ) {
        // No change needed, return the same array reference
        return prev;
      }

      // Only create new objects if values actually changed
      return prev.map(obj => {
        if (obj.id === objectId) {
          // Reuse existing dragLimits arrays if they exist, just update values
          if (obj.dragLimits) {
            obj.dragLimits[0][0] = minX;
            obj.dragLimits[0][1] = maxX;
            obj.dragLimits[1][0] = 0;
            obj.dragLimits[1][1] = 0;
            obj.dragLimits[2][0] = minZ;
            obj.dragLimits[2][1] = maxZ;
            return obj; // Return the same object reference
          } else {
            // Create new dragLimits only if they don't exist
            return {
              ...obj,
              dragLimits: [
                [minX, maxX], // X limits
                [0, 0], // Y fixed to place object on ground
                [minZ, maxZ]  // Z limits
              ]
            };
          }
        }
        return obj;
      });
    });
  };

  const setObject = (meshRef: SelectableObjectRef, objectId: string, position: [number, number, number]) => {
    setSelectedObjectRef(meshRef);
    setSelectedObjectId(objectId);
    setSelectedObjectPosition(position);
    setObjectControlsVisible(true);
  };

  const clearObject = () => {
    setSelectedObjectRef(null);
    setSelectedObjectId(null);
    setSelectedObjectPosition(null);
    setObjectControlsVisible(false);
  };

  const actions = useMemo(() => ({
    setCurrentObject,
    setCurrentObjectRef,
    setCurrentObjectOriginId,
    setObjects,
    addObject,
    removeObject,
    updateObjectPosition,
    updateObjectDragLimits,
    setObject,
    clearObject,
  }), []);


  // In MeshProvider
  const value: MeshContextType = {
    currentObject,
    currentObjectRef,
    currentObjectOriginId,
    objects,
    selectedObjectRef,
    selectedObjectId,
    selectedObjectPosition,
    isObjectControlsVisible,
    ...actions
  };

  return (
    <MeshContext.Provider value={value}>
      {children}
    </MeshContext.Provider>
  );
}