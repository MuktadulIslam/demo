import { useCallback, useEffect, useState } from "react"
import { useMeshContext } from "../context/MeshContext";
import { uploadMultipleGlbToAzure } from "../../utils/uploadGlbToAzure";
import { SelectableObjectRef } from "../types";
import { ModelsLocalStorage } from "../../utils/modelLocalStorage/type";
import { save3DModelToLocalStorage } from "../../utils/modelLocalStorage/storageService";
import { useRoomContext } from "../context/RoomDimensionsContext";

export default function Save3DObjects() {
    const { objects, setObjects } = useMeshContext();
    const { dimensions } = useRoomContext();
    const [saving, setSaving] = useState<boolean>(false);

    const saveToLocalStorage = useCallback(async (): Promise<void> => {
        setSaving(true);

        const existingMeshRefToUrl = new Map<string, [SelectableObjectRef, string]>();
        objects.forEach(obj => {
            if (!existingMeshRefToUrl.has(obj.originId)) {
                existingMeshRefToUrl.set(obj.originId, [obj.meshRef, obj.modelUrl || '']);
            }
            else if (
                typeof existingMeshRefToUrl.get(obj.originId)?.[1] === 'string' &&
                existingMeshRefToUrl.get(obj.originId)?.[1] === '' &&
                obj.modelUrl
            ) {
                existingMeshRefToUrl.set(obj.originId, [obj.meshRef, obj.modelUrl]);
            }
        });

        try {
            // Filter models that need to be uploaded (no URL in existingMeshRefToUrl)
            const modelsToUpload = [];
            const meshRefsToUpload = [];

            for (const [originId, [meshRef, url]] of existingMeshRefToUrl) {
                if (!url || url === '') {
                    modelsToUpload.push(originId);
                    meshRefsToUpload.push(meshRef);
                }
            }

            // Upload models that don't have URLs
            if (meshRefsToUpload.length > 0) {
                const uploadResult = await uploadMultipleGlbToAzure(meshRefsToUpload);

                if (uploadResult.success) {
                    const uploadedUrls = uploadResult.urls;
                    // Update the existingMeshRefToUrl map with new URLs
                    modelsToUpload.forEach((originId, index) => {
                        const [meshRef] = existingMeshRefToUrl.get(originId)!;
                        existingMeshRefToUrl.set(originId, [meshRef, uploadedUrls[index]]);
                    });
                } else {
                    console.error("Some or all uploads failed. Objects not saved.");
                    setSaving(false);
                    return;
                }
            }
            else {
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Update objects with URLs from existingMeshRefToUrl
            setObjects(prev => prev.map(obj => {
                const [, url] = existingMeshRefToUrl.get(obj.originId) || [null, ''];
                return { ...obj, modelUrl: url };
            }));

            // Prepare object data for saving
            const objectData: ModelsLocalStorage = objects.map((obj) => {
                const [, url] = existingMeshRefToUrl.get(obj.originId) || [null, ''];
                return {
                    'id': obj.id,
                    'originId': obj.originId,
                    'modelUrl': url,
                    'position': obj.position,
                    'originPosition': [
                        obj.meshRef.current?.position.x ?? 0,
                        obj.meshRef.current?.position.y ?? 0,
                        obj.meshRef.current?.position.z ?? 0
                    ],
                    'scale': [
                        obj.meshRef.current?.scale.x ?? 1,
                        obj.meshRef.current?.scale.y ?? 1,
                        obj.meshRef.current?.scale.z ?? 1
                    ],
                    'rotation': [
                        obj.meshRef.current?.rotation.x ?? 0,
                        obj.meshRef.current?.rotation.y ?? 0,
                        obj.meshRef.current?.rotation.z ?? 0
                    ],
                }
            });
            save3DModelToLocalStorage(objectData, dimensions);

        } catch (error) {
            console.error("Error saving 3D objects:", error);
        } finally {
            setSaving(false);
        }
    }, [dimensions, objects, setObjects]);

    // Handle keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.altKey && event.key.toLowerCase() === 's') {
                event.preventDefault(); // Prevent browser's default Alt+S behavior
                saveToLocalStorage();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [saveToLocalStorage]);

    return (
        <>
            <button
                onClick={saveToLocalStorage}
                className={'absolute top-4 right-16 py-1 w-20 text-base font-normal bg-gradient-to-r from-green-400 to-blue-500 hover:bg-gray-700 text-white rounded-lg z-10'}
                title="Save (Alt+S)" // Added tooltip to show shortcut
            >
                {saving ? 'Saving...' : 'Save'}
            </button>
        </>
    )
}