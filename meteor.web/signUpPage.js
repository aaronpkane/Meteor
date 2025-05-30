// src/pages/SignUpPage.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebaseConfig';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select'; // We will create a common Select
import Checkbox from '../components/common/Checkbox'; // We will create a common Checkbox

const SignUpContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: ${props => props.theme.spacing.large};
`;

const SignUpFormWrapper = styled.div`
  background-color: ${props => props.theme.colors.neutral.white};
  padding: ${props => props.theme.spacing.xlarge};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  text-align: center;

  h1 {
    margin-bottom: ${props => props.theme.spacing.large};
    color: ${props => props.theme.colors.primary};
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.medium};
  text-align: left;

  label {
    display: block;
    margin-bottom: ${props => props.theme.spacing.small};
    font-weight: bold;
    color: ${props => props.theme.colors.darkGrey};
  }

  ${Input}, ${Select} { /* Style common Input and Select */
    width: 100%;
    box-sizing: border-box;
  }
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.colors.error};
  margin-top: ${props => props.theme.spacing.medium};
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const StyledLink = styled(Link)`
    display: block;
    margin-top: ${props => props.theme.spacing.medium};
    color: ${props => props.theme.colors.primary};
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

const PrivacyPolicyGroup = styled(FormGroup)`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${props => props.theme.spacing.small};

    label {
        margin-bottom: 0;
        font-weight: normal;
    }
`;


const industries = [
    'Tech', 'Finance', 'Retail', 'Healthcare', 'Arts & Media',
    'Education', 'Manufacturing', 'Agriculture', 'Other'
];

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [industry, setIndustry] = useState(industries[0]); // Default to first industry
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState(null);
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreePrivacy) {
        setError('You must agree to the privacy policy.');
        return;
    }

    try {
      const user = await signup(email, password); // Create user in Firebase Auth

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        industry: industry,
        role: 'entrepreneur', // Default role for sign-ups
        onboardingComplete: false,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
        // Add placeholder fields for personality scores and business goals
        personalityScores: { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 },
        businessGoals: '',
      });

      // Redirect to onboarding page
      navigate('/onboarding');

    } catch (err) {
      console.error("Signup Error:", err);
      // Display user-friendly error message
        if (err.code === 'auth/email-already-in-use') {
            setError('This email address is already in use.');
        } else if (err.code === 'auth/invalid-email') {
            setError('Invalid email address format.');
        } else if (err.code === 'auth/weak-password') {
             setError('Password is too weak. Please use at least 6 characters.');
        } else {
            setError('Failed to sign up. Please try again.');
        }
    }
  };

  return (
    <SignUpContainer>
      <SignUpFormWrapper>
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
           <FormGroup>
            <label htmlFor="fullName">Full Name</label>
            <Input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="email">Email</label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="password">Password</label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
          </FormGroup>
           <FormGroup>
            <label htmlFor="industry">Industry</label>
            <Select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} required>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </Select>
          </FormGroup>

            <PrivacyPolicyGroup>
                 <Checkbox
                     id="agreePrivacy"
                     checked={agreePrivacy}
                     onChange={(e) => setAgreePrivacy(e.target.checked)}
                     required
                 />
                <label htmlFor="agreePrivacy">I agree to the <a href="/privacy" target="_blank">Privacy Policy</a></label> {/* Link to privacy policy page needed */}
            </PrivacyPolicyGroup>


          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>

        <StyledLink to="/login">Already have an account? Login</StyledLink>
      </SignUpFormWrapper>
    </SignUpContainer>
  );
};

export default SignUpPage;
