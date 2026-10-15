# CareerBoard

A focused job application dashboard built with vanilla JavaScript, CSS, and browser APIs. Organize opportunities from the first saved listing to an offer, without an account or a database setup.

## Run locally

Install Node.js 20 or newer, then run:

```sh
cd careerboard
npm start
```

Open **http://localhost:3000**. No package installation or external API keys are needed. Use an HTTP server rather than opening `index.html` directly because the app uses ES modules.

## Features

- Responsive dashboard with totals for applications, active opportunities, interviews, and offers.
- Create, edit, and delete applications with stage, location, date, and notes.
- Search by company, job title, or location; filter by stage; sort by date or company.
- Local persistence and updates between browser tabs.
- JSON backup export and validated import, with confirmation before replacing data.
- Sample workspace with an explicit reset to start your own tracker.
- Native modal dialogs, labeled controls, keyboard focus indicators, and reduced motion support.
- No third-party runtime dependencies, external fonts, analytics, or API calls.

## Engineering decisions

`domain.js` contains pure filtering, statistics, and validation functions. `app.js` handles UI events and persistence. Rendering uses DOM creation and `textContent`, so user-provided text is not inserted as HTML. Imports are validated in full before changing the workspace. Storage writes complete before the UI accepts a change, so a failed write does not silently lose an edit. The local development server serves an explicit file allowlist.

```text
careerboard/
  index.html       Semantic dashboard and dialog structure
  styles.css       Responsive layout and visual system
  app.js           Rendering, events, local storage, backups
  domain.js        Validation, search, sorting, and metrics
  domain.test.js   Unit tests using Node's built-in test runner
  server.js        Dependency-free local development server
```

## Verify

```sh
npm test
npm run check
```

Manual browser checklist:

1. Add an application, reload, and check that it persists.
2. Edit its stage and check the dashboard counts and filters.
3. Search by role and location; try each sort order.
4. Export a backup, start fresh, then import the backup.
5. Import an invalid JSON file and verify the workspace stays unchanged.
6. Check the layout on a narrow screen and navigate dialogs using the keyboard.

## Publish on GitHub

Create an empty GitHub repository named `careerboard`, then run these commands **inside this folder**. Replace `YOUR_USERNAME` with your GitHub username.

```sh
git init
git add .
git commit -m "Build CareerBoard application tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/careerboard.git
git push -u origin main
```

To host the live demo, enable **Settings → Pages → Deploy from a branch → main → / (root)**. This project uses relative asset paths and works as a static GitHub Pages site; `server.js` is only for local development. Add your live URL to the repository's About section. Take a screenshot of your running dashboard and add it to this README before sharing your application.

Suggested repository description: “A local-first job application tracker with responsive UI, validated backups, and tested JavaScript business logic.”

## Limits and privacy

Data belongs to the browser and origin where it was created. It does not sync between devices. Clearing browser storage deletes it, and private browsing may not preserve it. Export backups regularly and avoid sensitive personal information in public demo screenshots. Exported JSON includes your notes. The workspace supports up to 2,000 applications. This is a portfolio frontend project, with no authentication or cloud backend.

## Make it yours

Understand the event flow and tests before discussing this project in an interview. Customize the styling or add a feature you can explain, such as follow-up reminders or CSV export. Describe your contributions honestly if asked about development tools or assistance.

## License

MIT — see [LICENSE](LICENSE).
