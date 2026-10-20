import { test, expect } from '@playwright/test';

test('cap 07 failure 1', async () => {
  expect('cap 07').toBe('fixed 1');
});

