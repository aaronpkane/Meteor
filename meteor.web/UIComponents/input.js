// src/components/common/Input.js
import styled from 'styled-components';

const Input = styled.input`
  padding: ${props => props.theme.spacing.small};
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;

   &:focus {
       outline: none;
       border-color: ${props => props.theme.colors.primary};
       box-shadow: 0 0 0 0.1rem ${props => props.theme.colors.primary}40;
   }
`;

export default Input;
