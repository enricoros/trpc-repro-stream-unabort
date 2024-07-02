/**
 * This is the client-side code that uses the inferred types from the server
 */
import {
  createTRPCClient,
  splitLink,
  unstable_httpBatchStreamLink,
  unstable_httpSubscriptionLink,
} from '@trpc/client';
/**
 * We only import the `AppRouter` type from the server - this is not available at runtime
 */
import type { AppRouter } from '../server/index.js';

// Initialize the tRPC client
const trpc = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: unstable_httpSubscriptionLink({
        url: 'http://localhost:3000',
      }),
      false: unstable_httpBatchStreamLink({
        url: 'http://localhost:3000',
      }),
    }),
  ],
});

// Call procedure functions

// 💡 Tip, try to:
// - hover any types below to see the inferred types
// - Cmd/Ctrl+click on any function to jump to the definition
// - Rename any variable and see it reflected across both frontend and backend

const users = await trpc.user.list.query();
//    ^?
console.log('Users:', users);

const createdUser = await trpc.user.create.mutate({ name: 'sachinraja' });
//    ^?
console.log('Created user:', createdUser);

const user = await trpc.user.byId.query('1');
//    ^?
console.log('User 1:', user);

const ac = new AbortController();

const iterable = await trpc.examples.iterable.query(undefined, { signal: ac.signal });

// schedule an abort in 2 seconds
setTimeout(() => {
  console.log('Aborting!');
  ac.abort();
}, 2000);

for await (const i of iterable) {
  console.log('Iterable:', i, ac.signal.aborted ? '(SHALL HAVE BEEN ABORTED)' : '');
}
