# Redundant/Useless Files Audit - Nhyira Haven Repo

**Date:** 2026-04-09
**Status:** List only - DO NOT DELETE

---

## ⚠️ FILES NOT IN .gitignore (Should be added)

### Root Directory
| File | Size | Issue |
|------|------|-------|
| `deploy.zip` | 22 MB | Build artifact - committed to repo, should be gitignored |
| `frontend-dist.zip` | 243 KB | Build artifact - committed to repo, should be gitignored |

### Backend Directory
| File | Size | Issue |
|------|------|-------|
| `backend/nhyira-haven.db` | ~118 KB | SQLite DB - committed despite `*.db` in .gitignore, may be tracked |
| `backend/obj/project.assets.json` | 229 KB | Build cache - should be gitignored |
| `backend/obj/project.nuget.cache` | 9 KB | Build cache - should be gitignored |

### Frontend Directory
| File | Status | Issue |
|------|--------|-------|
| `frontend/dist/` | Exists | Build output - should be gitignored |

### ML-Pipelines Directory
| Pattern | Status | Issue |
|---------|--------|-------|
| `.ipynb_checkpoints/` | May exist | Jupyter checkpoint files - in .gitignore |
| `__pycache__/` | May exist | Python cache - in .gitignore |

---

## ⚠️ DUPLICATE/DEPRECATED FILES

### Documentation
| File | Location | Issue |
|------|----------|-------|
| `docs/REQUIREMENTS-AUDIT.md` | `/docs/` | May be outdated - created for tracking |
| `README.md` | Root | May contain old Azure/Render references |

### Configuration Files (Check for duplicates)
| File | Location | Issue |
|------|----------|-------|
| `render.yaml` | Root (may exist) | Not using Render anymore |
| `vercel.json` | `/frontend/` | May be obsolete if not using Vercel |
| Multiple workflow files | `.github/workflows/` | azure-deploy.yml and frontend-deploy.yml - verify which are active |

---

## ⚠️ LARGE FILES (May slow clone)

| File | Size | Location |
|------|------|----------|
| `deploy.zip` | 22 MB | Root |
| `data/dataset.zip` | 214 KB | `/data/` (may be committed) |
| `backend/obj/project.assets.json` | 229 KB | `/backend/obj/` |

---

## ⚠️ POTENTIALLY UNUSED

### Backend
- Empty directories in `backend/bin/` (Debug/Release)
- Old migration files (check if all are needed)

### Frontend
- `frontend/src/components/` - verify all components are imported
- `frontend/src/pages/` - verify all pages have routes

### Data
- `data/lighthouse_csv_v7/` - CSV files (17 tables) - are these all used?
- `data/dataset.zip` - duplicate of CSV folder?

---

## RECOMMENDATIONS (For Future Cleanup)

1. **Add to .gitignore:**
   ```
   # Root build artifacts
   deploy.zip
   frontend-dist.zip
   
   # Backend obj folder (more specific)
   backend/obj/
   ```

2. **Remove from tracking (if committed):**
   ```bash
   git rm --cached deploy.zip
   git rm --cached frontend-dist.zip
   git rm --cached backend/nhyira-haven.db
   git rm --cached backend/obj/
   ```

3. **Verify active deployment files:**
   - Keep only active workflow files
   - Remove obsolete deploy configs (Render, Vercel if not using)

4. **Documentation cleanup:**
   - Update README with current deployment info
   - Archive old audit documents

---

**Note:** This is for reference only. Do NOT delete files based on this list without verifying they're truly unused.
