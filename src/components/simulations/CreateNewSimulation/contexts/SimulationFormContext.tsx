"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { DialogFlowNode, DialogFlowEdge } from '@/components/reactflow/types';
import { SimulationBasicInfoForm } from '@/types/simulations';
import { convertFlowToChat } from '@/utils/generateChatFlow';
import { useCreateSimulation } from '@/lib/hooks/simulationHook';
import { newSimulationStorage } from '@/utils/storage_name';
import { deleteNewSimulationStoredData, LocalStorageContext } from '@/lib/redux/LocalStorageContext';
import { config as appConfig } from '@/config';
import { useAppSelector } from '@/lib/redux/store';
import { useMeshContext } from '../objects_layout/canvas/context/MeshContext';
import { uploadMultipleGlbToAzure } from '../objects_layout/utils/uploadGlbToAzure';
import { SimulationFormContextType } from './type';
import { initialNodesTemplate, getSimulationBasicInitialValues } from './utils';


const SimulationFormContext = createContext<SimulationFormContextType | undefined>(undefined);

export const useSimulationForm = () => {
    const context = useContext(SimulationFormContext);
    if (!context) {
        throw new Error('useSimulationForm must be used within a SimulationFormProvider');
    }
    return context;
};

export function SimulationFormProvider({ children }: { children: ReactNode }) {
    const { isLocalStorageRemoved } = useAppSelector(state => state.localStorageState);
    const { objects } = useMeshContext();
    
    const [currentPage, setCurrentPage] = useState(0);
    const [updatedNodes, setUpdatedNodes] = useState<DialogFlowNode[]>(initialNodesTemplate);
    const [updatedEdges, setUpdatedEdges] = useState<DialogFlowEdge[]>([]);
    const [initialNodes, setInitialNodes] = useState<DialogFlowNode[]>(initialNodesTemplate);
    const [initialEdges, setInitialEdges] = useState<DialogFlowEdge[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogErrors, setDialogErrors] = useState<string[]>([]);
    const [tipsOpen, setTipsOpen] = useState(true);
    const [dataLoading, setDataLoading] = useState<boolean>(true);
    
    const createSimulation = useCreateSimulation();
    const router = useRouter();
    const { readFromLocalStorage, saveToLocalStorageAsync } = useContext(LocalStorageContext);
    
    const form = useForm<SimulationBasicInfoForm>({
        defaultValues: {
            program_affiliation: '',
            scenario_name: '',
            scenario_overview: '',
            scenario_description: '',
            scenario_related_details: '',
            simulation_title: '',
            simulation_description: '',
            simulation_objectives: [],
            avatar_designation: '',
            show_evaluation_panel: false,
        },
        mode: 'onChange'
    });

    const { register, reset, trigger, watch } = form;

    // Initialize data from localStorage
    useEffect(() => {
        try {
            reset(getSimulationBasicInitialValues(readFromLocalStorage));
            const oldNodes = readFromLocalStorage(newSimulationStorage.chat_dialog_nodes);
            const oldEdges = readFromLocalStorage(newSimulationStorage.chat_dialog_edges);

            if (oldNodes != null) {
                setUpdatedNodes(JSON.parse(oldNodes));
                setInitialNodes(JSON.parse(oldNodes));
            } else {
                setUpdatedNodes(initialNodesTemplate);
                setInitialNodes(initialNodesTemplate);
            }
            
            if (oldEdges != null) {
                setUpdatedEdges(JSON.parse(oldEdges));
                setInitialEdges(JSON.parse(oldEdges));
            } else {
                setUpdatedEdges([]);
                setInitialEdges([]);
            }
            
            setDataLoading(false);
            setCurrentPage(0);
        } catch (error) {
            console.error('Error loading autosaved data:', error);
        }
    }, [isLocalStorageRemoved, readFromLocalStorage, reset]);

    // Re-read from localStorage when the removal flag changes
    useEffect(() => {
        if (isLocalStorageRemoved) {
            reset(getSimulationBasicInitialValues(readFromLocalStorage));
        }
    }, [isLocalStorageRemoved, readFromLocalStorage, reset]);

    // Register simulation_objectives with validation
    useEffect(() => {
        register("simulation_objectives", {
            required: "At least one simulation objective is required",
            validate: (value) => (value && value.length > 0) || "At least one simulation objective is required"
        });
    }, [register]);

    // Auto-save nodes to localStorage
    useEffect(() => {
        if (!dataLoading) {
            const timeoutId = setTimeout(() => {
                saveToLocalStorageAsync(newSimulationStorage.chat_dialog_nodes, JSON.stringify(updatedNodes));
            }, appConfig.localStorageSavingDuration);
            return () => clearTimeout(timeoutId);
        }
    }, [updatedNodes, dataLoading, saveToLocalStorageAsync]);

    // Auto-save edges to localStorage
    useEffect(() => {
        if (!dataLoading) {
            const timeoutId = setTimeout(() => {
                saveToLocalStorageAsync(newSimulationStorage.chat_dialog_edges, JSON.stringify(updatedEdges));
            }, appConfig.localStorageSavingDuration);
            return () => clearTimeout(timeoutId);
        }
    }, [updatedEdges, dataLoading, saveToLocalStorageAsync]);

    // Clear dialog errors when nodes are updated
    useEffect(() => {
        setDialogErrors([]);
    }, [updatedNodes]);

    const validateDialogNodes = (): string[] => {
        const errors: string[] = [];

        if (updatedNodes.length === 0) {
            return [];
        }

        let numberOfHumanNode = 0, numberOfAvatarNode = 0;

        updatedNodes.forEach((node) => {
            if (node.data.dialog.trim() === '') {
                if (node.data.speaker === 'A') numberOfAvatarNode++;
                else numberOfHumanNode++;
            }
        });

        const targetNodeIds = updatedEdges.map(edge => edge.target);
        const orphanedNodes = updatedNodes.filter(node =>
            !node.data.isFirstNode && !targetNodeIds.includes(node.id)
        );

        if (orphanedNodes.length > 0) {
            errors.push(`${orphanedNodes.length} node(s) are disconnected from the conversation flow`);
        }

        const humanNodes = updatedNodes.filter(node => node.data.speaker === 'V');
        humanNodes.forEach(humanNode => {
            const outgoingEdges = updatedEdges.filter(edge => edge.source === humanNode.id);
            let avatarResponseCount = 0;
            
            outgoingEdges.forEach(edge => {
                const targetNode = updatedNodes.find(node => node.id === edge.target);
                if (targetNode && targetNode.data.speaker === 'A') {
                    avatarResponseCount++;
                }
            });

            if (avatarResponseCount === 0) {
                errors.push(`Human node "${humanNode.data.dialog.substring(0, 20)}..." has no avatar response`);
            } else if (avatarResponseCount > 1) {
                errors.push(`Human node "${humanNode.data.dialog.substring(0, 20)}..." has ${avatarResponseCount} avatar responses, but should have exactly one`);
            }
        });

        if (numberOfAvatarNode > 0) errors.push(`${numberOfAvatarNode > 1 ? 'Some' : ''} Avatar node ${numberOfAvatarNode > 1 ? 'have' : 'has an'} empty dialog field`);
        if (numberOfHumanNode > 0) errors.push(`${numberOfHumanNode > 1 ? 'Some' : ''} Human node ${numberOfHumanNode > 1 ? 'have' : 'has an'} empty dialog field`);

        return errors;
    };

    const validateCurrentPage = async (): Promise<boolean> => {
        let fieldsToValidate: string[] = [];

        if (currentPage === 0) {
            fieldsToValidate = [
                'program_affiliation',
                'scenario_name',
                'scenario_overview',
                'scenario_description',
                'scenario_related_details',
                'simulation_title',
                'simulation_description',
                'simulation_objectives',
                'avatar_designation'
            ];
        }

        const result = await trigger(fieldsToValidate as (keyof SimulationBasicInfoForm)[]);

        if (currentPage === 1) {
            const emptyDialogNodes = validateDialogNodes();
            if (emptyDialogNodes.length > 0) {
                setDialogErrors(emptyDialogNodes);
                setTimeout(() => setDialogErrors([]), 5000);
                return false;
            }
        }

        return result;
    };

    const handleNextByProgressIndicator = async (newPageNo: number): Promise<void> => {
        if (newPageNo > currentPage) {
            for (let i = currentPage; i < newPageNo; i++) {
                setCurrentPage(i);
                const isValid = await validateCurrentPage();
                if (!isValid) {
                    return;
                }
            }
        }
        setCurrentPage(newPageNo);
    };

    const handleNext = async (): Promise<void> => {
        const isValid = await validateCurrentPage();
        if (isValid) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevious = (): void => {
        setCurrentPage(prev => prev - 1);
    };

    const handleFormSubmit = async (): Promise<void> => {
        try {
            // setIsSubmitting(true);

            // const dateNow = Date.now().toString();
            // const refs = objects.map((obj, index) => ({
            //     fileName: `object${index}-${dateNow}.glb`,
            //     ref: obj.meshRef
            // }));
            
            // const isSuccessful = await uploadMultipleGlbToAzure(refs);
            // if (!isSuccessful) {
            //     alert('Error uploading files to Azure platform!');
            //     throw new Error('File upload failed');
            // }

            console.log(objects.map((obj)=> obj.position))

            // const { program_affiliation_details, ...dataToSubmit } = watch();
            // void program_affiliation_details;

            // const result = await createSimulation.mutateAsync({
            //     ...dataToSubmit,
            //     chats: convertFlowToChat(updatedNodes, updatedEdges)
            // });

            // if (result) {
            //     alert('Simulation created successfully!');
            //     deleteNewSimulationStoredData();
            //     router.push(`/simulations/maxview/${result.simulation_id}`);
            // }
        } catch (error) {
            alert(`Error creating simulation: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const contextValue: SimulationFormContextType = {
        form,
        currentPage,
        setCurrentPage,
        handleNext,
        handlePrevious,
        handleNextByProgressIndicator,
        updatedNodes,
        updatedEdges,
        initialNodes,
        initialEdges,
        setUpdatedNodes,
        setUpdatedEdges,
        dialogErrors,
        validateCurrentPage,
        validateDialogNodes,
        tipsOpen,
        setTipsOpen,
        dataLoading,
        isSubmitting,
        handleFormSubmit,
    };

    return (
        <SimulationFormContext.Provider value={contextValue}>
            {children}
        </SimulationFormContext.Provider>
    );
};