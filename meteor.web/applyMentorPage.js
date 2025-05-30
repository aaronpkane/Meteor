// src/pages/ApplyMentorPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Select from '../components/common/Select';
import Checkbox from '../components/common/Checkbox';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import SuccessMessage from '../components/common/SuccessMessage'; // We will create a common SuccessMessage

const ApplyMentorContainer = styled.div`
  padding: ${props => props.theme.spacing.large};

  h1 {
    margin-bottom: ${props => props.theme.spacing.large};
    color: ${props => props.theme.colors.primary};
    text-align: center;
  }
`;

const ApplicationFormWrapper = styled.div`
  max-width: 700px;
  margin: 0 auto;
  background-color: ${props => props.theme.colors.neutral.white};
  padding: ${props => props.theme.spacing.xlarge};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

   ${Input}, ${Textarea}, ${Select} {
    width: 100%;
    box-sizing: border-box;
  }

   /* Style for multi-select - basic example, might need a dedicated component */
   select[multiple] {
       min-height: 100px;
   }
`;

const ApplicationStatusMessage = styled.div`
    margin-top: ${props => props.theme.spacing.large};
    padding: ${props => props.theme.spacing.medium};
    border-radius: 4px;
    text-align: center;
    background-color: ${props => {
        if (props.status === 'pending') return props.theme.colors.subtleAccent;
        if (props.status === 'approved') return props.theme.colors.success;
        if (props.status === 'rejected') return props.theme.colors.error;
        return props.theme.colors.neutral.softGrey;
    }};
    color: ${props => props.theme.colors.darkGrey};
    font-weight: bold;
`;

const industries = [ // Re-using the industry list from SignUpPage
    'Tech', 'Finance', 'Retail', 'Healthcare', 'Arts & Media',
    'Education', 'Manufacturing', 'Agriculture', 'Other'
];

