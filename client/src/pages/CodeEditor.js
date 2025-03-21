import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Grid, 
  Typography, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Button, 
  TextField,
  Menu,
  MenuItem,
  Tooltip,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import JavascriptIcon from '@mui/icons-material/Javascript';
import HtmlIcon from '@mui/icons-material/Html';
import CssIcon from '@mui/icons-material/Css';
import CodeIcon from '@mui/icons-material/Code';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import BrushIcon from '@mui/icons-material/Brush';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import TerminalIcon from '@mui/icons-material/Terminal';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router-dom';

// Import service and component files
import { saveCodeFile, updateCodeFile, createProject, getProjectFiles } from '../services/projectService';
import SaveToProjectButton from '../components/SaveToProjectButton';
import { useAuth } from '../contexts/AuthContext'; // Add this import

// Styled components for a more professional look
const EditorContainer = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 64px)', // Account for navbar
  display: 'flex',
  flexDirection: 'column',
  paddingTop: '64px', // Account for navbar
  backgroundColor: '#1e1e1e'
}));

const SandboxHeader = styled(Paper)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderRadius: 0,
  backgroundColor: alpha('#1A1A1A', 0.95),
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
  position: 'sticky',
  top: '64px', // Position right below navbar
  zIndex: 1000
}));

const FileTab = styled(Tab)(({ theme }) => ({
  minHeight: '40px',
  textTransform: 'none',
  padding: '0 16px',
  fontSize: '0.85rem',
  backgroundColor: alpha('#333', 0.4),
  borderRight: `1px solid ${alpha('#000', 0.3)}`,
  color: alpha('#fff', 0.8),
  transition: 'all 0.2s',
  '&.Mui-selected': {
    backgroundColor: '#1e1e1e',
    color: '#fff'
  },
  '&:hover': {
    backgroundColor: alpha('#444', 0.5),
  }
}));

const FileTabs = styled(Tabs)(({ theme }) => ({
  minHeight: '40px',
  backgroundColor: '#252525',
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: '3px'
  }
}));

const FileExplorer = styled(Paper)(({ theme }) => ({
  height: '100%',
  backgroundColor: '#252525',
  borderRadius: 0,
  overflow: 'auto',
  borderRight: `1px solid ${alpha('#fff', 0.05)}`
}));

const FileListItem = styled(ListItem)(({ theme, isSelected }) => ({
  padding: theme.spacing(0.75, 1),
  cursor: 'pointer',
  borderLeft: `3px solid ${isSelected ? theme.palette.primary.main : 'transparent'}`,
  backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  '&:hover': {
    backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.action.hover, 0.7),
  }
}));

// Wrapper component to handle isSelected prop correctly
const FileListItemWrapper = ({ isSelected, ...props }) => {
  // Extract isSelected so it's not passed to the DOM
  return <FileListItem isSelected={isSelected} {...props} />;
};

const ConsoleContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#1e1e1e',
  color: 'white',
  padding: theme.spacing(1),
  fontFamily: 'monospace',
  minHeight: '120px',
  maxHeight: '200px',
  overflow: 'auto',
  borderTop: `1px solid ${alpha('#fff', 0.1)}`
}));

// Chat panel styled components
const ChatPanel = styled(Box)(({ theme }) => ({
  position: 'fixed',
  right: 20,
  bottom: 20,
  width: 500,  // Increased width
  height: 600,
  backgroundColor: '#1A1A1A',  // Darker background
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  border: `1px solid ${alpha('#fff', 0.1)}`,
  overflow: 'hidden',
  backdropFilter: 'blur(10px)'
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: alpha('#000', 0.2)
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: alpha('#fff', 0.05),
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha('#fff', 0.2),
    borderRadius: '4px',
    '&:hover': {
      background: alpha('#fff', 0.3),
    },
  }
}));

const Message = styled(Box)(({ theme, isUser }) => ({
  maxWidth: '85%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser ? alpha(theme.palette.primary.main, 0.15) : alpha('#fff', 0.05),
  padding: theme.spacing(2),
  borderRadius: 12,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    [isUser ? 'right' : 'left']: -8,
    borderStyle: 'solid',
    borderWidth: '8px 8px 0 0',
    borderColor: `${isUser ? alpha(theme.palette.primary.main, 0.15) : alpha('#fff', 0.05)} transparent transparent transparent`,
    transform: isUser ? 'none' : 'scaleX(-1)'
  }
}));

const CodeBlock = styled(Box)(({ theme }) => ({
  backgroundColor: '#000',
  padding: theme.spacing(2),
  borderRadius: 8,
  position: 'relative',
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  border: `1px solid ${alpha('#fff', 0.1)}`,
  '& pre': {
    margin: 0,
    padding: theme.spacing(1.5),
    backgroundColor: alpha('#fff', 0.05),
    borderRadius: 4,
    overflowX: 'auto',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    fontFamily: '"JetBrains Mono", monospace',
    '&::-webkit-scrollbar': {
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: alpha('#fff', 0.05),
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: alpha('#fff', 0.2),
      borderRadius: '4px',
      '&:hover': {
        background: alpha('#fff', 0.3),
      },
    }
  }
}));

const ChatInput = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${alpha('#fff', 0.1)}`,
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'flex-start',
  backgroundColor: alpha('#000', 0.2)
}));

// Add folder support types
const FileType = {
  FILE: 'file',
  FOLDER: 'folder'
};

// Initial project structure with folders
const initialFiles = [
  {
    id: 'src',
    name: 'src',
    type: FileType.FOLDER,
    children: [
      {
        id: 'components',
        name: 'components',
        type: FileType.FOLDER,
        children: []
      },
      {
        id: 'src/index.html',
        name: 'index.html',
        type: FileType.FILE,
        language: 'html',
        value: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Sandbox</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app"></div>
  <div id="react-app"></div>
  
  <!-- React dependencies -->
  <script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  
  <!-- Regular JavaScript -->
  <script src="script.js"></script>
  
  <!-- React Component (processed with Babel) -->
  <script type="text/babel" src="App.jsx"></script>
</body>
</html>`
      }
    ]
  },
  {
    id: 'public',
    name: 'public',
    type: FileType.FOLDER,
    children: [
      {
        id: 'public/styles.css',
        name: 'styles.css',
        type: FileType.FILE,
        language: 'css',
        value: `/* VibeCoder Sandbox Styles */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  min-height: 100vh;
}

/* ... rest of the CSS ... */`
      }
    ]
  },
  {
    id: 'scripts',
    name: 'scripts',
    type: FileType.FOLDER,
    children: [
      {
        id: 'scripts/script.js',
        name: 'script.js',
        type: FileType.FILE,
        language: 'javascript',
        value: `// Welcome to VibeCoder Sandbox
console.log('Script loaded!');

// ... rest of the JavaScript ...`
      }
    ]
  }
];

