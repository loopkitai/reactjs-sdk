// Jest setup file for React testing
import '@testing-library/jest-dom';

// Extend Jest matchers for better TypeScript support
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
    }
  }
}
