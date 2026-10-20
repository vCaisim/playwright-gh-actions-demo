import { test, expect } from '@playwright/test';

test('cap 11 failure 1', async () => {
  expect('cap 11').toBe('fixed 1');
});

