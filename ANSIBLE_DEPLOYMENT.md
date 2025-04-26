# Ansible Deployment Guide for Vector Database Application

## Overview

This guide provides comprehensive documentation for deploying the Vector Database Application using Ansible. The deployment process automates several key tasks including environment configuration, Docker image building, and container deployment with appropriate API base URL settings.

## Files Structure

- `deploy.yml`: The main Ansible playbook containing all deployment tasks
- `inventory.yml`: Environment-specific inventory configuration file
- `templates/env.j2`: Jinja2 template for generating the application's .env file

## Prerequisites

- Ansible 2.9+ installed on your control machine
- SSH access to target servers with appropriate SSH keys configured
- Target servers must have sufficient permissions for package installation
- Internet access on target servers for package and dependency downloads

## Detailed Task Breakdown

The deployment playbook (`deploy.yml`) performs the following tasks in sequence:

### 1. System Preparation

- **Install Required Packages**: Installs git, docker.io, and python3-docker packages
  - These packages are essential for cloning the repository and managing Docker containers
  - If any package fails to install, the deployment will fail at this stage

- **Ensure Docker Service**: Starts and enables the Docker service
  - Verifies Docker is running and set to start on system boot
  - Critical for container operations in subsequent steps

### 2. Application Setup

- **Create Application Directory**: Creates the application directory at `/opt/vector-database-app`
  - Sets appropriate ownership and permissions (0755)
  - Creates parent directories if they don't exist

- **Clone/Update Repository**: Clones or updates the application code from the Git repository
  - Default repository: `https://github.com/yourusername/vector-database-app.git`
  - Default branch: `main`
  - These defaults can be overridden in inventory or via command line
  - The task registers whether changes were detected for conditional image rebuilding

- **Create Environment Configuration**: Generates the .env file from the Jinja2 template
  - Sets the API base URL and any other configured environment variables
  - Template is processed with variables from inventory and playbook

### 3. Docker Operations

- **Build Docker Image**: Builds the application Docker image with environment variables
  - Image name: `vector-database-app:latest` (configurable)
  - Passes the API base URL as a build argument
  - Rebuilds only when repository changes are detected
  - Pulls latest base images during build process

- **Remove Existing Container**: Removes any existing container with the same name
  - Prevents conflicts with new container deployment
  - Ignores errors if no container exists

- **Run Docker Container**: Deploys the application container
  - Maps configured host port to container port 80
  - Sets restart policy to "unless-stopped" for resilience
  - Passes environment variables to the running container

### 4. Verification and Reporting

- **Verify Application**: Tests application availability by making HTTP requests
  - Retries up to 10 times with 5-second intervals
  - Continues deployment even if verification fails (for manual troubleshooting)

- **Display Deployment Info**: Outputs deployment details including:
  - Application URL with host and port
  - Configured API base URL

## Environment Configuration

### Variable System

The deployment uses a hierarchical variable system:

1. **Default Variables**: Defined in the playbook itself
   ```yaml
   app_name: vector-database-app
   api_base_url: "https://embeddings100.cloud-stacks.com"
   host_port: 8080
   ```

2. **Environment Variables**: Defined in the inventory file for each environment
   ```yaml
   development:
     vars:
       api_base_url: https://dev-api.example.com
   ```

3. **Host-Specific Variables**: Can be defined for individual hosts
   ```yaml
   prod-server-1:
     ansible_host: prod1.example.com
     host_port: 8081  # Override environment setting
   ```

4. **Command-Line Variables**: Highest precedence, overrides all others
   ```bash
   ansible-playbook -i inventory.yml deploy.yml --extra-vars "api_base_url=https://custom-api.example.com"
   ```

### Key Configuration Variables

| Variable | Description | Default |
|----------|-------------|--------|
| `app_name` | Application and container name | `vector-database-app` |
| `app_directory` | Installation directory | `/opt/vector-database-app` |
| `api_base_url` | Base URL for API connections | `https://embeddings100.cloud-stacks.com` |
| `docker_image_name` | Docker image name | Same as `app_name` |
| `docker_image_tag` | Docker image tag | `latest` |
| `container_port` | Internal container port | `80` |
| `host_port` | External port on host | `8080` |
| `git_repo_url` | Git repository URL | `https://github.com/yourusername/vector-database-app.git` |
| `git_branch` | Git branch to deploy | `main` |

## Deployment Instructions

### Basic Deployment

To deploy to a specific environment:

```bash
ansible-playbook -i inventory.yml deploy.yml --limit development
```

To deploy to all environments:

```bash
ansible-playbook -i inventory.yml deploy.yml
```

### Advanced Deployment Options

**Dry Run (Check Mode):**
```bash
ansible-playbook -i inventory.yml deploy.yml --check
```

**Verbose Output for Debugging:**
```bash
ansible-playbook -i inventory.yml deploy.yml -vvv
```

**Deploy with Custom Variables:**
```bash
ansible-playbook -i inventory.yml deploy.yml --extra-vars "api_base_url=https://custom-api.example.com host_port=8888"
```

**Deploy to Specific Hosts:**
```bash
ansible-playbook -i inventory.yml deploy.yml --limit "prod-server-1"
```

## Customization Guide

### Adding New Environment Variables

