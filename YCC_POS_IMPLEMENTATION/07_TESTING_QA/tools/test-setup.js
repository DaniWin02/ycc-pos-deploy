import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configuración global de Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  asyncWrapper: async (element, callback) => {
    await callback();
  },
});

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock de matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de scrollTo
window.scrollTo = jest.fn();

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock de fetch
global.fetch = jest.fn();

// Mock de WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}));

// Mock de animation frame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock de getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    transform: 'none',
    opacity: '1',
  }),
});

// Mock de getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 100,
  height: 100,
  top: 0,
  left: 0,
  bottom: 100,
  right: 100,
  x: 0,
  y: 0,
}));

// Mock de clientWidth/clientHeight
Object.defineProperty(Element.prototype, 'clientWidth', {
  get() { return 100; },
});

Object.defineProperty(Element.prototype, 'clientHeight', {
  get() { return 100; },
});

// Mock de scrollWidth/scrollHeight
Object.defineProperty(Element.prototype, 'scrollWidth', {
  get() { return 100; },
});

Object.defineProperty(Element.prototype, 'scrollHeight', {
  get() { return 100; },
});

// Mock de offsetWidth/offsetHeight
Object.defineProperty(Element.prototype, 'offsetWidth', {
  get() { return 100; },
});

Object.defineProperty(Element.prototype, 'offsetHeight', {
  get() { return 100; },
});

// Mock de console warnings/errors en tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Helper para esperar a que se actualice el DOM
global.waitForDOMUpdate = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper para simular eventos de teclado
global.fireKeyboardEvent = (element, eventType, key, options = {}) => {
  const event = new KeyboardEvent(eventType, {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  element.dispatchEvent(event);
};

// Helper para simular eventos de mouse
global.fireMouseEvent = (element, eventType, options = {}) => {
  const event = new MouseEvent(eventType, {
    bubbles: true,
    cancelable: true,
    clientX: 0,
    clientY: 0,
    ...options,
  });
  element.dispatchEvent(event);
};

// Helper para simular eventos de touch
global.fireTouchEvent = (element, eventType, options = {}) => {
  const event = new TouchEvent(eventType, {
    bubbles: true,
    cancelable: true,
    touches: [],
    ...options,
  });
  element.dispatchEvent(event);
};

// Helper para crear mocks de componentes
global.createMockComponent = (name, defaultProps = {}) => {
  const MockComponent = ({ children, ...props }) => {
    return React.createElement('div', {
      'data-testid': `${name.toLowerCase()}-mock`,
      ...defaultProps,
      ...props,
    }, children);
  };
  MockComponent.displayName = `Mock${name}`;
  return MockComponent;
};

// Helper para crear mocks de hooks
global.createMockHook = (returnValue) => {
  return jest.fn(() => returnValue);
};

// Helper para limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});
