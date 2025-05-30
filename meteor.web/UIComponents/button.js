// src/components/common/Button.js
import styled from 'styled-components';

const Button = styled.button`
  display: inline-block;
  padding: ${props => {
    switch (props.size) {
      case 'small': return `${props.theme.spacing.small} ${props.theme.spacing.medium}`;
      case 'large': return `${props.theme.spacing.medium} ${props.theme.spacing.xlarge}`;
      default: return `${props.theme.spacing.medium} ${props.theme.spacing.large}`;
    }
  }};
  background-color: ${props => {
    if (props.variant === 'secondary') return props.theme.colors.neutral.softGrey;
    if (props.variant === 'danger') return '#dc3545'; // Example danger color
    if (props.variant === 'success') return '#28a745'; // Example success color
    return props.theme.colors.primary;
  }};
  color: ${props => {
     if (props.variant === 'secondary') return props.theme.colors.darkGrey;
     return props.theme.colors.neutral.white;
  }};
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, opacity 0.3s ease;

  &:hover {
     background-color: ${props => {
        if (props.variant === 'secondary') return '#e2e6ea'; // Lighter grey on hover
        if (props.variant === 'danger') return '#c82333';
        if (props.variant === 'success') return '#218838';
        return props.theme.colors.secondary; // Hover to orange
     }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default Button;
