// src/pages/LoginPage.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input'; // We will create a common Input

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: ${props => props.theme.spacing.large};
`;

const LoginFormWrapper = styled.div`
  background-color: ${props => props.theme.colors.neutral.white};
  padding: ${props => props.theme.spacing.xlarge};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
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

  ${Input} { /* Style the common Input component */
    width: 100%;
    box-sizing: border-box; /* Include padding and border in element's total width */
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

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      await login(email, password);
      // Redirect handled by ProtectedRoute or AuthContext listener might redirect on profile load
       navigate('/'); // Redirect to home or dashboard on successful login (ProtectedRoute will handle further redirects like onboarding)
    } catch (err) {
        console.error("Login Error:", err);
      // Display user-friendly error message
      if (err.code === 'auth/user-not-found') {
          setError('No user found with this email.');
      } else if (err.code === 'auth/wrong-password') {
           setError('Incorrect password.');
      } else if (err.code === 'auth/invalid-email') {
           setError('Invalid email address format.');
      } else {
          setError('Failed to login. Please check your credentials.');
      }
    }
  };

  return (
    <LoginContainer>
      <LoginFormWrapper>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
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
            />
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Logging In...' : 'Login'}
          </Button>
        </form>

        <StyledLink to="/forgot-password">Forgot Password?</StyledLink> {/* Forgot password page needed */}
        <StyledLink to="/signup">Don't have an account? Sign Up</StyledLink>
      </LoginFormWrapper>
    </LoginContainer>
  );
};

export default LoginPage;
