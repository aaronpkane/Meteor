// src/pages/MentorDashboardPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';

const DashboardContainer = styled.div`
  padding: ${props => props.theme.spacing.large};

  h1 {
    margin-bottom: ${props => props.theme.spacing.large};
    color: ${props => props.theme.colors.primary};
  }
`;

const Section = styled.section`
  background-color: ${props => props.theme.colors.neutral.white};
  padding: ${props => props.theme.spacing.large};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: ${props => props.theme.spacing.xlarge};

  h2 {
    color: ${props => props.theme.colors.secondary};
    margin-bottom: ${props => props.theme.spacing.medium};
    border-bottom: 1px solid ${props => props.theme.colors.neutral.softGrey};
    padding-bottom: ${props => props.theme.spacing.small};
  }
`;

const StatusMessage = styled.div`
    margin-bottom: ${props => props.theme.spacing.xlarge};
    padding: ${props => props.theme.spacing.large};
    border-radius: 8px;
    text-align: center;
    font-size: 1.1em;
    background-color: ${props => {
        if (props.status === 'pending' || props.status === 'pending_mentor') return props.theme.colors.subtleAccent;
        if (props.status === 'approved' || props.status === 'mentor') return props.theme.colors.success; // Use success color for approved/mentor
        if (props.status === 'rejected' || props.status === 'rejected_mentor') return props.theme.colors.error;
        return props.theme.colors.neutral.softGrey;
    }};
    color: ${props => props.theme.colors.darkGrey};
    font-weight: bold;

     p {
         margin-bottom: ${props => props.theme.spacing.medium};
         color: ${props => props.theme.colors.darkGrey}; /* Ensure text color is readable */
     }
`;

const RequestList = styled.ul`
     list-style: none;
     padding: 0;

     li {
         background-color: ${props => props.theme.colors.neutral.softGrey};
         padding: ${props => props.theme.spacing.medium};
         margin-bottom: ${props => props.theme.spacing.small};
         border-radius: 4px;
         display: flex;
         justify-content: space-between;
         align-items: center;
         flex-wrap: wrap; /* Allow wrapping on smaller screens */
         gap: ${props => props.theme.spacing.small}; /* Space between items */

          div {
              flex-grow: 1; /* Allow text area to take space */
          }

          strong {
              display: block;
              margin-bottom: 4px;
          }

          span {
              font-size: 0.9em;
          }
     }
`;

const RequestActions = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.small};
    margin-left: ${props => props.theme.spacing.medium}; /* Space from text */
