// src/pages/AboutPage.js
import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
  padding: ${props => props.theme.spacing.large};
  h1 {
      margin-bottom: ${props => props.theme.spacing.large};
      text-align: center;
  }
  p {
      font-size: 1.1em;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto ${props => props.theme.spacing.medium} auto;
  }
`;


const AboutPage = () => {
  return (
    <AboutContainer>
      <h1>About Meteor</h1>
      <p>
        Meteor was founded with the vision of creating a powerful platform where entrepreneurial ambition meets experienced guidance. We believe that access to the right mentor at the right time can be a game-changer for startups and growing businesses.
      </p>
      <p>
        Our mission is to facilitate meaningful connections between passionate entrepreneurs and verified industry veterans who are eager to share their knowledge, insights, and network.
      </p>
      <p>
        We strive to build a supportive community that fosters learning, growth, and success for everyone involved. Join us in building the future, one mentorship at a time.
      </p>
       {/* Add more content about the team, values, etc. */}
    </AboutContainer>
  );
};

export default AboutPage;
