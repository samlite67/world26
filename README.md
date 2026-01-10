<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1_EaOtIuOLUaXP2xbDTVMLnFIQ3aBOmEv

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_MISTRAL_API_KEY` in [.env.local](.env.local) to your Mistral API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

### Option 1: Secure Proxy (Recommended)
1. Deploy a Cloudflare Worker proxy (or similar).
2. Add a repository secret named `VITE_PROXY_URL` with your worker's URL (e.g., `https://my-proxy.workers.dev`).
3. (Optional) Remove `VITE_MISTRAL_API_KEY` from repository secrets to ensure it's not bundled.

### Option 2: Direct Key (Not Recommended for Public Repos)
- Add a repository secret named `VITE_MISTRAL_API_KEY` with your Mistral key.

- Push to `main` to trigger [.github/workflows/deploy.yml](.github/workflows/deploy.yml); it builds and publishes to GitHub Pages.
- Pages base is `/world26/`, so the site will be served from `https://<your-user>.github.io/world26/` once Pages is enabled for the repo.
