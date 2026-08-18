# 🎯 Focus - Quotes Application

Full-stack application for managing and browsing inspirational quotes with admin panel, REST API and mobile application.

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Applications](#-applications)
- [Documentation](#-documentation)
- [Available Scripts](#-available-scripts)

---

## 🌟 Overview

**Focus** is a complete platform for inspirational quotes including:

- 🖥️ **Admin Panel** - Web interface to manage quotes, topics and users
- 🔌 **REST API** - NestJS backend with JWT authentication and PostgreSQL database (Supabase)
- 📱 **Mobile App** - React Native/Expo application with infinite scroll and i18n (10 languages)

### Main Features

- ✅ Complete CRUD for quotes and topics
- ✅ JWT authentication with roles (admin/user)
- ✅ Internationalization (FR, EN, ES, AR, DE, IT, ZH, NL, RU, TR with RTL support)
- ✅ **Automatic translation** of quotes and topics (DeepL / MyMemory)
- ✅ Cross-platform icon system (Lucide + Ionicons)
- ✅ State management with Redux Toolkit + React Query
- ✅ Modular architecture with BaseEntity (UUIDs)
- ✅ Infinite scroll and pagination
- ✅ Light/dark/system theme
- ✅ **Custom visual themes** with fonts
- ✅ Like/Unlike quotes
- ✅ Filtering by topics
- ✅ **Subscription system** (RevenueCat + Stripe)
- ✅ **Manual subscription assignment** (Admin)
- ✅ **Promo codes system** (Admin + Mobile)
- ✅ **Custom push notifications**
- ✅ **iOS/Android widgets**
- ✅ **Quote sharing** as image

---

## 🏗️ Architecture

```
Focus_project/
├── apps/
│   ├── admin/          # Admin panel (Next.js 15)
│   ├── api/            # REST API (NestJS)
│   └── mobile/         # Mobile app (React Native + Expo)
├── packages/
│   ├── eslint-config/  # Shared ESLint configuration
│   ├── typescript-config/ # Shared TypeScript configuration
│   └── ui/             # Shared UI components
└── docs/               # Documentation
```

### API Architecture (BaseEntity Pattern)

All entities inherit from `BaseEntity`:

```typescript
abstract class BaseEntity {
  id: string; // UUID
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-updated
  deletedAt: Date; // Soft delete
}
```

**Main entities**: `Topic`, `Quote`, `User`, `Subscription`, `SubscriptionPlan`, `PromoCode`

### Mobile Architecture (Redux + React Query)

- **Redux Toolkit**: Global state (auth, theme)
- **React Query**: Server state with automatic cache
- **i18next**: Internationalization (FR, EN, ES, AR)

---

## 🛠️ Technologies

### Frontend (Admin Panel)

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Radix UI** (composants accessibles)
- **Lucide Icons**
- **i18n** (FR/EN)

### Backend (API)

- **NestJS 10**
- **TypeORM**
- **PostgreSQL** (Supabase)
- **Passport JWT**
- **bcrypt**
- **class-validator**
- **Stripe** (paiements web)
- **RevenueCat** (paiements mobile)
- **DeepL / MyMemory** (traduction)
- **Cloudinary** (images)

### Mobile

- **React Native**
- **Expo SDK 54**
- **TypeScript**
- **Redux Toolkit**
- **React Query (TanStack)**
- **React Navigation**
- **i18next** (10 langues)
- **Ionicons**
- **Expo Notifications**
- **RevenueCat SDK** (abonnements)
- **react-native-android-widget** / **@bacons/apple-targets** (widgets)

### DevOps

- **Turborepo** (monorepo)
- **ESLint**
- **Prettier**
- **Vercel** (déploiement admin)
- **EAS Build** (builds mobile)

---

## 📦 Installation

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git**

### Global Installation

```bash
# Clone the repository
git clone <repository-url>
cd Focus_project

# Install all dependencies
npm install
```

---

## 🚀 Quick Start

### 1. Start the API

```bash
# From root
npm run dev:api

# Or from apps/api
cd apps/api
npm run start:dev
```

API will be available at `http://localhost:3001`

### 2. Initialize the Database

```bash
cd apps/api

# Reset DB (optional)
./reset-database.sh

# Seed topics
node seed-topics.js
```

### 3. Start the Admin Panel

```bash
# From root
npm run dev:admin

# Or from apps/admin
cd apps/admin
npm run dev
```

Panel will be available at `http://localhost:3000`

**Default admin account**:

- Email: `admin@focus.com`
- Password: `admin123`

### 4. Start the Mobile App

```bash
# From root
npm run dev:mobile

# Or from apps/mobile
cd apps/mobile
npm start
```

Scan the QR code with **Expo Go** or press:

- `i` for iOS Simulator
- `a` for Android Emulator
- `w` for Web

---

## 📱 Applications

### 🖥️ Admin Panel (`apps/admin`)

Web interface to manage content.

**Features**:

- Dashboard with statistics (users, revenue, subscriptions)
- CRUD Topics (name, title, description, icon, color, premium)
- CRUD Quotes (text, author, topic)
- User and subscription management
- **Manual subscription assignment** (with password verification)
- **Promo codes management** (creation, list, details, users)
- Visual themes and fonts management
- Subscription plans management
- Payment history (Stripe + RevenueCat)
- Image upload (Cloudinary)
- JWT authentication
- i18n (FR/EN)

**URL**: `http://localhost:3000`

### 🔌 API (`apps/api`)

NestJS backend with modular architecture.

**Main endpoints**:

- `POST /auth/login` - Authentication
- `POST /auth/register` - Registration
- `POST /auth/forgot-password` - Send a 6-digit reset code by email (`{ email, locale? }`)
- `POST /auth/reset-password` - Set a new password (`{ email, code, newPassword }`)
- `GET /quotes` - List quotes (pagination)
- `GET /quotes/:id` - Quote by ID
- `POST /quotes/:id/like` - Like a quote
- `GET /topics` - List topics
- `GET /topics/:id` - Topic by ID
- `POST /subscriptions/checkout` - Create Stripe session
- `POST /subscriptions/webhook/revenuecat` - RevenueCat webhook
- `POST /subscriptions/sync-revenuecat` - Sync entitlements
- `POST /subscriptions/apply-promo-code` - Apply promo code
- `POST /subscriptions/users/:userId/assign-subscription` - Manual assignment (admin)
- `GET /subscriptions/plans` - List plans
- `POST /subscriptions/promo-codes` - Create promo code (admin)
- `GET /subscriptions/promo-codes` - List promo codes (admin)
- `POST /translations/translate` - Translate text

**URL**: `http://localhost:3001`
**Documentation**: See `apps/api/README.md`

### 📱 Mobile App (`apps/mobile`)

React Native application with Expo.

**Features**:

- Infinite scroll quotes
- Pull-to-refresh
- Like/Unlike and favorites
- Filter by topics
- Authentication
- User profile with statistics
- Settings (language, theme, mode)
- **Automatic translation** of quotes and topics
- **Custom visual themes** with fonts
- **Push notifications** configurable (hours, days)
- **Widgets** iOS and Android
- **Share** quotes as image
- **Premium subscription** via RevenueCat (iOS/Android)
- **Promo codes** for free premium access
- Automatic subscription synchronization
- i18n (FR, EN, ES, AR, DE, IT, ZH, NL, RU, TR)

**Technologies**:

- Redux Toolkit (state management)
- React Query (server state)
- RevenueCat SDK (subscriptions)
- React Navigation (navigation)
- i18next (internationalization)
- Expo Notifications (push)
- Expo Sharing (sharing)

---

## 📚 Documentation

### Main Documentation

- **[ARCHITECTURE_IMPROVEMENTS.md](./ARCHITECTURE_IMPROVEMENTS.md)** - Architecture improvements (BaseEntity, Redux, React Query)
- **[ICONS_SYSTEM.md](./ICONS_SYSTEM.md)** - Cross-platform icon system
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing guide

### App-specific Documentation

- **[apps/mobile/MIGRATION_GUIDE.md](./apps/mobile/MIGRATION_GUIDE.md)** - Migration Context → Redux + React Query
- **[apps/mobile/I18N_IMPLEMENTATION.md](./apps/mobile/I18N_IMPLEMENTATION.md)** - i18n implementation
- **[apps/api/MIGRATION_UUID.md](./apps/api/MIGRATION_UUID.md)** - Migration to UUIDs

## 🔧 Troubleshooting

### Admin Password Error (401 Unauthorized)

If you encounter `Invalid admin password` error during manual subscription assignment:

**Cause**: The provided password doesn't match the bcrypt hash stored in database.

**Solutions**:

1. **Test admin dashboard login**:
   - URL: `http://localhost:3000/login`
   - Credentials: `admin@focus.com` / `admin123`
   - If login fails → Reset password

2. **Reset via seed script**:
   ```bash
   cd apps/api
   npm run db:seed:admin
   ```
   New credentials: `admin@focus.com` / `admin123`

3. **Reset via SQL**:
   ```bash
   # Generate bcrypt hash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword', 10, (err, hash) => console.log(hash));"

   # Update in database (Supabase SQL Editor)
   UPDATE "user"
   SET password = 'GENERATED_HASH_ABOVE'
   WHERE email = 'admin@focus.com' AND "isAdmin" = true;
   ```

**Note**: Manual subscription assignment requires admin password to secure this sensitive action.

### Password Reset Emails Never Arrive

**Cause**: Render blocks the SMTP ports (25, 465, 587) on free instances. The
symptom is not an error but a two-minute connection timeout per message —
nothing looks misconfigured, the mail simply never leaves.

**Solution**: send over Brevo's HTTP API (port 443), which no host blocks. Set
on the API service:

```
BREVO_API_KEY=xkeysib-...
MAIL_FROM=Focus <noreply@your-domain.com>
```

`MAIL_FROM` must be an address **verified** in Brevo (Senders & IP), otherwise
the API answers `sender not valid`. SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASSWORD`) remains supported as a fallback wherever the ports are open,
and is ignored as soon as `BREVO_API_KEY` is present.

**Check which path is active**: `GET /health` reports `services.mail` with
`provider: "brevo" | "smtp" | "none"`. With `none`, the API does not crash — the
reset code is written to the logs and nothing is sent.

**Rate limit**: 3 reset requests per email per 15 minutes; beyond that the
endpoint answers `429`.

### Keep-Alive Polling

To avoid API cold starts (free hosting), the system implements automatic polling:

- **Mobile**: Ping `/health` every 60 seconds
- **Admin**: Ping `/health/stats` every 60 seconds + auto-refresh dashboard

**Configuration**: Services configured in `apps/mobile/App.tsx` and `apps/admin/src/app/dashboard/page.tsx`

### Subscription Synchronization

Mobile app automatically checks subscription expiration:

- **Interval**: Every 5 minutes in background
- **On foreground**: Immediate check when app returns
- **Action**: Automatically switches to "free tier" if subscription expired

**File**: `apps/mobile/src/services/subscriptionSyncService.ts`

### Invisible Skeleton Loading

If users report a "white screen" during loading:

**Cause**: Skeletons have too low opacity (8%) and are barely visible.

**Solution**: Skeletons have been improved with:
- Opacity increased to 15% (+87% visibility)
- More pronounced pulse animation (50-90% instead of 30-70%)
- Shadows added for depth
- Increased heights and spacing

**File**: `apps/mobile/src/components/LoadingSkeleton.tsx`

### Comment Cleanup

**Standard to follow**:

✅ **Keep**:
- Public API documentation (JSDoc)
- Complex logic explanation
- Security notes and important TODOs
- Technical references (links to docs)

❌ **Remove**:
- Obvious comments (`// Get user`)
- Redundant comments (function name = comment)
- Commented code (dead code)
- Useless separators (`// ========`)

**Method**: Clean progressively when modifying existing files. Don't automate to avoid bugs.

---

## 🔧 Available Scripts

### Global Scripts (from root)

```bash
# Development
npm run dev              # Start all apps
npm run dev:admin        # Start admin only
npm run dev:api          # Start API only
npm run dev:mobile       # Start mobile only

# Build
npm run build            # Build all apps
npm run build:admin      # Build admin
npm run build:api        # Build API

# Linting
npm run lint             # Lint all apps
```

### API Scripts (`apps/api`)

```bash
npm run start:dev        # Development mode (watch)
npm run start:prod       # Production mode
npm run build            # Compile TypeScript
npm test                 # Unit tests
npm run test:e2e         # E2E tests
```

### Admin Scripts (`apps/admin`)

```bash
npm run dev              # Development mode
npm run build            # Production build
npm run start            # Start in production
npm run lint             # Lint code
```

### Mobile Scripts (`apps/mobile`)

```bash
npm start                # Start Expo
npm run android          # Open on Android
npm run ios              # Open on iOS
npm run web              # Open on Web
```

---

## 🌍 Internationalization

### Supported Languages

- 🇫🇷 **Français** (fr) - Source language
- 🇬🇧 **English** (en)
- 🇪🇸 **Español** (es)
- 🇸🇦 **العربية** (ar) - with RTL support
- 🇩🇪 **Deutsch** (de)
- 🇮🇹 **Italiano** (it)
- 🇨🇳 **中文** (zh)
- 🇳🇱 **Nederlands** (nl)
- 🇷🇺 **Русский** (ru)
- 🇹🇷 **Türkçe** (tr)

### Automatic Translation

The app has an **automatic translation** feature for quotes and topics:

- Enable in **Settings → Automatic translation**
- Uses **DeepL API** (primary) and **MyMemory** (fallback)
- Local cache to avoid repeated API calls
- Automatically translates from French to selected language

### Change Language

**Mobile**: Settings → Language → Select language
**Admin**: Language selector in header

---

## 🎨 Themes and Customization

### Display Mode

Mobile app supports 3 modes:

- ☀️ **Light** - Light theme
- 🌙 **Dark** - Dark theme
- 🔄 **System** - Follow system theme

### Visual Themes

The app offers **custom visual themes**:

- Wallpapers with images
- Custom fonts per theme
- Manageable from admin panel

---

## 🔐 Authentication

### Default Accounts

**Admin**:

- Email: `admin@focus.com`
- Password: `admin123`

**User**:

- Email: `user@focus.com`
- Password: `user123`

### JWT

JWT tokens are stored in:

- **Admin**: `localStorage`
- **Mobile**: `AsyncStorage`

Validity duration: **7 days**

---

## 💳 Subscription System

The app integrates a premium subscription system via **RevenueCat** (mobile) and **Stripe** (web):

### Available Plans

- Monthly and annual plans configurable from admin
- Free trial period (freemium)
- **Promo codes** for temporary premium access

### Premium Features

- Access to premium topics
- Custom push notifications
- Exclusive visual themes
- Unlimited automatic translation

### Manual Assignment (Admin)

Administrators can:
- Manually assign a subscription to a user
- Requires admin password confirmation
- Visible in admin interface under each user profile

### Promo Codes System

**Admin:**
- Create promo codes with custom duration (e.g., 7, 30, 90 days)
- View list of users who used each code
- Track usage count

**Mobile User:**
- Enter promo code during registration
- Automatic premium application for defined duration
- One promo code per account

### Configuration

Required environment variables:

```env
# Stripe (web payments)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# RevenueCat (mobile payments)
REVENUECAT_API_KEY=...
REVENUECAT_WEBHOOK_SECRET=...
```

See [docs/SUBSCRIPTIONS_SETUP.md](./docs/SUBSCRIPTIONS_SETUP.md) for more details.

---

## 🤝 Contribution

1. Fork the project
2. Create a branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under MIT.

---

## 👥 Authors

- **Cédric Karungu** - Lead Developer

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Backend framework
- [Next.js](https://nextjs.org/) - React framework
- [Expo](https://expo.dev/) - React Native platform
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Turborepo](https://turbo.build/) - Monorepo tool
- [Stripe](https://stripe.com/) - Web payments
- [RevenueCat](https://www.revenuecat.com/) - Mobile payments
- [DeepL](https://www.deepl.com/) - Automatic translation
- [Supabase](https://supabase.com/) - PostgreSQL database
- [Cloudinary](https://cloudinary.com/) - Image management
