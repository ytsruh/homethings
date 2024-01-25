# Homethings

The Homethings Apps & API

## Versions

### v1.2

- Built Go/Echo API server
- Refactored NextJS app to use Go Server
- Refactored mobile app to use Go Server

### v1.1

- Updated Next to use App Directory

### v1

- Removed Prisma dependancy for DrizzleORM
- Rebuilt UI using ShadCN UI
- Added user preferences
- Resized imagery for performance
- Added barcode scanner to mobile app

### 0.10

- Merged in expo project for mobile app
- Fixed bug when creating new users. Passwords were not encrypted.
- Removed favourites
- Added Documents model & ui

### 0.9

- Adding support for books
- Updated Next 13
- Removed TRPC
- Added Prisma JSON feature flag
- Added dual auth so both Next Auth & Custom JWT can be used with API
- Added Feedback functionality
- Fixed bug where favourites could not be deleted
- Added Zod to DB models & ENV variables

### 0.8

- Added User favourites
- Upgraded all files to TypeScript
- Added getServerSideProps to all pages
- Added prop-types to components

### 0.7

- Fixed Typescript errors
- Moved data fetching into a hook
- Replaced custom auth with NextAuth
- Added Zod & schema validation
- Added trpc support

### 0.6

- Switched to Postgres & Prisma
- Upgraded to Next 13

### 0.5

- Switched from Bootstrap to Tailwind
- Added dark mode toggle
- Added new section to view users & create new user

### 0.4

- Refactored to use NextJS
- Added new endpoint to retrieve Episode
- Switched from 'node-sass' to 'sass' library

### 0.3

- Added Profile page
- Added Personalised Icon setting
- Added search/filter bar to Movies

### 0.2

- Added Authentication to API
- Updated app to send token with fetch requests
- Updated 404 & 500 Pages

### 0.1

- Build using Azure Functions & Create React App
