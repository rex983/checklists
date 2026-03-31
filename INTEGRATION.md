# Checklist Integration Guide

## Portable Files (copy to Order Process)

### Core Logic (lib/checklist/)
These files are self-contained and can be copied directly:
- `types.ts` — TypeScript interfaces
- `colors.ts` — Shared constants (step colors, Success Team contact)
- `templateTypes.ts` — Template editor data types
- `templateStore.ts` — Template block defaults + localStorage persistence
- `templateRenderer.ts` — Token-based template rendering engine
- `templates.ts` — Template key resolver
- `engine.ts` — Main `generateChecklist()` function
- `emailTemplate.ts` — Email HTML renderer
- `manufacturerStore.ts` — Manufacturer localStorage persistence
- `mockData.ts` — Mock data (keep for dev/testing)
- `dataProvider.ts` — Abstraction layer for data sources

### Components (components/checklist/)
These are drop-in components using CSS custom properties:
- `ChecklistDashboard.tsx` — Main checklist UI with preview
- `ChecklistPDF.tsx` — PDF generation (needs `@react-pdf/renderer`)
- `ManufacturerManager.tsx` — Manufacturer CRUD
- `TemplateEditor.tsx` — Template content editor

### Static Assets (public/logos/)
Copy the manufacturer logos to the Order Process public directory.

## What to Remove (prototype-only)
These exist only for the standalone prototype and are NOT needed:
- `app/layout.tsx` — Order Process has its own layout
- `app/page.tsx` — Replace with authenticated route
- `components/checklist/Nav.tsx` — Order Process has its own nav
- `components/checklist/ThemeToggle.tsx` — Order Process has ThemeContext
- `components/checklist/Toast.tsx` — Order Process has its own Toast

## CSS Variable Mapping
Components use these CSS vars (already aligned with Order Process):
| Variable | Used For |
|----------|----------|
| `--card-bg` | Card backgrounds |
| `--card-shadow` | Card box shadows |
| `--text-primary` | Primary text |
| `--text-secondary` | Secondary text |
| `--input-bg` | Form input backgrounds |
| `--input-border` | Form input borders |
| `--table-border` | Table/divider borders |
| `--background` | Page background |

**Note:** Order Process doesn't define `--table-border`. Add it to the Order Process globals.css:
```css
/* Light */ --table-border: #e5e7eb;
/* Dark */  --table-border: #2a2a4a;
```

## Toast Import Change
Components import Toast from `@/components/checklist/Toast`.
In Order Process, change these to `@/components/Toast`.

## Route Setup in Order Process
The nav already has a `/checklist` link for admin/manager roles.
Pages to create under `app/(authenticated)/`:
- `checklist/page.tsx` — Main checklist dashboard
- `checklist/templates/page.tsx` — Template editor
- `checklist/manufacturers/page.tsx` — Manufacturer management

## Data Migration Path
1. **Phase 1 (now):** localStorage — works standalone
2. **Phase 2:** Swap `dataProvider.ts` to use Supabase:
   - `manufacturer_config` table for manufacturers
   - New `checklist_templates` table for editable blocks
   - Real orders from `orders` table mapped to `ChecklistInput`
3. **Phase 3:** Email sending via SendGrid API route
4. **Phase 4:** PDF hosted on Supabase Storage for email links

## Dependencies to Add to Order Process
```bash
npm install @react-pdf/renderer
```
