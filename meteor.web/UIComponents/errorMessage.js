// src/components/common/ErrorMessage.js
import styled from 'styled-components';

const ErrorMessage = styled.p`
  color: ${props => props.theme.colors.error};
  background-color: #f8d7da; /* Light red background */
  border: 1px solid #f5c6cb; /* Slightly darker red border */
  padding: ${props => props.theme.spacing.small};
  border-radius: 4px;
  margin-top: ${props => props.theme.spacing.medium};
  margin-bottom: ${props => props.theme.spacing.medium};
  text-align: center;
`;

export default ErrorMessage;
