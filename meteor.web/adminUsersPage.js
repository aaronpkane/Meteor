// src/pages/admin/AdminUsersPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db, auth } from '../../firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';

const AdminUsersContainer = styled.div`
  padding: ${props => props.theme.spacing.large};

  h1 {
    margin-bottom: ${props => props.theme.spacing.large};
    color: ${props => props.theme.colors.primary};
  }
`;

const UserTable = styled.table`
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
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.small};
`;


const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // { userId: 'deleting' | 'suspending' }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
           // Note: Firestore doesn't provide a simple way to get *all* Auth users directly
           // This fetches users from the 'users' Firestore collection.
           // If you need to manage Auth-only users, you'd typically do that server-side
           // via Cloud Functions or the Firebase Admin SDK.
           // For this example, we'll assume all relevant users have a Firestore document.
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

   const handleDeleteUser = async (userId) => {
       if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
           return;
       }

        setActionLoading(prev => ({ ...prev, [userId]: 'deleting' }));
        setError(null);

       try {
           // Deleting a user from Firestore is straightforward.
           await deleteDoc(doc(db, 'users', userId));

            // Important: Deleting the Firebase Auth user is more complex from the client-side
            // for security reasons. You should ideally trigger a Cloud Function to delete
            // the user from Firebase Authentication using the Admin SDK.
            // Placeholder: You would call a Cloud Function here.
            // const deleteUserCallable = httpsCallable(functions, 'deleteUser');
            // await deleteUserCallable({ uid: userId });

           // Remove user from local state
           setUsers(prev => prev.filter(user => user.id !== userId));

           alert(`User ${userId} deleted from Firestore. Remember to delete from Authentication.`);


       } catch (err) {
           console.error(`Error deleting user ${userId}:`, err);
           setError(`Failed to delete user ${userId}.`);
       } finally {
            setActionLoading(prev => {
                const newState = { ...prev };
                 delete newState[userId];
                 return newState;
            });
       }
   };

    const handleToggleSuspendUser = async (user) => {
         const userId = user.id;
         const isCurrentlySuspended = user.isSuspended || false;
         const action = isCurrentlySuspended ? 'unsuspending' : 'suspending';

         if (!window.confirm(`Are you sure you want to ${action} user ${userId}?`)) {
             return;
         }

          setActionLoading(prev => ({ ...prev, [userId]: action }));
          setError(null);

         try {
             // Suspending/unsuspending a user's *authentication* requires the Admin SDK,
             // typically done via a Cloud Function. Here we update a flag in Firestore.
              await updateDoc(doc(db, 'users', userId), {
                   isSuspended: !isCurrentlySuspended
              });

             // Update local state
              setUsers(prev => prev.map(u => u.id === userId ? { ...u, isSuspended: !isCurrentlySuspended } : u));

              alert(`User ${userId} marked as ${!isCurrentlySuspended ? 'suspended' : 'active'} in Firestore.`);
              // Remember to implement actual Auth disabling/enabling server-side

         } catch (err) {
             console.error(`Error ${action} user ${userId}:`, err);
             setError(`Failed to ${action} user ${userId}.`);
         } finally {
              setActionLoading(prev => {
                  const newState = { ...prev };
                   delete newState[userId];
                   return newState;
              });
         }
    };


  return (
    <AdminUsersContainer>
      <h1>User Management</h1>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!isLoading && !error && (
        <UserTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.fullName}</td>
                <td>{user.role}</td>
                <td>{user.isSuspended ? 'Suspended' : 'Active'}</td>
                <td>
                    <ActionButtons>
                         {/* Edit button placeholder */}
                         {/* <Button as={Link} to={`/admin/users/${user.id}/edit`} size="small">Edit</Button> */}
                         <Button
                            onClick={() => handleToggleSuspendUser(user)}
                            disabled={actionLoading[user.id] !== undefined}
                            variant={user.isSuspended ? 'success' : 'secondary'} // Green for Unsuspend, Red for Suspend
                            size="small"
                         >
                             {actionLoading[user.id] === 'suspending' ? 'Suspending...' : actionLoading[user.id] === 'unsuspending' ? 'Unsuspending...' : (user.isSuspended ? 'Unsuspend' : 'Suspend')}
                         </Button>
                         <Button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading[user.id] !== undefined}
                            variant="danger" // Use a danger variant if you add one
                            size="small"
                         >
                             {actionLoading[user.id] === 'deleting' ? 'Deleting...' : 'Delete'}
                         </Button>
                    </ActionButtons>
                </td>
              </tr>
            ))}
          </tbody>
        </UserTable>
      )}
       {!isLoading && !error && users.length === 0 && <p>No users found.</p>}
    </AdminUsersContainer>
  );
};

export default AdminUsersPage;
