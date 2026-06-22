import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

export const backend = defineBackend({
  auth,
  data,
});

// Blocks integration — adds Building Blocks to your Amplify backend
import { initBlocks } from './blocks.js';
await initBlocks(backend);
