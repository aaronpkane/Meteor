// src/pages/OnboardingPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea'; // We will create a common Textarea

const OnboardingContainer = styled.div`
  padding: ${props => props.theme.spacing.large};

  h1 {
    margin-bottom: ${props => props.theme.spacing.large};
    text-align: center;
  }
`;

const OnboardingSteps = styled.div`
    max-width: 800px;
    margin: 0 auto;
    background-color: ${props => props.theme.colors.neutral.white};
    padding: ${props => props.theme.spacing.xlarge};
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const StepTitle = styled.h2`
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.medium};
    border-bottom: 1px solid ${props => props.theme.colors.neutral.softGrey};
    padding-bottom: ${props => props.theme.spacing.medium};
`;

const QuestionList = styled.div`
    margin-bottom: ${props => props.theme.spacing.large};
`;

const QuestionItem = styled.div`
    margin-bottom: ${props => props.theme.spacing.medium};

    p {
        margin-bottom: ${props => props.theme.spacing.small};
        font-weight: bold;
    }

    div { /* Container for radio buttons/scale */
        display: flex;
        gap: ${props => props.theme.spacing.small};
        align-items: center;

        label {
             font-weight: normal;
             margin-right: ${props => props.theme.spacing.small};
        }
    }
`;

const LikertScaleLabel = styled.span`
    font-size: 0.9em;
    color: ${props => props.theme.colors.darkGrey};
    margin-left: ${props => props.theme.spacing.small};
