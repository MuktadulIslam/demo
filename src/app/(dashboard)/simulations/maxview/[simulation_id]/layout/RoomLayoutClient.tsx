'use client'
import { FaArrowLeft } from "react-icons/fa6";
import { useRouter } from "next/navigation";

import { MeshProvider } from "@/components/simulations/CreateNewSimulation/objects_layout/canvas/context/MeshContext";
import { RoomProvider } from "@/components/simulations/CreateNewSimulation/objects_layout/canvas/context/RoomDimensionsContext";
import Room3DCanvas from "@/components/simulations/CreateNewSimulation/objects_layout/canvas/Room3DCanvas";
import { ModelsLocalStorage, RoomDimensions } from "@/components/simulations/CreateNewSimulation/objects_layout/utils/modelLocalStorage/type";

interface RoomLayoutClientProps {
    roomData: {
        models: ModelsLocalStorage;
        roomDimensions: RoomDimensions;
    };
}

export default function RoomLayoutClient({ roomData }: RoomLayoutClientProps) {
    const router = useRouter();

    return (
        <div className="w-full h-full relative">
            <button
                onClick={() => router.back()}
                className="absolute top-2 left-2 z-[10000] h-10 w-10 flex justify-center items-center rounded-lg bg-black/50 text-white"
            >
                <FaArrowLeft size={20} />
            </button>
            <RoomProvider initialDimensions={roomData.roomDimensions}>
                <MeshProvider>
                    <Room3DCanvas models={roomData.models} isEditable={false} />
                </MeshProvider>
            </RoomProvider>
        </div>
    );
}