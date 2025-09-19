import { IUuid } from '@/interfaces';

/**
 * UUID service implementation
 * @export
 * @class UuidService
 * @implements {IUuid}
 */
export class UuidService implements IUuid {
  /**
   * Generate a new UUID v4
   * @return {*}  {string}
   * @memberof UuidService
   */
  generate(): string {
    return crypto.randomUUID();
  }
}
