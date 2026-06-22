import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeClientCode } from '@aws-blocks/blocks/scripts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const foundation = resolve(__dirname, '../aws-blocks/index.ts');
const client = resolve(__dirname, '../aws-blocks/client.js');

await writeClientCode(foundation, client);
console.log('Wrote', client);
