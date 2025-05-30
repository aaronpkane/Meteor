// src/styles/GlobalStyles.js
import { createGlobalStyle } from 'styled-components';
import theme from './theme'; // Import theme to use colors/fonts

const GlobalStyles = createGlobalStyle`
  /* Import Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Open+Sans:wght@400;600&display=swap');
  /* Or for Montserrat and Roboto */
  /* @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Roboto:wght@400;600&display=swap'); */


  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: ${theme.fonts.body};
    color: ${theme.colors.neutral.darkGrey};
    line-height: 1.6;
    background-color: ${theme.colors.neutral.softGrey}; /* Soft Grey background for the app */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.fonts.heading};
    color: ${theme.colors.primary};
    line-height: 1.2;
    margin-top: 0;
  }

  h1 { font-size: 2.5em; }
  h2 { font-size: 2em; }
  h3 { font-size: 1.5em; }

  p {
      margin-bottom: 1em;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  ul {
      list-style: none;
      padding: 0;
  }

  button {
      cursor: pointer;
      font-family: ${theme.fonts.body}; /* Use body font for buttons */
  }

  input, textarea, select {
      font-family: ${theme.fonts.body};
      padding: ${theme.spacing.small};
      border: 1px solid #ccc;
      border-radius: 4px;
      &:focus {
          outline: none;
          border-color: ${theme.colors.primary};
          box-shadow: 0 0 0 0.1rem ${theme.colors.primary}40; /* Add a subtle focus glow */
      }
  }
`;

export default GlobalStyles;
