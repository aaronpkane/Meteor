// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      // User changed, reset profile state
      setUserProfile(null);
      setProfileLoading(false);
    });

    // Clean up the listener on component unmount
    return () => unsubscribeAuth();
  }, []);

  // Listen for user profile changes when user is logged in
  useEffect(() => {
      let unsubscribeProfile = null;
      if (user) {
          setProfileLoading(true);
          const userDocRef = doc(db, 'users', user.uid);
           unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
               if (docSnap.exists()) {
                   setUserProfile({ id: docSnap.id, ...docSnap.data() });
               } else {
                   // Document does not exist, user might have just signed up
                   setUserProfile(null); // Or a basic profile structure if needed
               }
               setProfileLoading(false);
           }, (error) => {
               console.error("Error fetching user profile:", error);
               setUserProfile(null);
               setProfileLoading(false);
           });
      } else {
          // No user logged in, ensure profile is null
          setUserProfile(null);
          setProfileLoading(false);
      }

      // Clean up the listener
      return () => {
          if(unsubscribeProfile) {
              unsubscribeProfile();
          }
      };

  }, [user]); // Re-run when the user object changes


  // Basic login function
  const login = async (email, password) => {
       try {
          await auth.signInWithEmailAndPassword(email, password);
          // onAuthStateChanged listener will handle setting user and fetching profile
       } catch (error) {
           console.error("Login failed:", error);
           throw error; // Re-throw to be handled by the UI
       }
  };

  // Basic signup function
  const signup = async (email, password) => {
       try {
           const userCredential = await auth.createUserWithEmailAndPassword(email, password);
           // onAuthStateChanged listener will handle setting user
           return userCredential.user; // Return the newly created user
       } catch (error) {
           console.error("Signup failed:", error);
           throw error;
       }
  };

  // Basic logout function
  const logout = async () => {
       try {
           await auth.signOut();
           // onAuthStateChanged listener will handle clearing user and profile
       } catch (error) {
           console.error("Logout failed:", error);
           throw error;
       }
  };


  const value = {
    user,
    userProfile, // The user's document from Firestore
    loading, // Auth state loading
    profileLoading, // User profile loading
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
