# Azure DevOps Repo Setup

Use this folder as the repo root:

`C:\Users\leonardo.fabregat\Downloads\Smart - Copy\Smart - Copy`

## 1) First push to Azure DevOps

```powershell
cd "C:\Users\leonardo.fabregat\Downloads\Smart - Copy\Smart - Copy"

git init
git add .
git commit -m "Initial Smart Factory app"

git branch -M main
git remote add origin https://dev.azure.com/<ORG>/<PROJECT>/_git/<REPO>
git push -u origin main
```

If the remote already has a README or initial commit:

```powershell
git pull --rebase origin main
git push -u origin main
```

## 2) Team workflow

- Create feature branches: `feature/<name>`
- Open PRs into `main`
- Require at least 1 reviewer
- Prefer squash merge for clean history

## 3) Local run

```powershell
npm install
npm run dev
```

## 4) Pre-PR checks

```powershell
npm run lint
npm run build
```

