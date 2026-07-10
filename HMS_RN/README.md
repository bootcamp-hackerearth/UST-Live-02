# HMS - React Native Mobile App

This is the mobile client for the Hospital Management System (HMS), a comprehensive healthcare application designed to streamline hospital operations on the go. Built with React Native and Expo, this application provides a responsive, secure, and user-friendly experience for patients, staff, and administrators.

## Project Owner

- **Aswin A S**
  - GitHub: [AswinAS-308247](https://github.com/AswinAS-308247)
  - Email: [Aswin.AS2@ust.com](mailto:Aswin.AS2@ust.com)

## Table of Contents

1. [About The Project](#about-the-project)
   - [Key Features](#key-features)
   - [Built With](#built-with)
2. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation & Setup](#installation--setup)
3. [Mobile App Architecture](#mobile-app-architecture)
4. [Request & Data Flow](#request--data-flow)
5. [Project Maintainers](#project-maintainers)

## About The Project

This project serves as the mobile-facing part of the HMS ecosystem. It communicates with a separate backend service to handle data persistence and business logic, while offering a smooth and accessible experience on mobile devices.

### Key Features

- **Secure Authentication:** Login and session handling using secure storage and token-based authorization.
- **Role-Based Navigation:** Screens and actions adapt based on user roles and permissions.
- **Appointment Management:** View, create, and manage patient appointments from the mobile app.
- **Patient & Employee Views:** Access and manage core healthcare records through a mobile-friendly interface.
- **Medical Records:** Create and review encounter details and clinical information.
- **Responsive UI:** Built using React Native components with a consistent and polished user experience.
- **Modern Navigation:** Stack and tab-based navigation for a smooth app flow.

### Built With

- **React Native:** Core framework for building the mobile application.
- **Expo:** Simplifies development, testing, and deployment for React Native apps.
- **TypeScript:** Provides type safety and better maintainability.
- **React Navigation:** Handles app routing and screen transitions.
- **Axios:** Handles HTTP requests to the backend API.
- **Formik / React Hook Form:** Form state and validation management.
- **Expo Secure Store:** Stores sensitive session data securely on the device.

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- **Node.js & npm:** Download and install Node.js
- **Expo CLI:** Install globally using `npm install -g expo-cli`
- **Backend Server:** The HMS backend service must be running and reachable

### Installation & Setup

1. **Navigate to the mobile app directory:**

   ```sh
   cd HMS_RN
   ```

2. **Install NPM packages:**

   ```sh
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root if your app uses backend URLs or other configuration values.

   ```env
   API_URL=http://localhost:5000
   ```

4. **Run the application:**

   ```sh
   npm start
   ```

   Then choose one of the available Expo options to run the app on a simulator, emulator, or physical device.

## Mobile App Architecture

The mobile app is organized into clear feature-based modules to keep the codebase scalable and maintainable.

- **screens**: Main UI screens for authentication, dashboard, appointments, patients, and medical records.
- **components**: Reusable UI elements and shared layout pieces.
- **services**: Centralized API communication and business logic handling.
- **hooks**: Custom hooks for reusable stateful logic.
- **navigation**: Stack, tab, and route definitions for the app flow.
- **validations**: Shared form validation logic for user input.
- **interceptors**: Request/response handling for authentication and API errors.

## Request & Data Flow

A typical authenticated request follows this flow:

1. **User Interaction**: The user performs an action in a screen such as login, appointment booking, or record update.
2. **Service Call**: The screen triggers a method from a dedicated service layer.
3. **HTTP Client**: The service sends the request using Axios.
4. **Authentication Handling**: Tokens are attached or refreshed using secure storage and request interceptors.
5. **Backend Communication**: The request is sent to the backend API.
6. **Response Handling**: The response is returned to the calling screen, where the UI updates accordingly.

