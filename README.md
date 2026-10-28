# OpenCart Playwright Tests

An end-to-end test suite for OpenCart storefront workflows and Fake Store API endpoints, built with Playwright Test and TypeScript.

## Coverage

- **Web UI:** customer registration, login/logout, product search, adding products to the cart, and an end-to-end shopping journey.
- **API:** authentication and product, user, and cart endpoints, including CRUD workflows and response-schema checks.
- **Test data:** data-driven login scenarios are read from `testdata/opencart_logindata.json`. Other supported data formats are CSV and Excel.
- **Diagnostics:** failure screenshots, videos, traces on retry, and HTML, JUnit, and custom reports.

## Requirements

- Node.js LTS and npm
- A reachable OpenCart instance for web tests
- Network access to Fake Store API for API tests (or a compatible API configured with `API_BASE_URL`)

## Setup

From the project directory, install dependencies and the Chromium browser used by the Playwright configuration:

```powershell
npm ci
npx playwright install chromium
```

Create a `.env` file in the project root for local configuration. At minimum, web tests require `WEB_APP_URL`:

```dotenv
WEB_APP_URL=https://your-opencart-instance/
API_BASE_URL=https://fakestoreapi.com
TEST_ENV=QA
TEST_AUTHOR=QA
```

`API_BASE_URL` defaults to `https://fakestoreapi.com`. The `TEST_ENV` and `TEST_AUTHOR` values are optional report metadata. Keep `.env` local; do not put credentials in source control.

The optional MySQL helper in `utils/dbClient.ts` reads `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`. Configure these only if you use database queries.

Web test credentials are supplied as test data in `testdata/opencart_logindata.json` (and other formats are available in `testdata/`). Update the data to match your test environment, and use dedicated test accounts rather than real customer credentials.

## Running tests

Run API or web tests separately:

```powershell
npm run test:api
npm run test:web
```

Web tests require a valid `WEB_APP_URL`. Run the full `@master` suite after setting it:

```powershell
npm run test:master
```

Other available test commands:

| Command | Selects |
| --- | --- |
| `npm run test:sanity` | Tests tagged `@sanity` |
| `npm run test:regression` | Tests tagged `@regression` |
| `npm run test:e2e` | Tests tagged `@end-to-end` |
| `npm run test:datadriven` | Tests tagged `@datadriven` |
| `npm run test:master:headed` | Sanity tests in headed mode |
| `npm run test:sanity:debug` | Sanity tests in Playwright debug mode |

The project configuration defaults to tests tagged `@master`, so `npx playwright test` runs that group.

To run one test file, pass its path, for example:

```powershell
npx playwright test tests/api/productsApi.spec.ts
```

## Reports

After a test run, the configured reporters write:

- Playwright HTML report: `reports/` — open it with `npx playwright show-report reports`
- JUnit XML: `reports/results.xml`
- Custom HTML report and history: `custom-report/` — open `custom-report/index.html`
- Allure results: `allure-results/`

Screenshots and videos are captured on test failures. Traces are captured on the first retry. In CI, tests use one worker and are retried twice.

## Project layout

```text
api/          Fake Store API routes and JSON schemas
fixtures/     Shared Playwright page fixtures
pages/        OpenCart page-object classes
testdata/     Login data in JSON, CSV, and Excel formats
tests/api/    API test cases
tests/web/    OpenCart browser test cases
utils/        Data readers, test helpers, generators, DB client, and reporter
```

## Continuous integration

The GitHub Actions workflow in `.github/workflows/playwright.yml` installs dependencies and Playwright browsers, runs the Playwright suite, and uploads a report artifact. API tests use Fake Store API (`https://fakestoreapi.com`).

Web tests in CI also need `WEB_APP_URL` and suitable test data configured for the CI environment.
