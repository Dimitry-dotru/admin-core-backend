# NestJS Authentication & User Management API

A full-featured authentication and user management system built with NestJS, TypeORM, and MySQL.

## Features

- User authentication with JWT
- Registration and email verification
- Password reset with OTP
- User management
- Admin panel
- Product and category management
- User activity logging
- Role-based access control

## Prerequisites

To run this project, you'll need:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Setup and Run with Docker

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd <your-repository-directory>
   ```

2. **Launch the application and database**

   ```bash
   docker-compose up -d
   ```

   This will:
   - Build the NestJS application container
   - Start a MySQL database container
   - Set up the network between containers
   - Mount volumes for data persistence

3. **Access the application**

   - API: [http://localhost:3000](http://localhost:3000)
   - Swagger Documentation: [http://localhost:3000/api](http://localhost:3000/api)

4. **Monitor logs**

   ```bash
   # View logs from all services
   docker-compose logs -f

   # View logs from specific service
   docker-compose logs -f api
   ```

5. **Stop the application**

   ```bash
   docker-compose down
   ```

   To also remove the volumes (which will delete all data):

   ```bash
   docker-compose down -v
   ```

6. **Minio setting public bucket**

   ```bash
   docker exec -it minio sh -c "
      mc alias set local http://localhost:9000 minioadmin minioadmin123 &&
      mc anonymous set public local/my-bucket &&
      echo 'Public policy set successfully!'"
   ```

## Environment Variables

The following environment variables can be modified in the `docker-compose.yml` file:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Application port | 3000 |
| NODE_ENV | Environment | production |
| DB_HOST | Database host | mysql |
| DB_PORT | Database port | 3306 |
| DB_USERNAME | Database username | nestuser |
| DB_PASSWORD | Database password | nestpassword |
| DB_DATABASE | Database name | nestdb |
| DB_SYNCHRONIZE | Auto-synchronize database schema | true |
| JWT_SECRET | Secret for JWT tokens | yoursecretkey |
| JWT_EXPIRES_IN | JWT token expiration | 30d |

## Development Setup

For local development without Docker:

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a `.env` file**

   Create a `.env` file in the root directory with the following content:

   ```
   PORT=3000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=nestuser
   DB_PASSWORD=nestpassword
   DB_DATABASE=nestdb
   DB_SYNCHRONIZE=true
   
   JWT_SECRET=yoursecretkey
   JWT_EXPIRES_IN=30d
   ```

3. **Run the application**

   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

## API Documentation

The API documentation is available via Swagger UI at `/api` endpoint.

## Project Structure

```
├── src/
│   ├── admins/          # Admin management
│   ├── auth/            # Authentication
│   ├── category/        # Categories
│   ├── charges/         # Payment charges
│   ├── common/          # Shared resources
│   ├── otp/             # OTP management
│   ├── products/        # Products
│   ├── users/           # User management
│   ├── user-activity/   # User activity tracking
│   ├── app.module.ts    # Main application module
│   └── main.ts          # Application entry point
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Docker build configuration
└── .dockerignore        # Docker ignore file
```

## License

[MIT](LICENSE)