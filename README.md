# MaizeGuard Rwanda

MaizeGuard Rwanda is a web-based maize quality screening product. A user uploads a maize image, the frontend sends the image to a deployed PyTorch model API, and the app returns a visible quality class, confidence score, risk level, and recommended post-harvest action.

The project focuses on helping farmers, cooperatives, aggregators, and quality-control teams make faster first-level decisions about maize batches before storage, aggregation, or sale.

## Submission Links

Deployed frontend:

```text
https://maizeguard-frontend-70xyc87wl-honorine22s-projects.vercel.app
```

Backend model API:

```text
https://honorineigiraneza-maizeguard-backend.hf.space/
```

5-minute demo video: https://youtu.be/0U93bL54p_g

```text
PASTE VIDEO LINK HERE
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

For a local backend, use:

```text
NEXT_PUBLIC_MODEL_API_URL=http://127.0.0.1:8000
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

For direct browser uploads, the backend must also allow CORS requests from the deployed Vercel frontend domain.

## Testing Results And Strategies

| Testing strategy | What was tested | Expected result |
| --- | --- | --- |
| File validation testing | Upload non-image files and oversized images | App rejects invalid files before sending them to the backend |
| Functional upload testing | Upload maize images through the file picker and drag-and-drop area | App sends the image to `/predict` and displays prediction results |
| Different data values | Test images representing good, broken, impurity, and mold-risk maize | App maps backend labels to the correct user-facing class and action |
| Error handling testing | Test while backend is unavailable or returns an invalid response | App shows a clear "Needs review" or backend unavailable message |
| Deployment testing | Test the deployed Vercel frontend with the deployed Render backend | Upload flow works in the target deployment environment |
| Responsive testing | Test desktop and mobile viewport sizes | Layout remains readable and upload controls remain usable |
| Build verification | Run `npm run build` | Next.js production build completes successfully |

Latest local build verification:

```text
npm run build
Result: successful production build
```

## Demonstration Plan For The Video

The 5-minute demo should focus on core product functionality instead of sign-up or sign-in.

Recommended demo flow:

1. Open the deployed MaizeGuard frontend.
2. Show the purpose of the product and the main upload interface.
3. Upload a valid maize image and explain the prediction result.
4. Show confidence, probability evidence, risk level, and recommended action.
5. Test at least two different maize image examples or data values.
6. Demonstrate invalid input handling using a non-image or oversized file.
7. Show the deployed backend API health endpoint.
8. Briefly show the repository README and project structure.
9. Mention deployment on Vercel and Render.

## Analysis Of Results

MaizeGuard achieves the main proposal objective of providing a practical first-level maize quality screening tool. The frontend gives users a simple upload workflow, while the backend model provides automated classification and confidence evidence.

The product aligns with the approved scope by focusing on visible maize quality categories rather than attempting to replace laboratory testing. The app is strongest as a triage and decision-support tool: it can help users decide whether a batch looks safe to store, needs cleaning, needs sorting, or requires further review.

The result presentation supports the objective because it does not only show a class label. It also provides risk level, action guidance, confidence, and probability evidence. This makes the output more useful for real users who need an operational decision, not just a technical prediction.

The main limitation is that image-based prediction depends on photo quality, lighting, background, camera distance, and whether the uploaded image represents the full maize batch. For high-risk decisions, especially mold-risk cases, the result should be treated as support for further inspection rather than final certification.

## Discussion

The important milestone in this product is connecting a usable frontend with a deployed model API. This turns the model from a notebook or backend-only artifact into a product that a non-technical user can test.

The upload validation milestone improves reliability because it prevents unsupported files from reaching the model. The prediction display milestone improves usability because users can understand the result through class, confidence, risk, and recommended action. The deployment milestone is also important because it proves the system can run outside the developer machine.

The expected community impact is faster and more accessible maize screening. Cooperatives and aggregators can use the tool to support early sorting and cleaning decisions. Farmers can use it to understand visible quality risks before storage or market delivery. The product can also support training and awareness about common maize quality issues.

## Recommendations And Future Work

- Use MaizeGuard as a first-level screening tool, not as a replacement for formal laboratory quality testing.
- Capture images in good lighting, with the maize spread clearly and without heavy shadows.
- Test the model with more real images from local farmers, cooperatives, and markets.
- Add batch-level analysis where multiple images are combined into one final result.
- Improve backend reliability and monitoring so the deployed model API remains available during demonstrations and real use.
- Add a result history feature for cooperatives that need to track repeated maize inspections.
- Expand the dataset with more Rwanda-specific maize samples and field conditions.
- Add multilingual support, especially English and Kinyarwanda, for wider community use.

## Code Quality Notes

The frontend is organized into a small Next.js app with clear separation between interface structure, styling, static assets, and environment configuration. TypeScript types are used for prediction results, risk levels, scenario mapping, and display state. The upload logic includes validation, loading state, success handling, and failure handling.

The model response normalization keeps backend labels separate from the user-facing display categories, which makes the frontend easier to maintain if the backend model labels change later.

## Submission Checklist

- Repository includes source code.
- README includes install and run steps.
- README includes related project files.
- README includes deployed frontend link.
- README includes backend API link.
- README includes a place for the 5-minute demo video link.
- README includes testing strategies and expected results.
- README includes deployment plan and verification steps.
- README includes analysis, discussion, recommendations, and future work.
- Repository can be zipped for Attempt 2 submission.
