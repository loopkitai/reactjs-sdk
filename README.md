# @loopkit/react

A React TypeScript wrapper for the [@loopkit/javascript](https://www.npmjs.com/package/@loopkit/javascript) package that provides easy-to-use analytics functionality for React applications.

## Features

- 🚀 **Easy Setup**: Simple provider-based initialization
- 🔄 **React Hooks**: Intuitive hooks for tracking events and managing user data
- 📊 **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- 🛡️ **Error Handling**: Built-in error handling with custom error types
- 🎯 **Convenience Methods**: Pre-built tracking functions for common scenarios
- ⚡ **Performance**: Optimized with React best practices (memoization, proper dependencies)
- 🔧 **Flexible**: Access to underlying LoopKit SDK for advanced use cases

## Installation

```bash
npm install @loopkit/react @loopkit/javascript
```

## Quick Start

### 1. Wrap your app with LoopKitProvider

```tsx
import React from 'react';
import { LoopKitProvider } from '@loopkit/react';

function App() {
  return (
    <LoopKitProvider
      apiKey="your-api-key-here"
      config={{
        debug: true,
        enableAutoCapture: true,
      }}
      onInitialized={() => console.log('LoopKit initialized!')}
      onError={(error) => console.error('LoopKit error:', error)}
    >
      <YourApp />
    </LoopKitProvider>
  );
}
```

### 2. Use the hook in your components

```tsx
import React from 'react';
import { useLoopKit } from '@loopkit/react';

function MyComponent() {
  const { track, identify, isInitialized } = useLoopKit();

  const handleButtonClick = () => {
    track('button_clicked', {
      button_name: 'signup',
      page: '/homepage',
    });
  };

  const handleUserLogin = (userId: string) => {
    identify(userId, {
      email: 'user@example.com',
      plan: 'pro',
    });
  };

  if (!isInitialized) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div>
      <button onClick={handleButtonClick}>Sign Up</button>
    </div>
  );
}
```

## API Reference

### LoopKitProvider

The main provider component that initializes LoopKit and provides analytics functionality to child components.

```tsx
<LoopKitProvider
  apiKey="your-api-key"
  config={{
    debug: false,
    batchSize: 50,
    flushInterval: 30,
    enableAutoCapture: false,
    enableErrorTracking: false,
  }}
  onInitialized={() => console.log('Ready!')}
  onError={(error) => console.error(error)}
>
  {children}
</LoopKitProvider>
```

#### Props

| Prop            | Type                     | Required | Description                  |
| --------------- | ------------------------ | -------- | ---------------------------- |
| `apiKey`        | `string`                 | Yes      | Your LoopKit API key         |
| `config`        | `LoopKitConfig`          | No       | Configuration options        |
| `children`      | `ReactNode`              | Yes      | Child components             |
| `onInitialized` | `() => void`             | No       | Called when LoopKit is ready |
| `onError`       | `(error: Error) => void` | No       | Called when errors occur     |

### useLoopKit Hook

The main hook for accessing LoopKit functionality.

```tsx
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

  // Convenience methods
  trackPageView,
  trackClick,
  trackFormSubmit,
  setUserId,
  setUserProperties,
  setGroup,
} = useLoopKit();
```

#### Methods

##### track(eventName, properties?, options?)

Track a custom event.

```tsx
track('purchase_completed', {
  amount: 99.99,
  currency: 'USD',
  product_id: 'pro_plan',
});
```

##### identify(userId, properties?)

Associate events with a specific user.

```tsx
identify('user_123', {
  email: 'user@example.com',
  plan: 'enterprise',
  signup_date: '2024-01-15',
});
```

##### group(groupId, properties?, groupType?)

Associate the user with a group or organization.

```tsx
group('company_abc', {
  name: 'Acme Corp',
  plan: 'enterprise',
  employee_count: 500,
});
```

##### trackPageView(pageName?, properties?)

Track page views with automatic URL detection.

```tsx
trackPageView('Homepage', {
  campaign: 'summer_sale',
});
```

##### trackClick(elementName, properties?)

Track click events.

```tsx
trackClick('signup_button', {
  location: 'header',
  variant: 'primary',
});
```

##### trackFormSubmit(formName, properties?)

Track form submissions.

```tsx
trackFormSubmit('contact_form', {
  fields: ['name', 'email', 'message'],
});
```

### Specialized Hooks

#### usePageView

Automatically track page views when components mount.

```tsx
import { usePageView } from '@loopkit/react';

function HomePage() {
  usePageView('Homepage', { campaign: 'summer_sale' });

  return <div>Welcome to our homepage!</div>;
}
```

#### useIdentify

Automatically identify users when user data changes.

```tsx
import { useIdentify } from '@loopkit/react';

function UserProfile({ user }) {
  useIdentify(user?.id, {
    email: user?.email,
    plan: user?.plan,
  });

  return <div>User Profile</div>;
}
```

#### useTrackEvent

Create a memoized tracking function for specific events.

```tsx
import { useTrackEvent } from '@loopkit/react';

function ProductCard({ product }) {
  const trackProductView = useTrackEvent('product_viewed', {
    product_id: product.id,
    category: product.category,
  });

  useEffect(() => {
    trackProductView();
  }, [trackProductView]);

  return <div>{product.name}</div>;
}
```

## Configuration Options

```typescript
interface LoopKitConfig {
  // API Settings
  baseURL?: string;

  // Batching
  batchSize?: number;
  flushInterval?: number;
  maxQueueSize?: number;

  // Performance
  enableCompression?: boolean;
  requestTimeout?: number;

  // Debugging
  debug?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';

  // Auto-capture (Browser only)
  enableAutoCapture?: boolean;
  enableErrorTracking?: boolean;

  // Privacy
  respectDoNotTrack?: boolean;
  enableLocalStorage?: boolean;

  // Retry Logic
  maxRetries?: number;
  retryBackoff?: 'exponential' | 'linear';

  // Callbacks
  onBeforeTrack?: (event: TrackEvent) => TrackEvent | null;
  onAfterTrack?: (event: TrackEvent, success: boolean) => void;
  onError?: (error: Error) => void;
}
```

## Error Handling

The SDK provides custom error types for better error handling:

```tsx
import {
  LoopKitError,
  LoopKitInitializationError,
  LoopKitTrackingError,
} from '@loopkit/react';

function MyComponent() {
  const { track } = useLoopKit();

  const handleTrack = async () => {
    try {
      await track('event_name', { prop: 'value' });
    } catch (error) {
      if (error instanceof LoopKitTrackingError) {
        console.error('Tracking failed:', error.message);
      } else if (error instanceof LoopKitInitializationError) {
        console.error('LoopKit not initialized:', error.message);
      }
    }
  };
}
```

## Advanced Usage

### Access Underlying SDK

For advanced use cases, you can access the underlying LoopKit SDK:

```tsx
import { LoopKit } from '@loopkit/react';

// Direct access to the JavaScript SDK
LoopKit.configure({ debug: true });
const queueSize = LoopKit.getQueueSize();
```

### Custom Hook with Auto-Identification

```tsx
function useUserTracking(user) {
  const { identify, track } = useLoopKit({
    userId: user?.id,
    userProperties: {
      email: user?.email,
      plan: user?.subscription?.plan,
    },
    autoIdentify: true,
  });

  const trackUserAction = useCallback(
    (action, properties = {}) => {
      track(action, {
        user_id: user?.id,
        user_plan: user?.subscription?.plan,
        ...properties,
      });
    },
    [track, user]
  );

  return { trackUserAction };
}
```

## TypeScript Support

The SDK is built with TypeScript and provides comprehensive type definitions:

```tsx
import type {
  LoopKitConfig,
  UserProperties,
  TrackOptions,
  UseLoopKitReturn,
} from '@loopkit/react';

const config: LoopKitConfig = {
  debug: true,
  batchSize: 100,
};

const userProps: UserProperties = {
  email: 'user@example.com',
  plan: 'pro',
  signup_date: '2024-01-15',
};
```

## Examples

### E-commerce Tracking

```tsx
function ProductPage({ product }) {
  const { track, trackPageView } = useLoopKit();

  // Track page view
  usePageView(`Product: ${product.name}`, {
    product_id: product.id,
    category: product.category,
    price: product.price,
  });

  const handleAddToCart = () => {
    track('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
    });
  };

  const handlePurchase = () => {
    track('purchase', {
      product_id: product.id,
      amount: product.price,
      currency: 'USD',
    });
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={handlePurchase}>Buy Now</button>
    </div>
  );
}
```

### User Authentication Flow

```tsx
function AuthComponent() {
  const { identify, track } = useLoopKit();

  const handleLogin = async (email, password) => {
    try {
      const user = await authService.login(email, password);

      // Identify the user
      await identify(user.id, {
        email: user.email,
        plan: user.subscription?.plan,
        signup_date: user.createdAt,
      });

      // Track login event
      await track('user_logged_in', {
        method: 'email',
        user_plan: user.subscription?.plan,
      });
    } catch (error) {
      track('login_failed', {
        error: error.message,
        method: 'email',
      });
    }
  };

  const handleSignup = async (userData) => {
    const user = await authService.signup(userData);

    await identify(user.id, userData);
    await track('user_signed_up', {
      method: 'email',
      source: 'website',
    });
  };
}
```

## License

MIT License. See [LICENSE](LICENSE) for details.

## Support

For issues and questions:

- [GitHub Issues](https://github.com/loopkit/loopkit-react-sdk/issues)
- [LoopKit Documentation](https://docs.loopkit.ai)
