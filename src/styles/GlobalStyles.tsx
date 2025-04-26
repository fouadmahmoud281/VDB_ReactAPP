import { Global, css } from '@emotion/react';
import { THEME } from '../theme';

const GlobalStyles = () => (
  <Global
    styles={css`
      /* Absolutely minimal fonts */
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf) format('truetype');
      }
      
      /* TARGETED FIX FOR LAYOUT ISSUES */
      html {
        font-size: 13px;
      }
      
      body {
        background: ${THEME.bgColor};
        color: ${THEME.textColor};
        font-family: 'Inter', sans-serif;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }
      
      /* Prevent any default margins/padding */
      * {
        box-sizing: border-box;
      }
      
      /* CRITICAL FIX: Apply fixed position margins and padding to main containers */
      body, #root {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      
      /* CRITICAL FIX: Force visibility of main containers */
      /* These are high-specificity selectors to ensure they take precedence */
      body > div#root > div,
      body > div#root > div > div,
      body > div#root > div > div > div,
      body > div#root > div > div > div > div {
        display: block !important;
        position: relative !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
        max-height: none !important;
        visibility: visible !important;
        overflow: visible !important;
      }
      
      /* TARGETED FIX: Force main content area to scroll if needed instead of being hidden */
      main, [role="main"], div[class*="main"], div[class*="content"], div[class*="Content"] {
        overflow-y: auto !important;
        max-height: none !important;
        padding-top: 20px !important;
      }
      
      /* TARGETED FIX: Add spacer at the top to push content down if header is absolute positioned */
      body > div#root > div:first-child {
        margin-top: 20px !important;
      }
      
      /* TARGETED FIX: For headers with fixed/absolute positioning */
      header, [role="banner"], div[class*="header"], div[class*="Header"], nav, [role="navigation"] {
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        z-index: 1000 !important;
        visibility: visible !important;
        display: block !important;
      }
      
      /* TARGETED FIX: Adjust heights of specific problem areas */
      h1, h2, h3, [class*="title"], [class*="Title"] {
        line-height: 1.3 !important;
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
        max-height: none !important;
      }
      
      /* TARGETED FIX: Ensure buttons and controls are visible */
      button, [role="button"], input, textarea, select {
        height: auto !important;
        min-height: 30px !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* TARGETED FIX: Override any fixed viewport heights causing issues */
      [style*="height: 100vh"], [style*="height:100vh"], [style*="height: calc"] {
        height: auto !important;
        min-height: auto !important;
      }
      
      /* TARGETED FIX: Override any sticky/fixed positioning */
      [style*="position: fixed"], [style*="position:fixed"],
      [style*="position: sticky"], [style*="position:sticky"],
      [style*="position: absolute"], [style*="position:absolute"] {
        position: relative !important;
        top: auto !important;
        left: auto !important;
      }
      
      /* ABSOLUTELY CRITICAL FIX: Apply specific margin adjustments to key containers */
      div[class*="Page"], div[class*="page"], div[class*="Container"], div[class*="container"],
      section, article, main, [role="main"] {
        margin-top: 10px !important;
        margin-bottom: 10px !important;
      }
    `}
  />
);

export default GlobalStyles;