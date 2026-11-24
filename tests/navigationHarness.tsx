import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import ProtectedLesson from '../src/pages/ProtectedLesson.tsx';
import {trpc, queryClient} from '../src/lib/trpc';
export {act, queryClient, focusManager, onlineManager};
export function mount(element: HTMLElement, fetcher: typeof fetch) {
 const client=trpc.createClient({links:[httpBatchLink({url:'http://localhost/api/trpc',transformer:superjson,fetch:fetcher})]});
 const root=createRoot(element);
 root.render(<trpc.Provider client={client} queryClient={queryClient}><QueryClientProvider client={queryClient}><ProtectedLesson/></QueryClientProvider></trpc.Provider>);
 return root;
}
