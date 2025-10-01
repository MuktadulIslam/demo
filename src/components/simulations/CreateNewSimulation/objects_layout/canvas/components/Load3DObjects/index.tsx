'use client'
import { memo, useEffect, useRef, useState } from "react"
import React from "react";
import { get3DModelFromLocalStorage } from "../../../utils/modelLocalStorage/storageService";
import { ModelsLocalStorage } from "../../../utils/modelLocalStorage/type";
import ModelLoadingIndicator from "./ModelLoadingIndicator";
import { LoadingState, PlacedObject, SelectableObject } from "../../types";
import { useMeshContext } from "../../context/MeshContext";
import Azure3DModel from "./Azure3DModel";
import { corsDataFetch } from "../../../utils/corsDataFetch";

const Load3DObjects = memo(function Load3DObjects() {
    const { addObject } = useMeshContext();

    const hasInitialized = useRef(false);
    const bytesLoadedRef = useRef<Record<string, number>>({});
    const bytesTotalRef = useRef<Record<string, number>>({});
    const aggregateBytesRef = useRef<{ loaded: number; total: number }>({ loaded: 0, total: 0 });
    const [loadingState, updateLoadingState] = useState<LoadingState>({
        isLoading: false,
        totalModels: 0,
        loadedModels: 0,
        failedModels: 0,
        totalBytes: 0,
        loadedBytes: 0,
    });

    useEffect(() => {
        // Only run once when component mounts
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const loadStoredModels = async () => {
            const models: ModelsLocalStorage = get3DModelFromLocalStorage();
            bytesLoadedRef.current = {};
            bytesTotalRef.current = {};
            aggregateBytesRef.current = { loaded: 0, total: 0 };
            let estimatedTotal = 0;

            updateLoadingState({
                isLoading: models.length > 0,
                totalModels: models.length,
                loadedModels: 0,
                failedModels: 0,
                totalBytes: 0,
                loadedBytes: 0,
            });

            if (models.length === 0) {
                return;
            }
            const promises = models.map(async (model, index) => {
                try {
                    const meshRef = React.createRef<SelectableObject>();
                    bytesLoadedRef.current[model.id] = 0;
                    bytesTotalRef.current[model.id] = 0;

                    const { blobUrl, totalBytes } = await corsDataFetch(model.modelUrl, {
                        onProgress: ({ loaded, total }) => {
                            const previousLoaded = bytesLoadedRef.current[model.id] ?? 0;
                            const deltaLoaded = Math.max(loaded - previousLoaded, 0);
                            bytesLoadedRef.current[model.id] = loaded;

                            aggregateBytesRef.current.loaded += deltaLoaded;

                            const previousEstimate = bytesTotalRef.current[model.id] ?? 0;
                            const resolvedTotal = total ?? (previousEstimate === 0 ? undefined : previousEstimate);

                            if (typeof resolvedTotal === 'number' && resolvedTotal > previousEstimate) {
                                aggregateBytesRef.current.total += resolvedTotal - previousEstimate;
                                estimatedTotal += resolvedTotal - previousEstimate;
                                bytesTotalRef.current[model.id] = resolvedTotal;
                            } else if (!resolvedTotal && loaded > previousEstimate) {
                                const inferredTotal = loaded;
                                aggregateBytesRef.current.total += inferredTotal - previousEstimate;
                                estimatedTotal += inferredTotal - previousEstimate;
                                bytesTotalRef.current[model.id] = inferredTotal;
                            }

                            updateLoadingState((prev) => ({
                                ...prev,
                                loadedBytes: aggregateBytesRef.current.loaded,
                                totalBytes: Math.max(aggregateBytesRef.current.total, aggregateBytesRef.current.loaded, estimatedTotal),
                            }));
                        },
                    });

                    if(totalBytes < 2000){      // if the model size is less than 2KB, it is likely an error page
                        throw new Error('Failed to load model');
                    }

                    if (totalBytes > 0) {
                        const previousTotal = bytesTotalRef.current[model.id] ?? 0;
                        const deltaTotal = Math.max(totalBytes - previousTotal, 0);
                        aggregateBytesRef.current.total += deltaTotal;
                        estimatedTotal += deltaTotal;
                        bytesTotalRef.current[model.id] = totalBytes;
                    }

                    if (aggregateBytesRef.current.total < aggregateBytesRef.current.loaded) {
                        const adjustment = aggregateBytesRef.current.loaded - aggregateBytesRef.current.total;
                        aggregateBytesRef.current.total += adjustment;
                        estimatedTotal += adjustment;
                    }
                    
                    const object = <Azure3DModel
                        key={model.id}
                        meshRef={meshRef}
                        originPosition={model.originPosition}
                        scale={model.scale}
                        rotation={model.rotation}
                        blobUrl={blobUrl}
                    />;

                    if (!object) {
                        throw new Error('Failed to create 3D model component');
                    }
                    const newObject: PlacedObject = {
                        id: model.id,
                        modelUrl: model.modelUrl,
                        originId: model.originId,
                        component: object,
                        position: model.position,
                        meshRef: meshRef,
                        dragLimits: [[0, 0], [0, 0], [0, 0]]
                    };
                    addObject(newObject);
                    updateLoadingState((prev) => ({
                        ...prev,
                        loadedModels: prev.loadedModels + 1,
                        loadedBytes: aggregateBytesRef.current.loaded,
                        totalBytes: Math.max(aggregateBytesRef.current.total, aggregateBytesRef.current.loaded, estimatedTotal),
                    }));
                } catch (error) {
                    updateLoadingState((prev) => ({
                        ...prev,
                        failedModels: prev.failedModels + 1,
                        loadedBytes: aggregateBytesRef.current.loaded,
                        totalBytes: Math.max(aggregateBytesRef.current.total, aggregateBytesRef.current.loaded, estimatedTotal),
                    }));
                    console.error(`Failed to load model ${model.id}:`, error);
                }
            });
            await Promise.all(promises);
            updateLoadingState((prev) => ({
                ...prev,
                isLoading: false,
                loadedBytes: aggregateBytesRef.current.loaded,
                totalBytes: Math.max(aggregateBytesRef.current.total, aggregateBytesRef.current.loaded, estimatedTotal),
            }));
        };
        
        loadStoredModels();
    }, [addObject]);
    
    return (<>
        <ModelLoadingIndicator
            totalModels={loadingState.totalModels}
            loadedModels={loadingState.loadedModels}
            failedModels={loadingState.failedModels}
            isInitializing={loadingState.isLoading}
            totalBytes={loadingState.totalBytes}
            loadedBytes={loadingState.loadedBytes}
        />
    </>)
})
export default Load3DObjects;


