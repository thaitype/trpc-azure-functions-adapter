import { app, HttpRequest as AzureHttpRequest } from '@azure/functions';
import { AnyRouter } from '@trpc/server';
import { AzureFuncOptions, wrapAzureFuncRequestHandler } from './adapter';

export function azureFunctionsRequestHandler<TRouter extends AnyRouter>(
  option: AzureFuncOptions<TRouter, AzureHttpRequest>
) {
  return azureFunctionsRequestHandlerBase({
    httpFunction: app.http,
    ...option,
  });
}

export type AzureFunctionsRequestHandlerBaseOption<TRouter extends AnyRouter> = {
  httpFunction: typeof app.http;
} & AzureFuncOptions<TRouter, AzureHttpRequest>;

export function azureFunctionsRequestHandlerBase<TRouter extends AnyRouter>({
  httpFunction,
  router,
  createContext,
}: AzureFunctionsRequestHandlerBaseOption<TRouter>) {
  httpFunction('trpc', {
    authLevel: 'anonymous',
    route: 'trpc/{x:regex(^[^\\/]+$)}',
    methods: ['GET', 'POST'],
    handler: wrapAzureFuncRequestHandler({
      router,
      createContext,
    }),
  });
  return router;
}
