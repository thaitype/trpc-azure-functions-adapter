import { TRPCError, inferRouterContext, AnyTRPCRouter} from '@trpc/server';

// import { HTTPHeaders, HTTPResponse, ResponseMetaFn } from '@trpc/server/dist/http/internals/types'; 
// import { OnErrorFunction } from '@trpc/server/dist/internals/types';
// import { HTTPRequest, resolveHTTPResponse } from '@trpc/server/http';
import type { HTTPBaseHandlerOptions } from '@trpc/server/http';

type TrpcRequest = Request;
type TrpcResponse = Response;

import {
  InvocationContext,
  HttpRequest as AzureHttpRequest,
  HttpResponseInit as AzureResponseInit,
  HttpResponse as AzureHttpResponse,
} from '@azure/functions';

export async function tRPCOutputToAzureFunctionsOutput(response: AzureHttpResponse): Promise<AzureResponseInit> {
  return {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.arrayBuffer(),
  };
}

export type CreateAzureFunctionsContextOptions = {
  context: InvocationContext;
  request: AzureHttpRequest;
};

export type AzureFunctionsCreateContextFn<TRouter extends AnyTRPCRouter> = ({
  context,
  request,
}: CreateAzureFunctionsContextOptions) => inferRouterContext<TRouter> | Promise<inferRouterContext<TRouter>>;



export type AzureFunctionsOptions<
  TRouter extends AnyTRPCRouter,
  TRequest
> = HTTPBaseHandlerOptions<TRouter, TRequest> & {
  createContext?: AzureFunctionsCreateContextFn<TRouter>;
};

// export type AzureFunctionsOptions<TRouter extends AnyRouter, TRequest> =
//   | {
//       router: TRouter;
//       batching?: {
//         enabled: boolean;
//       };
//       onError?: OnErrorFunction<TRouter, TRequest>;
//       responseMeta?: ResponseMetaFn<TRouter>;
//     } & (
//       | {
//           /**
//            * @link https://trpc.io/docs/context
//            **/
//           createContext: AzureFunctionsCreateContextFn<TRouter>;
//         }
//       | {
//           /**
//            * @link https://trpc.io/docs/context
//            **/
//           createContext?: AzureFunctionsCreateContextFn<TRouter>;
//         }
//     );

export async function azureFunctionsContextToHttpRequest(request: AzureHttpRequest): Promise<HTTPRequest> {
  const body = await request.text();
  const query = new URLSearchParams();
  console.log(`Converting Query 111`);
  for (const [key, value] of request.query.entries()) {
    if (typeof value !== 'undefined') {
      query.append(key, value);
      console.log(`Converting Query: ${key} $$$ ${value}!`);
    }
  }
  
  const headers: HTTPHeaders = {};
  for (const [key, value] of request.headers.entries()) {
    if (typeof value !== 'undefined') {
      headers[key] = value;
    }
  }

  return {
    method: request.method || 'get',
    query: request.query as any,
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

export function createAzureFunctionsHandler<TRouter extends AnyRouter>(
  opts: AzureFunctionsOptions<TRouter, AzureHttpRequest>
): RequestHandlerReturn {
  return async (request, context) => {
    const req = await azureFunctionsContextToHttpRequest(request);
    const path = urlToPath(request.url);
    console.log(`Request: ${request.url} ${req.method} ${path} (${req.query.entries().next().value})`);
    const createContext = async function _createContext(): Promise<inferRouterContext<TRouter>> {
      return await opts.createContext?.({ request, context });
    };

    const response = await resolveHTTPResponse({
      ...opts,
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

    return tRPCOutputToAzureFunctionsOutput(response);
  };
}

export type AzureFunctionsContextOption = {
  context: InvocationContext;
  request: AzureHttpRequest;
};
