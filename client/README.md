# VibeCoder Drawing Board

A powerful, feature-rich drawing and design component for the VibeCoder application.

## Features

- **Shape Drawing**: Create rectangles, circles, lines, and free-form paths
- **Text Tool**: Add and edit text with different fonts and sizes
- **Image Tool**: Upload and manipulate images
- **Selection Tool**: Select, move, and resize shapes
- **Eraser Tool**: Remove unwanted elements
- **Styling Controls**: Change stroke color, fill color, stroke width, and opacity
- **Undo/Redo**: Track changes with history management
- **Code Generation**: Convert drawings to HTML/CSS/React code
- **Save Projects**: Save and load projects from the database
- **Auto-save**: Automatically save changes to prevent data loss
- **Canvas Resizing**: Adjust canvas dimensions
- **Zoom Functionality**: Zoom in and out for detail work

## How to Use

1. **Select a Tool**: Choose from the toolbar at the top of the drawing board.
2. **Draw**: Click and drag on the canvas to create shapes.
3. **Select and Edit**: Use the select tool to click on elements and modify them.
4. **Style**: Use the right panel to change colors, sizes, and other properties.
5. **Save**: Save your drawing to a project using the Save button.
6. **Generate Code**: Convert your design to code using the Generate Code button.

## Component Structure

The DrawingBoard is implemented as a React component with the following key parts:

- **Toolbar**: Contains drawing tools and actions
- **Canvas**: The main drawing area
- **Properties Panel**: Displays and edits selected element properties
- **Styles Panel**: Controls global style settings
- **Dialogs**: For text input, canvas size, code generation, etc.

## Implementation Details

- Built with React and Material-UI
- Uses React state for managing drawing data
- Implements custom intersection and distance algorithms for shape selection
- Includes code generation for HTML, CSS, and React
- Features comprehensive project saving and loading

## Future Enhancements

- Layer management for complex drawings
- Group/ungroup functionality
- More shape types (arrows, stars, etc.)
- Advanced styling options (gradients, patterns)
- Collaborative editing
- Export to different image formats
