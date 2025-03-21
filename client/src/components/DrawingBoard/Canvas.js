import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper } from '@mui/material';

/**
 * Canvas component for DrawingBoard
 * This is the main drawing surface where shapes, text, and images are rendered
 */
const Canvas = ({ 
  width = 800, 
  height = 600, 
  backgroundColor = '#ffffff',
  elements = [],
  selectedElementId = null,
  tool = 'select',
  canvasOptions = {},
  zoom = 1,
  onElementsChange,
  onElementSelect,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasMouseLeave,
  onDoubleClick,
  editingTextId,
  onTextInputBlur,
  onTextInputChange
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Create a separate rendering context for the canvas
  const [ctx, setCtx] = useState(null);

  // State to track various interactions
  const [dragging, setDragging] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouseStartPos, setMouseStartPos] = useState({ x: 0, y: 0 });

  // Determine the cursor based on the tool and mouse position
  const getCursor = () => {
    // If dragging, show appropriate cursor
    if (dragging) {
      if (dragging.type === 'move') return 'move';
      if (dragging.type === 'resize') {
        const { handle } = dragging;
        switch (handle) {
          case 'nw':
          case 'se':
            return 'nwse-resize';
          case 'ne':
          case 'sw':
            return 'nesw-resize';
          case 'n':
          case 's':
            return 'ns-resize';
          case 'e':
          case 'w':
            return 'ew-resize';
          default:
            return 'default';
        }
      }
    }
    
    // If select tool, cursor depends on what's under it
    if (tool === 'select') {
      const selectedEl = elements.find(el => el.id === selectedElementId);
      
      if (selectedEl && mousePos) {
        const resizeHandle = getResizeHandleAtPosition(selectedEl, mousePos.x, mousePos.y);
        
        if (resizeHandle) {
          switch (resizeHandle) {
            case 'nw':
            case 'se':
              return 'nwse-resize';
            case 'ne':
            case 'sw':
              return 'nesw-resize';
            case 'n':
            case 's':
              return 'ns-resize';
            case 'e':
            case 'w':
              return 'ew-resize';
            default:
              return 'default';
          }
        } else if (isPointInElement(selectedEl, mousePos.x, mousePos.y)) {
          return 'move';
        }
      }
      
      // Check if over any element
      for (let i = elements.length - 1; i >= 0; i--) {
        if (mousePos && isPointInElement(elements[i], mousePos.x, mousePos.y)) {
          return 'move';
        }
      }
      
      return 'default';
    }
    
    // Other tools
    switch (tool) {
      case 'text':
        return 'text';
      case 'eraser':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M15.14 3c-.51 0-1.02.2-1.41.59L3 14.32V21h6.68l10.73-10.73c.78-.78.78-2.05 0-2.83l-3.85-3.85c-.39-.39-.9-.59-1.41-.59z\'/%3E%3C/svg%3E") 0 24, auto';
      case 'hand':
        return 'grab';
      default:
        return 'crosshair';
    }
  };

  // Initialize the canvas context
  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      setCtx(context);
    }
  }, []);

  // Adjust canvas dimensions when width, height, or zoom changes
  useEffect(() => {
    if (canvasRef.current && ctx) {
      // Clear any transformations
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Set new dimensions
      canvasRef.current.width = width * zoom;
      canvasRef.current.height = height * zoom;
      
      // Apply scale according to zoom
      ctx.scale(zoom, zoom);
      
      // Set background
      ctx.fillStyle = backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
  }, [width, height, backgroundColor, zoom, ctx]);

  // Render elements whenever they change
  useEffect(() => {
    if (ctx && elements.length > 0) {
      // Clear canvas but maintain the background
      ctx.fillStyle = backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      // Draw all elements
      elements.forEach(element => {
        drawElement(ctx, element, element.id === selectedElementId);
      });
    }
  }, [elements, selectedElementId, ctx, backgroundColor, width, height]);

  // Draw an individual element on the canvas
  const drawElement = (ctx, element, isSelected) => {
    if (!element) return;
    
    // Save current context state
    ctx.save();
    
    switch (element.type) {
      case 'rectangle':
        drawRectangle(ctx, element, isSelected);
        break;
      case 'circle':
        drawCircle(ctx, element, isSelected);
        break;
      case 'line':
        drawLine(ctx, element, isSelected);
        break;
      case 'text':
        // Skip drawing text that's being edited
        if (editingTextId === element.id) {
          ctx.restore();
          return;
        }
        drawText(ctx, element, isSelected);
        break;
      case 'image':
        drawImage(ctx, element, isSelected);
        break;
      case 'component':
        drawComponent(ctx, element, isSelected);
        break;
      case 'shape':
        drawShape(ctx, element, isSelected);
        break;
      default:
        console.warn(`Unknown element type: ${element.type}`);
        break;
    }
    
    // If selected, draw resize handles
    if (isSelected) {
      drawResizeHandles(ctx, element);
    }
    
    // Restore context state
    ctx.restore();
  };

  const drawRectangle = (ctx, element, isSelected) => {
    const { x, y, width, height, data } = element;
    
    // Ensure we have positive width and height
    const w = Math.abs(width || 0);
    const h = Math.abs(height || 0);
    
    // Set styles with visible defaults
    ctx.strokeStyle = data?.strokeColor || '#000000';
    ctx.fillStyle = data?.fillColor || 'rgba(173, 216, 230, 0.5)';
    ctx.lineWidth = data?.strokeWidth || 2;
    
    // Draw fill
    ctx.fillRect(x, y, w, h);
    // Draw outline
    ctx.strokeRect(x, y, w, h);
    
    // Draw selection outline if selected
    if (isSelected) {
      ctx.strokeStyle = '#4285f4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
      ctx.setLineDash([]);
    }
  };

  const drawCircle = (ctx, element, isSelected) => {
    const { x, y, data } = element;
    const radius = data?.radius || Math.min(element.width, element.height) / 2;
    
    // Set styles with visible defaults
    ctx.strokeStyle = data?.strokeColor || '#000000';
    ctx.fillStyle = data?.fillColor || 'rgba(173, 216, 230, 0.5)';
    ctx.lineWidth = data?.strokeWidth || 2;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw selection outline if selected
    if (isSelected) {
      ctx.strokeStyle = '#4285f4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const drawLine = (ctx, element, isSelected) => {
    const { x, y, data } = element;
    
    // Set styles with visible defaults
    ctx.strokeStyle = data?.strokeColor || '#000000';
    ctx.lineWidth = data?.strokeWidth || 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(data?.endX || x + 100, data?.endY || y + 100);
    ctx.stroke();
    
    // Draw selection indication if selected
    if (isSelected) {
      ctx.strokeStyle = '#4285f4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(data?.endX || x + 100, data?.endY || y + 100);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw endpoints
      ctx.fillStyle = '#4285f4';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(data?.endX || x + 100, data?.endY || y + 100, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawText = (ctx, element, isSelected) => {
    const { x, y, width, height, data } = element;
    
    // Set text styles
    ctx.font = `${data?.fontStyle || ''} ${data?.fontWeight || ''} ${data?.fontSize || 16}px ${data?.fontFamily || 'Arial, sans-serif'}`;
    ctx.fillStyle = data?.color || '#000000';
    ctx.textAlign = data?.textAlign || 'left';
    
    // Draw the text
    const text = data?.text || 'Text';
    const lines = text.split('\n');
    const lineHeight = (data?.fontSize || 16) * 1.2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + (index * lineHeight));
    });
    
    // Draw selection outline if selected
    if (isSelected) {
      ctx.strokeStyle = '#4285f4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x - 2, y - (data?.fontSize || 16), width + 4, height + 4);
      ctx.setLineDash([]);
    }
  };

  // Draw a shape (rectangle, circle, line, path)
  const drawShape = (ctx, shape, isSelected) => {
    const { shapeType, x, y, width, height, strokeColor, fillColor, strokeWidth, opacity, points } = shape;
    
    // Ensure we have positive width and height for rendering
    const w = Math.max(Math.abs(width || 0), 1);
    const h = Math.max(Math.abs(height || 0), 1);
    
    // Set global alpha for opacity (ensure it's never 0)
    ctx.globalAlpha = opacity !== undefined && opacity !== 0 ? opacity : 1;
    
    // Set stroke and fill styles with visible defaults
    ctx.strokeStyle = strokeColor || '#000000';
    ctx.fillStyle = fillColor && fillColor !== 'transparent' ? fillColor : 'rgba(173, 216, 230, 0.5)'; // Default light blue if not specified
    ctx.lineWidth = strokeWidth || 2; // Slightly thicker default
    
    // Draw based on shape type
    switch (shapeType) {
      case 'rectangle':
        // Draw fill
        ctx.fillRect(x, y, w, h);
        // Draw stroke
        ctx.strokeRect(x, y, w, h);
        break;
        
      case 'circle':
        const radius = Math.min(w, h) / 2;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'line':
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();
        break;
        
      case 'path':
        if (points && points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.fill();
          ctx.stroke();
        }
        break;
        
      default:
        // Default to rectangle if shape type is not specified
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
        break;
    }
    
    // Draw selection outline if selected
    if (isSelected) {
      ctx.strokeStyle = '#0066ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);
      
      // Draw resize handles
      drawResizeHandles(ctx, { x, y, width, height });
    }
    
    // Reset line dash and global alpha
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  };

  // Draw image element
  const drawImage = (ctx, image, isSelected) => {
    const { imageElement, x, y, width, height, opacity, objectFit } = image;
    
    // If we have a loaded image element
    if (imageElement && imageElement.complete) {
      ctx.globalAlpha = opacity !== undefined ? opacity : 1;
      
      try {
        // Draw the image according to object-fit property
        if (objectFit === 'contain') {
          const scale = Math.min(width / imageElement.width, height / imageElement.height);
          const scaledWidth = imageElement.width * scale;
          const scaledHeight = imageElement.height * scale;
          const offsetX = (width - scaledWidth) / 2;
          const offsetY = (height - scaledHeight) / 2;
          
          ctx.drawImage(imageElement, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
        } else if (objectFit === 'cover') {
          const scale = Math.max(width / imageElement.width, height / imageElement.height);
          const scaledWidth = imageElement.width * scale;
          const scaledHeight = imageElement.height * scale;
          const offsetX = (width - scaledWidth) / 2;
          const offsetY = (height - scaledHeight) / 2;
          
          ctx.drawImage(imageElement, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
        } else {
          // Default: stretch (fill)
          ctx.drawImage(imageElement, x, y, width, height);
        }
      } catch (error) {
        console.error('Error drawing image:', error);
        
        // Draw a placeholder if there's an error
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#cccccc';
        ctx.strokeRect(x, y, width, height);
        
        ctx.fillStyle = '#999999';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Image Error', x + width / 2, y + height / 2);
      }
    } else {
      // Draw a placeholder if the image isn't loaded
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#cccccc';
      ctx.strokeRect(x, y, width, height);
      
      ctx.fillStyle = '#999999';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Loading Image...', x + width / 2, y + height / 2);
    }
    
    // Draw selection outline if selected
    if (isSelected) {
      ctx.strokeStyle = '#0066ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x - 5, y - 5, width + 10, height + 10);
      
      // Draw resize handles
      drawResizeHandles(ctx, { x, y, width, height });
    }
  };

  // Draw component
  const drawComponent = (ctx, component, isSelected) => {
    if (!component || !component.data) {
      console.error('Invalid component:', component);
      // Draw a placeholder
      ctx.fillStyle = 'red';
      ctx.fillRect(component.x || 0, component.y || 0, component.width || 100, component.height || 30);
      return;
    }
    
    const { x, y, width, height, data } = component;
    const style = data.style || {};
    const componentType = data.componentType || 'custom';
    
    // Common styles
    const backgroundColor = style.backgroundColor || '#ffffff';
    const borderColor = style.borderColor || '#e0e0e0';
    const borderWidth = style.borderWidth || 1;
    const borderRadius = style.borderRadius || 0;
    const color = style.color || '#000000';
    
    // Draw the component background
    ctx.fillStyle = backgroundColor;
    
    // If it has rounded corners
    if (borderRadius > 0) {
      // Draw rounded rectangle
      drawRoundedRect(ctx, x, y, width, height, borderRadius);
      ctx.fill();
      
      // Draw border if needed
      if (borderWidth > 0) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        drawRoundedRect(ctx, x, y, width, height, borderRadius);
        ctx.stroke();
      }
    } else {
      // Simple rectangle
      ctx.fillRect(x, y, width, height);
      
      // Draw border if needed
      if (borderWidth > 0) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(x, y, width, height);
      }
    }
    
    // Component-specific rendering
    ctx.fillStyle = color;
    ctx.font = `${style.fontWeight || 'normal'} ${style.fontSize || 14}px ${style.fontFamily || 'Arial, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textX = x + width / 2;
    const textY = y + height / 2;
    
    switch (componentType) {
      case 'button':
        // Draw button text
        ctx.fillText(data.text || 'Button', textX, textY);
        break;
        
      case 'input':
        // Draw input field
        ctx.textAlign = 'left';
        ctx.fillStyle = '#757575';
        ctx.fillText(data.placeholder || 'Enter text...', x + 10, textY);
        
        // Draw input label if available
        if (data.label) {
          ctx.font = `bold ${style.fontSize || 12}px ${style.fontFamily || 'Arial, sans-serif'}`;
          ctx.fillText(data.label, x + 10, y + 12);
        }
        break;
        
      case 'checkbox':
        // Draw checkbox
        const checkboxSize = Math.min(width, height) * 0.3;
        const checkboxX = x + 10;
        const checkboxY = textY - checkboxSize / 2;
        
        ctx.strokeStyle = '#757575';
        ctx.lineWidth = 1;
        ctx.strokeRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
        
        // If checked, draw check mark
        if (data.checked) {
          ctx.beginPath();
          ctx.moveTo(checkboxX + checkboxSize * 0.2, checkboxY + checkboxSize * 0.5);
          ctx.lineTo(checkboxX + checkboxSize * 0.4, checkboxY + checkboxSize * 0.7);
          ctx.lineTo(checkboxX + checkboxSize * 0.8, checkboxY + checkboxSize * 0.3);
          ctx.stroke();
        }
        
        // Draw label
        ctx.textAlign = 'left';
        ctx.fillText(data.label || 'Checkbox', checkboxX + checkboxSize + 10, textY);
        break;
        
      case 'card':
        // Draw card title
        ctx.textAlign = 'left';
        ctx.font = `bold ${style.fontSize || 16}px ${style.fontFamily || 'Arial, sans-serif'}`;
        ctx.fillText(data.title || 'Card Title', x + 10, y + 20);
        
        // Draw card content
        ctx.font = `normal ${style.fontSize || 14}px ${style.fontFamily || 'Arial, sans-serif'}`;
        ctx.fillText(data.content || 'Card content...', x + 10, y + 50);
        break;
        
      case 'slider':
        // Draw slider track
        const trackY = textY;
        const trackHeight = 4;
        
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(x + 10, trackY - trackHeight/2, width - 20, trackHeight);
        
        // Draw slider thumb
        const thumbValue = data.value || 0.5;
        const thumbX = x + 10 + (width - 20) * thumbValue;
        const thumbRadius = 8;
        
        ctx.fillStyle = '#1976d2';
        ctx.beginPath();
        ctx.arc(thumbX, trackY, thumbRadius, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      default:
        // Custom component or unknown type
        ctx.fillText(data.text || 'Custom Component', textX, textY);
    }
    
    // Draw selection outline if selected
    if (isSelected) {
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
      
      // Draw resize handles
      drawResizeHandles(ctx, { x, y, width, height });
    }
  };
  
  // Helper function to draw a rounded rectangle
  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Draw resize handles for selected elements
  const drawResizeHandles = (ctx, { x, y, width, height }) => {
    const handleSize = 8;
    const handles = [
      { x: x, y: y, cursor: 'nwse-resize', handle: 'nw' },
      { x: x + width, y: y, cursor: 'nesw-resize', handle: 'ne' },
      { x: x, y: y + height, cursor: 'nesw-resize', handle: 'sw' },
      { x: x + width, y: y + height, cursor: 'nwse-resize', handle: 'se' },
      { x: x + width/2, y: y, cursor: 'ns-resize', handle: 'n' },
      { x: x + width, y: y + height/2, cursor: 'ew-resize', handle: 'e' },
      { x: x + width/2, y: y + height, cursor: 'ns-resize', handle: 's' },
      { x: x, y: y + height/2, cursor: 'ew-resize', handle: 'w' }
    ];
    
    handles.forEach(handle => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 1;
      
      // Draw square handle
      ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
    });
  };

  // Get canvas coordinates from mouse event relative to the canvas
  const getCanvasCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  };

  // Handle mouse down events
  const handleMouseDown = (e) => {
    const coords = getCanvasCoordinates(e);
    setMouseStartPos(coords);
    setMousePos(coords);
    
    if (onCanvasMouseDown) {
      onCanvasMouseDown({
        ...e,
        nativeEvent: {
          ...e.nativeEvent,
          offsetX: coords.x,
          offsetY: coords.y
        }
      });
    }
    
    // Handle element selection
    if (tool === 'select') {
      // Check if clicking on resize handle of selected element
      const selectedEl = elements.find(el => el.id === selectedElementId);
      if (selectedEl) {
        const handle = getResizeHandleAtPosition(selectedEl, coords.x, coords.y);
        if (handle) {
          setDragging({ type: 'resize', elementId: selectedEl.id, handle });
          return;
        }
      }
      
      // Check if clicking on an element (from top to bottom of z-index)
      for (let i = elements.length - 1; i >= 0; i--) {
        if (isPointInElement(elements[i], coords.x, coords.y)) {
          if (onElementSelect) {
            onElementSelect(elements[i].id);
          }
          setDragging({ type: 'move', elementId: elements[i].id, initialX: elements[i].x, initialY: elements[i].y });
          return;
        }
      }
      
      // If clicked on empty space, deselect
      if (onElementSelect) {
        onElementSelect(null);
      }
    } else if (tool === 'text' && onDoubleClick) {
      // When using text tool, create new text and immediately start editing
      const newTextId = `text-${Date.now()}`;
      onDoubleClick(newTextId);
    }
  };

  // Handle mouse move events
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    // Update current mouse position
    setMousePos({ x, y });
    
    // Handle drag and resize operations
    if (dragging) {
      const dx = x - dragging.startX;
      const dy = y - dragging.startY;
      
      if (dragging.type === 'move') {
        // Calculate new position
        const newX = dragging.elementStartX + dx;
        const newY = dragging.elementStartY + dy;
        
        // Update element position
        const updatedElements = elements.map(el => {
          if (el.id === dragging.elementId) {
            return {
              ...el,
              x: newX,
              y: newY
            };
          }
          return el;
        });
        
        if (onElementsChange) {
          onElementsChange(updatedElements);
        }
      } else if (dragging.type === 'resize') {
        // Calculate new dimensions based on handle
        let newX = dragging.elementStartX;
        let newY = dragging.elementStartY;
        let newWidth = dragging.elementStartWidth;
        let newHeight = dragging.elementStartHeight;
        
        // Adjust dimensions based on which handle is being dragged
        switch (dragging.handle) {
          case 'nw':
            newX = dragging.elementStartX + dx;
            newY = dragging.elementStartY + dy;
            newWidth = Math.max(dragging.elementStartWidth - dx, 10);
            newHeight = Math.max(dragging.elementStartHeight - dy, 10);
            break;
          case 'n':
            newY = dragging.elementStartY + dy;
            newHeight = Math.max(dragging.elementStartHeight - dy, 10);
            break;
          case 'ne':
            newY = dragging.elementStartY + dy;
            newWidth = Math.max(dragging.elementStartWidth + dx, 10);
            newHeight = Math.max(dragging.elementStartHeight - dy, 10);
            break;
          case 'e':
            newWidth = Math.max(dragging.elementStartWidth + dx, 10);
            break;
          case 'se':
            newWidth = Math.max(dragging.elementStartWidth + dx, 10);
            newHeight = Math.max(dragging.elementStartHeight + dy, 10);
            break;
          case 's':
            newHeight = Math.max(dragging.elementStartHeight + dy, 10);
            break;
          case 'sw':
            newX = dragging.elementStartX + dx;
            newWidth = Math.max(dragging.elementStartWidth - dx, 10);
            newHeight = Math.max(dragging.elementStartHeight + dy, 10);
            break;
          case 'w':
            newX = dragging.elementStartX + dx;
            newWidth = Math.max(dragging.elementStartWidth - dx, 10);
            break;
        }
        
        // Update element dimensions
        const updatedElements = elements.map(el => {
          if (el.id === dragging.elementId) {
            return {
              ...el,
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight
            };
          }
          return el;
        });
        
        if (onElementsChange) {
          onElementsChange(updatedElements);
        }
      }
    } else if (tool !== 'select') {
      // For other tools, pass to parent handler
      if (onCanvasMouseMove) {
        onCanvasMouseMove(e, { x, y });
      }
    }
  };

  // Handle mouse up events
  const handleMouseUp = (e) => {
    if (dragging) {
      setDragging(null);
    } else if (tool !== 'select') {
      // For other tools, pass to parent handler
      if (onCanvasMouseUp) {
        onCanvasMouseUp(e, mousePos);
      }
    }
  };

  // Handle mouse leave events
  const handleMouseLeave = (e) => {
    if (dragging) {
      setDragging(null);
    } else if (tool !== 'select') {
      // For other tools, pass to parent handler
      if (onCanvasMouseLeave) {
        onCanvasMouseLeave(e, mousePos);
      }
    }
  };

  // Check if point is within an element
  const isPointInElement = (element, x, y) => {
    if (!element) return false;
    
    return (
      x >= element.x && 
      x <= element.x + element.width && 
      y >= element.y && 
      y <= element.y + element.height
    );
  };
  
  // Find which resize handle is at given coordinates
  const getResizeHandleAtPosition = (element, x, y) => {
    if (!element) return null;
    
    const { x: elementX, y: elementY, width: elementWidth, height: elementHeight } = element;
    const handleSize = 8;
    
    // Check each handle position
    if (Math.abs(x - elementX) <= handleSize && Math.abs(y - elementY) <= handleSize) return 'nw';
    if (Math.abs(x - (elementX + elementWidth)) <= handleSize && Math.abs(y - elementY) <= handleSize) return 'ne';
    if (Math.abs(x - elementX) <= handleSize && Math.abs(y - (elementY + elementHeight)) <= handleSize) return 'sw';
    if (Math.abs(x - (elementX + elementWidth)) <= handleSize && Math.abs(y - (elementY + elementHeight)) <= handleSize) return 'se';
    
    if (Math.abs(x - (elementX + elementWidth/2)) <= handleSize && Math.abs(y - elementY) <= handleSize) return 'n';
    if (Math.abs(x - (elementX + elementWidth)) <= handleSize && Math.abs(y - (elementY + elementHeight/2)) <= handleSize) return 'e';
    if (Math.abs(x - (elementX + elementWidth/2)) <= handleSize && Math.abs(y - (elementY + elementHeight)) <= handleSize) return 's';
    if (Math.abs(x - elementX) <= handleSize && Math.abs(y - (elementY + elementHeight/2)) <= handleSize) return 'w';
    
    return null;
  };

  // Handle double click (for text editing)
  const handleDoubleClick = (e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    // Look for text elements under the mouse
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (element.type === 'text' && isPointInElement(element, x, y)) {
        // Create a textarea for editing
        const textarea = document.createElement('textarea');
        
        // Position and style the textarea
        const textareaStyle = {
          position: 'absolute',
          left: `${element.x * zoom + rect.left}px`,
          top: `${element.y * zoom + rect.top}px`,
          width: `${element.width * zoom}px`,
          height: `${element.height * zoom}px`,
          fontFamily: element.data.fontFamily || 'Arial, sans-serif',
          fontSize: `${(element.data.fontSize || 16) * zoom}px`,
          fontWeight: element.data.fontWeight || 'normal',
          fontStyle: element.data.fontStyle || 'normal',
          textAlign: element.data.textAlign || 'left',
          color: element.data.color || '#000000',
          border: '2px solid #2196f3',
          padding: '2px',
          margin: '0',
          overflow: 'hidden',
          background: 'white',
          resize: 'none',
          zIndex: '1000'
        };
        
        Object.assign(textarea.style, textareaStyle);
        textarea.value = element.data.text || '';
        
        // Add events for handling text input
        textarea.addEventListener('input', () => {
          // Update element with new text as user types
          const updatedElements = elements.map(el => {
            if (el.id === element.id) {
              return {
                ...el,
                data: {
                  ...el.data,
                  text: textarea.value
                }
              };
            }
            return el;
          });
          
          onElementsChange(updatedElements);
        });
        
        // Handle when editing is complete
        const finishEditing = () => {
          document.body.removeChild(textarea);
          // Final update to element with new text
          const updatedElements = elements.map(el => {
            if (el.id === element.id) {
              return {
                ...el,
                data: {
                  ...el.data,
                  text: textarea.value
                }
              };
            }
            return el;
          });
          
          onElementsChange(updatedElements);
        };
        
        textarea.addEventListener('blur', finishEditing);
        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            finishEditing();
          }
          
          if (e.key === 'Escape') {
            finishEditing();
          }
        });
        
        // Add to DOM and focus
        document.body.appendChild(textarea);
        textarea.focus();
        
        break;
      }
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        overflow: 'auto',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f0f0f0',
        padding: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: width * zoom,
          height: height * zoom,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 3
        }}
      >
        <canvas
          ref={canvasRef}
          width={width * zoom}
          height={height * zoom}
          style={{
            cursor: getCursor(),
            position: 'absolute',
            top: 0,
            left: 0
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={handleDoubleClick}
        />
      </Paper>
      {editingTextId && (
        <textarea
          style={{
            position: 'absolute',
            left: elements.find(el => el.id === editingTextId)?.x * zoom,
            top: elements.find(el => el.id === editingTextId)?.y * zoom,
            width: '200px',
            height: '100px',
            border: '1px solid #ccc',
            padding: '4px',
            fontFamily: elements.find(el => el.id === editingTextId)?.data?.fontFamily,
            fontSize: `${elements.find(el => el.id === editingTextId)?.data?.fontSize}px`,
            fontWeight: elements.find(el => el.id === editingTextId)?.data?.fontWeight,
            fontStyle: elements.find(el => el.id === editingTextId)?.data?.fontStyle,
          }}
          value={elements.find(el => el.id === editingTextId)?.data?.text || ''}
          onChange={(e) => onTextInputChange(e, editingTextId)}
          onBlur={onTextInputBlur}
          autoFocus
        />
      )}
    </Box>
  );
};

export default Canvas; 