`;


const MentorDashboardPage = () => {
  const { user, userProfile, loading: authLoading, profileLoading } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [activeMentees, setActiveMentees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

    // Redirect if user is not a mentor (any mentor role)
    useEffect(() => {
        if (!authLoading && !profileLoading && userProfile) {
            const validMentorRoles = ['mentor', 'pending_mentor', 'rejected_mentor'];
            if (!validMentorRoles.includes(userProfile.role)) {
                 console.log("Redirecting non-mentor from mentor dashboard.");
                 // Redirect based on actual role
                 if (userProfile.role === 'entrepreneur' && userProfile.onboardingComplete) {
                     navigate('/dashboard/entrepreneur', { replace: true });
                 } else if (userProfile.role === 'entrepreneur' && !userProfile.onboardingComplete) {
                      navigate('/onboarding', { replace: true });
                 } else if (userProfile.role === 'admin') {
                      navigate('/admin', { replace: true });
                 }
                 else {
                     navigate('/', { replace: true }); // Fallback
                 }
            }
        }
    }, [userProfile, authLoading, profileLoading, navigate]);


  // Fetch incoming mentorship requests and active mentees
  useEffect(() => {
      if (user?.uid && userProfile?.role === 'mentor') { // Only fetch if user is an approved mentor
           setIsLoading(true);
           setError(null);

            // Use a real-time listener for incoming requests if desired,
            // but for a dashboard summary, a one-time fetch might suffice initially.
           const fetchMentorships = async () => {
               try {
                   // Fetch pending requests addressed to this mentor
                   const pendingQuery = query(collection(db, 'mentorships'), where('mentorId', '==', user.uid), where('status', '==', 'pending'));
                   const pendingSnapshot = await getDocs(pendingQuery);
                   // Need to fetch entrepreneur details for each request
                   const pendingList = await Promise.all(pendingSnapshot.docs.map(async docSnap => {
                       const requestData = { id: docSnap.id, ...docSnap.data() };
                       // Fetch entrepreneur profile
                       if (requestData.entrepreneurId) {
                           const entrepreneurDoc = await getDoc(doc(db, 'users', requestData.entrepreneurId));
                           if (entrepreneurDoc.exists()) {
                               requestData.entrepreneur = { id: entrepreneurDoc.id, ...entrepreneurDoc.data() };
                           }
                       }
                       return requestData;
                   }));
                   setIncomingRequests(pendingList);


                    // Fetch active mentorships with this mentor
                   const activeQuery = query(collection(db, 'mentorships'), where('mentorId', '==', user.uid), where('status', '==', 'active'));
                   const activeSnapshot = await getDocs(activeQuery);
                    // Need to fetch entrepreneur details for each active mentorship
                    const activeList = await Promise.all(activeSnapshot.docs.map(async docSnap => {
                         const mentorshipData = { id: docSnap.id, ...docSnap.data() };
                          // Fetch entrepreneur profile
                          if (mentorshipData.entrepreneurId) {
                              const entrepreneurDoc = await getDoc(doc(db, 'users', mentorshipData.entrepreneurId));
                              if (entrepreneurDoc.exists()) {
                                  mentorshipData.entrepreneur = { id: entrepreneurDoc.id, ...entrepreneurDoc.data() };
                              }
                          }
                         return mentorshipData;
                    }));
                   setActiveMentees(activeList);

               } catch (err) {
                   console.error("Error fetching mentor data:", err);
                   setError("Failed to load dashboard data.");
               } finally {
                   setIsLoading(false);
               }
           };

           fetchMentorships();

      } else if (userProfile && (userProfile.role === 'pending_mentor' || userProfile.role === 'rejected_mentor')) {
           // If not an approved mentor, no requests/mentees to fetch, just show status
           setIsLoading(false);
           setIncomingRequests([]);
           setActiveMentees([]);
       }


  }, [user?.uid, userProfile?.role]); // Re-run if user or their role changes


    const handleRequestAction = async (mentorshipId, action) => {
        // action can be 'accept' or 'reject'
        setIsLoading(true);
        setError(null);
         try {
              const mentorshipDocRef = doc(db, 'mentorships', mentorshipId);
              await updateDoc(mentorshipDocRef, {
                   status: action === 'accept' ? 'active' : 'rejected',
                   // Optional: add acceptedAt/rejectedAt timestamp
              });

              // Update local state to reflect the change
              if (action === 'accept') {
                   setIncomingRequests(prev => prev.filter(req => req.id !== mentorshipId));
                   // Optionally move it to activeMentees list - need to re-fetch or update locally
                   // For simplicity, might refetch activeMentees after an accept
                   // Or find the accepted request and add its entrepreneur details to activeMentees
               } else { // reject
                   setIncomingRequests(prev => prev.filter(req => req.id !== mentorshipId));
               }

              // Re-fetch active mentees to update the list accurately after accept
              if (action === 'accept') {
                  const activeQuery = query(collection(db, 'mentorships'), where('mentorId', '==', user.uid), where('status', '==', 'active'));
                   const activeSnapshot = await getDocs(activeQuery);
                   const activeList = await Promise.all(activeSnapshot.docs.map(async docSnap => {
                        const mentorshipData = { id: docSnap.id, ...docSnap.data() };
                         if (mentorshipData.entrepreneurId) {
                             const entrepreneurDoc = await getDoc(doc(db, 'users', mentorshipData.entrepreneurId));
                             if (entrepreneurDoc.exists()) {
                                 mentorshipData.entrepreneur = { id: entrepreneurDoc.id, ...entrepreneurDoc.data() };
                             }
                         }
                        return mentorshipData;
                   }));
                  setActiveMentees(activeList);
              }


         } catch (err) {
             console.error(`Error ${action}ing request:`, err);
             setError(`Failed to ${action} request. Please try again.`);
         } finally {
              setIsLoading(false);
         }
    };


    // Show loading state while auth/profile is loading or initial data is fetching
    if (authLoading || profileLoading || !userProfile || isLoading) {
        return <DashboardContainer><LoadingSpinner /><p>Loading mentor dashboard...</p></DashboardContainer>;
    }

    // Render different content based on mentor application status/role
    if (userProfile.role === 'pending_mentor' || userProfile.role === 'rejected_mentor') {
        return (
            <DashboardContainer>
                 <h1>Mentor Application Status</h1>
                 <StatusMessage status={userProfile.mentorApplicationStatus || userProfile.role}>
                      {userProfile.role === 'pending_mentor' && <p>Your application is currently under review. We will notify you once a decision is made.</p>}
                      {userProfile.role === 'rejected_mentor' && (
                           <>
                             <p>Your recent mentor application was not approved.</p>
                             {userProfile.rejectionReason && <p>Reason: {userProfile.rejectionReason}</p>}
                             <Button as={Link} to="/apply-mentor" style={{marginTop: '10px'}}>Re-apply as Mentor</Button> {/* Allow re-application */}
                           </>
                      )}
                 </StatusMessage>
                  {error && <ErrorMessage>{error}</ErrorMessage>} {/* Show general error if any */}
            </DashboardContainer>
        );
    }

     // If userProfile.role === 'mentor'
  return (
    <DashboardContainer>
      <h1>Mentor Dashboard</h1>

        <Section>
            <h2>Professional Profile</h2>
             {/* Link to edit profile or view public profile if needed */}
             <p><strong>Name:</strong> {userProfile.fullName}</p>
             <p><strong>Email:</strong> {userProfile.email}</p>
             <p><strong>Status:</strong> Approved Mentor</p>
             {userProfile.professionalBio && <p><strong>Bio:</strong> {userProfile.professionalBio.substring(0, 200)}...</p>}
             <p><strong>Expertise:</strong> {userProfile.industriesOfExpertise?.join(', ') || 'N/A'}</p>
             <p><strong>Experience:</strong> {userProfile.yearsExperience ?? 'N/A'} years</p>
             <p><strong>Availability:</strong> {userProfile.availability?.hoursPerWeek ?? 'N/A'} hours/week, {userProfile.availability?.preferredTimes || 'N/A'}</p>
             {/* Add an "Edit Profile" button/link */}
        </Section>

      <Section>
        <h2>Incoming Mentorship Requests</h2>
        {error && incomingRequests.length === 0 && <ErrorMessage>{error}</ErrorMessage>} {/* Show error if fetch failed */}
         {incomingRequests.length === 0 ? (
             <p>You have no new mentorship requests.</p>
         ) : (
             <RequestList>
                 {incomingRequests.map(request => (
                     <li key={request.id}>
                         <div>
                             <strong>Request from: {request.entrepreneur?.fullName || 'Entrepreneur'}</strong>
                             <span>Industry: {request.entrepreneur?.industry || 'N/A'}</span>
                             {/* Optional: Show a snippet of the entrepreneur's goals or personality */}
                         </div>
                         <RequestActions>
                             <Button onClick={() => handleRequestAction(request.id, 'accept')} disabled={isLoading} size="small">Accept</Button> {/* size="small" for common button */}
                             <Button onClick={() => handleRequestAction(request.id, 'reject')} disabled={isLoading} variant="secondary" size="small">Reject</Button>
                         </RequestActions>
                     </li>
                 ))}
             </RequestList>
         )}
          {isLoading && <LoadingSpinner />} {/* Show spinner during request actions */}
      </Section>

      <Section>
        <h2>My Mentees (Active Mentorships)</h2>
        {error && activeMentees.length === 0 && <ErrorMessage>{error}</ErrorMessage>} {/* Show error if fetch failed */}
         {activeMentees.length === 0 ? (
             <p>You have no active mentees.</p>
         ) : (
             <RequestList> {/* Re-using RequestList styling */}
                 {activeMentees.map(mentorship => (
                     <li key={mentorship.id}>
                         <div>
                             <strong>Mentee: {mentorship.entrepreneur?.fullName || 'Entrepreneur'}</strong>
                             <span>Industry: {mentorship.entrepreneur?.industry || 'N/A'}</span>
                              {/* Optional: Show link to mentee's public profile (if any) */}
                         </div>
                         <RequestActions>
                             <Button as={Link} to={`/chat/${mentorship.id}`} size="small">Go to Chat</Button>
                         </RequestActions>
                     </li>
                 ))}
             </RequestList>
         )}
           {isLoading && <LoadingSpinner />} {/* Show spinner during actions that might affect this list */}
      </Section>

        {/* Section for Past Mentees could be added here */}
    </DashboardContainer>
  );
};

export default MentorDashboardPage;
