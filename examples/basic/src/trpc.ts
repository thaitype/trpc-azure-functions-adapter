import { AzureFunctionsContextOption } from 'trpc-azure-functions-adapter';
import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { z } from 'zod';

export function createContext({ context, request }: AzureFunctionsContextOption) {
  return {
    context,
    request,
    data: 'hello'
  };
}
type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;

export const appRouter = t.router({
  greet: publicProcedure
  // .input(z.object({
  //   text: z.string(),
  // }))
  .query(({  ctx }) => {
    
    // console.log(input.text);
    const input = { text: 'client' };

    return `Greetings, ${input.text} `;
  }),
});

export type AppRouter = typeof appRouter;



