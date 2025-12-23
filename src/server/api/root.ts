import { ensoRouter } from '@/server/api/routers/enso';
import { createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  enso: ensoRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
