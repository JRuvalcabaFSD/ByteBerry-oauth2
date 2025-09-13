jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('env.ts', () => {
  it('llama a dotenv.config una vez al importarse', async () => {
    const dotenv = await import('dotenv');
    await import('../../src/config/config');

    expect(dotenv.config).toHaveBeenCalledTimes(1);
  });
});