const getIconForFile = (fileName) => {
  if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
    return <JavascriptIcon sx={{ color: '#61DAFB' }}/>;
  } else if (fileName.endsWith('.js')) {
    return <JavascriptIcon sx={{ color: '#F7DF1E' }}/>;
  } else if (fileName.endsWith('.html')) {
    return <HtmlIcon sx={{ color: '#E44D26' }}/>;
  } else if (fileName.endsWith('.css')) {
    return <CssIcon sx={{ color: '#264DE4' }}/>;
  } else {
    return <DescriptionIcon />;
  }
};

const getLanguageForFile = (fileName) => {
  if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
    return 'javascript';
  } else if (fileName.endsWith('.js')) {
    return 'javascript';
  } else if (fileName.endsWith('.html')) {
    return 'html';
  } else if (fileName.endsWith('.css')) {
    return 'css';
  } else if (fileName.endsWith('.json')) {
    return 'json';
  } else {
    return 'plaintext';
  }
};

// Add template options for new file creation
const fileTemplates = {
  '.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Page</title>
</head>
<body>
  
</body>
</html>`,
  '.css': `/* Styles for the new CSS file */
  
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}`,
  '.js': `// JavaScript code
console.log('Hello from new file!');

function init() {
  // Your code here
}

init();`,
  '.jsx': `// React component
function NewComponent() {
  const [state, setState] = React.useState('');
  
  return (
    <div className="component">
      <h3>New Component</h3>
      <p>Start editing to see changes</p>
    </div>
  );
}

// Don't forget to render your component somewhere
// ReactDOM.render(<NewComponent />, document.getElementById('mount-point'));`
};

