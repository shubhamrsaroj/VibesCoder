import React, { useState, useEffect, useRef, useCallback } from 'react';
import { saveToLocalStorage, loadFromLocalStorage, setupBeforeUnloadHandler, RestoreNotification } from './canvas-persistence.js';
import { 
  Box, Grid, Button, IconButton, Typography, Paper, Tabs, Tab, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Divider, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, FormControl, InputLabel, Select, MenuItem, Switch, 
  FormControlLabel, InputAdornment, Collapse, Badge, Alert, 
  Snackbar, Card, CardContent, CardActions, CardHeader, 
  Accordion, AccordionSummary, AccordionDetails, TableContainer, 
  Table, TableBody, TableCell, TableHead, TableRow, Menu, 
  Tooltip, Stack, Drawer, Checkbox, Radio, CircularProgress, 
  LinearProgress, Fab, DialogContentText, Slider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { CirclePicker, ChromePicker } from 'react-color';
import { HexColorPicker } from 'react-colorful';

// Icon imports
import BorderColorIcon from '@mui/icons-material/BorderColor';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import SaveIcon from '@mui/icons-material/Save';
import LayersIcon from '@mui/icons-material/Layers';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import PanToolIcon from '@mui/icons-material/PanTool';
import CropIcon from '@mui/icons-material/Crop';
import ShapeLineIcon from '@mui/icons-material/ShapeLine';
import GridOnIcon from '@mui/icons-material/GridOn';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import RemoveIcon from '@mui/icons-material/Remove';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import WidgetsIcon from '@mui/icons-material/Widgets';
import RectangleIcon from '@mui/icons-material/Rectangle';
import CircleIcon from '@mui/icons-material/Circle';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmartButtonIcon from '@mui/icons-material/SmartButton';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
// Use a different icon instead of the missing Shapes icon
import CategoryIcon from '@mui/icons-material/Category'; // Replacing ShapesIcon
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import CreateIcon from '@mui/icons-material/Create';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';

// Component imports
// Comment out missing Canvas import temporarily
// import Canvas from '../components/Canvas';
import CodeGenerator from '../components/DrawingBoard/CodeGenerator';
import SaveToProjectButton from '../components/SaveToProjectButton';
import ProjectSelector from '../components/ProjectSelector/ProjectSelector';

// Service imports
import { getProject, checkProjectAccess, saveDrawing, updateDrawing, getProjectState } from '../services/projectService';
// Implement clearLocalProjectData locally since it's missing from projectService
const clearLocalProjectData = () => {
  try {
    // Clear canvas data
    localStorage.removeItem('canvasData');
    localStorage.removeItem('canvasThumb');
    localStorage.removeItem('vibecoderDrawingState');
    localStorage.removeItem('vibecoderSaveStatus');
    localStorage.removeItem('vibecoderSaveStatusTimestamp');
    
    console.log('Cleared local project data from localStorage');
  } catch (error) {
    console.error('Error clearing local project data:', error);
  }
};

// Local utilities


// Custom styled components
const CanvasContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#f5f5f5',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[3],
  height: 'calc(100vh - 170px)', // Adjusted to work with fixed navbar and toolbar
  '&:hover': {
    cursor: 'crosshair'
  }
}));

const ToolbarButton = styled(IconButton)(({ theme, active }) => ({
  margin: theme.spacing(0.5),
  color: active === true || active === "true" ? theme.palette.primary.main : theme.palette.text.secondary,
  backgroundColor: active === true || active === "true" ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: active === true || active === "true" 
      ? alpha(theme.palette.primary.main, 0.2) 
      : alpha(theme.palette.text.secondary, 0.1),
  },
}));

const LayerItem = styled(ListItem)(({ theme, active }) => ({
  backgroundColor: active === true || active === "true" ? theme.palette.action.selected : 'transparent',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
}));

// First, I'll organize our component types by adding categories
// Add this before the DrawingBoard component
const COMPONENT_CATEGORIES = {
  LAYOUT: 'Layout',
  FORMS: 'Forms & Inputs',
  BUTTONS: 'Buttons & Actions',
  CARDS: 'Cards & Containers',
  INTERACTIVE: 'Interactive Components',
  CHARTS: 'Charts & Data',
  AUTH: 'Authentication',
  MEDIA: 'Media & Files'
};

const COMPONENT_TYPES = [
  // Layout Components
  { id: 'navbar', name: 'Navbar', category: COMPONENT_CATEGORIES.LAYOUT, icon: 'menu' },
  { id: 'sidebar', name: 'Sidebar', category: COMPONENT_CATEGORIES.LAYOUT, icon: 'vertical_split' },
  { id: 'footer', name: 'Footer', category: COMPONENT_CATEGORIES.LAYOUT, icon: 'horizontal_rule' },
  { id: 'grid', name: 'Grid System', category: COMPONENT_CATEGORIES.LAYOUT, icon: 'grid_view' },
  
  // Forms & Inputs
  { id: 'textfield', name: 'Text Input', category: COMPONENT_CATEGORIES.FORMS, icon: 'text_fields' },
  { id: 'checkbox', name: 'Checkbox', category: COMPONENT_CATEGORIES.FORMS, icon: 'check_box' },
  { id: 'radio', name: 'Radio Button', category: COMPONENT_CATEGORIES.FORMS, icon: 'radio_button_checked' },
  { id: 'dropdown', name: 'Dropdown', category: COMPONENT_CATEGORIES.FORMS, icon: 'arrow_drop_down' },
  { id: 'fileupload', name: 'File Upload', category: COMPONENT_CATEGORIES.FORMS, icon: 'upload_file' },
  { id: 'searchbar', name: 'Search Bar', category: COMPONENT_CATEGORIES.FORMS, icon: 'search' },
  
  // Buttons & Actions
  { id: 'button', name: 'Button', category: COMPONENT_CATEGORIES.BUTTONS, icon: 'smart_button' },
  { id: 'fab', name: 'Floating Action Button', category: COMPONENT_CATEGORIES.BUTTONS, icon: 'add_circle' },
  { id: 'spinner', name: 'Loading Spinner', category: COMPONENT_CATEGORIES.BUTTONS, icon: 'refresh' },
  
  // Cards & Containers
  { id: 'card', name: 'Info Card', category: COMPONENT_CATEGORIES.CARDS, icon: 'view_agenda' },
  { id: 'modal', name: 'Modal Dialog', category: COMPONENT_CATEGORIES.CARDS, icon: 'fullscreen' },
  { id: 'accordion', name: 'Accordion', category: COMPONENT_CATEGORIES.CARDS, icon: 'expand_more' },
  { id: 'tooltip', name: 'Tooltip', category: COMPONENT_CATEGORIES.CARDS, icon: 'info' },
  
  // Interactive Components
  { id: 'slider', name: 'Slider', category: COMPONENT_CATEGORIES.INTERACTIVE, icon: 'tune' },
  { id: 'tabs', name: 'Tabs', category: COMPONENT_CATEGORIES.INTERACTIVE, icon: 'tab' },
  { id: 'progressbar', name: 'Progress Bar', category: COMPONENT_CATEGORIES.INTERACTIVE, icon: 'linear_scale' },
  { id: 'toast', name: 'Toast Notification', category: COMPONENT_CATEGORIES.INTERACTIVE, icon: 'notification_important' },
  
  // Charts & Data
  { id: 'barchart', name: 'Bar Chart', category: COMPONENT_CATEGORIES.CHARTS, icon: 'bar_chart' },
  { id: 'linechart', name: 'Line Chart', category: COMPONENT_CATEGORIES.CHARTS, icon: 'show_chart' },
  { id: 'piechart', name: 'Pie Chart', category: COMPONENT_CATEGORIES.CHARTS, icon: 'pie_chart' },
  { id: 'table', name: 'Data Table', category: COMPONENT_CATEGORIES.CHARTS, icon: 'table_chart' },
  
  // Authentication Components
  { id: 'loginform', name: 'Login Form', category: COMPONENT_CATEGORIES.AUTH, icon: 'login' },
  { id: 'signupform', name: 'Signup Form', category: COMPONENT_CATEGORIES.AUTH, icon: 'person_add' },
  { id: 'otpform', name: 'OTP Verification', category: COMPONENT_CATEGORIES.AUTH, icon: 'pin' },
  { id: 'passwordreset', name: 'Password Reset', category: COMPONENT_CATEGORIES.AUTH, icon: 'lock_reset' },
  
  // Media & File Components
  { id: 'gallery', name: 'Image Gallery', category: COMPONENT_CATEGORIES.MEDIA, icon: 'photo_library' },
  { id: 'videoplayer', name: 'Video Player', category: COMPONENT_CATEGORIES.MEDIA, icon: 'smart_display' },
  { id: 'audioplayer', name: 'Audio Player', category: COMPONENT_CATEGORIES.MEDIA, icon: 'audio_file' }
];

