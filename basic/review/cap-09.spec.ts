import { test, expect } from '@playwright/test';

test('cap 09 failure 1', async () => {
  expect('cap 09').toBe('fixed 1');
});

