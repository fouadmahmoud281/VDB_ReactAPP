# Build stage
#FROM node:20-alpine as build

# Set working directory
#WORKDIR /app

# Copy package.json and package-lock.json
#COPY package*.json ./

# Install dependencies
#RUN npm ci

# Copy all files
#COPY . .

# Build the app
# The build process will use environment variables from the build environment
#RUN npm run build

# Production stage
#FROM nginx:alpine

# Copy built files from build stage to nginx serve directory
#COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed
#COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
#EXPOSE 80

# Command to run nginx in foreground
#CMD ["nginx", "-g", "daemon off;"]



FROM node:20.18.0-alpine AS builder 
WORKDIR /app 
COPY package*.json ./
RUN npm install 
COPY . . 

RUN npm run build

FROM node:20.18.0-alpine 
RUN npm install -g serve
WORKDIR /app 
COPY --from=builder /app/build /app  
EXPOSE 3000

CMD ["serve", "-s" ]
