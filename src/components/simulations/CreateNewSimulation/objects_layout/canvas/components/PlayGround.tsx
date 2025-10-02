import { useThree } from "@react-three/fiber"
import { PlacedObject } from "../types"
import { memo, Suspense, use, useCallback, useEffect, useRef } from "react"
import * as THREE from 'three'
import DraggableObject from "./DraggableObject"
import React from "react"
import HtmlLoader from "./SuspenseLoader"
import { useMeshContext } from "../context/MeshContext"
import { useRoomContext } from "../context/RoomDimensionsContext"


interface PlayGroundProps {
    setOrbitEnabled: (enabled: boolean) => void;
    children: React.ReactNode;
}

const PlayGround = memo(function PlayGround({
    setOrbitEnabled,
    children
}: PlayGroundProps) {
    const { camera, raycaster, gl } = useThree();
    const groundRef = useRef<THREE.Mesh>(null);
    const { objects, addObject, clearObject, currentObject, currentObjectRef, currentObjectOriginId, setCurrentObject, setCurrentObjectRef, setCurrentObjectOriginId } = useMeshContext();
    const { dimensions: roomSize } = useRoomContext();

    useEffect(() => {
        const handleDrop = (e: DragEvent) => {
            e.preventDefault();

            if (currentObject && currentObjectRef && currentObjectOriginId) {
                const canvas = gl.domElement;
                const rect = canvas.getBoundingClientRect();
                const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

                if (groundRef.current) {
                    const intersects = raycaster.intersectObject(groundRef.current);

                    if (intersects.length > 0) {
                        const point = intersects[0].point;
                        const uniqueId = `${currentObjectOriginId}_${Date.now().toString()}`;

                        const newObject: PlacedObject = {
                            id: uniqueId,
                            originId: currentObjectOriginId,
                            component: currentObject,
                            position: [point.x, 0, point.z],
                            meshRef: currentObjectRef,
                            dragLimits: [[0, 0], [0, 0], [0, 0]]
                        };
                        addObject(newObject);
                    }
                }

                setCurrentObject(null);
                setCurrentObjectRef(null);
                setCurrentObjectOriginId(null);
            }
        };

        const preventDefaults = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        document.addEventListener('drop', handleDrop);
        document.addEventListener('dragover', preventDefaults);

        return () => {
            document.removeEventListener('drop', handleDrop);
            document.removeEventListener('dragover', preventDefaults);
        };
    }, [currentObject, setCurrentObject, currentObjectRef, setCurrentObjectRef,currentObjectOriginId, setCurrentObjectOriginId, camera, raycaster, gl, addObject]);

    // Handle floor click to deselect objects
    const handleFloorClick = useCallback((event: React.MouseEvent) => {
        // Stop event propagation to prevent conflicts with object selection
        event.stopPropagation();

        // Clear the selected object
        clearObject();
    }, [clearObject]);

    return (
        <>
            {/* Render dropped objects */}
            {objects.map(obj => (
                <Suspense fallback={<HtmlLoader />} key={obj.id}>
                    <DraggableObject
                        object={obj}
                        setOrbitEnabled={setOrbitEnabled}
                    />
                </Suspense>
            ))}
            {children}

            {/* Playground floor */}
            <mesh
                ref={groundRef}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, 0]}
                onClick={handleFloorClick}
            >
                <planeGeometry args={[roomSize.length, roomSize.width]} />
                <meshStandardMaterial color="lightgray" opacity={0.7} transparent />
            </mesh>
        </>
    );
});

export default PlayGround;