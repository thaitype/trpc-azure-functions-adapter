import { azureFuncRequestHandler, AzureFuncContextOption } from 'trpc-azure-functions-adapter';
import { app } from '@azure/functions';
import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { z } from 'zod';

function createContext({ context, request }: AzureFuncContextOption) {
  return {
    context,
    request,
  };
}
type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  greet: publicProcedure.input(z.object({ name: z.string() })).query(({ input, ctx }) => {
    console.log(ctx.request.params);

    return `Greetings, ${input.name}.`;
  }),
});

export type AppRouter = typeof appRouter;

export const handler = azureFuncRequestHandler({
  router: appRouter,
  createContext,
});

app.http('trpc', {
  
  handler: azureFuncRequestHandler({
    router: appRouter,
    createContext,
  }),
});
