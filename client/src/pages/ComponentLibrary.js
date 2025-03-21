import { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Chip,
  alpha,
  useTheme,
  Paper,
  Divider,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Code as CodeIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ComponentLibrary = () => {
  const theme = useTheme();
  const [selectedFramework, setSelectedFramework] = useState('mui');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCode, setShowCode] = useState({});

  const frameworks = [
    { id: 'mui', name: 'Material-UI' },
    { id: 'bootstrap', name: 'Bootstrap' },
    { id: 'tailwind', name: 'Tailwind CSS' }
  ];

  const categories = [
    { id: 'all', name: 'All Components' },
    { id: 'buttons', name: 'Buttons' },
    { id: 'inputs', name: 'Form Controls' },
    { id: 'layout', name: 'Layout' },
    { id: 'navigation', name: 'Navigation' },
    { id: 'feedback', name: 'Feedback' },
    { id: 'data', name: 'Data Display' }
  ];

  const components = {
    mui: [
      // Buttons
      {
        id: 'button-contained',
        category: 'buttons',
        title: 'Contained Button',
        description: 'High-emphasis button with background color',
        component: <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary">Primary</Button>
          <Button variant="contained" color="secondary">Secondary</Button>
          <Button variant="contained" color="error">Error</Button>
          <Button variant="contained" color="warning">Warning</Button>
          <Button variant="contained" color="info">Info</Button>
          <Button variant="contained" color="success">Success</Button>
        </Box>,
        code: `<Button variant="contained" color="primary">Primary</Button>
<Button variant="contained" color="secondary">Secondary</Button>
<Button variant="contained" color="error">Error</Button>
<Button variant="contained" color="warning">Warning</Button>
<Button variant="contained" color="info">Info</Button>
<Button variant="contained" color="success">Success</Button>`,
      },
      {
        id: 'button-outlined',
        category: 'buttons',
        title: 'Outlined Button',
        description: 'Medium-emphasis button with border',
        component: <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" color="primary">Primary</Button>
          <Button variant="outlined" color="secondary">Secondary</Button>
          <Button variant="outlined" color="error">Error</Button>
          <Button variant="outlined" color="warning">Warning</Button>
          <Button variant="outlined" color="info">Info</Button>
          <Button variant="outlined" color="success">Success</Button>
        </Box>,
        code: `<Button variant="outlined" color="primary">Primary</Button>
<Button variant="outlined" color="secondary">Secondary</Button>
<Button variant="outlined" color="error">Error</Button>
<Button variant="outlined" color="warning">Warning</Button>
<Button variant="outlined" color="info">Info</Button>
<Button variant="outlined" color="success">Success</Button>`,
      },
      {
        id: 'button-text',
        category: 'buttons',
        title: 'Text Button',
        description: 'Low-emphasis button with no background or border',
        component: <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="primary">Primary</Button>
          <Button color="secondary">Secondary</Button>
          <Button color="error">Error</Button>
          <Button color="warning">Warning</Button>
          <Button color="info">Info</Button>
          <Button color="success">Success</Button>
        </Box>,
        code: `<Button color="primary">Primary</Button>
<Button color="secondary">Secondary</Button>
<Button color="error">Error</Button>
<Button color="warning">Warning</Button>
<Button color="info">Info</Button>
<Button color="success">Success</Button>`,
      },
      // Form Controls
      {
        id: 'text-field-variants',
        category: 'inputs',
        title: 'Text Field Variants',
        description: 'Different styles of text input fields',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Outlined" variant="outlined" />
          <TextField label="Filled" variant="filled" />
          <TextField label="Standard" variant="standard" />
          <TextField label="With Helper Text" helperText="Some helper text" />
          <TextField label="Error" error helperText="Error message" />
          <TextField label="Disabled" disabled />
          <TextField label="Password" type="password" />
          <TextField label="Multiline" multiline rows={4} />
        </Box>,
        code: `<TextField label="Outlined" variant="outlined" />
<TextField label="Filled" variant="filled" />
<TextField label="Standard" variant="standard" />
<TextField label="With Helper Text" helperText="Some helper text" />
<TextField label="Error" error helperText="Error message" />
<TextField label="Disabled" disabled />
<TextField label="Password" type="password" />
<TextField label="Multiline" multiline rows={4} />`,
      },
      {
        id: 'select-variants',
        category: 'inputs',
        title: 'Select Variants',
        description: 'Different styles of select dropdowns',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Outlined</InputLabel>
            <Select label="Outlined" value="">
              <MenuItem value={10}>Option 1</MenuItem>
              <MenuItem value={20}>Option 2</MenuItem>
              <MenuItem value={30}>Option 3</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth variant="filled">
            <InputLabel>Filled</InputLabel>
            <Select label="Filled" value="">
              <MenuItem value={10}>Option 1</MenuItem>
              <MenuItem value={20}>Option 2</MenuItem>
              <MenuItem value={30}>Option 3</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth variant="standard">
            <InputLabel>Standard</InputLabel>
            <Select label="Standard" value="">
              <MenuItem value={10}>Option 1</MenuItem>
              <MenuItem value={20}>Option 2</MenuItem>
              <MenuItem value={30}>Option 3</MenuItem>
            </Select>
          </FormControl>
        </Box>,
        code: `<FormControl fullWidth>
  <InputLabel>Outlined</InputLabel>
  <Select label="Outlined" value="">
    <MenuItem value={10}>Option 1</MenuItem>
    <MenuItem value={20}>Option 2</MenuItem>
    <MenuItem value={30}>Option 3</MenuItem>
  </Select>
</FormControl>

<FormControl fullWidth variant="filled">
  <InputLabel>Filled</InputLabel>
  <Select label="Filled" value="">
    <MenuItem value={10}>Option 1</MenuItem>
    <MenuItem value={20}>Option 2</MenuItem>
    <MenuItem value={30}>Option 3</MenuItem>
  </Select>
</FormControl>

<FormControl fullWidth variant="standard">
  <InputLabel>Standard</InputLabel>
  <Select label="Standard" value="">
    <MenuItem value={10}>Option 1</MenuItem>
    <MenuItem value={20}>Option 2</MenuItem>
    <MenuItem value={30}>Option 3</MenuItem>
  </Select>
</FormControl>`,
      },
      // Layout Components
      {
        id: 'card-variants',
        category: 'layout',
        title: 'Card Variants',
        description: 'Different styles of cards for content organization',
        component: <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Card sx={{ maxWidth: 275, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                Basic Card
              </Typography>
              <Typography variant="body2">
                Simple card with just content
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ maxWidth: 275, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                Card with Actions
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Card with action buttons
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small">Action 1</Button>
                <Button size="small">Action 2</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>,
        code: `<Card sx={{ maxWidth: 275 }}>
  <CardContent>
    <Typography variant="h5" component="div" gutterBottom>
      Basic Card
    </Typography>
    <Typography variant="body2">
      Simple card with just content
    </Typography>
  </CardContent>
</Card>

<Card sx={{ maxWidth: 275 }}>
  <CardContent>
    <Typography variant="h5" component="div" gutterBottom>
      Card with Actions
    </Typography>
    <Typography variant="body2" sx={{ mb: 2 }}>
      Card with action buttons
    </Typography>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button size="small">Action 1</Button>
      <Button size="small">Action 2</Button>
    </Box>
  </CardContent>
</Card>`,
      },
      // Feedback Components
      {
        id: 'alert-variants',
        category: 'feedback',
        title: 'Alert Variants',
        description: 'Different styles of alert messages',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="error">This is an error alert — check it out!</Alert>
          <Alert severity="warning">This is a warning alert — check it out!</Alert>
          <Alert severity="info">This is an info alert — check it out!</Alert>
          <Alert severity="success">This is a success alert — check it out!</Alert>
        </Box>,
        code: `<Alert severity="error">This is an error alert — check it out!</Alert>
<Alert severity="warning">This is a warning alert — check it out!</Alert>
<Alert severity="info">This is an info alert — check it out!</Alert>
<Alert severity="success">This is a success alert — check it out!</Alert>`,
      },
      // Navigation Components
      {
        id: 'tabs-basic',
        category: 'navigation',
        title: 'Tabs',
        description: 'Basic tabs for navigation',
        component: <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
          <Tabs value={0}>
            <Tab label="Item One" />
            <Tab label="Item Two" />
            <Tab label="Item Three" />
          </Tabs>
        </Box>,
        code: `<Tabs value={0}>
  <Tab label="Item One" />
  <Tab label="Item Two" />
  <Tab label="Item Three" />
</Tabs>`,
      },
      // Data Display
      {
        id: 'chip-variants',
        category: 'data',
        title: 'Chip Variants',
        description: 'Different styles of chips for displaying information',
        component: <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Basic" />
          <Chip label="Disabled" disabled />
          <Chip label="Clickable" onClick={() => {}} />
          <Chip label="Deletable" onDelete={() => {}} />
          <Chip label="With Icon" icon={<CodeIcon />} />
          <Chip label="Primary" color="primary" />
          <Chip label="Success" color="success" />
          <Chip label="Error" color="error" />
        </Box>,
        code: `<Chip label="Basic" />
<Chip label="Disabled" disabled />
<Chip label="Clickable" onClick={() => {}} />
<Chip label="Deletable" onDelete={() => {}} />
<Chip label="With Icon" icon={<CodeIcon />} />
<Chip label="Primary" color="primary" />
<Chip label="Success" color="success" />
<Chip label="Error" color="error" />`,
      }
    ],
    bootstrap: [
      // Bootstrap Buttons
      {
        id: 'bs-buttons',
        category: 'buttons',
        title: 'Bootstrap Buttons',
        description: 'Various button styles in Bootstrap',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-success">Success</button>
            <button className="btn btn-danger">Danger</button>
            <button className="btn btn-warning">Warning</button>
            <button className="btn btn-info">Info</button>
            <button className="btn btn-light">Light</button>
            <button className="btn btn-dark">Dark</button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <button className="btn btn-outline-primary">Primary</button>
            <button className="btn btn-outline-secondary">Secondary</button>
            <button className="btn btn-outline-success">Success</button>
            <button className="btn btn-outline-danger">Danger</button>
            <button className="btn btn-outline-warning">Warning</button>
            <button className="btn btn-outline-info">Info</button>
            <button className="btn btn-outline-light">Light</button>
            <button className="btn btn-outline-dark">Dark</button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg">Large button</button>
            <button className="btn btn-secondary btn-lg">Large button</button>
            <button className="btn btn-primary btn-sm">Small button</button>
            <button className="btn btn-secondary btn-sm">Small button</button>
          </Box>
        </Box>,
        code: `<!-- Solid buttons -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-info">Info</button>
<button class="btn btn-light">Light</button>
<button class="btn btn-dark">Dark</button>

<!-- Outline buttons -->
<button class="btn btn-outline-primary">Primary</button>
<button class="btn btn-outline-secondary">Secondary</button>
<button class="btn btn-outline-success">Success</button>
<button class="btn btn-outline-danger">Danger</button>
<button class="btn btn-outline-warning">Warning</button>
<button class="btn btn-outline-info">Info</button>
<button class="btn btn-outline-light">Light</button>
<button class="btn btn-outline-dark">Dark</button>

<!-- Button sizes -->
<button class="btn btn-primary btn-lg">Large button</button>
<button class="btn btn-secondary btn-lg">Large button</button>
<button class="btn btn-primary btn-sm">Small button</button>
<button class="btn btn-secondary btn-sm">Small button</button>`,
      },
      // Bootstrap Alerts
      {
        id: 'bs-alerts',
        category: 'feedback',
        title: 'Bootstrap Alerts',
        description: 'Contextual feedback messages',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="alert alert-primary" role="alert">
            A simple primary alert—check it out!
          </div>
          <div className="alert alert-secondary" role="alert">
            A simple secondary alert—check it out!
          </div>
          <div className="alert alert-success" role="alert">
            A simple success alert—check it out!
          </div>
          <div className="alert alert-danger" role="alert">
            A simple danger alert—check it out!
          </div>
          <div className="alert alert-warning" role="alert">
            A simple warning alert—check it out!
          </div>
          <div className="alert alert-info" role="alert">
            A simple info alert—check it out!
          </div>
        </Box>,
        code: `<div class="alert alert-primary" role="alert">
  A simple primary alert—check it out!
</div>
<div class="alert alert-secondary" role="alert">
  A simple secondary alert—check it out!
</div>
<div class="alert alert-success" role="alert">
  A simple success alert—check it out!
</div>
<div class="alert alert-danger" role="alert">
  A simple danger alert—check it out!
</div>
<div class="alert alert-warning" role="alert">
  A simple warning alert—check it out!
</div>
<div class="alert alert-info" role="alert">
  A simple info alert—check it out!
</div>`,
      },
      // Bootstrap Cards
      {
        id: 'bs-cards',
        category: 'layout',
        title: 'Bootstrap Cards',
        description: 'Flexible content containers',
        component: <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <div className="card" style={{ width: '18rem' }}>
            <div className="card-body">
              <h5 className="card-title">Card title</h5>
              <h6 className="card-subtitle mb-2 text-muted">Card subtitle</h6>
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
              <a href="#" className="card-link">Card link</a>
              <a href="#" className="card-link">Another link</a>
            </div>
          </div>
          <div className="card" style={{ width: '18rem' }}>
            <div className="card-header">
              Featured
            </div>
            <div className="card-body">
              <h5 className="card-title">Special title treatment</h5>
              <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
              <button className="btn btn-primary">Go somewhere</button>
            </div>
          </div>
        </Box>,
        code: `<div class="card" style="width: 18rem;">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <h6 class="card-subtitle mb-2 text-muted">Card subtitle</h6>
    <p class="card-text">Some quick example text to build on the card title...</p>
    <a href="#" class="card-link">Card link</a>
    <a href="#" class="card-link">Another link</a>
  </div>
</div>

<div class="card" style="width: 18rem;">
  <div class="card-header">
    Featured
  </div>
  <div class="card-body">
    <h5 class="card-title">Special title treatment</h5>
    <p class="card-text">With supporting text below...</p>
    <button class="btn btn-primary">Go somewhere</button>
  </div>
</div>`,
      },
      // Bootstrap Forms
      {
        id: 'bs-forms',
        category: 'inputs',
        title: 'Bootstrap Forms',
        description: 'Examples of form controls and layouts',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <form>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input type="email" className="form-control" placeholder="name@example.com" />
              <div className="form-text">We'll never share your email with anyone else.</div>
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">Example textarea</label>
              <textarea className="form-control" rows="3"></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">Example select</label>
              <select className="form-select">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
              </select>
            </div>
            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" id="exampleCheck1" />
              <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </Box>,
        code: `<form>
  <div class="mb-3">
    <label class="form-label">Email address</label>
    <input type="email" class="form-control" placeholder="name@example.com" />
    <div class="form-text">We'll never share your email with anyone else.</div>
  </div>
  <div class="mb-3">
    <label class="form-label">Password</label>
    <input type="password" class="form-control" />
  </div>
  <div class="mb-3">
    <label class="form-label">Example textarea</label>
    <textarea class="form-control" rows="3"></textarea>
  </div>
  <div class="mb-3">
    <label class="form-label">Example select</label>
    <select class="form-select">
      <option>1</option>
      <option>2</option>
      <option>3</option>
      <option>4</option>
      <option>5</option>
    </select>
  </div>
  <div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="exampleCheck1" />
    <label class="form-check-label" for="exampleCheck1">Check me out</label>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>`,
      },
      // Bootstrap Navigation
      {
        id: 'bs-nav',
        category: 'navigation',
        title: 'Bootstrap Navigation',
        description: 'Navigation components and patterns',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
              <a className="navbar-brand" href="#">Navbar</a>
              <div className="collapse navbar-collapse">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <a className="nav-link active" href="#">Home</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">Link</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link disabled" href="#">Disabled</a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a className="nav-link active" href="#">Active</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Link</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Link</a>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled" href="#">Disabled</a>
            </li>
          </ul>
        </Box>,
        code: `<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Link</a>
        </li>
        <li class="nav-item">
          <a class="nav-link disabled" href="#">Disabled</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

<!-- Tabs -->
<ul class="nav nav-tabs">
  <li class="nav-item">
    <a class="nav-link active" href="#">Active</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#">Link</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#">Link</a>
  </li>
  <li class="nav-item">
    <a class="nav-link disabled" href="#">Disabled</a>
  </li>
</ul>`,
      }
    ],
    tailwind: [
      // Tailwind Buttons
      {
        id: 'tw-buttons',
        category: 'buttons',
        title: 'Tailwind Buttons',
        description: 'Various button styles using Tailwind CSS',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Primary
            </button>
            <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Secondary
            </button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Success
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Danger
            </button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
              Outline
            </button>
            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full">
              Rounded
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">
              Disabled
            </button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl">
              Large
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-sm text-xs">
              Small
            </button>
          </Box>
        </Box>,
        code: `<!-- Solid buttons -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Primary
</button>
<button class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
  Secondary
</button>
<button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
  Success
</button>
<button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
  Danger
</button>

<!-- Button variants -->
<button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
  Outline
</button>
<button class="bg-blue-500 text-white font-bold py-2 px-4 rounded-full">
  Rounded
</button>
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">
  Disabled
</button>

<!-- Button sizes -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl">
  Large
</button>
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-sm text-xs">
  Small
</button>`,
      },
      // Tailwind Cards
      {
        id: 'tw-cards',
        category: 'layout',
        title: 'Tailwind Cards',
        description: 'Card components with Tailwind CSS',
        component: <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">The Coldest Sunset</div>
              <p className="text-gray-700 text-base">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla!
              </p>
            </div>
            <div className="px-6 pt-4 pb-2">
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#photography</span>
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#travel</span>
            </div>
          </div>

          <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">Card with Actions</div>
              <p className="text-gray-700 text-base mb-4">
                A card with action buttons below the content.
              </p>
              <div className="flex gap-2">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Action
                </button>
                <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Box>,
        code: `<!-- Basic card -->
<div class="max-w-sm rounded overflow-hidden shadow-lg bg-white">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">The Coldest Sunset</div>
    <p class="text-gray-700 text-base">
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla!
    </p>
  </div>
  <div class="px-6 pt-4 pb-2">
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#photography</span>
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#travel</span>
  </div>
</div>

<!-- Card with actions -->
<div class="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">Card with Actions</div>
    <p class="text-gray-700 text-base mb-4">
      A card with action buttons below the content.
    </p>
    <div class="flex gap-2">
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Action
      </button>
      <button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
        Cancel
      </button>
    </div>
  </div>
</div>`,
      },
      // Tailwind Forms
      {
        id: 'tw-forms',
        category: 'inputs',
        title: 'Tailwind Form Controls',
        description: 'Form controls styled with Tailwind CSS',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username
              </label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Username" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="email" placeholder="example@example.com" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" type="password" placeholder="******************" />
              <p className="text-red-500 text-xs italic">Please choose a password.</p>
            </div>
            <div className="flex items-center justify-between">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                Sign In
              </button>
              <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                Forgot Password?
              </a>
            </div>
          </form>
        </Box>,
        code: `<form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2">
      Username
    </label>
    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Username" />
  </div>
  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2">
      Email
    </label>
    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="email" placeholder="example@example.com" />
  </div>
  <div class="mb-6">
    <label class="block text-gray-700 text-sm font-bold mb-2">
      Password
    </label>
    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" type="password" placeholder="******************" />
    <p class="text-red-500 text-xs italic">Please choose a password.</p>
  </div>
  <div class="flex items-center justify-between">
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
      Sign In
    </button>
    <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
      Forgot Password?
    </a>
  </div>
</form>`,
      },
      // Tailwind Alerts
      {
        id: 'tw-alerts',
        category: 'feedback',
        title: 'Tailwind Alerts',
        description: 'Alert and notification components',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
            <p className="font-bold">Info</p>
            <p>Something important you should know.</p>
          </div>
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
            <p className="font-bold">Success</p>
            <p>Your action was completed successfully.</p>
          </div>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p className="font-bold">Warning</p>
            <p>Better check yourself, you're not looking too good.</p>
          </div>
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Error</p>
            <p>Something seriously bad happened.</p>
          </div>
        </Box>,
        code: `<div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
  <p class="font-bold">Info</p>
  <p>Something important you should know.</p>
</div>

<div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
  <p class="font-bold">Success</p>
  <p>Your action was completed successfully.</p>
</div>

<div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
  <p class="font-bold">Warning</p>
  <p>Better check yourself, you're not looking too good.</p>
</div>

<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
  <p class="font-bold">Error</p>
  <p>Something seriously bad happened.</p>
</div>`,
      }
    ]
  };

  const handleFrameworkChange = (framework) => {
    setSelectedFramework(framework);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const toggleCode = (componentId) => {
    setShowCode(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const filteredComponents = components[selectedFramework].filter(component => {
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    const matchesSearch = 
      component.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0F172A, #1E293B)',
      color: 'white',
      px: 3,
      pt: { xs: '84px', sm: '88px' }, // Account for navbar height
      pb: 6,
      position: 'relative'
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 800,
          mb: 2,
          background: 'linear-gradient(45deg, #3B82F6, #EC4899)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Component Library
        </Typography>
        <Typography variant="h6" sx={{ color: alpha('#fff', 0.7) }}>
          Explore and use pre-built components from popular frameworks
        </Typography>
      </Box>

      {/* Framework Selection */}
      <Paper sx={{ 
        mb: 3,
        background: alpha('#1E293B', 0.5),
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: `1px solid ${alpha('#fff', 0.1)}`,
        p: 2
      }}>
        <Grid container spacing={2}>
          {frameworks.map(framework => (
            <Grid item key={framework.id}>
              <Button 
                variant={selectedFramework === framework.id ? "contained" : "outlined"}
                onClick={() => handleFrameworkChange(framework.id)}
                sx={{
                  borderColor: alpha('#fff', 0.2),
                  color: selectedFramework === framework.id ? 'white' : alpha('#fff', 0.7),
                  backgroundColor: selectedFramework === framework.id ? '#3B82F6' : 'transparent',
                  '&:hover': {
                    borderColor: '#3B82F6',
                    backgroundColor: selectedFramework === framework.id ? '#2563EB' : alpha('#3B82F6', 0.1),
                  }
                }}
              >
                {framework.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Search and Categories */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 4,
        flexWrap: 'wrap'
      }}>
        <TextField
          placeholder="Search components..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: alpha('#fff', 0.5) }} />,
          }}
          sx={{
            flex: 1,
            minWidth: 300,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              backgroundColor: alpha('#1E293B', 0.5),
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              '& fieldset': {
                borderColor: alpha('#fff', 0.1),
              },
              '&:hover fieldset': {
                borderColor: alpha('#fff', 0.2),
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3B82F6',
              },
            },
          }}
        />
        
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {categories.map(category => (
            <Chip
              key={category.id}
              label={category.name}
              onClick={() => handleCategoryChange(category.id)}
              sx={{
                backgroundColor: selectedCategory === category.id ? '#3B82F6' : alpha('#1E293B', 0.5),
                color: 'white',
                border: `1px solid ${selectedCategory === category.id ? '#3B82F6' : alpha('#fff', 0.1)}`,
                '&:hover': {
                  backgroundColor: selectedCategory === category.id ? '#2563EB' : alpha('#1E293B', 0.8),
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Components Grid */}
      <Grid container spacing={3}>
        {filteredComponents.map((component) => (
          <Grid item xs={12} md={6} lg={4} key={component.id}>
            <Card sx={{ 
              height: '100%',
              background: alpha('#1E293B', 0.5),
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: `1px solid ${alpha('#fff', 0.1)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
                borderColor: alpha('#3B82F6', 0.5)
              }
            }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    {component.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
                    {component.description}
                  </Typography>
                </Box>

                <Box sx={{ 
                  p: 3, 
                  mb: 2,
                  backgroundColor: alpha('#0F172A', 0.5),
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {component.component}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<CodeIcon />}
                    onClick={() => toggleCode(component.id)}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: alpha('#fff', 0.2),
                      color: 'white',
                      '&:hover': {
                        borderColor: '#3B82F6',
                        backgroundColor: alpha('#3B82F6', 0.1),
                      }
                    }}
                  >
                    {showCode[component.id] ? 'Hide Code' : 'View Code'}
                  </Button>
                  <Tooltip title="Copy code">
                    <IconButton 
                      onClick={() => copyCode(component.code)}
                      size="small"
                      sx={{ 
                        color: alpha('#fff', 0.7),
                        '&:hover': {
                          color: '#3B82F6',
                          backgroundColor: alpha('#3B82F6', 0.1),
                        }
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                {showCode[component.id] && (
                  <Box sx={{ mt: 2 }}>
                    <SyntaxHighlighter
                      language="jsx"
                      style={atomDark}
                      customStyle={{
                        margin: 0,
                        borderRadius: 8,
                        maxHeight: 200,
                        overflow: 'auto'
                      }}
                    >
                      {component.code}
                    </SyntaxHighlighter>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ComponentLibrary;