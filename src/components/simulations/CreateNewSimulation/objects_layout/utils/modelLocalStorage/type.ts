export interface ModelLocalStorage {
    id: string;
    originId: string;
    modelUrl: string;
    position: [number, number, number];
    originPosition: [number, number, number];
    scale: [number, number, number];
    rotation: [number, number, number];
}

export type ModelsLocalStorage = ModelLocalStorage[];