import { SelectableObjectRef } from '../canvas/types';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import * as THREE from 'three';

// Return type for single upload
interface UploadResult {
    success: boolean;
    url: string;
}

// Return type for multiple uploads
interface MultipleUploadResult {
    success: boolean;
    urls: string[];
}

const getResetTransformModel = (object: THREE.Object3D): THREE.Object3D => {
    // Create a deep copy of the object
    const copy = object.clone(true);

    // Reset transform on the copy
    copy.position.set(0, 0, 0);
    copy.rotation.set(0, 0, 0);
    copy.scale.set(1, 1, 1);

    // Reset material effects (hover/selection) on the copy
    copy.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];

            materials.forEach((mat) => {
                // Clone the material to avoid affecting the original
                const resetMaterial = mat.clone();

                // Reset emissive properties to default values
                if (resetMaterial.emissive) {
                    resetMaterial.emissive.setHex(0x000000); // Black (no emission)
                }
                if (resetMaterial.emissiveIntensity !== undefined) {
                    resetMaterial.emissiveIntensity = 0; // No intensity
                }

                // Apply the reset material to the child
                if (Array.isArray(child.material)) {
                    const materialIndex = child.material.indexOf(mat);
                    if (materialIndex !== -1) {
                        child.material[materialIndex] = resetMaterial;
                    }
                } else {
                    child.material = resetMaterial;
                }
            });
        }
    });

    // Update matrix on the copy
    copy.updateMatrix();
    copy.updateMatrixWorld(true);

    return copy;
};

export const uploadGlbToAzure = async (meshRef: SelectableObjectRef, fileName?: string): Promise<UploadResult> => {
    try {
        const exporter = new GLTFExporter();

        const exportPromise = new Promise<ArrayBuffer | object>((resolve, reject) => {
            if (meshRef.current) {
                const objectCopy = getResetTransformModel(meshRef.current);
                exporter.parse(
                    objectCopy,
                    (result) => resolve(result),
                    (error) => reject(error),
                    {
                        binary: true, // This ensures we get ArrayBuffer
                        includeCustomExtensions: false,
                        truncateDrawRange: true
                    }
                );
            } else {
                reject(new Error('meshRef.current is null'));
            }
        });

        const result = await exportPromise;

        // Ensure we have an ArrayBuffer
        if (!(result instanceof ArrayBuffer)) {
            throw new Error('Expected ArrayBuffer but got JSON result');
        }

        // Use provided filename or generate one
        const finalFileName = fileName ?
            (fileName.endsWith('.glb') ? fileName : `${fileName}.glb`) :
            `object-${Date.now().toString()}.glb`;

        // Send ArrayBuffer directly with metadata in headers
        const response = await fetch('/api/azure/upload/model', {
            method: 'POST',
            headers: {
                'Content-Type': 'model/gltf-binary',
                'filename': finalFileName,
                'file_size': result.byteLength.toString(),
            },
            body: result, // Send ArrayBuffer directly
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the response to get the URL
        const responseData = await response.json();
        const modelUrl = responseData.url || responseData.modelUrl || '';

        return {
            success: true,
            url: modelUrl
        };

    } catch (error) {
        console.error('Upload failed:', error);
        return {
            success: false,
            url: ''
        };
    }
}

// Modified function to upload multiple files and return URLs
export const uploadMultipleGlbToAzure = async (meshRefs: SelectableObjectRef[]): Promise<MultipleUploadResult> => {
    try {
        // Create an array of upload promises
        const uploadPromises = meshRefs.map(async (meshRef, index) => {
            try {
                const result = await uploadGlbToAzure(meshRef);
                return result;
            } catch (error) {
                console.error(`Failed to upload file (${index + 1}/${meshRefs.length}):`, error);
                return {
                    success: false,
                    url: ''
                };
            }
        });

        // Wait for all uploads to complete
        const results = await Promise.allSettled(uploadPromises);

        // Extract successful uploads and their URLs
        const successfulUploads: string[] = [];
        let allSuccessful = true;

        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.success) {
                successfulUploads.push(result.value.url);
            } else {
                allSuccessful = false;
                console.error(`Upload ${index + 1} failed:`,
                    result.status === 'rejected' ? result.reason : 'Unknown error'
                );
            }
        });

        return {
            success: allSuccessful,
            urls: allSuccessful ? successfulUploads : []
        };

    } catch (error) {
        console.error('Batch upload process failed:', error);
        return {
            success: false,
            urls: []
        };
    }
}