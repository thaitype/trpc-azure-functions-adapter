# tRPC Adapter for Azure Functions v4

[![CI](https://github.com/thaitype/trpc-azure-functions-adapter/actions/workflows/main.yml/badge.svg)](https://github.com/thaitype/trpc-azure-functions-adapter/actions/workflows/main.yml)

> In Development process, done for Proof of concept considering adding feature for production use

This project provides an adapter for integrating tRPC (TypeScript RPC) with Azure Functions v4. The adapter simplifies the process of setting up type-safe and efficient APIs using TypeScript and tRPC within the Azure Functions environment.

## Installation

```bash
npm install trpc-azure-functions-adapter
```

## Usage

### 1. Create a `router.ts` file

```tsx
// filename: `src/router.ts`

import { AzureFuncContextOption } from 'trpc-azure-functions-adapter';
import { inferAsyncReturnType, initTRPC } from '@trpc/server';

export function createContext({ context, request }: AzureFuncContextOption) {
  return {
    context,
    request,
  };
}

type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

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

### 2. Create an Azure Functions entry file, e.g., `trpc.ts`

```tsx
// filename: `src/functions/trpc.ts`

import { azureFunctionsRequestHandler } from 'trpc-azure-functions-adapter';
import { appRouter, createContext } from '../router';

azureFunctionsRequestHandler({
  router: appRouter,
  createContext,
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