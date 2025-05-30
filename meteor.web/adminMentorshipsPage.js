// src/pages/admin/AdminMentorshipsPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Link } from 'react-router-dom'; // To link to chat or profiles

const AdminMentorshipsContainer = styled.div`
  padding: ${props => props.theme.spacing.large};

  h1 {
    margin-bottom: ${props => props.theme.spacing.large};
    color: ${props => props.theme.colors.primary};
  }
`;

const MentorshipTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${props => props.theme.spacing.medium};
  background-color: ${props => props.theme.colors.neutral.white};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  th, td {
    padding: ${props => props.theme.spacing.small};
    border: 1px solid ${props => props.theme.colors.neutral.softGrey};
    text-align: left;
  }

  th {
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.neutral.white};
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: ${props => props.theme.colors.neutral.softGrey};
  }

  td a {
      color: ${props => props.theme.colors.primary};
      text-decoration: none;
      &:hover {
          text-decoration: underline;
      }
  }
`;


const AdminMentorshipsPage = () => {
  const [mentorships, setMentorships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMentorships = async () => {
      try {
           // Fetch all mentorship documents
        const querySnapshot = await getDocs(collection(db, 'mentorships'));

         // For each mentorship, fetch the full names of the entrepreneur and mentor
         const mentorshipsList = await Promise.all(querySnapshot.docs.map(async docSnap => {
             const data = { id: docSnap.id, ...docSnap.data() };

             // Fetch entrepreneur name
             if (data.entrepreneurId) {
                 const entrepreneurDoc = await getDoc(doc(db, 'users', data.entrepreneurId));
                 data.entrepreneurName = entrepreneurDoc.exists() ? entrepreneurDoc.data().fullName : 'Unknown Entrepreneur';
             } else {
                 data.entrepreneurName = 'N/A';
             }

             // Fetch mentor name
              if (data.mentorId) {
                 const mentorDoc = await getDoc(doc(db, 'users', data.mentorId));
                 data.mentorName = mentorDoc.exists() ? mentorDoc.data().fullName : 'Unknown Mentor';
             } else {
                 data.mentorName = 'N/A';
             }

             return data;
         }));

        setMentorships(mentorshipsList);
      } catch (err) {
        console.error("Error fetching mentorships:", err);
        setError("Failed to load mentorships.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorships();
  }, []);

  if (isLoading) {
    return <AdminMentorshipsContainer><LoadingSpinner /><p>Loading mentorships...</p></AdminMentorshipsContainer>;
  }

  if (error) {
    return <AdminMentorshipsContainer><ErrorMessage>{error}</ErrorMessage></AdminMentorshipsContainer>;
  }

   if (mentorships.length === 0) {
       return <AdminMentorshipsContainer><p>No mentorships found.</p></AdminMentorshipsContainer>;
   }


  return (
    <AdminMentorshipsContainer>
      <h1>Mentorship Management</h1>
        <p>Overview of all mentorships in the system.</p>

      <MentorshipTable>
          <thead>
              <tr>
                  <th>ID</th>
                  <th>Entrepreneur</th>
                  <th>Mentor</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th> {/* e.g., View Chat (Read-Only?), End Mentorship */}
              </tr>
          </thead>
          <tbody>
              {mentorships.map(mentorship => (
                  <tr key={mentorship.id}>
                      <td>{mentorship.id}</td>
                      <td>
                          {mentorship.entrepreneurName}
                           {/* Optional: Link to admin view of entrepreneur profile */}
                           {/* {mentorship.entrepreneurId && <Link to={`/admin/users/${mentorship.entrepreneurId}`}> {mentorship.entrepreneurName}</Link>} */}
                      </td>
                      <td>
                           {mentorship.mentorName}
                           {/* Optional: Link to admin view of mentor profile */}
                           {/* {mentorship.mentorId && <Link to={`/admin/users/${mentorship.mentorId}`}> {mentorship.mentorName}</Link>} */}
                      </td>
                      <td>{mentorship.status}</td>
                      <td>{mentorship.createdAt?.toDate().toLocaleString() || 'N/A'}</td>
                      <td>
                           {mentorship.status === 'active' && (
                               // Link to a read-only chat view for admin?
                               <Link to={`/admin/chat-view/${mentorship.id}`}>View Chat</Link>
                           )}
                           {/* Optional: Button to manually end mentorship */}
                      </td>
                  </tr>
              ))}
          </tbody>
      </MentorshipTable>
    </AdminMentorshipsContainer>
  );
};

export default AdminMentorshipsPage;
