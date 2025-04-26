# Docker Setup Guide

This document provides instructions for running the application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Development Environment

To start the application in development mode:

```bash
# Start the application
docker-compose up
```

The application will be available at http://localhost:8080

### Production Build

To build and run the application for production:

```bash
# Build the Docker image
docker build -t vector-database-app .

# Run the container
docker run -p 8080:80 -e VITE_API_BASE_URL=https://your-api-url.com vector-database-app
```

## Environment Variables

The application uses the following environment variables:

- `VITE_API_BASE_URL`: The base URL for the API (default: https://embeddings100.cloud-stacks.com)

You can set these variables in several ways:

1. In a `.env` file in the project root (for docker-compose)
2. As command-line arguments when running docker-compose or docker run
3. In your CI/CD pipeline configuration

### Example .env file

```
VITE_API_BASE_URL=https://your-api-url.com
```

## Docker Compose Configuration

The `docker-compose.yml` file includes:

- A frontend service running the React application
- Environment variable configuration
- Port mapping (8080:80)

You can extend this configuration to include additional services as needed.

## Integration with Ansible

This Docker setup is compatible with the existing Ansible deployment strategy. The environment variables used in the Docker setup match those expected by Ansible.

For Ansible-managed deployments, you can:

1. Build the Docker image as part of your Ansible playbook
2. Set the appropriate environment variables during the build or run process
3. Deploy the container to your target environment

Refer to the `ANSIBLE.md` file for more details on Ansible integration.

## Troubleshooting

### API Connection Issues

If you're experiencing issues connecting to the API:

1. Verify that the `VITE_API_BASE_URL` environment variable is set correctly
2. Check that the API is accessible from within the Docker container
3. Inspect the browser console for any CORS or connection errors

### Container Won't Start

If the container fails to start:

1. Check the Docker logs: `docker logs <container_id>`
2. Verify that port 8080 is not already in use on your host machine
3. Ensure that all required environment variables are set