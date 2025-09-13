import { randomUUID } from 'crypto';

import { Uuid } from '@/interfaces';

export class NativeUuid implements Uuid {
  v4(): string {
    return randomUUID();
  }
}
