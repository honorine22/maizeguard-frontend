# MaizeGuard Rwanda

MaizeGuard Rwanda is a web-based maize quality screening product. A user uploads a maize image, the frontend sends the image to a deployed PyTorch model API, and the app returns a visible quality class, confidence score, risk level, and recommended post-harvest action.

The project focuses on helping farmers, cooperatives, aggregators, and quality-control teams make faster first-level decisions about maize batches before storage, aggregation, or sale.

## Submission Links

Deployed frontend:

```text
https://maizeguard-frontend.vercel.app/
```

Backend model API:

```text
https://honorineigiraneza-maizeguard-backend.hf.space/
```

5-minute demo video: https://youtu.be/0U93bL54p_g

```text
https://youtu.be/0U93bL54p_g
```

## Core Functionalities

- Upload maize images through a drag-and-drop or file-picker interface.
- Validate uploaded files before analysis, including image type and maximum file size.
- Send the original uploaded image directly to the Hugging Face backend model API.
- Display the predicted maize quality category.
- Display model confidence and class probability evidence.
- Show risk level and recommended action for the predicted result.
- Provide fallback messaging when the backend is unavailable or returns an unusable response.
- Save signed-in user assessment summaries with Supabase.
- Present separate dashboard pages for overview, prediction, and saved history.
- Present risk distribution, class mix, high-priority action queue, and decision-support summaries.
- Present project workflow, dataset sources, priority rules, and model evidence in the interface.

## Quality Classes

The application maps model predictions into four user-facing quality categories:

| Class | Meaning | Risk | Recommended action |
| --- | --- | --- | --- |
| Good | Clean maize grain with low visible risk | Low | Store safely or prepare for sale |
| Broken | Damaged or broken kernels | Medium | Sort before storage |
| Impurity | Foreign matter such as husks, dust, stones, or other contamination | Medium | Clean and re-screen |
| Mold risk | Visible mold-risk signs | High | Do not store; refer for checking |

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, custom CSS |
| Icons | Lucide React |
| User authentication | Supabase email magic-link sign-in |
| User result history | Supabase Postgres assessment summaries |
| Model API | FastAPI backend deployed on Hugging Face Spaces |
| Model stack | PyTorch model API |
| Deployment | Vercel frontend, Hugging Face Spaces backend |

## Related Project Files

| File or folder | Purpose |
| --- | --- |
| `app/page.tsx` | Public landing and upload workflow composition |
| `app/dashboard/page.tsx` | Dashboard overview with risk analytics and action queue |
| `app/dashboard/scan/page.tsx` | Dashboard prediction page for image upload and model screening |
| `app/dashboard/history/page.tsx` | Dashboard history page for saved Supabase assessments |
| `app/components/DashboardClient.tsx` | Dashboard shell with risk distribution, action queue, class mix, and assessment workspace |
| `app/lib/maizeguard.ts` | Typed MaizeGuard domain models, API URL helpers, response normalization, and display data |
| `app/lib/maizeguard.test.ts` | Unit tests for frontend/backend response helpers |
| `app/lib/supabaseClient.ts` | Supabase auth and row-level-secured saved result-history helpers |
| `app/components/AssessmentWorkspace.tsx` | Reusable upload, prediction, report, and recommendation workflow |
| `app/components/AssessmentWidgets.tsx` | Reusable result widgets such as confidence ring and report metric cards |
| `app/components/SupabaseAssessmentHistory.tsx` | Supabase sign-in panel and saved assessment history list |
| `app/components/SupabaseAuthButtons.tsx` | Navbar login/register links and sign-out button |
| `app/components/AuthPage.tsx` | Shared full-page login/register experience |
| `app/login/page.tsx` | Login page |
| `app/register/page.tsx` | Register page |
| `app/components/Navbar.tsx` | Reusable navigation component |
| `app/globals.css` | Global styles, theme variables, responsive visual design |
| `app/layout.tsx` | Root layout, metadata, fonts, favicon |
| `public/` | Static images and favicon used by the frontend |
| `supabase/assessments.sql` | Supabase table used for authenticated assessment history |
| `.env.example` | Example environment variable for the backend model API URL |
| `package.json` | Project scripts and dependencies |
| `tailwind.config.ts` | Tailwind theme configuration |
| `vercel.json` | Vercel project framework configuration |

## Installation And Local Run

### 1. Clone the repository

