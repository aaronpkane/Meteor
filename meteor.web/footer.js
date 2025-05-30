// src/components/layout/Footer.js
import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.neutral.white};
  text-align: center;
  padding: ${props => props.theme.spacing.medium} ${props => props.theme.spacing.large};
  margin-top: ${props => props.theme.spacing.xlarge}; /* Space above footer */
`;

const Footer = () => {
  return (
    <FooterContainer>
      <p>&copy; {new Date().getFullYear()} Meteor. All rights reserved.</p>
      {/* Add footer links here if needed */}
    </FooterContainer>
  );
};

export default Footer;
