// Theme configuration for the Vector Database Explorer app

export const THEME = {
  bgColor: "#0E1117",
  secondaryBgColor: "#1E2129",
  textColor: "#E0E0E0",
  primaryColor: "#4B56D2",
  accentColor: "#82C3EC",
  successColor: "#4CAF50",
  warningColor: "#FFC107",
  errorColor: "#EF5350",
  fontFamily: "'Inter', sans-serif"
};

// API endpoints are now imported from the centralized config file
import { config, formatIndexApiUrl } from './config';

// Re-export for backward compatibility
export const API_ENDPOINTS = {
  EMBED_API: config.api.endpoints.embed,
  INDEX_API: config.api.endpoints.index,
  SEARCH_API: config.api.endpoints.search
};

// Re-export the formatIndexApiUrl function for backward compatibility
export { formatIndexApiUrl };