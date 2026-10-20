import { test, expect } from '@playwright/test';

test('cap 06 failure 1', async () => {
  expect('cap 06').toBe('fixed 1');
});

