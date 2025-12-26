import { createHash } from 'crypto';

import { IHashService } from '@interfaces';

/**
 * Service implementation for hashing and verifying strings using the SHA-256 algorithm.
 *
 * This class provides methods to compute a SHA-256 hash of a given string and to verify
 * if a provided value matches a given SHA-256 hash. The hash is encoded using the
 * base64url format.
 *
 * @implements {IHashService}
 */

export class NodeHashService implements IHashService {
	public verifySha256(value: string, hash: string): boolean {
		const computed = createHash('sha256').update(value).digest('base64url');
		return computed === hash;
	}
}
