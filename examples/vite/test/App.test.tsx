import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { suite } from 'uvu';
import { expect } from 'chai';
import { App } from '../src/App';

const test = suite('App');

test.before.each(cleanup);

test('it renders 0 initially', () => {
  render(<App />);
  expect(screen.getByRole('heading').textContent).to.equal('Current value 0');
});

test('it can increase the value', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Increment'));
  expect(screen.getByRole('heading').textContent).to.equal('Current value 1');
});

test.run();
