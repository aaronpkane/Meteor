// src/components/common/Textarea.js
import styled from 'styled-components';
import Input from './Input'; // Inherit some styles from Input

const Textarea = styled.textarea`
   ${Input}; /* Inherit base styles */
   min-height: 100px; /* Default min height */
   resize: vertical; /* Allow vertical resizing */
`;

export default Textarea;