const CodeEditor = () => {
  // Move useParams() to the top before any functions that depend on it
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // Add null check for useAuth to prevent destructuring errors
  const auth = useAuth();
  const currentUser = auth?.currentUser;

  // Get all files for tabs and editing
  const getAllFilesFlat = (items) => {
    let files = [];
    items.forEach(item => {
      if (item.type === FileType.FILE) {
        files.push(item);
      } else if (item.type === FileType.FOLDER && item.children) {
        files = [...files, ...getAllFilesFlat(item.children)];
      }
    });
    return files;
  };

  // Load files from localStorage or use initial files
  const getInitialFiles = () => {
    // If we have a projectId, we should load files from server
    if (projectId) {
      // Initially return the initialFiles, but we'll load from server in useEffect
      return initialFiles;
    }
    // If no projectId, fall back to localStorage for unsaved drafts
    const savedFiles = localStorage.getItem('vibecoderFiles');
    return savedFiles ? JSON.parse(savedFiles) : initialFiles;
  };

  const [files, setFiles] = useState(getInitialFiles);
  const [activeFileId, setActiveFileId] = useState(() => {
    const savedActiveFileId = localStorage.getItem('vibecoderActiveFileId');
    if (savedActiveFileId) return savedActiveFileId;
    
    const allFiles = getAllFilesFlat(getInitialFiles());
    return allFiles.length > 0 ? allFiles[0].id : null;
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(['// Console output will appear here']);
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [addFileMenuAnchor, setAddFileMenuAnchor] = useState(null);
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [editedFileName, setEditedFileName] = useState('');
  const iframeRef = useRef(null);
  const fileNameInputRef = useRef(null);
  const theme = useTheme();
  const [expandedFolders, setExpandedFolders] = useState(() => {
    const savedExpandedFolders = localStorage.getItem('vibecoderExpandedFolders');
    return savedExpandedFolders 
      ? new Set(JSON.parse(savedExpandedFolders)) 
      : new Set(['src', 'public', 'scripts']);
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [fileIdMap, setFileIdMap] = useState({});
  const [showSaveProjectDialog, setShowSaveProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Get active file from anywhere in the structure
  const getActiveFile = () => {
    const findFile = (items) => {
      for (const item of items) {
        if (item.id === activeFileId) return item;
        if (item.children) {
          const found = findFile(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findFile(files) || getAllFilesFlat(files)[0];
  };

  // Update the activeFile reference to use the new getter
  const activeFile = getActiveFile();

  // Update file content in the folder structure
  const updateFileInStructure = (items, fileId, newValue, setModified = false) => {
    return items.map(item => {
      if (item.id === fileId) {
        return { 
          ...item, 
          value: newValue,
          modified: setModified ? true : item.modified
        };
      }
      if (item.children) {
        return {
          ...item,
          children: updateFileInStructure(item.children, fileId, newValue, setModified)
        };
      }
      return item;
    });
  };

  // Update file content with auto-save to server
  const handleEditorChange = (value) => {
    const updatedStructure = updateFileInStructure(files, activeFileId, value);
    setFiles(updatedStructure);
    
    // Mark file as modified
    const activeFile = getActiveFile();
    if (activeFile && !activeFile.modified) {
      const updatedStructureWithModified = updateFileInStructure(
        updatedStructure, 
        activeFileId, 
        value, 
        true
      );
      setFiles(updatedStructureWithModified);
      
      // If we have a projectId, don't save to localStorage
      if (!projectId) {
        localStorage.setItem('vibecoderFiles', JSON.stringify(updatedStructureWithModified));
      }
    } else if (!projectId) {
      // Only save to localStorage if not working with a server project
      localStorage.setItem('vibecoderFiles', JSON.stringify(updatedStructure));
    }
  };

  // File tab component
  const FileTabLabel = ({ file }) => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {getIconForFile(file.name)}
      <Box sx={{ ml: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {file.name}
        </Typography>
        {file.id.includes('/') && (
          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
            {file.id.split('/').slice(0, -1).join('/')}
          </Typography>
        )}
      </Box>
    </Box>
  );

  // File add menu component
  const FileAddMenu = () => (
    <Menu
      anchorEl={addFileMenuAnchor}
      open={Boolean(addFileMenuAnchor)}
      onClose={() => setAddFileMenuAnchor(null)}
      PaperProps={{
        sx: {
          backgroundColor: '#252525',
          color: 'white',
          border: `1px solid ${alpha('#fff', 0.1)}`
        }
      }}
    >
      <MenuItem onClick={() => handleAddFile('.html')}>
        <HtmlIcon sx={{ mr: 1, color: '#E44D26' }} />
        HTML File
      </MenuItem>
      <MenuItem onClick={() => handleAddFile('.css')}>
        <CssIcon sx={{ mr: 1, color: '#264DE4' }} />
        CSS File
      </MenuItem>
      <MenuItem onClick={() => handleAddFile('.js')}>
        <JavascriptIcon sx={{ mr: 1, color: '#F7DF1E' }} />
        JavaScript File
      </MenuItem>
      <MenuItem onClick={() => handleAddFile('.jsx')}>
        <JavascriptIcon sx={{ mr: 1, color: '#61DAFB' }} />
        React Component
      </MenuItem>
    </Menu>
  );

  // Run the code
  const handleRunCode = () => {
    setIsRunning(true);
    setConsoleOutput(['// Running code...']);
    
    // Get all files from the folder structure
    const allFiles = getAllFilesFlat(files);
    
    // Create a map of file paths to blob URLs
    const fileBlobs = new Map();
    
    // Create blob URLs for all files
    allFiles.forEach(file => {
      const blob = new Blob([file.value], { 
        type: file.name.endsWith('.html') ? 'text/html' :
              file.name.endsWith('.css') ? 'text/css' :
              file.name.endsWith('.js') || file.name.endsWith('.jsx') ? 'text/javascript' :
              'text/plain'
      });
      fileBlobs.set(file.id, URL.createObjectURL(blob));
    });

    // Get the main HTML file or create one
    const htmlFile = allFiles.find(file => file.name.endsWith('.html')) || {
      value: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Preview</title>
  <script>
    // Error handling for script loading
    window.addEventListener('error', function(e) {
      if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
        console.error('Failed to load:', e.target.src || e.target.href);
      }
    }, true);
  </script>
</head>
<body>
  <div id="app"></div>
  <div id="react-app"></div>
</body>
</html>`
    };

    let htmlContent = htmlFile.value;

    // Add React dependencies if there are React files
    const hasReactFiles = allFiles.some(file => 
      file.name.endsWith('.jsx') || file.name.endsWith('.tsx')
    );

    let reactDeps = '';
    if (hasReactFiles) {
      reactDeps = `
    <script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    `;
    }

    // Inject console capture first
    const consoleCapture = `
      <script>
        // Capture console output with file information
        const originalConsole = window.console;
        window.console = {
          log: function() {
            const args = Array.from(arguments).map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            );
            window.parent.postMessage({
              type: 'console',
              method: 'log',
              args: args.join(' '),
              file: document.currentScript?.getAttribute('data-file') || 'unknown'
            }, '*');
            originalConsole.log.apply(originalConsole, arguments);
          },
          error: function() {
            const args = Array.from(arguments).map(arg => 
              arg instanceof Error ? arg.message : 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            );
            window.parent.postMessage({
              type: 'console',
              method: 'error',
              args: args.join(' '),
              file: document.currentScript?.getAttribute('data-file') || 'unknown'
            }, '*');
            originalConsole.error.apply(originalConsole, arguments);
          },
          warn: function() {
            const args = Array.from(arguments).map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            );
            window.parent.postMessage({
              type: 'console',
              method: 'warn',
              args: args.join(' '),
              file: document.currentScript?.getAttribute('data-file') || 'unknown'
            }, '*');
            originalConsole.warn.apply(originalConsole, arguments);
          }
        };

        // Enhanced error handling
        window.addEventListener('error', function(event) {
          const errorInfo = {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error?.stack || event.error
          };
          
          window.parent.postMessage({
            type: 'console',
            method: 'error',
            args: \`Error in \${event.filename}:\\n\${event.message}\\nLine: \${event.lineno}, Column: \${event.colno}\${event.error?.stack ? '\\n' + event.error.stack : ''}\`,
            file: event.filename || 'unknown'
          }, '*');
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', function(event) {
          window.parent.postMessage({
            type: 'console',
            method: 'error',
            args: \`Unhandled Promise Rejection:\\n\${event.reason}\`,
            file: 'unknown'
          }, '*');
        });
      </script>
    `;

    // Inject CSS files
    const cssFiles = allFiles.filter(file => file.name.endsWith('.css'));
    const cssContent = cssFiles.map(file => 
      `<link rel="stylesheet" href="${fileBlobs.get(file.id)}" data-file="${file.id}">`
    ).join('\\n');

    // Prepare JavaScript files
    const jsFiles = allFiles.filter(file => file.name.endsWith('.js'));
    const jsContent = jsFiles.map(file => 
      `<script src="${fileBlobs.get(file.id)}" data-file="${file.id}"></script>`
    ).join('\\n');

    // Prepare React/JSX files
    const reactFiles = allFiles.filter(file => 
      file.name.endsWith('.jsx') || file.name.endsWith('.tsx')
    );
    const reactContent = reactFiles.map(file => 
      `<script type="text/babel" data-file="${file.id}" data-presets="react">
        ${file.value}
      </script>`
    ).join('\\n');

    // Assemble the final HTML content with proper ordering
    htmlContent = htmlContent
      .replace('</head>', `${consoleCapture}${reactDeps}${cssContent}</head>`)
      .replace('</body>', `${jsContent}${reactContent}</body>`);

    try {
      // Create blob and URL for the final HTML
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobURL = URL.createObjectURL(blob);
      
      // Set the iframe src to the blob URL
      if (iframeRef.current) {
        iframeRef.current.src = blobURL;
        
        // Clean up all blob URLs after the iframe loads
        iframeRef.current.onload = () => {
          fileBlobs.forEach(url => URL.revokeObjectURL(url));
          URL.revokeObjectURL(blobURL);
          setIsRunning(false);
        };
      }
    } catch (error) {
      setConsoleOutput(prev => [...prev, `error: ${error.message}`]);
      console.error('Error running code:', error);
      setIsRunning(false);
    }
  };

  // Get monacoOptions based on file type
  const getMonacoOptions = (file) => {
    // Base options that apply to all file types
    const baseOptions = {
      fontSize: 14,
      minimap: { enabled: true },
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      lineNumbersMinChars: 3,
      renderWhitespace: 'selection'
    };
    
    // If no file is provided, return base options
    if (!file || !file.name) {
      return baseOptions;
    }
    
    // Check file extension safely
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
      return {
        ...baseOptions,
        tabSize: 2,
        formatOnPaste: true,
        formatOnType: true,
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        suggestOnTriggerCharacters: true,
      };
    }
    
    return baseOptions;
  };
  
  // Export project as zip file
  const handleExportProject = () => {
    // We would normally use JSZip here, but since we're in a sandbox,
    // we'll just show a message about the feature
    setConsoleOutput(prev => [...prev, 'info: Export project feature would download all files as a zip.']);
    alert('In a full implementation, this would download all project files as a zip archive.');
  };
  
  // Update the message handler to show file information in console
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'console') {
        const fileInfo = event.data.file ? `[${event.data.file}] ` : '';
        setConsoleOutput(prev => [...prev, `${event.data.method}: ${fileInfo}${event.data.args}`]);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Auto-run the code when first loaded
  useEffect(() => {
    handleRunCode();
  }, []);

  // Toggle folder expansion
  const handleToggleFolder = (folderId) => {
    setExpandedFolders(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return newExpanded;
    });
  };

  // Create a new folder
  const handleCreateFolder = (parentId = null) => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    const newFolder = {
      id: parentId ? `${parentId}/${folderName}` : folderName,
      name: folderName,
      type: FileType.FOLDER,
      children: []
    };

    setFiles(prevFiles => {
      let newFiles = [...prevFiles];
      if (parentId) {
        // Add to specific parent folder
        const addToParent = (items) => {
          return items.map(item => {
            if (item.id === parentId) {
              return {
                ...item,
                children: [...item.children, newFolder]
              };
            }
            if (item.children) {
              return {
                ...item,
                children: addToParent(item.children)
              };
            }
            return item;
          });
        };
        newFiles = addToParent(newFiles);
      } else {
        // Add to root
        newFiles = [...newFiles, newFolder];
      }
      // Save to localStorage
      localStorage.setItem('vibecoderFiles', JSON.stringify(newFiles));
      return newFiles;
    });
  };

  // Handle finishing file name edit
  const handleFinishEditFileName = (e) => {
    e?.preventDefault(); // Make preventDefault optional since we might call this directly
    if (!activeFile || !editedFileName) return;

    // Ensure we keep the file extension
    const oldExt = activeFile.name.split('.').pop();
    let newFileName = editedFileName;
    if (!newFileName.endsWith('.' + oldExt)) {
      newFileName += '.' + oldExt;
    }

    // Get the parent folder path from the current file ID
    const parentPath = activeFile.id.includes('/') 
      ? activeFile.id.substring(0, activeFile.id.lastIndexOf('/'))
      : '';

    // Create the new file ID with parent path if it exists
    const newFileId = parentPath 
      ? `${parentPath}/${newFileName}`
      : newFileName;

    // Update file name in structure
    const updateFileName = (items) => {
      return items.map(item => {
        if (item.id === activeFile.id) {
          return { 
            ...item, 
            id: newFileId,
            name: newFileName 
          };
        }
        if (item.children) {
          return {
            ...item,
            children: updateFileName(item.children)
          };
        }
        return item;
      });
    };

    setFiles(prevFiles => {
      const newFiles = updateFileName(prevFiles);
      // Update active file ID to match new name
      setActiveFileId(newFileId);
      // Save to localStorage
      localStorage.setItem('vibecoderFiles', JSON.stringify(newFiles));
      return newFiles;
    });

    setIsEditingFileName(false);
    setEditedFileName('');
  };

  // Handle file name edit change
  const handleFileNameChange = (e) => {
    setEditedFileName(e.target.value);
  };

  // Handle cancel file name edit
  const handleCancelEditFileName = () => {
    setIsEditingFileName(false);
    setEditedFileName('');
  };

  // Update the renderFileTree function to include file name editing UI
  const renderFileTree = (items, level = 0) => {
    return items.map(item => {
      const isFolder = item.type === FileType.FOLDER;
      const isExpanded = expandedFolders.has(item.id);
      const isEditing = !isFolder && item.id === activeFileId && isEditingFileName;

  return (
        <Box key={item.id}>
          <FileListItemWrapper
            isSelected={!isFolder && item.id === activeFileId}
            onClick={() => {
              if (isFolder) {
                handleToggleFolder(item.id);
              } else {
                setActiveFileId(item.id);
              }
            }}
            sx={{ 
              pl: level * 2 + 2,
              position: 'relative',
              '&::before': isFolder ? {
                content: '""',
                position: 'absolute',
                left: level * 16 + 8,
                top: '50%',
                width: 2,
                height: '100%',
                backgroundColor: alpha('#fff', 0.1),
                transform: 'translateY(-50%)'
              } : {}
            }}
            draggable={!isEditing}
            onDragStart={(e) => {
              if (!isEditing) {
                setDraggedItem(item);
                e.dataTransfer.setData('text/plain', item.id);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (isFolder && draggedItem?.id !== item.id) {
                setDropTarget(item.id);
              }
            }}
            onDragLeave={() => setDropTarget(null)}
            onDrop={(e) => {
              e.preventDefault();
              if (isFolder && draggedItem && draggedItem.id !== item.id) {
                // Handle file/folder drop
                const moveItem = (items) => {
                  return items.filter(i => i.id !== draggedItem.id).map(i => {
                    if (i.id === item.id) {
                      return {
                        ...i,
                        children: [...i.children, draggedItem]
                      };
                    }
                    if (i.children) {
                      return {
                        ...i,
                        children: moveItem(i.children)
                      };
                    }
                    return i;
                  });
                };
                setFiles(prev => moveItem(prev));
              }
              setDraggedItem(null);
              setDropTarget(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: '36px' }}>
              {isFolder ? (
                isExpanded ? <FolderOpenIcon sx={{ color: '#64748B' }} /> : 
                            <FolderIcon sx={{ color: '#64748B' }} />
              ) : (
                getIconForFile(item.name)
              )}
            </ListItemIcon>
            {isEditing ? (
              <form onSubmit={handleFinishEditFileName} style={{ flex: 1 }}>
                <TextField
                  autoFocus
                  value={editedFileName}
                  onChange={handleFileNameChange}
                  onBlur={handleFinishEditFileName}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      handleCancelEditFileName();
                    }
                  }}
                  variant="standard"
                  size="small"
                  sx={{
                    input: { color: 'white', fontSize: '0.875rem' },
                    '& .MuiInput-underline:before': { borderBottomColor: alpha('#fff', 0.42) },
                    '& .MuiInput-underline:hover:before': { borderBottomColor: alpha('#fff', 0.87) },
                    '& .MuiInput-underline:after': { borderBottomColor: theme.palette.primary.main }
                  }}
                />
              </form>
            ) : (
              <ListItemText 
                primary={item.name}
                primaryTypographyProps={{ 
                  variant: 'body2',
                  sx: { 
                    color: isFolder ? alpha('#fff', 0.9) : 
                           item.id === activeFileId ? theme.palette.primary.main : 
                           alpha('#fff', 0.8),
                    fontWeight: isFolder || item.id === activeFileId ? 500 : 400
                  }
                }}
              />
            )}
            {isFolder && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateFolder(item.id);
                }}
                sx={{ 
                  mr: 1,
                  color: alpha('#fff', 0.6),
                  '&:hover': { color: theme.palette.primary.main }
                }}
              >
                <CreateNewFolderIcon fontSize="small" />
              </IconButton>
            )}
            {isFolder ? (
              <IconButton
                size="small"
                onClick={() => handleToggleFolder(item.id)}
                sx={{ 
                  color: alpha('#fff', 0.6),
                  transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s'
                }}
              >
                <KeyboardArrowDownIcon fontSize="small" />
              </IconButton>
            ) : (
              item.id === activeFileId && !isEditing && (
                <Box>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEditFileName(e);
                    }}
                    sx={{ 
                      color: alpha('#fff', 0.6),
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    <BrushIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(e);
                    }}
                    sx={{ 
                      color: alpha('#fff', 0.6),
                      '&:hover': { color: theme.palette.error.main }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )
            )}
          </FileListItemWrapper>
          {isFolder && isExpanded && item.children?.length > 0 && (
            <Box>
              {renderFileTree(item.children, level + 1)}
            </Box>
          )}
        </Box>
      );
    });
  };

  // Add a new file
  const handleAddFile = (extension, targetFolderId = null) => {
    let fileName = newFileName || `file${getAllFilesFlat(files).length + 1}${extension}`;
    
    // Ensure the file has the correct extension
    if (!fileName.endsWith(extension)) {
      fileName += extension;
    }
    
    // Check if file name already exists
    const existingFiles = getAllFilesFlat(files);
    if (existingFiles.find(file => file.name === fileName)) {
      let counter = 1;
      let newName = fileName;
      while (existingFiles.find(file => file.name === newName)) {
        const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        const ext = fileName.substring(fileName.lastIndexOf('.')) || '';
        newName = `${baseName}_${counter}${ext}`;
        counter++;
      }
      fileName = newName;
    }
    
    const newFile = {
      id: targetFolderId ? `${targetFolderId}/${fileName}` : fileName,
      name: fileName,
      type: FileType.FILE,
      language: getLanguageForFile(fileName),
      value: fileTemplates[extension] || ''
    };
    
    const addToFolder = (items, folderId) => {
      return items.map(item => {
        if (item.id === folderId) {
          return {
            ...item,
            children: [...(item.children || []), newFile]
          };
        }
        if (item.type === FileType.FOLDER && item.children) {
          return {
            ...item,
            children: addToFolder(item.children, folderId)
          };
        }
        return item;
      });
    };
    
    setFiles(prevFiles => {
      let newFiles;
      if (!targetFolderId) {
        newFiles = [...prevFiles, newFile];
      } else {
        newFiles = addToFolder(prevFiles, targetFolderId);
      }
      // Save to localStorage
      localStorage.setItem('vibecoderFiles', JSON.stringify(newFiles));
      return newFiles;
    });
    
    setActiveFileId(newFile.id);
    setNewFileName('');
    setAddFileMenuAnchor(null);
  };

  // Add file to folder context menu
  const handleAddFileToFolder = (folderId) => {
    setAddFileMenuAnchor(null);
    const extension = prompt('Enter file extension (e.g., .js, .html, .css, .jsx):');
    if (!extension) return;
    
    if (!['.js', '.html', '.css', '.jsx'].includes(extension)) {
      alert('Unsupported file extension. Please use .js, .html, .css, or .jsx');
      return;
    }
    
    handleAddFile(extension, folderId);
  };

  // Handle starting file name edit
  const handleStartEditFileName = (e) => {
    e.stopPropagation();
    setIsEditingFileName(true);
    setEditedFileName(activeFile.name);
  };

  // Handle file deletion
  const handleDeleteFile = (e) => {
    e.stopPropagation();
    if (!activeFile) return;

    const deleteFromStructure = (items) => {
      return items.filter(item => item.id !== activeFile.id).map(item => {
        if (item.children) {
          return {
            ...item,
            children: deleteFromStructure(item.children)
          };
        }
        return item;
      });
    };

    setFiles(prevFiles => {
      const newFiles = deleteFromStructure(prevFiles);
      // Set active file to the first available file
      const remainingFiles = getAllFilesFlat(newFiles);
      if (remainingFiles.length > 0) {
        setActiveFileId(remainingFiles[0].id);
      } else {
        setActiveFileId(null);
      }
      // Save to localStorage
      localStorage.setItem('vibecoderFiles', JSON.stringify(newFiles));
      return newFiles;
    });
  };

  // Update the handleSendMessage function
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('AI service error:', errorData);
        throw new Error('Failed to get response from AI service');
      }

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
      } else {
        throw new Error(data.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Insert code into the editor
  const handleInsertCode = (code) => {
    if (activeFile) {
      const updatedValue = activeFile.value + '\n\n' + code;
      handleEditorChange(updatedValue);
    }
  };

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  // Add this useEffect hook for auto-saving
  useEffect(() => {
    let autoSaveTimer;
    
    // Auto-save the active file if it has been modified
    if (autoSave && projectId) {
      const activeFile = getActiveFile();
      if (activeFile && activeFile.modified) {
        autoSaveTimer = setTimeout(() => {
          handleSaveFile(activeFile);
        }, 3000); // Auto-save after 3 seconds of inactivity
      }
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [files, activeFileId, autoSave, projectId]);

  // Add useEffect to load files from server when projectId is available
  useEffect(() => {
    const loadProjectFiles = async () => {
      if (!projectId || !currentUser) return;
      
      try {
        // Simulate loading state - in a real app, add a loading indicator
        setSaveStatus('Loading project files...');
        
        // Get project files using the updated service function
        const data = await getProjectFiles(projectId);
        
        // Verify this project belongs to current user before loading
        if (data.userId && data.userId !== currentUser.id) {
          setSaveStatus('Error: You do not have access to this project');
          setTimeout(() => setSaveStatus(''), 4000);
          navigate('/code'); // Redirect to code page without project
          return;
        }
        
        if (data.codeFiles && data.codeFiles.length > 0) {
          // Convert server files to our app's format
          const serverFiles = transformServerFilesToAppFormat(data.codeFiles);
          setFiles(serverFiles);
          
          // Set active file to the first one
          const allFiles = getAllFilesFlat(serverFiles);
          if (allFiles.length > 0) {
            setActiveFileId(allFiles[0].id);
          }
          
          // Create a mapping of file IDs
          const idMapping = {};
          data.codeFiles.forEach(file => {
            // Create a key in our app's format that matches the file
            const appFileId = file.path ? `${file.path}/${file.name}` : file.name;
            idMapping[appFileId] = file._id;
          });
          
          setFileIdMap(idMapping);
        }
        
        setSaveStatus('Project loaded');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        console.error('Error loading project:', error);
        setSaveStatus(`Error: ${error.message}`);
        setTimeout(() => setSaveStatus(''), 4000);
      }
    };
    
    // Function to transform server files to app format
    const transformServerFilesToAppFormat = (serverFiles) => {
      // This is a simplified example - adapt to your server's response format
      const folderMap = new Map();
      
      // First pass: create folder structure
      serverFiles.forEach(file => {
        const path = file.path || '';
        const parts = path.split('/').filter(Boolean);
        
        let currentPath = '';
        parts.forEach((part, index) => {
          const isLastPart = index === parts.length - 1;
          const newPath = currentPath ? `${currentPath}/${part}` : part;
          
          if (!isLastPart && !folderMap.has(newPath)) {
            folderMap.set(newPath, {
              id: newPath,
              name: part,
              type: FileType.FOLDER,
              children: []
            });
          }
          
          currentPath = newPath;
        });
      });
      
      // Second pass: add files to folders
      const rootItems = [];
      
      serverFiles.forEach(file => {
        const filePath = file.path || '';
        const parts = filePath.split('/').filter(Boolean);
        const fileName = file.name;
        
        const fileObj = {
          id: filePath ? `${filePath}/${fileName}` : fileName,
          name: fileName,
          type: FileType.FILE,
          language: getLanguageForFile(fileName),
          value: file.content || '',
        };
        
        if (parts.length === 0) {
          // Root level file
          rootItems.push(fileObj);
        } else {
          // File in a folder
          const folderPath = parts.join('/');
          if (folderMap.has(folderPath)) {
            const folder = folderMap.get(folderPath);
            folder.children.push(fileObj);
          }
        }
      });
      
      // Add folders to their parent folders
      folderMap.forEach((folder, path) => {
        const parts = path.split('/');
        if (parts.length === 1) {
          // Root level folder
          rootItems.push(folder);
        } else {
          // Nested folder
          const parentPath = parts.slice(0, -1).join('/');
          if (folderMap.has(parentPath)) {
            const parentFolder = folderMap.get(parentPath);
            parentFolder.children.push(folder);
          }
        }
      });
      
      return rootItems;
    };
    
    loadProjectFiles();
  }, [projectId, currentUser, navigate]);

  // Modify saveFile to handle server-side saving with user ID
  const handleSaveFile = async (file) => {
    if (!file || !currentUser) return;
    
    try {
      setSaveStatus('Saving...');
      
      const fileData = {
        name: file.name,
        content: file.value,
        language: getLanguageForFile(file.name),
        // Add path based on file.id (removing the file name)
        path: file.id.includes('/') ? file.id.substring(0, file.id.lastIndexOf('/')) : '',
        userId: currentUser.id // Include user ID with the file data
      };
      
      let result;
      
      if (projectId) {
        // Check if this file has already been saved to server
        if (fileIdMap[file.id]) {
          result = await updateCodeFile(projectId, fileIdMap[file.id], fileData);
        } else {
          result = await saveCodeFile(projectId, fileData);
          // Store the mapping between UI file id and server file id
          if (result && result.codeFiles) {
            const newFileId = result.codeFiles[result.codeFiles.length - 1]._id;
            setFileIdMap(prev => ({
              ...prev,
              [file.id]: newFileId
            }));
          }
        }
        
        // Mark file as no longer modified
        const updatedStructure = updateFileInStructure(
          files,
          file.id,
          file.value,
          false // set modified to false
        );
        setFiles(updatedStructure);
        
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        // If no projectId, prompt to create a project
        setShowSaveProjectDialog(true);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      setSaveStatus(`Error: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 4000);
    }
  };

  // Add function to save active file
  const handleSaveActiveFile = () => {
    const activeFile = getActiveFile();
    if (activeFile) {
      handleSaveFile(activeFile);
    }
  };

  // Add function to save all files
  const handleSaveAllFiles = async () => {
    const allFiles = getAllFilesFlat(files);
    const modifiedFiles = allFiles.filter(file => file.modified);
    
    if (modifiedFiles.length === 0) {
      setSaveStatus('No changes to save');
      setTimeout(() => setSaveStatus(''), 2000);
      return;
    }
    
    try {
      setSaveStatus(`Saving ${modifiedFiles.length} files...`);
      
      for (const file of modifiedFiles) {
        await handleSaveFile(file);
      }
      
      setSaveStatus('All files saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving files:', error);
      setSaveStatus(`Error: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 4000);
    }
  };

  // Add function to save to a new project
  const handleSaveToNewProject = async () => {
    if (!currentUser) {
      setSaveStatus('Error: You must be logged in to save a project');
      setTimeout(() => setSaveStatus(''), 4000);
      return;
    }
    
    try {
      setSaveStatus('Creating project...');
      
      const newProject = await createProject({
        name: newProjectName || 'New Code Project',
        description: 'Created from Code Editor',
        type: 'Full Stack',
        userId: currentUser.id // Include user ID with the project
      });
      
      // Navigate to the new project with the ID
      navigate(`/code?projectId=${newProject._id}`);
      
      // Save all files to the new project
      await handleSaveAllFiles();
      
      setShowSaveProjectDialog(false);
    } catch (error) {
      console.error('Error creating project:', error);
      setSaveStatus(`Error: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 4000);
    }
  };

  // Update the activeFileId in localStorage when changed
  useEffect(() => {
    if (activeFileId) {
      localStorage.setItem('vibecoderActiveFileId', activeFileId);
    }
  }, [activeFileId]);

  // Add localStorage persistence for expandedFolders
  useEffect(() => {
    // Save expanded folders state to localStorage
    localStorage.setItem('vibecoderExpandedFolders', JSON.stringify(Array.from(expandedFolders)));
  }, [expandedFolders]);

  // Add the clear workspace function
  const handleClearWorkspace = () => {
    if (window.confirm('Are you sure you want to reset the workspace? All unsaved changes will be lost.')) {
      localStorage.removeItem('vibecoderFiles');
      localStorage.removeItem('vibecoderActiveFileId');
      localStorage.removeItem('vibecoderExpandedFolders');
      
      setFiles(initialFiles);
      const allFiles = getAllFilesFlat(initialFiles);
      setActiveFileId(allFiles.length > 0 ? allFiles[0].id : null);
      setExpandedFolders(new Set(['src', 'public', 'scripts']));
    }
  };

  // Save all changes when user navigates away or closes window
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('vibecoderFiles', JSON.stringify(files));
      localStorage.setItem('vibecoderActiveFileId', activeFileId);
      localStorage.setItem('vibecoderExpandedFolders', JSON.stringify(Array.from(expandedFolders)));
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [files, activeFileId, expandedFolders]);

  // Add this Dialog component to create a new project
  const renderSaveProjectDialog = () => (
    <Dialog 
      open={showSaveProjectDialog} 
      onClose={() => setShowSaveProjectDialog(false)}
      PaperProps={{
        sx: {
          backgroundColor: '#252525',
          color: 'white',
          border: `1px solid ${alpha('#fff', 0.1)}`,
          width: '400px'
        }
      }}
    >
      <DialogTitle>
        Save to Project
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Your code needs to be saved to a project. Please enter a name for your new project.
        </Typography>
        <TextField
          fullWidth
          label="Project Name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          margin="dense"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: alpha('#fff', 0.2) },
              '&:hover fieldset': { borderColor: alpha('#fff', 0.3) },
              '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }
            },
            '& .MuiInputLabel-root': { color: alpha('#fff', 0.7) }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setShowSaveProjectDialog(false)}
          sx={{ color: alpha('#fff', 0.7) }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveToNewProject}
          variant="contained"
          sx={{ bgcolor: theme.palette.primary.main }}
        >
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Add the handleSaveToProject function with user ID
  const handleSaveToProject = async (project) => {
    if (!currentUser) {
      throw new Error('You must be logged in to save to a project');
    }
    
    try {
      // Get all files
      const allFiles = getAllFilesFlat(files);
      
      // Save each file to the project
      const targetProjectId = project._id;
      
      // For simplicity, we'll save each file sequentially
      for (const file of allFiles) {
        const fileData = {
          name: file.name,
          content: file.value, // Use value instead of content for consistency
          language: getLanguageForFile(file.name),
          // Add path based on file.id (removing the file name)
          path: file.id.includes('/') ? file.id.substring(0, file.id.lastIndexOf('/')) : '',
          userId: currentUser.id // Include the user ID
        };
        
        await saveCodeFile(targetProjectId, fileData);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving code to project:', error);
      throw error;
    }
  };

  // Update the return statement's relevant parts
  return (
    <EditorContainer>
      <SandboxHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            component={Button} 
            to="/"
            sx={{ color: 'white', mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ 
            color: 'white',
            background: 'linear-gradient(45deg, #3B82F6, #EC4899)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            display: 'flex', 
            alignItems: 'center' 
          }}>
            <CodeIcon sx={{ mr: 1 }} />
            VibeCoder Sandbox
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleRunCode}
            sx={{ 
              mr: 1,
              background: 'linear-gradient(90deg, #3B82F6, #2563eb)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(90deg, #2563eb, #1D4ED8)',
              }
            }}
          >
            Run
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveActiveFile}
            sx={{ 
              mr: 1,
              borderColor: alpha('#fff', 0.3),
              color: alpha('#fff', 0.9),
              '&:hover': {
                borderColor: alpha('#fff', 0.5),
                backgroundColor: alpha('#fff', 0.05)
              }
            }}
          >
            Save
          </Button>
          
          <SaveToProjectButton
            onSave={handleSaveToProject}
            buttonText="Save to Project"
            tooltipText="Save all code files to your projects"
            dialogTitle="Save Code to Project"
            saveButtonText="Save Code"
          />
          
          <Tooltip title="Reset Workspace">
            <IconButton 
              onClick={handleClearWorkspace}
              sx={{ color: alpha('#fff', 0.7), mr: 1 }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Share">
            <IconButton sx={{ color: alpha('#fff', 0.7), mr: 1 }}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Settings">
            <IconButton sx={{ color: alpha('#fff', 0.7) }}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </SandboxHeader>
      
      <Grid container sx={{ flexGrow: 1 }}>
        {/* File Explorer */}
        <Grid item xs={2} sx={{ height: '100%' }}>
          <FileExplorer elevation={0}>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${alpha('#fff', 0.1)}`
            }}>
              <Typography variant="subtitle2" sx={{ 
                color: alpha('#fff', 0.9),
                fontWeight: 600
              }}>
                FILES
              </Typography>
              
              <Box>
                <IconButton 
                  size="small" 
                  onClick={() => handleCreateFolder()}
                  sx={{ 
                    mr: 1,
                    color: alpha('#fff', 0.7),
                    '&:hover': { color: theme.palette.primary.main }
                  }}
                >
                  <CreateNewFolderIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={(e) => setAddFileMenuAnchor(e.currentTarget)}
                  sx={{ color: alpha('#fff', 0.7) }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            <List sx={{ p: 1 }}>
              {renderFileTree(files)}
            </List>
            <FileAddMenu />
          </FileExplorer>
        </Grid>
        
        {/* Editor and Preview */}
        <Grid item xs={10} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* File Tabs */}
          <FileTabs
            value={activeFileId}
            onChange={(e, newValue) => setActiveFileId(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: `1px solid ${alpha('#000', 0.3)}` }}
          >
            {getAllFilesFlat(files).map((file) => (
              <FileTab
                key={file.id}
                label={<FileTabLabel file={file} />}
                value={file.id}
              />
            ))}
          </FileTabs>
          
          {/* Editor and Preview Container */}
          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
            {/* Code Editor */}
            <Box sx={{ width: '50%', height: '100%', borderRight: `1px solid ${alpha('#000', 0.3)}` }}>
          <Editor
                height="100%"
                defaultLanguage={getLanguageForFile(activeFile?.name || '')}
                language={getLanguageForFile(activeFile?.name || '')}
                value={activeFile?.value || ''}
            onChange={handleEditorChange}
            theme="vs-dark"
                options={getMonacoOptions(activeFile || {})}
                key={activeFileId}
              />
            </Box>
            
            {/* Preview */}
            <Box sx={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ 
                flexGrow: 1, 
                backgroundColor: 'white', 
                position: 'relative',
                overflow: 'hidden'
              }}>
          <iframe
                  ref={iframeRef}
            title="preview"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    border: 'none',
                    backgroundColor: 'white'
                  }}
                  sandbox="allow-scripts allow-modals allow-same-origin"
                />
                
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: '8px', 
                    right: '8px', 
                    zIndex: 10 
                  }}
                >
                  <Tooltip title="Refresh">
                    <IconButton 
                      size="small" 
                      onClick={handleRunCode}
                      sx={{ 
                        backgroundColor: alpha('#000', 0.1), 
                        '&:hover': { backgroundColor: alpha('#000', 0.2) } 
                      }}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {/* Console Output */}
              <ConsoleContainer>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 1,
                  borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
                  pb: 0.5
                }}>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.7), display: 'flex', alignItems: 'center' }}>
                    <TerminalIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Console
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setConsoleOutput(['// Console cleared'])}
                    sx={{ color: alpha('#fff', 0.6) }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Box sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem' }}>
                  {consoleOutput.map((line, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        mb: 0.5,
                        color: line.startsWith('error:') 
                          ? theme.palette.error.main 
                          : line.startsWith('warn:')
                            ? theme.palette.warning.main
                            : alpha('#fff', 0.9)
                      }}
                    >
                      {line}
                    </Box>
                  ))}
                </Box>
              </ConsoleContainer>
            </Box>
          </Box>
      </Grid>
    </Grid>

      {/* Add this before the closing EditorContainer tag */}
      {!isChatOpen && (
        <Tooltip title="Open AI Assistant">
          <IconButton
            onClick={() => setIsChatOpen(true)}
            sx={{
              position: 'fixed',
              right: 20,
              bottom: 20,
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              width: 56,
              height: 56,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <ChatIcon />
          </IconButton>
        </Tooltip>
      )}

      {isChatOpen && (
        <ChatPanel>
          <ChatHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }}>
                <ChatIcon sx={{ color: theme.palette.primary.main }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                  AI Assistant
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
                  Ask me about your code
                </Typography>
              </Box>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => setIsChatOpen(false)}
              sx={{ 
                color: alpha('#fff', 0.7),
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.1),
                  color: '#fff'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </ChatHeader>
          
          <ChatMessages ref={messagesEndRef}>
            {messages.length === 0 && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4, 
                color: alpha('#fff', 0.5),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
                <ChatIcon sx={{ fontSize: 48, color: alpha('#fff', 0.2) }} />
                <Typography>
                  Start a conversation with the AI Assistant
                </Typography>
              </Box>
            )}
            {messages.map((msg, index) => (
              <Message key={index} isUser={msg.role === 'user'}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 1
                }}>
                  <Box sx={{ 
                    width: 28, 
                    height: 28, 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: msg.role === 'user' 
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha('#fff', 0.1),
                    color: msg.role === 'user'
                      ? theme.palette.primary.main
                      : '#fff'
                  }}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </Box>
                  <Typography variant="caption" sx={{ 
                    color: alpha('#fff', 0.7),
                    fontWeight: 500
                  }}>
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ 
                  color: 'white',
                  lineHeight: 1.6,
                  '& code': {
                    backgroundColor: alpha('#fff', 0.1),
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.85rem'
                  }
                }}>
                  {msg.content.split('```').map((part, i) => {
                    if (i % 2 === 0) {
                      return <span key={i}>{part}</span>;
                    } else {
                      const [lang, ...code] = part.split('\n');
                      return (
                        <CodeBlock key={i}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 1,
                            pb: 1,
                            borderBottom: `1px solid ${alpha('#fff', 0.1)}`
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CodeIcon sx={{ 
                                fontSize: 18, 
                                color: theme.palette.primary.main 
                              }} />
                              <Typography variant="caption" sx={{ 
                                color: alpha('#fff', 0.7),
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontWeight: 500
                              }}>
                                {lang || 'code'}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              startIcon={<ContentPasteIcon />}
                              onClick={() => handleInsertCode(code.join('\n'))}
                              sx={{ 
                                color: theme.palette.primary.main,
                                borderColor: alpha(theme.palette.primary.main, 0.5),
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                }
                              }}
                              variant="outlined"
                            >
                              Insert Code
                            </Button>
                          </Box>
                          <pre>
                            <code>{code.join('\n')}</code>
                          </pre>
                        </CodeBlock>
                      );
                    }
                  })}
                </Typography>
              </Message>
            ))}
            {isLoading && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                my: 2,
                position: 'relative'
              }}>
                <CircularProgress 
                  size={32}
                  sx={{
                    color: theme.palette.primary.main
                  }}
                />
              </Box>
            )}
          </ChatMessages>

          <ChatInput>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything about coding..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  backgroundColor: alpha('#fff', 0.05),
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: alpha('#fff', 0.1),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#fff', 0.2),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiOutlinedInput-input': {
                  '&::placeholder': {
                    color: alpha('#fff', 0.5),
                    opacity: 1
                  }
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              endIcon={<SendIcon />}
              sx={{
                height: 56,
                px: 3,
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '&.Mui-disabled': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                  color: alpha('#fff', 0.3),
                },
              }}
            >
              Send
            </Button>
          </ChatInput>
        </ChatPanel>
      )}

      {/* Add the save project dialog */}
      {renderSaveProjectDialog()}
    </EditorContainer>
  );
};

// Export the component
export default CodeEditor;