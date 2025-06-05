# Liquor Store Management System

A web application built with Astro and Firebase for managing a liquor store's inventory and generating receipts.

## Features

- User authentication (Admin and Employee roles)
- Inventory management (CRUD operations)
- Receipt generation
- Real-time database updates with Firebase

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project and enable:
   - Authentication (Email/Password)
   - Firestore Database

4. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   PUBLIC_FIREBASE_API_KEY=your_api_key
   PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/src/components` - React components for inventory and receipt management
- `/src/layouts` - Astro layout components
- `/src/pages` - Astro pages
- `/src/lib` - Firebase configuration and utilities

## Usage

1. Access the application at `http://localhost:4321`
2. Log in with your credentials
3. Use the dashboard to:
   - Manage inventory (add, edit, delete products)
   - Generate receipts for customers
   - View and track sales

## Security

- User authentication is required for all operations
- Role-based access control for admin and employee functions
- Secure Firebase configuration using environment variables

## Technologies Used

- Astro
- React
- Firebase (Authentication & Firestore)
- Tailwind CSS
- TypeScript

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
