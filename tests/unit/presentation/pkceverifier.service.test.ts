import { PkceVerifierService } from '@/presentation';
import { CodeChallenge } from '@/domain';
import { IHashService, ILogger } from '@/interfaces';

describe('PkceVerifierService', () => {
  let service: PkceVerifierService;
  let mockHashService: jest.Mocked<IHashService>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockHashService = {
      sha256: jest.fn(),
    } as unknown as jest.Mocked<IHashService>;

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    service = new PkceVerifierService(mockHashService, mockLogger);
  });

  it('should return true when plain method and verifier matches', async () => {
    const challenge = CodeChallenge.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'plain');
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

    const result = await service.verify(challenge, verifier);

    expect(result).toBe(true);
    expect(mockHashService.sha256).not.toHaveBeenCalled();
  });

  it('should return false when plain method and verifier does not match', async () => {
    const challenge = CodeChallenge.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'plain');
    const verifier = 'wrong-verifier';

    const result = await service.verify(challenge, verifier);

    expect(result).toBe(false);
  });

  it('should return true when s256 method and hash matches', async () => {
    const expectedHash = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
    const challenge = CodeChallenge.create(expectedHash, 'S256');
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

    mockHashService.sha256.mockReturnValue(expectedHash);

    const result = await service.verify(challenge, verifier);

    expect(result).toBe(true);
    expect(mockHashService.sha256).toHaveBeenCalledWith(verifier);
  });

  it('should return false when s256 method and hash does not match', async () => {
    const challenge = CodeChallenge.create('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', 'S256');
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

    mockHashService.sha256.mockReturnValue('wrong-hash');

    const result = await service.verify(challenge, verifier);

    expect(result).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it('should-log-debug-info-when-verification-called', () => {
    const challenge = CodeChallenge.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'plain');
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

    service.verify(challenge, verifier);

    expect(mockLogger.debug).toHaveBeenCalled();
  });
});
