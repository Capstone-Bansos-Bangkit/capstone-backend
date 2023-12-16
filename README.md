# Capstone Project Backend
[CH2-PS230] Bangkit Academy 2023 Batch 2 Product Capstone

API Documentation: https://capstone-404814.appspot.com

## Pre-requisites

-   Any PostgreSQL instance
-   Node.js 18 or higher
-   Google Cloud Storage Bucket
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

-   ### Obtain secrets file
    All the values within the `.env` file should be set. 
    
    Then you need to get your GCP service account key (JSON) inside the project root dir as `cred.json`.

-   ### Run the project for development

    ```
    npm run dev
    ```

    This command will start the server on http://localhost:1337. The server will automatically restart if you make any changes to the code.

-   ### Build the project for production
    ```
    npm run build
    ```

## Deployment

This project is automatically deployed on the Google App Engine when a new tag is pushed to the repository. The tag must be in the format `vX.Y.Z`. For example, `v0.1.2` (we don't enforce [semantic versioning](https://semver.org/), we only use the version format).

We chose Google App Engine because it is easy to deploy for prototype project like this.

For the database, we're using `postgres:16` image and deployed it using docker inside a Compute Engine.
