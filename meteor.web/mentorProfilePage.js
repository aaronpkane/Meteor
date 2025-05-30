// src/pages/MentorProfilePage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage'; // We will create a common ErrorMessage
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth'; // To check if current user is entrepreneur to request

const ProfileContainer = styled.div`
  padding: ${props => props.theme.spacing.large};
  max-width: 800px;
  margin: 0 auto;
  background-color: ${props => props.theme.colors.neutral.white};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: ${props => props.theme.spacing.xlarge};

  h1 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.medium};
  }

  h2 {
    color: ${props => props.theme.colors.secondary};
    margin-top: ${props => props.theme.spacing.large};
    margin-bottom: ${props => props.theme.spacing.medium};
    border-bottom: 1px solid ${props => props.theme.colors.neutral.softGrey};
    padding-bottom: ${props => props.theme.spacing.small};
  }

  p {
    margin-bottom: ${props => props.theme.spacing.medium};
  }

  ul {
      list-style: disc;
      padding-left: ${props => props.theme.spacing.large};
      margin-bottom: ${props => props.theme.spacing.medium};
  }
`;

const LinkedInLink = styled.a`
    display: inline-block;
    margin-top: ${props => props.theme.spacing.medium};
    color: #0077B5; /* LinkedIn Blue */
    font-weight: bold;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;


const MentorProfilePage = () => {
  const { id } = useParams(); // Get mentor ID from URL
  const [mentorProfile, setMentorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, userProfile } = useAuth(); // Get current user info

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const mentorDocRef = doc(db, 'users', id);
        const docSnap = await getDoc(mentorDocRef);

        if (docSnap.exists() && (docSnap.data().role === 'mentor' || docSnap.data().role === 'admin')) { // Only show approved mentors or admins
            setMentorProfile({ id: docSnap.id, ...docSnap.data() });
        } else {
            setError("Mentor profile not found or is not publicly available.");
            setMentorProfile(null); // Ensure profile is null on error/not found
        }
      } catch (err) {
        console.error("Error fetching mentor profile:", err);
        setError("Failed to load mentor profile.");
        setMentorProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorProfile();
  }, [id]); // Re-run effect if the ID in the URL changes


  // Assuming handleRequestMentorship exists in EntrepreneurDashboard and passed down or called via Context/Hook
  // For this page, we might need a simpler way to trigger the request, possibly via a callable function

  const handleRequestMentorship = async () => {
      if (!user || !userProfile || userProfile.role !== 'entrepreneur' || !userProfile.onboardingComplete) {
           alert("You must be a logged-in entrepreneur with a completed profile to request mentorship.");
           return;
       }
       if (user.uid === id) {
            alert("You cannot request mentorship from yourself.");
            return;
       }

       if (window.confirm(`Are you sure you want to request mentorship from ${mentorProfile?.fullName || 'this mentor'}?`)) {
           // Call a Cloud Function to create the mentorship request
            try {
                setLoading(true); // Or use a separate button loading state
                const requestMentorshipCallable = httpsCallable(functions, 'requestMentorship'); // We will create this function

                const result = await requestMentorshipCallable({ entrepreneurId: user.uid, mentorId: id });

                console.log("Request mentorship function result:", result.data);

                if (result.data.success) {
                    alert("Mentorship request sent successfully!");
                    // Redirect to pending requests list or dashboard?
                    // navigate('/dashboard/entrepreneur'); // Example redirect
                } else {
                    setError(result.data.message || "Failed to send request.");
                }


           } catch (err) {
               console.error("Error calling requestMentorship function:", err);
               setError("Failed to send mentorship request.");
           } finally {
               setLoading(false); // Or reset button loading state
           }
       }
  };


  if (loading) {
    return <ProfileContainer><LoadingSpinner /><p>Loading profile...</p></ProfileContainer>;
  }

  if (error) {
    return <ProfileContainer><ErrorMessage>{error}</ErrorMessage></ProfileContainer>;
  }

  if (!mentorProfile) {
      return <ProfileContainer><p>Mentor profile not found.</p></ProfileContainer>;
  }

  // Only show 'Request Mentorship' button if the current user is an entrepreneur and not the mentor being viewed
  const showRequestButton = userProfile?.role === 'entrepreneur' && userProfile.uid !== id;


  return (
    <ProfileContainer>
      <h1>{mentorProfile.fullName}</h1>
      <p><strong>Role:</strong> Mentor</p>
      <p><strong>Verified:</strong> {mentorProfile.isVerified ? 'Yes' : 'No'}</p> {/* Should only show verified */}


      {mentorProfile.professionalBio && (
          <>
              <h2>Professional Bio</h2>
              <p>{mentorProfile.professionalBio}</p>
          </>
      )}

      {mentorProfile.industriesOfExpertise && mentorProfile.industriesOfExpertise.length > 0 && (
          <>
              <h2>Industries of Expertise</h2>
              <ul>
                  {mentorProfile.industriesOfExpertise.map(industry => (
                      <li key={industry}>{industry}</li>
                  ))}
              </ul>
          </>
      )}

       {mentorProfile.yearsExperience !== undefined && (
           <p><strong>Years of Experience:</strong> {mentorProfile.yearsExperience}</p>
       )}

       {mentorProfile.availability && (
           <p><strong>Availability:</strong> {mentorProfile.availability.hoursPerWeek} hours/week, {mentorProfile.availability.preferredTimes}</p>
       )}

       {mentorProfile.linkedinProfile && (
           <LinkedInLink href={mentorProfile.linkedinProfile} target="_blank" rel="noopener noreferrer">
               View LinkedIn Profile
           </LinkedInLink>
       )}

        {showRequestButton && (
            <Button onClick={handleRequestMentorship} disabled={loading} style={{ marginTop: '20px' }}>
                 {loading ? 'Sending Request...' : 'Request Mentorship'}
            </Button>
        )}


    </ProfileContainer>
  );
};

export default MentorProfilePage;
