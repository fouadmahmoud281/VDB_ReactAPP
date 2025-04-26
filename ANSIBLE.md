# Ansible Deployment Guide

## Overview

This application has been configured to be Ansible-ready, allowing for easy deployment to different environments by simply changing the API base URL through environment variables.

## Configuration

The main configuration that can be modified during deployment is the API base URL. This is controlled through the `VITE_API_BASE_URL` environment variable.

## Ansible Integration

### Example Ansible Task

Here's an example of how to set the API base URL in your Ansible playbook:

```yaml
- name: Create .env file with environment-specific configuration
  template:
    src: templates/env.j2
    dest: "{{ app_directory }}/.env"
    owner: "{{ app_user }}"
    group: "{{ app_group }}"
    mode: '0644'
```

### Example Template (env.j2)

```
# Environment configuration
VITE_API_BASE_URL={{ api_base_url }}
```

### Example Variables in Inventory

In your inventory file or group_vars:

```yaml
# Development environment
api_base_url: https://dev-api.example.com

# Production environment
api_base_url: https://api.example.com
```

## Build Process

When building the application for production, the environment variables will be embedded into the built files. Make sure to set the environment variables before running the build command:

```bash
# For manual builds
VITE_API_BASE_URL=https://api.example.com npm run build

# For Ansible-managed builds
- name: Build the application
  shell: |
    cd {{ app_directory }}
    npm run build
  environment:
    VITE_API_BASE_URL: "{{ api_base_url }}"
```

## Local Development

For local development, you can create a `.env.local` file in the project root with your local configuration:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Troubleshooting

If the API connection is not working as expected:

1. Check that the `.env` file exists and contains the correct `VITE_API_BASE_URL` value
2. Verify that the Vite build process is correctly embedding the environment variables
3. Check the browser console for any CORS or connection errors