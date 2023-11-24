import { app, HttpRequest as AzureHttpRequest } from '@azure/functions';
import { AnyRouter } from '@trpc/server';
import { AzureFuncOptions, azureFuncRequestHandler } from './adapter';

export function attachTRPCwithAzureFunction<TRouter extends AnyRouter>(
  option: AzureFuncOptions<TRouter, AzureHttpRequest>
) {
  return attachTRPCwithAzureFunctionBase({
    httpFunction: app.http,
    ...option,
  });
}

export type AttachTRPCwithAzureFunctionBaseOption<TRouter extends AnyRouter> = {
  httpFunction: typeof app.http;
} & AzureFuncOptions<TRouter, AzureHttpRequest>;

export function attachTRPCwithAzureFunctionBase<TRouter extends AnyRouter>({
  httpFunction,
  router,
  createContext,
}: AttachTRPCwithAzureFunctionBaseOption<TRouter>) {
  httpFunction('trpc', {
    authLevel: 'anonymous',
    route: 'trpc/{x:regex(^[^\\/]+$)}',
    methods: ['GET', 'POST'],
    handler: azureFuncRequestHandler({
      router,
      createContext,
    }),
  });
  return router;
}
