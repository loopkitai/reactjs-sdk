import React, { useState } from 'react';
import {
  LoopKitProvider,
  useLoopKit,
  usePageView,
  useIdentify,
  useTrackEvent,
} from '@loopkit/react';

// Example App Component
function App() {
  return (
    <LoopKitProvider
      apiKey="your-api-key-here"
      config={{
        debug: true,
        enableAutoCapture: true,
        batchSize: 50,
        flushInterval: 30,
      }}
      onInitialized={() => console.log('LoopKit Analytics Ready!')}
      onError={(error) => console.error('LoopKit Error:', error)}
    >
      <HomePage />
    </LoopKitProvider>
  );
}

// Home Page Component with automatic page view tracking
function HomePage() {
  // Automatically track page view when component mounts
  usePageView('Homepage', {
    campaign: 'summer_sale',
    source: 'organic',
  });

  return (
    <div className="container">
      <h1>Welcome to Our App</h1>
      <UserSection />
      <ProductSection />
      <AnalyticsControls />
    </div>
  );
}

// User management section
function UserSection() {
  const [user, setUser] = useState(null);
  const { identify, track } = useLoopKit();

  // Auto-identify user when user state changes
  useIdentify(user?.id, {
    email: user?.email,
    plan: user?.plan,
    signup_date: user?.signupDate,
  });

  const handleLogin = async () => {
    const userData = {
      id: 'user_123',
      email: 'john@example.com',
      plan: 'pro',
      signupDate: '2024-01-15',
    };

    setUser(userData);

    // Track login event
    await track('user_logged_in', {
      method: 'email',
      user_plan: userData.plan,
    });
  };

  const handleLogout = async () => {
    await track('user_logged_out');
    setUser(null);
  };

  return (
    <div className="user-section">
      <h2>User Management</h2>
      {user ? (
        <div>
          <p>Welcome back, {user.email}!</p>
          <p>Plan: {user.plan}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}

// Product section with click tracking
function ProductSection() {
  const products = [
    { id: 'prod_1', name: 'Basic Plan', price: 9.99 },
    { id: 'prod_2', name: 'Pro Plan', price: 19.99 },
    { id: 'prod_3', name: 'Enterprise Plan', price: 49.99 },
  ];

  return (
    <div className="product-section">
      <h2>Our Products</h2>
      <div className="products">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// Individual product card with tracking
function ProductCard({ product }) {
  const { track } = useLoopKit();

  // Create a memoized tracking function for product views
  const trackProductView = useTrackEvent('product_viewed', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
  });

  // Track product view when component mounts
  React.useEffect(() => {
    trackProductView();
  }, [trackProductView]);

  const handleAddToCart = () => {
    track('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
    });
  };

  const handlePurchase = () => {
    track('purchase_completed', {
      product_id: product.id,
      amount: product.price,
      currency: 'USD',
      payment_method: 'credit_card',
    });
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}/month</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={handlePurchase}>Buy Now</button>
    </div>
  );
}

// Analytics controls and information
function AnalyticsControls() {
  const {
    isInitialized,
    isLoading,
    error,
    flush,
    getQueueSize,
    track,
    trackClick,
    trackFormSubmit,
  } = useLoopKit();

  const [queueSize, setQueueSize] = useState(0);

  // Update queue size periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setQueueSize(getQueueSize());
    }, 1000);

    return () => clearInterval(interval);
  }, [getQueueSize]);

  const handleFlush = async () => {
    await flush();
    setQueueSize(getQueueSize());
  };

  const handleCustomEvent = () => {
    track('custom_button_clicked', {
      timestamp: new Date().toISOString(),
      page: 'homepage',
    });
  };

  const handleClickTracking = () => {
    trackClick('demo_button', {
      location: 'analytics_controls',
      color: 'blue',
    });
  };

  const handleFormSubmit = () => {
    trackFormSubmit('newsletter_signup', {
      fields: ['email'],
      source: 'homepage',
    });
  };

  if (error) {
    return (
      <div className="analytics-error">
        <h2>Analytics Error</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="analytics-controls">
      <h2>Analytics Controls</h2>

      <div className="status">
        <p>
          Status:{' '}
          {isLoading ? 'Loading...' : isInitialized ? 'Ready' : 'Not Ready'}
        </p>
        <p>Queue Size: {queueSize} events</p>
      </div>

      <div className="actions">
        <button onClick={handleCustomEvent}>Track Custom Event</button>

        <button onClick={handleClickTracking}>Track Click Event</button>

        <button onClick={handleFormSubmit}>Track Form Submit</button>

        <button onClick={handleFlush}>Flush Events</button>
      </div>
    </div>
  );
}

export default App;
