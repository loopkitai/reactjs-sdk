# LoopKit React SDK

A complete React TypeScript SDK for tracking events, user identification, and behavioral analytics. Built on top of **@loopkit/javascript** with full TypeScript support and **zero-config auto-tracking**.

## 🚀 New in v1.1.0

- **🔧 Full TypeScript Support**: Comprehensive type definitions imported from @loopkit/javascript
- **📊 Zero-Config Auto Tracking**: Leverages built-in page views, clicks, and error tracking
- **🎯 React-Specific Hooks**: Enhanced hooks with React context and lifecycle integration
- **⚡ Reduced Bundle Size**: Eliminates duplicate code by using core SDK types
- **🔄 Enhanced Error Boundary**: React error tracking that complements global error tracking
- **🌐 Next.js Compatible**: Full server-side rendering (SSR) support

## Features

- **🔧 TypeScript Support**: Full TypeScript support with comprehensive type definitions from @loopkit/javascript
- **📊 Auto Event Tracking**: Automatic page views, clicks, and error tracking (enabled by default)
- **⚛️ React Integration**: React hooks, context, and error boundaries
- **👤 User Identification**: Identify users and track their journey
- **👥 Group Analytics**: Associate users with organizations/groups
- **💾 Local Storage**: Persist events offline with automatic retry
- **🌐 Cross-Platform**: Works in browsers and React applications
- **🌐 Next.js Compatible**: Full server-side rendering (SSR) support
- **📦 Multiple Formats**: ES modules, CommonJS, UMD builds available

## Installation

```bash
npm install @loopkit/react
```

### CDN

```html
<script src="https://unpkg.com/@loopkit/react/dist/index.umd.js"></script>
```

## Quick Start

### 1. Wrap Your App

```jsx
import React from 'react';
import { LoopKitProvider } from '@loopkit/react';
import App from './App';

function Root() {
  return (
    <LoopKitProvider apiKey="your-api-key-here">
      <App />
    </LoopKitProvider>
  );
}

export default Root;
```

### 2. Use the Hook

```jsx
import React from 'react';
import { useLoopKit } from '@loopkit/react';

function MyComponent() {
  const { track, identify, isInitialized } = useLoopKit();

  const handleClick = async () => {
    await track('button_clicked', { buttonName: 'Subscribe' });
  };

  if (!isInitialized) {
    return <div>Loading analytics...</div>;
  }

  return <button onClick={handleClick}>Subscribe</button>;
}
```

## Next.js Compatibility

The LoopKit React SDK is fully compatible with Next.js and server-side rendering (SSR). The SDK automatically detects the environment and:

- **Skips initialization during SSR**: Prevents server-side errors
- **Defers tracking until hydration**: All tracking happens client-side
- **Handles browser APIs safely**: No `window` or `document` access during SSR

### Next.js App Router Example

```jsx
// app/layout.tsx
import { LoopKitProvider } from '@loopkit/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LoopKitProvider apiKey="your-api-key-here">{children}</LoopKitProvider>
      </body>
    </html>
  );
}
```

```jsx
// app/page.tsx
'use client'; // Required for hooks in App Router

import { useLoopKit } from '@loopkit/react';

export default function HomePage() {
  const { track, isInitialized } = useLoopKit();

  const handleClick = () => {
    if (isInitialized) {
      track('homepage_cta_clicked');
    }
  };

  return <button onClick={handleClick}>Get Started</button>;
}
```

### Next.js Pages Router Example

```jsx
// pages/_app.tsx
import { LoopKitProvider } from '@loopkit/react';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LoopKitProvider apiKey="your-api-key-here">
      <Component {...pageProps} />
    </LoopKitProvider>
  );
}
```

## Auto-Tracking Features

The React SDK automatically leverages @loopkit/javascript's built-in auto-tracking:

| Feature            | Default    | Event Type  | Description                             |
| ------------------ | ---------- | ----------- | --------------------------------------- |
| **Page Views**     | ✅ Enabled | `page_view` | Automatic page loads and SPA navigation |
| **Click Tracking** | ✅ Enabled | `click`     | Button, link, and element clicks        |
| **Error Tracking** | ✅ Enabled | `error`     | JavaScript errors and exceptions        |

### Zero-Config Example

```jsx
import { LoopKitProvider } from '@loopkit/react';

function App() {
  return (
    <LoopKitProvider apiKey="your-api-key">
      {/* Auto-tracking starts immediately! */}
      {/* ✅ Page views tracked automatically */}
      {/* ✅ Button clicks tracked automatically */}
      {/* ✅ JavaScript errors tracked automatically */}
      <YourApp />
    </LoopKitProvider>
  );
}
```

### Customizing Auto-Tracking

