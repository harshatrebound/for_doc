Okay, let's create a more detailed and solid plan to complete the CMS functionality in `/admin/content`, incorporating the different page types (Bone & Joint School, Procedures, Blog Posts) and the Gallery management requirement.

**Core Goal:** Build a functional CMS within the `/admin` section allowing users to Create, Read, Update, and Delete content for the three defined page types and manage a separate image gallery.

**Prerequisites (Must be done first):**

1. **Fix Database Connection:** The error message `Can't reach database server at shortline.proxy.rlwy.net:18910` indicates the fundamental issue.
   * **Action:** Verify the `DATABASE_URL` environment variable in your `.env` file (for local development) and your deployment environment (Railway, Vercel, etc.) is correct and points to an active, accessible database.
   * **Action:** Ensure the database service itself is running.
   * **Action:** Run `npx prisma generate` after confirming the connection string to ensure the Prisma client is up-to-date.
   * **Verification:** Test a simple database query (e.g., using `npx prisma studio` or a simple script) to confirm connectivity before proceeding.

**Development Plan:**

**Phase 1: Foundational API Implementation (Content Pages)**

* **Goal:** Create the backend API endpoints required for basic page management across *all* types.
* **Tasks:**
  1. **Category API (`src/app/api/admin/categories/route.ts`):**
     * Implement `GET`: Fetches all categories from the `Category` model. (Needed for dropdowns).
  2. **Content List API (`src/app/api/admin/content/route.ts`):**
     * Implement `GET`: Fetches pages based on a `pageType` query parameter (e.g., `/api/admin/content?pageType=bone-joint-school`). Include category data. Order by `updatedAt` or `title`. (Replaces the specific `/api/admin/content/bone-joint-school` route).
     * Implement `POST`: Receives data for a *new* page (title, slug, pageType, categoryId, featuredImageUrl, contentBlocks array). Creates the `Page` record and associated `ContentBlock` records using Prisma transactions. Handle linking/creating categories if necessary.
  3. **Specific Content API (`src/app/api/admin/content/[id]/route.ts`):**
     * Implement `GET`: Fetches a single page by its `id`, including its `ContentBlocks` ordered by `sortOrder`.
     * Implement `PUT`: Updates an existing page's details (title, slug, etc.) and its `ContentBlocks` (handle adding/removing/updating blocks, potentially by deleting existing blocks and recreating based on the submitted array). Use Prisma transactions.
     * Implement `DELETE`: Deletes a page by its `id`. Ensure related `ContentBlocks` are also deleted (Prisma's `onDelete: Cascade` in the schema might handle this, but verify).

**Phase 2: Core UI Implementation (Bone & Joint School First)**

* **Goal:** Make the "Bone & Joint School" section fully functional (List, Add, Edit, Delete).
* **Tasks:**
  1. **Main Content Page (`/admin/content/page.tsx`):**
     * Modify `fetchPages` to call the new unified `GET /api/admin/content?pageType=bone-joint-school` endpoint.
     * Modify `fetchCategories` to call `GET /api/admin/categories`. Ensure the filter dropdown is populated and works.
     * Ensure the "Delete" button calls `DELETE /api/admin/content/[id]` and refreshes the list on success.
     * Update the "Add New Page" button link to point to a generic new page route or keep it specific for now: `/admin/content/bone-joint-school/new`.
     * Update the "Edit" button link to point to `/admin/content/bone-joint-school/edit/[id]`.
  2. **New Page Form (`/admin/content/bone-joint-school/new/page.tsx`):**
     * Ensure the form submission logic correctly calls the `POST /api/admin/content` endpoint with `pageType: 'bone-joint-school'`.
     * Ensure the category select dropdown is populated from the `GET /api/admin/categories` API.
  3. **Edit Page Form (`/admin/content/bone-joint-school/edit/[id]/page.tsx`):**
     * Create this component.
     * Fetch page data using `GET /api/admin/content/[id]` on load (using the `id` from the route parameters).
     * Populate the form (title, slug, image, category, content blocks) with fetched data. Reuse the form structure/components from `new/page.tsx`.
     * Implement form submission logic to call `PUT /api/admin/content/[id]` with the updated data.

**Phase 3: Expand UI for Other Page Types (Procedures, Blog Posts)**

* **Goal:** Enable management for "Procedures" and "Blog Posts".
* **Tasks:**
  1. **Main Content Page (`/admin/content/page.tsx`):**
     * Implement state/logic for the "Procedures" and "Blog Posts" tabs to fetch and display their respective pages using the unified API (`GET /api/admin/content?pageType=procedures`, etc.).
     * Decide on the "Add New Page" flow:
       * *Option A (Simple):* Add separate "Add Procedure" and "Add Blog Post" buttons.
       * *Option B (Flexible):* Change "Add New Page" to a dropdown or route to an intermediate page where the user selects the `pageType` before seeing the form.
  2. **Create New/Edit Forms:**
     * Create corresponding `new` and `edit` components for "Procedures" (e.g., `/admin/content/procedures/new/page.tsx`, `/admin/content/procedures/edit/[id]/page.tsx`).
     * Create corresponding `new` and `edit` components for "Blog Posts".
     * Customize these forms if these page types require different fields or initial block structures compared to "Bone & Joint School". Ensure they submit the correct `pageType` to the API.

**Phase 4: Image & Gallery Management**

* **Goal:** Allow uploading images for content pages and manage a separate gallery.
* **Tasks:**
  1. **Image Upload API (`src/app/api/admin/images/upload/route.ts` - example path):**
     * Implement `POST`: Handle file uploads (likely using `multipart/form-data`).
     * Save the uploaded file to a server location (e.g., `public/uploads/content/` or `public/uploads/gallery/`). Consider using a library like `multer` if needed, or Next.js API route body parsing capabilities.
     * Return the public URL of the saved image (e.g., `/uploads/content/image-name.jpg`).
  2. **Image List/Delete API (`src/app/api/admin/images/route.ts` & `[filename]/route.ts`):**
     * Implement `GET /api/admin/images`: List image files from the upload directory/directories.
     * Implement `DELETE /api/admin/images/[filename]`: Delete an image file from the server. **Caution:** Ensure proper security/validation.
  3. **Image Uploader Component (`@/components/admin/ImageUploader.tsx`):**
     * Ensure it correctly calls the `POST /api/admin/images/upload` endpoint and uses the returned URL.
  4. **Manage Images Page (`/admin/content/images/page.tsx`):**
     * Create this page.
     * Fetch the list of images using `GET /api/admin/images`.
     * Display images (thumbnails).
     * Implement delete functionality using `DELETE /api/admin/images/[filename]`.
  5. **Gallery Schema (Decide & Implement):**
     * Define how gallery images are stored. Recommended: A new `GalleryImage` model in `prisma/schema.prisma` with fields like `id`, `url`, `altText`, `caption`, `sortOrder`. Run `npx prisma migrate dev`.
  6. **Gallery API (`src/app/api/admin/gallery/route.ts` & `[id]/route.ts`):**
     * Implement `GET /gallery`: Fetch all `GalleryImage` records, ordered by `sortOrder`.
     * Implement `POST /gallery`: Can either receive an already uploaded image URL *or* handle file upload directly (similar to image upload API) and create the `GalleryImage` record.
     * Implement `PUT /gallery/[id]`: Update `altText`, `caption`, `sortOrder` for a gallery image.
     * Implement `DELETE /gallery/[id]`: Delete the `GalleryImage` record and potentially the associated image file.
  7. **Gallery Management Page (`/admin/gallery/page.tsx` - create this):**
     * Create a dedicated UI for managing the gallery.
     * Include an uploader calling the `POST /gallery` endpoint.
     * Display existing gallery images with options to edit details (alt, caption) and delete.
     * Implement drag-and-drop reordering (using a library like `react-beautiful-dnd`) that calls the `PUT` endpoint to update `sortOrder`.

**Phase 5: Enhancements & Refinements**

* **Goal:** Improve usability and add optional features.
* **Tasks:**
  1. **Content Block Editor:** Enhance the editor in `new`/`edit` forms to support more block types (lists, different heading levels, maybe quotes or simple embeds) based on the schema. Consider a more robust editor component if needed.
  2. **Category Management UI:** Create `/admin/categories/page.tsx` to allow adding/editing/deleting categories via API calls.
  3. **Template System (Optional):** If desired, implement a way to define page templates (predefined sets of content blocks) and allow users to select one when creating a new page.
  4. **Validation & Error Handling:** Improve input validation on forms and provide clearer user feedback (e.g., using `react-hot-toast` consistently) for API errors or success messages.
  5. **UI Polish:** Refine loading states, empty states, button states, and overall layout consistency.

This plan prioritizes getting the core functionality working before expanding to all page types and supporting features like image/gallery management. Remember to commit changes frequently after each logical step.
