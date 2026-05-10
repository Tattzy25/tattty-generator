import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-center"
      toastOptions={{
        classNames: {
          error: 'bg-red-500 text-white font-bold tracking-widest uppercase border-none rounded-xl',
          success: 'bg-green-500 text-white font-bold tracking-widest uppercase border-none rounded-xl',
          warning: 'bg-yellow-500 text-white font-bold tracking-widest uppercase border-none rounded-xl',
          info: 'bg-blue-500 text-white font-bold tracking-widest uppercase border-none rounded-xl',
        },
      }}
    />
  </StrictMode>,
);
