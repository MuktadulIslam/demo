"use client";

import React, { useState, useEffect, Suspense, memo, } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, } from '@react-three/drei';
import Room from '../rooms/room2/Room';
import RoomControls from './controls/RoomControls'
import Sidebar from './sidebar/Sidebar';
import PlayGround from './components/PlayGround';
import HtmlLoader from './components/SuspenseLoader';
import ObjectControls from './controls/ObjectControls';
import { MeshProvider, useMeshContext } from './context/MeshContext';
import { RoomProvider, useRoomContext } from './context/RoomDimensionsContext';
import Sava3DObjects from './components/Sava3DObjects';
import Load3DObjects from './components/Load3DObjects';
import { ModelsLocalStorage, RoomDimensions } from '../utils/modelLocalStorage/type';

interface Room3DCanvasContentProps {
    isEditable: boolean
    models?: ModelsLocalStorage
    roomDimensions?: RoomDimensions
}

function Room3DCanvasContent({
    isEditable,
    models,
    roomDimensions: propsRoomDimensions
}: Room3DCanvasContentProps) {
    const [controlsVisible, setControlsVisible] = useState<boolean>(true);
    const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
    const [orbitEnabled, setOrbitEnabled] = useState(true)
    const [freezeOrbit, setFreezeOrbit] = useState(false)

    // Use mesh context
    const { isObjectControlsVisible } = useMeshContext();
    const { dimensions, setLength: setRoomLength, setWidth: setRoomWidth } = useRoomContext();
    const roomDimensions = propsRoomDimensions ?? dimensions;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Ctrl+Shift+S combination
            if (event.ctrlKey && event.shiftKey && event.key === 'S') {
                event.preventDefault(); // Prevent default browser save dialog
                setSidebarVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Ctrl+Shift+F combination
            if (event.ctrlKey && event.shiftKey && event.key === 'F') {
                event.preventDefault(); // Prevent default browser save dialog
                setFreezeOrbit(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Ctrl+Shift+Z combination
            if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
                event.preventDefault(); // Prevent default browser save dialog
                setControlsVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#226764a8]">
            <Load3DObjects models={models} roomDimensions={roomDimensions}/>

            {isEditable &&
                <>
                    <Sava3DObjects />
                    <Sidebar
                        visible={sidebarVisible}
                    />
                    {controlsVisible &&
                        <RoomControls
                            length={roomDimensions.length}
                            width={roomDimensions.width}
                            onWidthChange={setRoomWidth}
                            onLengthChange={setRoomLength}
                        />
                    }
                    {isObjectControlsVisible && (
                        <ObjectControls />
                    )}
                </>
            }

            <Canvas
                camera={{ position: [8, 15, 20], fov: 60 }}
                // camera={{ fov: 60 }}
                shadows
                style={{ position: 'relative', zIndex: 1 }}
            >
                {/* <axesHelper args={[5]} /> */}
                <Suspense fallback={<HtmlLoader />}>
                    {/* Lighting */}
                    <ambientLight intensity={0.3} />
                    <directionalLight
                        position={[10, 10, 5]}
                        intensity={1}
                        castShadow
                    />
                    <pointLight
                        position={[roomDimensions.width / 2 - 1, 3, -roomDimensions.length / 2 + 1]}
                        intensity={0.8}
                        color="#fff8dc"
                    />

                    {/* Room structure */}
                    <PlayGround
                        key={`${roomDimensions.width}-${roomDimensions.length}`}
                        setOrbitEnabled={setOrbitEnabled}
                        isEditable={isEditable}
                    >
                        <Room width={roomDimensions.width} length={roomDimensions.length} />
                    </PlayGround>

                    {/* Environment and controls */}
                    <Environment preset="apartment" />
                    <OrbitControls
                        enabled={orbitEnabled && !freezeOrbit}
                        minDistance={1}
                        maxDistance={100}
                        enableDamping={true}
                        dampingFactor={0.05}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};


interface Room3DCanvasProps {
    isEditable?: boolean,
    models?: ModelsLocalStorage
    roomDimensions?: RoomDimensions
}

const Room3DCanvas = memo(function Room3DCanvas({
    isEditable = true,
    models,
    roomDimensions
}: Room3DCanvasProps) {
    return (
        // <RoomProvider initialDimensions={{ width: 22, length: 14, height: 5 }}>
        //     <MeshProvider>
        <Room3DCanvasContent isEditable={isEditable} models={models} roomDimensions={roomDimensions}/>
        //     </MeshProvider>
        // </RoomProvider>
    );
});

export default Room3DCanvas;