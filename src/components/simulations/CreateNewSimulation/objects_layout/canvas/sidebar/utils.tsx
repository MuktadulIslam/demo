import { DraggableObjectGroup } from "./types";
import BoxObject from "../../objects/BoxObject"
import Car from "../../objects/Car"
import CarModel from "../../objects/Car2"
import Chair from "../../objects/Chair"
import ChildrenTableModel from "../../objects/ChildrenTableModel"
import CustomObject from "../../objects/CustomObject"
import Table from "../../objects/Table"
import TableModel from "../../objects/TableModel"
import DeskSign from "../../objects/craftxr/DeskSign"
import DisabilityButton from "../../objects/craftxr/DisabilityButton"
import FaxMachine from "../../objects/craftxr/FaxMachine"
import Keyboard from "../../objects/craftxr/Keyboard"
import Monitor from "../../objects/craftxr/Monitor"
import Monstera from "../../objects/craftxr/Monstera"
import Mouse from "../../objects/craftxr/Mouse"
import MudMat from "../../objects/craftxr/MudMat"
import OldRecepDesk from "../../objects/craftxr/OldRecepDesk"
import Pen from "../../objects/craftxr/Pen"
import Printer from "../../objects/craftxr/Printer"
import ReceptionDesk from "../../objects/craftxr/ReceptionDesk"
import Succulent from "../../objects/craftxr/Succulent"
import TissueBox from "../../objects/craftxr/TissueBox"
import WaitingBench from "../../objects/craftxr/WaitingBench"
import Wheelchair from "../../objects/craftxr/Wheelchair"
import { SelectableObjectRef } from "../types";

