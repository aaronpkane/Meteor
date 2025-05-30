// src/components/common/MobileDownloadBanner.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useMobileDetect from '../../hooks/useMobileDetect';

const Banner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: ${props => props.theme.colors.subtleAccent};
  color: ${props => props.theme.colors.darkGrey};
  padding: ${props => props.theme.spacing.small};
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's above other content */
  box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
`;

const BannerContent = styled.span`
  margin-right: ${props => props.theme.spacing.medium};
`;

const DismissButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.darkGrey};
  font-size: 1.2em;
  cursor: pointer;
  padding: 0 ${props => props.theme.spacing.small};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const MobileDownloadBanner = () => {
  const isMobile = useMobileDetect();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check localStorage on component mount
    const dismissed = localStorage.getItem('meteor_mobile_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    // Persist dismissal in localStorage
    localStorage.setItem('meteor_mobile_banner_dismissed', 'true');
  };

  // Only show if on mobile and not dismissed
  if (!isMobile || isDismissed) {
    return null;
  }

  const appStoreLink = process.env.REACT_APP_APP_STORE_DOWNLOAD_LINK_PLACEHOLDER || '#'; // Use placeholder or default

  return (
    <Banner>
      <BannerContent>Experience Meteor fully: <a href={appStoreLink} target="_blank" rel="noopener noreferrer">Download our app on the App Store!</a></BannerContent>
      <DismissButton onClick={handleDismiss}>&times;</DismissButton>
    </Banner>
  );
};

export default MobileDownloadBanner;