```bash
cd capstone-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the backend API URL

Create a local environment file:

```bash
cp .env.example .env.local
```

Set the model API base URL:

```text
NEXT_PUBLIC_MODEL_API_URL=https://honorineigiraneza-maizeguard-backend.hf.space
```

For local backend testing, use:

```text
NEXT_PUBLIC_MODEL_API_URL=http://127.0.0.1:8000
```

Do not use `http://0.0.0.0:8000` in the frontend. The backend may listen on `0.0.0.0`, but the browser should fetch `127.0.0.1` or `localhost`.

The frontend automatically sends uploads to:

```text
<NEXT_PUBLIC_MODEL_API_URL>/predict
```

Supabase is optional. To enable user sign-in and saved result history, create a Supabase project, enable email authentication, create the `assessments` table below, and set:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_JWKS_URL=
```

Create the history table by running the SQL in `supabase/assessments.sql` inside the Supabase SQL editor.

The frontend uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for passwordless auth and row-level-secured history records. Keep `SUPABASE_SECRET_KEY` server-side only; it is not used in browser code.
In Supabase Authentication settings, add your local and deployed frontend URLs as allowed redirect URLs so email magic links can return users to the app.

### 4. Start the development server

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

## Build And Production Run

Create a production build:

```bash
npm run build
```

Run the production server locally:

```bash
npm run start
```

Open:

```text
http://localhost:3000
```

## Automated Frontend Tests

Run the frontend unit tests:

```bash
npm test
```

Current local result:

```text
1 test file passed
5 tests passed
```

The tests cover the frontend/backend contract helpers: class label normalization, deployed API URL construction, unsupported-image label handling, and probability display ordering.

## Code Quality Notes

The frontend is split into page, component, and domain-helper modules:

- `app/page.tsx` keeps the public homepage small and composes the main sections.
- `app/dashboard/page.tsx`, `app/dashboard/scan/page.tsx`, and `app/dashboard/history/page.tsx` split the dashboard into real routes instead of hash-link sections.
- `app/components/DashboardClient.tsx` contains the shared dashboard shell and dashboard-specific summaries such as risk distribution, class mix, and the action queue.
- `app/components/AssessmentWorkspace.tsx` handles upload events and result display as a reusable workflow.
- `app/lib/maizeguard.ts` keeps model response types, class mappings, URL helpers, and result normalization helpers separate from JSX.
- `app/lib/supabaseClient.ts` isolates Supabase session handling and saved assessment calls.
- `app/components/AssessmentWidgets.tsx` contains reusable presentation widgets.
- `app/components/SupabaseAssessmentHistory.tsx` contains the authenticated history panel.
- `app/components/AuthPage.tsx` keeps login and registration as full pages instead of modal dialogs.
- `app/components/Navbar.tsx` contains navigation.

This keeps the main interface easier to maintain than a single monolithic page file.

## Supabase User Support

Supabase strengthens the product by showing how MaizeGuard can support returning users:

- Email magic-link authentication identifies the user without building a custom password system.
- Login and registration are full pages, not modal dialogs, so they are easier to demo and explain.
- Supabase Postgres saves each user's maize screening result summary in the `assessments` table.
- The saved record includes class label, backend label, risk, confidence, action, file name, and image dimensions.
- Raw uploaded images are not stored by default, which reduces privacy and storage risk for a capstone deployment.
- Guest users can still analyze images when Supabase is not configured.

## Deployment Plan And Execution

### Frontend deployment on Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Set the framework preset to Next.js.
4. Use the project root as the frontend root directory.
5. Use the build command:

```text
npm run build
```

6. Add the environment variable in Vercel:

```text
NEXT_PUBLIC_MODEL_API_URL=https://honorineigiraneza-maizeguard-backend.hf.space
```

7. If Supabase is enabled, add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, and `SUPABASE_JWKS_URL` in Vercel.
8. Redeploy after adding or changing environment variables.
9. Open the deployed frontend and upload maize test images.
10. Confirm that the browser Network tab sends upload requests directly to the Hugging Face backend `/predict` endpoint.
11. Sign in with the Supabase email magic link and confirm that new result summaries appear in the saved assessment history.

### Backend deployment on Hugging Face Spaces

The model API is deployed separately on Hugging Face Spaces. The frontend depends on the backend exposing:

```text
GET /
POST /predict
```

The `/predict` endpoint must accept a multipart form upload with this field:

```text
image
```
