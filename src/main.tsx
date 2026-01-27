import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PostHogProvider } from 'posthog-js/react'

// Console Branding & Security Warning for Production
import './utils/console-branding'

const options = {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    session_recording: {
        recordCrossOriginIframes: false, // ไม่บันทึก iframe (ประหยัดโควต้า)
        sampleRate: 0.8, // บันทึกแค่ 80% ของ Session (ประหยัด 20%)
    }
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <PostHogProvider
            apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
            options={options}
        >
            <App />
        </PostHogProvider>
    </StrictMode>
);
