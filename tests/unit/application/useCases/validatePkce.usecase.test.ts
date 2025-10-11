import { ValidatorPkceChallengeUseCase } from '@/application';
import { PkceValidatorService } from '@/infrastructure';
import { ILogger, IPkceValidator } from '@/interfaces';
import { BadRequestError } from '@/shared';

describe('ValidatePkceUseCase', () => {
  let mockLogger: jest.Mocked<ILogger>;
  let validator: IPkceValidator;
  let useCase: ValidatorPkceChallengeUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      child: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
    };

    validator = new PkceValidatorService(mockLogger);
    useCase = new ValidatorPkceChallengeUseCase(validator, mockLogger);
  });

  it('should throw error if verifier length < 43', async () => {
    await expect(async () => await useCase.execute('abc', 'challenge')).rejects.toThrow(BadRequestError);
  });
  it('should throw error if verifier length > 128', async () => {
    const longVerifier = 'a'.repeat(129);

    await expect(() => useCase.execute(longVerifier, 'challenge')).rejects.toThrow(BadRequestError);
  });
  it('throws BadRequestError if validateChallenge => false', async () => {
    jest.spyOn(validator, 'validateChallenge').mockResolvedValue(false);

    await expect(useCase.execute('v'.repeat(60), 'c'.repeat(43))).rejects.toThrow(BadRequestError);
    expect(mockLogger.info).not.toHaveBeenCalledWith('PKCE validation succeeded');
  });
  it('should generate a PKCE with the correct values', async () => {
    const codeVerifier = 'GCHJOlWkDxfsf-JsCS9CG1B1gu7egV6p4D62mQScQbZzv0atWvZco-4OHppsTrTj';
    const codeChallenge = 'h8kwCq1OxT5W-VpGwrWR1NLeAmw3fyFyVRfCC2VWdXk';

    await useCase.execute(codeVerifier, codeChallenge);

    expect(mockLogger.info).toHaveBeenCalledWith('PKCE validation succeeded', expect.any(Object));
  });
  it('debería devolver un error cuando el codeVerify tiene símbolos no permitidos', async () => {
    const codeVerifier = '#'.repeat(43);
    const codeChallenge = 'h8kwCq1OxT5W-VpGwrWR1NLeAmw3fyFyVRfCC2VWdXk';

    await expect(useCase.execute(codeVerifier, codeChallenge)).rejects.toThrow(BadRequestError);
  });
  it('debería devolver un error cuando el codeChallenge tiene símbolos no permitidos o una longitud diferente a 43', async () => {
    const codeVerifier = 'a'.repeat(60);
    let codeChallenge = 'a'.repeat(50);

    await expect(useCase.execute(codeVerifier, codeChallenge)).rejects.toThrow(BadRequestError);

    codeChallenge = '#'.repeat(43);
    await expect(useCase.execute(codeVerifier, codeChallenge)).rejects.toThrow(BadRequestError);
  });
});
