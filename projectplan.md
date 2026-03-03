# Nishat E-Commerce - Project Documentation

## 📋 Project Overview

**Nishat** is a modern, premium electronics e-commerce platform built with Next.js 16 and React 19. The platform offers a comprehensive shopping experience featuring electronics, gadgets, and accessories from top global brands.

**Project Name:** Nishat Commerce  
**Version:** 0.1.0  
**Framework:** Next.js 16.1.6  
**Database:** MongoDB (Atlas)  
**Authentication:** Firebase Auth + Firebase Token instead of custom jwt.   
**Image Storage:** Cloudinary  

---

## 🏗️ Architecture & Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React Framework (App Router) |
| React | 19.2.3 | UI Library |
| Tailwind CSS | 4.x | Styling Framework |
| Framer Motion | 3.34.3 | Animations & Transitions |
| Lucide React | 0.575.0 | Icon Library |
| React Icons | 5.5.0 | Additional Icons |
| GSAP | 3.14.2 | Advanced Animations |

### Backend & Services
| Technology | Version | Purpose |
|------------|---------|---------|
| MongoDB | 7.1.0 | Database (Atlas) |
| Firebase | 12.10.0 | Authentication |
| Firebase Admin SDK | - | Server-side Auth |
| Cloudinary | 2.9.0 | Image Storage & CDN |
| Firebase Token | - | Firebase Token using bearer.  |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint 9 | Code Linting |
| Babel Parser | AST Parsing |
| Magic String | Code Transformation |
| Fast Average Color | Color Analysis |

---

## 📁 Project Structure

```
e-commerce/
├── Firebase/
│   └── firebase.config.js          # Firebase client initialization
├── Provider/
│   └── AuthProvider.jsx            # Firebase Auth Context Provider
├── public/                         # Static assets
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── about/                  # About Us page
│   │   ├── brand/                  # Brand pages
│   │   ├── brands/                 # All brands listing
│   │   ├── category/[slug]/        # Dynamic category pages
│   │   ├── login/                  # Login page
│   │   ├── product/[id]/           # Dynamic product detail pages
│   │   ├── register/               # Registration page
│   │   ├── support/                # Support/Help center
│   │   ├── trending/               # Trending products
│   │   ├── wishlist/               # User wishlist
│   │   ├── globals.css             # Global styles & theme
│   │   ├── layout.jsx              # Root layout
│   │   └── page.jsx                # Homepage
│   ├── components/                 # Reusable UI components
│   │   ├── AboutPage.jsx           # About page content
│   │   ├── BrandPage.jsx           # Brand page component
│   │   ├── BrandsGrid.jsx          # Brands grid display
│   │   ├── Categories.jsx          # Category carousel
│   │   ├── CategoryPage.jsx        # Category listing page
│   │   ├── ExclusiveOffer.jsx      # Promotional offers
│   │   ├── FeaturedCategories.jsx  # Featured category cards
│   │   ├── Footer.jsx              # Site footer
│   │   ├── Hero.jsx                # Homepage hero slider
│   │   ├── LoginPage.jsx           # Login form
│   │   ├── Navbar.jsx              # Navigation with dropdowns
│   │   ├── ProductDetail.jsx       # Product detail view
│   │   ├── Products.jsx            # Product grid
│   │   ├── Provider.jsx            # Context providers wrapper
│   │   ├── RegisterPage.jsx        # Registration form
│   │   ├── SupportPage.jsx         # FAQ & contact form
│   │   ├── Testimonials.jsx        # Customer reviews
│   │   ├── TrendingPage.jsx        # Trending products with filters
│   │   ├── TrustBadges.jsx         # Trust indicators
│   │   └── WishlistPage.jsx        # Wishlist page
│   ├── context/                    # React Context providers
│   │   └── WishlistContext.jsx     # Wishlist state management
│   ├── data/                       # Static data files
│   │   ├── brands.js               # Brand data (24 brands)
│   │   ├── categories.js           # Categories with subcategories
│   │   └── products.js             # Product catalog (811 lines)
│   └── lib/                        # Utility libraries
│       ├── auth.js                 # Authentication utilities
│       └── mongodb.js              # MongoDB connection
├── component-tagger-loader.js      # Custom webpack loader (dev)
├── eslint.config.mjs               # ESLint configuration
├── jsconfig.json                   # JavaScript config (path aliases)
├── next.config.mjs                 # Next.js configuration
├── package.json                    # Dependencies & scripts
└── .env.local                      # Environment variables (not tracked)
```

