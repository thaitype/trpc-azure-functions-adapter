import { AzureFuncContextOption } from 'trpc-azure-functions-adapter';
import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { z } from 'zod';

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
  greet: publicProcedure.input(z.object({ name: z.string() })).query(({ input, ctx }) => {
    console.log(ctx.request.params);

    return `Greetings, ${input.name}.`;
  }),
});

export type AppRouter = typeof appRouter;
