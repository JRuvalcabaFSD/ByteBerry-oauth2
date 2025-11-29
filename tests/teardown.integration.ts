/**
 * Global Teardown para Integration Tests
 */

import { closePrismaTestClient } from './helpers/prisma-test-client';

export default async function globalTeardown(): Promise<void> {
  console.log('\n🧹 Starting Integration Tests Teardown...\n');

  console.log('🔌 Closing Prisma connections...');
  await closePrismaTestClient();
  console.log('✅ Prisma connections closed');

  console.log('\n✨ Integration Tests Teardown Complete!\n');
}
