# SGSS Portal - Medical Fund Management System

A comprehensive medical fund management system built with React, TypeScript, and Supabase for managing members, claims, and reimbursements.

## 🚀 Features

### Member Management

- **User Roles**: Member, Claims Officer, Approver, Trustee, Admin
- **Membership Types**: Life, Patron, Vice Patron, Family, Joint, Single
- **Profile Management**: NHIF integration, photo uploads, membership validation

### Claims Processing

- **Multiple Claim Types**: Outpatient, Inpatient, Chronic illness
- **Status Tracking**: Draft → Submitted → Processed → Approved → Paid
- **Reimbursement Calculator**: Automated calculation based on fund bylaws
- **File Uploads**: Receipt and document management

### Administration

- **Role-Based Access Control**: Protected routes and permissions
- **Settings Management**: Reimbursement scales and procedure tiers
- **Reports & Analytics**: Comprehensive reporting dashboard
- **Audit Logging**: Complete activity tracking

### Technical Features

- **Real-time Updates**: Supabase real-time subscriptions
- **PDF Generation**: Claims and reports export
- **Responsive Design**: Mobile-friendly interface
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React icons
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand, React Hook Form
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast
- **PDF Generation**: jsPDF with AutoTable
- **Data Validation**: Zod schemas

## 📋 Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Jabrahamjohn/Sgssportal.git
cd Sgssportal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

```bash
# Initialize Supabase (if using local development)
npx supabase init

# Apply database migrations
npx supabase db push

# Run database reset with seed data
npx supabase db reset
```

### 5. Start Development Server

```bash
# For local development
npm run dev.local

# For cloud/production mode
npm run dev.cloud
```

The application will be available at `http://localhost:5173`

## 🗄️ Database Schema

### Core Tables

- **users**: User authentication and profile data
- **roles**: System roles (member, claims_officer, approver, trustee, admin)
- **membership_types**: Different membership categories and fees
- **members**: Member profiles with NHIF numbers and validity periods
- **claims**: Medical claims with status tracking
- **claim_items**: Individual items within claims
- **chronic_requests**: Chronic illness medication requests
- **settings**: Configurable reimbursement rules and limits

### Key Features

- **Row Level Security (RLS)**: Secure data access based on user roles
- **Audit Logging**: Complete activity tracking
- **Real-time Subscriptions**: Live updates across the application

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── claims/         # Claims management components
│   ├── layout/         # Layout components (Header, Sidebar)
│   ├── members/        # Member management components
│   ├── system/         # System components
│   └── ui/             # Base UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── admin/          # Admin dashboard and management
│   ├── auth/           # Login and authentication
│   ├── claims/         # Claims processing pages
│   ├── dashboard/      # Main dashboard
│   └── members/        # Member management pages
├── services/           # API and business logic
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔧 Available Scripts

- `npm run dev.local` - Start development server in local mode
- `npm run dev.cloud` - Start development server in cloud mode
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔐 User Roles & Permissions

### Member

- View personal profile and claims
- Submit new claims
- View claim history

### Claims Officer

- Process submitted claims
- Update claim statuses
- Manage claim documentation

### Approver

- Approve processed claims
- Review high-value claims
- Generate approval reports

### Trustee

- Access financial reports
- View system analytics
- Approve policy changes

### Admin

- Full system access
- User management
- System configuration
- Complete reporting suite

## 💰 Reimbursement System

### Procedure Tiers

- **Minor**: ₦30,000 limit
- **Medium**: ₦35,000 limit
- **Major**: ₦50,000 limit
- **Regional**: ₦90,000 limit
- **Special**: ₦70,000 limit

### General Limits

- **Annual Limit**: ₦250,000 per member
- **Critical Care Add-on**: ₦200,000 additional
- **Clinic Fund Share**: 100% coverage
- **External Fund Share**: 80% coverage

## 🔄 Claim Workflow

1. **Draft**: Member creates and saves claim
2. **Submitted**: Member submits claim for processing
3. **Processed**: Claims officer reviews and calculates reimbursement
4. **Approved**: Approver validates the processed claim
5. **Paid**: Finance processes payment

## 📊 Reports & Analytics

- Member enrollment statistics
- Claims processing metrics
- Financial summaries
- Reimbursement trends
- System usage analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- Email: support@sgssportal.com
- Documentation: [Wiki](https://github.com/Jabrahamjohn/Sgssportal/wiki)
- Issues: [GitHub Issues](https://github.com/Jabrahamjohn/Sgssportal/issues)

## 🚀 Deployment

### Production Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables on your hosting platform
4. Ensure Supabase project is properly configured

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Supabase (fully managed)
- **Domain**: Custom domain with SSL certificate

---

Built with ❤️ for the SGSS Medical Fund community
