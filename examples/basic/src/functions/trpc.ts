import { attachTRPCwithAzureFunction } from 'trpc-azure-functions-adapter';
import { appRouter, createContext } from '../router';

attachTRPCwithAzureFunction({
  router: appRouter,
  createContext,
});
