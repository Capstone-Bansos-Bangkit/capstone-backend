# Capstone Project Backend

## Pre-requisites

-   Any PostgreSQL instance
-   Node.js 18 or higher
-   npm
-   Google Cloud Credentials file (for Storage Bucket, and App Engine deployment)

## Getting Started

-   ### Clone the repository

    ```
    git clone https://github.com/Capstone-Bansos-Bangkit/capstone-backend.git
    ```

-   ### Navigate to the project directory

    ```
    cd capstone-backend
    ```

-   ### Install dependencies

    ```
    npm install
    ```

-   ### Run the project for development

    ```
    npm run dev
    ```

    This will start the server on http://localhost:1337. The server will automatically restart if you make any changes to the code.

-   ### Build the project for production
    ```
    npm run build
    ```

## Deployment

This project is automatically deployed on the Google App Engine when a new tag is pushed to the repository. The tag must be in the format `vX.Y.Z`. For example, `v0.1.2`.

We chose Google App Engine because it is easy to deploy for prototype project like this.

For the database, we deployed it on Google Compute Engine.
