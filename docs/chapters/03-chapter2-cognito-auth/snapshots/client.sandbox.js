// ============================================================
// AUTO-GENERATED FILE — DO NOT EDIT
//
// Regenerate with: npm run blocks:generate-client
// ============================================================

import { fetchAuthSession } from 'aws-amplify/auth';
import { registerMiddleware } from '@aws-blocks/blocks/client';
import outputs from '../amplify_outputs.json';

const BLOCKS_API_URL = outputs.custom?.blocks_api_url;
if (!BLOCKS_API_URL) {
  throw new Error('Blocks API URL not found in amplify_outputs.json. Did you deploy the backend?');
}

// Attach Cognito bearer token to every Blocks API call
registerMiddleware({
  async onRequest(req) {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) req.headers['Authorization'] = `Bearer ${token}`;
    return req;
  }
});

import { ApiNamespaceClient as __BLOCKS_ApiNamespaceClient__ } from '@aws-blocks/blocks/client';
import '@aws-blocks/bb-realtime/aws-middleware';

export const api = __BLOCKS_ApiNamespaceClient__('api', { url: BLOCKS_API_URL });

export const generateClient = (config) => ({
    api: __BLOCKS_ApiNamespaceClient__('api', config),
});