---

## 🎨 Design System

### Color Palette
Defined in `globals.css`:

| Variable | Hex Code | Usage |
|----------|----------|-------|
| `--color-purple-dark` | #2D1854 | Primary dark, buttons |
| `--color-purple-mid` | #4C1D95 | Primary mid, accents |
| `--color-purple-light` | #7C3AED | Highlights |
| `--color-purple-accent` | #A855F7 | Accent elements |
| `--color-purple-soft` | #EDE9FE | Backgrounds, badges |
| `--color-purple-muted` | #DDD6FE | Subtle elements |
| `--color-offwhite` | #FAFAF8 | Page background |
| `--color-cream` | #F5F3EF | Section backgrounds |
| `--color-card-white` | #FFFFFF | Card backgrounds |
| `--color-text-primary` | #1a1a2e | Main text |
| `--color-text-secondary` | #6B7280 | Secondary text |
| `--color-text-muted` | #9CA3AF | Muted text |

### Typography
- **Primary Font:** Poppins (300, 400, 500, 600, 700)
- **Serif Font:** Georgia, "Times New Roman" (for headings)
- **Font Variable:** `--font-poppins`

### Design Principles
1. **Premium Aesthetic:** Clean, modern design with purple brand colors
2. **Smooth Animations:** Framer Motion for micro-interactions
3. **Responsive:** Mobile-first design with breakpoints
4. **Accessibility:** Semantic HTML, proper contrast ratios

---

## 🔐 Authentication System

### Firebase Configuration
```javascript
// Firebase Client Config (Firebase/firebase.config.js)
{
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
}
```

### Firebase Admin SDK
Server-side authentication uses Firebase Admin with service account credentials for:
- ID Token verification
- User management
- Custom claims

### Authentication Flow
1. **Client-side:** Firebase Auth (Google, Apple, Email/Password)
2. **Server-side:** JWT token verification with MongoDB role lookup
3. **Database:** User data stored in MongoDB `ECOM` database

### Auth Features (`src/lib/auth.js`)
- ✅ Firebase ID Token verification
- ✅ Custom JWT support
- ✅ MongoDB user role lookup
- ✅ Automatic user creation on first login
- ✅ Role-based access control (admin, user)
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Email validation

### User Schema (MongoDB)
```javascript
{
  email: String (lowercase, unique),
  name: String,
  phone: String,
  role: String ('user' | 'admin'),
  branch: String (default: 'main'),
  isStockEditor: Boolean,
  profilePicture: String,
  firebaseUid: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔥 Firebase Google Sign-In Setup Guide

### Problem
You may see this error when Google Sign-In is not enabled:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
Firebase: Error (auth/operation-not-allowed).
```

### Solution: Enable Google Sign-In

#### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click on your project: **e-com-73e7d**

#### Step 2: Navigate to Authentication
1. In the left sidebar, click on **Authentication**
2. Click on the **Sign-in method** tab (at the top)

#### Step 3: Enable Google Provider
1. Scroll down to **Sign-in providers** section
2. Click on **Google** (it might show as "Not enabled")
3. A configuration modal will open

#### Step 4: Configure Google Sign-In
1. Toggle **Enable** to ON (green)
2. In the **Project support email** field, select your email from the dropdown
3. Click **Save** button

#### Step 5: Verify
1. You should now see Google listed as "Enabled" with a green checkmark
2. The status should show "Enabled" under the Provider column

### Additional Configuration (Optional but Recommended)

#### Set Up OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **e-com-73e7d**
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Fill in the required fields:
   - **App name**: Nishat Commerce
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. Skip Scopes (click Save and Continue)
7. Skip Test users (click Save and Continue)

### Testing Google Sign-In
After enabling Google Sign-In:
1. Go back to your app: `http://localhost:3000/login`
2. Click **Continue with Google**
3. You should now see the Google sign-in popup
4. Select your account
5. You should be redirected to the home page

### Common Sign-In Issues

