import { test, expect } from '@playwright/test';

test('cap 04 failure 1', async () => {
  expect('cap 04').toBe('fixed 1');
});

