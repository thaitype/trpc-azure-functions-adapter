import { AnyRouter, TRPCError, inferRouterContext } from '@trpc/server';
import { HTTPHeaders, HTTPResponse, ResponseMetaFn } from '@trpc/server/dist/http/internals/types';
import { OnErrorFunction } from '@trpc/server/dist/internals/types';
import { HTTPRequest, resolveHTTPResponse } from '@trpc/server/http';
import {
  InvocationContext,
  HttpRequest as AzureHttpRequest,
  HttpResponseInit,
  HttpResponse as AzureHttpResponse,
} from '@azure/functions';

export function tRPCOutputToAzureFuncOutput(response: HTTPResponse): HttpResponseInit | AzureHttpResponse {
  return {
    body: response.body ?? undefined,
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      ...(response.headers ?? {}),
    },
  };
}

export type CreateAzureFuncContextOptions = {
  context: InvocationContext;
  request: AzureHttpRequest;
};

export type AzureFuncCreateContextFn<TRouter extends AnyRouter> = ({
  context,
  request,
}: CreateAzureFuncContextOptions) => inferRouterContext<TRouter> | Promise<inferRouterContext<TRouter>>;

export type AzureFuncOptions<TRouter extends AnyRouter, TRequest> =
  | {
      router: TRouter;
      batching?: {
        enabled: boolean;
      };
      onError?: OnErrorFunction<TRouter, TRequest>;
      responseMeta?: ResponseMetaFn<TRouter>;
    } & (
      | {
          /**
           * @link https://trpc.io/docs/context
           **/
          createContext: AzureFuncCreateContextFn<TRouter>;
        }
      | {
          /**
           * @link https://trpc.io/docs/context
           **/
          createContext?: AzureFuncCreateContextFn<TRouter>;
        }
    );

export async function azureFuncContextToHttpRequest(request: AzureHttpRequest): Promise<HTTPRequest> {
  const body = await request.text();
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(request.query ?? {})) {
    if (typeof value !== 'undefined') {
      query.append(key, value);
    }
  }

  const headers: HTTPHeaders = {};
  for (const [key, value] of Object.entries(request.headers ?? {})) {
    if (typeof value !== 'undefined') {
      headers[key] = value;
    }
  }

  return {
    method: request.method || 'get',
    query,
    headers,
    body,
  };
}

export function urlToPath(url: string): string {
  const parsedUrl = new URL(url);
  const pathParts = parsedUrl.pathname.split('/');
  const trpcPath = pathParts[pathParts.length - 1];

  if (trpcPath === undefined) {
    // should not happen if the function is setup correctly.
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Cannot convert Azure Http Request to TRPC Request.',
    });
  } else {
    return trpcPath;
  }
}

export type RequestHandlerReturn = (
  request: AzureHttpRequest,
  context: InvocationContext
) => Promise<HttpResponseInit | AzureHttpResponse>;

export function azureFuncRequestHandler<TRouter extends AnyRouter>(
  opts: AzureFuncOptions<TRouter, AzureHttpRequest>
): RequestHandlerReturn {
  return async (request, context) => {
    const req = await azureFuncContextToHttpRequest(request); //lambdaEventToHTTPRequest(event);  Note: event as APIGatewayEvent
    const path = urlToPath(request.url); // getPath(event); Note: event as APIGatewayEvent
    const createContext = async function _createContext(): Promise<inferRouterContext<TRouter>> {
      return await opts.createContext?.({ request, context });
    };

    const response = await resolveHTTPResponse({
      router: opts.router,
      batching: opts.batching,
      responseMeta: opts?.responseMeta,
      createContext,
      req: req,
      path: path,
      error: null,
      onError(o) {
        opts?.onError?.({
          ...o,
          req: request,
        });
      },
    });

    return tRPCOutputToAzureFuncOutput(response);
  };
}

export type AzureFuncContextOption = {
  context: InvocationContext;
  request: AzureHttpRequest;
};
