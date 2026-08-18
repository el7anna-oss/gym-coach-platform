import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'xxoc8idr', // Your project ID from Sanity setup
  dataset: 'production',
  apiVersion: '2026-08-16',
  useCdn: true,
});