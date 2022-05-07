import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { App } from '../src/App';

const test = suite('App');

test.before.each(cleanup);

test('it renders 0 initially', () => {
  render(<App />);
  assert.equal(screen.getByRole('heading').textContent, 'Current value 0');
});

test('it can increase the value', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Increment'));
  assert.equal(screen.getByRole('heading').textContent, 'Current value 1');
});

test.run();