`;


const neoPiQuestions = [
  { id: 1, text: "I see myself as someone who is imaginative.", trait: "openness", scoring: "standard" },
  { id: 2, text: "I prefer variety to routine.", trait: "openness", scoring: "standard" },
  { id: 3, text: "I am open to new experiences.", trait: "openness", scoring: "standard" }, // Added 3rd O question
  { id: 4, text: "I tend to be disorganized.", trait: "conscientiousness", scoring: "reverse" },
  { id: 5, text: "I complete tasks thoroughly.", trait: "conscientiousness", scoring: "standard" },
  { id: 6, text: "I am always prepared.", trait: "conscientiousness", scoring: "standard" }, // Added 3rd C question
  { id: 7, text: "I am a talkative person.", trait: "extraversion", scoring: "standard" },
  { id: 8, text: "I am reserved.", trait: "extraversion", scoring: "reverse" },
  { id: 9, text: "I enjoy being the center of attention.", trait: "extraversion", scoring: "standard" }, // Added 3rd E question
  { id: 10, text: "I tend to find fault with others.", trait: "agreeableness", scoring: "reverse" },
  { id: 11, text: "I am helpful and unselfish with others.", trait: "agreeableness", scoring: "standard" },
  { id: 12, text: "I make people feel at ease.", trait: "agreeableness", scoring: "standard" }, // Added 3rd A question
  { id: 13, text: "I get stressed easily.", trait: "neuroticism", scoring: "standard" },
  { id: 14, text: "I am calm in tense situations.", trait: "neuroticism", scoring: "reverse" },
  { id: 15, text: "I worry about things.", trait: "neuroticism", scoring: "standard" }, // Added 3rd N question
];

// Max possible score per trait (3 questions * 5 points/question)
const MAX_TRAIT_SCORE_RAW = 15;

const OnboardingPage = () => {
    const { user, userProfile, loading: authLoading, profileLoading } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [personalityResponses, setPersonalityResponses] = useState({});
    const [businessGoals, setBusinessGoals] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Redirect if onboarding is already complete or user is not entrepreneur
     useEffect(() => {
        if (!authLoading && !profileLoading && user && userProfile) {
            if (userProfile.onboardingComplete) {
                 console.log("Onboarding already complete, redirecting to dashboard.");
                 // Redirect based on role if onboarding is complete
                 if (userProfile.role === 'entrepreneur') {
                    navigate('/dashboard/entrepreneur', { replace: true });
                 } else if (userProfile.role === 'mentor' || userProfile.role === 'pending_mentor' || userProfile.role === 'rejected_mentor') {
                     navigate('/dashboard/mentor', { replace: true });
                 } else if (userProfile.role === 'admin') {
                     navigate('/admin', { replace: true });
                 } else {
                      // Fallback for unexpected roles
                     navigate('/', { replace: true });
                 }

            } else if (userProfile.role !== 'entrepreneur') {
                 console.log(`User role is ${userProfile.role}, onboarding not required. Redirecting to home.`);
                 navigate('/', { replace: true }); // Only entrepreneurs need onboarding
            } else {
                 // User is an entrepreneur and onboarding is not complete, stay on page
                 // Initialize responses if needed
                 if (Object.keys(personalityResponses).length === 0) {
                      const initialResponses = {};
                      neoPiQuestions.forEach(q => { initialResponses[q.id] = ''; }); // Use empty string for no answer
                      setPersonalityResponses(initialResponses);
                 }
            }
        }
         // If user is not logged in, useAuth's ProtectedRoute will handle redirect to login
    }, [user, userProfile, authLoading, profileLoading, navigate, personalityResponses]); // Add personalityResponses to dependencies


    const handlePersonalityChange = (questionId, value) => {
        setPersonalityResponses({
            ...personalityResponses,
            [questionId]: parseInt(value, 10) // Store as number
        });
    };

    const calculatePersonalityScores = () => {
        const scores = { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 };
        const counts = { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 }; // To track answered questions

        neoPiQuestions.forEach(q => {
            const response = personalityResponses[q.id];
            if (response !== '' && response !== undefined) { // Check if question was answered
                 if (q.scoring === 'standard') {
                     scores[q.trait] += response;
                 } else {
                     // Reverse scoring: 5 -> 1, 4 -> 2, 3 -> 3, 2 -> 4, 1 -> 5
                     scores[q.trait] += (6 - response);
                 }
                 counts[q.trait]++;
            }
        });

         // Normalize scores to 0-100 scale
         const normalizedScores = {};
         for (const trait in scores) {
             if (counts[trait] > 0) {
                 // Calculate percentage based on answered questions for that trait
                 const maxPossibleForAnswered = counts[trait] * 5;
                 normalizedScores[trait] = Math.round((scores[trait] / maxPossibleForAnswered) * 100);
             } else {
                 normalizedScores[trait] = 0; // If no questions for a trait were answered
             }
         }


        return normalizedScores;
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
             // Validate personality questions
             const allAnswered = neoPiQuestions.every(q => personalityResponses[q.id] !== '' && personalityResponses[q.id] !== undefined);
             if (!allAnswered) {
                 setError("Please answer all personality questions.");
                 return;
             }
            setError(null);
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Validate business goals
             if (businessGoals.trim().length < 50) { // Example minimum length
                 setError("Please provide a more detailed description of your business goals (minimum 50 characters).");
                 return;
             }
            setError(null);
            handleSubmitOnboarding();
        }
    };

     const handlePreviousStep = () => {
         if (currentStep > 1) {
             setCurrentStep(currentStep - 1);
             setError(null); // Clear error when going back
         }
     };

    const handleSubmitOnboarding = async () => {
        setIsLoading(true);
        setError(null);

        if (!user) {
            setError("User not authenticated.");
            setIsLoading(false);
            return;
        }

        const personalityScores = calculatePersonalityScores();

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                personalityScores: personalityScores,
                businessGoals: businessGoals,
                onboardingComplete: true,
            });

            // Onboarding complete, redirect to entrepreneur dashboard
            navigate('/dashboard/entrepreneur', { replace: true });

        } catch (err) {
            console.error("Failed to save onboarding data:", err);
            setError("Failed to save onboarding data. Please try again.");
            setIsLoading(false);
        }
    };

    // Show loading while auth/profile state is being determined
    if (authLoading || profileLoading || (user && !userProfile)) {
        return <OnboardingContainer><p>Loading onboarding...</p></OnboardingContainer>;
    }

     // If userProfile exists and onboarding is complete, or role is not entrepreneur,
     // the useEffect hook handles the redirect. This prevents rendering the form
     // momentarily before the redirect happens.
    if (userProfile && (userProfile.onboardingComplete || userProfile.role !== 'entrepreneur')) {
         return null;
     }


    return (
        <OnboardingContainer>
            <h1>Complete Your Profile</h1>

            <OnboardingSteps>
                {currentStep === 1 && (
                    <div>
                        <StepTitle>Step 1: Personality Inventory</StepTitle>
                         <p>Please rate how accurately each statement describes you on a scale of 1 to 5:</p>
                        <p><strong>1:</strong> Strongly Disagree, <strong>2:</strong> Disagree, <strong>3:</strong> Neither Agree nor Disagree, <strong>4:</strong> Agree, <strong>5:</strong> Strongly Agree</p>

                        <QuestionList>
                            {neoPiQuestions.map(q => (
                                <QuestionItem key={q.id}>
                                    <p>{q.text}</p>
                                    <div>
                                         {[1, 2, 3, 4, 5].map(value => (
                                            <label key={value}>
                                                <input
                                                    type="radio"
                                                    name={`question_${q.id}`}
                                                    value={value}
                                                    checked={personalityResponses[q.id] === value}
                                                    onChange={() => handlePersonalityChange(q.id, value)}
                                                    required
                                                />
                                                {value}
                                            </label>
                                        ))}
                                         <LikertScaleLabel>
                                            {personalityResponses[q.id] === 1 && "Strongly Disagree"}
                                            {personalityResponses[q.id] === 2 && "Disagree"}
                                            {personalityResponses[id] === 3 && "Neither Agree nor Disagree"}
                                            {personalityResponses[q.id] === 4 && "Agree"}
                                            {personalityResponses[q.id] === 5 && "Strongly Agree"}
                                         </LikertScaleLabel>
                                    </div>
                                </QuestionItem>
                            ))}
                        </QuestionList>
                    </div>
                )}

                {currentStep === 2 && (
                    <div>
                        <StepTitle>Step 2: Business Goals</StepTitle>
                         <p>Describe your current business stage, key challenges, aspirations, and specific goals for seeking mentorship.</p>
                        <Textarea
                            value={businessGoals}
                            onChange={(e) => setBusinessGoals(e.target.value)}
                            placeholder="Describe your business, challenges, and goals..."
                            rows="10"
                            minLength="50" // Enforce minimum length client-side
                            required
                        />
                    </div>
                )}

                 {error && <ErrorMessage>{error}</ErrorMessage>}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                     {currentStep > 1 && (
                         <Button type="button" onClick={handlePreviousStep} variant="secondary">
                             Previous
                         </Button>
                     )}
                    <Button
                         type="button"
                         onClick={handleNextStep}
                         disabled={isLoading}
                         style={{ marginLeft: currentStep > 1 ? 'auto' : '0' }} // Push to right if previous button exists
                    >
                        {isLoading ? 'Saving...' : (currentStep === 1 ? 'Next: Business Goals' : 'Complete Onboarding')}
                    </Button>
                </div>

            </OnboardingSteps>
        </OnboardingContainer>
    );
};

export default OnboardingPage;
