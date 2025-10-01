import { ModelsLocalStorage } from "./type";

const ModelLocalStorageKey = 'craftxr_saved3DObjects_007';

export const get3DModelFromLocalStorage = (): ModelsLocalStorage => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(ModelLocalStorageKey);
        return data ? JSON.parse(data) : [];
    }
    return [];
};

export const save3DModelToLocalStorage = (models: ModelsLocalStorage): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(ModelLocalStorageKey, JSON.stringify(models));
    }
};

export const delete3DModelFromLocalStorage = (): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(ModelLocalStorageKey);
    }
};