export const sidebarStaticObjectGroups: DraggableObjectGroup[] = [
    {
        id: 'vehicles',
        name: 'Vehicles',
        icon: '🚗',
        color: 'from-blue-500 to-cyan-500',
        objects: [
            {
                id: 'car_001',
                componentFactory: (meshRef: SelectableObjectRef) => <Car meshRef={meshRef} />,
                name: 'Car',
                icon: '🚗',
                description: 'Simple car object'
            },
            {
                id: 'car_002',
                componentFactory: (meshRef: SelectableObjectRef) => <CarModel meshRef={meshRef} />,
                name: 'GLB Car Model',
                icon: '🏎️',
                description: 'Detailed car model'
            }
        ]
    },
    {
        id: 'furniture',
        name: 'Furniture',
        icon: '🪑',
        color: 'from-amber-500 to-orange-500',
        objects: [
            {
                id: 'table_003',
                componentFactory: (meshRef: SelectableObjectRef) => <Table meshRef={meshRef} />,
                name: 'Table',
                icon: '🪑',
                description: 'Basic table geometry'
            },
            {
                id: 'table_004',
                componentFactory: (meshRef: SelectableObjectRef) => <TableModel meshRef={meshRef} />,
                name: 'GLB Table Model',
                icon: '🗂️',
                description: 'Detailed table model'
            },
            {
                id: 'table_005',
                componentFactory: (meshRef: SelectableObjectRef) => <ChildrenTableModel meshRef={meshRef} />,
                name: 'GLB Children Table',
                icon: '🧸',
                description: 'Child-sized table model'
            },
            {
                id: 'chair_006',
                componentFactory: (meshRef: SelectableObjectRef) => <Chair meshRef={meshRef} />,
                name: 'Chair',
                icon: '💺',
                description: 'Basic chair geometry'
            }
        ]
    },
    {
        id: 'primitives',
        name: 'Primitives',
        icon: '📦',
        color: 'from-green-500 to-emerald-500',
        objects: [
            {
                id: 'box_007',
                componentFactory: (meshRef: SelectableObjectRef) => <BoxObject meshRef={meshRef} />,
                name: 'Box',
                icon: '📦',
                description: 'Basic cube geometry'
            }
        ]
    },
    {
        id: 'custom',
        name: 'Custom',
        icon: '⚡',
        color: 'from-purple-500 to-pink-500',
        objects: [
            {
                id: 'custom_008',
                componentFactory: (meshRef: SelectableObjectRef) => <CustomObject meshRef={meshRef} />,
                name: 'Custom Object',
                icon: '⚡',
                description: 'Custom 3D object'
            }
        ]
    },
    {
        id: 'xr-models',
        name: 'XR-Models',
        icon: '🏢',
        color: 'from-indigo-500 to-purple-500',
        objects: [
            {
                id: 'desk_sign_009',
                componentFactory: (meshRef: SelectableObjectRef) => <DeskSign meshRef={meshRef} />,
                name: 'Desk Sign',
                icon: '🪧',
                description: 'Desktop nameplate or information sign'
            },
            {
                id: 'disability_button_010',
                componentFactory: (meshRef: SelectableObjectRef) => <DisabilityButton meshRef={meshRef} />,
                name: 'Accessibility Button',
                icon: '♿',
                description: 'Disability access button for doors'
            },
            {
                id: 'fax_machine_011',
                componentFactory: (meshRef: SelectableObjectRef) => <FaxMachine meshRef={meshRef} />,
                name: 'Fax Machine',
                icon: '📠',
                description: 'Office fax machine'
            },
            {
                id: 'keyboard_012',
                componentFactory: (meshRef: SelectableObjectRef) => <Keyboard meshRef={meshRef} />,
                name: 'Keyboard',
                icon: '⌨️',
                description: 'Computer keyboard'
            },
            {
                id: 'monitor_013',
                componentFactory: (meshRef: SelectableObjectRef) => <Monitor meshRef={meshRef} />,
                name: 'Monitor',
                icon: '🖥️',
                description: 'Computer display monitor'
            },
            {
                id: 'monstera_014',
                componentFactory: (meshRef: SelectableObjectRef) => <Monstera meshRef={meshRef} />,
                name: 'Monstera Plant',
                icon: '🌱',
                description: 'Decorative monstera house plant'
            },
            {
                id: 'mouse_015',
                componentFactory: (meshRef: SelectableObjectRef) => <Mouse meshRef={meshRef} />,
                name: 'Computer Mouse',
                icon: '🖱️',
                description: 'Computer pointing device'
            },
            {
                id: 'mud_mat_016',
                componentFactory: (meshRef: SelectableObjectRef) => <MudMat meshRef={meshRef} />,
                name: 'Floor Mat',
                icon: '🧽',
                description: 'Entrance floor mat'
            },
            {
                id: 'old_reception_desk_017',
                componentFactory: (meshRef: SelectableObjectRef) => <OldRecepDesk meshRef={meshRef} />,
                name: 'Vintage Reception Desk',
                icon: '🗃️',
                description: 'Classic style reception desk'
            },
            {
                id: 'pen_018',
                componentFactory: (meshRef: SelectableObjectRef) => <Pen meshRef={meshRef} />,
                name: 'Pen',
                icon: '🖊️',
                description: 'Writing pen'
            },
            {
                id: 'printer_019',
                componentFactory: (meshRef: SelectableObjectRef) => <Printer meshRef={meshRef} />,
                name: 'Printer',
                icon: '🖨️',
                description: 'Office printer'
            },
            {
                id: 'reception_desk_020',
                componentFactory: (meshRef: SelectableObjectRef) => <ReceptionDesk meshRef={meshRef} />,
                name: 'Reception Desk',
                icon: '🏪',
                description: 'Modern reception desk'
            },
            {
                id: 'succulent_021',
                componentFactory: (meshRef: SelectableObjectRef) => <Succulent meshRef={meshRef} />,
                name: 'Succulent Plant',
                icon: '🌵',
                description: 'Small decorative succulent'
            },
            {
                id: 'tissue_box_022',
                componentFactory: (meshRef: SelectableObjectRef) => <TissueBox meshRef={meshRef} />,
                name: 'Tissue Box',
                icon: '📄',
                description: 'Box of tissues'
            },
            {
                id: 'waiting_bench_023',
                componentFactory: (meshRef: SelectableObjectRef) => <WaitingBench meshRef={meshRef} />,
                name: 'Waiting Bench',
                icon: '🪑',
                description: 'Seating bench for waiting areas'
            },
            {
                id: 'wheelchair_024',
                componentFactory: (meshRef: SelectableObjectRef) => <Wheelchair meshRef={meshRef} />,
                name: 'Wheelchair',
                icon: '♿',
                description: 'Mobility wheelchair'
            }
        ]
    }
];