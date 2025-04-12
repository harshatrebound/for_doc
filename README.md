# Sports Orthopedics Website (Monkpress Base)

This project is the codebase for the Sports Orthopedics clinic website. It's built using Next.js and provides information about the clinic's services, allows users to learn about orthopedic conditions, and enables them to book appointments.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) 14 (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with `tailwindcss-animate` plugin
*   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) (likely, based on structure and dependencies like Radix UI)
*   **Database ORM:** [Prisma](https://www.prisma.io/) (likely, based on `prisma` directory and dependencies)
*   **Database:** [PostgreSQL](https://www.postgresql.org/) (implied by `pg` dependency)
*   **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/) (likely, based on dependency)
*   **Linting/Formatting:** ESLint (configured in `eslint.config.mjs`)

## Project Structure

```
.
├── .next/           # Next.js build output
├── docs/            # Documentation files (e.g., design plans, TODOs)
├── images_bone_joint/ # Static images for the site
├── node_modules/    # Project dependencies
├── old_templates/   # Older or unused template files
├── prisma/          # Prisma schema, migrations, and seed script
│   └── seed.ts      # Database seeding script
├── public/          # Static assets (images, fonts, etc.) accessible directly
├── scripts/         # Utility scripts (e.g., build scripts)
├── src/             # Main application source code
│   ├── app/         # Next.js App Router: Pages, API routes, layouts
│   │   ├── admin/     # Admin dashboard section
│   │   ├── api/       # API endpoint handlers
│   │   ├── blogs/     # Blog related pages
│   │   ├── bone-joint-school/ # Educational content pages per specialty
│   │   ├── contact/   # Contact page
│   │   ├── homepage/  # Components specific to the homepage
│   │   ├── layout.tsx # Root layout for the application
│   │   ├── page.tsx   # Root page component (might redirect or be simple)
│   │   └── ... (other page routes)
│   ├── components/  # Reusable UI components
│   │   ├── ui/        # Core UI elements (likely from Shadcn/ui)
│   │   ├── booking/   # Components related to the booking process
│   │   ├── layout/    # Layout components (Header, Footer)
│   │   └── ... (other specific component groups)
│   ├── contexts/    # React context providers
│   ├── data/        # Static data or data fetching utilities
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utility functions and helper modules (e.g., `utils.ts`)
│   ├── styles/      # Global styles or CSS modules
│   ├── types/       # TypeScript type definitions
│   └── middleware.ts# Next.js middleware for handling requests
├── .env.development # Development environment variables
├── .env.production  # Production environment variables
├── .env.template    # Template for environment variables
├── .gitignore       # Files/directories ignored by Git
├── next.config.js   # Next.js configuration
├── package.json     # Project dependencies and scripts
├── postcss.config.js# PostCSS configuration
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json    # TypeScript configuration
└── README.md        # This file
```

## Key Website Features

*   **Homepage:** Overview of services, specialties, trust indicators, and calls to action.
*   **Specialty Pages:** Detailed information about conditions treated (Knee, Shoulder, Ankle, Hip, Elbow, Wrist) under `/bone-joint-school/`.
*   **About Us:** Information about the clinic and its approach.
*   **FAQ Section:** Answers to common patient questions.
*   **Contact Page:** Contact form and clinic details.
*   **Booking System:** Interactive modal (`BookingModal.tsx`) for requesting consultations.
*   **Blog/Publications:** Sections for articles and publications (`/blogs/`, `/publications/`).
*   **Admin Dashboard:** (Likely) A section for managing appointments, content, or users (`/admin/`).

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (Version specified in `package.json` or latest LTS)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)
*   [PostgreSQL](https://www.postgresql.org/) database server running

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  **Set up environment variables:**
    *   Copy the `.env.template` file to a new file named `.env.development`.
    *   Fill in the required environment variables in `.env.development`, especially the `DATABASE_URL` for your local PostgreSQL instance. The format is typically: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
4.  **Set up the database:**
    *   Ensure your PostgreSQL server is running.
    *   Apply Prisma migrations (if any exist):
        ```bash
        npx prisma migrate dev
        ```
    *   Seed the database with initial data:
        ```bash
        npm run db:seed
        # or equivalent yarn/pnpm command
        ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (or the specified port) in your browser to see the application.

## Available Scripts

*   `npm run dev`: Starts the Next.js development server.
*   `npm run build`: Creates an optimized production build of the application.
*   `npm run start`: Starts the Next.js production server (requires `npm run build` first).
*   `npm run lint`: Runs ESLint to check for code style issues.
*   `npm run db:seed`: Executes the Prisma seed script (`prisma/seed.ts`) to populate the database.
*   `npx prisma migrate dev`: Applies database schema changes during development.
*   `npx prisma studio`: Opens the Prisma Studio GUI to view/edit database data.

## Environment Variables

Key environment variables are defined in `.env.template`. You'll need to create `.env.development` for local development and `.env.production` for deployment, filling in values for:

*   `DATABASE_URL`: Connection string for the PostgreSQL database.
*   `NEXTAUTH_URL`: The base URL of your application for NextAuth.
*   `NEXTAUTH_SECRET`: A secret key for NextAuth session encryption.
*   `(Other variables as defined in the template)`

Make sure these files are included in your `.gitignore` and never committed to version control.
