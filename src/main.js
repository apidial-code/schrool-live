import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { trpc, queryClient } from './lib/trpc';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(trpc.Provider, { client: trpc.client, queryClient: queryClient, children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(App, {}) }) }) }));