1. Add the variable to the `templates/env.j2` file:
   ```
   NEW_VARIABLE={{ new_variable_value }}
   ```

2. Add the variable to your inventory file:
   ```yaml
   development:
     vars:
       new_variable_value: "development-value"
   ```

3. Update the Docker container environment section in `deploy.yml`:
   ```yaml
   env:
     VITE_API_BASE_URL: "{{ api_base_url }}"
     NEW_VARIABLE: "{{ new_variable_value }}"
   ```

4. If needed, add the variable to the Docker build args:
   ```yaml
   args:
     VITE_API_BASE_URL: "{{ api_base_url }}"
     NEW_VARIABLE: "{{ new_variable_value }}"
   ```

### Adding New Deployment Tasks

To add new tasks to the deployment process:

1. Edit the `deploy.yml` file and add your task in the appropriate section
2. Follow Ansible best practices for idempotent task design
3. Use conditionals (`when:`) to make tasks run only when needed
4. Register task results for use in subsequent tasks

Example of adding a database migration task:

```yaml
- name: Run database migrations
  docker_container:
    name: db-migration
    image: "{{ docker_image_name }}:{{ docker_image_tag }}"
    command: /app/migrate.sh
    env:
      DATABASE_URL: "{{ database_url }}"
    detach: no
    cleanup: yes
  when: run_migrations | default(true)
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Docker Build Failures

**Issue**: Docker image fails to build

**Troubleshooting Steps**:
1. Check internet connectivity on the target server
2. Verify Docker service is running: `systemctl status docker`
3. Check disk space: `df -h`
4. Review Docker build logs: `docker logs $(docker ps -lq)`
5. Try building manually on the server to see detailed errors

#### Application Not Accessible

**Issue**: Application deployed but not accessible

**Troubleshooting Steps**:
1. Check if container is running: `docker ps | grep vector-database-app`
2. Verify port mapping: `docker port vector-database-app`
3. Check container logs: `docker logs vector-database-app`
4. Verify firewall settings: `sudo ufw status` or `sudo firewall-cmd --list-all`
5. Test local connectivity: `curl http://localhost:8080`

#### API Connection Issues

**Issue**: Application can't connect to API

**Troubleshooting Steps**:
1. Verify API base URL in container environment: `docker inspect vector-database-app | grep VITE_API_BASE_URL`
2. Test API connectivity from server: `curl -I {{ api_base_url }}`
3. Check for network/firewall restrictions between server and API
4. Verify API is operational

## CI/CD Integration

This Ansible playbook can be integrated into various CI/CD pipelines:

### GitLab CI Example

```yaml
stages:
  - build
  - test
  - deploy

deploy_development:
  stage: deploy
  script:
    - apt-get update && apt-get install -y ansible
    - ansible-playbook -i inventory.yml deploy.yml --limit development
  only:
    - develop

deploy_production:
  stage: deploy
  script:
    - apt-get update && apt-get install -y ansible
    - ansible-playbook -i inventory.yml deploy.yml --limit production
  only:
    - main
  when: manual
```

### GitHub Actions Example

```yaml
name: Deploy Application

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Ansible
        run: sudo apt-get update && sudo apt-get install -y ansible
        
      - name: Deploy to Development
        if: github.ref == 'refs/heads/develop'
        run: ansible-playbook -i inventory.yml deploy.yml --limit development
        
      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        run: ansible-playbook -i inventory.yml deploy.yml --limit production
```

## Maintenance and Updates

### Updating the Application

To update the application to the latest version:

```bash
ansible-playbook -i inventory.yml deploy.yml
```

The playbook will automatically pull the latest changes from the configured branch and rebuild if necessary.

### Rolling Back Deployments

To roll back to a specific version:

1. Specify the commit or tag in the playbook command:
   ```bash
   ansible-playbook -i inventory.yml deploy.yml --extra-vars "git_branch=v1.2.3"
   ```

2. Or modify the inventory file to specify a version for an environment:
   ```yaml
   development:
     vars:
       git_branch: v1.2.3
   ```

### Backup and Restore

The application itself is stateless, but you may want to back up configuration:

```bash
# Backup configuration
scp user@server:/opt/vector-database-app/.env backup/env-$(date +%Y%m%d)

# Restore configuration
scp backup/env-20230101 user@server:/opt/vector-database-app/.env
```

## Security Considerations

- SSH keys are used for authentication (configured in inventory.yml)
- Sudo privileges are required for installation and Docker operations
- Environment variables containing sensitive information should be properly secured
- Consider using Ansible Vault for encrypting sensitive variables
- Docker containers run with limited privileges by default

## Performance Tuning

For high-traffic deployments, consider these adjustments:

1. Increase container resources in the Docker container task:
   ```yaml
   docker_container:
     # ... existing configuration ...
     memory: "1g"
     memory_reservation: "512m"
     cpus: 2.0
   ```

2. Configure a reverse proxy (like Nginx) for SSL termination and load balancing

3. Implement container health checks for better reliability:
   ```yaml
   docker_container:
     # ... existing configuration ...
     healthcheck:
       test: ["CMD", "curl", "-f", "http://localhost/health"]
       interval: 30s
       timeout: 10s
       retries: 3
       start_period: 40s
   ```