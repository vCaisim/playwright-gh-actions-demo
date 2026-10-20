import { test, expect } from '@playwright/test';

test('cap 05 failure 1', async () => {
  expect('cap 05').toBe('fixed 1');
});

