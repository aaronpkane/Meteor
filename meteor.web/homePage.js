// src/pages/HomePage.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeroSection = styled.section`
  background-color: ${props => props.theme.colors.subtleAccent}; /* Light Blue background */
  padding: ${props => props.theme.spacing.xlarge} 0;
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xlarge};
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;

  h1 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.medium};
  }

  p {
    font-size: 1.2em;
    color: ${props => props.theme.colors.darkGrey};
    margin-bottom: ${props => props.theme.spacing.large};
  }
`;

const CtaButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing.medium};
`;

const CtaButton = styled(Link)`
  display: inline-block;
  padding: ${props => props.theme.spacing.medium} ${props => props.theme.spacing.large};
  background-color: ${props => props.bgColor || props.theme.colors.primary};
  color: ${props => props.color || props.theme.colors.neutral.white};
  border-radius: 8px;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${props => props.hoverBgColor || props.theme.colors.secondary};
    text-decoration: none;
  }
`;

const Section = styled.section`
  padding: ${props => props.theme.spacing.large} 0;
  margin-bottom: ${props => props.theme.spacing.xlarge};
  border-bottom: 1px solid ${props => props.theme.colors.neutral.softGrey};

  &:last-child {
      border-bottom: none;
  }

  h2 {
    text-align: center;
    margin-bottom: ${props => props.theme.spacing.large};
  }
`;

const SectionContent = styled.div`
    max-width: 900px;
    margin: 0 auto;
    /* Add layout like grid/flex for multi-column content */
`;


const HomePage = () => {
  return (
    <>
      <HeroSection>
        <HeroContent>
          <h1>Launch Your Business to New Heights</h1>
          <p>Connect with experienced mentors who can provide the guidance and support you need to accelerate your entrepreneurial journey.</p>
          <CtaButtons>
            <CtaButton to="/signup">Become an Entrepreneur</CtaButton>
            <CtaButton to="/apply-mentor" bgColor={props => props.theme.colors.secondary} hoverBgColor={props => props.theme.colors.primary}>Apply to be a Mentor</CtaButton>
          </CtaButtons>
        </HeroContent>
      </HeroSection>

      <Section>
          <h2>How Meteor Works</h2>
          <SectionContent>
              {/* Describe the process: Sign Up -> Onboarding -> Matching -> Mentorship */}
              <p><strong>1. Sign Up:</strong> Create your account as an entrepreneur or apply to be a mentor.</p>
              <p><strong>2. Onboarding (Entrepreneurs):</strong> Complete a brief personality assessment and share your business goals.</p>
              <p><strong>3. Matching:</strong> Our smart algorithm suggests mentors based on industry, goals, and compatibility.</p>
              <p><strong>4. Connect & Grow:</strong> Request mentorships and start communicating through our in-app chat.</p>
          </SectionContent>
      </Section>

       <Section>
          <h2>Why Choose Meteor?</h2>
           <SectionContent>
              {/* Benefits for entrepreneurs and mentors */}
              <p><strong>For Entrepreneurs:</strong> Gain invaluable insights, overcome challenges, and accelerate your growth with personalized guidance from seasoned professionals.</p>
              <p><strong>For Mentors:</strong> Give back to the community, share your expertise, and help shape the next generation of successful businesses. Expand your network and reinforce your leadership.</p>
          </SectionContent>
      </Section>

       <Section>
          <h2>What Our Users Say</h2>
           <SectionContent>
              {/* Testimonials section - placeholder */}
              <p>"Meteor connected me with a mentor who completely changed my perspective on scaling. Highly recommended!" - Sarah K.</p>
               <p>"Being a mentor on Meteor is incredibly rewarding. I get to share my experience and help founders avoid common pitfalls." - David L.</p>
          </SectionContent>
      </Section>
    </>
  );
};

export default HomePage;
