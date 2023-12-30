import { app, HttpRequest as AzureHttpRequest } from '@azure/functions';
import { AnyRouter } from '@trpc/server';
import { AzureFunctionsOptions, wrapAzureFunctionsRequestHandler } from './adapter';

/**
 * Use for Azure Functions v4+
 * @param option 
 * @returns 
 */
export function azureFunctionsRequestHandler<TRouter extends AnyRouter>(
  option: AzureFunctionsOptions<TRouter, AzureHttpRequest>
) {
  return azureFunctionsRequestHandlerBase({
    httpFunction: app.http,
    ...option,
  });
}

export type azureFunctionsRequestHandlerBaseOption<TRouter extends AnyRouter> = {
  httpFunction: typeof app.http;
} & AzureFunctionsOptions<TRouter, AzureHttpRequest>;

export function azureFunctionsRequestHandlerBase<TRouter extends AnyRouter>({
  httpFunction,
  router,
  createContext,
}: azureFunctionsRequestHandlerBaseOption<TRouter>) {
  httpFunction('trpc', {
    authLevel: 'anonymous',
    route: 'trpc/{x:regex(^[^\\/]+$)}',
    methods: ['GET', 'POST'],
    handler: wrapAzureFunctionsRequestHandler({
      router,
      createContext,
    }),
  });
  return router;
}