| Issue | Cause | Solution |
|-------|-------|---------|
| "Popup closed by user" | User closed popup early | Click login button again |
| "Network error" | Internet/Firebase blocked | Check connection, retry |
| Still seeing "operation-not-allowed" | Changes propagating | Wait 2-3 min, hard refresh (Ctrl+Shift+R), clear cache |

### Verify Firebase Configuration

Make sure your `.env.local` file has the correct Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_APIKEY=AIzaSyCeds1XcCbEUMTT6L__jowPpNRhSxrLwDk
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=e-com-73e7d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECTID=e-com-73e7d
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=e-com-73e7d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=613832479204
NEXT_PUBLIC_FIREBASE_APPID=1:613832479204:web:313bb56bee7b539733b7f1
```

### Granting Admin Access
To give yourself admin access:
1. Log in with Google
2. Open MongoDB Atlas
3. Navigate to your database: **ECOM**
4. Find the **user** collection
5. Find your user document (by email)
6. Update the `role` field to `"admin"`
7. Save the changes
8. Refresh your app — you should now see the Admin badge

---

## 📦 Data Models

### Products (`src/data/products.js`)
Each product contains:
```javascript
{
  id: String (unique slug),
  brand: String,
  name: String,
  price: Number,
  originalPrice: Number,
  drop: Number (discount percentage),
  badge: String | null,
  image: String (URL),
  gallery: String[] (URLs),
  description: String (short),
  longDescription: String[] (paragraphs),
  features: String[],
  specifications: Object (key-value pairs),
  stock: String ('In Stock' | 'Out of Stock')
}
```

### Categories (`src/data/categories.js`)
```javascript
{
  name: String,
  slug: String,
  subcategories: [
    { name: String, slug: String }
  ]
}
```

**11 Main Categories:**
1. Laptops & Computers (6 subcategories)
2. Smartphones & Tablets (6 subcategories)
3. Audio & Headphones (6 subcategories)
4. Wearable Technology (5 subcategories)
5. Cameras & Photography (6 subcategories)
6. TV & Home Entertainment (5 subcategories)
7. Gaming (6 subcategories)
8. Computer Components (6 subcategories)
9. Networking (6 subcategories)
10. Accessories & Peripherals (6 subcategories)

### Brands (`src/data/brands.js`)
24 brands including: Apple, Samsung, Sony, JBL, Dell, HP, Lenovo, Asus, LG, Bose, Intel, Logitech, Canon, Xiaomi, Microsoft, Google, Razer, Belkin, Nvidia, AMD, Corsair, Philips, Huawei, Apple Watch

---

## 🚀 Key Features

### Homepage
- **Hero Section:** 5-slide carousel with auto-advance, drag/swipe support
- **Trust Badges:** Free Shipping, Quality Guaranteed, 30-Day Return
- **Category Carousel:** Horizontal draggable list of 16 categories
- **Product Grid:** Featured products with wishlist
- **Featured Categories:** 3 promotional cards
- **Exclusive Offers:** 3 rotating promotional banners
- **Testimonials:** Customer reviews

### Product Pages
- **Image Gallery:** Main image with thumbnails, swipe navigation
- **Product Info:** Brand, name, rating, price, discount badge
- **Quantity Selector:** Add to cart with quantity
- **Tabs:** Description and Specifications
- **Related Products:** 4 related items

### Category Pages
- **Breadcrumb Navigation**
- **Subcategory Chips** (for parent categories)
- **Sidebar Filters:**
  - Price range slider
  - Brand checkboxes
  - Connectivity options
  - Discount percentage
  - Condition (New, Refurbished, Open Box)
  - Availability
- **Sort Options:** Price, Name, Discount, Newest
- **View Modes:** Grid (2-4 columns) / List view
- **Mobile Filter Drawer**

### Trending Page
- **Trending Tags:** All, Hot Deals, Best Sellers, New Arrivals, Top Rated
- **Advanced Filtering:** Same as category pages
- **Grid/List Toggle**
- **Real-time Product Count**

### Wishlist
- **LocalStorage Persistence**
- **Add/Remove Items**
- **Empty State with CTA**
- **Quick Add to Cart**

### Authentication Pages
- **Login:** Google Sign-in, Email/Password (UI ready)
- **Register:** Google Sign-up, Email/Password (UI ready)
- **Social Providers:** Google, Apple

### Support Page
- **Contact Channels:** WhatsApp, Email, Facebook
- **FAQ Accordion:** 4 categories (Orders, Returns, Payments, Shipping)
- **Contact Form:** Name, Email, Subject, Message

### About Page
- **Stats:** 50,000+ customers, 2,000+ products, 80+ brands, 4.8/5 rating
- **Mission Section**
- **Values:** Authentic, Fast Delivery, Support, Best Price
- **Timeline:** Company history (2019-2024)
- **Team Section:** 3 team members

---

## 🌐 API Documentation

### User API (`/api/user`)

The User API provides complete user management with Firebase token-based authentication (Bearer token).

**Base URL:** `/api/user`

**Authentication:** All endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

#### GET /api/user

**Description:** Fetch user information

**Query Parameters:**
- `email` (optional) — Check if a user exists by email
- `getAllUsers` (optional) — Set to `true` to get all users (admin only)

**Examples:**
```javascript
// Get current user's profile
const token = await firebase.auth().currentUser.getIdToken()
const response = await fetch('/api/user', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const { user } = await response.json()

// Check if user exists by email
const response = await fetch('/api/user?email=user@example.com', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const { exists, user } = await response.json()

// Get all users (admin only)
const response = await fetch('/api/user?getAllUsers=true', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const { users } = await response.json()
```

---

#### POST /api/user

**Description:** Create a new user or update user profile/role

**Request Body:**
```javascript
// Create user
{
  email: "user@example.com",
  name: "John Doe",
  phone: "+8801700000000",
  role: "user", // optional: admin, user, shop_owner
  profilePicture: "https://...",
  firebaseUid: "firebase_uid"
}

// Update user profile
{
  action: "update",
  email: "user@example.com",
  name: "Updated Name",
  phone: "+8801700000000",
  role: "admin" // admin only
}
```

**Examples:**
```javascript
// Create user
const response = await fetch('/api/user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ email: 'user@example.com', name: 'John Doe', phone: '+8801700000000' })
})
const { message, user } = await response.json()

// Update user profile
const response = await fetch('/api/user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ action: 'update', email: 'user@example.com', name: 'Updated Name' })
})
const { message, user } = await response.json()
```

---

#### PUT /api/user

**Description:** Update user profile picture with Cloudinary upload

**Request Body:** FormData
- `email` — User email
- `file` — Image file (max 5MB)

**Example:**
```javascript
const formData = new FormData()
formData.append('email', 'user@example.com')
formData.append('file', imageFile)

const response = await fetch('/api/user', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
})
const { message, imageUrl, publicId, user } = await response.json()
```

---

#### DELETE /api/user

**Description:** Delete user profile picture

**Query Parameters:**
- `email` — User email

**Example:**
```javascript
const response = await fetch('/api/user?email=user@example.com', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
})
const { message } = await response.json()
```

---

### API Response Format

#### Success Response
```javascript
{
  "message": "Success message",
  "user": {
    "_id": "mongodb_id",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+8801700000000",
    "role": "user",
    "profilePicture": "https://...",
    "firebaseUid": "firebase_uid",
    "createdAt": "2026-03-02T00:00:00.000Z",
    "updatedAt": "2026-03-02T00:00:00.000Z"
  }
}
```

#### Error Response
```javascript
{
  "error": "Error message",
  "details": "Detailed error (development only)"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | User created |
| 400 | Bad request (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | User not found |
| 500 | Internal server error |

### API Security Features

1. **Firebase Token Authentication** — All requests require a valid Firebase ID token, verified via Firebase Admin SDK, passed as a Bearer token.
2. **Role-Based Access Control (RBAC)** — Regular users can only access/update their own profile. Admins can access/update any user and list all users.
3. **Rate Limiting** — 100 requests per 15 minutes per IP address.
4. **Input Validation** — Email format, name length, file type/size, and role validation.
5. **Audit Logging** — All user operations are logged to MongoDB `audit_logs` collection (action, userId, userEmail, timestamp, ipAddress).
6. **Cloudinary Security** — Server-side upload (API secret never exposed to client), automatic image transformation (400×400, auto quality/format), old images deleted on update.

### User Schema (MongoDB — Full)
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  name: String,
  phone: String,
  role: String ('user' | 'admin' | 'shop_owner'),
  profilePicture: String (URL),
  profilePicturePublicId: String (Cloudinary ID),
  firebaseUid: String,
  branch: String (default: 'main'),
  isStockEditor: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Usage with React/Frontend

```javascript
// Custom hook for user operations
import { useState, useEffect } from 'react'
import { auth } from '@/Firebase/firebase.config'

export function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser
      if (!currentUser) return

      const token = await currentUser.getIdToken()
      const response = await fetch('/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  const updateUser = async (data) => {
    const currentUser = auth.currentUser
    const token = await currentUser.getIdToken()

    const response = await fetch('/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'update', email: user.email, ...data })
    })

    return await response.json()
  }

  return { user, loading, updateUser }
}
```

### API Error Handling

```javascript
try {
  const response = await fetch('/api/user', {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  if (!response.ok) {
    const error = await response.json()

    if (response.status === 401) {
      console.error('Authentication failed') // Token expired or invalid
    } else if (response.status === 403) {
      console.error('Access denied') // Insufficient permissions
    } else if (response.status === 404) {
      console.error('User not found')
    } else {
      console.error('Error:', error.message)
    }
    return
  }

  const data = await response.json()
  console.log('Success:', data)
} catch (error) {
  console.error('Network error:', error)
}
```

---

## 🔧 Configuration Files

### Next.js Config (`next.config.mjs`)
```javascript
{
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "cdn.worldvectorlogo.com" },
    ],
  },
  webpack: {
    // Custom component tagger loader for dev
  }
}
```

### JSConfig (`jsconfig.json`)
```javascript
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Component Tagger Loader
Custom webpack loader that adds `data-lov-id` attributes to JSX elements for development debugging. Skips Fragment elements.

---

## 🌐 Environment Variables

### Firebase (Client)
- `NEXT_PUBLIC_FIREBASE_APIKEY`
- `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECTID`
- `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID`
- `NEXT_PUBLIC_FIREBASE_APPID`

### Database
- `MONGODB_URI` (MongoDB Atlas connection string)

### Cloudinary
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Firebase Admin SDK
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

---

## 📝 State Management.

### Context Providers
1. **AuthContext** (`Provider/AuthProvider.jsx`)
   - User state
   - Loading state
   - Methods: createUser, signIn, logOut, updateUser, handleGoogleSignIn, handleAppleSignIn, passwordReset, verifyEmail

2. **WishlistContext** (`src/context/WishlistContext.jsx`)
   - Wishlist array (localStorage synced)
   - Methods: toggleWishlist, isInWishlist

---

## 🎯 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Homepage with all sections |
| `/login` | LoginPage | User login |
| `/register` | RegisterPage | User registration |
| `/brands` | BrandsGrid | All brands listing |
| `/brand/[slug]` | BrandPage | Single brand products |
| `/category/[slug]` | CategoryPage | Category/Subcategory listing |
| `/product/[id]` | ProductDetail | Product detail page |
| `/trending` | TrendingPage | Trending products with filters |
| `/wishlist` | WishlistPage | User's wishlist |
| `/about` | AboutPage | About us |
| `/support` | SupportPage | Help center |

---

## 🚧 Pending/Upcoming Features

### Admin Panel (Completed & Integrated)
Full premium CRUD UI for the following modules:
- **Dashboard:** Real-time stats for products, orders, revenue, and sliders.
- **Products:** Create/Edit/Delete products with Cloudinary multi-image upload.
- **Sliders:** Hero section image management with 1920x800 auto-cropping.
- **Orders:** List all orders, view details, and update statuses.
- **Customers:** View registered users and their basic stats.
- **Analytics:** Revenue growth, order volume, and store performance overview.
- **Categories:** (Via Product Manager) Dynamic category/subcategory selection.

### E-commerce Features
- Shopping cart implementation
- Checkout flow
- Order tracking
- Payment gateway integration (bKash, Nagad, Cards)
- Review & rating system

---

## 📊 Database Schema (MongoDB)

### Collections
1. **user** — User accounts with roles (admin, user)
2. **product** — Full product catalog with multi-image support
3. **order** — Order history and status management
4. **category** — Dynamic categories and subcategories
5. **brand** — Brand management with logos
6. **slider** — Hero section slider management
7. **cart** — Persistent server-side shopping carts
8. **audit_logs** — Comprehensive user operation audit trail

### Connection (`src/lib/mongodb.js`)
- Uses `MongoClient` with TLS
- Development: Global client for hot reload
- Production: New client per request
- Database name: `ECOM`

---

## 🎨 UI Components Summary

### Layout Components
- `Navbar`: Sticky header with category dropdown, search, wishlist, cart
- `Footer`: Links, social icons, branding
- `Provider`: Context provider wrapper

### Marketing Components
- `Hero`: 5-slide carousel with animations
- `TrustBadges`: 3 trust indicators
- `Categories`: Draggable category carousel
- `FeaturedCategories`: 3 promotional cards
- `ExclusiveOffer`: Rotating promotional banners
- `Testimonials`: Customer reviews
- `Products`: Product grid (homepage)

### Functional Components
- `ProductDetail`: Full product view with gallery
- `CategoryPage`: Category listing with filters
- `TrendingPage`: Trending products with filters
- `WishlistPage`: Saved products
- `BrandsGrid`: Brand listing
- `LoginPage`, `RegisterPage`: Auth forms
- `AboutPage`, `SupportPage`: Content pages

---

## 🛠️ Development Commands

```bash
npm run dev    # Start development server (with webpack)
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Run ESLint
```

### Getting Started (from README)

This is a Next.js project bootstrapped with `create-next-app`.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 📌 Key Implementation Notes

1. **Image Optimization:** Next.js Image component with Unsplash & Cloudinary
2. **Animations:** Framer Motion for page transitions, hover effects, list animations
3. **Responsive Design:** Mobile-first with Tailwind breakpoints
4. **SEO:** Metadata in layout, semantic HTML
5. **Performance:** Lazy loading, static generation for product pages
6. **Accessibility:** ARIA labels, keyboard navigation, proper contrast

---

## 🔒 Security Considerations

1. **Environment Variables:** All sensitive data in `.env.local`
2. **Firebase Admin:** Server-side only initialization
3. **JWT Verification:** Token validation on protected routes
4. **Rate Limiting:** In-memory rate limiting (upgrade to Redis for production)
5. **Email Validation:** Regex validation on all email inputs
6. **CORS:** Next.js API route protection
7. **Cloudinary:** Server-side image upload to prevent API key exposure

---

## 🔒 Backend Security Standard

**Every API file in this project follows this identical security architecture:**

### Security Constants (per file)
```javascript
const MAX_IMAGE_SIZE_ADMIN = 100 * 1024 * 1024  // 100MB for admin/moderator
const MAX_IMAGE_SIZE_USER  = 5   * 1024 * 1024  // 5MB for regular users
const MAX_IMAGES_PER_UPLOAD = 15                 // Max images per upload batch
const MAX_REQUEST_BODY_SIZE = 100_000            // 100KB JSON body cap
const MAX_SEARCH_LENGTH = 100                    // Max search query chars
const MAX_FILENAME_LENGTH = 255
const MAX_DESCRIPTION_WORDS = 3000              // Word cap on product descriptions
const MAX_DESCRIPTION_IMAGES = 10              // Max inline images in description
```

### Security Layers Applied to Every Endpoint

| Layer | Implementation |
|-------|---------------|
| **Firebase Bearer Token Auth** | `verifyApiToken()` — mandatory on all write routes |
| **Role-Based Access Control** | `requireRole(user, ['admin'])` — guards all admin operations |
| **General Rate Limiting** | `checkRateLimit()` — 100 req / 15 min per IP |
| **Write Rate Limiting** | Separate in-memory store — 20-30 write req / 15 min |
| **Upload Rate Limiting** | IP-based upload tracker — 20-50 uploads / hour |
| **Input Sanitization** | All strings: trimmed, HTML-stripped, control-char removed, length-capped |
| **File Validation** | MIME type whitelist (JPEG/PNG/WebP), size limits enforced before upload |
| **Request Body Size Guard** | `content-length` header checked before `req.json()` |
| **Audit Logging** | Every write logged to `audit_logs` collection via `setImmediate` (non-blocking) |
| **Cloudinary Server-Side** | Upload only from server — API secret never exposed to client |
| **Old Image Cleanup** | Old Cloudinary images destroyed on update/delete |
| **Error Isolation** | Stack traces and details only returned in `development` env |
| **DDoS Prevention** | Combined: general rate limit + separate write and upload IP trackers |

### Shared Lib: `src/lib/cloudinary.js`
Centralised Cloudinary utility used by all APIs:
- `uploadImage(buffer, options)` — default folder: `ecom`
- `uploadMultipleImages(files, options)`
- `deleteImage(publicId)`
- `deleteMultipleImages(publicIds[])`
- `getOptimizedImageUrl(publicId, options)`
- `getThumbnailUrl(publicId, size)`

---

## 🌐 Backend API Routes

| Route | File | Auth | Description |
|-------|------|------|-------------|
| `/api/user` | `api/user/route.js` | Firebase | User CRUD + profile picture |
| `/api/product` | `api/product/route.js` | Firebase (admin write) | Product CRUD + multi-image upload |
| `/api/category` | `api/category/route.js` | Firebase (admin write) | Dynamic category & subcategory management |
| `/api/brand` | `api/brand/route.js` | Firebase (admin write) | Brand CRUD + logo upload |
| `/api/slider` | `api/slider/route.js` | Firebase (admin write) | Hero slider CRUD + image upload |
| `/api/orders` | `api/orders/route.js` | Firebase | Order placement & management |
| `/api/cart` | `api/cart/route.js` | Firebase | Persistent server-side cart |

### Category API (`/api/category`)
Dynamic category management — no hardcoded slugs or constants.
- `GET /api/category` — list all categories with subcategories (public)
- `POST /api/category` — create category `{ name }` or add subcategory `{ action: "add-subcategory", categoryId, subcategoryName }`
- `PUT /api/category` — rename category or subcategory
- `DELETE /api/category?id=<id>` — delete category (blocked if products reference it, unless `?force=true`)
- `DELETE /api/category?id=<id>&subcategoryId=<id>` — delete a single subcategory

### Product API (`/api/product`)
- Products reference category/subcategory/brand as plain text strings (from admin's dynamic categories).
- **Core Fields:** `name`, `description`, `category`, `subcategory`, `brand`, `sku`, `condition` (new/refurbished/used), `status` (active/draft/archived).
- **Stock:** `stockQty`, `stock` (in_stock/out_of_stock/limited), `inventory` tracking rules.
- **Pricing:** `price` (regular price), `originalPrice` (cost per item), `discount` (sale price).
- **Extras:** `features` (array), `specifications` (key-value), `customFields` (key-value).
- **Flags:** `isFeatured`, `isTrending`.
- **Note:** `barcode`, `region`, `storage`, and `tags` were explicitly removed from the API as of version 0.2.1.
- Images uploaded separately via `PUT /api/product?action=upload-images` (to Cloudinary).
- Full text search, filters: category, subcategory, brand, price range, isFeatured, isTrending, status.

### Brand API (`/api/brand`)
- Brand logos uploaded to Cloudinary (`ecom/brands/`)
- Deletion blocked if any active products reference the brand (unless `?force=true`)

### Slider API (`/api/slider`)
- Images uploaded to Cloudinary (`ecom/sliders/`) at 1920×800
- Full CRUD with image replacement support, draggable reordering (`action="reorder"`)

### Orders API (`/api/orders`)
- **Total always calculated server-side** — client-provided total is ignored
- Users can only see/cancel their own orders; admins see all
- Status workflow: `pending → confirmed → processing → shipped → delivered`

### Cart API (`/api/cart`)
- Cart persisted per user in MongoDB `carts` collection
- Total recalculated server-side on every `GET`
- `POST` — adds quantity; `PUT` — sets exact quantity (0 = remove); `DELETE ?clearAll=true` — empties cart

---

## 📈 Future Enhancements

1. **Admin Dashboard:** Full CRUD UI for products, orders, users
2. **Real-time Inventory:** Stock management system
3. **Analytics Dashboard:** Sales, user behavior
4. **Email Notifications:** Order confirmations, password reset
5. **Multi-vendor Support:** Vendor dashboards
6. **Blog/Content:** SEO content management
7. **PWA:** Offline support, push notifications
8. **Internationalization:** Multi-language support

---

*Last Updated: March 3, 2026*  
*Project Status: Backend Core + Admin Frontend Integrated (v0.2.0)*

