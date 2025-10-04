export interface ModelLocalStorage {
    id: string;
    originId: string;
    modelUrl: string;
    position: [number, number, number];
    originPosition: [number, number, number];
    scale: [number, number, number];
    rotation: [number, number, number];
}

export interface RoomDimensions {
    length: number;
    width: number;
    height: number;
}

export type ModelsLocalStorage = ModelLocalStorage[];