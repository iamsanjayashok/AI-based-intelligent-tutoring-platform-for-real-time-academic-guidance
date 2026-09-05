# AI Tutor Platform - Local Deployment Guide

This guide will help you set up and run the AI Tutor Platform on your local machine.

## Prerequisites

- **Node.js**: Version 18 or higher.
- **NPM**: Usually comes with Node.js.
- **Firebase Project**: You'll need a Firebase project with Authentication (Google Provider) and Firestore enabled.
- **Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Setup Instructions

### 1. Clone or Download the Project
Extract the project files to a directory of your choice.

### 2. Install Dependencies
Open your terminal in the project root and run:
```bash
npm install
```

### 3. Configure Environment Variables
A `.env` file has already been created for you with your Firebase configuration.
Open the `.env` file in the root directory and add your **`GEMINI_API_KEY`**:
- `GEMINI_API_KEY`: Your Google AI Studio API key (Get it from [here](https://aistudio.google.com/app/apikey)).

### 4. Firebase Security Rules
Ensure your Firestore Security Rules are set up. You can copy the rules from `firestore.rules` in this project and paste them into the Firebase Console (Firestore > Rules).

### 5. Run the Application
Start the development server (which runs both the Express backend and Vite frontend):
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## Production Build
To create a production-ready build:
```bash
npm run build
npm start
```

## Key Features for Local Use
- **Custom API Key**: You can also set your API key directly in the app's Dashboard by clicking the **Key icon**. This key is stored in your browser's local storage.
- **File Uploads**: The app supports PDF and PPT uploads, which are processed by the local Express server.
- **Live Tutor**: Real-time voice interaction using Gemini 3.1 Flash Live.
