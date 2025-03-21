import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, Paper, Tabs, Tab, Typography, IconButton, Button, Alert, Snackbar, Popover, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Tooltip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { saveDrawing, updateDrawing, getProject } from '../../services/projectService';
import SaveToProjectButton from '../SaveToProjectButton';
import SaveIcon from '@mui/icons-material/Save';

// Import drawing board components
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import PropertyPanel from './PropertyPanel';
import ShapeControls from './ShapeControls';
import TextControls from './TextControls';
import ImageControls from './ImageControls';
import ComponentControls from './ComponentControls';
import CodeGenerator from './CodeGenerator';
import ColorPicker from './ColorPicker';

/**
 * Main DrawingBoard component
 * This component coordinates all the other components and manages the global state
 */
const DrawingBoard = () => {
  const { projectId: urlProjectId, drawingId: urlDrawingId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const previewIframeRef = useRef(null);

  // Add state for project and drawing IDs
  const [projectId, setProjectId] = useState(urlProjectId);
  const [drawingId, setDrawingId] = useState(urlDrawingId);

  // Canvas options state
  const [canvasOptions, setCanvasOptions] = useState({
    width: 1200,
    height: 800,
    canvasColor: '#ffffff',
    strokeColor: '#000000',
    fillColor: 'rgba(173, 216, 230, 0.5)',
    strokeWidth: 2,
    opacity: 1,
    textStyle: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      textDecoration: 'none'
    },
    zoom: 1,
    gridSize: 20,
    showGrid: true
  });

  // Tools state
  const [tool, setTool] = useState('select');
  
  // Drawing elements state
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);
  
  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // UI state
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Color picker state
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [colorPickerType, setColorPickerType] = useState('stroke');
  const [tempColor, setTempColor] = useState('#000000');
  const [editingTextId, setEditingTextId] = useState(null);

  // Right panel tab state
  const [rightPanelTab, setRightPanelTab] = useState('properties');

  // Get the selected element object from its ID
  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  // Load drawing from project if projectId and drawingId are provided
  useEffect(() => {
    if (projectId && drawingId) {
      const loadProjectData = async () => {
        try {
          setSaveStatus('Loading project data...');
          const project = await getProject(projectId);
          
          if (project && project.drawings) {
            const drawing = project.drawings.find(d => d._id === drawingId);
            
            if (drawing && drawing.content) {
              // Load the drawing data
              const content = JSON.parse(drawing.content);
              
              // Update states from the content
              if (content.canvasOptions) setCanvasOptions(content.canvasOptions);
              if (content.elements) setElements(content.elements);
              
              // Reset the unsaved changes flag
              setUnsavedChanges(false);
              setSaveStatus('Drawing loaded successfully!');
              setTimeout(() => setSaveStatus(''), 3000);
            }
          }
        } catch (error) {
          console.error('Error loading project:', error);
          setSaveStatus('Error loading project: ' + error.message);
        }
      };
      
      loadProjectData();
    }
  }, [projectId, drawingId]);
  
  // Auto-save functionality
  useEffect(() => {
    let autoSaveTimer;
    
    if (autoSaveEnabled && unsavedChanges && projectId && drawingId) {
      autoSaveTimer = setTimeout(() => {
        handleSaveToProject();
      }, 30000); // Auto-save after 30 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [unsavedChanges, autoSaveEnabled, projectId, drawingId]);
  
  // Warn before leaving if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges]);
  
  // Add element to history whenever it changes
  useEffect(() => {
    if (elements.length > 0 && !drawing) {
      // Add current state to history
      const newHistory = [...history.slice(0, historyIndex + 1), elements];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [elements]);
  
  // Mark as unsaved
  const markAsUnsaved = () => {
    setUnsavedChanges(true);
  };

  // Handle undo action
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
      markAsUnsaved();
    }
  };

  // Handle redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
      markAsUnsaved();
    }
  };

  // Handle delete selected element
  const handleDeleteSelected = () => {
    if (selectedElementId) {
      setElements(prevElements => prevElements.filter(el => el.id !== selectedElementId));
      setSelectedElementId(null);
      markAsUnsaved();
    }
  };
  
  // Clear the canvas
  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
      setElements([]);
      setSelectedElementId(null);
      setHistory([[]]);
      setHistoryIndex(0);
      markAsUnsaved();
    }
  };
  
  // Handle text editing
  const handleTextEdit = (elementId, newText) => {
    setElements(prev => prev.map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          data: {
            ...el.data,
            text: newText
          }
        };
      }
      return el;
    }));
    markAsUnsaved();
  };

  // Handle double click for text editing
  const handleDoubleClick = (elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (element?.type === 'text') {
      setEditingTextId(elementId);
    }
  };

  // Handle text input blur
  const handleTextInputBlur = () => {
    setEditingTextId(null);
  };

  // Handle text input change
  const handleTextInputChange = (e, elementId) => {
    handleTextEdit(elementId, e.target.value);
  };

  // Handle component text editing
  const handleUpdateComponentProperty = (elementId, property, value) => {
    setElements(prev => prev.map(el =>
      el.id === elementId ? {
        ...el,
        data: {
          ...el.data,
          [property]: value
        }
      } : el
    ));
    markAsUnsaved();
  };

  // Handle adding text
  const handleAddText = () => {
    const newText = {
      id: Date.now().toString(),
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      data: {
        text: 'Double click to edit',
        color: canvasOptions.strokeColor,
        fontFamily: canvasOptions.textStyle?.fontFamily || 'Arial, sans-serif',
        fontSize: canvasOptions.textStyle?.fontSize || 16,
        fontWeight: canvasOptions.textStyle?.fontWeight || 'normal',
        fontStyle: canvasOptions.textStyle?.fontStyle || 'normal',
        textAlign: canvasOptions.textStyle?.textAlign || 'left'
      }
    };
    setElements(prev => [...prev, newText]);
    markAsUnsaved();
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newElement = {
          id: Date.now().toString(),
          type: 'image',
          x: 50,
          y: 50,
          width: Math.min(img.width, 300),
          height: Math.min(img.height, 300) * (Math.min(img.width, 300) / img.width),
          data: {
            image: img,
            src: e.target.result
          }
        };
        
        setElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
        markAsUnsaved();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle saving project
  const handleSaveToProject = async (project = null) => {
    try {
      setSaveStatus('Saving...');

      // Prepare drawing data
      const drawingData = {
        canvasOptions,
        elements: elements.map(el => {
          if (el.type === 'image') {
            // Don't serialize the actual image element
            return {
              ...el,
              data: {
                ...el.data,
                image: null
              }
            };
          }
          return el;
        })
      };

      const drawingStr = JSON.stringify(drawingData);

      if (drawingId) {
        // Update existing drawing
        await updateDrawing(drawingId, drawingStr);
      } else if (project) {
        // Save to selected project
        const newDrawing = await saveDrawing(project._id, {
          name: 'Drawing',
          content: drawingStr
        });
        setDrawingId(newDrawing._id);
        setProjectId(project._id);
      } else if (projectId) {
        // Save to current project
        const newDrawing = await saveDrawing(projectId, {
          name: 'Drawing',
          content: drawingStr
        });
        setDrawingId(newDrawing._id);
      } else {
        throw new Error('No project selected for saving');
      }

      setUnsavedChanges(false);
      setSaveStatus('Saved successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving drawing:', error);
      setSaveStatus('Error saving');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Handle tool change
  const handleToolChange = (newTool) => {
    setTool(newTool);
    if (newTool !== 'select') {
      setSelectedElementId(null);
    }
  };

  // Handle element selection
  const handleSelectElement = (elementId) => {
    setSelectedElementId(elementId);
  };

  // Handle updating an element
  const handleUpdateElement = (updatedElement) => {
    const updatedElements = elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    );
    setElements(updatedElements);
    markAsUnsaved();
  };

  // Handle adding a new element to the canvas
  const handleAddElement = (newElement) => {
    setElements(prev => [...prev, newElement]);
    markAsUnsaved();
  };

  // Upload image
  const handleUploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const img = new Image();
          img.src = loadEvent.target.result;
          img.onload = () => {
            // Calculate reasonable dimensions (don't exceed canvas)
            let imgWidth = img.width;
            let imgHeight = img.height;
            
            // Scale down if needed
            const maxWidth = canvasOptions.width * 0.7;
            const maxHeight = canvasOptions.height * 0.7;
            
            if (imgWidth > maxWidth) {
              const ratio = maxWidth / imgWidth;
              imgWidth = maxWidth;
              imgHeight = imgHeight * ratio;
            }
            
            if (imgHeight > maxHeight) {
              const ratio = maxHeight / imgHeight;
              imgHeight = maxHeight;
              imgWidth = imgWidth * ratio;
            }
            
            const newImage = {
              id: `image-${Date.now()}`,
              type: 'image',
              x: (canvasOptions.width / 2) - (imgWidth / 2),
              y: (canvasOptions.height / 2) - (imgHeight / 2),
              width: imgWidth,
              height: imgHeight,
              data: {
                src: loadEvent.target.result,
                opacity: 1,
                objectFit: 'contain'
              }
            };
            
            // Create the actual image element for rendering
            const imageElement = new Image();
            imageElement.src = loadEvent.target.result;
            imageElement.onload = () => {
              // Add the image element to the data object
              newImage.data.imageElement = imageElement;
              handleAddElement(newImage);
              setSelectedElementId(newImage.id);
            };
          };
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Handle adding a component to the canvas
  const handleAddComponent = (componentType) => {
    const id = `component-${Date.now()}`;
    const centerX = (canvasOptions.width / 2) - 75; // Center X with 150px width
    const centerY = (canvasOptions.height / 2) - 40; // Center Y with 80px height
    
    // Create the component data structure
    let componentData = {
      componentType: componentType,
      style: {
        backgroundColor: '#ffffff',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 4,
        color: '#000000',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif'
      }
    };
    
    // Set type-specific properties
    switch (componentType) {
      case 'button':
        componentData = {
          ...componentData,
          text: 'Button',
          variant: 'contained',
          color: 'primary',
          style: {
            ...componentData.style,
            backgroundColor: '#1976d2',
            color: '#ffffff'
          }
        };
        break;
        
      case 'input':
        componentData = {
          ...componentData,
          label: 'Input Field',
          placeholder: 'Enter text...',
          variant: 'outlined'
        };
        break;
        
      case 'card':
        componentData = {
          ...componentData,
          title: 'Card Title',
          content: 'Card content goes here...',
          style: {
            ...componentData.style,
            borderRadius: 8,
            borderWidth: 0,
            backgroundColor: '#ffffff',
            boxShadow: true
          }
        };
        break;
        
      case 'checkbox':
        componentData = {
          ...componentData,
          label: 'Checkbox',
          checked: false
        };
        break;
        
      case 'radio':
        componentData = {
          ...componentData,
          label: 'Radio Button',
          selected: false
        };
        break;
        
      case 'slider':
        componentData = {
          ...componentData,
          min: 0,
          max: 100,
          value: 0.5,
          step: 1
        };
        break;
        
      case 'list':
        componentData = {
          ...componentData,
          items: ['Item 1', 'Item 2', 'Item 3'],
          style: {
            ...componentData.style,
            borderColor: '#e0e0e0'
          }
        };
        break;
        
      case 'table':
        componentData = {
          ...componentData,
          headers: ['Column 1', 'Column 2', 'Column 3'],
          rows: [
            ['Data 1-1', 'Data 1-2', 'Data 1-3'],
            ['Data 2-1', 'Data 2-2', 'Data 2-3']
          ],
          style: {
            ...componentData.style,
            borderColor: '#e0e0e0'
          }
        };
        break;
        
      case 'tabs':
        componentData = {
          ...componentData,
          tabs: ['Tab 1', 'Tab 2', 'Tab 3'],
          activeTab: 0
        };
        break;
        
      case 'menu':
        componentData = {
          ...componentData,
          items: ['Menu Item 1', 'Menu Item 2', 'Menu Item 3'],
          open: false
        };
        break;
        
      case 'custom':
      default:
        componentData = {
          ...componentData,
          text: 'Custom Component',
          style: {
            ...componentData.style,
            backgroundColor: '#f5f5f5'
          }
        };
    }
    
    // Create component element
    const newComponent = {
      id,
      type: 'component',
      x: centerX,
      y: centerY,
      width: 150,
      height: 80,
      data: componentData
    };
    
    // Add to elements array
    const updatedElements = [...elements, newComponent];
    setElements(updatedElements);
    setSelectedElementId(id);
    markAsUnsaved();
  };

  // Handle color picker open
  const handleColorPickerOpen = (event, type) => {
    setColorPickerAnchor(event.currentTarget);
    setColorPickerType(type);
  };

  // Handle color picker close
  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
  };

  // Handle color change
  const handleColorChange = (type, color) => {
    // Make sure color is visible (not white on white)
    if (color === '#ffffff' && type === 'fill' && canvasOptions.canvasColor === '#ffffff') {
      color = 'rgba(173, 216, 230, 0.5)'; // Light blue with transparency
    }

    switch (type) {
      case 'stroke':
        if (selectedElementId) {
          const selectedElement = elements.find(el => el.id === selectedElementId);
          if (selectedElement) {
            setElements(prev => prev.map(el => 
              el.id === selectedElementId ? {
                ...el,
                data: {
                  ...el.data,
                  strokeColor: color
                }
              } : el
            ));
          }
        } else {
          setCanvasOptions(prev => ({ ...prev, strokeColor: color }));
        }
        break;
      case 'fill':
        if (selectedElementId) {
          const selectedElement = elements.find(el => el.id === selectedElementId);
          if (selectedElement) {
            setElements(prev => prev.map(el => 
              el.id === selectedElementId ? {
                ...el,
                data: {
                  ...el.data,
                  fillColor: color
                }
              } : el
            ));
          }
        } else {
          setCanvasOptions(prev => ({ ...prev, fillColor: color }));
        }
        break;
      case 'text':
        if (selectedElementId) {
          const selectedElement = elements.find(el => el.id === selectedElementId);
          if (selectedElement && selectedElement.type === 'text') {
            setElements(prev => prev.map(el => 
              el.id === selectedElementId ? {
                ...el,
                data: {
                  ...el.data,
                  color: color
                }
              } : el
            ));
          }
        } else {
          setCanvasOptions(prev => ({ 
            ...prev, 
            textStyle: { ...prev.textStyle, color: color } 
          }));
        }
        break;
      case 'background':
        setCanvasOptions(prev => ({ ...prev, canvasColor: color }));
        break;
    }
    markAsUnsaved();
  };

  // Handle updating element property
  const handleUpdateElementProperty = (elementId, property, value) => {
    setElements(prev => prev.map(el =>
      el.id === elementId ? {
        ...el,
        data: {
          ...el.data,
          [property]: value
        }
      } : el
    ));
    markAsUnsaved();
  };

  // Create new element based on tool type
  const createNewElement = (toolType, x, y) => {
    const baseElement = {
      id: Date.now().toString(),
      type: toolType,
      x,
      y,
      data: {
        strokeColor: canvasOptions.strokeColor || '#000000',
        fillColor: canvasOptions.fillColor || 'rgba(173, 216, 230, 0.5)',
        strokeWidth: canvasOptions.strokeWidth || 2
      }
    };

    switch (toolType) {
      case 'rectangle':
        return {
          ...baseElement,
          width: 0,
          height: 0
        };
      case 'circle':
        return {
          ...baseElement,
          width: 0,
          height: 0,
          data: {
            ...baseElement.data,
            radius: 0
          }
        };
      case 'line':
        return {
          ...baseElement,
          width: 0,
          height: 0,
          data: {
            ...baseElement.data,
            endX: x,
            endY: y
          }
        };
      case 'text':
        return {
          ...baseElement,
          width: 200,
          height: 50,
          data: {
            ...baseElement.data,
            text: 'Double click to edit',
            color: canvasOptions.strokeColor || '#000000',
            fontFamily: canvasOptions.textStyle?.fontFamily || 'Arial, sans-serif',
            fontSize: canvasOptions.textStyle?.fontSize || 16,
            fontWeight: canvasOptions.textStyle?.fontWeight || 'normal',
            fontStyle: canvasOptions.textStyle?.fontStyle || 'normal',
            textAlign: canvasOptions.textStyle?.textAlign || 'left'
          }
        };
      default:
        return baseElement;
    }
  };

  // Update element while dragging
  const updateElementOnDrag = (element, newX, newY) => {
    if (!element) return element;

    const width = Math.abs(newX - element.x);
    const height = Math.abs(newY - element.y);

    switch (element.type) {
      case 'rectangle':
        return {
          ...element,
          width,
          height
        };
      case 'circle':
        const radius = Math.sqrt(width * width + height * height);
        return {
          ...element,
          width: radius * 2,
          height: radius * 2,
          data: {
            ...element.data,
            radius
          }
        };
      case 'line':
        return {
          ...element,
          width,
          height,
          data: {
            ...element.data,
            endX: newX,
            endY: newY
          }
        };
      default:
        return element;
    }
  };

  // Handle mouse down on canvas
  const handleCanvasMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    
    if (tool === 'select') {
      // Handle selection
      const clickedElement = elements.find(el => isPointInElement({ x: offsetX, y: offsetY }, el));
      setSelectedElementId(clickedElement?.id || null);
    } else {
      // Start drawing
      setDrawing(true);
      const newElement = createNewElement(tool, offsetX, offsetY);
      setCurrentElement(newElement);
      setElements(prev => [...prev, newElement]);
      markAsUnsaved();
    }
  };

  // Handle mouse move on canvas
  const handleCanvasMouseMove = (e) => {
    if (!drawing || !currentElement) return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    const updatedElement = updateElementOnDrag(currentElement, offsetX, offsetY);
    
    setElements(prev => prev.map(el => 
      el.id === currentElement.id ? updatedElement : el
    ));
    setCurrentElement(updatedElement);
  };

  // Handle mouse up on canvas
  const handleCanvasMouseUp = () => {
    if (drawing) {
      setDrawing(false);
      setCurrentElement(null);
      markAsUnsaved();
    }
  };

  // Handle updates to element properties
  const handleUpdateShapeProperty = (property, value) => {
    if (!selectedElement || selectedElement.type !== 'shape') return;
    
    const updatedElements = elements.map(el => {
      if (el.id === selectedElement.id) {
        // Handle nested properties like 'style.fontFamily'
        if (property.includes('.')) {
          const [parentProp, childProp] = property.split('.');
          return {
            ...el,
            data: {
              ...el.data,
              [parentProp]: {
                ...el.data[parentProp],
                [childProp]: value
              }
            }
          };
        }
        
        // Regular property
        return {
          ...el,
          data: {
            ...el.data,
            [property]: value
          }
        };
      }
      return el;
    });
    
    setElements(updatedElements);
    markAsUnsaved();
  };

  const handleUpdateTextProperty = (property, value) => {
    if (!selectedElement || selectedElement.type !== 'text') return;
    
    const updatedElements = elements.map(el => {
      if (el.id === selectedElement.id) {
        // Handle nested properties like 'style.fontFamily'
        if (property.includes('.')) {
          const [parentProp, childProp] = property.split('.');
          return {
            ...el,
            data: {
              ...el.data,
              [parentProp]: {
                ...el.data[parentProp],
                [childProp]: value
              }
            }
          };
        }
        
        // Regular property
        return {
          ...el,
          data: {
            ...el.data,
            [property]: value
          }
        };
      }
      return el;
    });
    
    setElements(updatedElements);
    markAsUnsaved();
  };

  const handleUpdateImageProperty = (property, value) => {
    if (!selectedElement || selectedElement.type !== 'image') return;
    
    const updatedElements = elements.map(el => {
      if (el.id === selectedElement.id) {
        return {
          ...el,
          data: {
            ...el.data,
            [property]: value
          }
        };
      }
      return el;
    });
    
    setElements(updatedElements);
    markAsUnsaved();
  };

  // Function to handle opening the code generator dialog
  const handleGenerateCode = () => {
    setRightPanelTab('code');
  };

  // Update right panel tab when elements change
  useEffect(() => {
    if (rightPanelTab === 'code') {
      // Update code generator view when elements change
      const codeGeneratorEl = document.getElementById('code-generator');
      if (codeGeneratorEl) {
        // Trigger a resize event to update the code preview
        window.dispatchEvent(new Event('resize'));
      }
    }
  }, [elements, rightPanelTab]);

  // Handle right panel tab change
  const handleRightPanelTabChange = (event, newValue) => {
    setRightPanelTab(newValue);
  };

  // Add key event listener for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete key for removing selected element
      if (e.key === 'Delete' && selectedElementId) {
        handleDeleteSelected();
      }
      
      // Ctrl+Z for undo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      
      // Ctrl+Y for redo
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
      
      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedElementId(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElementId]);

  // Add handlers for canvas options
  const handleBackgroundColorChange = (color) => {
    setCanvasOptions(prev => ({
      ...prev,
      canvasColor: color
    }));
    markAsUnsaved();
  };

  // Add handlers for stroke color, fill color, and stroke width
  const handleStrokeColorChange = (color) => {
    setCanvasOptions(prev => ({
      ...prev,
      strokeColor: color
    }));
    markAsUnsaved();
  };

  const handleFillColorChange = (color) => {
    setCanvasOptions(prev => ({
      ...prev,
      fillColor: color
    }));
    markAsUnsaved();
  };

  const handleStrokeWidthChange = (width) => {
    setCanvasOptions(prev => ({
      ...prev,
      strokeWidth: width
    }));
    markAsUnsaved();
  };

  const handleZoomChange = (direction) => {
    setCanvasOptions(prev => ({
      ...prev,
      zoom: direction === '+' 
        ? Math.min(prev.zoom + 0.1, 2)
        : Math.max(prev.zoom - 0.1, 0.5)
    }));
  };

  // Add save button renderer
  const renderSaveButton = () => (
    <Tooltip title="Save Changes">
      <IconButton 
        onClick={handleSaveToProject}
        color={unsavedChanges ? 'primary' : 'default'}
        size="small"
      >
        <SaveIcon />
      </IconButton>
    </Tooltip>
  );

  // Update the toolbar props
  const toolbarProps = {
    tool,
    canvasOptions,
    onToolChange: handleToolChange,
    onStrokeColorChange: (color) => handleColorChange('stroke', color),
    onFillColorChange: (color) => handleColorChange('fill', color),
    onStrokeWidthChange: (width) => {
      if (selectedElementId) {
        handleUpdateComponentProperty(selectedElementId, 'strokeWidth', width);
      } else {
        setCanvasOptions(prev => ({ ...prev, strokeWidth: width }));
      }
    },
    onBackgroundColorChange: (color) => {
      setCanvasOptions(prev => ({ ...prev, canvasColor: color }));
      markAsUnsaved();
    },
    onClearCanvas: handleClearCanvas,
    onZoomChange: handleZoomChange,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onGenerateCode: () => setRightPanelTab('code'),
    onSave: handleSaveToProject,
    onAddText: handleAddText,
    onImageUpload: handleImageUpload
  };

  // Helper function to check if a point is within an element's bounds
  const isPointInElement = (point, element) => {
    if (!element) return false;

    switch (element.type) {
      case 'circle':
        const dx = point.x - element.x;
        const dy = point.y - element.y;
        return Math.sqrt(dx * dx + dy * dy) <= element.radius;
      
      case 'line':
        // Check if point is close to the line
        const lineDistance = pointToLineDistance(
          point,
          { x: element.x, y: element.y },
          { x: element.endX, y: element.endY }
        );
        return lineDistance <= 5; // 5px threshold
      
      default:
        // For rectangles, text, images, and components
        return (
          point.x >= element.x &&
          point.x <= element.x + (element.width || 0) &&
          point.y >= element.y &&
          point.y <= element.y + (element.height || 0)
        );
    }
  };

  // Helper function to calculate distance from point to line
  const pointToLineDistance = (point, lineStart, lineEnd) => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100vh - 64px)', // Account for navbar
        marginTop: '64px', // Space for navbar
        bgcolor: '#f5f5f5',
        overflow: 'hidden'
      }}
    >
      {/* Horizontal Toolbar below navbar */}
      <Box sx={{ 
        height: '48px', 
        width: '100%',
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        bgcolor: '#1e1e1e',
        display: 'flex',
        alignItems: 'center',
        px: 2
      }}>
        <Toolbar {...toolbarProps} />
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Left Sidebar - Components */}
        <Box sx={{ 
          width: '280px',
          height: '100%',
          bgcolor: '#ffffff',
          borderRight: '1px solid rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            p: 2,
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            bgcolor: '#fafafa'
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Components</Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <ComponentControls 
              onAddComponent={handleAddComponent}
            />
          </Box>
        </Box>

        {/* Main Canvas Area */}
        <Box sx={{ 
          flex: 1,
          height: '100%',
          position: 'relative',
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f0f2f5',
          backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}>
          <Box sx={{ 
            position: 'relative',
            transform: `scale(${canvasOptions.zoom})`,
            transformOrigin: '50% 50%',
            transition: 'transform 0.2s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            bgcolor: '#ffffff',
            borderRadius: 1
          }}>
            <Canvas
              ref={canvasRef}
              width={canvasOptions.width}
              height={canvasOptions.height}
              elements={elements}
              selectedElementId={selectedElementId}
              tool={tool}
              canvasOptions={canvasOptions}
              onElementSelect={handleSelectElement}
              onElementUpdate={handleUpdateElement}
              onElementDelete={handleDeleteSelected}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onElementsChange={setElements}
              zoom={canvasOptions.zoom}
              backgroundColor={canvasOptions.canvasColor}
              onDoubleClick={handleDoubleClick}
              editingTextId={editingTextId}
              onTextInputBlur={handleTextInputBlur}
              onTextInputChange={handleTextInputChange}
            />
          </Box>
        </Box>

        {/* Right Sidebar - Properties/Code */}
        <Box sx={{ 
          width: '300px',
          height: '100%',
          bgcolor: '#ffffff',
          borderLeft: '1px solid rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={rightPanelTab} 
              onChange={handleRightPanelTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 'medium',
                  py: 1.5
                }
              }}
            >
              <Tab label="Properties" value="properties" />
              <Tab label="Code" value="code" />
            </Tabs>
          </Box>
          
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {rightPanelTab === 'properties' ? (
              <PropertyPanel 
                selectedElement={selectedElement}
                onUpdateElement={handleUpdateElement}
                onColorPickerOpen={handleColorPickerOpen}
              />
            ) : (
              <CodeGenerator 
                elements={elements}
                canvasOptions={canvasOptions}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Color Picker */}
      <ColorPicker
        open={colorPickerOpen}
        anchorEl={colorPickerAnchor}
        color={tempColor}
        onColorChange={handleColorChange}
        onApply={handleColorPickerClose}
        onClose={handleColorPickerClose}
      />

      {/* Save notification */}
      <Snackbar
        open={Boolean(saveStatus)}
        autoHideDuration={3000}
        onClose={() => setSaveStatus('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={saveStatus.includes('Error') ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {saveStatus}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DrawingBoard; 