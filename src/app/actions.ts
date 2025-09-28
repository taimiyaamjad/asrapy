
"use server";

import { adminAuth, adminDb } from '@/lib/firebase/server';
import { doc, getDoc, updateDoc, Timestamp, collection, getDocs } from 'firebase/firestore';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Define roles and their hierarchy (0 is highest)
const ALL_ROLES = ['GOD', 'CEO', 'COO', 'Admin', 'Staff', 'Developer', 'VIP', 'Coder', 'member'];

interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string | null;
    roles: string[];
    bio?: string;
    isBanned?: boolean;
    timeoutUntil?: Timestamp | null;
}

// Helper to get the highest role rank of a user
const getHighestRoleRank = (roles: string[]): number => {
    const ranks = roles.map(role => ALL_ROLES.indexOf(role)).filter(rank => rank !== -1);
    if (ranks.length === 0) return ALL_ROLES.length -1; // Default to lowest rank (member)
    return Math.min(...ranks);
};


// Helper to get authenticated user profile and check permissions
async function getAdminUserWithProfile(): Promise<UserProfile | null> {
  const authorization = headers().get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const userDoc = await getDoc(doc(adminDb, 'users', decodedToken.uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
    } catch (error) {
      console.error("Error verifying token or getting user:", error);
    }
  }
  return null;
}

// Check if a user can moderate another user
const canModerate = (moderator: UserProfile, target: UserProfile): boolean => {
    const moderatorRank = getHighestRoleRank(moderator.roles);
    const targetRank = getHighestRoleRank(target.roles);
    // Higher rank (lower number) can moderate lower rank (higher number)
    return moderatorRank < targetRank;
};


export async function banUser(userId: string) {
  const moderator = await getAdminUserWithProfile();
  if (!moderator) {
    throw new Error('Unauthorized: You must be an admin to perform this action.');
  }

  const targetDoc = await getDoc(doc(adminDb, 'users', userId));
  if (!targetDoc.exists()) {
      throw new Error('User not found.');
  }
  const target = targetDoc.data() as UserProfile;
  
  if (!canModerate(moderator, target)) {
      throw new Error('Permission Denied: You cannot ban a user with equal or higher rank.');
  }


  try {
    const userDocRef = doc(adminDb, 'users', userId);
    await updateDoc(userDocRef, {
      isBanned: true,
    });
    revalidatePath('/chat');
    return { success: true, message: 'User has been banned.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function timeoutUser(userId: string, durationMinutes: number) {
  const moderator = await getAdminUserWithProfile();
  if (!moderator) {
    throw new Error('Unauthorized: You must be an admin to perform this action.');
  }

  const targetDoc = await getDoc(doc(adminDb, 'users', userId));
  if (!targetDoc.exists()) {
      throw new Error('User not found.');
  }
  const target = targetDoc.data() as UserProfile;
  
  if (!canModerate(moderator, target)) {
      throw new Error('Permission Denied: You cannot timeout a user with equal or higher rank.');
  }

  try {
    const timeoutUntil = Timestamp.fromMillis(Date.now() + durationMinutes * 60 * 1000);
    const userDocRef = doc(adminDb, 'users', userId);
    await updateDoc(userDocRef, {
      timeoutUntil,
    });
    revalidatePath('/chat');
    return { success: true, message: `User has been timed out for ${durationMinutes} minutes.` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function unbanUser(userId: string) {
  const moderator = await getAdminUserWithProfile();
   if (!moderator) {
    throw new Error('Unauthorized: You must be an admin to perform this action.');
  }

  const targetDoc = await getDoc(doc(adminDb, 'users', userId));
  if (!targetDoc.exists()) {
      throw new Error('User not found.');
  }
  const target = targetDoc.data() as UserProfile;

  if (!canModerate(moderator, target)) {
      throw new Error('Permission Denied: You cannot manage a user with equal or higher rank.');
  }

  try {
    const userDocRef = doc(adminDb, 'users', userId);
    await updateDoc(userDocRef, {
      isBanned: false,
      timeoutUntil: null,
    });
    revalidatePath('/chat');
    return { success: true, message: 'User has been unbanned.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateUserRoles(userId: string, newRoles: string[]) {
    const moderator = await getAdminUserWithProfile();
    if (!moderator) {
        throw new Error('Unauthorized: You must be an admin to perform this action.');
    }

    const targetDoc = await getDoc(doc(adminDb, 'users', userId));
    if (!targetDoc.exists()) {
        throw new Error('User not found.');
    }
    const target = targetDoc.data() as UserProfile;

    if (!canModerate(moderator, target)) {
        throw new Error('Permission Denied: You cannot manage roles for a user with equal or higher rank.');
    }
    
    // Ensure 'member' is always present if no other roles are selected
    if (newRoles.length === 0) {
        newRoles = ['member'];
    } else if (!newRoles.includes('member')){
        newRoles.push('member');
    }

    try {
        const userDocRef = doc(adminDb, 'users', userId);
        await updateDoc(userDocRef, {
            roles: newRoles
        });
        revalidatePath('/chat');
        return { success: true, message: "User roles updated successfully." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

    