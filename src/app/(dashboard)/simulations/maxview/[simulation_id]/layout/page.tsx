import { promises as fs } from 'fs';
import path from 'path';
import RoomLayoutClient from './RoomLayoutClient';
import { ModelsLocalStorage, RoomDimensions } from "@/components/simulations/CreateNewSimulation/objects_layout/utils/modelLocalStorage/type";

async function getRoomData() {
    try {
        // Adjust the path based on where your JSON file is located
        const filePath = path.join(process.cwd(), 'public', 'roomData.json');
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContents);
        
        return {
            models: data.models as ModelsLocalStorage,
            roomDimensions: data.roomDimensions as RoomDimensions
        };
    } catch (error) {
        console.error('Error loading room data:', error);
        return null;
    }
}

export default async function Page() {
    const roomData = await getRoomData();

    if (!roomData) {
        return (
            <div className="w-full h-full flex justify-center items-center font-bold text-3xl">
                Error loading room data
            </div>
        );
    }

    return <RoomLayoutClient roomData={roomData} />;
}