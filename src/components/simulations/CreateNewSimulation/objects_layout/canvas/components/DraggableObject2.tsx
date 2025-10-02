import { DragControls } from "@react-three/drei"
import React, { memo, useCallback, useEffect, useRef } from "react"
import * as THREE from 'three'
import { useMeshContext } from "../context/MeshContext"
import { PlacedObject } from "../types"
import { useRoomContext } from "../context/RoomDimensionsContext"

interface DraggableObjectProps {
  setOrbitEnabled: (enabled: boolean) => void,
  object: PlacedObject
}

// Store original material states
interface MaterialState {
  material: THREE.Material;
  originalEmissive: THREE.Color;
  originalEmissiveIntensity: number;
}

interface CustomDragControlsProps {
  setOrbitEnabled: (enabled: boolean) => void;
  handlePointerOver: () => void;
  handlePointerOut: () => void;
  handleDoubleClick: (event: React.MouseEvent) => void;
  object: PlacedObject;
  updateObjectPosition: (objectId: string, newPosition: [number, number, number]) => void;
}

const CustomDragControls = memo(function CustomDragControls({
  setOrbitEnabled,
  handlePointerOver,
  handlePointerOut,
  handleDoubleClick,
  object,
  updateObjectPosition
}: CustomDragControlsProps) {
  console.log('DraggableObject render', object.id);

  const initialPositionSetRef = useRef(true);
  const prePosition = useRef(new THREE.Vector3());
  const snapSize = 0.5;
  // Setting Object Limits
  useEffect(() => {
    // if (initialPositionSetRef.current) {
    const initPosition = new THREE.Vector3()

    // Snap to grid on X and Z
    initPosition.x = Math.floor(object.position[0] / snapSize) * snapSize;
    initPosition.y = 0; // Keep Y fixed at floor level
    initPosition.z = Math.floor(object.position[2] / snapSize) * snapSize;
    matrixRef.current.setPosition(initPosition);
    prePosition.current = initPosition;
    initialPositionSetRef.current = false;
    // }
  }, [object.position])

  const matrixRef = useRef(new THREE.Matrix4());
  const handleDrag = useCallback((localMatrix: THREE.Matrix4) => {
    const newPosition = new THREE.Vector3().setFromMatrixPosition(localMatrix);
    // Snap to grid on X and Z
    newPosition.x = Math.floor(newPosition.x / snapSize) * snapSize;
    newPosition.z = Math.floor(newPosition.z / snapSize) * snapSize;
    newPosition.y = 0; // Keep Y fixed at floor level

    newPosition.x = Math.max(object.dragLimits[0][0], Math.min(object.dragLimits[0][1], newPosition.x));
    newPosition.z = Math.max(object.dragLimits[2][0], Math.min(object.dragLimits[2][1], newPosition.z));

    matrixRef.current.setPosition(newPosition);
    if (prePosition.current.x != newPosition.x || prePosition.current.z != newPosition.z) {
      prePosition.current = newPosition
    }
  }, [object.dragLimits, snapSize]);

  const handleDragEnd = useCallback(() => {
    setOrbitEnabled(true);
    updateObjectPosition(object.id, [prePosition.current.x, prePosition.current.y, prePosition.current.z]);
  }, [setOrbitEnabled, updateObjectPosition, object.id]);
  return (
    <DragControls
      onDragStart={() => setOrbitEnabled(false)}
      onDragEnd={handleDragEnd}
      matrix={matrixRef.current}
      onDrag={handleDrag}
    >
      <group
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onDoubleClick={handleDoubleClick}
      >
        {React.cloneElement(object.component as React.ReactElement, { key: object.id })}
      </group>
    </DragControls>
  )
})


const DraggableObject = memo(function DraggableObject({ setOrbitEnabled, object }: DraggableObjectProps) {
  const { id: objectId, position, meshRef, dragLimits } = object;

  const { setObject, selectedObjectId, updateObjectDragLimits, updateObjectPosition } = useMeshContext();
  const { dimensions: groundSize } = useRoomContext();
  // Store original material states for this specific instance
  const originalMaterialsRef = useRef<Map<THREE.Material, MaterialState>>(new Map());

  useEffect(() => {
    if (meshRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current)
      box.getSize(new THREE.Vector3())
      updateObjectDragLimits(objectId, box);
      meshRef.current.position.x = 0;
      if (meshRef.current.position.y == 0) {  // means it's the initial placement
        meshRef.current.position.y = position[1] - box.min.y
      }
      // meshRef.current.position.y = 2 + (box.max.y - box.min.y) / 2;
      meshRef.current.position.z = 0;
    }
  }, [groundSize.length, groundSize.width, meshRef, objectId, updateObjectDragLimits, position])


  // Apply hover effect
  const applyHoverEffect = useCallback((isHover: boolean, isSelected: boolean = false) => {
    if (!meshRef.current) return;

    meshRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];

        materials.forEach((mat) => {
          const materialState = originalMaterialsRef.current.get(mat);
          if (materialState) {
            if (isSelected) {
              mat.emissive.setHex(0x0066ff);
              mat.emissiveIntensity = 0.3;
            } else if (isHover) {
              mat.emissive.setHex(0x00ff66);
              mat.emissiveIntensity = 0.2;
            } else {
              // Restore original state
              mat.emissive.copy(materialState.originalEmissive);
              mat.emissiveIntensity = materialState.originalEmissiveIntensity;
            }
          }
        });
      }
    });
  }, [meshRef]);

  // Initialize and store original material states
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];

          materials.forEach((mat) => {
            if (!originalMaterialsRef.current.has(mat)) {
              // Clone the material for this instance
              const clonedMaterial = mat.clone();
              child.material = Array.isArray(child.material)
                ? child.material.map(m => m === mat ? clonedMaterial : m)
                : clonedMaterial;

              // Store original state
              originalMaterialsRef.current.set(clonedMaterial, {
                material: clonedMaterial,
                originalEmissive: clonedMaterial.emissive?.clone() || new THREE.Color(0x000000),
                originalEmissiveIntensity: clonedMaterial.emissiveIntensity || 0
              });
            }
          });
        }
      });
    }
  }, [meshRef]);

  // Selection effect
  useEffect(() => {
    const isSelected = selectedObjectId === objectId;
    applyHoverEffect(false, isSelected);
  }, [objectId, applyHoverEffect]);

  const handlePointerOver = useCallback(() => {
    if (selectedObjectId !== objectId) {
      applyHoverEffect(true, false);
    }
  }, [objectId, applyHoverEffect]);

  const handlePointerOut = useCallback(() => {
    if (selectedObjectId !== objectId) {
      applyHoverEffect(false, false);
    }
  }, [objectId, applyHoverEffect]);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setObject(meshRef, objectId, position);
  }, [meshRef, objectId, setObject, position]);



  

  return (
    <CustomDragControls
      setOrbitEnabled={setOrbitEnabled}
      handlePointerOver={handlePointerOver}
      handlePointerOut={handlePointerOut}
      handleDoubleClick={handleDoubleClick}
      object={object}
      updateObjectPosition={updateObjectPosition}
    />
  )
});

export default DraggableObject;