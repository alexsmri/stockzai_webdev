# Landing page images

Landing graphics live in `../media/` next to the platform images and are
wired up in `index.ts`:

| Import                   | Used in                                          |
| ------------------------ | ------------------------------------------------ |
| `IMG_HeroScores.png`     | Hero (left) and Fundamentals "Scores" card       |
| `IMG_HeroRiskScore.png`  | Hero (center)                                    |
| `IMG_HeroKPICard.png`    | Hero (right) and Fundamentals "KPI Details" card |
| `IMG_DashboardView.avif` | "Instantly understand any stock" block           |
| `IMG_Leaderboard.png`    | Fundamentals "Sector Leaderboards" card          |

The images are flat. The 3D tilt and drop shadow are applied in
`../scss/landing/landing.scss` (`lp-tilt-*` classes).

The backtest chart is not an image: it is inline SVG in
`components/landing/COM_LandBacktestChart.tsx`.