const ApplyMentorPage = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    professionalBio: '',
    industriesOfExpertise: [],
    yearsExperience: '',
    linkedinProfile: '',
    availabilityHours: '',
    availabilityTimes: '',
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [hasApplied, setHasApplied] = useState(false); // Track if user has already applied
  const [applicationStatus, setApplicationStatus] = useState(null);
   const [rejectionReason, setRejectionReason] = useState(null);


  useEffect(() => {
      // Pre-fill name/email and check if already applied
      if (userProfile) {
           setHasApplied(userProfile.role === 'mentor' || userProfile.role === 'pending_mentor' || userProfile.role === 'rejected_mentor');
           setApplicationStatus(userProfile.mentorApplicationStatus || userProfile.role); // Use role as status if status isn't set
           setRejectionReason(userProfile.rejectionReason || null);

           // If they have applied, pre-fill with existing application data
           if (userProfile.role !== 'entrepreneur' && userProfile.role !== undefined) {
               setFormData({
                  professionalBio: userProfile.professionalBio || '',
                  industriesOfExpertise: userProfile.industriesOfExpertise || [],
                  yearsExperience: userProfile.yearsExperience || '',
                  linkedinProfile: userProfile.linkedinProfile || '',
                  availabilityHours: userProfile.availability?.hoursPerWeek || '',
                  availabilityTimes: userProfile.availability?.preferredTimes || '',
                   // Assume terms were agreed if application exists
                  agreeTerms: userProfile.role !== 'entrepreneur',
               });
           }
       }
   }, [userProfile]);


  const handleChange = (e) => {
    const { name, value, type, checked, options } = e.target;

    if (type === 'select-multiple') {
         const selectedOptions = Array.from(options)
             .filter(option => option.selected)
             .map(option => option.value);
         setFormData({ ...formData, [name]: selectedOptions });
     } else if (type === 'checkbox') {
         setFormData({ ...formData, [name]: checked });
     }
     else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!user?.uid) {
        setError("You must be logged in to apply.");
        return;
    }

    if (!formData.agreeTerms) {
        setError("You must agree to the terms and privacy policy.");
        return;
    }
      // Basic validation
     if (!formData.professionalBio || formData.industriesOfExpertise.length === 0 || formData.yearsExperience === '' || formData.availabilityHours === '') {
         setError("Please fill out all required fields.");
         return;
     }


    setIsLoading(true);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        role: 'pending_mentor', // Change role to pending_mentor
        professionalBio: formData.professionalBio,
        industriesOfExpertise: formData.industriesOfExpertise,
        yearsExperience: parseInt(formData.yearsExperience, 10), // Ensure yearsExperience is a number
        linkedinProfile: formData.linkedinProfile,
        availability: {
          hoursPerWeek: parseInt(formData.availabilityHours, 10),
          preferredTimes: formData.availabilityTimes,
        },
        mentorApplicationStatus: 'pending', // Add status field
         rejectionReason: null, // Clear any previous rejection reason on re-application
        // The Cloud Function 'onMentorApplicationSubmit' will be triggered by the role change
      });

      setSuccessMessage("Your mentor application has been submitted for review!");
      setHasApplied(true); // Update state to show applied status
      setApplicationStatus('pending'); // Update status display


    } catch (err) {
      console.error("Error submitting mentor application:", err);
      setError("Failed to submit application. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

   // Show loading while auth state is being determined
     if (authLoading) {
         return <ApplyMentorContainer><LoadingSpinner /> <p>Loading application page...</p></ApplyMentorContainer>;
     }

    // If user is not logged in, ProtectedRoute redirects to login.

  return (
    <ApplyMentorContainer>
      <h1>Apply to be a Mentor</h1>

       {hasApplied && applicationStatus && (
           <ApplicationStatusMessage status={applicationStatus}>
               {applicationStatus === 'pending' && "Your mentor application is pending review."}
               {applicationStatus === 'approved' && "Your mentor application has been approved! Check your Mentor Dashboard."}
               {applicationStatus === 'rejected' && `Your mentor application was rejected. Reason: ${rejectionReason || 'No reason provided.'}`}
               {applicationStatus === 'mentor' && "You are an approved mentor. Check your Mentor Dashboard."}
                {applicationStatus === 'rejected_mentor' && "Your mentor application was rejected."} {/* Redundant but covers cases */}
           </ApplicationStatusMessage>
       )}

       {/* Show the form only if the user has not applied yet OR they were rejected (allowing re-application) */}
       {(!hasApplied || applicationStatus === 'rejected' || applicationStatus === 'rejected_mentor') && (
            <ApplicationFormWrapper>
                <p>Complete the form below to apply to become a mentor on Meteor.</p>
                <form onSubmit={handleSubmit}>
                    <FormGroup>
                        <label htmlFor="fullName">Full Name</label>
                        {/* Pre-filled and read-only */}
                        <Input type="text" id="fullName" value={userProfile?.fullName || ''} readOnly disabled />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="email">Email</label>
                        {/* Pre-filled and read-only */}
                        <Input type="email" id="email" value={userProfile?.email || ''} readOnly disabled />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="professionalBio">Professional Bio</label>
                        <Textarea
                            id="professionalBio"
                            name="professionalBio"
                            value={formData.professionalBio}
                            onChange={handleChange}
                            placeholder="Tell us about your professional background, experience, and what makes you a great mentor..."
                            rows="8"
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="industriesOfExpertise">Industries of Expertise (Select one or more)</label>
                        <Select
                            id="industriesOfExpertise"
                            name="industriesOfExpertise"
                            value={formData.industriesOfExpertise}
                            onChange={handleChange}
                            multiple // Enable multi-select
                            required
                        >
                        {industries.map(ind => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                        </Select>
                    </FormGroup>
                     <FormGroup>
                        <label htmlFor="yearsExperience">Years of Experience</label>
                        <Input
                            type="number"
                            id="yearsExperience"
                            name="yearsExperience"
                            value={formData.yearsExperience}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                    </FormGroup>
                     <FormGroup>
                        <label htmlFor="linkedinProfile">LinkedIn Profile URL (Optional)</label>
                        <Input
                            type="url"
                            id="linkedinProfile"
                            name="linkedinProfile"
                            value={formData.linkedinProfile}
                            onChange={handleChange}
                            placeholder="e.g., https://www.linkedin.com/in/yourprofile"
                        />
                    </FormGroup>
                     <FormGroup>
                        <label htmlFor="availabilityHours">Availability (Hours per week)</label>
                        <Input
                            type="number"
                            id="availabilityHours"
                            name="availabilityHours"
                            value={formData.availabilityHours}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                    </FormGroup>
                     <FormGroup>
                        <label htmlFor="availabilityTimes">Preferred Communication Times</label>
                        <Input
                            type="text"
                            id="availabilityTimes"
                            name="availabilityTimes"
                            value={formData.availabilityTimes}
                            onChange={handleChange}
                            placeholder="e.g., Evenings, Weekends, Flexible"
                        />
                    </FormGroup>
                     <PrivacyPolicyGroup>
                        <Checkbox
                            id="agreeTerms"
                            name="agreeTerms"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="agreeTerms">I agree to the Mentor Terms and Privacy Policy.</label> {/* Link to terms/privacy needed */}
                    </PrivacyPolicyGroup>


                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                </form>
            </ApplicationFormWrapper>
        )}

        {/* If applied and status is not rejected, maybe show a link to dashboard? */}
        {hasApplied && applicationStatus !== 'rejected' && applicationStatus !== 'rejected_mentor' && (
             <ApplicationStatusMessage status={applicationStatus}>
                  <p>{applicationStatus === 'pending' ? "Your application is still pending review. We will notify you once a decision is made." : "Your application has been approved. Please proceed to your Mentor Dashboard."}</p>
                  {applicationStatus === 'approved' || applicationStatus === 'mentor' ? (
                      <Button as={Link} to="/dashboard/mentor" style={{marginTop: '10px'}}>Go to Mentor Dashboard</Button>
                  ) : null}
             </ApplicationStatusMessage>
         )}


    </ApplyMentorContainer>
  );
};

export default ApplyMentorPage;
