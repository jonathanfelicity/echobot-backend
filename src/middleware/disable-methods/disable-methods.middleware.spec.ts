import { DisableMethodsMiddleware } from './disable-methods.middleware';

describe('DisableMethodsMiddleware', () => {
  it('should be defined', () => {
    expect(new DisableMethodsMiddleware()).toBeDefined();
  });
});
