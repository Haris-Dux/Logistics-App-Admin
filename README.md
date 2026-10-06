# LogisticApp Admin Portal

Web portal for the admin team that runs daily deliveries for the LogisticApp driver app. The main focus is live vehicle tracking; the portal also covers the operations overview, delivery monitoring and proof of delivery, driver messaging, drivers, vehicles, vehicle checks and defects, alerts, reports, routes, admin accounts, the activity log, and depot scoping.

Built on [shadcn-admin](https://github.com/satnaing/shadcn-admin) (Vite, React 19, TanStack Router/Query/Table, shadcn/ui, Tailwind CSS v4, zustand, zod). The map and live-socket code follow [traccar-web](https://github.com/traccar/traccar-web).

## Getting started

```bash
pnpm install
pnpm mock   # mock REST API on http://localhost:4000/api
pnpm dev    # portal on http://localhost:5173 (proxies /api to the mock)
```

Sign in with `admin` / `admin123` (head office, sees every depot) or `mark` / `mark1234` (West London depot only).

## Environment

Shared defaults live in `.env`; put local overrides in `.env.local`.

| Variable                   | Purpose                                                             |
| -------------------------- | ------------------------------------------------------------------- |
| `VITE_API_URL`             | Base path of the REST API (default `/api`).                         |
| `API_PROXY_TARGET`         | Where the dev server proxies `VITE_API_URL` to (default: the mock). |
| `VITE_SOCKET_URL`          | Socket.IO server for live updates. Empty disables live updates.     |
| `VITE_MAP_STYLE_URL`       | MapLibre style for the street map (OpenFreeMap, no key).            |
| `VITE_MAP_GLYPHS_URL`      | Glyph server used for map labels.                                   |
| `VITE_SATELLITE_TILES_URL` | Raster tiles for the satellite view (Esri World Imagery).           |

## Project layout

```
mock/                 json-server mock API (data/*.json, server.js)
src/api/              One module per REST resource: zod schemas, queryOptions, mutations
src/components/map/   MapLibre map (single shared instance), layers, camera
src/config/           Status labels and colours shared by badges and the map
src/features/         One folder per page (overview, live-map, deliveries, ...)
src/lib/              Pure helpers: dates (UK time), formatting, fleet, socket
src/stores/           zustand stores: auth, depot scope, live positions
src/routes/           TanStack file routes with zod-validated search params
```

## Conventions

- **Data fetching.** Every request goes through `src/api`. Responses are validated with zod at the boundary, so a backend that differs from the contract fails loudly. Queries are built with `queryOptions()`; mutations are plain functions wrapped in `useMutation`, and they invalidate the resource's query key on success.
- **Caching.** Caching is off for now (`staleTime: 0`, `gcTime: 0` in `main.tsx`). Tune individual queries in their `queryOptions` factory.
- **Times.** Depots run on UK time. Planned times (`HH:mm`), calendar days and every displayed time use `Europe/London`, whatever the admin's browser time zone is (`src/lib/dates.ts`).
- **Depot scope.** `useDepotId()` gives the depot the admin works in: their own, or the one a head-office admin picked in the sidebar. Depot-scoped queries take it as a filter.
- **URL state.** Selections, filters, dates and pagination live in route search params, so every view can be deep-linked.

## Mock API

`pnpm mock` serves every `mock/data/<resource>.json` file as `/api/<resource>` using json-server 0.17 (filters, `_gte`/`_lte`, `q` full-text search, `_expand`/`_embed`). On start it moves the dataset so its anchor day (`2026-10-06`) is today. Clock times are not shifted, so "last seen" ages only look realistic around 14:45 UK time. Data is held in memory and resets on restart.

The mock adds `POST /api/auth/login` and fills in the fields a real backend sets on create. A few endpoints a real backend would offer are composed on the client for now. Each lives in a single function in `src/api`:

- `conversationsQueryOptions`: groups `/messages`.
- `reportQueryOptions`: aggregates `/shifts` and `/deliveries`.
- `broadcastMessage`: sends one POST per driver.
- `markMessagesRead`: sends one PATCH per message.

## Live updates (Socket.IO contract)

When `VITE_SOCKET_URL` is set, the portal opens one Socket.IO connection while signed in. It sends the access token in `auth.token`. The server sends two events:

| Event       | Payload                                                                                               | Effect                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `positions` | `Position[]` (see `src/api/positions.ts`), including late uploads after signal loss with `late: true` | Van markers glide to the new positions; the selected van's trail is refetched. |
| `changed`   | `{ resource: 'shifts' \| 'deliveries' \| 'messages' \| 'alerts' \| 'vehicle-checks' }`                | Queries for that resource are refetched.                                       |

After a reconnect, every live resource is refetched to fill the gap. The client also reconnects when the tab becomes visible again or the network comes back.

## Scripts

| Script                                     | Description                                                      |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `pnpm dev` / `pnpm build` / `pnpm preview` | Develop, type-check and build, preview the build.                |
| `pnpm mock`                                | Start the mock API.                                              |
| `pnpm lint` / `pnpm format` / `pnpm knip`  | ESLint, Prettier, unused files and exports.                      |
| `pnpm test`                                | Vitest in headless Chromium (`pnpm test:browser:install` first). |

## License

The shadcn-admin base is MIT licensed; see [LICENSE](./LICENSE).
