# Overview

This is a **Hospitality Procurement Intelligence Platform** - a full-stack web application that provides data visualization, analytics, and actionable insights for procurement management in the hospitality industry. The application analyzes procurement data across multiple dimensions (daily, weekly, monthly, yearly) and identifies critical issues, inefficiencies, and opportunities for automation.

The platform features:
- Interactive data flow visualization with tunnel animations
- Multi-dimensional matrix grid (6 categories × 5 velocity classifications)
- Real-time problem identification and financial impact analysis
- File upload and processing for Excel/CSV procurement data
- Dual-mode operation: prototype (synthetic data) and live (user-uploaded data)
- Detailed insights dashboard with KPIs, trends, and actionable recommendations

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React 18+ with TypeScript, using Vite as the build tool and development server.

**UI Component System**: Built on shadcn/ui (Radix UI primitives) with extensive customization. The design system uses a dark theme with cyan/teal primary colors (#64ffda) and implements a "glassmorphism" aesthetic with backdrop blur effects.

**Styling Approach**: Tailwind CSS v4 with custom CSS variables for theming. The application uses a custom color palette defined in HSL format, with extensive use of CSS custom properties for dynamic theming. Font stack includes Inter (sans-serif), JetBrains Mono (monospace), and Rajdhani (display).

**State Management**: React Query (@tanstack/react-query) for server state management with custom query client configuration. Local state managed with React hooks.

**Routing**: Wouter for lightweight client-side routing (Dashboard and Roadmap pages).

**Animation System**: Framer Motion for complex animations, transitions, and page interactions. Custom CSS keyframes for particle effects and tunnel visualizations.

**Form Handling**: React Hook Form with Zod schema validation via @hookform/resolvers.

## Backend Architecture

**Server Framework**: Express.js with TypeScript, running in ESM mode.

**Development Setup**: Custom Vite middleware integration for hot module replacement during development. The server serves the Vite dev server in development mode and static files in production.

**File Upload Handling**: Multer middleware for multipart/form-data processing with 10MB file size limit and support for up to 20 files per request.

**Session Management**: Session-based file tracking using UUIDs. Files are associated with sessions for isolation and cleanup.

**Storage Layer**: Abstracted storage interface (`IStorage`) with in-memory implementation (`MemStorage`). The architecture supports swapping to database-backed storage without code changes. Currently stores:
- User data (username, password)
- Uploaded files (metadata + content as text)
- Analysis results (outliers, metrics, health scores)

**API Design**: RESTful endpoints under `/api` prefix:
- `POST /api/files/upload` - Multi-file upload with session association
- `GET /api/files/:sessionId` - Retrieve files for a session
- `DELETE /api/files/:id` - Remove individual file
- `POST /api/analyze/:sessionId` - Trigger analysis on uploaded files
- `GET /api/analysis/:sessionId` - Retrieve analysis results

## Data Processing Pipeline

**File Type Support**: Excel (.xlsx, .xls) and CSV files.

**Excel Processing**: Uses the `xlsx` library to read spreadsheets and extract tabular data. Handles Excel serial date conversion.

**CSV Processing**: PapaParse library with header auto-detection, dynamic typing, and empty line skipping.

**Multi-File Analysis**: Intelligent file type detection based on naming conventions:
- Vendor Master, PR (Purchase Requisition), PR Lines
- PO (Purchase Order), PO Lines
- Invoice, Invoice Lines
- GRN (Goods Receipt Note), GRN Lines

**Category Classification**: Heuristic keyword-based mapping for 6 procurement categories:
- Food & Beverages
- Housekeeping
- Maintenance
- Guest Utilities
- Marketing
- Utilities & Supplies

**Velocity Analysis**: Items classified into 5 velocity tiers (Fast-moving, Medium, Slow, Very-slow, Once-in-a-while) based on consumption patterns.

**Synthetic Data Generation**: Fallback data generator creates realistic procurement scenarios for each time period filter, enabling prototype mode operation without uploaded files.

## Database Schema (Drizzle ORM)

**ORM**: Drizzle ORM configured for PostgreSQL with schema-first approach.

**Tables**:
1. **users** - User authentication (id, username, password)
2. **uploaded_files** - File metadata and content storage (id, filename, originalName, fileType, fileSize, uploadedAt, content, sessionId)
3. **analysis_results** - Computed analytics (id, sessionId, analyzedAt, totalRecords, outliers, normal, delayed, healthScore, revenueImpact, avgDelayDays, monthlyWaste, and additional JSON fields for detailed breakdowns)

**Migration Strategy**: Schema defined in `shared/schema.ts`, migrations output to `./migrations` directory. Uses `drizzle-kit push` for schema synchronization.

**Database Connection**: Neon serverless PostgreSQL driver (@neondatabase/serverless) with connection URL from environment variable `DATABASE_URL`.

# External Dependencies

## Third-Party Services

**Database**: Neon Serverless PostgreSQL - cloud-hosted Postgres with serverless architecture.

**Development Platform**: Replit-specific plugins for cartographer, dev banner, and runtime error modal overlay.

## Key Libraries

**UI Components**: 
- Radix UI primitives (@radix-ui/*) - 25+ component packages
- Lucide React - Icon library
- cmdk - Command palette component

**Data Visualization**:
- Chart.js - Charts and graphs (via CDN in prototype HTML)
- date-fns - Date manipulation and formatting

**File Processing**:
- xlsx - Excel file reading/writing
- papaparse - CSV parsing

**Form & Validation**:
- react-hook-form - Form state management
- zod - Schema validation
- @hookform/resolvers - Integration layer

**Animation**:
- framer-motion - React animation library
- tw-animate-css - Tailwind animation utilities

**Utilities**:
- clsx & tailwind-merge - Conditional class name utilities
- class-variance-authority - Variant-based styling
- nanoid - Unique ID generation

## Build Tools

- **Vite** - Build tool and dev server
- **esbuild** - Server-side bundling for production
- **TypeScript** - Type checking (noEmit mode)
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing with autoprefixer