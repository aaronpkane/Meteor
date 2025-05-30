// src/pages/EntrepreneurDashboardPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { db, functions } from '../firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Added getDocs
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner'; // We will create this

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

const ProfileInfo = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${props => props.theme.spacing.medium};

    div {
        background-color: ${props => props.theme.colors.neutral.softGrey};
        padding: ${props => props.theme.spacing.medium};
        border-radius: 4px;
    }

    strong {
        display: block;
        margin-bottom: ${props => props.theme.spacing.small};
        color: ${props => props.theme.colors.primary};
    }
`;

const PersonalityScoresDisplay = styled.div`
    margin-top: ${props => props.theme.spacing.medium};
    h4 {
        margin-bottom: ${props => props.theme.spacing.small};
    }
    ul {
        list-style: disc;
        padding-left: ${props => props.theme.spacing.large};
    }
`;

const MentorList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${props => props.theme.spacing.medium};
`;

// Placeholder Mentor Card Component
const MentorCard = ({ mentor, onRequestMentorship }) => {
    const { userProfile } = useAuth(); // Get current user profile for role check
    const navigate = useNavigate();

     const handleRequest = () => {
         onRequestMentorship(mentor.id);
     };

     // Prevent showing 'Request' button if the current user is a mentor trying to request another mentor
     // Or if the current user is the mentor being displayed (shouldn't happen if querying correctly)
     const canRequest = userProfile?.role === 'entrepreneur' && userProfile.uid !== mentor.id;


    return (
        <StyledMentorCard>
            <h3>{mentor.fullName}</h3>
            <p><strong>Industry:</strong> {mentor.industriesOfExpertise?.join(', ') || 'N/A'}</p>
            <p>{mentor.professionalBio ? `${mentor.professionalBio.substring(0, 100)}...` : 'No bio provided.'}</p>
            <Link to={`/mentor/${mentor.id}`}>View Profile</Link>
            {canRequest && (
                <Button onClick={handleRequest} style={{ marginTop: '10px' }}>Request Mentorship</Button>
             )}
        </StyledMentorCard>
    );
};

const StyledMentorCard = styled.div`
    border: 1px solid ${props => props.theme.colors.neutral.softGrey};
    padding: ${props => props.theme.spacing.medium};
    border-radius: 8px;
    h3 {
        margin-top: 0;
        margin-bottom: ${props => props.theme.spacing.small};
        color: ${props => props.theme.colors.primary};
    }
    p {
        font-size: 0.9em;
        margin-bottom: ${props => props.theme.spacing.small};
    }
    a {
         display: inline-block;
         margin-top: ${props => props.theme.spacing.small};
         color: ${props => props.theme.colors.secondary};
         text-decoration: none;
         &:hover {
             text-decoration: underline;
         }
     }
`;

const RequestList = styled.ul`
    li {
        background-color: ${props => props.theme.colors.neutral.softGrey};
        padding: ${props => props.theme.spacing.medium};
        margin-bottom: ${props => props.theme.spacing.small};
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
`;


