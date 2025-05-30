// src/components/common/Logo.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const LogoText = styled.span`
  font-family: ${props => props.theme.fonts.heading};
  font-size: 1.8em;
  font-weight: bold;
  color: ${props => props.theme.colors.neutral.white};
  /* Add styles for subtle meteor/star motif here */
  /* Example: */
  /* position: relative;
  &:after {
      content: '✨'; // Replace with a better icon or image
      position: absolute;
      top: -5px;
      right: -15px;
      font-size: 0.6em;
  } */
`;

const Logo = () => {
  // In a real app, this would likely be an image or SVG
  return (
     <Link to="/" style={{ textDecoration: 'none' }}>
       <LogoText>Meteor</LogoText>
     </Link>
  );
};

export default Logo;
