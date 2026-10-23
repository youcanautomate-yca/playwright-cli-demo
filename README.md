# Playwright CLI Demo

A Playwright Test project demonstrating page-object-based browser automation against Amazon.in. The current tests cover product detail verification and adding a search result to the cart.

## Watch the videos

Explore Playwright automation with Claude Code: from reusable page objects to test generation and CLI integration. Click any thumbnail to watch.

| Video | Watch |
|---|---|
| **I Made Claude Code Write Clean Playwright Tests — POM Skill Demo** | [![Watch the POM Skill Demo](https://img.youtube.com/vi/FKk6of53q2E/hqdefault.jpg)](https://youtu.be/FKk6of53q2E) |
| **Playwright Skills + Claude Code: Plan, Generate & Self-Heal Tests With No Code** | [![Watch the Playwright Skills demo](https://img.youtube.com/vi/5TR0uwuComQ/hqdefault.jpg)](https://youtu.be/5TR0uwuComQ) |
| **Don't Miss This! Claude Code CLI & Playwright CLI Integration** | [![Watch the CLI integration demo](https://img.youtube.com/vi/-TE_v-Nd_jM/hqdefault.jpg)](https://youtu.be/-TE_v-Nd_jM) |

## About this repository

A Playwright Test project demonstrating page-object-based browser automation against Amazon.in. The current tests cover product detail verification and adding a search result to the cart.

## Requirements

- Node.js and npm
- Chromium, installed through Playwright
- Access to Amazon.in

## Setup

```sh
npm install
npx playwright install chromium
```

## Run the tests

```sh
npx playwright test
```

The tests use the live Amazon.in site, so results and prices can change, and Amazon may show CAPTCHA or other checks. The product detail test is read-only. The cart test adds an iPhone 17 search result to the cart, but does not sign in or proceed to checkout.

An HTML report is configured as the test reporter. To open the report after a run:

```sh
npx playwright show-report
```

## Project structure

- `pages/` — page objects for search results, product details, and the cart
- `tests/` — Playwright Test specs
- `specs/` — broader test plan for laptop searches under ₹50,000
- `utils/` — shared utilities, including price parsing
