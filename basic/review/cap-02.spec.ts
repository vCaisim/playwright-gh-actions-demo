import { test, expect } from '@playwright/test';

test('cap 02 failure 1', async () => {
  expect('cap 02').toBe('fixed 1');
});

