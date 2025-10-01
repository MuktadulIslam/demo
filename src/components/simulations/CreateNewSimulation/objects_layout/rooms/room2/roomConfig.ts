import { RoomConfig } from "./types"

export function getRoomConfig(width: number, length: number): RoomConfig {
    const roomLength = length || 15;
    const wallThickness = 0.2;
    const frontWallLength = roomLength + wallThickness * 2; // Total wall length including thickness
    const doorWidth = 3; // Wide double door
    
    // Calculate center position: (wall length - door width) / 2
    const centerFromLeftSide = (frontWallLength - doorWidth) / 2;
    
    return {
        dimensions: {
            length: roomLength,
            width: width || 10,
            height: 5
        },
        colors: {
            floor: "#ffffff",           // Clean white floor (uniform color)
            alternateFloor: "#ffffff",  // Same as floor since no alternating pattern
            ceiling: "#f0f0f0",         // Light grey ceiling with recessed lighting
            walls: "#cab79c"            // Updated wall color - warm beige
        },
        // Clean room with minimal openings - main glass entrance door (centered) and back door
        doors: [
            {
                id: 'main-glass-door',
                wall: 'front' as const,
                fromLeftSide: centerFromLeftSide, // Always centered on wall
                fromFloor: 0, // At floor level
                width: doorWidth,
                height: 4,
                color: '#87CEEB' // Glass color
            },
            {
                id: 'back-door',
                wall: 'back' as const,
                fromLeftSide: 10, // Centered on back wall
                fromFloor: 0, // At floor level
                width: 2.4, // Standard interior door width
                height: 4, // Standard door height
                color: '#8B4513' // Wood brown color
            }
        ],
        windows: [
            {
                id: 'left-window',
                wall: 'left',
                fromLeftSide: 10,
                fromFloor: 1,
                width: 3,
                height: 2,
                color: '#B0E0E6',
                frameColor: '#333333',
                frameThickness: 0.1
            },
            {
                id: 'right-window',
                wall: 'right',
                fromLeftSide: 4,
                fromFloor: 1,
                width: 3,
                height: 2,
                color: '#B0E0E6',
                frameColor: '#333333',
                frameThickness: 0.1
            }
        ],
        wallDecorations: [
            {
                id: 'wall-poster',
                wall: 'left',
                fromLeftSide: 5,
                fromFloor: 1.5,
                width: 0.7,
                height: 1.2,
                type: 'picture',
                imagePath: "/posters/poster1.jpeg"
            },
            {
                id: 'wall-poster',
                wall: 'left',
                fromLeftSide: 5.8,
                fromFloor: 1.9,
                width: 0.7,
                height: 1.2,
                type: 'picture',
                imagePath: "/posters/poster2.jpg"
            },
            {
                id: 'wall-poster',
                wall: 'left',
                fromLeftSide: 6.6,
                fromFloor: 1.4,
                width: 0.7,
                height: 1.2,
                type: 'picture',
                imagePath: "/posters/poster3.jpg"
            },
            {
                id: 'wall-poster',
                wall: 'left',
                fromLeftSide: 7.4,
                fromFloor: 1.7, 
                width: 0.7,
                height: 1.2,
                type: 'picture',
                imagePath: "/posters/poster4.jpg"
            },

            {
                id: 'wall-poster',
                wall: 'back',
                fromLeftSide: 2.8,
                fromFloor: 1.9,
                width: 0.7,
                height: 1.2,
                type: 'picture',
                imagePath: "/posters/poster5.jpg"
            },
            {
                id: 'wall-poster',
                wall: 'back',
                fromLeftSide: 3.6,
                fromFloor: 1.4,
                width: 0.7, 
                height: 1.2, 
                type: 'picture',
                imagePath: "/posters/poster6.jpg"
            },
            {
                id: 'wall-poster',
                wall: 'back',
                fromLeftSide: 4.4,
                fromFloor: 1.7,
                width: 0.7,
                height: 1.2, 
                type: 'picture',
                imagePath: "/posters/poster7.jpg"
            }
        ]
    };
}