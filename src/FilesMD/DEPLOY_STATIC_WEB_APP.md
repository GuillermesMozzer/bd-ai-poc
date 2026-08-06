# Static Web App Deployment (Azure DevOps)

This repo is prepared with `azure-pipelines.yml` for CI/CD.

## What is automated

- On every push to `main` and `feature/*`:
  - `npm ci`
  - `npm run lint`
  - `npm run build`
- On push to `main` only:
  - Deploys to Azure Static Web Apps

## One-time Azure setup

1. Create the Static Web App in Azure Portal
   - Service: **Static Web Apps**
   - Plan: Free or Standard
   - Deployment source: **Other** (we are using Azure Pipeline YAML from repo)

2. Get deployment token
   - Open your Static Web App resource
   - Go to **Manage deployment token**
   - Copy token value

3. Add pipeline secret variable in Azure DevOps
   - Azure DevOps > Pipelines > select pipeline > **Edit**
   - Open **Variables**
   - Add variable:
     - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
     - Value: `<token from Azure portal>`
     - Mark as: **Keep this value secret**

4. Create pipeline from repo
   - Azure DevOps > Pipelines > New pipeline
   - Source: Azure Repos Git
   - Repo: `bd-ai-poc`
   - Existing YAML: `azure-pipelines.yml`
   - Save and run

5. Merge your feature branch into `main`
   - Deployment stage runs only from `main`
   - After merge, pipeline deploys and publishes your app URL

## Daily team workflow

- Developers open PRs into `main`
- PR build validates lint/build
- Merge to `main` triggers production deployment

