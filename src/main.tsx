import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root");

if (!rootElement) {
    console.error("Root element not found");
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Root element not found</div>';
} else {
    try {
        createRoot(rootElement).render(<App />);
    } catch (e) {
        console.error("Render crash:", e);
        rootElement.innerHTML = `<div style="color: red; padding: 20px;">
      <h1>Application Crashed</h1>
      <pre>${e instanceof Error ? e.message + "\n" + e.stack : JSON.stringify(e)}</pre>
    </div>`;
    }
}

// Global error handler for debugging production
window.addEventListener("error", (event) => {
    const errorDiv = document.createElement("div");
    errorDiv.style.position = "fixed";
    errorDiv.style.bottom = "0";
    errorDiv.style.left = "0";
    errorDiv.style.right = "0";
    errorDiv.style.backgroundColor = "rgba(255, 0, 0, 0.9)";
    errorDiv.style.color = "white";
    errorDiv.style.padding = "20px";
    errorDiv.style.zIndex = "9999";
    errorDiv.style.fontFamily = "monospace";
    errorDiv.style.whiteSpace = "pre-wrap";
    errorDiv.textContent = `Global Error: ${event.message}\n${event.filename}:${event.lineno}`;
    document.body.appendChild(errorDiv);
});

// Unhandled promise rejection handler
window.addEventListener("unhandledrejection", (event) => {
    const errorDiv = document.createElement("div");
    errorDiv.style.position = "fixed";
    errorDiv.style.top = "0";
    errorDiv.style.left = "0";
    errorDiv.style.right = "0";
    errorDiv.style.backgroundColor = "rgba(255, 165, 0, 0.9)";
    errorDiv.style.color = "black";
    errorDiv.style.padding = "20px";
    errorDiv.style.zIndex = "9999";
    errorDiv.style.fontFamily = "monospace";
    errorDiv.style.whiteSpace = "pre-wrap";
    errorDiv.textContent = `Unhandled Promise Rejection: ${event.reason}`;
    document.body.appendChild(errorDiv);
});