const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [layers, setLayers] = useState([
    { id: 1, name: 'Layer 1', visible: true, locked: false, active: true },
    { id: 2, name: 'Layer 2', visible: true, locked: false, active: false }
  ]);
  const [shapes, setShapes] = useState([]);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [colorPickerType, setColorPickerType] = useState(null);
  const [layersOpen, setLayersOpen] = useState(true);
  const [componentsOpen, setComponentsOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState({ react: '', html: '', css: '' });
  const [showGeneratedCode, setShowGeneratedCode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [shapesMenuAnchor, setShapesMenuAnchor] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [canvasMode, setCanvasMode] = useState('drawing'); // drawing, selection, text, etc.
  const [eraserWidth, setEraserWidth] = useState(10);
  const [canvasOptions, setCanvasOptions] = useState({
    strokeWidth: 4,
    strokeColor: '#000000',
    canvasColor: '#ffffff',
    eraserWidth: 10
  });
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [textFontFamily, setTextFontFamily] = useState('Arial');
  const [textFontSize, setTextFontSize] = useState(12);
  const [showCanvasSizeDialog, setShowCanvasSizeDialog] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const fileInputRef = useRef(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  const [currentShape, setCurrentShape] = useState(null);
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStartPoint, setShapeStartPoint] = useState({ x: 0, y: 0 });
  const [textContent, setTextContent] = useState([]);
  const [imageElements, setImageElements] = useState([]);
  const [components, setComponents] = useState([]);
  const [codeTab, setCodeTab] = useState('react');
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveProjectDialog, setShowSaveProjectDialog] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Extract projectId and drawingId from URL params
  const { projectId: urlProjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [projectId, setProjectId] = useState(urlProjectId || '');
  const [drawingId, setDrawingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(() => {
    // Restore save status from localStorage if it exists
    const savedStatus = localStorage.getItem('vibecoderSaveStatus');
    const savedTimestamp = localStorage.getItem('vibecoderSaveStatusTimestamp');
    
    if (savedStatus && savedTimestamp) {
      const expiryTime = parseInt(savedTimestamp, 10);
      // Check if status is still valid (not expired)
      if (expiryTime > Date.now()) {
        return savedStatus;
      }
    }
    return '';
  });
  const [notificationStatus, setNotificationStatus] = useState('');
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true); // Set to true by default
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [activeLayer, setActiveLayer] = useState(1); // Default active layer
  
  const previewIframeRef = useRef(null); // Add the missing ref
  
  // Add these state variables at the beginning of your component
  const [eraserSize, setEraserSize] = useState(10); // Default size
  const [tempStrokeColor, setTempStrokeColor] = useState('#000000');
  const [tempFillColor, setTempFillColor] = useState('#ffffff');
  const [tempTextItemColor, setTempTextItemColor] = useState('#000000');
  const [tempBackgroundColor, setTempBackgroundColor] = useState('#ffffff');
  const [tempComponentBgColor, setTempComponentBgColor] = useState('#ffffff');
  const [tempComponentTextColor, setTempComponentTextColor] = useState('#000000');
  const [tempShapeFillColor, setTempShapeFillColor] = useState('#ffffff');
  const [tempShapeStrokeColor, setTempShapeStrokeColor] = useState('#000000');
  const [newCanvasWidth, setNewCanvasWidth] = useState(800); // Default width
  const [newCanvasHeight, setNewCanvasHeight] = useState(600); // Default height
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [editingComponent, setEditingComponent] = useState(null);
  const [editComponentContent, setEditComponentContent] = useState('');
  const [editComponentDialogOpen, setEditComponentDialogOpen] = useState(false);
  const [layoutComponentsOpen, setLayoutComponentsOpen] = useState(false);
  const [formsComponentsOpen, setFormsComponentsOpen] = useState(false);
  const [buttonsComponentsOpen, setButtonsComponentsOpen] = useState(false);
  const [cardsComponentsOpen, setCardsComponentsOpen] = useState(false);
  const [interactiveComponentsOpen, setInteractiveComponentsOpen] = useState(false);
  const [chartsComponentsOpen, setChartsComponentsOpen] = useState(false);
  const [authComponentsOpen, setAuthComponentsOpen] = useState(false);
  const [mediaComponentsOpen, setMediaComponentsOpen] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [blendMode, setBlendMode] = useState('normal');
  const [shadows, setShadows] = useState({
    enabled: false,
    offsetX: 5,
    offsetY: 5,
    blur: 10,
    color: 'rgba(0,0,0,0.5)'
  });
  const [toolAnchorEl, setToolAnchorEl] = useState(null);
  
  // Add after the other state declarations
  const [showRestoreNotification, setShowRestoreNotification] = useState(false);
  
  // Helper functions needed for our code
  const getDefaultPropsForComponent = (componentType) => {
    // Default component properties based on type
    return {
      backgroundColor: '#ffffff',
      color: '#000000',
      borderRadius: '4px',
      padding: '8px',
      fontSize: '14px',
      fontFamily: 'Arial',
      text: `${componentType} Component`,
      // Add more defaults as needed
    };
  };
  
  // Function to toggle shortcuts dialog
  const toggleShortcutsDialog = () => {
    setShowShortcutsDialog(!showShortcutsDialog);
  };
  
  // Basic syntax highlighting function for code display
  const highlightCode = (code, language) => {
    if (!code) return '';
    
    let highlightedCode = code;
    
    if (language === 'react' || language === 'jsx') {
      // Basic React JSX syntax highlighting
      highlightedCode = highlightedCode
        // Keywords
        .replace(/\b(import|export|from|default|const|let|var|function|return|if|else|for|while|switch|case|break|continue|try|catch|class|extends|new|this|super)\b/g, '<span style="color: #569cd6;">$1</span>')
        // JSX tags
        .replace(/(&lt;\/?\w+)/g, '<span style="color: #9cdcfe;">$1</span>')
        // JSX props
        .replace(/(\s\w+)=(\{|")/g, '<span style="color: #9cdcfe;">$1</span>=<span style="color: #ce9178;">$2</span>')
        // Strings
        .replace(/"([^"]*)"/g, '<span style="color: #ce9178;">"$1"</span>')
        // Comments
        .replace(/\/\/(.*)/g, '<span style="color: #6a9955;">// $1</span>');
    } else if (language === 'html') {
      // Basic HTML/CSS syntax highlighting
      highlightedCode = highlightedCode
        // HTML tags
        .replace(/(&lt;\/?\w+)/g, '<span style="color: #569cd6;">$1</span>')
        // HTML attributes
        .replace(/(\s\w+)=(")/g, '<span style="color: #9cdcfe;">$1</span>=<span style="color: #ce9178;">$2</span>')
        // CSS properties
        .replace(/(\s\s\w+-\w+|\s\s\w+):/g, '<span style="color: #9cdcfe;">$1</span>:')
        // CSS values
        .replace(/:\s(.*);/g, ': <span style="color: #ce9178;">$1</span>;')
        // Comments
        .replace(/&lt;!--(.*?)--&gt;/g, '<span style="color: #6a9955;">&lt;!--$1--&gt;</span>');
    }
    
    return highlightedCode;
  };
  
  // Function to handle tab change in the generated code panel
  const handleCodeTabChange = (event, newValue) => {
    setCodeTab(newValue);
  };
  
  // Function to update preview after code generation
  const updatePreview = () => {
    if (previewIframeRef && previewIframeRef.current && generatedCode.html) {
      const iframeDoc = previewIframeRef.current.contentDocument || previewIframeRef.current.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(generatedCode.html);
      iframeDoc.close();
    }
  };
  
  // Function to copy code to clipboard
  const copyCodeToClipboard = () => {
    const codeToCopy = codeTab === 'react' ? generatedCode.react : 
                       codeTab === 'html' ? generatedCode.html : 
                       generatedCode.css;
                       
    navigator.clipboard.writeText(codeToCopy)
      .then(() => {
        console.log('Code copied to clipboard');
        // Optionally show a success message
      })
      .catch(err => {
        console.error('Failed to copy code:', err);
      });
  };
  
  // Handle export as SVG
  const handleExportSVG = () => {
    if (canvasRef.current) {
      canvasRef.current.exportSvg()
        .then(data => {
          const svgBlob = new Blob([data], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(svgBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'vibecoder-drawing.svg';
          link.click();
          URL.revokeObjectURL(url);
        })
        .catch(e => {
          console.error('Error exporting SVG:', e);
        });
    }
  };
  
  // Handle upload image click
  const handleUploadImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle image file change
  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        const img = new Image();
        img.onload = () => {
          const activeLayerId = layers.find(layer => layer.active)?.id || layers[0]?.id;
          const newImage = {
            id: `image-${Date.now()}`,
            type: 'image',
            src: result,
            x: canvasDimensions.width / 2,
            y: canvasDimensions.height / 2,
            width: Math.min(img.width, canvasDimensions.width / 2), // Limit initial size
            height: Math.min(img.height, canvasDimensions.height / 2),
            aspectRatio: img.width / img.height,
            rotation: 0,
            opacity: 100,
            layerId: activeLayerId
          };
          setImageElements(prev => [...prev, newImage]);
          markAsUnsaved();
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Handle selecting an image
  const handleSelectImage = (imageId) => {
    const selected = imageElements.find(img => img.id === imageId);
    if (selected) {
      setSelectedElement({
        type: 'image',
        id: imageId,
        data: selected
      });
    }
  };
  
  // Handle updating image properties
  const handleUpdateImageProperty = (property, value) => {
    if (!selectedElement || selectedElement.type !== 'image') return;
    
    setImageElements(imageElements.map(img => 
      img.id === selectedElement.id 
        ? { ...img, [property]: value } 
        : img
    ));
    
    // Update the selected element data
    setSelectedElement(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [property]: value
      }
    }));
    
    markAsUnsaved(); // Mark as unsaved
  };
  
  // Add this useEffect to load drawing data when projectId changes
  useEffect(() => {
    if (urlProjectId && urlProjectId !== projectId) {
      setProjectId(urlProjectId);
    }
  }, [urlProjectId, projectId]);

  // Add this useEffect to load project data when projectId changes
  useEffect(() => {
    const loadProjectData = async () => {
        if (!projectId) return;

      try {
          setIsLoading(true);
        persistSaveStatus('Loading project...', 30000);
        
        // Check if user has access to this project
        const hasAccess = await checkProjectAccess(projectId);
        if (!hasAccess) {
          persistSaveStatus('Access denied: You don\'t have permission to view this project', 5000);
          navigate('/');
          return;
        }
        
        // Fetch project data
        const project = await getProject(projectId);
        if (!project) {
          persistSaveStatus('Project not found', 5000);
          navigate('/');
          return;
        }
        
        // Clear localStorage first to avoid conflicts
        clearLocalProjectData();
        
        // Load project drawing data
        const drawingData = await getProjectState(projectId, 'drawing');
        if (drawingData && drawingData.content) {
          try {
            const parsedContent = JSON.parse(drawingData.content);
            
            if (parsedContent.structure) {
              const { structure } = parsedContent;
              
              // Update state with project data
              if (structure.shapes) setShapes(structure.shapes);
              if (structure.textContent) setTextContent(structure.textContent);
              if (structure.imageElements) setImageElements(structure.imageElements);
              if (structure.components) setComponents(structure.components);
              if (structure.layers) setLayers(structure.layers);
              if (structure.canvasOptions) {
                if (structure.canvasOptions.width) setCanvasWidth(structure.canvasOptions.width);
                if (structure.canvasOptions.height) setCanvasHeight(structure.canvasOptions.height);
                if (structure.canvasOptions.backgroundColor) setBackgroundColor(structure.canvasOptions.backgroundColor);
              }
              
              setDrawingId(drawingData._id);
              persistSaveStatus('Project loaded successfully', 3000);
            }
          } catch (parseError) {
            console.error('Error parsing drawing content:', parseError);
            persistSaveStatus('Error loading project data', 5000);
          }
          }
        } catch (error) {
          console.error('Error loading project:', error);
        persistSaveStatus(`Error: ${error.message}`, 5000);
        } finally {
          setIsLoading(false);
      }
    };
    
    if (projectId) {
    loadProjectData();
    } else {
      // If no projectId, load from localStorage
      const saved = loadFromLocalStorage();
      if (saved) {
        setShowRestoreNotification(true);
        setTimeout(() => setShowRestoreNotification(false), 10000);
      }
    }
  }, [projectId, navigate]);

  // Set up autosave interval
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (unsavedChanges) {
        if (projectId) {
          handleSaveToProject();
          persistSaveStatus('Auto-saved to project', 3000);
        } else {
          // If no project, save to localStorage
          saveToLocalStorage();
          persistSaveStatus('Auto-saved locally', 3000);
        }
        setUnsavedChanges(false);
      }
    }, 60000); // Autosave every minute

    return () => clearInterval(saveInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsavedChanges, projectId]);
  
  // Update these state setters to mark unsaved changes
  const handleShapeChange = (newShapes) => {
    setShapes(newShapes);
    markAsUnsaved();
  };
  
  // Add auto-save functionality
  useEffect(() => {
    let autoSaveInterval;
    
    if (autoSaveEnabled && unsavedChanges) {
      // Set up auto-save every 15 seconds (reduced from 60 seconds)
      autoSaveInterval = setInterval(() => {
        if (projectId && drawingId) {
        handleSaveToProject();
        setSaveStatus('Auto-saved');
          setTimeout(() => setSaveStatus(''), 10000);
        } else {
          // If no project/drawing ID, prompt user to save
          setSaveStatus('Changes need to be saved');
          setTimeout(() => setSaveStatus(''), 15000);
        }
        setUnsavedChanges(false);
      }, 15000); // 15 seconds
    }
    
    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [autoSaveEnabled, unsavedChanges, projectId, drawingId]);
  
  // Add an additional auto-save before page unload
  useEffect(() => {
    const handlePageUnload = () => {
      if (unsavedChanges && projectId && drawingId) {
        // Try to save one last time before unloading
        handleSaveToProject();
      }
    };
    
    window.addEventListener('beforeunload', handlePageUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handlePageUnload);
    };
  }, [unsavedChanges, projectId, drawingId]);
  
  // Add confirmation before navigating away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        // Save one last time to localStorage
        saveToLocalStorage();
        
        const message = 'You have unsaved changes. Your work has been backed up locally, but you should save to project for permanent storage. Are you sure you want to leave?';
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges]);
  
  // Effect to update the preview when code changes
  useEffect(() => {
    if (showPreview && previewIframeRef.current && generatedCode.html) {
      const iframe = previewIframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Write the HTML content to the iframe
      iframeDoc.open();
      iframeDoc.write(generatedCode.html);
      iframeDoc.close();
    }
  }, [showPreview, generatedCode.html]);

  // Update canvas options when related states change
  useEffect(() => {
    setCanvasOptions({
      strokeWidth,
      strokeColor,
      canvasColor: backgroundColor,
      eraserWidth
    });
  }, [strokeWidth, strokeColor, backgroundColor, eraserWidth]);

  // Ensure the eraser is properly handled in the ReactSketchCanvas
  // by setting appropriate eraser width and disabling default erasing when in eraser mode
  useEffect(() => {
    if (canvasRef.current) {
      // If tool is eraser, only use it for elements not the canvas drawings
      // This prevents accidental erasing of the entire canvas
      if (tool === 'eraser') {
        // Set a reasonable eraser width for precision
        setCanvasOptions(prev => ({
          ...prev,
          eraserWidth: 5 // Smaller eraser width for more precision
        }));
        
        // Disable actual canvas erasing to use our custom eraser
        canvasRef.current.eraseMode(false);
      } else {
        // Restore normal eraser width if not in eraser mode
        setCanvasOptions(prev => ({
          ...prev,
          eraserWidth: 10 // Default eraser width
        }));
      }
    }
  }, [tool]);

  // When eraserSize changes, update canvasOptions
  useEffect(() => {
    setCanvasOptions(prev => ({
      ...prev,
      eraserWidth: eraserSize
    }));
  }, [eraserSize]);

  // Helper function to simulate path drawing by creating manual mouse events
  const simulatePathDrawing = (canvas, path) => {
    if (!path || path.length < 2 || !canvas.canvas) return;
    
    const canvasElement = canvas.canvas;
    
    // Save the original event handlers
    const originalMouseDown = canvasElement.onmousedown;
    const originalMouseMove = canvasElement.onmousemove;
    const originalMouseUp = canvasElement.onmouseup;
    
    try {
      // Create a custom event generator
      const createEvent = (type, x, y) => {
        const rect = canvasElement.getBoundingClientRect();
        return new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: rect.left + x,
          clientY: rect.top + y
        });
      };
      
      // Simulate the path drawing
      setTimeout(() => {
        // Simulate starting the path
        const startEvent = createEvent('mousedown', path[0].x, path[0].y);
        canvasElement.dispatchEvent(startEvent);
        
        // Simulate drawing the path
        let pathIndex = 1;
        
        const drawNextPoint = () => {
          if (pathIndex < path.length) {
            const point = path[pathIndex];
            const moveEvent = createEvent('mousemove', point.x, point.y);
            canvasElement.dispatchEvent(moveEvent);
            pathIndex++;
            
            // Use requestAnimationFrame for smoother animation
            requestAnimationFrame(drawNextPoint);
          } else {
            // End the path
            const endEvent = createEvent('mouseup', path[path.length - 1].x, path[path.length - 1].y);
            canvasElement.dispatchEvent(endEvent);
          }
        };
        
        drawNextPoint();
      }, 10);
    } catch (error) {
      console.error('Error simulating path drawing:', error);
      
      // Restore the original handlers
      canvasElement.onmousedown = originalMouseDown;
      canvasElement.onmousemove = originalMouseMove;
      canvasElement.onmouseup = originalMouseUp;
    }
  };

  // Helper function to draw the actual shape path
  const drawShapePath = (canvas, shape) => {
    try {
      // Define paths for different shapes
      if (shape.type === 'rectangle') {
        console.log('Drawing rectangle');
        const left = Math.min(shape.startX, shape.endX);
        const right = Math.max(shape.startX, shape.endX);
        const top = Math.min(shape.startY, shape.endY);
        const bottom = Math.max(shape.startY, shape.endY);
        
        // Create the rectangle path
        const rectPath = [
          { x: left, y: top },
          { x: right, y: top },
          { x: right, y: bottom },
          { x: left, y: bottom },
          { x: left, y: top } // Close the path
        ];
        
        console.log('Rectangle path:', rectPath);
        
        // Try the built-in drawPath method if available
        if (typeof canvas.drawPath === 'function') {
          console.log('Using drawPath method');
          canvas.drawPath(rectPath, false);
        } else {
          console.log('Using simulatePathDrawing fallback');
          simulatePathDrawing(canvas, rectPath);
        }
      } else if (shape.type === 'ellipse') {
        console.log('Drawing ellipse');
        const centerX = (shape.startX + shape.endX) / 2;
        const centerY = (shape.startY + shape.endY) / 2;
        const radiusX = Math.abs(shape.endX - shape.startX) / 2;
        const radiusY = Math.abs(shape.endY - shape.startY) / 2;
        
        // Create points around the ellipse using parametric equation
        const points = 36; // Smoother with more points
        const ellipsePath = [];
        
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * 2 * Math.PI;
          const x = centerX + radiusX * Math.cos(angle);
          const y = centerY + radiusY * Math.sin(angle);
          ellipsePath.push({ x, y });
        }
        
        console.log('Ellipse path with', ellipsePath.length, 'points');
        
        // Draw the ellipse
        if (typeof canvas.drawPath === 'function') {
          console.log('Using drawPath method');
          canvas.drawPath(ellipsePath, false);
        } else {
          console.log('Using simulatePathDrawing fallback');
          simulatePathDrawing(canvas, ellipsePath);
        }
      } else if (shape.type === 'line') {
        console.log('Drawing line');
        // Simple line from start to end point
        const linePath = [
          { x: shape.startX, y: shape.startY },
          { x: shape.endX, y: shape.endY }
        ];
        
        console.log('Line path:', linePath);
        
        // Draw the line
        if (typeof canvas.drawPath === 'function') {
          console.log('Using drawPath method');
          canvas.drawPath(linePath, false);
        } else {
          console.log('Using simulatePathDrawing fallback');
          simulatePathDrawing(canvas, linePath);
        }
      }
    } catch (error) {
      console.error('Error in drawShapePath:', error);
    }
  };

  // Enhanced version of drawShapeOnCanvas with more detailed logging
  const drawShapeOnCanvas = (shape) => {
    console.log('Drawing shape on canvas:', shape);
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref is not available');
      return;
    }
    
    try {
      // Make sure we're not in erase mode
      canvas.eraseMode(false);
      
      // Store the current canvas settings to restore later
      const originalStrokeWidth = canvasOptions.strokeWidth;
      const originalStrokeColor = canvasOptions.strokeColor;
      
      // Apply the shape's stroke settings
      if (!canvas.setStrokeWidth) {
        console.log('Using state update for stroke settings');
        setCanvasOptions(prev => ({
          ...prev,
          strokeWidth: shape.strokeWidth,
          strokeColor: shape.strokeColor
        }));
        
        // Need a small delay to ensure state updates before drawing
        setTimeout(() => {
          drawShapePath(canvas, shape);
        }, 50);
      } else {
        console.log('Using canvas methods for stroke settings');
        canvas.setStrokeWidth(shape.strokeWidth);
        canvas.setStrokeColor(shape.strokeColor);
        drawShapePath(canvas, shape);
      }
    } catch (error) {
      console.error('Error drawing shape on canvas:', error);
    }
  };

  // Initialize the canvas and add custom methods
  useEffect(() => {
    console.log('Initializing canvas', canvasRef.current);
    if (canvasRef.current) {
      // Add drawPath method if not already available
      if (!canvasRef.current.drawPath) {
        console.log('Adding custom drawPath method to canvas');
        canvasRef.current.drawPath = (path, closePath = false) => {
          console.log('Custom drawPath called with', path.length, 'points');
          
          // Implement a custom path drawing method
          if (!path || path.length < 2) {
            console.warn('Path has too few points');
            return;
          }
          
          try {
            // Get the canvas element to simulate events on
            const canvas = canvasRef.current.canvas;
            if (!canvas) {
              console.error('Canvas element not found');
              return;
            }
            
            // Create a function to simulate a mouse event
            const simulateMouseEvent = (eventName, x, y) => {
              const rect = canvas.getBoundingClientRect();
              const event = new MouseEvent(eventName, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: rect.left + x,
                clientY: rect.top + y
              });
              
              // Dispatch event to canvas
              console.log(`Simulating ${eventName} at (${x}, ${y})`);
              canvas.dispatchEvent(event);
            };
            
            // Start the path
            console.log('Starting path at', path[0].x, path[0].y);
            simulateMouseEvent('mousedown', path[0].x, path[0].y);
            
            // Draw the path
            for (let i = 1; i < path.length; i++) {
              console.log('Moving to point', i, 'at', path[i].x, path[i].y);
              simulateMouseEvent('mousemove', path[i].x, path[i].y);
            }
            
            // If closePath, go back to the start
            if (closePath) {
              console.log('Closing path back to', path[0].x, path[0].y);
              simulateMouseEvent('mousemove', path[0].x, path[0].y);
            }
            
            // End the path
            console.log('Ending path at', path[path.length - 1].x, path[path.length - 1].y);
            simulateMouseEvent('mouseup', path[path.length - 1].x, path[path.length - 1].y);
            
            console.log('Path drawing complete');
          } catch (error) {
            console.error('Error in custom drawPath:', error);
          }
        };
      }
    }
  }, [canvasRef.current]);

  // Effect to set up canvas event listeners for shape drawing
  useEffect(() => {
    // No need for extra event listeners now that we handle them directly on the CanvasContainer
    if (['rectangle', 'ellipse', 'line'].includes(tool)) {
      console.log('Shape drawing mode activated:', tool);
      
      // Disable free-style drawing when in shape tool mode
      if (canvasRef.current) {
        canvasRef.current.eraseMode(true); // This prevents drawing on the canvas
      }
      
      return () => {
        // Only restore normal drawing mode when switching to a non-shape tool
        // This ensures shape tools remain active until explicitly changed
        if (!['rectangle', 'ellipse', 'line'].includes(tool)) {
        if (canvasRef.current) {
          canvasRef.current.eraseMode(tool === 'eraser');
          }
        }
      };
    } else {
      // When switching to a non-shape tool, ensure free-style drawing is enabled (unless eraser)
      if (canvasRef.current) {
        canvasRef.current.eraseMode(tool === 'eraser');
      }
    }
  }, [tool]);

  // Additional effect to handle mouse up events globally
  // This ensures that shape drawing state is properly reset if mouse is released outside canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDrawingShape) {
        setIsDrawingShape(false);
        setCurrentShape(null);
        
        // Keep the current shape tool active
        if (['rectangle', 'ellipse', 'line'].includes(tool) && canvasRef.current) {
          canvasRef.current.eraseMode(true);
        }
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDrawingShape, tool]);

  // Improved render current shape preview function
  const renderShapePreview = () => {
    if (!currentShape) return null;
    
    const left = Math.min(currentShape.startX, currentShape.endX);
    const top = Math.min(currentShape.startY, currentShape.endY);
    const width = Math.abs(currentShape.endX - currentShape.startX);
    const height = Math.abs(currentShape.endY - currentShape.startY);
    
    const commonStyles = {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 2
    };

    if (currentShape.type === 'rectangle') {
        return (
          <Box
            sx={{
            ...commonStyles,
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
            border: `2px solid ${strokeColor}`,
            backgroundColor: fillColor || 'rgba(255, 255, 255, 0.5)',
            opacity: 0.7
            }}
          />
        );
    } else if (currentShape.type === 'ellipse') {
        return (
          <Box
            sx={{
            ...commonStyles,
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
            border: `2px solid ${strokeColor}`,
            backgroundColor: fillColor || 'rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
            opacity: 0.7
            }}
          />
        );
    } else if (currentShape.type === 'line') {
      // Calculate the angle for the line
      const angle = Math.atan2(
        currentShape.endY - currentShape.startY,
        currentShape.endX - currentShape.startX
      ) * 180 / Math.PI;
      
      // Calculate the length of the line using Pythagorean theorem
      const length = Math.sqrt(width * width + height * height);
      
        return (
        <Box
          sx={{
            ...commonStyles,
            left: `${currentShape.startX}px`,
            top: `${currentShape.startY}px`,
            width: `${length}px`,
            height: '2px',
            backgroundColor: strokeColor,
            transform: `rotate(${angle}deg)`,
              transformOrigin: '0 0'
            }}
        />
      );
    }
    
        return null;
  };

  // Add a safe canvas method call wrapper 
  const safeCanvasCall = (methodName, ...args) => {
    if (!canvasRef.current) return;
    
    try {
      const method = canvasRef.current[methodName];
      if (typeof method === 'function') {
        return method.apply(canvasRef.current, args);
      }
    } catch (error) {
      console.error(`Error calling ${methodName} on canvas:`, error);
    }
  };

  // Handle tool change with improved state management and safety
  const handleToolChange = (newTool) => {
    console.log(`Tool changed from ${tool} to: ${newTool}`);
    
    // Always reset drawing state when switching tools
    setIsDrawingShape(false);
    setCurrentShape(null);
    
    // Set the new tool
    setTool(newTool);
    
    // If selecting a shape tool, prepare for shape drawing
    if (['rectangle', 'ellipse', 'line'].includes(newTool)) {
      console.log(`Shape drawing mode activated: ${newTool}. Click and drag on canvas to draw.`);
      // Disable free-style drawing when using shape tools
      safeCanvasCall('eraseMode', true);
    } else if (newTool === 'pen') {
      // Enable free-style drawing
      safeCanvasCall('eraseMode', false);
      // Try both method names for stroke color
      safeCanvasCall('setStrokeColor', strokeColor) || safeCanvasCall('strokeColor', strokeColor);
    } else if (newTool === 'eraser') {
      // Enable eraser
      safeCanvasCall('eraseMode', true);
    } else if (newTool === 'select') {
      // Enable selection mode
      safeCanvasCall('eraseMode', true); // Disable drawing in select mode
    } else if (newTool === 'fill') {
      // Fill tool also disables drawing
      safeCanvasCall('eraseMode', true);
    }
  };
  
  // Function to handle fill color
  const handleFillColor = (e) => {
    if (tool !== 'fill') return;
    
    // Get mouse coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);
    
    // Get the current color from canvasOptions - this ensures we have the latest color
    const fillColorToUse = canvasOptions.strokeColor;
    
    console.log('Fill color at:', x, y, 'Using color:', fillColorToUse);
    
    // Check if we're over any shape
    let foundElement = false;
    
    // Check shapes first
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      // Skip shapes on hidden layers
      const layer = layers.find(l => l.id === shape.layerId);
      if (!layer || !layer.visible) continue;
      
      let isInside = false;
      
      if (shape.type === 'rectangle') {
        const left = Math.min(shape.startX, shape.endX);
        const top = Math.min(shape.startY, shape.endY);
        const right = Math.max(shape.startX, shape.endX);
        const bottom = Math.max(shape.startY, shape.endY);
        
        isInside = x >= left && x <= right && y >= top && y <= bottom;
      } else if (shape.type === 'ellipse') {
        const centerX = (shape.startX + shape.endX) / 2;
        const centerY = (shape.startY + shape.endY) / 2;
        const radiusX = Math.abs(shape.endX - shape.startX) / 2;
        const radiusY = Math.abs(shape.endY - shape.startY) / 2;
        
        // Check if point is inside ellipse using the formula (x-h)²/a² + (y-k)²/b² <= 1
        const normalizedX = (x - centerX) / radiusX;
        const normalizedY = (y - centerY) / radiusY;
        isInside = (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
      } else if (shape.type === 'line') {
        // For lines, check if point is close to the line
        const dx = shape.endX - shape.startX;
        const dy = shape.endY - shape.startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate distance from point to line
        const distance = Math.abs((dy * x - dx * y + shape.endX * shape.startY - shape.endY * shape.startX) / length);
        isInside = distance <= shape.strokeWidth * 2;
      }
      
      if (isInside) {
        // Apply fill color - use strokeColor for consistency with other tools
        console.log('Filling shape with color:', fillColorToUse);
        const newShapes = [...shapes];
        
        // For line, we change the stroke color instead
        if (shape.type === 'line') {
          newShapes[i] = {
            ...shape,
            strokeColor: fillColorToUse
          };
        } else {
          newShapes[i] = {
            ...shape,
            fillColor: fillColorToUse
          };
        }
        
        setShapes(newShapes);
        
        // Also update the selected element if it's the one we filled
        if (selectedElement?.type === 'shape' && selectedElement.id === shape.id) {
          const updatedProperty = shape.type === 'line' ? 'strokeColor' : 'fillColor';
          handleUpdateShapeProperty(updatedProperty, fillColorToUse);
        }
        
        foundElement = true;
        break;
      }
    }
    
    // If no shape was found, we could try to fill a canvas region (more complex)
    if (!foundElement) {
      console.log('No shape found to fill');
    }
  };
  
  // Improved eraser function to delete any element more selectively
  const handleEraser = (e) => {
    console.log('Using eraser tool');
    
    // Get mouse coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);
    
    // Find elements at these coordinates to delete
    const tolerance = eraserSize; // Use adjustable eraserSize as tolerance
    
    // Check for shapes to delete
    const shapeToDelete = shapes.find(shape => {
      if (shape.type === 'rectangle' || shape.type === 'ellipse') {
        const left = Math.min(shape.startX, shape.endX);
        const top = Math.min(shape.startY, shape.endY);
        const width = Math.abs(shape.endX - shape.startX);
        const height = Math.abs(shape.endY - shape.startY);
        
        return x >= left - tolerance && x <= left + width + tolerance && 
               y >= top - tolerance && y <= top + height + tolerance;
      } else if (shape.type === 'line') {
        // For lines, check if the click is close to the line
        const dist = distToSegment(
          { x, y },
          { x: shape.startX, y: shape.startY },
          { x: shape.endX, y: shape.endY }
        );
        return dist < tolerance;
      }
      return false;
    });
    
    if (shapeToDelete) {
      console.log('Deleting shape:', shapeToDelete.id);
      setShapes(shapes.filter(s => s.id !== shapeToDelete.id));
      
      // If the deleted shape was selected, clear selection
      if (selectedElement?.type === 'shape' && selectedElement.id === shapeToDelete.id) {
        setSelectedElement(null);
      }
      return;
    }
    
    // Check for text elements to delete
    const textToDelete = textContent.find(text => {
      return Math.abs(x - text.x) < tolerance * 2 && Math.abs(y - text.y) < tolerance * 2;
    });
    
    if (textToDelete) {
      console.log('Deleting text:', textToDelete.id);
      setTextContent(textContent.filter(t => t.id !== textToDelete.id));
      
      // If the deleted text was selected, clear selection
      if (selectedElement?.type === 'text' && selectedElement.id === textToDelete.id) {
        setSelectedElement(null);
      }
      return;
    }
    
    // Check for images to delete
    const imageToDelete = imageElements.find(image => {
      return x >= image.x - image.width/2 - tolerance && 
             x <= image.x + image.width/2 + tolerance && 
             y >= image.y - image.height/2 - tolerance && 
             y <= image.y + image.height/2 + tolerance;
    });
    
    if (imageToDelete) {
      console.log('Deleting image:', imageToDelete.id);
      setImageElements(imageElements.filter(img => img.id !== imageToDelete.id));
      
      // If the deleted image was selected, clear selection
      if (selectedElement?.type === 'image' && selectedElement.id === imageToDelete.id) {
        setSelectedElement(null);
      }
      return;
    }
    
    // Check for components to delete
    const componentToDelete = components.find(comp => {
      return x >= comp.x - tolerance && 
             x <= comp.x + comp.width + tolerance && 
             y >= comp.y - tolerance && 
             y <= comp.y + (comp.height || 40) + tolerance;
    });
    
    if (componentToDelete) {
      console.log('Deleting component:', componentToDelete.id);
      setComponents(components.filter(c => c.id !== componentToDelete.id));
      
      // If the deleted component was selected, clear selection
      if (selectedElement?.type === 'component' && selectedElement.id === componentToDelete.id) {
        setSelectedElement(null);
      }
      return;
    }
    
    // If we reach here, no element was found to delete, use the canvas eraser
    if (canvasRef.current) {
      canvasRef.current.eraseMode(true);
      // Don't need to manually set the freeDrawingBrush.width anymore
      // as this is handled by the ReactSketchCanvas through the eraserWidth prop
    }
  };
  
  // Add a utility function to calculate distance from a point to a line segment (for eraser with lines)
  const distToSegment = (p, v, w) => {
    const l2 = dist2(v, w);
    if (l2 === 0) return dist(p, v);
    
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    
    return dist(p, { 
      x: v.x + t * (w.x - v.x),
      y: v.y + t * (w.y - v.y) 
    });
  };
  
  const dist2 = (v, w) => {
    return Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
  };
  
  const dist = (p, v) => {
    return Math.sqrt(dist2(p, v));
  };
  
  // Function to get mouse coordinates relative to canvas
  const getCanvasCoordinates = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / (zoom / 100),
      y: (e.clientY - rect.top) / (zoom / 100)
    };
  };
  
  // Shape drawing event handlers
  const handleShapeStart = (e) => {
    if (!['rectangle', 'ellipse', 'line'].includes(tool)) return;
    
    console.log('Starting shape drawing:', tool);
    e.preventDefault();
    e.stopPropagation();
    
    // Get position
    const { x, y } = getCanvasCoordinates(e);
    
    // Get the active layer ID
    const activeLayerId = layers.find(layer => layer.active)?.id || layers[0]?.id;
    
    // Create initial shape
    const newShape = {
      id: uuidv4(),
      type: tool,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      strokeColor: strokeColor, // Use the current strokeColor
      strokeWidth: strokeWidth,
      fillColor: tool === 'line' ? 'transparent' : fillColor, // Use the current fillColor, but not for lines
      layerId: activeLayerId
    };
    
    console.log('New shape colors:', { stroke: strokeColor, fill: fillColor });
    console.log('Creating shape on layer:', activeLayerId);
    setCurrentShape(newShape);
    setIsDrawingShape(true);
    
    console.log('Shape started:', newShape);
  };
  
  const handleShapeMove = (e) => {
    if (!isDrawingShape || !currentShape) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Get current position
    const { x, y } = getCanvasCoordinates(e);
    
    // Update shape dimensions
    setCurrentShape(prev => ({
      ...prev,
      endX: x,
      endY: y
    }));
    
    console.log('Shape updating:', currentShape);
  };
  
  // Update handleShapeEnd function to fix the white shape issue
  const handleShapeEnd = (e) => {
    if (!isDrawingShape || !currentShape) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate dimensions
    const width = Math.abs(currentShape.endX - currentShape.startX);
    const height = Math.abs(currentShape.endY - currentShape.startY);
    
    // Only create shape if it has some size
    if (width > 3 || height > 3) {
      console.log('Finalizing shape with dimensions:', width, height);
      
      // Create the final shape with proper fill color and stroke
      const finalShape = { 
        ...currentShape,
        id: Date.now(),
        layerId: layers.find(l => l.active)?.id || layers[0].id, // Ensure the shape has a layer
        strokeColor: strokeColor,
        strokeWidth: 2,
        fillColor: currentShape.type === 'line' ? 'transparent' : (fillColor || 'rgba(200, 200, 200, 0.5)')
      };
      
      // Add the shape to our list
      setShapes(prev => [...prev, finalShape]);
      
      // Mark as unsaved
      markAsUnsaved();
    } else {
      console.log('Shape too small, discarding');
    }
    
    // Reset drawing state
    setIsDrawingShape(false);
    setCurrentShape(null);
    
    // Keep shape tool active
    if (canvasRef.current) {
      canvasRef.current.eraseMode(true);
    }
  }

  // Handle undo
  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
      markAsUnsaved(); // Mark as unsaved
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (canvasRef.current) {
      canvasRef.current.redo();
      markAsUnsaved(); // Mark as unsaved
    }
  };

 

  

  // Handle save drawing
  const handleSaveDrawing = async () => {
    try {
      if (canvasRef.current) {
        const imageData = await canvasRef.current.exportImage('png');
        
        // Save to localStorage as backup
        saveToLocalStorage({
          shapes,
          textContent, 
          imageElements,
          components,
          canvasOptions: {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor
          },
          layers,
          canvasRef,
          lastSaved: new Date().toISOString()
        });
        
        // Allow local download
        const link = document.createElement('a');
        link.href = imageData;
        link.download = 'vibecoder-drawing.png';
        link.click();
        
        // If projectId is already set, save directly to that project
        if (projectId) {
          await handleSaveToProject();
          setUnsavedChanges(false); // Mark as saved
        } else {
          // Open project selector if no project ID
          setShowProjectSelector(true);
        }
      }
    } catch (e) {
      console.error('Error saving drawing:', e);
      persistSaveStatus('Error saving drawing', 15000);
    }
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

  // Add additional debug to the color change handler
  const handleColorChange = (color) => {
    console.log('Color changed to:', color);
    
    if (colorPickerType === 'stroke') {
      setTempStrokeColor(color);
      console.log('Setting temp stroke color:', color);
    } else if (colorPickerType === 'fill') {
      setTempFillColor(color);
      console.log('Setting temp fill color:', color);
    } else if (colorPickerType === 'text') {
      setTempTextItemColor(color);
      console.log('Setting temp text color:', color);
    } else if (colorPickerType === 'background') {
      setTempBackgroundColor(color);
      console.log('Setting temp background color:', color);
    } else if (colorPickerType === 'componentBg') {
      setTempComponentBgColor(color);
      console.log('Setting temp component background color:', color);
    } else if (colorPickerType === 'componentText') {
      setTempComponentTextColor(color);
      console.log('Setting temp component text color:', color);
    } else if (selectedElement) {
      // If we have a selected element, update its color
      if (selectedElement.type === 'shape') {
        if (colorPickerType === 'shapeFill') {
          setTempShapeFillColor(color);
          console.log('Setting temp shape fill color:', color);
        } else {
          setTempShapeStrokeColor(color);
          console.log('Setting temp shape stroke color:', color);
        }
      } else if (selectedElement.type === 'text') {
        setTempTextItemColor(color);
        console.log('Setting temp text item color:', color);
      }
    }
  };
  
  // Update the apply color handler to apply colors immediately for the fill tool
  const handleApplyColor = () => {
    console.log('Applying colors. Stroke:', tempStrokeColor, 'Fill:', tempFillColor);
    
    // Update canvas options
        setCanvasOptions(prev => ({
          ...prev,
      strokeColor: tempStrokeColor || prev.strokeColor,
      fillColor: tempFillColor || prev.fillColor,
      canvasColor: tempBackgroundColor || prev.canvasColor
    }));
    
    // Update selected element colors if any
    if (selectedElement) {
      if (selectedElement.type === 'shape') {
        handleUpdateShapeProperty('strokeColor', tempShapeStrokeColor);
        handleUpdateShapeProperty('fillColor', tempShapeFillColor);
      } else if (selectedElement.type === 'text') {
        handleUpdateTextProperty('color', tempTextItemColor);
      } else if (selectedElement.type === 'component') {
        if (colorPickerType === 'componentBg') {
          handleUpdateComponentProperty('style', {
            ...selectedElement.data.style,
            backgroundColor: tempComponentBgColor
          });
        } else if (colorPickerType === 'componentText') {
          handleUpdateComponentProperty('style', {
            ...selectedElement.data.style,
            color: tempComponentTextColor
          });
        }
      }
    }
    
    // Reset temp colors
    setTempStrokeColor(null);
    setTempFillColor(null);
    setTempBackgroundColor(null);
    setTempTextItemColor(null);
    setTempShapeStrokeColor(null);
    setTempShapeFillColor(null);
    setTempComponentBgColor(null);
    setTempComponentTextColor(null);
    
    // Close color picker
    setColorPickerAnchor(null);
    
    // If fill tool is active, we now have a new color to use
    if (tool === 'fill') {
      console.log('Fill tool is active, new color ready:', canvasOptions.strokeColor);
    }
  };
  
  // Handle selecting a shape
  const handleSelectShape = (shapeId) => {
    const selected = shapes.find(shape => shape.id === shapeId);
    setSelectedElement({
      type: 'shape',
      id: shapeId,
      data: selected
    });
  };
  
  // Handle selecting a text element
  const handleSelectText = (textId) => {
    const selected = textContent.find(text => text.id === textId);
    setSelectedElement({
      type: 'text',
      id: textId,
      data: selected
    });
  };
  
  // Handle updating shape properties
  const handleUpdateShapeProperty = (property, value) => {
    if (!selectedElement || selectedElement.type !== 'shape') return;
    
    setShapes(shapes.map(shape => 
      shape.id === selectedElement.id 
        ? { ...shape, [property]: value } 
        : shape
    ));
  };
  
  // Handle updating text properties
  const handleUpdateTextProperty = (property, value) => {
    if (!selectedElement || selectedElement.type !== 'text') return;
    
    setTextContent(textContent.map(text => 
      text.id === selectedElement.id 
        ? { ...text, [property]: value } 
        : text
    ));
  };
  
  // Enhanced delete function for selected elements
  const handleDeleteSelected = () => {
    if (!selectedElement) return;
    
    console.log(`Deleting selected ${selectedElement.type}:`, selectedElement.id);
    
    if (selectedElement.type === 'shape') {
      setShapes(shapes.filter(shape => shape.id !== selectedElement.id));
    } else if (selectedElement.type === 'text') {
      setTextContent(textContent.filter(text => text.id !== selectedElement.id));
    } else if (selectedElement.type === 'image') {
      setImageElements(imageElements.filter(image => image.id !== selectedElement.id));
    } else if (selectedElement.type === 'component') {
      setComponents(components.filter(comp => comp.id !== selectedElement.id));
    }
    
    setSelectedElement(null);
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  // Handle layer visibility toggle
  const handleLayerVisibilityToggle = (layerId) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible } 
        : layer
    ));
  };

  // Handle layer lock toggle
  const handleLayerLockToggle = (layerId) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, locked: !layer.locked } 
        : layer
    ));
  };

  // Handle layer selection
  const handleLayerSelect = (layerId) => {
    // Save current layer's state before switching
    const currentActiveLayerId = layers.find(layer => layer.active)?.id;
    
    // Update layers
    setLayers(layers.map(layer => 
      ({ ...layer, active: layer.id === layerId })
    ));
    
    // Clear the ReactSketchCanvas since we're changing layers
    // This is because ReactSketchCanvas doesn't support multiple layers natively
    if (canvasRef.current && currentActiveLayerId !== layerId) {
      canvasRef.current.clearCanvas();
      setNotificationStatus(`Switched to Layer ${layerId}`);
      setTimeout(() => setNotificationStatus(''), 3000);
    }
  };

  // Handle add new layer
  const handleAddLayer = () => {
    const newLayerId = Math.max(...layers.map(l => l.id), 0) + 1;
    setLayers([
      ...layers,
      { 
        id: newLayerId, 
        name: `Layer ${newLayerId}`, 
        visible: true, 
        locked: false, 
        active: false 
      }
    ]);
  };

  // Handle delete layer
  const handleDeleteLayer = (layerId) => {
    if (layers.length > 1) {
      const newLayers = layers.filter(layer => layer.id !== layerId);
      // Make sure at least one layer is active
      if (!newLayers.some(layer => layer.active)) {
        newLayers[0].active = true;
      }
      setLayers(newLayers);
    }
  };

  // Handle clear active layer - clears only the shapes on the active layer
  const clearActiveLayer = () => {
    const activeLayerId = layers.find(layer => layer.active)?.id;
    if (!activeLayerId) return;
    
    // Filter out shapes from the active layer only
    setShapes(prevShapes => prevShapes.filter(shape => shape.layerId !== activeLayerId));
    
    // If using ReactSketchCanvas, we need to clear its contents when it's on the active layer
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
    
    setNotificationStatus(`Layer ${activeLayerId} cleared`);
    setTimeout(() => setNotificationStatus(''), 3000);
    
    // Mark as unsaved
    markAsUnsaved();
  };

  // Helper function to get style string for a shape
  const getShapeStyle = (shape) => {
    let styleStr = `{\n`;
    styleStr += `    position: 'absolute',\n`;
    
    if (shape.type === 'rectangle') {
      const left = Math.min(shape.startX, shape.endX);
      const top = Math.min(shape.startY, shape.endY);
      const width = Math.abs(shape.endX - shape.startX);
      const height = Math.abs(shape.endY - shape.startY);
      
      styleStr += `    left: '${left}px',\n`;
      styleStr += `    top: '${top}px',\n`;
      styleStr += `    width: '${width}px',\n`;
      styleStr += `    height: '${height}px',\n`;
      styleStr += `    border: '${shape.strokeWidth}px solid ${shape.strokeColor}',\n`;
      styleStr += `    backgroundColor: '${shape.fillColor || 'transparent'}',\n`;
    } else if (shape.type === 'ellipse') {
      const left = Math.min(shape.startX, shape.endX);
      const top = Math.min(shape.startY, shape.endY);
      const width = Math.abs(shape.endX - shape.startX);
      const height = Math.abs(shape.endY - shape.startY);
      
      styleStr += `    left: '${left}px',\n`;
      styleStr += `    top: '${top}px',\n`;
      styleStr += `    width: '${width}px',\n`;
      styleStr += `    height: '${height}px',\n`;
      styleStr += `    border: '${shape.strokeWidth}px solid ${shape.strokeColor}',\n`;
      styleStr += `    backgroundColor: '${shape.fillColor || 'transparent'}',\n`;
      styleStr += `    borderRadius: '50%',\n`;
    }
    
    styleStr += `    zIndex: 5,\n`;
    styleStr += `  }`;
    
    return styleStr;
  };

  // Improved React component generation with support for all elements
  const generateReactComponent = () => {
    console.log('Generating React component...');
    
    // Capture SVG paths from canvas
    let svgPaths = [];
    if (canvasRef.current) {
      canvasRef.current.exportPaths()
        .then(paths => {
          console.log('Exported paths:', paths);
          svgPaths = paths;
          finishGeneratingComponent(svgPaths);
        })
        .catch(err => {
          console.error('Error exporting paths:', err);
          // Continue with other elements even if paths fail
          finishGeneratingComponent([]);
        });
    } else {
      finishGeneratingComponent([]);
    }
    
    // Function to complete the component generation with all elements
    const finishGeneratingComponent = (paths) => {
      // Start building the component with proper structure
      let componentCode = `import React from 'react';
import { Box, Typography } from '@mui/material';

`;

      // Add a function to draw SVG paths if needed
      if (paths.length > 0) {
        componentCode += `// Helper function to draw paths on canvas
const drawPathOnCanvas = (ctx, path) => {
  if (!path || !path.paths) return;
  const { strokeWidth, strokeColor, paths } = path;
  ctx.beginPath();
  ctx.strokeStyle = strokeColor || '#000000';
  ctx.lineWidth = strokeWidth || 2;
  
  paths.forEach((point) => {
    if (!point) return;
    const [command, ...coords] = point.split(' ');
    if (command === 'M') {
      ctx.moveTo(parseFloat(coords[0]), parseFloat(coords[1]));
    } else if (command === 'L') {
      ctx.lineTo(parseFloat(coords[0]), parseFloat(coords[1]));
    }
  });
  
  ctx.stroke();
};

`;
      }
      
      // Add CSS styles section
      componentCode += `// Styles for the component
const styles = {
  container: {
    position: 'relative',
    width: '${canvasDimensions.width}px',
    height: '${canvasDimensions.height}px',
    backgroundColor: '${backgroundColor || '#ffffff'}',
    overflow: 'hidden',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
`;
      
      // Add styles for shapes
      shapes.forEach((shape, index) => {
        componentCode += `  shape${index}: {
    position: 'absolute',
    left: '${shape.x}px',
    top: '${shape.y}px',
    width: '${shape.width}px',
    height: '${shape.height}px',
    backgroundColor: '${shape.fillColor || fillColor}',
    border: '${shape.strokeWidth || strokeWidth}px solid ${shape.strokeColor || strokeColor}',`;
        
        if (shape.type === 'ellipse') {
          componentCode += `
    borderRadius: '50%',`;
        } else if (shape.type === 'rectangle') {
          componentCode += `
    borderRadius: '${shape.borderRadius || 0}px',`;
        }
        
        componentCode += `
    zIndex: 2,
  },
`;
      });
      
      // Add styles for text elements
      textContent.forEach((text, index) => {
        componentCode += `  text${index}: {
    position: 'absolute',
    left: '${text.x}px',
    top: '${text.y}px',
    fontFamily: '${text.fontFamily || 'Arial'}',
    fontSize: '${text.fontSize || 16}px',
    fontWeight: '${text.fontWeight || 'normal'}',
    color: '${text.color || '#000000'}',
    zIndex: 10,
  },
`;
      });
      
      // Add styles for images
      imageElements.forEach((image, index) => {
        componentCode += `  image${index}: {
    position: 'absolute',
    left: '${image.x - (image.width/2)}px',
    top: '${image.y - (image.height/2)}px',
    width: '${image.width}px',
    height: '${image.height}px',
    opacity: ${(image.opacity || 100) / 100},
    transform: 'rotate(${image.rotation || 0}deg)',
    zIndex: 5,
    objectFit: 'contain',
  },
`;
      });
      
      // Add component-specific styles with proper vertical spacing
      const ySpacing = 120; // Vertical spacing between components
      components.forEach((component, index) => {
        const yPos = 100 + (index * ySpacing);
        
        componentCode += `  component${index}: {
    position: 'absolute',
    left: '${component.x}px',
    top: '${yPos}px',
    width: '${component.width}px',
    height: '${component.height || 'auto'}px',
    backgroundColor: '${component.style?.backgroundColor || '#ffffff'}',
    color: '${component.style?.color || '#000000'}',
    padding: '${component.style?.padding || '12px'}',
    borderRadius: '${component.style?.borderRadius || '8px'}',
    border: '${component.style?.border || '1px solid rgba(0,0,0,0.12)'}',
    fontFamily: '${component.style?.fontFamily || 'Inter, Roboto, Arial'}',
    fontSize: '${component.style?.fontSize || '14px'}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
`;
      });
      
      // Add SVG style for canvas element
      if (paths && paths.length > 0) {
        componentCode += `  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none',
  },
`;
      }
      
      componentCode += `};

`;
      
      // Create the component
      componentCode += `const GeneratedComponent = () => {`;
      
      // Add canvas ref and effect for path drawing if needed
      if (paths && paths.length > 0) {
        componentCode += `
  const canvasRef = useRef(null);

  // Effect to draw paths on the canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = ${canvasDimensions.width};
    canvas.height = ${canvasDimensions.height};
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all paths
    const paths = ${JSON.stringify(paths, null, 2)};
    paths.forEach(path => drawPathOnCanvas(ctx, path));
  }, []);
`;
      }
      
      componentCode += `
  return (
    <Box sx={styles.container}>`;
      
      // Add canvas for free-style drawings
      if (paths && paths.length > 0) {
        componentCode += `
      {/* Free-style drawings */}
      <canvas ref={canvasRef} style={styles.canvas} />`;
      }
      
      // Add shapes
      if (shapes.length > 0) {
        componentCode += `

      {/* Shapes */}`;
        shapes.forEach((shape, index) => {
          if (shape.type === 'rectangle' || shape.type === 'ellipse') {
            componentCode += `
      <Box sx={styles.shape${index}} />`;
          } else if (shape.type === 'line') {
            componentCode += `
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
        <line x1={${shape.startX}} y1={${shape.startY}} x2={${shape.endX}} y2={${shape.endY}} stroke="${shape.strokeColor || strokeColor}" strokeWidth={${shape.strokeWidth || strokeWidth}} />
      </svg>`;
          }
        });
      }
      
      // Add text elements
      if (textContent.length > 0) {
        componentCode += `

      {/* Text elements */}`;
        textContent.forEach((text, index) => {
          componentCode += `
      <Typography sx={styles.text${index}}>${text.content}</Typography>`;
        });
      }
      
      // Add images
      if (imageElements.length > 0) {
        componentCode += `

      {/* Images */}`;
        imageElements.forEach((image, index) => {
          // Convert image src to base64 for embedding in the component
          componentCode += `
      <Box component="img" src="${image.src}" alt="Generated content" sx={styles.image${index}} />`;
        });
      }
      
      // Add components
      if (components.length > 0) {
        componentCode += `

      {/* UI Components */}`;
        
        components.forEach((component, index) => {
          if (component.type === 'button') {
            componentCode += `
      <Box 
        component="button"
        sx={styles.component${index}}
      >
        ${component.content || 'Button'}
      </Box>`;
          } else if (component.type === 'input' || component.type === 'textfield') {
            componentCode += `
      <Box 
        component="input"
        placeholder="${component.content || 'Input'}" 
        sx={styles.component${index}}
      />`;
          } else if (component.type === 'checkbox') {
            componentCode += `
      <Box sx={styles.component${index}}>
        <input type="checkbox" id="checkbox${index}" />
        <label htmlFor="checkbox${index}" style={{ marginLeft: '8px' }}>${component.content || 'Checkbox'}</label>
      </Box>`;
          } else if (component.type === 'dropdown') {
            componentCode += `
      <Box component="select" sx={styles.component${index}}>
        <option value="">Select an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </Box>`;
          } else if (component.type === 'card') {
            componentCode += `
      <Box sx={styles.component${index}}>
        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          ${component.content || 'Card Title'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Card Content
        </Typography>
      </Box>`;
          } else {
            componentCode += `
      <Box sx={styles.component${index}}>
        ${component.content || component.type}
      </Box>`;
          }
        });
      }
      
      componentCode += `
    </Box>
  );
};

export default GeneratedComponent;`;
      
      // Generate HTML/CSS version as well
      const { html, css } = generateHtmlCssVersion(paths);
      
      // Set the generated code in state and show the panel
      setGeneratedCode({
        react: componentCode,
        html: html,
        css: css
      });
      
      setShowGeneratedCode(true);
    };
  };
  
  // Improved HTML/CSS generation
  const generateHtmlCssVersion = (paths) => {
    console.log('Generating HTML/CSS version...');
    
    // Calculate better positions for components to avoid overlap
    const ySpacing = 120; // Vertical spacing between components
    
    // Generate CSS styles
    let cssContent = `/* VibeCoder Generated CSS */
.drawing-container {
  position: relative;
  width: ${canvasDimensions.width}px;
  height: ${canvasDimensions.height}px;
  background-color: ${backgroundColor || '#ffffff'};
  overflow: hidden;
  margin: 0 auto;
  box-sizing: border-box;
}

.drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}`;
    
    // Add styles for shapes
    shapes.forEach((shape, index) => {
      cssContent += `
.shape-${index} {
  position: absolute;
  left: ${shape.x}px;
  top: ${shape.y}px;
  width: ${shape.width}px;
  height: ${shape.height}px;
  background-color: ${shape.fillColor || fillColor};
  border: ${shape.strokeWidth || strokeWidth}px solid ${shape.strokeColor || strokeColor};
  z-index: 2;`;
      
      if (shape.type === 'ellipse') {
        cssContent += `
  border-radius: 50%;`;
      } else if (shape.type === 'rectangle' && shape.borderRadius) {
        cssContent += `
  border-radius: ${shape.borderRadius}px;`;
      }
      
      cssContent += `
}`;
    });
    
    // Add styles for text elements
    textContent.forEach((text, index) => {
      cssContent += `
.text-${index} {
  position: absolute;
  left: ${text.x}px;
  top: ${text.y}px;
  font-family: ${text.fontFamily || 'Arial'}, sans-serif;
  font-size: ${text.fontSize || 16}px;
  font-weight: ${text.fontWeight || 'normal'};
  color: ${text.color || '#000000'};
  z-index: 10;
}`;
    });
    
    // Add styles for images
    imageElements.forEach((image, index) => {
      cssContent += `
.image-${index} {
  position: absolute;
  left: ${image.x - (image.width/2)}px;
  top: ${image.y - (image.height/2)}px;
  width: ${image.width}px;
  height: ${image.height}px;
  opacity: ${(image.opacity || 100) / 100};
  transform: rotate(${image.rotation || 0}deg);
  z-index: 5;
  object-fit: contain;
}`;
    });
    
    // Add styles for components
    components.forEach((component, index) => {
      // Position each component with proper vertical spacing
      const yPos = 100 + (index * ySpacing);
      
      cssContent += `
.component-${component.type}-${index} {
  position: absolute;
  left: ${component.x}px;
  top: ${yPos}px;
  width: ${component.width}px;
  height: ${component.height || 'auto'}px;
  background-color: ${component.style?.backgroundColor || '#ffffff'};
  color: ${component.style?.color || '#000000'};
  padding: ${component.style?.padding || '12px'};
  border-radius: ${component.style?.borderRadius || '8px'};
  border: ${component.style?.border || '1px solid rgba(0,0,0,0.12)'};
  font-family: ${component.style?.fontFamily || 'Inter, Roboto, Arial'};
  font-size: ${component.style?.fontSize || 14}px;
  display: flex;
  align-items: center;
  justify-content: center;
}`;

      // Add special styles for interactive components
      if (component.type === 'button') {
        cssContent += `
.component-${component.type}-${index}:hover {
  opacity: 0.9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
}`;
      } else if (component.type === 'input' || component.type === 'textfield') {
        cssContent += `
.component-${component.type}-${index}:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  outline: none;
}`;
      }
    });
    
    // Generate HTML
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibeCoder Drawing</title>
  <style>
${cssContent}
  </style>
</head>
<body>
  <div class="drawing-container">`;
    
    // Add canvas for paths
    if (paths && paths.length > 0) {
      html += `
    <!-- Free-style drawings -->
    <canvas class="drawing-canvas" id="drawingCanvas"></canvas>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const canvas = document.getElementById('drawingCanvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = ${canvasDimensions.width};
        canvas.height = ${canvasDimensions.height};
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw all paths
        const paths = ${JSON.stringify(paths, null, 2)};
        
        paths.forEach(function(path) {
          if (!path || !path.paths) return;
          
          const { strokeWidth, strokeColor, paths } = path;
          ctx.beginPath();
          ctx.strokeStyle = strokeColor || '#000000';
          ctx.lineWidth = strokeWidth || 2;
          
          paths.forEach(function(point, index) {
            if (!point) return;
            const parts = point.split(' ');
            const command = parts[0];
            const x = parseFloat(parts[1]);
            const y = parseFloat(parts[2]);
            
            if (command === 'M') {
              ctx.moveTo(x, y);
            } else if (command === 'L') {
              ctx.lineTo(x, y);
            }
          });
          
          ctx.stroke();
        });
      });
    </script>`;
    }
    
    // Add shapes
    shapes.forEach((shape, index) => {
      if (shape.type === 'rectangle' || shape.type === 'ellipse') {
        html += `
    <div class="shape-${index}"></div>`;
      } else if (shape.type === 'line') {
        html += `
    <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5;">
      <line x1="${shape.startX}" y1="${shape.startY}" x2="${shape.endX}" y2="${shape.endY}" stroke="${shape.strokeColor || strokeColor}" stroke-width="${shape.strokeWidth || strokeWidth}" />
    </svg>`;
      }
    });
    
    // Add text elements
    textContent.forEach((text, index) => {
      html += `
    <div class="text-${index}">${text.content}</div>`;
    });
    
    // Add images
    imageElements.forEach((image, index) => {
      html += `
    <img src="${image.src}" alt="Generated content" class="image-${index}" />`;
    });
    
    // Add components with proper implementation
    components.forEach((component, index) => {
      if (component.type === 'button') {
        html += `
    <button class="component-${component.type}-${index}">${component.content || 'Button'}</button>`;
      } else if (component.type === 'input' || component.type === 'textfield') {
        html += `
    <input type="text" class="component-${component.type}-${index}" placeholder="${component.content || 'Input'}" />`;
      } else if (component.type === 'checkbox') {
        html += `
    <div class="component-${component.type}-${index}">
      <input type="checkbox" id="checkbox-${index}" />
      <label for="checkbox-${index}" style="margin-left: 8px;">${component.content || 'Checkbox'}</label>
    </div>`;
      } else if (component.type === 'dropdown') {
        html += `
    <select class="component-${component.type}-${index}">
      <option value="">Select an option</option>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
      <option value="option3">Option 3</option>
    </select>`;
      } else if (component.type === 'card') {
        html += `
    <div class="component-${component.type}-${index}">
      <h3 style="margin-bottom: 8px;">${component.content || 'Card Title'}</h3>
      <p style="color: #666;">Card Content</p>
    </div>`;
      } else {
        html += `
    <div class="component-${component.type}-${index}">${component.content || component.type}</div>`;
      }
    });
    
    html += `
  </div>