```jsx
<LoopKitProvider
  apiKey="your-api-key"
  config={{
    enableAutoCapture: true, // Page view tracking
    enableAutoClickTracking: true, // Click tracking
    enableErrorTracking: true, // Error tracking
    debug: true, // Enable debug logs
  }}
>
  <App />
</LoopKitProvider>
```

## Hooks

### `useLoopKit()`

Main hook providing full SDK functionality:

```jsx
import { useLoopKit } from '@loopkit/react';

function MyComponent() {
  const {
    // State
    isInitialized,
    isLoading,
    error,

    // Core methods
    track,
    identify,
    group,
    flush,

    // React-specific convenience methods
    trackPageView,
    trackClick,
    trackFormSubmit,
    setUserId,
    setUserProperties,
  } = useLoopKit({
    userId: 'user123',
    autoIdentify: true, // Auto-identify on mount
  });

  return (
    <div>
      {isLoading && <span>Loading...</span>}
      {error && <span>Error: {error.message}</span>}
      {/* Your component */}
    </div>
  );
}
```

### `usePageView()`

Track page views with React context:

```jsx
import { usePageView } from '@loopkit/react';

function Page() {
  // Track page view with additional context
  usePageView('dashboard', {
    section: 'analytics',
    user_type: 'premium',
  });

  return <div>Dashboard</div>;
}
```

### `useIdentify()`

Auto-identify users:

```jsx
import { useIdentify } from '@loopkit/react';

function UserProfile({ user }) {
  // Auto-identify when user changes
  useIdentify(user?.id, {
    email: user?.email,
    plan: user?.plan,
  });

  return <div>Welcome {user?.name}!</div>;
}
```

### `useTrackEvent()`

Create reusable event trackers:

```jsx
import { useTrackEvent } from '@loopkit/react';

function ProductCard({ product }) {
  const trackProductView = useTrackEvent('product_viewed', {
    category: product.category,
    price: product.price,
  });

  useEffect(() => {
    trackProductView({ product_id: product.id });
  }, [product.id, trackProductView]);

  return <div>{product.name}</div>;
}
```

### `usePerformanceTracking()`

Track React component performance:

```jsx
import { usePerformanceTracking } from '@loopkit/react';

function ExpensiveComponent() {
  usePerformanceTracking('ExpensiveComponent', {
    trackRenderTime: true,
    trackMounts: true,
    trackUnmounts: true,
  });

  return <div>Heavy component</div>;
}
```

### `useRouteTracking()`

Track React Router navigation:

```jsx
import { useRouteTracking } from '@loopkit/react';
import { useLocation, useParams } from 'react-router-dom';

function RoutePage() {
  const location = useLocation();
  const params = useParams();

  useRouteTracking('product-detail', {
    productId: params.id,
    category: params.category,
  });

  return <div>Product Detail</div>;
}
```

## Error Boundary

Automatic React error tracking:

```jsx
import { LoopKitErrorBoundary } from '@loopkit/react';

function App() {
  return (
    <LoopKitProvider apiKey="your-api-key">
      <LoopKitErrorBoundary
        fallback={<div>Something went wrong!</div>}
        onError={(error, errorInfo) => {
          console.error('React error:', error);
        }}
      >
        <YourApp />
      </LoopKitErrorBoundary>
    </LoopKitProvider>
  );
}
```

## TypeScript Support

Full TypeScript support with types from @loopkit/javascript:

```typescript
import type {
  // Core types from @loopkit/javascript
  LoopKitConfig,
  TrackEvent,
  IdentifyEvent,
  GroupEvent,
  TrackOptions,
  ClickEventProperties,
  BatchEventInput,

  // React-specific types
  UserProperties,
  GroupProperties,
  UseLoopKitReturn,
} from '@loopkit/react';

const config: LoopKitConfig = {
  apiKey: 'your-key',
  enableAutoCapture: true,
  enableAutoClickTracking: true,
  enableErrorTracking: true,
  debug: true,
};

function MyComponent() {
  const loopkit: UseLoopKitReturn = useLoopKit();

  const trackCustomEvent = async () => {
    const properties: Record<string, any> = {
      custom_property: 'value',
      timestamp: new Date().toISOString(),
    };

    await loopkit.track('custom_event', properties);
  };

  return <button onClick={trackCustomEvent}>Track Event</button>;
}
```

## Configuration Options

All configuration options from @loopkit/javascript are supported:

