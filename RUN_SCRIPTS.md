# Reproducible Run Scripts

Folder: this directory

## 1) Bootstrap once

```powershell
.\bootstrap.ps1
```

Optional clean bootstrap:

```powershell
.\bootstrap.ps1 -ForceClean
```

## 2) Configure env

Open `.env.local` and set `GEMINI_API_KEY`.

## 3) Run dev

```powershell
.\run-dev.ps1
```

## 4) Build production

```powershell
.\run-build.ps1
```

## Notes

- Scripts normalize proxy/offline npm variables for reproducibility.
- If your machine enforces process spawn restrictions (`spawn EPERM`), Vite/esbuild may still fail. In that case, run these scripts on a machine/session without that OS policy.
