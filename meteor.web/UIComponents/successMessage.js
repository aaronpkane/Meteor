// src/components/common/SuccessMessage.js
import styled from 'styled-components';

const SuccessMessage = styled.p`
  color: #155724; /* Dark green text */
  background-color: #d4edda; /* Light green background */
  border: 1px solid #c3e6cb; /* Slightly darker green border */
  padding: ${props => props.theme.spacing.small};
  border-radius: 4px;
  margin-top: ${props => props.theme.spacing.medium};
  margin-bottom: ${props => props.theme.spacing.medium};
  text-align: center;
`;

export default SuccessMessage;
