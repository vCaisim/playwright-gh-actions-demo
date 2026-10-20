import { test, expect } from '@playwright/test';

test('cap 01 failure 1', async () => {
  expect('cap 01').toBe('fixed 1');
});

