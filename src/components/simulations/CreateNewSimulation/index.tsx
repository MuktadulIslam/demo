"use client"
import React from 'react';
import { RoomProvider } from './objects_layout/canvas/context/RoomDimensionsContext';
import { MeshProvider } from './objects_layout/canvas/context/MeshContext';
import { SimulationFormProvider } from './contexts/SimulationFormContext';
import SimulationHeader from './components/SimulationHeader';
import ProgressIndicator from './components/ProgressIndicator';
import DialogErrorsAlert from './components/DialogErrorsAlert';
import PageContentSlider from './components/PageContentSlider';
import SimulationsUserManualTips from './components/SimulationsUserManualTips';
import { useSimulationForm } from './contexts/SimulationFormContext';

function CreateNewSimulationContent(){
    const {
        currentPage,
        handleNext,
        handlePrevious,
        handleFormSubmit,
        isSubmitting,
        handleNextByProgressIndicator,
        dialogErrors,
        tipsOpen,
        setTipsOpen
    } = useSimulationForm();

    return (
        <div className="w-full max-w-container h-full flex flex-col bg-white mx-auto text-black">
            <SimulationHeader />

            <ProgressIndicator
                currentPage={currentPage}
                onPageChange={handleNextByProgressIndicator}
            />

            <SimulationsUserManualTips
                currentPage={currentPage}
                isOpen={tipsOpen}
                setIsOpen={setTipsOpen}
            />

            {/* Dialog Errors Alert - Only show when trying to navigate from page 1 to 2 */}
            <DialogErrorsAlert
                errors={dialogErrors}
                show={currentPage === 1}
            />

            <PageContentSlider />

            <div className="w-full h-16 flex justify-between px-5 py-2">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 0}
                    className="w-32 h-full p-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
                >
                    Previous
                </button>

                {currentPage >= 3 ? (
                    <button
                        onClick={handleFormSubmit}
                        disabled={isSubmitting}
                        className="w-32 h-full p-2 bg-green-600 text-white rounded disabled:bg-green-500 flex items-center justify-center"
                    >
                        {isSubmitting ? 'Loading...' : 'Submit'}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="w-32 h-full p-2 bg-blue-600 text-white rounded"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};

export default function CreateNewSimulation() {
    return (
        // <RoomProvider initialDimensions={{ width: 35, length: 35, height: 6 }}>
        <RoomProvider initialDimensions={{ width: 22, length: 14, height: 5 }}>
            <MeshProvider>
                <SimulationFormProvider>
                    <CreateNewSimulationContent />
                </SimulationFormProvider>
            </MeshProvider>
        </RoomProvider>
    );
}