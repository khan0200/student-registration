# Student Registration System - UniApp

A modern, elegant student registration system built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL. Features an Apple-inspired design with beautiful UI components and smooth animations.

## Features

✨ **Modern UI/UX**
- Apple-inspired design with elegant rounded corners
- Smooth animations and transitions
- Responsive layout that works on all devices
- Beautiful gradient backgrounds and shadows
- Dark mode support with seamless transitions

🎯 **Core Functionality**
- Comprehensive student registration with full profile management
- Individual field editing with real-time updates
- Advanced search and filtering capabilities
- Pagination with smart page numbering
- Student status management (pending, registered, approved)
- Copy-to-clipboard functionality with animations
- Contextual notifications for user feedback

🛠 **Tech Stack**
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with PostgreSQL integration
- **Database**: PostgreSQL with comprehensive student schema
- **Styling**: Tailwind CSS with custom Apple-style components
- **Architecture**: Server-side rendering with client-side interactivity

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18 or higher)
- PostgreSQL (running locally or remotely)
- npm or yarn package manager

## Database Setup

1. **Connect to PostgreSQL** using your preferred method (pgAdmin, psql, etc.)
2. **Create the database** (if not already created):
   ```sql
   CREATE DATABASE uniapp;
   ```
3. **Run the database setup script**:
   ```bash
   # Using psql command line
   psql -U postgres -d uniapp -f database-setup.sql
   ```
4. **Run the migration script** to add all comprehensive fields:
   ```bash
   psql -U postgres -d uniapp -f database-migration.sql
   ```

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   Create a `.env.local` file with your PostgreSQL configuration:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_HOST=localhost
   POSTGRES_DB=uniapp
   POSTGRES_PASSWORD=your_password
   POSTGRES_PORT=5432
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   - Registration Form: http://localhost:3000
   - Registered Students: http://localhost:3000/students

## Project Structure

```
student-registration/
├── src/
│   ├── app/
│   │   ├── api/students/
│   │   │   ├── route.ts              # Main student API endpoints
│   │   │   └── [id]/route.ts         # Individual student operations
│   │   ├── students/
│   │   │   ├── page.tsx              # Students list with pagination
│   │   │   └── [id]/page.tsx         # Individual student detail view
│   │   ├── components/
│   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   ├── MainContent.tsx       # Main content wrapper
│   │   │   └── DarkModeProvider.tsx  # Dark mode context
│   │   ├── page.tsx                  # Registration form page
│   │   ├── layout.tsx                # Root layout with providers
│   │   └── globals.css               # Global styles
│   └── lib/
│       └── db.ts                     # PostgreSQL connection utility
├── database-setup.sql                # Initial database schema
├── database-migration.sql            # Comprehensive schema migration
└── README.md                         # This file
```

## API Endpoints

### POST /api/students
Register a new student with comprehensive profile data
```json
{
  "lastName": "ABDURAZZAQOV",
  "firstName": "JASURBEK", 
  "middleName": "MUHAMMAD",
  "email": "student@example.com",
  "educationLevel": "BACHELOR",
  "passportNumber": "AB1234567",
  "birthDate": "2000-01-01",
  "phone1": "91-123-45-67",
  "phone2": "93-765-43-21",
  "address": "Tashkent city, Mustaqillik street 123",
  "languageCertificate": "IELTS-6.5",
  "tariff": "PREMIUM",
  "university1": "KAIST",
  "university2": "Seoul National University (SNU)",
  "hearAboutUs": "INSTAGRAM",
  "additionalNotes": "Excellent academic background"
}
```

### GET /api/students
Get all registered students with pagination support
```json
{
  "students": [
    {
      "id": 1,
      "student_id": "BS1",
      "full_name": "ABDURAZZAQOV JASURBEK MUHAMMAD",
      "email": "student@example.com",
      "education_level": "BACHELOR",
      "status": "pending",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### GET /api/students/[id]
Get individual student details

### PUT /api/students/[id]
Update specific student field
```json
{
  "field": "status",
  "value": "approved"
}
```

### DELETE /api/students/[id]
Delete a student record

## Design Philosophy

This application follows Apple's design principles:
- **Simplicity**: Clean, uncluttered interface with intuitive navigation
- **Elegance**: Rounded corners, subtle shadows, and smooth animations
- **Accessibility**: Clear typography and proper contrast ratios
- **Responsiveness**: Adapts beautifully to all screen sizes
- **Consistency**: Unified design language throughout the application

## Database Schema

The PostgreSQL database includes comprehensive student information:
- **Personal Data**: Names, passport, birth date, contact information
- **Academic Info**: Education level, language certificates, universities
- **System Data**: Student ID, status, tariffs, timestamps
- **Additional**: Notes, referral source, addresses

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features

### Student Management
- ✅ Comprehensive registration with 20+ fields
- ✅ Individual field editing with real-time validation
- ✅ Status management (pending → registered → approved)
- ✅ Copy-to-clipboard with visual feedback
- ✅ Smart search across names, emails, and student IDs

### User Experience  
- ✅ Pagination with smart ellipsis (max 15 students per page)
- ✅ Filter by education level (College, Bachelor, Masters)
- ✅ Dark mode with smooth transitions
- ✅ Fixed sidebar navigation
- ✅ Contextual notifications
- ✅ Apple-style animations and micro-interactions

### Technical Excellence
- ✅ PostgreSQL with proper indexing and constraints
- ✅ TypeScript for type safety
- ✅ Server-side rendering with Next.js App Router
- ✅ Responsive design with Tailwind CSS
- ✅ Error handling and loading states
- ✅ CRUD operations with data validation

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Verify database credentials in `.env.local`
3. Check if the `uniapp` database exists
4. Ensure all tables are created with proper schema

### Common Issues
- **Port 3000 already in use**: Change the port with `npm run dev -- -p 3001`
- **Database connection error**: Verify PostgreSQL is running and credentials are correct
- **Module not found errors**: Run `npm install` to ensure all dependencies are installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with comprehensive tests
4. Test thoroughly across different screen sizes
5. Submit a pull request with detailed description

## License

This project is open source and available under the MIT License.

---

**Built with ❤️ using Next.js, PostgreSQL, and modern web technologies.**
