// Configuration file for environment-specific settings
// This file centralizes all configurable parameters that can be modified by Ansible during deployment

// The base URL for the API can be overridden by environment variables
// Default value is used for local development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://embeddings100.cloud-stacks.com';

// Configuration object that can be imported throughout the application
export const config = {
  api: {
    baseUrl: API_BASE_URL,
    endpoints: {
      embed: `${API_BASE_URL}/embed`,
      index: `${API_BASE_URL}/index/{collection_name}`,
      search: `${API_BASE_URL}/search`,
      status: `${API_BASE_URL}/status`
    }
  },
  // Add other configurable parameters here as needed
};

// Helper function to format the index API URL with collection name
export const formatIndexApiUrl = (collectionName: string): string => {
  return config.api.endpoints.index.replace('{collection_name}', collectionName);
};