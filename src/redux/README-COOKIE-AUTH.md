# Cookie-Based Authentication with RTK Query

This implementation configures RTK Query to use cookies for authentication instead of Bearer tokens, replicating the functionality of your server actions.

## 🚀 **Key Features**

### **1. Cookie-First Authentication**

- **Automatic Cookie Sending**: RTK Query sends cookies with every request using `credentials: 'include'`
- **Server-Side Cookie Access**: Proxy routes handle server-side cookie forwarding
- **Dual Authentication**: Cookies + Bearer token fallback for maximum compatibility

### **2. Smart Cookie Handling**

- **Development Support**: Handles `backend.session_token` (development)
- **Production Support**: Handles `__Secure-backend.session_token` (production with secure flag)
- **Client-Side Cookies**: Uses `js-cookie` for client-side cookie access
- **Server-Side Cookies**: Uses Next.js `cookies()` API for server-side access

### **3. Proxy-Based Architecture**

```
Client Request → RTK Query → Proxy Route → Backend API
                                ↓
                       Server-Side Cookies → Forwarded
```

## 📋 **Configuration**

### **Base Query Setup**

```typescript
// Cookie-based base query
const cookieBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: 'include', // Include cookies with all requests
  prepareHeaders: (headers, { getState, endpoint }) => {
    headers.set('Content-Type', 'application/json');

    // Get session token from cookies as Bearer token fallback
    const sessionToken =
      Cookies.get('backend.session_token') ||
      Cookies.get('__Secure-backend.session_token');

    if (sessionToken) {
      headers.set('Authorization', `Bearer ${sessionToken}`);
    }

    return headers;
  },
});
```

### **Proxy Query for Server-Side Cookies**

```typescript
const proxyBaseQuery = async (args: any, api: any, extraOptions: any) => {
  const endpointsRequiringServerCookies = [
    'testProtectedRoute',
    'testPublicRoute',
    'testAdminRoute',
    'getUserProfile',
    'getCurrentUser',
  ];

  // Route through proxy for server-side cookie access
  if (endpointsRequiringServerCookies.includes(api.endpoint)) {
    const response = await fetch(`/api/proxy${url}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok
        ? undefined
        : {
            status: response.status,
            data: data.error || data,
            message: data.message || 'Request failed',
          },
    };
  }

  // Use regular cookie query for other endpoints
  return cookieBaseQuery(args, api, extraOptions);
};
```

## 🔧 **Available Endpoints**

### **Queries (GET)**

```typescript
const {
  data: currentUser,
  isLoading: userLoading,
  error: userError,
} = useGetCurrentUserQuery();

const { data: protectedData } = useTestProtectedRouteQuery();
const { data: publicData } = useTestPublicRouteQuery();
const { data: adminData } = useTestAdminRouteQuery();
const { data: profileData } = useGetUserProfileQuery();
```

### **Mutations (POST/PUT)**

```typescript
const [login, { isLoading: loginLoading }] = useLoginMutation();
const [logout, { isLoading: logoutLoading }] = useLogoutMutation();
const [register, { isLoading: registerLoading }] = useRegisterMutation();

// Usage
await login({ email, password }).unwrap();
await logout().unwrap();
await register({ name, email, password }).unwrap();
```

## 📖 **Usage Examples**

### **Basic Authentication Flow**

```typescript
import {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} from '../redux/api/apiSlice';

const AuthComponent = () => {
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();

  const handleLogin = async () => {
    try {
      await login({ email, password }).unwrap();
      // Success - cookies are now set and RTK Query will use them
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      // Success - cookies are cleared
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (userLoading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={handleLogout} disabled={logoutLoading}>
            {logoutLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      ) : (
        <button onClick={handleLogin} disabled={loginLoading}>
          {loginLoading ? 'Logging in...' : 'Login'}
        </button>
      )}
    </div>
  );
};
```

### **Protected Route Access**

```typescript
import { useTestProtectedRouteQuery } from '../redux/api/apiSlice';

const ProtectedComponent = () => {
  const { data, isLoading, error } = useTestProtectedRouteQuery();

  if (isLoading) return <div>Loading protected content...</div>;
  if (error) return <div>Access denied: {error.message}</div>;

  return <div>Protected content: {JSON.stringify(data)}</div>;
};
```

### **Profile Management**

```typescript
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from '../redux/api/apiSlice';

const ProfileComponent = () => {
  const { data: profile, isLoading } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: updating }] =
    useUpdateUserProfileMutation();

  const handleUpdate = async newProfileData => {
    try {
      await updateProfile(newProfileData).unwrap();
      // Profile updated successfully
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (isLoading) return <div>Loading profile...</div>;

  return (
    <div>
      <h2>{profile?.name}</h2>
      <button
        onClick={() => handleUpdate({ name: 'New Name' })}
        disabled={updating}
      >
        {updating ? 'Updating...' : 'Update Profile'}
      </button>
    </div>
  );
};
```

## 🔒 **Security Features**

### **1. CORS Configuration**

Ensure your backend has proper CORS configuration:

```javascript
// Express.js example
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials
};
app.use(cors(corsOptions));
```

### **2. Cookie Security**

- **HttpOnly**: Prevent JavaScript access to cookies
- **Secure**: Only send over HTTPS in production
- **SameSite**: Prevent CSRF attacks
- **Domain**: Restrict cookie to your domain

### **3. Token Validation**

- Server validates session cookies on each request
- Automatic token refresh if supported by your backend
- Proper error handling for expired/invalid tokens

## 🔄 **Migration from Server Actions**

### **Before (Server Actions)**

```typescript
// Server action
const result = await getUserProfile();
if (result.success) {
  setProfile(result.data);
} else {
  setError(result.error);
}
```

### **After (RTK Query)**

```typescript
// RTK Query hook
const { data: profile, error, isLoading } = useGetUserProfileQuery();

// No manual state management needed!
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <ProfileDisplay profile={profile} />;
```

## 🚀 **Benefits Over Server Actions**

1. **Caching**: Automatic query caching and invalidation
2. **State Management**: Redux integration with global state
3. **Loading States**: Built-in loading/error states
4. **Automatic Retries**: Failed requests retry automatically
5. **Type Safety**: Full TypeScript support
6. **Developer Experience**: Better debugging and development tools
7. **Optimistic Updates**: Immediate UI updates with rollback on error

## 🧪 **Testing**

Use the provided `AuthCookieExample` component to test all functionality:

```typescript
import AuthCookieExample from '../components/AuthCookieExample';

<AuthCookieExample />;
```

This component provides:

- Login/registration forms
- Real-time API testing
- Error handling demonstration
- Usage examples

## 📂 **File Structure**

```
src/
├── redux/
│   ├── api/
│   │   ├── apiSlice.ts              # Main RTK Query configuration
│   │   └── README-COOKIE-AUTH.md    # This documentation
│   └── store.js                     # Redux store configuration
├── app/
│   └── api/
│       └── proxy/
│           └── [...slug]/
│               └── route.ts         # Cookie proxy API route
└── components/
    └── AuthCookieExample.tsx        # Example usage component
```

## 🎯 **Next Steps**

1. **Test the Implementation**: Use the `AuthCookieExample` component
2. **Configure Backend CORS**: Ensure proper CORS settings
3. **Cookie Security**: Review and adjust cookie security settings
4. **Error Handling**: Customize error handling for your use case
5. **Loading States**: Add loading indicators as needed

The cookie-based authentication is now ready to use! 🎉