</body>
</html>`;
    
    return { html, css: cssContent };
  };

  // Handle text dialog open
  const handleTextDialogOpen = () => {
    setShowTextDialog(true);
  };

  // Handle text dialog close
  const handleTextDialogClose = () => {
    setShowTextDialog(false);
  };

  // Modify handleAddText to mark unsaved changes
  const handleAddText = () => {
    if (!textInput.trim()) {
    handleTextDialogClose();
      return;
    }
    
    const activeLayerId = layers.find(layer => layer.active)?.id;
    
    if (activeLayerId) {
      // Create a new text object
      const newText = {
        id: Date.now(),
        type: 'text',
        content: textInput,
        fontFamily: textFontFamily || 'Arial',
        fontSize: textFontSize || 16,
        color: strokeColor || '#000000',
        x: canvasDimensions.width / 2,
        y: canvasDimensions.height / 2,
        layerId: activeLayerId
      };
      
      // Add to text content array
      setTextContent([...textContent, newText]);
      
      // In a real implementation, you would render this text on the canvas
      // This depends on the canvas library being used
      
      // For ReactSketchCanvas, we'd need a custom way to display text
      // since it doesn't natively support text elements
      
      // One approach would be to create a div positioned absolutely over the canvas
      console.log('Adding text to canvas:', newText);
    }
    
    // Reset input and close dialog
    setTextInput('');
    handleTextDialogClose();
    markAsUnsaved(); // Mark as unsaved
  };

  // Handle canvas size dialog open
  const handleCanvasSizeDialogOpen = () => {
    setShowCanvasSizeDialog(true);
  };

  // Handle canvas size dialog close
  const handleCanvasSizeDialogClose = () => {
    setShowCanvasSizeDialog(false);
  };

  // Handle canvas size change
  const handleCanvasSizeChange = () => {
    if (newCanvasWidth > 0 && newCanvasHeight > 0) {
      setCanvasDimensions({
        width: newCanvasWidth,
        height: newCanvasHeight
      });
      
      // If using ReactSketchCanvas, we need to update its dimensions
      if (canvasRef.current) {
        // Set dimensions in the style
        const canvasElement = canvasRef.current.canvas;
        if (canvasElement) {
          canvasElement.style.width = `${newCanvasWidth}px`;
          canvasElement.style.height = `${newCanvasHeight}px`;
        }
      }
    }
    
    handleCanvasSizeDialogClose();
  };

  // Modify handleAddComponent to track unsaved changes
  const handleAddComponent = (componentType) => {
    // Create component based on type with default styles
    const newComponent = {
      id: `component-${Date.now()}`,
      type: componentType,
      x: canvasWidth / 2 - 100,
      y: canvasHeight / 2 - 50,
      width: 200,
      height: 100,
      style: {  // Add default style object
        backgroundColor: '#ffffff',
        color: '#000000',
        borderRadius: '8px',
        border: '1px solid rgba(0,0,0,0.12)',
        padding: '12px',
        fontFamily: 'Inter, Roboto, Arial',
        fontSize: 14,
        textAlign: 'center'
      },
      content: `${componentType} Component`
    };
    
    setComponents(prev => [...prev, newComponent]);
    markAsUnsaved();
  };

  // Function to handle component dragging
  const handleComponentDragStart = (e, component) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get initial position
    const startX = e.clientX;
    const startY = e.clientY;
    const startCompX = component.x;
    const startCompY = component.y;
    
    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      
      // Calculate the new position considering zoom level
      const deltaX = (moveEvent.clientX - startX) / (zoom / 100);
      const deltaY = (moveEvent.clientY - startY) / (zoom / 100);
      
      // Find the component in the array
      const updatedComponent = {
        ...component,
        x: startCompX + deltaX,
        y: startCompY + deltaY
      };
      
      // Update components state
      setComponents(prevComponents => 
        prevComponents.map(comp => 
          comp.id === component.id ? updatedComponent : comp
        )
      );
      
      // Update the selected element and component references
      if (selectedElement?.id === component.id) {
        setSelectedElement({
          ...selectedElement,
          data: updatedComponent
        });
        setSelectedComponent(updatedComponent);
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      markAsUnsaved();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Function to handle component selection
  const handleSelectComponent = (componentId) => {
    const component = components.find(comp => comp.id === componentId);
    if (component) {
      setSelectedComponent(component);
      setSelectedElement({
        type: 'component',
        id: component.id,
        data: component
      });
    }
  };

  // Function to update component properties
  const handleUpdateComponentProperty = (property, value) => {
    if (!selectedComponent) return;
    
    // Create a new updated component
    const updatedComponent = {
      ...selectedComponent,
      [property]: value
    };
    
    // Update components array
    setComponents(prevComponents => 
      prevComponents.map(comp => 
        comp.id === selectedComponent.id ? updatedComponent : comp
      )
    );
    
    // Also update the selected component reference
    setSelectedComponent(updatedComponent);
    
    // Update the selected element reference
    setSelectedElement(prev => ({
            ...prev,
      data: updatedComponent
    }));
    
    markAsUnsaved();
  };

  // Update the return statement to directly render components
  // Near the end of the component before the final return
  // Add a useEffect to log components after they are added
  useEffect(() => {
    if (components.length > 0) {
      console.log('Components updated:', components);
    }
  }, [components]);

  // Update renderComponent for improved visibility
  const renderComponent = (component) => {
    const isSelected = selectedElement?.type === 'component' && selectedElement.id === component.id;

  return (
      <Box
        key={component.id}
        sx={{
          position: 'absolute',
          left: `${component.x}px`,
          top: `${component.y}px`,
          width: `${component.width}px`,
          height: component.type === 'card' ? `${component.height}px` : 'auto',
          backgroundColor: component.style?.backgroundColor || '#ffffff',
          color: component.style?.color || '#000000',
          borderRadius: component.style?.borderRadius || '8px',
          border: isSelected ? '2px solid #2196f3' : component.style?.border || '1px solid rgba(0,0,0,0.12)',
          padding: component.style?.padding || '12px',
          fontFamily: component.style?.fontFamily || 'Inter, Roboto, Arial',
          fontSize: component.style?.fontSize ? `${component.style.fontSize}px` : '14px',
          textAlign: component.style?.textAlign || 'center',
          cursor: tool === 'select' ? 'move' : 'default',
          boxShadow: isSelected ? '0 0 0 2px rgba(33,150,243,0.3)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          zIndex: isSelected ? 600 : 500,
          pointerEvents: tool === 'select' ? 'auto' : 'none',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top left'
        }}
        onClick={(e) => {
          if (tool === 'select') {
            e.stopPropagation();
            handleSelectComponent(component.id);
          }
        }}
        onMouseDown={(e) => {
          if (tool === 'select') {
            handleComponentDragStart(e, component);
          }
        }}
      >
        {/* Component content */}
        <Box sx={{ width: '100%', height: '100%' }}>
        {component.type === 'button' && (
          <Button 
            variant="contained" 
            sx={{
              width: '100%',
                height: '100%',
              textTransform: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}
          >
              {component.content || 'Button'}
          </Button>
        )}
        {component.type === 'input' && (
          <TextField
              fullWidth
            variant="outlined"
              placeholder={component.content || 'Input'}
              sx={{ height: '100%' }}
            />
          )}
        {component.type === 'card' && (
            <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6">{component.content || 'Card Title'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Card content goes here
                </Typography>
            </CardContent>
          </Card>
        )}
        </Box>
        
        {/* Resize handles - only show when selected and in select mode */}
        {isSelected && tool === 'select' && (
          <>
            {/* Top resize handle */}
            <Box
              sx={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                left: '50%',
                top: '-6px',
                marginLeft: '-6px',
                backgroundColor: 'primary.main',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: 'ns-resize',
                zIndex: 1001,
              }}
              onMouseDown={(e) => handleComponentResize(component.id, 'top', e)}
            />
            
            {/* Left resize handle */}
            <Box
              sx={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                left: '-6px',
                top: '50%',
                marginTop: '-6px',
                backgroundColor: 'primary.main',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: 'ew-resize',
                zIndex: 1001,
              }}
              onMouseDown={(e) => handleComponentResize(component.id, 'left', e)}
            />
            
            {/* Right resize handle */}
            <Box
              sx={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                right: '-6px',
                top: '50%',
                marginTop: '-6px',
                backgroundColor: 'primary.main',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: 'ew-resize',
                zIndex: 1001,
              }}
              onMouseDown={(e) => handleComponentResize(component.id, 'right', e)}
            />
            
            {/* Bottom resize handle */}
            <Box
              sx={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                left: '50%',
                bottom: '-6px',
                marginLeft: '-6px',
                backgroundColor: 'primary.main',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: 'ns-resize',
                zIndex: 1001,
              }}
              onMouseDown={(e) => handleComponentResize(component.id, 'bottom', e)}
            />
            
            {/* Top-left corner resize handle */}
            <Box
              sx={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                left: '-6px',
                top: '-6px',
                backgroundColor: 'primary.main',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: 'nwse-resize',
                zIndex: 1001,
              }}
              onMouseDown={(e) => handleComponentResize(component.id, 'topLeft', e)}
            />
            
            {/* Top-right corner resize handle */}
            <Box
              sx={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                right: '-6px',
                top: '-6px',
                backgroundColor: 'primary.main',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: 'nesw-resize',
                zIndex: 1001,
              }}
              onMouseDown={(e) => handleComponentResize(component.id, 'topRight', e)}
            />
            
            {/* Bottom-left corner resize handle */}
            <Box
              sx={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                left: '-6px',
                bottom: '-6px',
                backgroundColor: 'primary.main',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: 'nesw-resize',
                zIndex: 1001,
              }}
              onMouseDown={(e) => handleComponentResize(component.id, 'bottomLeft', e)}
            />
            
            {/* Bottom-right corner resize handle */}
            <Box
              sx={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                right: '-6px',
                bottom: '-6px',
                backgroundColor: 'primary.main',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: 'nwse-resize',
                zIndex: 1001,
              }}
              onMouseDown={(e) => handleComponentResize(component.id, 'bottomRight', e)}
            />
          </>
        )}
      </Box>
    );
  };

  // Now add resize handles to text elements
  // Find the text element rendering code around line 3000-3050 and add resize handles
  // Add this inside the text rendering section, inside the return statement
  // right after the closing {text.content} line
  // Update the text rendering with resize handles
  const handleTextResize = (textId, e) => {
    const text = textContent.find(t => t.id === textId);
    if (!text) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startFontSize = text.fontSize;
    
    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      
      // Scale considering zoom level
      const scaledDeltaY = deltaY / (zoom / 100);
      
      // Adjust font size (make it larger when dragging down)
      const newFontSize = Math.max(8, startFontSize + (scaledDeltaY / 2));
      
      handleUpdateTextProperty('fontSize', newFontSize);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    e.stopPropagation();
    e.preventDefault();
  };

  // Add function to handle opening the component editing dialog
  const handleEditComponentOpen = (component) => {
    setEditingComponent(component);
    setEditComponentContent(component.content);
    setEditComponentDialogOpen(true);
  };

  // Add function to handle saving component edits
  const handleSaveComponentEdit = () => {
    if (editingComponent) {
      handleUpdateComponentProperty('content', editComponentContent);
      setEditComponentDialogOpen(false);
      setEditingComponent(null);
    }
  };

  // Modify handleSaveToProject to track saved state
  const handleSaveToProject = async (project = null) => {
    try {
      persistSaveStatus('Saving...', 30000);
      
      // Clear any existing project data from localStorage first
      clearLocalProjectData();
      
      if (!canvasRef.current) {
        throw new Error('Canvas not initialized');
      }
      
      // Export the drawing as PNG data URL
      const imageData = await canvasRef.current.exportImage('png');
      
      // Get all the shapes, text, and other elements as structured data
      const drawingStructure = {
        shapes,
        textContent,
        imageElements,
        components,
        canvasOptions: {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor
        },
        layers
      };
      
      // Combine image data and structure into one object
      const drawingData = {
        name: 'Drawing ' + new Date().toLocaleString(),
        content: JSON.stringify({
          imageData,
          structure: drawingStructure
        })
      };
      
      // Save to the specified project or the current project
      const targetProjectId = project ? project._id : projectId;
      
      if (!targetProjectId) {
        // If no project is selected, prompt user to select or create a project
        setShowProjectSelector(true);
        persistSaveStatus('Please select a project to save to', 10000);
        return;
      }
      
      // Check if we're updating an existing drawing or creating a new one
      if (drawingId) {
        await updateDrawing(targetProjectId, drawingId, drawingData);
      } else {
        const result = await saveDrawing(targetProjectId, drawingData);
        // Store the newly created drawing ID
        setDrawingId(result.drawings[result.drawings.length - 1]._id);
        
        // Update URL with projectId if we just created a new project
        if (project && !projectId) {
          navigate(`/draw/${targetProjectId}`);
        }
      }
      
      persistSaveStatus('Saved to project!', 10000);
      setUnsavedChanges(false); // Mark as saved
    } catch (error) {
      console.error('Error saving to project:', error);
      persistSaveStatus('Error saving: ' + error.message, 15000);
    }
  };

  // Add this function to safely handle content splitting
  const safeContentSplit = (content, index = 0, defaultValue = '') => {
    if (!content) return defaultValue;
    const parts = content.split('\n');
    return parts[index] || defaultValue;
  };

  // Then in your component rendering code, replace instances like:
  // component.content.split('\n')[0]
  // with:
  // safeContentSplit(component.content, 0)

  // For example, find this code:
  

  // Add these functions before handleTextResize at line 2633
  // Handler for shape resizing from all sides
  const handleShapeResize = (shapeId, handle, e) => {
    if (tool !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    
    const initialLeft = Math.min(shape.startX, shape.endX);
    const initialTop = Math.min(shape.startY, shape.endY);
    const initialRight = Math.max(shape.startX, shape.endX);
    const initialBottom = Math.max(shape.startY, shape.endY);
    
    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      
      const dx = (moveEvent.clientX - startX) / (zoom / 100);
      const dy = (moveEvent.clientY - startY) / (zoom / 100);
      
      let newStartX = shape.startX;
      let newStartY = shape.startY;
      let newEndX = shape.endX;
      let newEndY = shape.endY;
      
      switch (handle) {
        case 'topLeft':
          newStartX = initialLeft + dx;
          newStartY = initialTop + dy;
          newEndX = initialRight;
          newEndY = initialBottom;
          break;
        case 'topRight':
          newStartX = initialLeft;
          newStartY = initialTop + dy;
          newEndX = initialRight + dx;
          newEndY = initialBottom;
          break;
        case 'bottomLeft':
          newStartX = initialLeft + dx;
          newStartY = initialTop;
          newEndX = initialRight;
          newEndY = initialBottom + dy;
          break;
        case 'bottomRight':
          newStartX = initialLeft;
          newStartY = initialTop;
          newEndX = initialRight + dx;
          newEndY = initialBottom + dy;
          break;
      }
      
      // Update the shape
      setShapes(shapes.map(s => 
        s.id === shapeId 
          ? { ...s, startX: newStartX, startY: newStartY, endX: newEndX, endY: newEndY }
          : s
      ));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      markAsUnsaved();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handler for image resizing from all sides
  const handleImageResize = (imageId, handle, e) => {
    if (tool !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const image = imageElements.find(img => img.id === imageId);
    if (!image) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    
    const originalWidth = image.width;
    const originalHeight = image.height;
    const originalX = image.x;
    const originalY = image.y;
    
    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      
      const dx = (moveEvent.clientX - startX) / (zoom / 100);
      const dy = (moveEvent.clientY - startY) / (zoom / 100);
      
      let newWidth = originalWidth;
      let newHeight = originalHeight;
      let newX = originalX;
      let newY = originalY;
      
      // Handle different resize points
      switch (handle) {
        case 'topLeft':
          newWidth = originalWidth - dx * 2;
          newHeight = originalHeight - dy * 2;
          newX = originalX - dx;
          newY = originalY - dy;
          break;
        case 'topRight':
          newWidth = originalWidth + dx * 2;
          newHeight = originalHeight - dy * 2;
          newX = originalX + dx;
          newY = originalY - dy;
          break;
        case 'bottomLeft':
          newWidth = originalWidth - dx * 2;
          newHeight = originalHeight + dy * 2;
          newX = originalX - dx;
          newY = originalY + dy;
          break;
        case 'bottomRight':
          newWidth = originalWidth + dx * 2;
          newHeight = originalHeight + dy * 2;
          newX = originalX + dx;
          newY = originalY + dy;
          break;
        case 'top':
          newHeight = originalHeight - dy * 2;
          newY = originalY - dy;
          break;
        case 'left':
          newWidth = originalWidth - dx * 2;
          newX = originalX - dx;
          break;
        case 'right':
          newWidth = originalWidth + dx * 2;
          newX = originalX + dx;
          break;
        case 'bottom':
          newHeight = originalHeight + dy * 2;
          newY = originalY + dy;
          break;
      }
      
      // Ensure minimum size
      newWidth = Math.max(20, newWidth);
      newHeight = Math.max(20, newHeight);
      
      // Update the image
      setImageElements(imageElements.map(img => 
        img.id === imageId 
          ? { ...img, x: newX, y: newY, width: newWidth, height: newHeight }
          : img
      ));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      markAsUnsaved();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Add image rotation handler
  const handleImageRotate = (imageId, e) => {
    if (tool !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const image = imageElements.find(img => img.id === imageId);
    if (!image) return;
    
    const imageCenter = {
      x: image.x,
      y: image.y
    };
    
    const startAngle = Math.atan2(
      (e.clientY / (zoom / 100)) - imageCenter.y,
      (e.clientX / (zoom / 100)) - imageCenter.x
    ) * (180 / Math.PI);
    
    const startRotation = image.rotation || 0;
    
    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      
      const currentAngle = Math.atan2(
        (moveEvent.clientY / (zoom / 100)) - imageCenter.y,
        (moveEvent.clientX / (zoom / 100)) - imageCenter.x
      ) * (180 / Math.PI);
      
      let rotationDelta = currentAngle - startAngle;
      
      // Update the image rotation
      setImageElements(imageElements.map(img => 
        img.id === imageId 
          ? { ...img, rotation: (startRotation + rotationDelta) % 360 }
          : img
      ));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      markAsUnsaved();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Add a useEffect to trigger first save after loading
  useEffect(() => {
    // If we have a project ID and drawing has been loaded but not yet saved
    if (projectId && !drawingId && !isLoading) {
      // Set a timer to create the initial save after loading
      const timer = setTimeout(() => {
        handleSaveToProject();
      }, 5000); // Save 5 seconds after initial load
      
      return () => clearTimeout(timer);
    }
  }, [projectId, drawingId, isLoading]);

  const handleComponentResize = (componentId, handle, e) => {
    if (tool !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const component = components.find(c => c.id === componentId);
    if (!component) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = component.width;
    const startHeight = component.type === 'card' ? component.height : 40;
    const startX0 = component.x;
    const startY0 = component.y;
    
    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      
      // Calculate the delta based on zoom level
      const deltaX = (moveEvent.clientX - startX) / (zoom / 100);
      const deltaY = (moveEvent.clientY - startY) / (zoom / 100);
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startX0;
      let newY = startY0;
      
      // Handle different resize points with correct math
      switch (handle) {
        case 'topLeft':
          newWidth = Math.max(50, startWidth - deltaX);
          newX = startX0 + deltaX;
          if (component.type === 'card') {
            newHeight = Math.max(30, startHeight - deltaY);
            newY = startY0 + deltaY;
          }
          break;
        case 'topRight':
          newWidth = Math.max(50, startWidth + deltaX);
          if (component.type === 'card') {
            newHeight = Math.max(30, startHeight - deltaY);
            newY = startY0 + deltaY;
          }
          break;
        case 'bottomLeft':
          newWidth = Math.max(50, startWidth - deltaX);
          newX = startX0 + deltaX;
          if (component.type === 'card') {
            newHeight = Math.max(30, startHeight + deltaY);
          }
          break;
        case 'bottomRight':
          newWidth = Math.max(50, startWidth + deltaX);
          if (component.type === 'card') {
            newHeight = Math.max(30, startHeight + deltaY);
          }
          break;
        case 'top':
          if (component.type === 'card') {
            newHeight = Math.max(30, startHeight - deltaY);
            newY = startY0 + deltaY;
          }
          break;
        case 'left':
          newWidth = Math.max(50, startWidth - deltaX);
          newX = startX0 + deltaX;
          break;
        case 'right':
          newWidth = Math.max(50, startWidth + deltaX);
          break;
        case 'bottom':
          if (component.type === 'card') {
            newHeight = Math.max(30, startHeight + deltaY);
          }
          break;
      }
      
      // Create the updated component with new dimensions and position
      const updatedComponent = {
        ...component,
        width: newWidth,
        x: newX,
        y: newY
      };
      
      // Add height for card components
      if (component.type === 'card') {
        updatedComponent.height = newHeight;
      }
      
      // Update component in the components array
      setComponents(prevComponents => 
        prevComponents.map(comp => 
          comp.id === componentId ? updatedComponent : comp
        )
      );
      
      // Also update the selected element and component references
      if (selectedElement?.id === componentId) {
        setSelectedElement({
          ...selectedElement,
          data: updatedComponent
        });
        setSelectedComponent(updatedComponent);
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      markAsUnsaved();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Add an effect to detect canvas changes and mark as unsaved
  useEffect(() => {
    if (canvasRef.current) {
      // Setup event listener for canvas changes
      const onCanvasChange = () => {
        markAsUnsaved();
      };
      
      // Get the canvas element
      const canvasElement = canvasRef.current.canvas || 
                            canvasRef.current.canvasContainer?.childNodes[0];
      
      if (canvasElement) {
        // Listen for mouseup events which usually indicate drawing has finished
        canvasElement.addEventListener('mouseup', onCanvasChange);
        
        // Cleanup
        return () => {
          canvasElement.removeEventListener('mouseup', onCanvasChange);
        };
      }
    }
  }, [canvasRef.current]);

  // Custom function to set save status with localStorage persistence
  const persistSaveStatus = (status, timeoutMs = 10000) => {
    setSaveStatus(status);
    if (status) {
      // Save to localStorage with expiry timestamp
      localStorage.setItem('vibecoderSaveStatus', status);
      localStorage.setItem('vibecoderSaveStatusTimestamp', (Date.now() + timeoutMs).toString());
      
      // Set timeout to clear status
      setTimeout(() => {
        setSaveStatus('');
        localStorage.removeItem('vibecoderSaveStatus');
        localStorage.removeItem('vibecoderSaveStatusTimestamp');
      }, timeoutMs);
    } else {
      // Clear from localStorage if status is empty
      localStorage.removeItem('vibecoderSaveStatus');
      localStorage.removeItem('vibecoderSaveStatusTimestamp');
    }
  };

  const autoSaveDrawing = useCallback(() => {
    if (unsavedChanges) {
      if (projectId && drawingId) {
        handleSaveToProject();
        persistSaveStatus('Auto-saved', 10000);
      } else {
        // If no project/drawing ID, prompt user to save
        persistSaveStatus('Changes need to be saved', 15000);
      }
      setUnsavedChanges(false);
    }
  }, [unsavedChanges, projectId, drawingId, handleSaveToProject]);

  // Set up autosave interval
  useEffect(() => {
    const saveInterval = setInterval(() => {
      autoSaveDrawing();
    }, 60000); // Autosave every minute

    return () => clearInterval(saveInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up visibility change listener to check save status when coming back to the app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User has returned to the tab/app
        const savedStatus = localStorage.getItem('vibecoderSaveStatus');
        const savedTimestamp = localStorage.getItem('vibecoderSaveStatusTimestamp');
        
        if (savedStatus && savedTimestamp) {
          const expiryTime = parseInt(savedTimestamp, 10);
          // Check if status is still valid (not expired)
          if (expiryTime > Date.now()) {
            setSaveStatus(savedStatus);
            // Reset the timeout
            const timeRemaining = expiryTime - Date.now();
            setTimeout(() => {
              setSaveStatus('');
              localStorage.removeItem('vibecoderSaveStatus');
              localStorage.removeItem('vibecoderSaveStatusTimestamp');
            }, timeRemaining);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  // Add this useEffect near the other useEffect hooks
  useEffect(() => {
    // Only restore if we have empty state
    const shouldRestore = 
      (!shapes || shapes.length === 0) && 
      (!textContent || textContent.length === 0) && 
      (!imageElements || imageElements.length === 0) &&
      (!components || components.length === 0);
      
    if (shouldRestore) {
      try {
        const savedState = localStorage.getItem('vibecoderDrawingState');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          
          // Restore all state values
          if (parsedState.shapes) setShapes(parsedState.shapes);
          if (parsedState.textContent) setTextContent(parsedState.textContent);
          if (parsedState.imageElements) setImageElements(parsedState.imageElements);
          if (parsedState.components) setComponents(parsedState.components);
          if (parsedState.layers) setLayers(parsedState.layers);
          // Instead of using activeLayer and setActiveLayer, update layers
          if (parsedState.activeLayerId) {
            setLayers(prevLayers => 
              prevLayers.map(layer => ({
                ...layer,
                active: layer.id === parsedState.activeLayerId
              }))
            );
          }
          // Now we can use setProjectId directly since it's defined
          if (parsedState.projectId) setProjectId(parsedState.projectId);
          if (parsedState.drawingId) setDrawingId(parsedState.drawingId);
          // Use canvasDimensions instead of canvasSize
          if (parsedState.canvasDimensions) setCanvasDimensions(parsedState.canvasDimensions);
          if (parsedState.zoom) setZoom(parsedState.zoom);
          if (parsedState.strokeColor) setStrokeColor(parsedState.strokeColor);
          if (parsedState.fillColor) setFillColor(parsedState.fillColor);
          if (parsedState.strokeWidth) setStrokeWidth(parsedState.strokeWidth);
          
          console.log('Drawing state restored from localStorage');
        }
      } catch (error) {
        console.error('Error loading drawing state from localStorage:', error);
      }
    }
  }, []);

  // Add this effect to save state when critical data changes
  useEffect(() => {
    if (!shapes && !textContent && !imageElements && !components) return;
    
    try {
      const drawingState = {
        shapes,
        textContent,
        imageElements,
        components,
        layers,
        activeLayer,
        projectId,
        drawingId,
        canvasDimensions, // Use canvasDimensions
        zoom,
        strokeColor,
        fillColor,
        strokeWidth
      };
      localStorage.setItem('vibecoderDrawingState', JSON.stringify(drawingState));
    } catch (error) {
      console.error('Error autosaving drawing state to localStorage:', error);
    }
  }, [shapes, textContent, imageElements, components]);

  // Add window event listeners for better state preservation
  useEffect(() => {
    // Save state when user navigates away or switches tabs
    const handleVisibilityChange = () => {
      if (document.hidden) {
        try {
          const activeLayerId = layers.find(layer => layer.active)?.id || 1;
          const drawingState = {
            shapes,
            textContent,
            imageElements,
            components,
            layers,
            activeLayerId, // Use activeLayerId instead of activeLayer
            projectId,
            drawingId,
            canvasDimensions, // Use canvasDimensions instead of canvasSize
            zoom,
            strokeColor,
            fillColor,
            strokeWidth
          };
          localStorage.setItem('vibecoderDrawingState', JSON.stringify(drawingState));
          console.log('Drawing state saved on visibility change');
        } catch (error) {
          console.error('Error saving on visibility change:', error);
        }
      }
    };
    
    // Save state before the page unloads
    const handleBeforeUnload = () => {
      try {
        const activeLayerId = layers.find(layer => layer.active)?.id || 1;
        const drawingState = {
          shapes,
          textContent,
          imageElements,
          components,
          layers,
          activeLayerId, // Use activeLayerId instead of activeLayer
          projectId,
          drawingId,
          canvasDimensions, // Use canvasDimensions instead of canvasSize
          zoom,
          strokeColor,
          fillColor,
          strokeWidth
        };
        localStorage.setItem('vibecoderDrawingState', JSON.stringify(drawingState));
        console.log('Drawing state saved before unload');
      } catch (error) {
        console.error('Error saving before unload:', error);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shapes, textContent, imageElements, components, layers, 
      projectId, drawingId, canvasDimensions, zoom, strokeColor, fillColor, strokeWidth]);

  // Add cleanup effect for navigation
  useEffect(() => {
    // Save the current state when unmounting
    return () => {
      // Save drawing state one last time before unmounting
      try {
        const activeLayerId = layers.find(layer => layer.active)?.id || 1;
        const drawingState = {
          shapes,
          textContent,
          imageElements,
          components,
          layers,
          activeLayerId,
          projectId,
          drawingId,
          canvasDimensions,
          zoom,
          strokeColor,
          fillColor,
          strokeWidth
        };
        localStorage.setItem('vibecoderDrawingState', JSON.stringify(drawingState));
        console.log('Drawing state saved before navigation');
      } catch (error) {
        console.error('Error saving before navigation:', error);
      }
    };
  }, [shapes, textContent, imageElements, components, layers,
      projectId, drawingId, canvasDimensions, zoom, strokeColor, fillColor, strokeWidth]);

  // Navigation handler to ensure safe navigation between components
  const handleNavigation = (destination) => {
    // Save current state before navigating
    try {
      const activeLayerId = layers.find(layer => layer.active)?.id || 1;
      const drawingState = {
        shapes,
        textContent,
        imageElements,
        components,
        layers,
        activeLayerId,
        projectId,
        drawingId,
        canvasDimensions,
        zoom,
        strokeColor,
        fillColor,
        strokeWidth
      };
      localStorage.setItem('vibecoderDrawingState', JSON.stringify(drawingState));
      console.log(`Navigating to ${destination}`);
      
      // If navigating to a different page, clear local project data
      if (!destination.includes(`/draw/${projectId}`)) {
        clearLocalProjectData();
      }
      
      // Navigate to the desired destination
      navigate(destination);
    } catch (error) {
      console.error('Navigation error:', error);
      // Navigate anyway if there's an error
      navigate(destination);
    }
  };

  // Add this function after persistSaveStatus
  const saveToLocalStorage = () => {
    try {
      // Create a structured data object with all canvas elements
      const canvasData = {
        shapes,
        textContent,
        imageElements,
        components,
        canvasOptions: {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor
        },
        layers,
        lastSaved: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('canvasData', JSON.stringify(canvasData));
      console.log('Canvas saved to localStorage');
      
      // Also save a thumbnail if possible
      if (canvasRef.current) {
        canvasRef.current.exportImage('png')
          .then(dataURL => {
            localStorage.setItem('canvasThumb', dataURL);
          })
          .catch(err => {
            console.error('Failed to save thumbnail:', err);
          });
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Add this function to load from localStorage
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('canvasData');
      if (!savedData) return false;
      
      const canvasData = JSON.parse(savedData);
      
      // Load the structured data if it exists
      if (canvasData) {
        if (canvasData.shapes) setShapes(canvasData.shapes);
        if (canvasData.textContent) setTextContent(canvasData.textContent);
        if (canvasData.imageElements) setImageElements(canvasData.imageElements);
        if (canvasData.components) setComponents(canvasData.components);
        if (canvasData.canvasOptions) {
          if (canvasData.canvasOptions.width) setCanvasWidth(canvasData.canvasOptions.width);
          if (canvasData.canvasOptions.height) setCanvasHeight(canvasData.canvasOptions.height);
          if (canvasData.canvasOptions.backgroundColor) setBackgroundColor(canvasData.canvasOptions.backgroundColor);
        }
        if (canvasData.layers) setLayers(canvasData.layers);
        
        setSaveStatus('Canvas restored from local backup');
        setTimeout(() => setSaveStatus(''), 3000);
        return true;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return false;
  };

  // Enhance the markAsUnsaved function
  const markAsUnsaved = () => {
    setUnsavedChanges(true);
    
    // Save to localStorage when changes are made
    saveToLocalStorage({
      shapes,
      textContent, 
      imageElements,
      components,
      canvasOptions: {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor
      },
      layers,
      canvasRef
    });
  };

  // Update the handleBeforeUnload with a better warning message
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        // Save one last time to localStorage
        saveToLocalStorage();
        
        const message = 'You have unsaved changes. Your work has been backed up locally, but you should save to project for permanent storage. Are you sure you want to leave?';
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges]);

  // Add an effect to load from localStorage on component mount
  useEffect(() => {
    // Only try to load from localStorage if no projectId is provided
    if (!projectId && !isLoading) {
      loadFromLocalStorage({
        setShapes,
        setTextContent,
        setImageElements,
        setComponents,
        setCanvasWidth,
        setCanvasHeight,
        setBackgroundColor,
        setLayers,
        setSaveStatus
      }, setShowRestoreNotification);
    }
  }, [projectId, isLoading]);

  // Update the handleClearCanvas to clear localStorage as well
  const handleClearCanvas = () => {
    setShowClearConfirmDialog(true);
  };

  // Update the executeClearCanvas function
  const executeClearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Clear localStorage first
      clearLocalProjectData();
      
      // Add check for the clearCanvas method
      if (typeof canvas.clearCanvas === 'function') {
        canvas.clearCanvas();
      } else if (canvas.getContext && typeof canvas.getContext === 'function') {
        // Fallback to standard canvas clearing if canvas.clearCanvas is not available
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      } else {
        console.error('Cannot clear canvas: canvas.getContext is not a function');
      }
      setShapes([]);
      setTextContent([]);
      setImageElements([]);
      setComponents([]);
      
      markAsUnsaved(); // Mark as unsaved
    }
    setShowClearConfirmDialog(false);
  };

  // Add a save confirmation dialog state
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);

  // Add after other useEffect hooks  
  // Setup beforeunload handler to warn about unsaved changes
  useEffect(() => {
    const saveCanvasData = () => {
      saveToLocalStorage({
        shapes,
        textContent, 
        imageElements,
        components,
        canvasOptions: {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor
        },
        layers,
        canvasRef
      });
    };
    
    return setupBeforeUnloadHandler(unsavedChanges, saveCanvasData);
  }, [unsavedChanges, shapes, textContent, imageElements, components, canvasWidth, canvasHeight, backgroundColor, layers]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only respond to key presses if not in a text input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Add shortcut keys
      switch (e.key.toLowerCase()) {
        case 'delete':
        case 'backspace':
          if (selectedElement) {
            handleDeleteSelected();
          }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
          }
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault(); // Prevent browser save
            handleSaveDrawing();
          }
          break;
        case 'l':
          if (e.ctrlKey || e.metaKey) {
            // Clear active layer with Ctrl+L
            e.preventDefault();
            clearActiveLayer();
          } else {
            // Create new layer with L key
            handleAddLayer();
            setNotificationStatus('New layer created');
            setTimeout(() => setNotificationStatus(''), 3000);
          }
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        // Add more shortcuts as needed
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, handleDeleteSelected, handleRedo, handleUndo, handleSaveDrawing, clearActiveLayer, handleAddLayer]);

  // Add a cleanup effect to clear localStorage when component unmounts
  useEffect(() => {
    return () => {
      // Clear localStorage when component unmounts to prevent data leakage
      clearLocalProjectData();
    };
  }, []);

  // Add load from localStorage useEffect
  useEffect(() => {
    // Only restore from localStorage if we're not loading a specific project
    if (!projectId) {
      const saved = loadFromLocalStorage();
      // If data was loaded, show notification
      if (saved) {
        setShowRestoreNotification(true);
        // Auto-hide the notification after 10 seconds
        setTimeout(() => setShowRestoreNotification(false), 10000);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  // Add this effect to auto save when critical data changes
  useEffect(() => {
    // Don't save empty data
    if (shapes.length > 0 || textContent.length > 0 || imageElements.length > 0 || components.length > 0) {
      saveToLocalStorage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes, textContent, imageElements, components]);

  // Add useEffect to load canvas data from localStorage on component mount
  useEffect(() => {
    if (!projectId) {
      // Only try to load from localStorage if not loading a specific project
      const savedData = loadFromLocalStorage();
      if (savedData) {
        setShowRestoreNotification(true);
      }
    }
  }, [projectId]);

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      pt: '64px' // Add padding top to account for fixed navbar
    }}>
      {/* Top Toolbar */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 1, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 0,
          position: 'sticky',
          top: '64px', // Position the toolbar right below the navbar
          zIndex: 1000 // Ensure it stays above content
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            Drawing Board
          </Typography>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          
          <ToolbarButton 
            onClick={() => handleToolChange('pen')}
            active={tool === 'pen' ? "true" : "false"}
            title="Pen Tool"
          >
            <CreateIcon />
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={() => handleToolChange('eraser')}
            active={tool === 'eraser' ? "true" : "false"}
            title="Eraser"
          >
            <AutoFixNormalIcon />
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={() => handleToolChange('fill')}
            active={tool === 'fill' ? "true" : "false"}
            title="Fill Tool"
          >
            <FormatPaintIcon />
          </ToolbarButton>
          
          {/* Quick color picker for fill tool */}
          <ToolbarButton 
            onClick={(e) => {
              handleColorPickerOpen(e, 'stroke');
            }}
            title="Pick Fill Color"
          >
            <Box sx={{ 
              width: 20, 
              height: 20, 
              bgcolor: canvasOptions.strokeColor || '#000',
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: 1
            }} />
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={(e) => setShapesMenuAnchor(e.currentTarget)}
            title="Shapes"
            active={['rectangle', 'ellipse', 'line'].includes(tool) ? "true" : "false"}
          >
            <ShapeLineIcon />
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={() => handleToolChange('text')} 
            active={tool === 'text' ? "true" : "false"}
            title="Text Tool"
          >
            <TextFieldsIcon />
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={() => handleToolChange('select')}
            active={tool === 'select' ? "true" : "false"}
            title="Select Tool"
          >
            <PanToolIcon />
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={handleDeleteSelected}
            title="Delete Selected Element"
            disabled={!selectedElement}
          >
            <DeleteIcon color={selectedElement ? 'error' : 'disabled'} />
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={handleUploadImageClick}
            title="Add Image"
          >
            <ImageIcon />
          </ToolbarButton>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          
          <ToolbarButton onClick={handleUndo} title="Undo">
            <UndoIcon />
          </ToolbarButton>
          
          <ToolbarButton onClick={handleRedo} title="Redo">
            <RedoIcon />
          </ToolbarButton>
          
          <ToolbarButton onClick={handleClearCanvas} title="Clear Canvas">
            <DeleteIcon />
          </ToolbarButton>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          
          <ToolbarButton onClick={handleZoomOut} title="Zoom Out">
            <ZoomOutIcon />
          </ToolbarButton>
          
          <Typography variant="body2" sx={{ mx: 1 }}>
            {zoom}%
          </Typography>
          
          <ToolbarButton onClick={handleZoomIn} title="Zoom In">
            <ZoomInIcon />
          </ToolbarButton>
        </Box>
        
        <Box>
          {/* Save Drawing Button */}
          <ToolbarButton
            onClick={handleSaveDrawing}
            title="Save Drawing"
            sx={{ 
              backgroundColor: unsavedChanges ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
              '&:hover': { backgroundColor: unsavedChanges ? 'rgba(255, 0, 0, 0.2)' : undefined },
              position: 'relative'
            }}
          >
            <SaveIcon />
            {unsavedChanges && (
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  backgroundColor: 'red', 
                  borderRadius: '50%', 
                  position: 'absolute', 
                  top: 4, 
                  right: 4 
                }} 
              />
            )}
          </ToolbarButton>

          {/* Generate Code Button */}
          <ToolbarButton
            onClick={generateReactComponent}
            title="Generate Code"
          >
            <CodeIcon />
          </ToolbarButton>
          
          <SaveToProjectButton
            onSave={handleSaveToProject}
            buttonText="Save to Project"
            tooltipText="Save drawing to your projects"
            dialogTitle="Save Drawing to Project"
            saveButtonText="Save Drawing"
            variant="outlined"
            color="secondary"
            sx={{ mx: 0.5 }}
          />
          
          <IconButton
            onClick={toggleShortcutsDialog}
            title="Keyboard Shortcuts"
            sx={{ ml: 1 }}
          >
            <KeyboardIcon />
          </IconButton>
        </Box>
      </Paper>
      
      {/* Main Content */}
      <Grid container sx={{ 
        flexGrow: 1,
        height: 'calc(100vh - 170px)' // Adjust height to account for navbar and toolbar
      }}>
        {/* Left Sidebar */}
        <Grid item xs={2}>
          <Paper elevation={2} sx={{ height: '100%', overflow: 'auto' }}>
            <List component="nav">
              <ListItemButton onClick={() => setLayersOpen(!layersOpen)}>
                <ListItemIcon>
                  <LayersIcon />
                </ListItemIcon>
                <ListItemText primary="Layers" />
                {layersOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <Collapse in={layersOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {layers.map(layer => (
                    <LayerItem 
                      key={layer.id}
                      active={layer.active ? "true" : "false"}
                      sx={{ pl: 4 }}
                    >
                      <ListItemText 
                        primary={layer.name} 
                        onClick={() => handleLayerSelect(layer.id)}
                        sx={{ 
                          cursor: 'pointer',
                          opacity: layer.visible ? 1 : 0.5
                        }}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => handleLayerVisibilityToggle(layer.id)}
                      >
                        {layer.visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleLayerLockToggle(layer.id)}
                      >
                        {layer.locked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                      </IconButton>
                    </LayerItem>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <IconButton size="small" onClick={handleAddLayer}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        const activeLayer = layers.find(l => l.active);
                        if (activeLayer) handleDeleteLayer(activeLayer.id);
                      }}
                      disabled={layers.length <= 1}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={clearActiveLayer}
                      title="Clear Active Layer"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </List>
              </Collapse>
              
              <ListItemButton onClick={() => setComponentsOpen(!componentsOpen)}>
                <ListItemIcon>
                  <WidgetsIcon />
                </ListItemIcon>
                <ListItemText primary="Components" />
                {componentsOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <Collapse in={componentsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {/* Layout Components */}
                  <ListItemButton 
                    sx={{ pl: 4 }}
                    onClick={() => setLayoutComponentsOpen(!layoutComponentsOpen)}
                  >
                    <ListItemText 
                      primary={COMPONENT_CATEGORIES.LAYOUT} 
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    {layoutComponentsOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  
                  <Collapse in={layoutComponentsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {COMPONENT_TYPES
                        .filter(comp => comp.category === COMPONENT_CATEGORIES.LAYOUT)
                        .map((component) => (
                          <ListItemButton 
                            key={component.id}
                            sx={{ pl: 6 }}
                            onClick={() => handleAddComponent(component.id)}
                          >
                            <ListItemText 
                              primary={component.name} 
                              primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                  </ListItemButton>
                        ))
                      }
                    </List>
                  </Collapse>
                  
                  {/* Forms & Inputs */}
                  <ListItemButton 
                    sx={{ pl: 4 }}
                    onClick={() => setFormsComponentsOpen(!formsComponentsOpen)}
                  >
                    <ListItemText 
                      primary={COMPONENT_CATEGORIES.FORMS} 
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    {formsComponentsOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  
                  <Collapse in={formsComponentsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {COMPONENT_TYPES
                        .filter(comp => comp.category === COMPONENT_CATEGORIES.FORMS)
                        .map((component) => (
                          <ListItemButton 
                            key={component.id}
                            sx={{ pl: 6 }}
                            onClick={() => handleAddComponent(component.id)}
                          >
                            <ListItemText 
                              primary={component.name} 
                              primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                          </ListItemButton>
                        ))
                      }
                    </List>
                  </Collapse>
                  
                  {/* Buttons & Actions */}
                        <ListItemButton 
                          sx={{ pl: 4 }}
                    onClick={() => setButtonsComponentsOpen(!buttonsComponentsOpen)}
                        >
                          <ListItemText 
                      primary={COMPONENT_CATEGORIES.BUTTONS} 
                            primaryTypographyProps={{ fontWeight: 'bold' }}
                          />
                    {buttonsComponentsOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        
                  <Collapse in={buttonsComponentsOpen} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                      {COMPONENT_TYPES
                        .filter(comp => comp.category === COMPONENT_CATEGORIES.BUTTONS)
                        .map((component) => (
                              <ListItemButton 
                                key={component.id}
                                sx={{ pl: 6 }}
                                onClick={() => handleAddComponent(component.id)}
                              >
                                <ListItemText 
                                  primary={component.name} 
                                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                                />
                              </ListItemButton>
                        ))
                      }
                          </List>
                        </Collapse>
                  
                  {/* Cards & Containers */}
                  <ListItemButton 
                    sx={{ pl: 4 }}
                    onClick={() => setCardsComponentsOpen(!cardsComponentsOpen)}
                  >
                    <ListItemText 
                      primary={COMPONENT_CATEGORIES.CARDS} 
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    {cardsComponentsOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  
                  <Collapse in={cardsComponentsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {COMPONENT_TYPES
                        .filter(comp => comp.category === COMPONENT_CATEGORIES.CARDS)
                        .map((component) => (
                          <ListItemButton 
                            key={component.id}
                            sx={{ pl: 6 }}
                            onClick={() => handleAddComponent(component.id)}
                          >
                            <ListItemText 
                              primary={component.name} 
                              primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                          </ListItemButton>
                        ))
                      }
                    </List>
                  </Collapse>
                  
                  {/* Interactive Components */}
                  <ListItemButton 
                    sx={{ pl: 4 }}
                    onClick={() => setInteractiveComponentsOpen(!interactiveComponentsOpen)}
                  >
                    <ListItemText 
                      primary={COMPONENT_CATEGORIES.INTERACTIVE} 
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    {interactiveComponentsOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  
                  <Collapse in={interactiveComponentsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {COMPONENT_TYPES
                        .filter(comp => comp.category === COMPONENT_CATEGORIES.INTERACTIVE)
                        .map((component) => (
                          <ListItemButton 
                            key={component.id}
                            sx={{ pl: 6 }}
                            onClick={() => handleAddComponent(component.id)}
                          >
                            <ListItemText 
                              primary={component.name} 
                              primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                          </ListItemButton>
                        ))
                      }
                    </List>
                  </Collapse>
                  
                  {/* Charts & Data */}
                  <ListItemButton 
                    sx={{ pl: 4 }}
                    onClick={() => setChartsComponentsOpen(!chartsComponentsOpen)}
                  >
                    <ListItemText 
                      primary={COMPONENT_CATEGORIES.CHARTS} 
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    {chartsComponentsOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  
                  <Collapse in={chartsComponentsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {COMPONENT_TYPES
                        .filter(comp => comp.category === COMPONENT_CATEGORIES.CHARTS)
                        .map((component) => (
                          <ListItemButton 
                            key={component.id}
                            sx={{ pl: 6 }}
                            onClick={() => handleAddComponent(component.id)}
                          >
                            <ListItemText 
                              primary={component.name} 
                              primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                          </ListItemButton>
                        ))
                      }
                    </List>
                  </Collapse>
                  
                  {/* Authentication */}
                  <ListItemButton 
                    sx={{ pl: 4 }}
                    onClick={() => setAuthComponentsOpen(!authComponentsOpen)}
                  >
                    <ListItemText 
                      primary={COMPONENT_CATEGORIES.AUTH} 
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    {authComponentsOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  
                  <Collapse in={authComponentsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {COMPONENT_TYPES
                        .filter(comp => comp.category === COMPONENT_CATEGORIES.AUTH)
                        .map((component) => (
                          <ListItemButton 
                            key={component.id}
                            sx={{ pl: 6 }}
                            onClick={() => handleAddComponent(component.id)}
                          >
                            <ListItemText 
                              primary={component.name} 
                              primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                          </ListItemButton>
                        ))
                      }
                    </List>
                  </Collapse>
                  
                  {/* Media & Files */}
                  <ListItemButton 
                    sx={{ pl: 4 }}
                    onClick={() => setMediaComponentsOpen(!mediaComponentsOpen)}
                  >
                    <ListItemText 
                      primary={COMPONENT_CATEGORIES.MEDIA} 
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    {mediaComponentsOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  
                  <Collapse in={mediaComponentsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {COMPONENT_TYPES
                        .filter(comp => comp.category === COMPONENT_CATEGORIES.MEDIA)
                        .map((component) => (
                          <ListItemButton 
                            key={component.id}
                            sx={{ pl: 6 }}
                            onClick={() => handleAddComponent(component.id)}
                          >
                            <ListItemText 
                              primary={component.name} 
                              primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                          </ListItemButton>
                        ))
                      }
                    </List>
                  </Collapse>
                </List>
              </Collapse>
            </List>
          </Paper>
        </Grid>
        
        {/* Canvas Area */}
        <Grid item xs={10} sx={{ height: '100%', overflow: 'auto' }}>
          <CanvasContainer
            onDragOver={(e) => {
              e.preventDefault(); // Allow dropping
            }}
            onDrop={(e) => {
              e.preventDefault();
              
              try {
                const dataText = e.dataTransfer.getData('text/plain');
                console.log('Drop data received:', dataText);
                
                const parsed = JSON.parse(dataText);
                console.log('Parsed drop data:', parsed);
                
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / (zoom / 100);
                const y = (e.clientY - rect.top) / (zoom / 100);
                
                if (parsed.type === 'text') {
                  // Update the text position
                  setTextContent(textContent.map(text => 
                    text.id === parsed.id
                      ? { ...text, x, y }
                      : text
                  ));
                  
                  // Update selected element if it's the one being dragged
                  if (selectedElement?.type === 'text' && selectedElement.id === parsed.id) {
                    setSelectedElement(prev => ({
                      ...prev,
                      data: {
                        ...prev.data,
                        x,
                        y
                      }
                    }));
                  }
                } else if (parsed.type === 'image') {
                  console.log('Dropping image:', parsed.id);
                  console.log('Current images:', imageElements);
                  const imageToUpdate = imageElements.find(img => img.id === parsed.id);
                  console.log('Image to update:', imageToUpdate);
                  
                  if (imageToUpdate) {
                  // Update the image position
                  setImageElements(imageElements.map(image => 
                    image.id === parsed.id
                      ? { ...image, x, y }
                      : image
                  ));
                  
                  // Update selected element if it's the one being dragged
                  if (selectedElement?.type === 'image' && selectedElement.id === parsed.id) {
                    setSelectedElement(prev => ({
                      ...prev,
                      data: {
                        ...prev.data,
                        x,
                        y
                      }
                    }));
                    }
                  } else {
                    console.error('Image not found:', parsed.id);
                  }
                } else if (parsed.type === 'component') {
                  // Update component position
                  const componentToUpdate = components.find(comp => comp.id === parsed.id);
                  
                  if (componentToUpdate) {
                    setComponents(components.map(comp => 
                      comp.id === parsed.id
                        ? { ...comp, x, y }
                        : comp
                    ));
                    
                    // Update selected element if it's the one being dragged
                    if (selectedElement?.type === 'component' && selectedElement.id === parsed.id) {
                      setSelectedElement(prev => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          x,
                          y
                        }
                      }));
                    }
                  } else {
                    console.error('Component not found:', parsed.id);
                  }
                } else if (parsed.type === 'shape') {
                  // Calculate the shape's dimensions
                  const shape = shapes.find(s => s.id === parsed.id);
                  if (shape) {
                    const width = Math.abs(shape.endX - shape.startX);
                    const height = Math.abs(shape.endY - shape.startY);
                    
                    // Calculate new coordinates maintaining the shape's dimensions
                    const newStartX = x - width / 2;
                    const newStartY = y - height / 2;
                    
                    // Update the shape position
                    setShapes(shapes.map(s => 
                      s.id === parsed.id
                        ? { 
                            ...s, 
                            startX: newStartX, 
                            startY: newStartY,
                            endX: newStartX + width,
                            endY: newStartY + height 
                          }
                        : s
                    ));
                    
                    // Update selected element if it's the one being dragged
                    if (selectedElement?.type === 'shape' && selectedElement.id === parsed.id) {
                      setSelectedElement(prev => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          startX: newStartX,
                          startY: newStartY,
                          endX: newStartX + width,
                          endY: newStartY + height
                        }
                      }));
                    }
                  }
                }
              } catch (error) {
                console.error('Error handling drop:', error);
              }
            }}
            onClick={(e) => {
              // Handle fill color on click
              if (tool === 'fill') {
                handleFillColor(e);
                return;
              }
              
              // Handle eraser on click
              if (tool === 'eraser') {
                handleEraser(e);
                return;
              }
              
              // Deselect when clicking on empty canvas area
              if (tool === 'select') {
                setSelectedElement(null);
              }
            }}
            onMouseDown={(e) => {
              // Handle shape drawing directly
              if (['rectangle', 'ellipse', 'line'].includes(tool)) {
                e.preventDefault();
                e.stopPropagation();
                
                // Don't allow drawing on canvas when using shape tools
                if (canvasRef.current) {
                  // This temporarily disables the canvas drawing ability
                  canvasRef.current.eraseMode(true);
                }
                
                handleShapeStart(e);
              }
            }}
            onMouseMove={(e) => {
              if (isDrawingShape && ['rectangle', 'ellipse', 'line'].includes(tool)) {
                e.preventDefault();
                e.stopPropagation();
                handleShapeMove(e);
              }
            }}
            onMouseUp={(e) => {
              if (isDrawingShape && ['rectangle', 'ellipse', 'line'].includes(tool)) {
                e.preventDefault();
                e.stopPropagation();
                handleShapeEnd(e);
                
                // Keep shape tool active by leaving eraseMode enabled
                // This prevents free-style drawing from activating
                  if (canvasRef.current) {
                  // Keep eraseMode true to prevent drawing
                  // We'll continue to handle shape drawing through our custom events
                  canvasRef.current.eraseMode(true);
                  }
              }
            }}
          >
            <ReactSketchCanvas
              ref={canvasRef}
              strokeWidth={canvasOptions.strokeWidth}
              strokeColor={canvasOptions.strokeColor}
              canvasColor={canvasOptions.canvasColor}
              eraserWidth={canvasOptions.eraserWidth}
              style={{
                width: '100%',
                height: '100%',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center'
              }}
            />
            
            {/* Render Shapes */}
            {shapes.map((shape, index) => {
              // Only show shapes on visible layers
              const layer = layers.find(l => l.id === shape.layerId);
              if (!layer || !layer.visible) return null;
              
              const isSelected = selectedElement?.type === 'shape' && selectedElement?.id === shape.id;
              
              if (shape.type === 'rectangle') {
                const left = Math.min(shape.startX, shape.endX);
                const top = Math.min(shape.startY, shape.endY);
                const width = Math.abs(shape.endX - shape.startX);
                const height = Math.abs(shape.endY - shape.startY);
                
                return (
                  <Box
                    key={`shape-${index}`}
                    sx={{
                      position: 'absolute',
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                      border: `${shape.strokeWidth}px solid ${shape.strokeColor}`,
                      backgroundColor: shape.fillColor || 'rgba(255, 255, 255, 0.5)',
                      opacity: opacity / 100,
                      mixBlendMode: blendMode,
                      pointerEvents: tool === 'select' ? 'auto' : 'none',
                      cursor: tool === 'select' ? 'move' : 'default',
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: '0 0',
                      boxShadow: shadows.enabled ? 
                        `${shadows.offsetX}px ${shadows.offsetY}px ${shadows.blur}px ${shadows.spread}px ${shadows.color}` : 
                        'none',
                      outline: isSelected ? '2px dashed blue' : 'none',
                      outlineOffset: '2px',
                      zIndex: isSelected ? 100 : 1
                    }}
                    onClick={(e) => {
                      if (tool === 'select') {
                        e.stopPropagation();
                        handleSelectShape(shape.id);
                      }
                    }}
                    draggable={tool === 'select'}
                    onDragStart={(e) => {
                      if (tool === 'select') {
                        e.dataTransfer.setData('text/plain', JSON.stringify({
                          type: 'shape',
                          id: shape.id
                        }));
                      }
                    }}
                  >
                    {/* Add resize handles when shape is selected */}
                    {isSelected && tool === 'select' && (
                      <>
                        {/* Top-left resize handle */}
                        <Box
                          sx={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            left: '-5px',
                            top: '-5px',
                            backgroundColor: 'primary.main',
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                            transform: `scale(${1/(zoom/100)})`,
                            zIndex: 10
                          }}
                          onMouseDown={(e) => handleShapeResize(shape.id, 'topLeft', e)}
                        />
                        {/* Top-right resize handle */}
                        <Box
                          sx={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            right: '-5px',
                            top: '-5px',
                            backgroundColor: 'primary.main',
                            borderRadius: '50%',
                            cursor: 'nesw-resize',
                            transform: `scale(${1/(zoom/100)})`,
                            zIndex: 10
                          }}
                          onMouseDown={(e) => handleShapeResize(shape.id, 'topRight', e)}
                        />
                        {/* Bottom-left resize handle */}
                        <Box
                          sx={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            left: '-5px',
                            bottom: '-5px',
                            backgroundColor: 'primary.main',
                            borderRadius: '50%',
                            cursor: 'nesw-resize',
                            transform: `scale(${1/(zoom/100)})`,
                            zIndex: 10
                          }}
                          onMouseDown={(e) => handleShapeResize(shape.id, 'bottomLeft', e)}
                        />
                        {/* Bottom-right resize handle */}
                        <Box
                          sx={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            right: '-5px',
                            bottom: '-5px',
                            backgroundColor: 'primary.main',
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                            transform: `scale(${1/(zoom/100)})`,
                            zIndex: 10
                          }}
                          onMouseDown={(e) => handleShapeResize(shape.id, 'bottomRight', e)}
                        />
                      </>
                    )}
                  </Box>
                );
              } else if (shape.type === 'ellipse') {
                const left = Math.min(shape.startX, shape.endX);
                const top = Math.min(shape.startY, shape.endY);
                const width = Math.abs(shape.endX - shape.startX);
                const height = Math.abs(shape.endY - shape.startY);
                
                return (
                  <Box
                    key={`shape-${index}`}
                    sx={{
                      position: 'absolute',
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                      border: `${shape.strokeWidth}px solid ${shape.strokeColor}`,
                      backgroundColor: shape.fillColor || 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '50%',
                      opacity: opacity / 100,
                      mixBlendMode: blendMode,
                      pointerEvents: tool === 'select' ? 'auto' : 'none',
                      cursor: tool === 'select' ? 'move' : 'default',
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: '0 0',
                      boxShadow: shadows.enabled ? 
                        `${shadows.offsetX}px ${shadows.offsetY}px ${shadows.blur}px ${shadows.spread}px ${shadows.color}` : 
                        'none',
                      outline: isSelected ? '2px dashed blue' : 'none',
                      outlineOffset: '2px',
                      zIndex: isSelected ? 100 : 1
                    }}
                    onClick={(e) => {
                      if (tool === 'select') {
                        e.stopPropagation();
                        handleSelectShape(shape.id);
                      }
                    }}
                    draggable={tool === 'select'}
                    onDragStart={(e) => {
                      if (tool === 'select') {
                        e.dataTransfer.setData('text/plain', JSON.stringify({
                          type: 'shape',
                          id: shape.id
                        }));
                      }
                    }}
                  >
                    {/* Add resize handles when ellipse is selected */}
                    {isSelected && tool === 'select' && (
                      <>
                        {/* Top-left resize handle */}
                        <Box
                          sx={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            left: '-5px',
                            top: '-5px',
                            backgroundColor: 'primary.main',
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                            transform: `scale(${1/(zoom/100)})`,
                            zIndex: 10
                          }}
                          onMouseDown={(e) => handleShapeResize(shape.id, 'topLeft', e)}
                        />
                        {/* Top-right resize handle */}
                        <Box
                          sx={{
                      position: 'absolute',
                            width: '10px',
                            height: '10px',
                            right: '-5px',
                            top: '-5px',
                            backgroundColor: 'primary.main',
                            borderRadius: '50%',
                            cursor: 'nesw-resize',
                            transform: `scale(${1/(zoom/100)})`,
                            zIndex: 10
                          }}
                          onMouseDown={(e) => handleShapeResize(shape.id, 'topRight', e)}
                        />
                        {/* Bottom-left resize handle */}
                        <Box
                          sx={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            left: '-5px',
                            bottom: '-5px',
                            backgroundColor: 'primary.main',
                            borderRadius: '50%',
                            cursor: 'nesw-resize',
                            transform: `scale(${1/(zoom/100)})`,
                            zIndex: 10
                          }}
                          onMouseDown={(e) => handleShapeResize(shape.id, 'bottomLeft', e)}
                        />
                        {/* Bottom-right resize handle */}
                        <Box
                          sx={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            right: '-5px',
                            bottom: '-5px',
                            backgroundColor: 'primary.main',
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                            transform: `scale(${1/(zoom/100)})`,
                            zIndex: 10
                          }}
                          onMouseDown={(e) => handleShapeResize(shape.id, 'bottomRight', e)}
                        />
                      </>
                    )}
                  </Box>
                );
              }
            })}
            
            {/* Render shape preview while drawing */}
            {renderShapePreview()}
            
            {/* Render current shape being drawn */}
            {isDrawingShape && currentShape && (
              <>
                {currentShape.type === 'rectangle' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${Math.min(currentShape.startX, currentShape.endX)}px`,
                      top: `${Math.min(currentShape.startY, currentShape.endY)}px`,
                      width: `${Math.abs(currentShape.endX - currentShape.startX)}px`,
                      height: `${Math.abs(currentShape.endY - currentShape.startY)}px`,
                      border: `${currentShape.strokeWidth}px solid ${currentShape.strokeColor}`,
                      backgroundColor: currentShape.fillColor || 'rgba(255, 255, 255, 0.5)',
                      opacity: 0.7,
                      pointerEvents: 'none',
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: '0 0'
                    }}
                  />
                )}
                
                {currentShape.type === 'ellipse' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${Math.min(currentShape.startX, currentShape.endX)}px`,
                      top: `${Math.min(currentShape.startY, currentShape.endY)}px`,
                      width: `${Math.abs(currentShape.endX - currentShape.startX)}px`,
                      height: `${Math.abs(currentShape.endY - currentShape.startY)}px`,
                      border: `${currentShape.strokeWidth}px solid ${currentShape.strokeColor}`,
                      backgroundColor: currentShape.fillColor || 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '50%',
                      opacity: 0.7,
                      pointerEvents: 'none',
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: '0 0'
                    }}
                  />
                )}
                
                {currentShape.type === 'line' && (
                  <svg
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 20,
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: '0 0'
                    }}
                  >
                    <line
                      x1={currentShape.startX}
                      y1={currentShape.startY}
                      x2={currentShape.endX}
                      y2={currentShape.endY}
                      stroke={currentShape.strokeColor}
                      strokeWidth={currentShape.strokeWidth}
                      opacity={0.7}
                    />
                  </svg>
                )}
              </>
            )}
            
            {/* Render text elements */}
            {textContent.map((text, index) => {
              // Only show text on visible layers
              const layer = layers.find(l => l.id === text.layerId);
              if (!layer || !layer.visible) return null;

              const isSelected = selectedElement?.type === 'text' && selectedElement?.id === text.id;

              return (
                <Box
                  key={`text-${index}`}
                  component="div"
                  sx={{
                    position: 'absolute',
                    left: `${text.x}px`,
                    top: `${text.y}px`,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: '0 0',
                    cursor: tool === 'select' ? 'move' : 'default',
                    pointerEvents: tool === 'select' ? 'auto' : 'none',
                    outline: isSelected ? '2px dashed blue' : 'none',
                    outlineOffset: '2px',
                    zIndex: isSelected ? 100 : 1
                  }}
                  onClick={(e) => {
                    if (tool === 'select') {
                      e.stopPropagation();
                      handleSelectText(text.id);
                    }
                  }}
                  draggable={tool === 'select'}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({
                      type: 'text',
                      id: text.id
                    }));
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: text.fontSize,
                      fontFamily: text.fontFamily || 'Arial',
                      color: text.color || '#000000',
                      textAlign: 'left',
                      userSelect: 'none',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {text.content}
                  </Typography>
                  
                  {/* Resize handle - only show when selected */}
                  {isSelected && tool === 'select' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '10px',
                        height: '10px',
                        right: '-5px',
                        bottom: '-5px',
                        backgroundColor: 'primary.main',
                        borderRadius: '50%',
                        cursor: 'nwse-resize',
                        transform: `scale(${1/(zoom/100)})`, // Counter zoom scaling
                        zIndex: 10
                      }}
                      onMouseDown={(e) => handleTextResize(text.id, e)}
                    />
                  )}
                </Box>
              );
            })}
            
            {/* Render uploaded images */}
            {imageElements && imageElements.map((image, index) => {
              // Only show images on visible layers
              const layer = layers.find(l => l.id === image.layerId);
              if (!layer || !layer.visible) return null;
              
              const isSelected = selectedElement?.type === 'image' && selectedElement?.id === image.id;
              
              return (
                <Box
                  key={`image-${index}`}
                  component="div"
                sx={{
                  position: 'absolute',
                    left: `${image.x}px`,
                    top: `${image.y}px`,
                    width: `${image.width}px`,
                    height: `${image.height}px`,
                    transform: `translate(-50%, -50%) scale(${zoom / 100}) rotate(${image.rotation || 0}deg)`,
                    transformOrigin: 'center center',
                    opacity: (image.opacity || 100) / 100,
                  mixBlendMode: blendMode,
                  pointerEvents: tool === 'select' ? 'auto' : 'none',
                  cursor: tool === 'select' ? 'move' : 'default',
                    boxShadow: shadows.enabled && isSelected ? 
                      `${shadows.offsetX}px ${shadows.offsetY}px ${shadows.blur}px ${shadows.spread}px ${shadows.color}` : 
                      'none',
                    outline: isSelected ? '2px dashed blue' : 'none',
                    outlineOffset: '2px',
                    zIndex: isSelected ? 100 : 1,
                    overflow: 'hidden'
                  }}
                  onClick={(e) => {
                    if (tool === 'select') {
                      e.stopPropagation();
                      handleSelectImage(image.id);
                    }
                  }}
                  draggable={tool === 'select'}
                  onDragStart={(e) => {
                    if (tool === 'select') {
                      console.log('Starting image drag:', image.id);
                      e.dataTransfer.setData('text/plain', JSON.stringify({
                        type: 'image',
                        id: image.id
                      }));
                    }
                  }}
                >
                  <img 
                    src={image.src} 
                    alt="Uploaded content"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                    }}
                  />
                  
                  {/* Resize handles - only show when selected */}
                  {isSelected && tool === 'select' && (
                    <>
                      {/* Corner resize handles */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '12px',
                          left: '-6px',
                          top: '-6px',
                          backgroundColor: 'primary.main',
                          border: '1px solid white',
                          borderRadius: '50%',
                          cursor: 'nwse-resize',
                          transform: `scale(${1/(zoom/100)})`,
                          zIndex: 10
                        }}
                        onMouseDown={(e) => handleImageResize(image.id, 'topLeft', e)}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '12px',
                          right: '-6px',
                          top: '-6px',
                          backgroundColor: 'primary.main',
                          border: '1px solid white',
                          borderRadius: '50%',
                          cursor: 'nesw-resize',
                          transform: `scale(${1/(zoom/100)})`,
                          zIndex: 10
                        }}
                        onMouseDown={(e) => handleImageResize(image.id, 'topRight', e)}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '12px',
                          left: '-6px',
                          bottom: '-6px',
                          backgroundColor: 'primary.main',
                          border: '1px solid white',
                          borderRadius: '50%',
                          cursor: 'nesw-resize',
                          transform: `scale(${1/(zoom/100)})`,
                          zIndex: 10
                        }}
                        onMouseDown={(e) => handleImageResize(image.id, 'bottomLeft', e)}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '12px',
                          right: '-6px',
                          bottom: '-6px',
                          backgroundColor: 'primary.main',
                          border: '1px solid white',
                          borderRadius: '50%',
                          cursor: 'nwse-resize',
                          transform: `scale(${1/(zoom/100)})`,
                          zIndex: 10
                        }}
                        onMouseDown={(e) => handleImageResize(image.id, 'bottomRight', e)}
                      />
                      
                      {/* Mid-point handles */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '12px',
                          left: '50%',
                          top: '-6px',
                          marginLeft: '-6px',
                          backgroundColor: 'primary.main',
                          border: '1px solid white',
                          borderRadius: '50%',
                          cursor: 'ns-resize',
                          transform: `scale(${1/(zoom/100)})`,
                          zIndex: 10
                        }}
                        onMouseDown={(e) => handleImageResize(image.id, 'top', e)}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '12px',
                          left: '-6px',
                          top: '50%',
                          marginTop: '-6px',
                          backgroundColor: 'primary.main',
                          border: '1px solid white',
                          borderRadius: '50%',
                          cursor: 'ew-resize',
                          transform: `scale(${1/(zoom/100)})`,
                          zIndex: 10
                        }}
                        onMouseDown={(e) => handleImageResize(image.id, 'left', e)}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '12px',
                          right: '-6px',
                          top: '50%',
                          marginTop: '-6px',
                          backgroundColor: 'primary.main',
                          border: '1px solid white',
                          borderRadius: '50%',
                          cursor: 'ew-resize',
                          transform: `scale(${1/(zoom/100)})`,
                          zIndex: 10
                        }}
                        onMouseDown={(e) => handleImageResize(image.id, 'right', e)}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '12px',
                          left: '50%',
                          bottom: '-6px',
                          marginLeft: '-6px',
                          backgroundColor: 'primary.main',
                          border: '1px solid white',
                          borderRadius: '50%',
                          cursor: 'ns-resize',
                          transform: `scale(${1/(zoom/100)})`,
                          zIndex: 10
                        }}
                        onMouseDown={(e) => handleImageResize(image.id, 'bottom', e)}
                      />
                      
                      {/* Rotation handle */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '12px',
                          left: '50%',
                          top: '-30px',
                          marginLeft: '-6px',
                          backgroundColor: 'secondary.main',
                          border: '1px solid white',
                          borderRadius: '50%',
                          cursor: 'crosshair',
                          transform: `scale(${1/(zoom/100)})`,
                          zIndex: 10
                        }}
                        onMouseDown={(e) => handleImageRotate(image.id, e)}
                      />
                    </>
                  )}
                </Box>
              );
            })}
            
            {/* Render UI Components directly in canvas */}
            {components.map((component, index) => {
              const isSelected = selectedElement?.type === 'component' && selectedElement.id === component.id;
              
              return (
                <Box
                  key={`comp-${component.id}`}
                  sx={{
                    position: 'absolute',
                    left: `${component.x}px`,
                    top: `${component.y}px`,
                    width: `${component.width}px`,
                    height: component.type === 'card' ? `${component.height}px` : 'auto',
                    backgroundColor: component.style?.backgroundColor || '#ffffff',
                    color: component.style?.color || '#000000',
                    borderRadius: component.style?.borderRadius || '8px',
                    border: isSelected ? '2px solid #2196f3' : component.style?.border || '1px solid rgba(0,0,0,0.12)',
                    padding: component.style?.padding || '12px',
                    fontFamily: component.style?.fontFamily || 'Inter, Roboto, Arial',
                    fontSize: component.style?.fontSize ? `${component.style.fontSize}px` : '14px',
                    textAlign: component.style?.textAlign || 'center',
                    cursor: tool === 'select' ? 'move' : 'default',
                    boxShadow: isSelected ? '0 0 0 2px rgba(33,150,243,0.3)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    zIndex: isSelected ? 600 : 500,
                    pointerEvents: tool === 'select' ? 'auto' : 'none',
                    transformOrigin: 'center center',
                    transform: `translate(-50%, -50%) scale(${zoom / 100})`,
                    opacity: (component.opacity || 100) / 100,
                    mixBlendMode: blendMode
                  }}
                  draggable={tool === 'select'}
                  onDragStart={(e) => handleComponentDragStart(e, component)}
                  onClick={(e) => {
                    if (tool === 'select') {
                      e.stopPropagation();
                      handleSelectComponent(component.id);
                    }
                  }}
                  onDoubleClick={(e) => {
                    if (tool === 'select') {
                      e.stopPropagation();
                      handleEditComponentOpen(component);
                    }
                  }}
                >
                  {/* Layout Components */}
                  {component.type === 'navbar' && (
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0 16px'
                    }}>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {safeContentSplit(component.content, 0, 'Logo')}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: '16px' }}>
                        {['Home', 'About', 'Services', 'Contact'].map(item => (
                          <Typography key={item} variant="body1">{item}</Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {component.type === 'sidebar' && (
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '16px 8px',
                      gap: '8px'
                    }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        {safeContentSplit(component.content, 0, 'Navigation')}
                      </Typography>
                      {['Dashboard', 'Profile', 'Settings', 'Help'].map(item => (
                        <Box 
                          key={item} 
                          sx={{ 
                            p: '8px 16px', 
                            borderRadius: '4px', 
                            width: '100%', 
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
                          }}
                        >
                          <Typography variant="body2">{item}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {component.type === 'footer' && (
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <Typography variant="body2">
                        {safeContentSplit(component.content, 0, '© 2023 Your Company. All rights reserved.')}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: '16px' }}>
                        {['Terms', 'Privacy', 'Contact'].map(item => (
                          <Typography key={item} variant="caption">{item}</Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {component.type === 'grid' && (
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gridTemplateRows: 'repeat(3, 1fr)',
                      gap: '8px'
                    }}>
                      {[...Array(9)].map((_, i) => (
                        <Box key={i} sx={{ border: '1px dashed #ccc', borderRadius: '2px' }} />
                      ))}
                    </Box>
                  )}
                  
                  {/* Form Components */}
                  {component.type === 'textfield' && (
                    <TextField
                      placeholder={safeContentSplit(component.content, 0, "Input text")}
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ pointerEvents: 'none' }}
                    />
                  )}
                  
                  {component.type === 'checkbox' && (
                    <FormControlLabel
                      control={<Checkbox />}
                      label={safeContentSplit(component.content, 0, "Checkbox option")}
                      sx={{ width: '100%', justifyContent: 'flex-start', pointerEvents: 'none' }}
                    />
                  )}
                  
                  {component.type === 'radio' && (
                    <FormControlLabel
                      control={<Radio />}
                      label={safeContentSplit(component.content, 0, "Radio option")}
                      sx={{ width: '100%', justifyContent: 'flex-start', pointerEvents: 'none' }}
                    />
                  )}
                  
                  {component.type === 'dropdown' && (
                    <FormControl fullWidth size="small" sx={{ pointerEvents: 'none' }}>
                      <Select
                        value=""
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                      >
                        <MenuItem value="" disabled>
                          {safeContentSplit(component.content, 0, "Select an option")}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  
                  {component.type === 'fileupload' && (
                    <Button 
                      variant="outlined" 
                      component="span"
                      fullWidth
                      startIcon={<UploadFileOutlined />}
                      sx={{ pointerEvents: 'none' }}
                    >
                      {safeContentSplit(component.content, 0, "Choose File")}
                    </Button>
                  )}
                  
                  {component.type === 'searchbar' && (
                    <TextField
                      placeholder={safeContentSplit(component.content, 0, "Search...")}
                      variant="outlined"
                      size="small"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ pointerEvents: 'none' }}
                    />
                  )}
                  
                  {/* Button Components */}
                  {component.type === 'button' && (
                    <Button 
                      variant="contained" 
                      size="small"
                      fullWidth
                      sx={{
                        backgroundColor: component.style?.backgroundColor,
                        color: component.style?.color,
                        textTransform: 'none',
                        pointerEvents: 'none'
                      }}
                    >
                      {safeContentSplit(component.content, 0, "Button")}
                    </Button>
                  )}
                  
                  {component.type === 'fab' && (
                    <Fab
                      size="small"
                      sx={{
                        backgroundColor: component.style?.backgroundColor,
                        color: component.style?.color,
                        pointerEvents: 'none'
                      }}
                    >
                      {safeContentSplit(component.content, 0, "+")}
                    </Fab>
                  )}
                  
                  {component.type === 'spinner' && (
                    <CircularProgress 
                      size={component.width > component.height ? component.height * 0.8 : component.width * 0.8} 
                    />
                  )}
                  
                  {/* Card Components */}
                  {component.type === 'card' && (
                    <Card sx={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                      <CardContent>
                        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                          {safeContentSplit(component.content, 0, 'Card Title')}
                        </Typography>
                        <Typography variant="body2">
                          {safeContentSplit(component.content, 0, 'Card content goes here')}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                  
                  {component.type === 'modal' && (
                    <Card sx={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                      <CardHeader 
                        title={safeContentSplit(component.content, 0, 'Modal Title')} 
                        action={
                          <IconButton size="small">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        }
                      />
                      <CardContent>
                        <Typography variant="body2">
                          {safeContentSplit(component.content, 0, 'Modal content goes here')}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end' }}>
                        <Button size="small">Cancel</Button>
                        <Button size="small" variant="contained">OK</Button>
                      </CardActions>
                    </Card>
                  )}
                  
                  {component.type === 'accordion' && (
                    <Accordion sx={{ width: '100%', pointerEvents: 'none' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{safeContentSplit(component.content, 0, 'Accordion Title')}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2">
                          {safeContentSplit(component.content, 0, 'Accordion content goes here')}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  
                  {component.type === 'tooltip' && (
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                    }}>
                      <Typography variant="caption">{safeContentSplit(component.content, 0, 'Tooltip text')}</Typography>
                    </Box>
                  )}
                  
                  {/* Interactive Components */}
                  {component.type === 'slider' && (
                    <Slider 
                      size="small" 
                      defaultValue={50} 
                      sx={{ width: '100%', pointerEvents: 'none' }} 
                    />
                  )}
                  
                  {component.type === 'tabs' && (
                    <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs value={0}>
                        {(safeContentSplit(component.content, 0, 'Tab 1|Tab 2|Tab 3')).split('|').map((tab, i) => (
                          <Tab key={i} label={tab.trim()} disabled />
                        ))}
                      </Tabs>
                    </Box>
                  )}
                  
                  {component.type === 'progressbar' && (
                    <LinearProgress 
                      variant="determinate" 
                      value={70} 
                      sx={{ width: '100%', height: '8px' }} 
                    />
                  )}
                  
                  {component.type === 'toast' && (
                    <Alert severity="info" sx={{ width: '100%' }}>
                      {safeContentSplit(component.content, 0, 'Notification message')}
                    </Alert>
                  )}
                  
                  {/* Chart Components */}
                  {(component.type === 'barchart' || component.type === 'linechart' || component.type === 'piechart') && (
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '8px',
                      border: '1px dashed #ccc',
                      p: 2
                    }}>
                      <Typography variant="subtitle2">
                        {safeContentSplit(component.content, 0, component.type === 'barchart' ? 'Bar Chart' : component.type === 'linechart' ? 'Line Chart' : 'Pie Chart')}
                      </Typography>
                      <Box sx={{ 
                        width: '100%', 
                        height: '80%', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {component.type === 'barchart' && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', width: '100%', gap: 1 }}>
                            {[70, 40, 90, 60, 50].map((val, i) => (
                              <Box 
                                key={i} 
                                sx={{ 
                                  height: `${val}%`, 
                                  width: '100%', 
                                  bgcolor: 'primary.main',
                                  opacity: 0.8
                                }} 
                              />
                            ))}
                          </Box>
                        )}
                        {component.type === 'linechart' && (
                          <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
                            <svg width="100%" height="100%" viewBox="0 0 100 50">
                              <polyline
                                points="0,35 20,15 40,25 60,5 80,20 100,10"
                                fill="none"
                                stroke="#2196f3"
                                strokeWidth="2"
                              />
                            </svg>
                          </Box>
                        )}
                        {component.type === 'piechart' && (
                          <Box sx={{ position: 'relative', height: '80%', aspectRatio: '1/1' }}>
                            <svg width="100%" height="100%" viewBox="0 0 20 20">
                              <circle r="10" cx="10" cy="10" fill="#f44336" />
                              <path
                                d="M10,10 L10,0 A10,10 0 0,1 17.3,14.1 z"
                                fill="#2196f3"
                              />
                              <path
                                d="M10,10 L17.3,14.1 A10,10 0 0,1 10,20 z"
                                fill="#4caf50"
                              />
                              <path
                                d="M10,10 L10,20 A10,10 0 0,1 0,10 z"
                                fill="#ffc107"
                              />
                            </svg>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                  
                  {component.type === 'table' && (
                    <TableContainer component={Paper} sx={{ width: '100%', height: '100%', overflowY: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {['Row 1', 'Row 2', 'Row 3'].map((row, i) => (
                            <TableRow key={i}>
                              <TableCell component="th" scope="row">{row}</TableCell>
                              <TableCell align="right">{`${i * 10 + 50}`}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  
                  {/* Auth Components */}
                  {component.type === 'loginform' && (
                    <Box sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="h6" align="center">Login</Typography>
                      <TextField size="small" label="Email" fullWidth />
                      <TextField size="small" label="Password" type="password" fullWidth />
                      <Button variant="contained" fullWidth>Login</Button>
                      <Typography variant="caption" align="center">Forgot password?</Typography>
                    </Box>
                  )}
                  
                  {component.type === 'signupform' && (
                    <Box sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="h6" align="center">Sign Up</Typography>
                      <TextField size="small" label="Full Name" fullWidth />
                      <TextField size="small" label="Email" fullWidth />
                      <TextField size="small" label="Password" type="password" fullWidth />
                      <Button variant="contained" fullWidth>Create Account</Button>
                    </Box>
                  )}
                  
                  {component.type === 'otpform' && (
                    <Box sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                      <Typography variant="h6" align="center">Enter OTP</Typography>
                      <Typography variant="caption" align="center">A code has been sent to your email</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {[...Array(6)].map((_, i) => (
                          <TextField 
                            key={i}
                            size="small" 
                            inputProps={{ 
                              style: { 
                                textAlign: 'center',
                                padding: '8px 0',
                                width: '24px'
                              } 
                            }}
                          />
                        ))}
                      </Box>
                      <Button variant="contained" fullWidth>Verify</Button>
                    </Box>
                  )}
                  
                  {component.type === 'passwordreset' && (
                    <Box sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="h6" align="center">Reset Password</Typography>
                      <TextField size="small" label="Enter your email" fullWidth />
                      <Button variant="contained" fullWidth>Reset Password</Button>
                      <Typography variant="caption" align="center">Back to login</Typography>
                    </Box>
                  )}
                  
                  {/* Media Components */}
                  {component.type === 'gallery' && (
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gridTemplateRows: 'repeat(2, 1fr)',
                      gap: '8px',
                      p: 1
                    }}>
                      {[...Array(6)].map((_, i) => (
                        <Box 
                          key={i} 
                          sx={{ 
                            backgroundColor: '#e0e0e0', 
                            width: '100%', 
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <ImageIcon color="disabled" />
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {component.type === 'videoplayer' && (
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      backgroundColor: '#000', 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <VideoLibraryIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                      <Box sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        height: '30px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        px: 1
                      }}>
                        <PlayArrowIcon fontSize="small" sx={{ color: 'white' }} />
                        <Box sx={{ 
                          flexGrow: 1, 
                          mx: 1, 
                          height: '4px', 
                          backgroundColor: 'rgba(255,255,255,0.3)' 
                        }}>
                          <Box sx={{ width: '30%', height: '100%', backgroundColor: 'white' }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'white' }}>0:30</Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {component.type === 'audioplayer' && (
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      backgroundColor: component.style?.backgroundColor,
                      color: component.style?.color,
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      gap: 1
                    }}>
                      <PlayArrowIcon />
                      <Box sx={{ 
                        flexGrow: 1, 
                        height: '4px', 
                        backgroundColor: 'rgba(255,255,255,0.3)' 
                      }}>
                        <Box sx={{ width: '30%', height: '100%', backgroundColor: 'white' }} />
                      </Box>
                      <Typography variant="caption">1:24</Typography>
                    </Box>
                  )}
                  
                  {/* Default case - show content as text */}
                  {!['navbar', 'sidebar', 'footer', 'grid', 'textfield', 'checkbox', 'radio', 'dropdown', 
                      'fileupload', 'searchbar', 'button', 'fab', 'spinner', 'card', 'modal', 'accordion', 
                      'tooltip', 'slider', 'tabs', 'progressbar', 'toast', 'barchart', 'linechart', 'piechart', 
                      'table', 'loginform', 'signupform', 'otpform', 'passwordreset', 'gallery', 'videoplayer', 
                      'audioplayer'].includes(component.type) && (
                    <Typography variant="body1">{safeContentSplit(component.content, 0, component.type)}</Typography>
                  )}
                  
                  {/* Resize handles - only show when selected */}
                  {isSelected && tool === 'select' && (
                    <>
                      {/* Bottom-right corner (existing) */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '14px',
                          height: '14px',
                          right: '-7px',
                          bottom: '-7px',
                          backgroundColor: '#2196f3',
                          border: '2px solid white',
                          borderRadius: '50%',
                          cursor: 'nwse-resize',
                          zIndex: 1000,
                          transform: `scale(${100 / zoom})`,
                          boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                          transition: 'transform 0.15s ease',
                          '&:hover': {
                            transform: `scale(${110 / zoom})`,
                            backgroundColor: '#1976d2'
                          }
                        }}
                        onMouseDown={(e) => {
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startWidth = component.width;
                          const startHeight = component.height;
                          
                          const handleMouseMove = (moveEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            const deltaY = moveEvent.clientY - startY;
                            
                            // Scale considering zoom level
                            const scaledDeltaX = deltaX / (zoom / 100);
                            const scaledDeltaY = deltaY / (zoom / 100);
                            
                            // Adjust size
                            const newWidth = Math.max(50, startWidth + scaledDeltaX);
                            const newHeight = component.type === 'card' ? 
                              Math.max(50, startHeight + scaledDeltaY) : 
                              component.height;
                            
                            handleUpdateComponentProperty('width', newWidth);
                            if (component.type === 'card') {
                            handleUpdateComponentProperty('height', newHeight);
                            }
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                          
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      />
                      
                      {/* Top-left corner (new) */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '14px',
                          height: '14px',
                          left: '-7px',
                          top: '-7px',
                          backgroundColor: '#2196f3',
                          border: '2px solid white',
                          borderRadius: '50%',
                          cursor: 'nwse-resize',
                          zIndex: 1000,
                          transform: `scale(${100 / zoom})`,
                          boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                          transition: 'transform 0.15s ease',
                          '&:hover': {
                            transform: `scale(${110 / zoom})`,
                            backgroundColor: '#1976d2'
                          }
                        }}
                        onMouseDown={(e) => {
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startWidth = component.width;
                          const startHeight = component.height;
                          
                          const handleMouseMove = (moveEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            const deltaY = moveEvent.clientY - startY;
                            
                            // Scale considering zoom level
                            const scaledDeltaX = deltaX / (zoom / 100);
                            const scaledDeltaY = deltaY / (zoom / 100);
                            
                            // Adjust size and position (maintaining bottom-right corner)
                            const newWidth = Math.max(50, startWidth - scaledDeltaX);
                            const newHeight = Math.max(30, startHeight - scaledDeltaY);
                            
                            // Update positions to maintain right and bottom edges
                            const newX = component.x + scaledDeltaX;
                            const newY = component.y + scaledDeltaY;
                            
                            handleUpdateComponentProperty('width', newWidth);
                            handleUpdateComponentProperty('height', newHeight);
                            handleUpdateComponentProperty('x', newX);
                            handleUpdateComponentProperty('y', newY);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                          
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      />
                      
                      {/* Bottom-left corner (new) */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '12px',
                          left: '-6px',
                          bottom: '-6px',
                          backgroundColor: 'primary.main',
                          border: '1px solid white',
                          borderRadius: '50%',
                          cursor: 'nesw-resize',
                          zIndex: 1000,
                          transform: `scale(${100 / zoom})`,
                        }}
                        onMouseDown={(e) => {
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startWidth = component.width;
                          const startHeight = component.height;
                          
                          const handleMouseMove = (moveEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            const deltaY = moveEvent.clientY - startY;
                            
                            // Scale considering zoom level
                            const scaledDeltaX = deltaX / (zoom / 100);
                            const scaledDeltaY = deltaY / (zoom / 100);
                            
                            // Adjust width and keep right edge stable
                            const newWidth = Math.max(50, startWidth - scaledDeltaX);
                            const newHeight = Math.max(30, startHeight + scaledDeltaY);
                            
                            // Update x position to keep right edge stable
                            const newX = component.x + scaledDeltaX;
                            
                            handleUpdateComponentProperty('width', newWidth);
                            handleUpdateComponentProperty('height', newHeight);
                            handleUpdateComponentProperty('x', newX);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                          
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      />
                      
                      {/* Top-right corner (new) */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '12px',
                          right: '-6px',
                          top: '-6px',
                          backgroundColor: 'primary.main',
                          border: '1px solid white',
                          borderRadius: '50%',
                          cursor: 'nesw-resize',
                          zIndex: 1000,
                          transform: `scale(${100 / zoom})`,
                        }}
                        onMouseDown={(e) => {
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startWidth = component.width;
                          const startHeight = component.height;
                          
                          const handleMouseMove = (moveEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            const deltaY = moveEvent.clientY - startY;
                            
                            // Scale considering zoom level
                            const scaledDeltaX = deltaX / (zoom / 100);
                            const scaledDeltaY = deltaY / (zoom / 100);
                            
                            // Adjust width and height
                            const newWidth = Math.max(50, startWidth + scaledDeltaX);
                            const newHeight = Math.max(30, startHeight - scaledDeltaY);
                            
                            // Update y position to keep bottom edge stable
                            const newY = component.y + scaledDeltaY;
                            
                            handleUpdateComponentProperty('width', newWidth);
                            handleUpdateComponentProperty('height', newHeight);
                            handleUpdateComponentProperty('y', newY);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                          
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      />
                      
                      {/* Right edge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '28px',
                          right: '-6px',
                          top: '50%',
                          transform: `translateY(-50%) scale(${100 / zoom})`,
                          backgroundColor: '#2196f3',
                          border: '2px solid white',
                          borderRadius: '6px',
                          cursor: 'ew-resize',
                          zIndex: 1000,
                          boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                          transition: 'transform 0.15s ease',
                          '&:hover': {
                            transform: `translateY(-50%) scale(${110 / zoom})`,
                            backgroundColor: '#1976d2'
                          }
                        }}
                        onMouseDown={(e) => {
                          const startX = e.clientX;
                          const startWidth = component.width;
                          
                          const handleMouseMove = (moveEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            
                            // Scale considering zoom level
                            const scaledDeltaX = deltaX / (zoom / 100);
                            
                            // Adjust width only
                            const newWidth = Math.max(50, startWidth + scaledDeltaX);
                            
                            handleUpdateComponentProperty('width', newWidth);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                          
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      />
                      
                      {/* Left edge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '28px',
                          left: '-6px',
                          top: '50%',
                          transform: `translateY(-50%) scale(${100 / zoom})`,
                          backgroundColor: '#2196f3',
                          border: '2px solid white',
                          borderRadius: '6px',
                          cursor: 'ew-resize',
                          zIndex: 1000,
                          boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                          transition: 'transform 0.15s ease',
                          '&:hover': {
                            transform: `translateY(-50%) scale(${110 / zoom})`,
                            backgroundColor: '#1976d2'
                          }
                        }}
                        onMouseDown={(e) => {
                          const startX = e.clientX;
                          const startWidth = component.width;
                          
                          const handleMouseMove = (moveEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            
                            // Scale considering zoom level
                            const scaledDeltaX = deltaX / (zoom / 100);
                            
                            // Adjust width and x position (maintaining right edge)
                            const newWidth = Math.max(50, startWidth - scaledDeltaX);
                            const newX = component.x + scaledDeltaX;
                            
                            handleUpdateComponentProperty('width', newWidth);
                            handleUpdateComponentProperty('x', newX);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                          
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      />
                    </>
                  )}
                </Box>
              );
            })}
            
            {showGrid && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                  backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  opacity: 0.3,
                }}
              />
            )}
            
            {showRulers && (
              <>
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '20px',
                    backgroundColor: '#f0f0f0',
                    borderBottom: '1px solid #ccc',
                    display: 'flex',
                    pointerEvents: 'none',
                  }}
                >
                  {Array.from({ length: 40 }).map((_, i) => (
                    <Box 
                      key={i} 
                      sx={{ 
                        position: 'absolute', 
                        left: `${i * 20}px`, 
                        height: i % 5 === 0 ? '10px' : '5px',
                        width: '1px',
                        bottom: 0,
                        backgroundColor: '#888',
                      }} 
                    />
                  ))}
                </Box>
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '20px',
                    backgroundColor: '#f0f0f0',
                    borderRight: '1px solid #ccc',
                    display: 'flex',
                    flexDirection: 'column',
                    pointerEvents: 'none',
                  }}
                >
                  {Array.from({ length: 30 }).map((_, i) => (
                    <Box 
                      key={i} 
                      sx={{ 
                        position: 'absolute', 
                        top: `${i * 20}px`, 
                        width: i % 5 === 0 ? '10px' : '5px',
                        height: '1px',
                        right: 0,
                        backgroundColor: '#888',
                      }} 
                    />
                  ))}
                </Box>
              </>
            )}
          </CanvasContainer>
        </Grid>
        
        {/* Generated Code Panel */}
        {showGeneratedCode && (
          <Paper
            sx={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '500px',
              maxHeight: '400px',
              overflow: 'auto',
              zIndex: 1000,
              padding: '10px',
              boxShadow: 3,
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Tabs value={codeTab} onChange={handleCodeTabChange} aria-label="code tabs">
                <Tab label="React" value="react" />
                <Tab label="HTML/CSS" value="html" />
                <Tab label="Preview" value="preview" />
              </Tabs>
                <IconButton size="small" onClick={() => setShowGeneratedCode(false)}>
                <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              
            {codeTab !== 'preview' && (
              <Box sx={{ position: 'relative' }}>
              <Box 
                  component="pre"
                sx={{ 
                    backgroundColor: '#1e1e1e', 
                    color: '#e6e6e6',
                    padding: '15px',
                    overflowX: 'auto',
                    borderRadius: '4px',
                    margin: 0,
                    fontSize: '0.8rem',
                    minHeight: '150px',
                    maxHeight: '300px',
                  }}
                >
                  <Box
                    component="code"
                    sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    dangerouslySetInnerHTML={{ 
                      __html: highlightCode(
                        codeTab === 'react' ? generatedCode.react : generatedCode.html,
                        codeTab === 'react' ? 'jsx' : 'html'
                      ),
                    }}
                  />
              </Box>
                <Button 
                  variant="contained"
                  color="primary"
                  startIcon={<ContentCopyIcon />}
                  size="small"
                  onClick={copyCodeToClipboard}
                  sx={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}
                >
                  Copy
                </Button>
              </Box>
            )}
            
            {codeTab === 'preview' && (
              <Box sx={{ height: '350px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                  <iframe
                    ref={previewIframeRef}
                  title="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<RefreshIcon />}
                  size="small" 
                  onClick={updatePreview}
                  sx={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}
                >
                  Refresh
                </Button>
              </Box>
            )}
            </Paper>
        )}

        {/* Right Properties Panel */}
        <Grid item xs={2}>
          <Paper elevation={2} sx={{ height: '100%', overflow: 'auto' }}>
            <Tabs
              value={rightPanelTab}
              onChange={(e, newValue) => setRightPanelTab(newValue)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Properties" />
              <Tab label="Styles" />
            </Tabs>
            
            {rightPanelTab === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Element Properties
                </Typography>
                
                {selectedElement ? (
                  <>
                    {selectedElement.type === 'component' ? (
                      <>
                        <Typography variant="h6" gutterBottom>Component Properties</Typography>
                        
                        <Box sx={{ my: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Size</Typography>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                                label="Width"
                  type="number"
                                value={selectedElement.data.width}
                                onChange={(e) => handleUpdateComponentProperty('width', parseInt(e.target.value))}
                                InputProps={{ inputProps: { min: 50 } }}
                />
                            </Grid>
                            {selectedElement.data.type === 'card' && (
                              <Grid item xs={6}>
                <TextField
                                  fullWidth
                  size="small"
                                  label="Height"
                  type="number"
                                  value={selectedElement.data.height}
                                  onChange={(e) => handleUpdateComponentProperty('height', parseInt(e.target.value))}
                                  InputProps={{ inputProps: { min: 50 } }}
                                />
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                        
                        <Box sx={{ my: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Position</Typography>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={6}>
                <TextField
                                fullWidth
                  size="small"
                                label="X"
                  type="number"
                                value={Math.round(selectedElement.data.x)}
                                onChange={(e) => handleUpdateComponentProperty('x', parseInt(e.target.value))}
                />
                            </Grid>
                            <Grid item xs={6}>
                <TextField
                                fullWidth
                  size="small"
                                label="Y"
                  type="number"
                                value={Math.round(selectedElement.data.y)}
                                onChange={(e) => handleUpdateComponentProperty('y', parseInt(e.target.value))}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                        
                        <Box sx={{ my: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Appearance</Typography>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Font Family</InputLabel>
                                <Select
                                  value={(selectedElement?.data?.style?.fontFamily) || 'Arial'}
                                  onChange={(e) => handleUpdateComponentProperty('style.fontFamily', e.target.value)}
                                >
                                  <MenuItem value="Arial">Arial</MenuItem>
                                  <MenuItem value="Verdana">Verdana</MenuItem>
                                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                                  <MenuItem value="Courier New">Courier New</MenuItem>
                                  <MenuItem value="Georgia">Georgia</MenuItem>
                                  <MenuItem value="Roboto">Roboto</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                    size="small" 
                                label="Font Size"
                                type="number"
                                value={selectedElement?.data?.style?.fontSize || 14}
                                onChange={(e) => handleUpdateComponentProperty('style.fontSize', parseInt(e.target.value))}
                                InputProps={{ inputProps: { min: 8, max: 80 } }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Text Align</InputLabel>
                                <Select
                                  value={selectedElement.data.style.textAlign || 'center'}
                                  onChange={(e) => handleUpdateComponentProperty('style.textAlign', e.target.value)}
                                >
                                  <MenuItem value="left">Left</MenuItem>
                                  <MenuItem value="center">Center</MenuItem>
                                  <MenuItem value="right">Right</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                </Box>
                        
                        <Box sx={{ my: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Colors</Typography>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>Background:</Typography>
                                <Box
                    sx={{ 
                      width: 24, 
                      height: 24, 
                                    backgroundColor: selectedElement.data.style.backgroundColor,
                                    border: '1px solid #ccc',
                                    cursor: 'pointer',
                    }}
                                  onClick={(e) => handleColorPickerOpen(e, 'componentBg')}
                  />
                </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>Text:</Typography>
                                <Box
                    sx={{ 
                      width: 24, 
                      height: 24, 
                                    backgroundColor: selectedElement.data.style.color,
                                    border: '1px solid #ccc',
                                    cursor: 'pointer',
                    }}
                                  onClick={(e) => handleColorPickerOpen(e, 'componentText')}
                  />
                </Box>
                            </Grid>
                          </Grid>
                        </Box>
                        
                        <Box sx={{ my: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Content</Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                    size="small"
                            value={selectedElement.data.content}
                            onChange={(e) => handleUpdateComponentProperty('content', e.target.value)}
                          />
                </Box>
                      </>
                    ) : (
                      <>
                        <TextField
                          label="Name"
                          size="small"
                          fullWidth
                          margin="dense"
                          value={selectedElement.type === 'shape' ? 
                            `${selectedElement.data.type} Shape` : 
                            selectedElement.type === 'text' ? 
                            'Text' : 
                            selectedElement.type === 'image' ? 
                            'Image' : ''}
                          disabled
                        />
                        {selectedElement.type === 'text' && (
                          <>
                            <TextField
                              label="Content"
                              size="small"
                              fullWidth
                              margin="dense"
                              value={selectedElement.data.content}
                              onChange={(e) => handleUpdateTextProperty('content', e.target.value)}
                            />
                <FormControl fullWidth size="small" margin="dense">
                              <InputLabel>Font Family</InputLabel>
                  <Select
                                value={selectedElement.data.fontFamily}
                                label="Font Family"
                                onChange={(e) => handleUpdateTextProperty('fontFamily', e.target.value)}
                              >
                                <MenuItem value="Arial">Arial</MenuItem>
                                <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                                <MenuItem value="Courier New">Courier New</MenuItem>
                                <MenuItem value="Georgia">Georgia</MenuItem>
                                <MenuItem value="Verdana">Verdana</MenuItem>
                  </Select>
                </FormControl>
                            <TextField
                              label="Font Size"
                              size="small"
                              type="number"
                              fullWidth
                              margin="dense"
                              value={selectedElement?.data?.fontSize || 12}
                              onChange={(e) => handleUpdateTextProperty('fontSize', Number(e.target.value))}
                            />
                          </>
                        )}

                        {selectedElement.type === 'image' && (
                          <>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <TextField
                                label="Width"
                                size="small"
                                type="number"
                                margin="dense"
                                sx={{ width: '48%' }}
                                value={Math.round(selectedElement.data.width)}
                                onChange={(e) => {
                                  const newWidth = Number(e.target.value);
                                  const newHeight = newWidth / selectedElement.data.aspectRatio;
                                  handleUpdateImageProperty('width', newWidth);
                                  handleUpdateImageProperty('height', newHeight);
                                }}
                              />
                              <TextField
                                label="Height"
                                size="small"
                                type="number"
                                margin="dense"
                                sx={{ width: '48%' }}
                                value={Math.round(selectedElement.data.height)}
                                onChange={(e) => {
                                  const newHeight = Number(e.target.value);
                                  const newWidth = newHeight * selectedElement.data.aspectRatio;
                                  handleUpdateImageProperty('height', newHeight);
                                  handleUpdateImageProperty('width', newWidth);
                                }}
                              />
                            </Box>
                            
                            <FormControl fullWidth margin="dense" size="small">
                              <Typography variant="body2" gutterBottom>
                                Opacity
                  </Typography>
                  <Slider
                                value={selectedElement.data.opacity || 100}
                                onChange={(e, value) => handleUpdateImageProperty('opacity', value)}
                    min={0}
                                max={100}
                                step={1}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}%`}
                              />
                            </FormControl>
                            
                            <FormControl fullWidth margin="dense" size="small">
                              <Typography variant="body2" gutterBottom>
                                Rotation
                  </Typography>
                  <Slider
                                value={selectedElement.data.rotation || 0}
                                onChange={(e, value) => handleUpdateImageProperty('rotation', value)}
                                min={0}
                                max={360}
                                step={1}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}°`}
                              />
                            </FormControl>
                          </>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <TextField
                            label="X Position"
                    size="small"
                            type="number"
                            margin="dense"
                            sx={{ width: '48%' }}
                            value={selectedElement.type === 'shape' ? 
                              Math.min(selectedElement.data.startX, selectedElement.data.endX) :
                              Math.round(selectedElement.data.x) || 0}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (selectedElement.type === 'shape') {
                                const width = Math.abs(selectedElement.data.endX - selectedElement.data.startX);
                                handleUpdateShapeProperty('startX', value);
                                handleUpdateShapeProperty('endX', value + width);
                              } else if (selectedElement.type === 'text') {
                                handleUpdateTextProperty('x', value);
                              } else if (selectedElement.type === 'image') {
                                handleUpdateImageProperty('x', value);
                              }
                            }}
                          />
                          <TextField
                            label="Y Position"
                            size="small"
                            type="number"
                            margin="dense"
                            sx={{ width: '48%' }}
                            value={selectedElement.type === 'shape' ? 
                              Math.min(selectedElement.data.startY, selectedElement.data.endY) :
                              Math.round(selectedElement.data.y) || 0}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (selectedElement.type === 'shape') {
                                const height = Math.abs(selectedElement.data.endY - selectedElement.data.startY);
                                handleUpdateShapeProperty('startY', value);
                                handleUpdateShapeProperty('endY', value + height);
                              } else if (selectedElement.type === 'text') {
                                handleUpdateTextProperty('y', value);
                              } else if (selectedElement.type === 'image') {
                                handleUpdateImageProperty('y', value);
                              }
                            }}
                  />
                </Box>
                        
                        {selectedElement.type === 'shape' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              label="Width"
                              size="small"
                              type="number"
                              margin="dense"
                              sx={{ width: '48%' }}
                              value={Math.abs(selectedElement.data.endX - selectedElement.data.startX)}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                const startX = Math.min(selectedElement.data.startX, selectedElement.data.endX);
                                handleUpdateShapeProperty('endX', startX + value);
                              }}
                            />
                            <TextField
                              label="Height"
                              size="small"
                              type="number"
                              margin="dense"
                              sx={{ width: '48%' }}
                              value={Math.abs(selectedElement.data.endY - selectedElement.data.startY)}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                const startY = Math.min(selectedElement.data.startY, selectedElement.data.endY);
                                handleUpdateShapeProperty('endY', startY + value);
                              }}
                            />
                          </Box>
                        )}
                        
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            startIcon={<DeleteIcon />}
                            onClick={handleDeleteSelected}
                          >
                            Delete
                          </Button>
                        </Box>
                      </>
                    )}
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteSelected}
                      >
                        Delete
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Select an element to edit its properties
                  </Typography>
                )}
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Canvas Settings
                </Typography>
                <FormControlLabel
                  control={<Switch checked={showGrid} onChange={() => setShowGrid(!showGrid)} />}
                  label="Show Grid"
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Color Picker Popover */}
      <Menu
        anchorEl={colorPickerAnchor}
        open={Boolean(colorPickerAnchor)}
        onClose={handleColorPickerClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, width: 250 }}>
          <Typography variant="subtitle2" gutterBottom>
            {colorPickerType === 'stroke' ? 'Stroke Color' : 
              colorPickerType === 'fill' ? 'Fill Color' : 
              colorPickerType === 'shadow' ? 'Shadow Color' : 'Background Color'}
          </Typography>
        <HexColorPicker 
          color={
            colorPickerType === 'stroke' 
              ? strokeColor 
              : colorPickerType === 'fill' 
              ? fillColor 
                : colorPickerType === 'shadow'
                ? shadows.color
              : backgroundColor
          }
          onChange={handleColorChange}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <TextField 
              size="small"
              label="Hex"
              variant="outlined"
              value={
                colorPickerType === 'stroke' 
                  ? strokeColor 
                  : colorPickerType === 'fill' 
                  ? fillColor 
                  : colorPickerType === 'shadow'
                  ? shadows.color
                  : backgroundColor
              }
              onChange={(e) => handleColorChange(e.target.value)}
              sx={{ width: '100%', mb: 2 }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
            <Button size="small" onClick={handleColorPickerClose}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={handleApplyColor}>
              Apply
            </Button>
          </Box>
        </Box>
      </Menu>
      
      {/* Shapes Menu */}
      <Menu
        anchorEl={shapesMenuAnchor}
        open={Boolean(shapesMenuAnchor)}
        onClose={() => setShapesMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          handleToolChange('rectangle');
          setShapesMenuAnchor(null);
          console.log('Rectangle tool selected. Click and drag on the canvas to create a rectangle.');
        }}>
          <ListItemIcon>
            <RectangleIcon fontSize="small" color={tool === 'rectangle' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Rectangle" secondary="Click and drag to create" />
        </MenuItem>
        <MenuItem onClick={() => {
          handleToolChange('ellipse');
          setShapesMenuAnchor(null);
          console.log('Ellipse tool selected. Click and drag on the canvas to create an ellipse/circle.');
        }}>
          <ListItemIcon>
            <CircleIcon fontSize="small" color={tool === 'ellipse' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Ellipse" secondary="Click and drag to create" />
        </MenuItem>
        <MenuItem onClick={() => {
          handleToolChange('line');
          setShapesMenuAnchor(null);
          console.log('Line tool selected. Click and drag on the canvas to create a line.');
        }}>
          <ListItemIcon>
            <LinearScaleIcon fontSize="small" color={tool === 'line' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Line" secondary="Click and drag to create" />
        </MenuItem>
      </Menu>
      
      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          handleSaveDrawing();
          setExportMenuAnchor(null);
        }}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>PNG Image</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleExportSVG();
          setExportMenuAnchor(null);
        }}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>SVG Vector</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          generateReactComponent();
          setExportMenuAnchor(null);
        }}>
          <ListItemIcon>
            <CodeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>React Component</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Text Dialog */}
      <Dialog open={showTextDialog} onClose={handleTextDialogClose}>
        <DialogTitle>Add Text</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Text"
            fullWidth
            variant="outlined"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Font Family</InputLabel>
            <Select
              value={textFontFamily}
              label="Font Family"
              onChange={(e) => setTextFontFamily(e.target.value)}
            >
              <MenuItem value="Arial">Arial</MenuItem>
              <MenuItem value="Times New Roman">Times New Roman</MenuItem>
              <MenuItem value="Courier New">Courier New</MenuItem>
              <MenuItem value="Georgia">Georgia</MenuItem>
              <MenuItem value="Verdana">Verdana</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Font Size"
            type="number"
            fullWidth
            variant="outlined"
            value={textFontSize}
            onChange={(e) => setTextFontSize(Number(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTextDialogClose}>Cancel</Button>
          <Button onClick={handleAddText} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
      
      {/* Canvas Size Dialog */}
      <Dialog open={showCanvasSizeDialog} onClose={handleCanvasSizeDialogClose}>
        <DialogTitle>Canvas Size</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Width"
            type="number"
            fullWidth
            variant="outlined"
            value={newCanvasWidth}
            onChange={(e) => setNewCanvasWidth(Number(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
          />
          <TextField
            margin="dense"
            label="Height"
            type="number"
            fullWidth
            variant="outlined"
            value={newCanvasHeight}
            onChange={(e) => setNewCanvasHeight(Number(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCanvasSizeDialogClose}>Cancel</Button>
          <Button onClick={handleCanvasSizeChange} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
      
      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleImageFileChange}
      />

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcutsDialog} onClose={toggleShortcutsDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <KeyboardIcon sx={{ mr: 1 }} />
              Keyboard Shortcuts
            </Box>
            <IconButton size="small" onClick={toggleShortcutsDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle1" gutterBottom>Tool Selection</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Select Tool</Typography>
                <Typography variant="body2" fontWeight="bold">V</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Pen Tool</Typography>
                <Typography variant="body2" fontWeight="bold">P</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Eraser Tool</Typography>
                <Typography variant="body2" fontWeight="bold">E</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Fill Color Tool</Typography>
                <Typography variant="body2" fontWeight="bold">F</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Text Tool</Typography>
                <Typography variant="body2" fontWeight="bold">T</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Rectangle Tool</Typography>
                <Typography variant="body2" fontWeight="bold">R</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Ellipse Tool</Typography>
                <Typography variant="body2" fontWeight="bold">C</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Line Tool</Typography>
                <Typography variant="body2" fontWeight="bold">L</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1" gutterBottom>Actions</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Undo</Typography>
                <Typography variant="body2" fontWeight="bold">Ctrl+Z</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Redo</Typography>
                <Typography variant="body2" fontWeight="bold">Ctrl+Y</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Save</Typography>
                <Typography variant="body2" fontWeight="bold">Ctrl+S</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Delete Selection</Typography>
                <Typography variant="body2" fontWeight="bold">Delete</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Add New Layer</Typography>
                <Typography variant="body2" fontWeight="bold">L</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Clear Active Layer</Typography>
                <Typography variant="body2" fontWeight="bold">Ctrl+L</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Zoom In</Typography>
                <Typography variant="body2" fontWeight="bold">+</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Zoom Out</Typography>
                <Typography variant="body2" fontWeight="bold">-</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleShortcutsDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Drawing Tools Menu */}
      <Menu
        anchorEl={toolAnchorEl}
        open={Boolean(toolAnchorEl)}
        onClose={() => setToolAnchorEl(null)}
      >
        <MenuItem 
          onClick={() => {
            setToolAnchorEl(null);
            handleToolChange('pen');
          }}
        >
          <ListItemIcon>
            <BorderColorIcon color={tool === 'pen' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Pen" />
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setToolAnchorEl(null);
            handleToolChange('eraser');
          }}
        >
          <ListItemIcon>
            <AutoFixHighIcon color={tool === 'eraser' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Eraser" secondary="Click on any element to delete it" />
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setToolAnchorEl(null);
            handleToolChange('fill');
          }}
        >
          <ListItemIcon>
            <FormatColorFillIcon color={tool === 'fill' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Fill Color" secondary="Click on a shape to fill it" />
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog open={showClearConfirmDialog} onClose={() => setShowClearConfirmDialog(false)}>
        <DialogTitle>Confirm Clear Canvas</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to clear the canvas?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={executeClearCanvas} color="error" autoFocus>
            Clear Canvas
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Restore notification */}
      {showRestoreNotification && (
        <RestoreNotification 
          onContinue={() => setShowRestoreNotification(false)}
          onStartNew={() => {
            setShowClearConfirmDialog(true);
            setShowRestoreNotification(false);
          }}
        />
      )}

      {/* Status Notification */}
      {notificationStatus && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'primary.main',
            color: 'white',
            py: 1,
            px: 3,
            borderRadius: 2,
            boxShadow: 3,
            zIndex: 9999,
          }}
        >
          <Typography>{notificationStatus}</Typography>
        </Box>
      )}

      {/* Save confirmation dialog */}
      <Dialog
        open={showSaveConfirmDialog || false}
        onClose={() => setShowSaveConfirmDialog(false)}
        aria-labelledby="save-confirm-dialog-title"
      >
        <DialogTitle id="save-confirm-dialog-title">Save Your Work?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your canvas will be lost if you don't save it. Would you like to save your work before continuing?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setShowSaveConfirmDialog(false);
              // Continue without saving
            }} 
            color="secondary"
          >
            Don't Save
          </Button>
          <Button 
            onClick={() => {
              handleSaveDrawing();
              setShowSaveConfirmDialog(false);
            }} 
            color="primary" 
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* final closing tags */}
    </Box>
  );
};

export default DrawingBoard;

