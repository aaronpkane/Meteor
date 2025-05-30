// src/pages/admin/AdminDashboardPage.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const AdminContainer = styled.div`
  padding: ${props => props.theme.spacing.large};

  h1 {
    margin-bottom: ${props => props.theme.spacing.large};
    color: ${props => props.theme.colors.primary};
  }
`;

const AdminNav = styled.nav`
  ul {
    list-style: none;
    padding: 0;
    display: flex;
    gap: ${props => props.theme.spacing.medium};
    flex-wrap: wrap;
  }

  li {
    background-color: ${props => props.theme.colors.neutral.white};
    padding: ${props => props.theme.spacing.medium};
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-3px);
    }
  }

   a {
       color: ${props => props.theme.colors.darkGrey};
       font-weight: bold;
       text-decoration: none;

        &:hover {
             text-decoration: underline;
        }
   }
`;


const AdminDashboardPage = () => {
  return (
    <AdminContainer>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the Admin Panel. Select an action below:</p>

      <AdminNav>
          <ul>
              <li><Link to="/admin/mentor-applications">Review Mentor Applications</Link></li>
              <li><Link to="/admin/users">Manage Users</Link></li>
              <li><Link to="/admin/mentorships">View Mentorships</Link></li>
               {/* Add other admin links */}
          </ul>
      </AdminNav>

       {/* Add summary stats or recent activity sections */}
    </AdminContainer>
  );
};

export default AdminDashboardPage;
