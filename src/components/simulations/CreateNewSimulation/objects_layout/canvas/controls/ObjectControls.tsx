import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import * as THREE from 'three'
import { FaRotateLeft, FaRotateRight } from "react-icons/fa6";
import { useMeshContext } from '../context/MeshContext';

const ObjectControls = memo(function ObjectControls() {
  const {
    selectedObjectRef: meshRef, selectedObjectPosition: position, selectedObjectId, removeObject, clearObject, updateObjectDragLimits, updateObjectPosition } = useMeshContext();
  const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
  const [scaleInputs, setScaleInputs] = useState<[string, string, string]>(['1.0000', '1.0000', '1.0000']);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [uniformScale, setUniformScale] = useState<number>(1);
  const [uniformScaleInput, setUniformScaleInput] = useState<string>('1.0000');
  const [verticalPosition, setVerticalPosition] = useState<number>(0);

  // Constants
  const MAX_SCALE = 4;
  const MIN_SCALE = 0.01;
  const SCALE_STEP_SIZE = 0.01;
  const rotationStepSize = 10

  // Storing initial values for reset functionality
  const initialValues = useRef<{
    scale: [number, number, number];
    rotation: [number, number, number];
    verticalPosition: number;
  }>({
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    verticalPosition: 1
  });

  const handleClose = useCallback(() => {
    clearObject(); // This will handle both Three.js removal and state update
  }, [clearObject]);

  // Initialize state from selectedObject properties
  useEffect(() => {
    if (meshRef && meshRef.current) {
      const objScale: [number, number, number] = [
        meshRef.current.scale.x,
        meshRef.current.scale.y,
        meshRef.current.scale.z
      ];
      const objRotation: [number, number, number] = [
        meshRef.current.rotation.x,
        meshRef.current.rotation.y,
        meshRef.current.rotation.z
      ];

      initialValues.current = {
        scale: [...objScale],
        rotation: [...objRotation],
        verticalPosition: meshRef.current.position.y
      };

      setScale(objScale);
      setRotation(objRotation);
      if (position) {
        setVerticalPosition(position[1]);
      }
      // Check if scale is uniform and set uniform scale value
      if (objScale[0] == objScale[1] && objScale[1] == objScale[2]) {
        setUniformScale(objScale[0]);
        setUniformScaleInput(objScale[0].toFixed(4));
      } else {
        setUniformScale(1); // Default when not uniform
        setUniformScaleInput("1.0000");
      }
      setScaleInputs([objScale[0].toFixed(4), objScale[1].toFixed(4), objScale[2].toFixed(4)]);
    }
  }, [meshRef, position]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  useEffect(() => {
    return () => {
      updateObjectPosition(selectedObjectId ?? '', [position ? position[0] : 0, verticalPosition, position ? position[2] : 0]);
    }
  },[verticalPosition, position, selectedObjectId, updateObjectPosition]);


  const updateObjectLimits = useCallback(() => {
    if (meshRef && meshRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current)
      const size = new THREE.Vector3()
      box.getSize(size)
      meshRef.current.position.y -= (box.min.y - verticalPosition);

      updateObjectDragLimits(selectedObjectId ?? '', box);
    }
  }, [meshRef, selectedObjectId, updateObjectDragLimits, verticalPosition]);

  const handleScaleChange = useCallback((axis: number, value: number) => {
    const clampedValue = Math.max(MIN_SCALE, Math.min(MAX_SCALE, value));
    const newScale = [...scale] as [number, number, number];
    newScale[axis] = clampedValue;
    setScale(newScale);
    setScaleInputs([newScale[0].toFixed(4), newScale[1].toFixed(4), newScale[2].toFixed(4)]);

    // Apply to selectedObject immediately
    if (meshRef && meshRef.current) {
      if (axis === 0) meshRef.current.scale.x = clampedValue;
      else if (axis === 1) meshRef.current.scale.y = clampedValue;
      else if (axis === 2) meshRef.current.scale.z = clampedValue;
      updateObjectLimits();
    }
  }, [meshRef, MAX_SCALE, MIN_SCALE, scale, updateObjectLimits]);

  // Normalize rotation to keep it within -360 to 360 degrees
  const normalizeRotation = useCallback((degrees: number): number => {
    while (degrees > 360) degrees -= 360;
    while (degrees < -360) degrees += 360;
    return degrees;
  }, []);

  const handleRotationChange = useCallback((axis: number, value: number) => {
    const normalizedDegrees = normalizeRotation(value);
    const radians = (normalizedDegrees * Math.PI) / 180;
    const newRotation = [...rotation] as [number, number, number];
    newRotation[axis] = radians;
    setRotation(newRotation);

    // Apply to selectedObject immediately
    if (meshRef && meshRef.current) {
      if (axis === 0) meshRef.current.rotation.x = radians;
      else if (axis === 1) meshRef.current.rotation.y = radians;
      else if (axis === 2) meshRef.current.rotation.z = radians;
      updateObjectLimits();
    }
  }, [meshRef, rotation, updateObjectLimits, normalizeRotation]);

  const handleQuickRotation = useCallback((axis: number, clockwise: boolean) => {
    const currentRotationDegrees = (rotation[axis] * 180) / Math.PI;
    const newRotationDegrees = clockwise
      ? Math.round((currentRotationDegrees + 90) / 90) * 90
      : Math.round((currentRotationDegrees - 90) / 90) * 90;

    handleRotationChange(axis, newRotationDegrees);
  }, [handleRotationChange, rotation]);

  const handleUniformScale = useCallback((value: number) => {
    const clampedValue = Math.max(MIN_SCALE, Math.min(MAX_SCALE, value));
    const stringValue = clampedValue.toFixed(4);
    const newScale: [number, number, number] = [clampedValue, clampedValue, clampedValue];
    setScale(newScale);
    setUniformScale(clampedValue);
    setUniformScaleInput(stringValue);
    setScaleInputs([stringValue, stringValue, stringValue]);
    // Apply to selectedObject immediately
    if (meshRef && meshRef.current) {
      meshRef.current.scale.set(clampedValue, clampedValue, clampedValue);
      updateObjectLimits();
    }
  }, [MIN_SCALE, MAX_SCALE, meshRef, updateObjectLimits]);

  const handleReset = useCallback(() => {
    const scale = initialValues.current.scale;
    const rotation = initialValues.current.rotation;

    setScale(scale);
    setRotation(rotation);
    if (scale[0] == scale[1] && scale[1] == scale[2]) {
      setUniformScale(scale[0]);
      setUniformScaleInput(scale[0].toFixed(4));
    } else {
      setUniformScale(1);
      setUniformScaleInput("1.0000");
    }
    setScaleInputs([scale[0].toFixed(4), scale[1].toFixed(4), scale[2].toFixed(4)]);

    // Apply to selectedObject immediately
    if (meshRef && meshRef.current) {
      meshRef.current.scale.set(scale[0], scale[1], scale[2]);
      meshRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
      updateObjectLimits();
    }
  }, [meshRef, updateObjectLimits]);

  const handleDelete = useCallback(() => {
    if (selectedObjectId) {
      removeObject(selectedObjectId);
    }
  }, [selectedObjectId, removeObject]);

  const handleVerticalPositionChange = useCallback((value: number) => {
    const clampedValue = Math.max(0, Math.min(10, value));
    setVerticalPosition(clampedValue);
    if (meshRef && meshRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current)
      const size = new THREE.Vector3()
      box.getSize(size)
      meshRef.current.position.y -= (box.min.y - clampedValue);
    }
  }, [meshRef]);

  return (
    <div className="z-40 absolute top-[290px] right-5 text-white font-sans text-sm bg-gray-900/90 bg-opacity-90 px-4 py-2 rounded-lg w-[270px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Object Controls</h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Vertical Position */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">
          Vertical Position : {verticalPosition.toFixed(2)}
        </label>
        <input
          type="range"
          min={0}
          max={10}
          step="0.1"
          value={verticalPosition}
          onChange={(e) => handleVerticalPositionChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Uniform Scale */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium">Uniform Scale:</label>
          <input
            type="text"
            value={uniformScaleInput}
            onChange={(e) => {
              setUniformScaleInput(e.target.value);
              setScaleInputs([e.target.value, e.target.value, e.target.value]);
            }}
            onBlur={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value)) {
                handleUniformScale(value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="w-20 px-2 py-1 bg-gray-700 text-white rounded text-xs text-right"
          />
        </div>
        <input
          type="range"
          min={MIN_SCALE}
          max={MAX_SCALE}
          step={`${SCALE_STEP_SIZE}`}
          value={uniformScale}
          onChange={(e) => handleUniformScale(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Individual Scale Controls */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-1 text-white">Individual Scale</h4>
        <div className="grid grid-cols-3 gap-3">
          {['X', 'Y', 'Z'].map((axis, index) => (
            <div key={axis}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs">{axis}:</label>
                <input
                  type="text"
                  value={scaleInputs[index]}
                  onChange={(e) => {
                    const newInputs = [...scaleInputs] as [string, string, string];
                    newInputs[index] = e.target.value;
                    setScaleInputs(newInputs);
                  }}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      handleScaleChange(index, value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-14 px-1 py-0.5 bg-gray-700 text-white rounded text-xs text-right"
                />
              </div>
              <input
                type="range"
                min={MIN_SCALE}
                max={MAX_SCALE}
                step={`${SCALE_STEP_SIZE}`}
                value={scale[index]}
                onChange={(e) => handleScaleChange(index, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick 90° Rotation Controls */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-1 text-white">Quick Rotation (90°)</h4>
        <div className="grid grid-cols-3 gap-3">
          {['X', 'Y', 'Z'].map((axis, index) => (
            <div key={axis} className="text-center">
              <label className="block mb-2 text-xs font-medium">{axis}-Axis</label>
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => handleQuickRotation(index, true)}
                  className="bg-gray-700 hover:bg-gray-600 p-1.5 rounded transition-colors flex items-center justify-center"
                  title={`Rotate ${axis} axis -90°`}
                >
                  <FaRotateLeft />
                </button>
                <button
                  onClick={() => handleQuickRotation(index, false)}
                  className="bg-gray-700 hover:bg-gray-600 p-1.5 rounded transition-colors flex items-center justify-center"
                  title={`Rotate ${axis} axis +90°`}
                >
                  <FaRotateRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fine Rotation Controls */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-1 text-white">Fine Rotation (degrees)</h4>
        <div className="grid grid-cols-1 gap-1">
          {['X', 'Y', 'Z'].map((axis, index) => (
            <div key={axis} className="flex gap-1 items-center">
              <label className="block mb-1 text-xs w-16">
                {axis}: {Math.round(normalizeRotation((rotation[index] * 180) / Math.PI))}°
              </label>
              <input
                type="range"
                min="-360"
                max="360"
                step={rotationStepSize}
                value={normalizeRotation((rotation[index] * 180) / Math.PI)}
                onChange={(e) => handleRotationChange(index, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors text-sm"
        >
          Reset
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors text-sm"
        >
          Delete
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-400 w-full h-auto">
        <div>
          🔧 Double-click object to open controls<br />
          🔧 Alt+C to close the ObjectControls<br />
          🔄 Click rotation icons for 90° turns
        </div>
      </div>
    </div>
  );
});

export default ObjectControls;