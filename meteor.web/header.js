// src/components/layout/Header.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../common/Logo'; // We will create this

const HeaderContainer = styled.header`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.neutral.white};
  padding: ${props => props.theme.spacing.medium} ${props => props.theme.spacing.large};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Nav = styled.nav`
  ul {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    margin-left: ${props => props.theme.spacing.large};
  }

  a {
    color: ${props => props.theme.colors.neutral.white};
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Header = () => {
  const { user, userProfile, logout } = useAuth();

  return (
    <HeaderContainer>
      <Link to="/">
         <Logo /> {/* Your Meteor Logo */}
      </Link>
      <Nav>
        <ul>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          {user ? (
            <>
              {userProfile?.role === 'entrepreneur' && (
                 <li><Link to="/dashboard/entrepreneur">Dashboard</Link></li>
              )}
              {userProfile?.role === 'mentor' && (
                 <li><Link to="/dashboard/mentor">Dashboard</Link></li>
              )}
               {userProfile?.role === 'pending_mentor' && (
                 <li><Link to="/dashboard/mentor">Mentor Status</Link></li>
              )}
                {userProfile?.role === 'rejected_mentor' && (
                 <li><Link to="/dashboard/mentor">Mentor Status</Link></li>
              )}
              {userProfile?.role === 'admin' && (
                  <li><Link to="/admin">Admin</Link></li>
               )}

               {(userProfile?.role === 'entrepreneur' || userProfile?.role === undefined) && (
                 <li><Link to="/apply-mentor">Apply as Mentor</Link></li>
               )}


              <li><button onClick={logout} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1em', padding: 0 }}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
            </>
          )}
        </ul>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