const EntrepreneurDashboardPage = () => {
  const { user, userProfile, loading: authLoading, profileLoading } = useAuth();
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeMentorships, setActiveMentorships] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState({}); // Track loading state for each request button
  const [error, setError] = useState(null);

  // Redirect if user is not an entrepreneur or onboarding is incomplete
  // This is also handled by ProtectedRoute, but good to have client-side check
  useEffect(() => {
       if (!authLoading && !profileLoading && userProfile) {
           if (userProfile.role !== 'entrepreneur') {
               console.log("Redirecting non-entrepreneur from dashboard.");
               // Redirect based on actual role
               if (userProfile.role === 'mentor' || userProfile.role === 'pending_mentor' || userProfile.role === 'rejected_mentor') {
                   navigate('/dashboard/mentor', { replace: true });
               } else if (userProfile.role === 'admin') {
                    navigate('/admin', { replace: true });
               } else {
                   navigate('/', { replace: true }); // Fallback
               }
           } else if (!userProfile.onboardingComplete) {
               console.log("Redirecting entrepreneur to onboarding.");
               navigate('/onboarding', { replace: true });
           }
       }
  }, [userProfile, authLoading, profileLoading]);


  // Fetch initial data (pending requests, active mentorships) on load
  useEffect(() => {
      if (user?.uid) {
           const fetchMentorships = async () => {
               // Fetch pending requests sent by this entrepreneur
               const pendingQuery = query(collection(db, 'mentorships'), where('entrepreneurId', '==', user.uid), where('status', '==', 'pending'));
               const pendingSnapshot = await getDocs(pendingQuery);
               const pendingList = pendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
               setPendingRequests(pendingList);

               // Fetch active mentorships for this entrepreneur
               const activeQuery = query(collection(db, 'mentorships'), where('entrepreneurId', '==', user.uid), where('status', '==', 'active'));
                const activeSnapshot = await getDocs(activeQuery);
                const activeList = activeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setActiveMentorships(activeList);

                // Note: For active/past, you'd likely fetch mentor details here too
           };

           fetchMentorships().catch(console.error);

      }
  }, [user]); // Re-run when user changes


  const handleFindMentors = async () => {
    if (!userProfile || !userProfile.onboardingComplete) {
        setError("Please complete your profile onboarding first.");
        return;
    }

    setMatchingLoading(true);
    setError(null);
    setRecommendedMentors([]); // Clear previous results

    try {
      // Call the matchMentors Cloud Function
      const matchMentors = httpsCallable(functions, 'matchMentors');
      const result = await matchMentors({ entrepreneurId: user.uid });

       console.log("Matching function result:", result.data);

      // result.data should contain a list of mentor user IDs
      // Now fetch the profiles for these mentor IDs
       if (result.data && result.data.mentorIds && result.data.mentorIds.length > 0) {
           // Firestore 'in' query is limited to 10 IDs
           // For more than 10, you'd need multiple queries or a different approach
           const mentorIdsToFetch = result.data.mentorIds.slice(0, 10); // Limit to 10 for 'in' query example
           const mentorsQuery = query(collection(db, 'users'), where('uid', 'in', mentorIdsToFetch));
           const mentorSnapshot = await getDocs(mentorsQuery);
           const mentorList = mentorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
           setRecommendedMentors(mentorList);
       } else {
            setRecommendedMentors([]); // No mentors found or returned
            setError("No suitable mentors found at this time.");
       }


    } catch (err) {
      console.error("Error finding mentors:", err);
      setError("Failed to find mentors. Please try again later.");
    } finally {
      setMatchingLoading(false);
    }
  };


  const handleRequestMentorship = async (mentorId) => {
       if (!user?.uid || !userProfile) return; // Should be logged in and have profile

       setRequestLoading(prev => ({ ...prev, [mentorId]: true }));
        setError(null);

       try {
            // Create a new mentorship request document
            const newRequestRef = doc(collection(db, 'mentorships')); // Auto-generated ID
            await setDoc(newRequestRef, {
                entrepreneurId: user.uid,
                mentorId: mentorId,
                status: 'pending', // pending, active, rejected, completed, cancelled
                createdAt: Timestamp.now(),
                 // Add entrepreneur's initial message/note if any? Not specified, so omit for now.
            });

            // Update the local state to show the request is pending
            // Fetch mentor profile details to display in the pending requests list
            const mentorDoc = await getDoc(doc(db, 'users', mentorId));
            if (mentorDoc.exists()) {
                 setPendingRequests(prev => [...prev, {
                     id: newRequestRef.id,
                     entrepreneurId: user.uid,
                     mentorId: mentorId,
                     status: 'pending',
                     createdAt: Timestamp.now(),
                     mentor: { id: mentorDoc.id, ...mentorDoc.data() } // Attach mentor details
                 }]);
            }


           alert("Mentorship request sent!"); // User feedback

       } catch (err) {
           console.error("Error sending mentorship request:", err);
           setError("Failed to send mentorship request. Please try again.");
       } finally {
           setRequestLoading(prev => ({ ...prev, [mentorId]: false }));
       }
  };

    // Show loading state while auth/profile is loading
     if (authLoading || profileLoading || !userProfile) {
         return <DashboardContainer><LoadingSpinner /> <p>Loading dashboard...</p></DashboardContainer>;
     }

    // Ensure userProfile exists and has entrepreneur role before rendering dashboard content
    if (userProfile.role !== 'entrepreneur' || !userProfile.onboardingComplete) {
        // This case should ideally be handled by the useEffect redirect above,
        // but returning null or a loading state here prevents rendering incorrect content
        // if there's a slight delay.
        return null; // Or a loading state if needed
    }


  return (
    <DashboardContainer>
      <h1>Entrepreneur Dashboard</h1>

      <Section>
        <h2>Your Profile Summary</h2>
          <ProfileInfo>
              <div>
                  <strong>Full Name:</strong> {userProfile.fullName}
              </div>
               <div>
                  <strong>Industry:</strong> {userProfile.industry}
              </div>
              <div>
                   <strong>Role:</strong> {userProfile.role}
               </div>
               {userProfile.personalityScores && (
                    <PersonalityScoresDisplay>
                        <h4>Personality Scores (0-100):</h4>
                        <ul>
                            <li><strong>Openness:</strong> {userProfile.personalityScores.openness ?? 'N/A'}</li>
                            <li><strong>Conscientiousness:</strong> {userProfile.personalityScores.conscientiousness ?? 'N/A'}</li>
                            <li><strong>Extraversion:</strong> {userProfile.personalityScores.extraversion ?? 'N/A'}</li>
                            <li><strong>Agreeableness:</strong> {userProfile.personalityScores.agreeableness ?? 'N/A'}</li>
                            <li><strong>Neuroticism:</strong> {userProfile.personalityScores.neuroticism ?? 'N/A'}</li>
                        </ul>
                    </PersonalityScoresDisplay>
               )}
              <div style={{gridColumn: '1 / -1'}}> {/* Span across columns */}
                  <strong>Business Goals:</strong>
                   <p>{userProfile.businessGoals || 'No goals provided yet.'}</p>
              </div>
          </ProfileInfo>
      </Section>

      <Section>
        <h2>Find a Mentor</h2>
         <p>Find mentors based on your profile and goals.</p>
        <Button onClick={handleFindMentors} disabled={matchingLoading}>
          {matchingLoading ? 'Searching...' : 'Find Recommended Mentors'}
        </Button>
         {error && !recommendedMentors.length && <ErrorMessage>{error}</ErrorMessage>} {/* Show error if no mentors found */}
        {recommendedMentors.length > 0 && (
            <>
                <h3>Recommended for You:</h3>
                <MentorList>
                    {recommendedMentors.map(mentor => (
                        <MentorCard
                            key={mentor.id}
                            mentor={mentor}
                            onRequestMentorship={handleRequestMentorship}
                             isLoading={requestLoading[mentor.id]} // Pass individual loading state
                        />
                    ))}
                </MentorList>
            </>
        )}
         {matchingLoading && <LoadingSpinner />}
      </Section>

      <Section>
        <h2>Pending Mentorship Requests</h2>
         {pendingRequests.length === 0 ? (
             <p>You have no pending mentorship requests.</p>
         ) : (
             <RequestList>
                 {pendingRequests.map(request => (
                     <li key={request.id}>
                         Request to {request.mentor?.fullName || 'a Mentor'} - Status: {request.status}
                         {/* Optional: Add a 'Cancel Request' button */}
                     </li>
                 ))}
             </RequestList>
         )}
      </Section>

      <Section>
        <h2>Active Mentorships</h2>
         {activeMentorships.length === 0 ? (
             <p>You have no active mentorships.</p>
         ) : (
              <ul>
                 {activeMentorships.map(mentorship => (
                     <li key={mentorship.id}>
                        Mentorship with {mentorship.mentor?.fullName || 'Mentor'} - Status: {mentorship.status}
                        <Link to={`/chat/${mentorship.id}`}>Go to Chat</Link>
                     </li>
                 ))}
             </ul>
         )}
      </Section>

        {/* Section for Past Mentorships could be added here */}
    </DashboardContainer>
  );
};

export default EntrepreneurDashboardPage;
