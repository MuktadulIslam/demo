import { Group, Mesh, Object3D } from "three";

export type SelectableObject = Mesh | Group | Object3D | null;
export type SelectableObjectRef = React.RefObject<Mesh | Group | Object3D | null>;

export interface PlacedObject {
  id: string; // Unique instance ID (generated when placed)
  originId: string; // Original sidebar item ID (what was dragged from)
  component: React.ReactNode;
  position: [number, number, number];
  meshRef: SelectableObjectRef;
  modelUrl?: string;
  dragLimits: [[number, number], [number, number], [number, number]];
}

export interface LoadingState {
  isLoading: boolean;
  totalModels: number;
  loadedModels: number;
  failedModels: number;
  totalBytes: number;
  loadedBytes: number;
}
