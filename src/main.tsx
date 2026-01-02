import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Console Branding & Security Warning for Production
import './utils/console-branding'

createRoot(document.getElementById("root")!).render(<App />);
