import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('index', () => {
  it('renders a "React app" heading', () => {
    render(<App />);
    expect(screen.getByRole('heading').textContent).toBe('React App');
  });
});
