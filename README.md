# tRPC Adapter for Azure Functions v4

[![CI](https://github.com/thaitype/trpc-azure-functions-adapter/actions/workflows/main.yml/badge.svg)](https://github.com/thaitype/trpc-azure-functions-adapter/actions/workflows/main.yml) 
[![npm version](https://img.shields.io/npm/v/trpc-azure-functions-adapter)](https://www.npmjs.com/package/trpc-azure-functions-adapter) 
[![npm download](https://img.shields.io/npm/dt/trpc-azure-functions-adapter)](https://www.npmjs.com/package/trpc-azure-functions-adapter)

> Only Support tRPC 10

This project provides an adapter for integrating tRPC (TypeScript RPC) with Azure Functions v4. The adapter simplifies the process of setting up type-safe and efficient APIs using TypeScript and tRPC within the Azure Functions environment.

## Installation

```bash
npm install trpc-azure-functions-adapter
```

## Usage

### 1. Create a `trpc.ts` file

```tsx
// filename: `src/trpc.ts`

import { AzureFuncContextOption } from 'trpc-azure-functions-adapter';
import { inferAsyncReturnType, initTRPC } from '@trpc/server';

export function createContext({ context, request }: AzureFuncContextOption) {
  return {
    context,
    request,
  };
}

const t = initTRPC.context<typeof createContext>().create();

const publicProcedure = t.procedure;

export const appRouter = t.router({
  greet: publicProcedure
    .query(({ input, ctx }) => {
      console.log(ctx.request.params);

      return `Greetings, `;
    }),
});

export type AppRouter = typeof appRouter;
```

### 2. Create an Azure Functions entry file, e.g., `main.ts`

```tsx
// filename: `src/main.ts`

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
```

## License

This project is licensed under the MIT License

## Acknowledgments

- [Official tRPC Adatper for AWS Lambda](https://trpc.io/docs/server/adapters/aws-lambda)
- [Azure Function v3 Pull Request to tRPC Repository](https://github.com/trpc/trpc/pull/3452)

## Contributing

Contributions are welcome!

## Issues

If you encounter any issues or have questions, please open an issue on the [Issues](https://github.com/thaitype/trpc-azure-functions-adapter/issues) tab.

## Other Option:
- https://serverless-adapter.viniciusl.com.br/docs/main/adapters/azure/http-trigger-v4