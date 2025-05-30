// src/pages/admin/AdminMentorApplicationsPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';


const AdminApplicationsContainer = styled.div`
  padding: ${props => props.theme.spacing.large};

  h1 {
    margin-bottom: ${props => props.theme.spacing.large};
    color: ${props => props.theme.colors.primary};
  }
`;

const ApplicationList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ApplicationItem = styled.li`
  background-color: ${props => props.theme.colors.neutral.white};
  padding: ${props => props.theme.spacing.large};
  margin-bottom: ${props => props.theme.spacing.large};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  h3 {
      margin-top: 0;
      margin-bottom: ${props => props.theme.spacing.small};
      color: ${props => props.theme.colors.secondary};
  }

   p, ul {
       margin-bottom: ${props => props.theme.spacing.medium};
   }

    ul {
        list-style: disc;
        padding-left: ${props => props.theme.spacing.large};
    }
`;

const ApplicationActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.medium};
  margin-top: ${props => props.theme.spacing.medium};
`;

const RejectionReasonInput = styled.div`
    margin-top: ${props => props.theme.spacing.medium};
    margin-bottom: ${props => props.theme.spacing.medium};
    label {
        display: block;
        margin-bottom: ${props => props.theme.spacing.small};
        font-weight: bold;
    }
`;


const AdminMentorApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState({}); // Store reason per application ID
  const [actionLoading, setActionLoading] = useState({}); // Store loading state per action per application ID

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'pending_mentor'));
        const querySnapshot = await getDocs(q);
        const applicationsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApplications(applicationsList);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load mentor applications.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

   const handleAction = async (applicationId, action) => {
       // action can be 'approve' or 'reject'
       setActionLoading(prev => ({ ...prev, [applicationId]: action }));
       setError(null);
       try {
            const applicationRef = doc(db, 'users', applicationId);
            const updateData = {
                mentorApplicationStatus: action,
                rejectionReason: null, // Clear rejection reason on approval
            };

            if (action === 'approve') {
                updateData.role = 'mentor'; // Change role to mentor
                updateData.isVerified = true; // Mark as verified
            } else { // reject
                 updateData.role = 'rejected_mentor'; // Change role to rejected_mentor
                 updateData.isVerified = false; // Not verified
                 updateData.rejectionReason = rejectionReason[applicationId] || null; // Save rejection reason
            }

            await updateDoc(applicationRef, updateData);

             // Remove the application from the list after processing
             setApplications(prev => prev.filter(app => app.id !== applicationId));
             setRejectionReason(prev => {
                 const newState = { ...prev };
                 delete newState[applicationId]; // Clean up reason state
                 return newState;
             });

           // Cloud Function 'onMentorApplicationUpdate' should be triggered by the status change

       } catch (err) {
            console.error(`Error ${action}ing application ${applicationId}:`, err);
            setError(`Failed to ${action} application.`);
       } finally {
            setActionLoading(prev => {
                const newState = { ...prev };
                 delete newState[applicationId]; // Clear loading state
                 return newState;
            });
       }
   };


  if (isLoading) {
    return <AdminApplicationsContainer><LoadingSpinner /><p>Loading applications...</p></AdminApplicationsContainer>;
  }

  if (error) {
    return <AdminApplicationsContainer><ErrorMessage>{error}</ErrorMessage></AdminApplicationsContainer>;
  }

  if (applications.length === 0) {
    return <AdminApplicationsContainer><p>No pending mentor applications.</p></AdminApplicationsContainer>;
  }

  return (
    <AdminApplicationsContainer>
      <h1>Review Mentor Applications</h1>
      <ApplicationList>
        {applications.map(app => (
          <ApplicationItem key={app.id}>
            <h3>{app.fullName}</h3>
            <p><strong>Email:</strong> {app.email}</p>
            <p><strong>Bio:</strong> {app.professionalBio || 'Not provided.'}</p>
            <p><strong>Industries:</strong> {app.industriesOfExpertise?.join(', ') || 'None listed.'}</p>
            <p><strong>Experience:</strong> {app.yearsExperience ?? 'N/A'} years</p>
            <p><strong>LinkedIn:</strong> {app.linkedinProfile ? <a href={app.linkedinProfile} target="_blank" rel="noopener noreferrer">{app.linkedinProfile}</a> : 'Not provided.'}</p>
             <p><strong>Availability:</strong> {app.availability?.hoursPerWeek ?? 'N/A'} hours/week, {app.availability?.preferredTimes || 'N/A'}</p>

            <ApplicationActions>
              <Button onClick={() => handleAction(app.id, 'approve')} disabled={actionLoading[app.id] === 'approve' || actionLoading[app.id] === 'reject'}>
                  {actionLoading[app.id] === 'approve' ? 'Approving...' : 'Approve'}
              </Button>
               <Button onClick={() => handleAction(app.id, 'reject')} disabled={actionLoading[app.id] === 'approve' || actionLoading[app.id] === 'reject'} variant="secondary">
                  {actionLoading[app.id] === 'reject' ? 'Rejecting...' : 'Reject'}
              </Button>
            </ApplicationActions>
             {/* Show rejection reason input only if rejecting this specific application */}
             {actionLoading[app.id] === 'reject' && (
                  <RejectionReasonInput>
                      <label htmlFor={`rejectionReason_${app.id}`}>Reason for Rejection (Optional):</label>
                      <Textarea
                          id={`rejectionReason_${app.id}`}
                          value={rejectionReason[app.id] || ''}
                          onChange={(e) => setRejectionReason({ ...rejectionReason, [app.id]: e.target.value })}
                          rows="3"
                          placeholder="Enter reason here..."
                      />
                  </RejectionReasonInput>
              )}
             {actionLoading[app.id] && actionLoading[app.id] !== 'approve' && actionLoading[app.id] !== 'reject' && <LoadingSpinner />} {/* Show spinner for overall action */}
          </ApplicationItem>
        ))}
      </ApplicationList>
    </AdminApplicationsContainer>
  );
};

export default AdminMentorApplicationsPage;
