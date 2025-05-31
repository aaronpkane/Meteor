// src/components/common/LoadingSpinner.js
import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid ${props => props.theme.colors.neutral.softGrey}; /* Light grey */
  border-top: 4px solid ${props => props.theme.colors.primary}; /* Primary color */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
  margin: ${props => props.theme.spacing.large} auto; /* Center the spinner */
`;

const LoadingSpinner = () => {
  return <Spinner />;
};

export default LoadingSpinner;
