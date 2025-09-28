
"use server";

import { adminDb } from '@/lib/firebase/server';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function banUser(userId: string) {
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
    // Ensure 'member' is always present if no other roles are selected
    if (newRoles.length === 0) {
        newRoles.push('member');
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