```jsx
<LoopKitProvider
  apiKey="your-api-key"
  config={{
    // API Settings
    baseURL: 'https://api.loopkit.ai/v1',

    // Batching
    batchSize: 50,
    flushInterval: 30,
    maxQueueSize: 1000,

    // Auto-tracking (all enabled by default)
    enableAutoCapture: true, // Page views
    enableAutoClickTracking: true, // Click events
    enableErrorTracking: true, // JavaScript errors

    // Performance
    enableCompression: true,
    requestTimeout: 10000,

    // Debugging
    debug: true,
    logLevel: 'info',

    // Privacy
    respectDoNotTrack: true,
    enableLocalStorage: true,

    // Callbacks
    onBeforeTrack: (event) => {
      console.log('Tracking:', event);
      return event;
    },
    onAfterTrack: (event, success) => {
      console.log(`Event ${success ? 'sent' : 'failed'}:`, event);
    },
    onError: (error) => {
      console.error('LoopKit error:', error);
    },
  }}
  onError={(error) => console.error('Provider error:', error)}
  onInitialized={() => console.log('LoopKit initialized')}
>
  <App />
</LoopKitProvider>
```

## Advanced Usage

### Access the Core SDK

```jsx
import { LoopKit } from '@loopkit/react';

// Direct access to @loopkit/javascript SDK
LoopKit.track('direct_event', { source: 'direct_sdk' });
```

### Manual Configuration

```jsx
import { useLoopKitContext } from '@loopkit/react';

function SettingsComponent() {
  const { configure } = useLoopKitContext();

  const updateConfig = () => {
    configure({
      debug: true,
      batchSize: 100,
    });
  };

  return <button onClick={updateConfig}>Enable Debug</button>;
}
```

## Examples

Check out the `/examples` directory for complete examples:

- **Basic React App**: Simple integration example
- **React Router**: SPA navigation tracking
- **TypeScript**: Full TypeScript implementation
- **Advanced**: Performance tracking, error boundaries, custom events

## Migration from v1.0.x

v1.1.0 is backward compatible, but you can now:

1. **Remove manual page view tracking** - it's automatic now
2. **Remove manual click tracking** - it's automatic now
3. **Use TypeScript types from @loopkit/javascript** instead of duplicated types
4. **Simplify configuration** - auto-tracking is enabled by default

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License. See [LICENSE](LICENSE) for details.

## Next.js Troubleshooting

If you encounter issues with Next.js, here are common solutions:

### 1. "ReactCurrentDispatcher" Error

If you see an error like `Cannot read properties of undefined (reading 'ReactCurrentDispatcher')`, this is typically caused by:

- **SSR Execution**: The SDK trying to execute during server-side rendering
- **Solution**: The updated SDK (v1.1.4+) automatically handles this by detecting the browser environment

### 2. Module Export Errors

If you see errors like `'@loopkit/javascript' does not contain a default export`:

- **Cause**: Module resolution issues between different export formats
- **Solution**: The updated SDK (v1.1.4+) handles this automatically with improved import handling

### 3. "Cannot access before initialization" Errors

If you see reference errors during SSR:

```jsx
// ❌ Don't do this - direct usage in component body
function MyComponent() {
  const analytics = useLoopKit(); // May cause SSR issues

  // Component using analytics directly in render
}

// ✅ Do this - conditional usage
function MyComponent() {
  const { track, isInitialized } = useLoopKit();

  useEffect(() => {
    if (isInitialized) {
      // Safe to use after initialization
      track('component_mounted');
    }
  }, [isInitialized, track]);

  return <div>My Component</div>;
}
```

### 4. App Router vs Pages Router

**App Router (Next.js 13+)**:

- Use `'use client'` directive for components that use LoopKit hooks
- Place LoopKitProvider in `layout.tsx`

**Pages Router**:

- Place LoopKitProvider in `_app.tsx`
- No client directive needed

### 5. Dynamic Imports (Alternative Approach)

If you still encounter issues, you can use dynamic imports:

```jsx
import dynamic from 'next/dynamic';

const AnalyticsProvider = dynamic(
  () =>
    import('@loopkit/react').then((mod) => ({ default: mod.LoopKitProvider })),
  { ssr: false }
);

export default function App({ Component, pageProps }) {
  return (
    <AnalyticsProvider apiKey="your-api-key">
      <Component {...pageProps} />
    </AnalyticsProvider>
  );
}
```

### 6. Vercel Deployment Issues

If you encounter build issues on Vercel:

1. Ensure your `package.json` includes the correct dependencies
2. Check that your Node.js version is compatible (16+ recommended)
3. Consider adding to your `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@loopkit/react', '@loopkit/javascript'],
  experimental: {
    esmExternals: true,
  },
};

module.exports = nextConfig;
```

### Getting Help

If you continue to experience issues:

1. Check that you're using the latest version: `npm update @loopkit/react`
2. Review the [Next.js documentation](https://nextjs.org/docs) for SSR best practices
3. Open an issue on the GitHub repository with:
   - Your Next.js version
   - Your @loopkit/react version
   - Full error message and stack trace
   - Minimal reproduction code

## Configuration
