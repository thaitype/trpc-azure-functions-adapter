import { createAzureFunctionsHandler } from 'trpc-azure-functions-adapter';
import { appRouter, createContext } from './trpc';
import { app } from '@azure/functions';

app.http('trpc', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'trpc/{*proxy}',
  handler: createAzureFunctionsHandler({
    router: appRouter,
    createContext,
  }),
});