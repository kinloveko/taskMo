# Task Management Mobile Application

## Objective

This coding challenge is designed to evaluate your expertise as a Mobile App Developer. It focuses on your ability to produce high-quality, efficient, and maintainable code while demonstrating proficiency with contemporary mobile development tools and frameworks.

## Task Overview

You are tasked with creating a task management mobile application. The application must enable users to perform core operations—creating, viewing, updating, and deleting tasks—while incorporating secure user authentication and real-time data synchronization across devices using Supabase.

## Features Implemented

- **User Authentication**: Secure user registration and login functionality.
- **User Profile**: Ability for users to update their profile details.
- **Task Management**: Users can add tasks with or without checklists, including task name, description, start and due dates, and priority (low, medium, high).
- **Task Updates**: Tasks can be updated, deleted, or marked as completed.
- **Task Interaction**:
  - Swipe left to edit or delete a task.
  - Swipe right to mark a task as completed.
  - Checklist items can be checked or unchecked.

### Login
<img width="1032" alt="Screenshot 2025-03-06 at 12 02 24 AM" src="https://github.com/user-attachments/assets/31855f03-8360-4a05-a799-a8c9fc6d968f" />

### Registration
<img width="1032" alt="Screenshot 2025-03-06 at 12 02 35 AM" src="https://github.com/user-attachments/assets/67e82c26-8b68-45b4-94bb-6022ed19a777" />

### Dashboard
<img width="1032" alt="Screenshot 2025-03-06 at 12 03 26 AM" src="https://github.com/user-attachments/assets/6441ff59-3062-4c37-bd33-04984dc7cf0d" />

### Functionalities for Completing the task and Actions for edit and delete
<img width="1032" alt="Screenshot 2025-03-06 at 12 03 40 AM" src="https://github.com/user-attachments/assets/3835bd8c-4d7b-42cd-9917-6e403e860ded" />
<img width="1032" alt="Screenshot 2025-03-06 at 12 03 52 AM" src="https://github.com/user-attachments/assets/d97b7767-1b74-4e31-a985-724542fbd59e" />

### Add task & Profile
<img width="1032" alt="Screenshot 2025-03-06 at 12 04 12 AM" src="https://github.com/user-attachments/assets/a3331257-0375-4edb-a419-a827fc4464e5" />


## Technologies

| **Category**               | **Details**                                                                 |
|----------------------------|-----------------------------------------------------------------------------|
| **Core Framework**          | React Native                                                                |
| **Development Environment** | Expo                                                                        |
| **Language**                | TypeScript                                                                  |
| **Backend Services**        | Supabase (for authentication, real-time data synchronization, and persistent storage) |
| **Libraries/Tools**         | React Navigation (for app navigation) <br> React Native Paper (for UI components) <br> Supabase (for real-time database and authentication services) |



## Setup Instructions

### Prerequisites

Before you begin, make sure you have the following installed on your machine:

- **Node.js** (LTS version recommended): [Download Node.js](https://nodejs.org/)
- **Expo CLI**: Install Expo CLI by running `npm install -g expo-cli` in your terminal/command prompt.


### Step 1: Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/your-username/task-management-app.git`
```
### Step 2: Install Dependencies
Navigate to the project directory and install the necessary dependencies:

```bash
cd taskMo

yarn
or
npm install --legacy-peer-deps
```
### Step 3: Running the Application
To run the application on iOS or Android simulators or physical devices:

# iOS
If you are using macOS, you can run the app on an iOS simulator or a physical device using Expo.
```bash
npm run ios
```
# Android
To run the app on an Android simulator or a physical device, use the following command:
```bash
npm run android
```
