/**
 * Canvas Persistence Enhancement
 * 
 * This file contains functions to enhance the drawing application with
 * persistence features to prevent data loss on refresh or navigation.
 * 
 * To use this code:
 * 1. Add the state variable for restore notification
 * 2. Import the functions
 * 3. Add the notification component to your UI
 * 4. Call loadFromLocalStorage on component mount
 */

// Add this state to your component
// const [showRestoreNotification, setShowRestoreNotification] = useState(false);

/**
 * Saves the current canvas state to localStorage
 */
export const saveToLocalStorage = (canvasState) => {
  try {
    // Save full state
    localStorage.setItem('canvasData', JSON.stringify(canvasState));
    console.log('Canvas saved to localStorage');
    
    // If you have a canvas ref, save a thumbnail too
    if (canvasState.canvasRef && canvasState.canvasRef.current) {
      canvasState.canvasRef.current.exportImage('png')
        .then(dataURL => {
          localStorage.setItem('canvasThumb', dataURL);
        })
        .catch(err => {
          console.error('Failed to save thumbnail:', err);
        });
    }
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

/**
 * Loads canvas state from localStorage
 */
export const loadFromLocalStorage = (setterFunctions, setShowRestoreNotification) => {
  try {
    const savedData = localStorage.getItem('canvasData');
    if (!savedData) return false;
    
    const canvasData = JSON.parse(savedData);
    if (!canvasData) return false;
    
    // Update state with the restored data
    if (canvasData.shapes && setterFunctions.setShapes) 
      setterFunctions.setShapes(canvasData.shapes);
    
    if (canvasData.textContent && setterFunctions.setTextContent) 
      setterFunctions.setTextContent(canvasData.textContent);
    
    if (canvasData.imageElements && setterFunctions.setImageElements) 
      setterFunctions.setImageElements(canvasData.imageElements);
    
    if (canvasData.components && setterFunctions.setComponents) 
      setterFunctions.setComponents(canvasData.components);
    
    if (canvasData.canvasOptions) {
      if (canvasData.canvasOptions.width && setterFunctions.setCanvasWidth) 
        setterFunctions.setCanvasWidth(canvasData.canvasOptions.width);
      
      if (canvasData.canvasOptions.height && setterFunctions.setCanvasHeight) 
        setterFunctions.setCanvasHeight(canvasData.canvasOptions.height);
      
      if (canvasData.canvasOptions.backgroundColor && setterFunctions.setBackgroundColor) 
        setterFunctions.setBackgroundColor(canvasData.canvasOptions.backgroundColor);
    }
    
    if (canvasData.layers && setterFunctions.setLayers) 
      setterFunctions.setLayers(canvasData.layers);
    
    if (setterFunctions.setSaveStatus) {
      setterFunctions.setSaveStatus('Canvas restored from local backup');
      setTimeout(() => setterFunctions.setSaveStatus(''), 3000);
    }
    
    // Show notification
    if (setShowRestoreNotification) {
      setShowRestoreNotification(true);
      setTimeout(() => setShowRestoreNotification(false), 8000);
    }
    
    return true;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return false;
  }
};

/**
 * Clears saved canvas data from localStorage
 */
export const clearLocalStorage = () => {
  localStorage.removeItem('canvasData');
  localStorage.removeItem('canvasThumb');
  console.log('Canvas data cleared from localStorage');
};

/**
 * Sets up automatic saving before page unload
 */
export const setupBeforeUnloadHandler = (unsavedChanges, saveFunction) => {
  const handleBeforeUnload = (e) => {
    if (unsavedChanges) {
      // Save one last time
      saveFunction();
      
      const message = 'You have unsaved changes. Your work has been backed up locally, but you should save to project for permanent storage. Are you sure you want to leave?';
      e.returnValue = message;
      return message;
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Return cleanup function
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
};

/**
 * Restore notification component
 */
export const RestoreNotification = ({ onContinue, onStartNew }) => {
  const thumbnailUrl = localStorage.getItem('canvasThumb');
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 9999
      }}
    >
      {thumbnailUrl && (
        <img 
          src={thumbnailUrl} 
          alt="Saved canvas"
          style={{ width: '60px', height: '40px', objectFit: 'cover' }}
        />
      )}
      <div>
        <div style={{ marginBottom: '8px' }}>Canvas restored from local backup</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={onContinue}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Continue Editing
          </button>
          <button 
            onClick={onStartNew}
            style={{
              backgroundColor: 'white',
              color: '#1976d2',
              border: '1px solid #1976d2',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Start New
          </button>
        </div>
      </div>
    </div>
  );
}; 