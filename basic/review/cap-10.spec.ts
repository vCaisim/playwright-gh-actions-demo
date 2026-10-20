import { test, expect } from '@playwright/test';

test('cap 10 failure 1', async () => {
  expect('cap 10').toBe('fixed 1');
});

