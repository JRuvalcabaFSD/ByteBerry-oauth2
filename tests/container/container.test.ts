import { SimpleContainer, TOKENS } from '@/container';

describe('SimpleContainer', () => {
  let container: SimpleContainer;

  beforeEach(() => {
    container = new SimpleContainer();
  });

  it('should resolve the registered instance (RegisterInstance)', () => {
    const TestInstance = { a: 1 };

    container.registerInstance(TOKENS.Config, TestInstance);

    expect(container.resolve<typeof TestInstance>(TOKENS.Config)).toBe(TestInstance);
  });
  it('should create a new instance with register (factory/transient)', () => {
    type TestInterface = { v4: () => string };

    container.register(TOKENS.Clock, () => ({ v4: () => 'x' + Math.random() }));
    const a = container.resolve<TestInterface>(TOKENS.Clock);
    const b = container.resolve<TestInterface>(TOKENS.Clock);

    expect(a).not.toBe(b);
  });
  it('should maintain a single instance with registerSingleton', () => {
    class TestSingleton {
      public name = 'test unique ';
    }
    container.registerSingleton(Symbol.for('TestSingleton'), () => new TestSingleton());
    const a = container.resolve<TestSingleton>(Symbol.for('TestSingleton'));
    const b = container.resolve<TestSingleton>(Symbol.for('TestSingleton'));

    expect(a).toBe(b);
    expect(a.name).toBe(b.name);
  });
  it('should throw an error if the token does not exist', () => {
    expect(() => container.resolve(Symbol.for('no-exists'))).toThrow(/not registered/i);
  });
});
