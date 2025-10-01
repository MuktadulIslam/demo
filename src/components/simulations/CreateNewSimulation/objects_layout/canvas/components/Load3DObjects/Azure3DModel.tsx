import { useGLTF } from "@react-three/drei";
import { memo } from "react";
import { SelectableObjectRef } from "../../types";
import ScaledModelWrapper from "../ScaledModelWrapper";

interface Azure3DModelProps {
    blobUrl: string;
    meshRef: SelectableObjectRef;
    originPosition: [number, number, number];
    scale: [number, number, number];
    rotation: [number, number, number];
}

const Azure3DModel = memo(function Azure3DModel({ blobUrl, meshRef, originPosition, scale, rotation }: Azure3DModelProps) {
    const { scene } = useGLTF(blobUrl);
    if (!scene) {
        return null;
    }

    return (
        <ScaledModelWrapper meshRef={meshRef} originPosition={originPosition} scale={scale} rotation={rotation}>
            <primitive object={scene} scale={1} />
        </ScaledModelWrapper>
    );
});

export default Azure3DModel;