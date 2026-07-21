import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
  'delete expired pilot requests',
  { hours: 24 },
  internal.pilotRequests.cleanupExpired,
  {},
);

export default crons;
