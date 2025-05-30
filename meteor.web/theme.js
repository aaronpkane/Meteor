// src/styles/theme.js
const theme = {
  colors: {
    primary: '#2A3F70', // Deep Blue
    secondary: '#FF6B00', // Warm Orange
    neutral: {
      white: '#FFFFFF', // Clean White
      softGrey: '#F5F7FA', // Soft Grey for backgrounds
      darkGrey: '#333333', // Dark Grey for text
    },
    subtleAccent: '#ADD8E6', // Light Blue
    error: '#FF0000', // Example Error Red
    success: '#00FF00', // Example Success Green
  },
  fonts: {
    heading: "'Poppins', sans-serif", // Or 'Montserrat'
    body: "'Open Sans', sans-serif", // Or 'Roboto'
  },
  // Add other theme properties like spacing, breakpoints, etc.
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
  },
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '992px',
  },
};

export default theme;
