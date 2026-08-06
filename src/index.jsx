import { Component, StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const renderRuntimeError = (label, errorLike) => {
  const message = errorLike instanceof Error ? errorLike.stack || errorLike.message : String(errorLike);
  rootElement.innerHTML = `
    <div style="padding:16px;font-family:Arial,sans-serif;background:#fff7f7;color:#7f1d1d;border:1px solid #fecaca;border-radius:8px;margin:16px;">
      <h2 style="margin:0 0 8px 0;font-size:18px;">Application runtime error</h2>
      <div style="font-weight:700;margin-bottom:6px;">${label}</div>
      <pre style="white-space:pre-wrap;margin:0;font-size:12px;">${message}</pre>
    </div>
  `;
};

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorText: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorText: error?.stack || error?.message || String(error),
    };
  }

  render() {
    if (this.state.hasError) {
      return createElement(
        'div',
        {
          style: {
            padding: '16px',
            fontFamily: 'Arial, sans-serif',
            background: '#fff7f7',
            color: '#7f1d1d',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            margin: '16px',
          },
        },
        createElement('h2', { style: { margin: '0 0 8px 0', fontSize: '18px' } }, 'Application runtime error'),
        createElement('div', { style: { fontWeight: 700, marginBottom: '6px' } }, 'RootErrorBoundary'),
        createElement('pre', { style: { whiteSpace: 'pre-wrap', margin: 0, fontSize: '12px' } }, this.state.errorText),
      );
    }
    return this.props.children;
  }
}

window.addEventListener('error', (event) => {
  renderRuntimeError('window.error', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  renderRuntimeError('unhandledrejection', event.reason);
});

try {
  createRoot(rootElement).render(
    createElement(StrictMode, null, createElement(RootErrorBoundary, null, createElement(App))),
  );
} catch (error) {
  renderRuntimeError('render', error);
}
