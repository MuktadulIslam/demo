import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useRoomContext } from '../context/RoomDimensionsContext';
import { SelectableObjectRef } from '../types';

interface ScaledModelWrapperProps {
    children: React.ReactNode;
    meshRef: SelectableObjectRef;
    originPosition?: [number, number, number];
    scale?: [number, number, number];
    rotation?: [number, number, number];
}

export default function ScaledModelWrapper({
    children,
    meshRef,     
    originPosition,
    scale,
    rotation
}: ScaledModelWrapperProps) {
    const scaleDownFactor = 0.6;
    const previousScale = useRef<THREE.Vector3>(null);          // For preventing infinite loop
    const { dimensions: roomDimensions } = useRoomContext();

    const processScaling = useCallback(() => {
        if (!meshRef.current || !roomDimensions) return 1;
        try {
            // Calculate the bounding box
            const box = new THREE.Box3().setFromObject(meshRef.current);
            if (box.isEmpty()) return 1;

            const size = new THREE.Vector3();
            box.getSize(size);

            const maxScaleDownFactor = Math.max(size.x / roomDimensions.length, size.z / roomDimensions.width, size.y / roomDimensions.height);

            if (maxScaleDownFactor < 1) return 1;
            else return scaleDownFactor / maxScaleDownFactor;
        } catch (error) {
            console.warn('❌ Error in scaling:', error);
            return 1;
        }
    }, [roomDimensions, meshRef]);

    // Reset when children change
    useEffect(() => {
        if (meshRef.current && meshRef.current.scale != previousScale.current) {
            if (scale) {
                meshRef.current.scale.set(...scale);
                previousScale.current = meshRef.current.scale;
            } else {
                const newScale = processScaling();
                meshRef.current.scale.set(newScale, newScale, newScale);
                previousScale.current = meshRef.current.scale;
            }

            if (originPosition) {
                meshRef.current.position.set(...originPosition);
            }
            if (rotation) {
                meshRef.current.rotation.set(...rotation);
            }
        }
    }, [meshRef, roomDimensions, processScaling, scale, originPosition, rotation]);

    return (
        <>
            <group ref={meshRef}>
                {children}
            </group>
        </>
    );
}