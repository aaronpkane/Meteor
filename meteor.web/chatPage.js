// src/pages/ChatPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ChatContainer = styled.div`
  padding: ${props => props.theme.spacing.large};
  max-width: 800px;
  margin: 0 auto;
  background-color: ${props => props.theme.colors.neutral.white};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 70vh; /* Ensure chat area has some height */
`;

const MessagesArea = styled.div`
  flex-grow: 1;
  overflow-y: auto; /* Enable scrolling */
  padding: ${props => props.theme.spacing.medium};
  border-bottom: 1px solid ${props => props.theme.colors.neutral.softGrey};
`;

const Message = styled.div`
  margin-bottom: ${props => props.theme.spacing.small};
  padding: ${props => props.theme.spacing.small};
  border-radius: 4px;
  background-color: ${props => props.isCurrentUser ? props.theme.colors.subtleAccent : props.theme.colors.neutral.softGrey};
  align-self: ${props => props.isCurrentUser ? 'flex-end' : 'flex-start'}; /* Align messages */
  max-width: 80%; /* Prevent messages from taking full width */
`;

const MessageSender = styled.div`
    font-size: 0.8em;
    font-weight: bold;
    margin-bottom: 4px;
    color: ${props => props.theme.colors.primary};
`;

const MessageText = styled.div`
    font-size: 1em;
`;

const MessageTimestamp = styled.div`
    font-size: 0.7em;
    color: ${props => props.theme.colors.darkGrey}80;
    text-align: right;
    margin-top: 4px;
`;


const InputArea = styled.form`
  display: flex;
  padding: ${props => props.theme.spacing.medium};
  gap: ${props => props.theme.spacing.medium};
`;


const ChatPage = () => {
  const { mentorshipId } = useParams();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    // Basic check to see if the logged-in user is part of this mentorship
    // A more robust check using Firestore rules or a Cloud Function is recommended
    const [isParticipant, setIsParticipant] = useState(false);

     useEffect(() => {
         if (!user || !mentorshipId) return;

          const checkParticipation = async () => {
              try {
                  const mentorshipDoc = await getDoc(doc(db, 'mentorships', mentorshipId));
                  if (mentorshipDoc.exists()) {
                      const data = mentorshipDoc.data();
                       if (data.status === 'active' && (data.entrepreneurId === user.uid || data.mentorId === user.uid)) {
                           setIsParticipant(true);
                       } else {
                            setError("You are not an active participant in this mentorship.");
                            setIsParticipant(false);
                       }
                   } else {
                        setError("Mentorship not found.");
                        setIsParticipant(false);
                   }
               } catch (err) {
                    console.error("Error checking mentorship participation:", err);
                    setError("Failed to verify mentorship.");
                    setIsParticipant(false);
               } finally {
                    setLoading(false); // Stop initial loading after checking participation
               }
          };

          checkParticipation();

     }, [user, mentorshipId]);


  // Listen for messages in the chat subcollection
  useEffect(() => {
    if (!isParticipant || !mentorshipId) {
        setMessages([]); // Clear messages if not a participant
        return;
    }

    const messagesRef = collection(db, 'mentorships', mentorshipId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc')); // Order by timestamp

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
         timestamp: doc.data().timestamp?.toDate() // Convert Firebase Timestamp to JS Date
      }));
      setMessages(messagesList);
       // setLoading(false); // Move loading=false here if messages load after participation check
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages.");
       // setLoading(false); // Stop loading on error
    });

    // Clean up listener
    return () => unsubscribe();
  }, [mentorshipId, isParticipant]); // Re-run listener if mentorshipId or participation status changes


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessageText.trim() === '' || !user?.uid || !mentorshipId || !isParticipant) {
      return; // Don't send empty messages or if not participant
    }

    try {
      await addDoc(collection(db, 'mentorships', mentorshipId, 'messages'), {
        senderId: user.uid,
        text: newMessageText.trim(),
        timestamp: serverTimestamp(), // Use server timestamp
      });
      setNewMessageText(''); // Clear input field
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
    }
  };

  if (authLoading || loading) { // Combined loading states
     return <ChatContainer><LoadingSpinner /><p>Loading chat...</p></ChatContainer>;
  }

    if (error) {
        return <ChatContainer><ErrorMessage>{error}</ErrorMessage></ChatContainer>;
    }

    if (!isParticipant) {
         return <ChatContainer><ErrorMessage>You do not have access to this chat.</ErrorMessage></ChatContainer>;
    }


  return (
    <ChatContainer>
      <h2>Chat</h2>
        {messages.length === 0 && <p>No messages yet. Start the conversation!</p>}
      <MessagesArea>
        {messages.map(msg => (
          <Message key={msg.id} isCurrentUser={msg.senderId === user.uid}>
               <MessageSender>
                   {msg.senderId === user.uid ? 'You' : 'Mentor/Entrepreneur'} {/* Display sender name/role */}
               </MessageSender>
               <MessageText>{msg.text}</MessageText>
               {msg.timestamp && (
                    <MessageTimestamp>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </MessageTimestamp>
               )}
          </Message>
        ))}
      </MessagesArea>
      <InputArea onSubmit={handleSendMessage}>
        <Input
          type="text"
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          placeholder="Type a message..."
          style={{ flexGrow: 1 }}
          disabled={!isParticipant} // Disable input if not participant
        />
        <Button type="submit" disabled={!isParticipant || newMessageText.trim() === ''}>Send</Button>
      </InputArea>
    </ChatContainer>
  );
};

export default ChatPage;
