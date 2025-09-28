
"use server";

import { adminDb } from '@/lib/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function banUser(userId: string) {
  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    await userDocRef.update({
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
    const timeoutUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    const userDocRef = adminDb.collection('users').doc(userId);
    await userDocRef.update({
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
    const userDocRef = adminDb.collection('users').doc(userId);
    await userDocRef.update({
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
        const userDocRef = adminDb.collection('users').doc(userId);
        await userDocRef.update({
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
        const requesterDocRef = adminDb.collection('users').doc(requesterId);
        const recipientDocRef = adminDb.collection('users').doc(recipientId);

        await requesterDocRef.update({
            [`friendRequests.${recipientId}`]: 'sent'
        });
        await recipientDocRef.update({
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
        const userDocRef = adminDb.collection('users').doc(userId);
        const requesterDocRef = adminDb.collection('users').doc(requesterId);

        // Use Firestore transaction or batched write for atomicity if needed, but for now this is fine.
        await userDocRef.update({
            friends: FieldValue.arrayUnion(requesterId),
            [`friendRequests.${requesterId}`]: FieldValue.delete()
        });
        await requesterDocRef.update({
            friends: FieldValue.arrayUnion(userId),
            [`friendRequests.${userId}`]: FieldValue.delete()
        });

        revalidatePath('/chat');
        return { success: true, message: 'Friend request accepted.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function removeFriend(userId: string, friendId: string) {
    try {
        const userDocRef = adminDb.collection('users').doc(userId);
        const friendDocRef = adminDb.collection('users').doc(friendId);

        await userDocRef.update({
            friends: FieldValue.arrayRemove(friendId)
        });
        await friendDocRef.update({
            friends: FieldValue.arrayRemove(userId)
        });

        revalidatePath('/chat');
        return { success: true, message: 'Friend removed.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
