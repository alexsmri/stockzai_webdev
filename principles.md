## Backend (Python):

### Views:

- views must be added here:
  `app_dir/api/views.py`
- views are mostly function-based, class-based views are only used if the view performs a default operation on a model
- the `api_json_response` wrapper must be used at all times for returning content.
- If a view hits an `except`-block, the `status` parameter of the response must mirror that (f.e. with `status=400`, the `error` parameter contains the error message
- In any other expected case, always return `status=200`. In case of an error, set `msg=False` instead of `status=400`. This is reserved for actual exceptions.

### Models:

- models must be added here:
  `app_dir/models.py`
- model fields must only be configured to the bare minimum. Don't set overly specific settings unless they are crucial

### DB-Work:

- right now, for every new, specific DB-Query, make a new function in `DB_Handler`. This will be refractored one day, but for now, it works.
- If a query is reasonably expensive considering most tables have 500k-5M rows, make it a celery task that fetches the data every 5-10 minutes and writes it into a separate `model` (see above)

### Tasks:

- tasks must be added here:
  `app_dir/tasks.py`
- tasks must be created with the `@shared_task(name="taskname")`-decorator
- tasks must always return and thus include exception handling

## Frontend (TypeScript & React):

### General:

- React + Vite + TypeScript live in `frontend/src`; `main.tsx` keeps StrictMode on and wraps `<App />` in `.area-body`.
- Keep new work aligned with the existing directory split (pages, components, context, stores, hooks, utils, assets); avoid ad-hoc folders.

### Architecture:

- Pages orchestrate providers, local UI state, and layout; they offload rendering to reusable components.
- Context factories from `CTX_BaseStore` create store instances via `StoreClass.create(...args)` and expose them through React context.
- Run async workflows inside `useEffect` with IIFEs so renders stay side-effect free.

### Stores & Data Flow:

- API-first stores extend `BaseAPIStore`, implement `fetch`, call `init()` inside `static create`, and expose `fill`, `status`, `error`, `get`.
- Providers trigger `store.fill()` once and optionally render `COM_Loading` via `showFallback`.
- Subscribe to store updates with `subscribe`/`unsubscribe` and the `use*StoreSync` hooks to mirror data into component state.
- Multi-endpoint stores (like the user store) extend `STO_Base`, maintain a `ROUTE_CONFIG`, and persist selected keys with the built-in `persist`/`hydrate` helpers.

### Components:

- Stateful composites live in `components/`; pure presentational pieces go into `components/dumb/` and expect clean, typed props.
- Prefer fragments over extra wrapper divs and keep component APIs narrow and explicit.
- Navigation relies on `useNavigate` for handlers and plain anchors for direct links; clickable cards funnel through `onClick` + navigate.
- Reuse shared elements such as `COM_Loading`, `COM_IndicatorChange`, and `DCOM_*` blocks instead of recreating patterns.

### Styling:

- Styling is driven by the SCSS token system: `.area-*` for layout, `.look-*` for surfaces/typography, `.mod-*` for modifiers.
- Extend visuals using mixins from `assets/scss/util` (`look-container`, `look-transparent`, `gradient-*`) to stay on-brand.
- Honor the dark palette from `_colors.scss`; when dynamic colors are needed, use helpers in `utils/functions.ts`.
- Inline styles stay reserved for runtime-calculated values (e.g., sticky offsets); otherwise compose classnames.

### UX & Feedback:

- Alerts are centralized through `PRV_Alert` + `useAlert`; invoke alerts via the context instead of mounting ad-hoc banners.
- Loading and empty feedback reuse `COM_Loading` or provider fallbacks—no bespoke spinners.
- Modal/lightbox behavior flows through `PRV_Lightbox` and `COM_LightboxTimed`.
- Search pages balance local state (input/completions/results toggles) with store-backed data fetches.

### Auth & Session:

- Wrap the app in `PRV_UserStore` so `STO_Users` is available everywhere.
- `STO_Users` persists critical keys (login, credentials, refresh tokens) to `localStorage`; update them via `store.update` to keep persistence correct.
- `COM_HandleTokens` validates and refreshes tokens on mount; `COM_ProtectedRoute` repeats the validation per-route and redirects to login with the intended return path.
- When clearing auth state (logout, invalid tokens), use the store helpers and purge the persisted keys as well.

### API & Networking:

- All HTTP traffic runs through the shared Axios instance in `api.ts`, which reads `VITE_API_URL`.
- The request interceptor injects the stored Bearer token—avoid direct `fetch` or custom axios instances.
- Backend responses should expose `msg`/`error`; stores normalize to that contract before handing data to consumers.
- Construct query strings with `URLSearchParams` so encoded parameters stay consistent.

### Hooks & Utilities:

- The custom sync hooks (`useSearchStoreSync`, `useUserStoreSync`, etc.) bridge stores and local state and handle subscription cleanup automatically.
- Environment/DOM hooks (`useWindowDimensions`, `useStickyObserver`) centralize listeners; rely on them instead of manual event wiring.
- Domain helpers in `utils/functions.ts` and `utils/formats.ts` cover number formatting, KPI labels, scoring colors, throttled sleeps, etc.—reuse them.

### Routing & Navigation:

- Routing lives in `App.tsx`; add new routes there and wrap gated pages with `COM_ProtectedRoute`.
- Utility routes (logout, register variants) clear stored state before redirecting; follow that pattern when a route must reset session data.
- Use `<Navigate>` for hard redirects and `useNavigate` for interaction-driven transitions.

### Forms & Inputs:

- Inputs remain controlled; guard submissions against empty/too-short values before firing store fetches.
- Forms reuse `look-input-*` and `look-button-*` classes for consistent visuals.
- Typeahead dropdowns sit in relatively positioned wrappers and use `mod-z-*` helpers to stay above surrounding content.
