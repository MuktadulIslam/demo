import { SelectableObjectRef } from '../canvas/types';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

interface ExportOptions {
  filename?: string;
  binary?: boolean;
  includeCustomExtensions?: boolean;
  truncateDrawRange?: boolean;
}

export const exportToGLB = (
  meshRef: SelectableObjectRef,
  options: ExportOptions = {}
) => {
  try {
    if (meshRef.current) {
      // Set default values from options
      const {
        filename = 'model.glb',
        binary = true,
        includeCustomExtensions = false,
        truncateDrawRange = true
      } = options;

      const exporter = new GLTFExporter();
      exporter.parse(
        meshRef.current,
        (result) => {
          // When binary: true, result is an ArrayBuffer
          let blob: Blob;
          let downloadFilename: string;

          if (result instanceof ArrayBuffer) {
            blob = new Blob([result], { type: 'model/gltf-binary' });
            // Ensure .glb extension for binary format
            downloadFilename = filename.endsWith('.glb') ? filename : `${filename.replace(/\.[^.]*$/, '')}.glb`;
          } else {
            blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
            // Ensure .gltf extension for JSON format
            downloadFilename = filename.endsWith('.gltf') ? filename : `${filename.replace(/\.[^.]*$/, '')}.gltf`;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = downloadFilename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        },
        (error) => {
          console.error('GLB export failed:', error);
        },
        {
          binary,
          includeCustomExtensions,
          truncateDrawRange
        }
      );
    } else {
      console.error('Mesh reference is not available');
    }
  } catch (error) {
    console.error('Export failed:', error);
  }
};