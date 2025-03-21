import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Button,
  IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

/**
 * CodeGenerator component for DrawingBoard
 * Generates HTML, CSS, and React code from the canvas elements
 */
const CodeGenerator = ({ elements = [], canvasOptions = {} }) => {
  const [activeTab, setActiveTab] = useState('react');
  const [showPreview, setShowPreview] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState('');
  const previewIframeRef = useRef(null);
  
  // Store generated code for different frameworks
  const [generatedCode, setGeneratedCode] = useState({
    react: '',
    html: '',
    css: '',
    preview: ''
  });
  
  // Generate code whenever elements or canvasOptions change
  useEffect(() => {
    // Generate React code
    const reactCode = generateReactCode(elements, canvasOptions);
    
    // Generate HTML/CSS code
    const { html, css } = generateHtmlCss(elements, canvasOptions);
    
    // Update the state with the generated code
    setGeneratedCode({
      react: reactCode,
      html: html,
      css: css,
      preview: `
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body>${html}</body>
        </html>
      `
    });
  }, [elements, canvasOptions]);
  
  // Function to update the preview when tab changes
  useEffect(() => {
    if (showPreview && previewIframeRef.current) {
      try {
        const doc = previewIframeRef.current.contentDocument;
        doc.open();
        doc.write(generatedCode.preview);
        doc.close();
      } catch (error) {
        console.error('Error updating preview:', error);
      }
    }
  }, [showPreview, generatedCode.preview]);
  
  // Toggle preview visibility
  const handleTogglePreview = () => {
    setShowPreview(prev => !prev);
  };
  
  // Copy code to clipboard
  const handleCopyToClipboard = () => {
    const codeToCopy = generatedCode[activeTab];
    
    if (navigator.clipboard && codeToCopy) {
      navigator.clipboard.writeText(codeToCopy)
        .then(() => {
          setCopiedStatus('Copied to clipboard!');
          setTimeout(() => setCopiedStatus(''), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          setCopiedStatus('Failed to copy');
        });
    }
  };
  
  // Generate React code
  const generateReactCode = (elements, canvasOptions) => {
    let imports = `import React from 'react';\nimport { Box } from '@mui/material';\n\n`;
    
    let componentCode = `const GeneratedComponent = () => {\n  return (\n    <Box\n      sx={{\n        position: 'relative',\n        width: '${canvasOptions.width}px',\n        height: '${canvasOptions.height}px',\n        backgroundColor: '${canvasOptions.canvasColor || "#ffffff"}',\n        overflow: 'hidden'\n      }}\n    >\n`;
    
    // Add elements
    if (elements.length > 0) {
      elements.forEach(element => {
        switch (element.type) {
          case 'shape':
            componentCode += generateReactShapeCode(element);
            break;
          case 'text':
            componentCode += generateReactTextCode(element);
            break;
          case 'image':
            componentCode += generateReactImageCode(element);
            break;
          case 'component':
            componentCode += generateReactComponentCode(element);
            break;
          default:
            break;
        }
      });
    } else {
      componentCode += `      {/* No elements to display */}\n`;
    }
    
    componentCode += `    </Box>\n  );\n};\n\nexport default GeneratedComponent;`;
    
    return imports + componentCode;
  };
  
  // Generate React code for shapes
  const generateReactShapeCode = (element) => {
    const { data, x, y, width, height } = element;
    const shapeType = data?.shapeType || 'rectangle';
    
    if (shapeType === 'rectangle') {
      return `      <Box
        sx={{
          position: 'absolute',
          left: ${x},
          top: ${y},
          width: ${width},
          height: ${height},
          backgroundColor: '${data?.fillColor || "transparent"}',
          border: '${data?.strokeWidth || 1}px solid ${data?.strokeColor || "#000000"}',
          opacity: ${data?.opacity || 1}
        }}
      />\n`;
    } else if (shapeType === 'circle') {
      return `      <Box
        sx={{
          position: 'absolute',
          left: ${x},
          top: ${y},
          width: ${width},
          height: ${height},
          backgroundColor: '${data?.fillColor || "transparent"}',
          border: '${data?.strokeWidth || 1}px solid ${data?.strokeColor || "#000000"}',
          borderRadius: '50%',
          opacity: ${data?.opacity || 1}
        }}
      />\n`;
    } else if (shapeType === 'line') {
      // For lines, we use a rotated div
      return `      <Box
        sx={{
          position: 'absolute',
          left: ${x},
          top: ${y},
          width: ${Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))},
          height: 0,
          borderTop: '${data?.strokeWidth || 1}px solid ${data?.strokeColor || "#000000"}',
          transform: 'rotate(${Math.atan2(height, width)}rad)',
          transformOrigin: '0 0',
          opacity: ${data?.opacity || 1}
        }}
      />\n`;
    } else {
      // Path and other shapes - simplified as a div placeholder
      return `      <Box
        sx={{
          position: 'absolute',
          left: ${x},
          top: ${y},
          width: ${width},
          height: ${height},
          border: '${data?.strokeWidth || 1}px dashed ${data?.strokeColor || "#000000"}',
          opacity: ${data?.opacity || 1}
        }}
      />\n`;
    }
  };
  
  // Generate React code for text
  const generateReactTextCode = (element) => {
    const { data, x, y, width, height } = element;
    const text = data?.text || '';
    
    return `      <Box
        sx={{
          position: 'absolute',
          left: ${x},
          top: ${y},
          width: ${width},
          height: ${height},
          color: '${data?.color || '#000000'}',
          fontFamily: '${data?.fontFamily || 'Arial, sans-serif'}',
          fontSize: ${data?.fontSize || 16},
          fontWeight: '${data?.fontWeight || 'normal'}',
          fontStyle: '${data?.fontStyle || 'normal'}',
          textAlign: '${data?.textAlign || 'left'}',
          display: 'flex',
          alignItems: '${data?.verticalAlign || 'flex-start'}',
          overflow: 'hidden'
        }}
      >
        ${text}
      </Box>\n`;
  };
  
  // Generate React code for images
  const generateReactImageCode = (element) => {
    const { data, x, y, width, height } = element;
    const src = data?.src || '';
    
    return `      <Box
        component="img"
        src="${src}"
        alt="Generated image"
        sx={{
          position: 'absolute',
          left: ${x},
          top: ${y},
          width: ${width},
          height: ${height},
          objectFit: '${data?.objectFit || 'contain'}',
          opacity: ${data?.opacity || 1}
        }}
      />\n`;
  };
  
  // Generate React code for components
  const generateReactComponentCode = (element) => {
    const { data, x, y, width, height } = element;
    const componentType = data?.componentType || 'custom';
    
    switch (componentType) {
      case 'button':
        return `      <Button
        variant="${data?.variant || 'contained'}"
        sx={{
          position: 'absolute',
          left: ${x},
          top: ${y},
          width: ${width},
          height: ${height},
          backgroundColor: '${data?.style?.backgroundColor || '#1976d2'}',
          color: '${data?.style?.color || '#ffffff'}',
          borderRadius: ${data?.style?.borderRadius || 4}
        }}
      >
        ${data?.text || 'Button'}
      </Button>\n`;
        
      case 'input':
        return `      <TextField
        label="${data?.label || 'Label'}"
        placeholder="${data?.placeholder || 'Placeholder...'}"
        variant="${data?.variant || 'outlined'}"
        sx={{
          position: 'absolute',
          left: ${x},
          top: ${y},
          width: ${width},
        }}
      />\n`;
        
      case 'card':
        return `      <Card
        sx={{
          position: 'absolute',
          left: ${x},
          top: ${y},
          width: ${width},
          height: ${height},
          backgroundColor: '${data?.style?.backgroundColor || '#ffffff'}',
          borderRadius: ${data?.style?.borderRadius || 4}
        }}
      >
        <CardContent>
          <Typography variant="h6">
            ${data?.title || 'Card Title'}
          </Typography>
          <Typography variant="body2">
            ${data?.content || 'Card content...'}
          </Typography>
        </CardContent>
      </Card>\n`;
        
      default:
        return `      <Box
        sx={{
          position: 'absolute',
          left: ${x},
          top: ${y},
          width: ${width},
          height: ${height},
          backgroundColor: '${data?.style?.backgroundColor || '#f5f5f5'}',
          border: '1px solid ${data?.style?.borderColor || '#e0e0e0'}',
          borderRadius: ${data?.style?.borderRadius || 4},
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ${data?.text || 'Custom Component'}
      </Box>\n`;
    }
  };
  
  // Generate HTML/CSS code
  const generateHtmlCss = (elements, canvasOptions) => {
    let html = `<div class="canvas-container">\n`;
    
    let css = `
.canvas-container {
  position: relative;
  width: ${canvasOptions.width}px;
  height: ${canvasOptions.height}px;
  background-color: ${canvasOptions.canvasColor || '#ffffff'};
  overflow: hidden;
}\n`;
    
    // Generate class for each element type
    if (elements.length > 0) {
      elements.forEach((element, index) => {
        const className = `${element.type}-${index}`;
        
        html += `  <div class="${className}"></div>\n`;
        
        css += `
.${className} {
  position: absolute;
  left: ${element.x}px;
  top: ${element.y}px;
  width: ${element.width}px;
  height: ${element.height}px;
}\n`;
      });
    } else {
      html += `  <!-- No elements to display -->\n`;
    }
    
    html += `</div>`;
    
    return { html, css };
  };
  
  return (
    <Box sx={{ height: '100%' }} id="code-generator">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f5f5f5' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="React" value="react" />
          <Tab label="HTML" value="html" />
          <Tab label="CSS" value="css" />
        </Tabs>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 48px)' }}>
        {/* Action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleTogglePreview}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {copiedStatus && (
              <Typography variant="caption" color="success" sx={{ mr: 1 }}>
                {copiedStatus}
              </Typography>
            )}
            <Button
              variant="contained"
              size="small"
              onClick={handleCopyToClipboard}
              startIcon={<ContentCopyIcon />}
            >
              Copy Code
            </Button>
          </Box>
        </Box>
        
        {/* Code and preview */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Code display */}
          <Box 
            sx={{ 
              flex: showPreview ? 1 : 1, 
              bgcolor: '#282c34', 
              color: '#abb2bf',
              p: 2,
              overflow: 'auto',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              fontSize: '14px'
            }}
          >
            {generatedCode[activeTab] || 'No code generated yet.'}
          </Box>
          
          {/* Preview */}
          {showPreview && (
            <Box 
              sx={{ 
                flex: 1, 
                borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
                bgcolor: '#ffffff'
              }}
            >
              <iframe
                ref={previewIframeRef}
                title="Preview"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CodeGenerator; 