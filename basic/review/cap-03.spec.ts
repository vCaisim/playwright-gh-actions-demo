import { test, expect } from '@playwright/test';

test('cap 03 failure 1', async () => {
  expect('cap 03').toBe('fixed 1');
});

