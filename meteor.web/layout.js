// src/components/layout/Layout.js
import React from 'react';
import Header from './Header'; // We will create this
import Footer from './Footer'; // We will create this
import MobileDownloadBanner from '../common/MobileDownloadBanner'; // We will create this
import styled from 'styled-components';

const Content = styled.main`
  flex-grow: 1;
  padding: ${props => props.theme.spacing.medium};
  max-width: 1200px; /* Optional: max width for content */
  margin: 0 auto; /* Center content */
  width: 100%;
`;

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Layout = ({ children }) => {
  return (
    <LayoutWrapper>
      <Header />
      <Content>{children}</Content>
      <MobileDownloadBanner />
      <Footer />
    </LayoutWrapper>
  );
};

export default Layout;
