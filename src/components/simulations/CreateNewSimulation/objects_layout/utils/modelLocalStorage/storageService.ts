import { ModelsLocalStorage, RoomDimensions } from "./type";

const ModelLocalStorageKey = 'craftxr_saved3DObjects_007';
const RoomDimensionsLocalStorageKey = 'craftxr_saved3DRoomDimensions_007';

export const get3DModelFromLocalStorage = (): [ModelsLocalStorage, RoomDimensions | null] => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const objectsData = localStorage.getItem(ModelLocalStorageKey);
        const roomData = localStorage.getItem(RoomDimensionsLocalStorageKey);

        const objects = objectsData ? JSON.parse(objectsData) : [];
        const roomDimensions = roomData ? JSON.parse(roomData) : null;

        return [objects, roomDimensions];
    }
    return [[], null];
};

export const save3DModelToLocalStorage = (models: ModelsLocalStorage, roomDimensions: RoomDimensions): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(ModelLocalStorageKey, JSON.stringify(models));
        localStorage.setItem(RoomDimensionsLocalStorageKey, JSON.stringify(roomDimensions));
    }
};

export const delete3DModelFromLocalStorage = (): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(ModelLocalStorageKey);
    }
};