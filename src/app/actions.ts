
"use server";

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc, arrayUnion, arrayRemove, Timestamp, deleteDoc, FieldValue, deleteField } from 'firebase/firestore';
import { put } from '@vercel/blob';

const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_8HSrMdmAaDmCBCli_lqMTRNfOMGgwE4UcnsEaceeDiYfLwf";

export async function uploadAvatar(formData: FormData) {
  const file = formData.get('file') as File;
  const blob = await put(`avatars/${file.name}`, file, {
    access: 'public',
    token: BLOB_READ_WRITE_TOKEN,
  });
  return blob;
}

export async function uploadChatImage(formData: FormData) {
  const file = formData.get('file') as File;
  const blob = await put(`chat_images/${file.name}`, file, {
    access: 'public',
    token: BLOB_READ_WRITE_TOKEN,
  });
  return blob;
}


export async function banUser(userId: string) {
  try {
    const userDocRef = doc(db, 'users', userId);
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
    const timeoutUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      timeoutUntil: Timestamp.fromDate(timeoutUntil)
    });

    revalidatePath('/chat');
    return { success: true, message: `User has been timed out for ${durationMinutes} minutes.` };
  } catch (error: any) {
    if (error.code === 'permission-denied') {
       return { success: false, message: "You don't have permission to perform this action." };
    }
    return { success: false, message: error.message };
  }
}


export async function unbanUser(userId: string) {
  try {
    const userDocRef = doc(db, 'users', userId);
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
        const userDocRef = doc(db, 'users', userId);
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
        const requesterDocRef = doc(db, "users", requesterId);
        const recipientDocRef = doc(db, "users", recipientId);

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
        const userDocRef = doc(db, "users", userId);
        const requesterDocRef = doc(db, "users", requesterId);

        await updateDoc(userDocRef, {
            friends: arrayUnion(requesterId),
            [`friendRequests.${requesterId}`]: deleteField()
        });
        await updateDoc(requesterDocRef, {
            friends: arrayUnion(userId),
            [`friendRequests.${userId}`]: deleteField()
        });

        revalidatePath('/chat');
        revalidatePath('/chat/requests');
        return { success: true, message: 'Friend request accepted.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function removeFriend(userId: string, friendId: string) {
    try {
        const userDocRef = doc(db, "users", userId);
        const friendDocRef = doc(db, "users", friendId);

        // This action can be used to remove a friend OR decline/cancel a request
        await updateDoc(userDocRef, {
            friends: arrayRemove(friendId),
            [`friendRequests.${friendId}`]: deleteField()
        });
        await updateDoc(friendDocRef, {
            friends: arrayRemove(userId),
            [`friendRequests.${userId}`]: deleteField()
        });


        revalidatePath('/chat');
        revalidatePath('/chat/requests');
        return { success: true, message: 'Friend removed or request declined.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteMessage(channelType: 'channel' | 'dm', channelId: string, messageId: string) {
    try {
        const collectionPath = channelType === 'channel'
            ? `channels/${channelId}/messages`
            : `dms/${channelId}/messages`;
        
        const messageDocRef = doc(db, collectionPath, messageId);
        await deleteDoc(messageDocRef);
        
        revalidatePath('/chat');
        return { success: true, message: 'Message deleted.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function editMessage(channelType: 'channel' | 'dm', channelId: string, messageId: string, newText: string) {
    try {
        const collectionPath = channelType === 'channel'
            ? `channels/${channelId}/messages`
            : `dms/${channelId}/messages`;
        
        const messageDocRef = doc(db, collectionPath, messageId);
        await updateDoc(messageDocRef, {
            text: newText,
            editedAt: serverTimestamp()
        });
        
        revalidatePath('/chat');
        return { success: true, message: 'Message edited.' };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
