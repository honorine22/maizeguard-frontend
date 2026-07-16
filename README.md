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
| Model API | FastAPI backend deployed on Hugging Face Spaces |
| Model stack | PyTorch model API |
| Deployment | Vercel frontend, Hugging Face Spaces backend |

## Related Project Files

| File or folder | Purpose |
| --- | --- |
| `app/page.tsx` | Main frontend interface, upload flow, direct Hugging Face API call, result rendering |
| `app/globals.css` | Global styles, theme variables, responsive visual design |
| `app/layout.tsx` | Root layout, metadata, fonts, favicon |
| `public/` | Static images and favicon used by the frontend |
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

The frontend automatically sends uploads to:

```text
<NEXT_PUBLIC_MODEL_API_URL>/predict
```

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

7. Redeploy after adding or changing environment variables.
8. Open the deployed frontend and upload maize test images.
9. Confirm that the browser Network tab sends upload requests directly to the Hugging Face backend `/predict` endpoint.

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
