import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import type { AppRouter } from './trpc';

const sleep = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const url = 'http://127.0.0.1:7071/api/trpc';

  const proxy = createTRPCProxyClient<AppRouter>({
    links: [loggerLink(), httpBatchLink({ url })],
  });

  await sleep();

  // const greet = await proxy.greet.query();
  const greet = await proxy.greet.query({ text: 'xxxx' });
  console.log('created post', greet);
  await sleep();



  console.log('👌 should be a clean exit if everything is working right');
}

main().catch(console.error);
