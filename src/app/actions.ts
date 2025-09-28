
"use server";

import { adminDb } from '@/lib/firebase/server';
import { doc, updateDoc, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
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

export async function sendFriendRequest(requesterId: string, recipientId: string) {
    try {
        const requesterDocRef = doc(adminDb, 'users', requesterId);
        const recipientDocRef = doc(adminDb, 'users', recipientId);

        await updateDoc(requesterDocRef, {
            [`friendRequests.${recipientId}`]: 'sent'
        });
        await updateDoc(recipientDocRef, {
            [`friendRequests.${requesterId}`]: 'received'
        });

        revalidatePath('/chat');
        return { success: true, message: 'Friend request sent.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function acceptFriendRequest(userId: string, requesterId: string) {
    try {
        const userDocRef = doc(adminDb, 'users', userId);
        const requesterDocRef = doc(adminDb, 'users', requesterId);

        await updateDoc(userDocRef, {
            friends: arrayUnion(requesterId),
            [`friendRequests.${requesterId}`]: null 
        });
        await updateDoc(requesterDocRef, {
            friends: arrayUnion(userId),
            [`friendRequests.${userId}`]: null
        });

        revalidatePath('/chat');
        return { success: true, message: 'Friend request accepted.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function removeFriend(userId: string, friendId: string) {
    try {
        const userDocRef = doc(adminDb, 'users', userId);
        const friendDocRef = doc(adminDb, 'users', friendId);

        await updateDoc(userDocRef, {
            friends: arrayRemove(friendId)
        });
        await updateDoc(friendDocRef, {
            friends: arrayRemove(userId)
        });

        revalidatePath('/chat');
        return { success: true, message: 'Friend removed.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
