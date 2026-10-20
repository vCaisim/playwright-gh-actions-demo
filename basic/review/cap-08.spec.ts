import { test, expect } from '@playwright/test';

test('cap 08 failure 1', async () => {
  expect('cap 08').toBe('fixed 1');
});

