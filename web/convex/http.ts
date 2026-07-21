import { httpRouter } from 'convex/server';
import { auth } from './auth';

const http = httpRouter();

// Mount Convex Auth HTTP actions under /api/auth/*
auth.addHttpRoutes(http);

export default http;
