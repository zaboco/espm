import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { App } from '../src/App';

const test = suite('App');

test('renders the App', () => {
  render(<App />);
  assert.equal(screen.getByRole('heading').textContent, 'React App');
});

test.run();
