import { test, expect } from '@playwright/test';

test('cap 00 failure 1', async () => {
  expect('cap 00').toBe('fixed 1');
});

test('cap 00 failure 2', async () => {
  expect('cap 00').toBe('fixed 2');
});

test('cap 00 failure 3', async () => {
  expect('cap 00').toBe('fixed 3');
});

test('cap 00 failure 4', async () => {
  expect('cap 00').toBe('fixed 4');
});

test('cap 00 failure 5', async () => {
  expect('cap 00').toBe('fixed 5');
});

test('cap 00 failure 6', async () => {
  expect('cap 00').toBe('fixed 6');
});

test('cap 00 failure 7', async () => {
  expect('cap 00').toBe('fixed 7');
});

