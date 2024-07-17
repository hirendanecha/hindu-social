import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  public socket: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth-token');
      if (token) {
        const customHeaders = {
          Authorization: `Bearer ${token}`,
        };
        this.socket = io(environment.socketUrl, {
          reconnectionDelay: 100,
          reconnectionDelayMax: 300,
          // reconnection: true,
          randomizationFactor: 0.2,
          // timeout: 120000,
          reconnectionAttempts: 50000,
          transports: ['websocket'],
          auth: customHeaders,
        });
      }
    }
  }

  connect(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth-token');
      if (token) {
        const customHeaders = {
          Authorization: `Bearer ${token}`,
        };
        // if (this.socket) {
        //   this.socket?.close();
        // }
        if (!this.socket) {
          this.socket = io(environment.socketUrl, {
            reconnectionDelay: 100,
            reconnectionDelayMax: 300,
            reconnection: true,
            randomizationFactor: 0.2,
            // timeout: 120000,
            reconnectionAttempts: 50000,
            transports: ['websocket'],
            auth: customHeaders,
          });
        }
      }
    }
  }

  // socket for posts //
  getPost(params, callback: (post: any) => void) {
    this.socket?.emit('get-new-post', params, callback);
  }

  createOrEditPost({ file, ...params }) {
    if (this.socket?.connected) {
      this.socket?.emit('create-new-post', params);
    } else {
      this.socket?.connect();
      this.socket?.emit('create-new-post', params);
    }

  }

  editPost(params, callback: (post: any) => void) {
    this.socket?.emit('create-new-post', params, callback);
  }

  // socket for community //
  getCommunityPost(params, callback: (post: any) => void) {
    this.socket?.emit('get-community-post', params, callback);
  }

  createCommunityPost(params, callback: (post: any) => void) {
    this.socket?.emit('create-community-post', params, callback);
  }

  createCommunity(params, callback: (post: any) => void) {
    this.socket?.emit('create-new-community', params, callback);
  }

  getCommunity(params, callback: (post: any) => void) {
    this.socket?.emit('get-new-community', params, callback);
  }

  likeFeedPost(params, callback: (post: any) => void) {
    this.socket?.emit('likeOrDislike', params, callback);
  }

  likeFeedComments(params, callback: (post: any) => void) {
    this.socket?.emit('likeOrDislikeComments', params, callback);
  }

  disLikeFeedPost(params, callback: (post: any) => void) {
    this.socket?.emit('likeOrDislike', params, callback);
  }

  commentOnPost(params, callback: (data: any) => void) {
    this.socket?.emit('comments-on-post', params, callback);
  }
  
  readNotification(params, callback: (data: any) => void) {
    this.socket?.emit('isReadNotification', params, callback);
  }
  getMeta(params) {
    this.socket?.emit('get-meta', params);
  }

  // socket for chat

  getChatList(params, callback: (data: any) => void) {
    this.socket?.emit('get-chat-list', params, callback);
  }

  createChatRoom(params, callback: (data: any) => void) {
    this.socket.emit('create-room', params, callback);
  }

  acceptRoom(params, callback: (data: any) => void) {
    this.socket.emit('accept-room', params, callback);
  }

  sendMessage(params, callback: (data: any) => void) {
    this.socket.emit('send-message', params, callback);
  }

  readMessage(params, callback: (data: any) => void) {
    this.socket.emit('read-message', params, callback);
  }

  readGroupMessage(params, callback: (data: any) => void) {
    this.socket.emit('read-group-message', params, callback);
  }

  editMessage(params, callback: (data: any) => void) {
    this.socket.emit('edit-message', params, callback);
  }

  deleteMessage(params, callback: (data: any) => void) {
    this.socket.emit('delete-message', params, callback);
  }

  startCall(params, callback: (data: any) => void) {
    this.socket.emit('start-call', params, callback);
  }

  hangUpCall(params, callback: (data: any) => void) {
    this.socket.emit('decline-call', params, callback);
  }

  pickUpCall(params, callback: (data: any) => void) {
    this.socket.emit('pick-up-call', params, callback);
  }

  createGroup(params, callback: (data: any) => void) {
    this.socket.emit('create-group', params, callback);
  }

  getGroup(params, callback: (data: any) => void) {
    this.socket.emit('get-group-list', params, callback);
  }

  getGroupData(params, callback: (data: any) => void) {
    this.socket.emit('get-group', params, callback);
  }

  removeGroupMember(params, callback: (data: any) => void) {
    this.socket.emit('remove-member', params, callback);
  }

  startTyping(params, callback: (data: any) => any) {
    this.socket.emit('start-typing', params, callback);
  }

  deleteRoom(params, callback: (data: any) => void) {
    this.socket.emit('delete-room', params, callback);
  }

  resendChatInvite(params, callback: (data: any) => void) {
    this.socket.emit('resend-chat-invite', params, callback);
  }

  switchChat(params, callback: (data: any) => void) {
    this.socket.emit('switch-group', params, callback);
  }

  switchOnlineStatus(params, callback: (data: any) => void) {
    this.socket.emit('change-status', params, callback);
  }

  getMessages(params, callback: (data: any) => void) {
    this.socket.emit('get-messages', params, callback);
  }
  
  checkRoom(params, callback: (data: any) => void) {
    this.socket.emit('check-room', params, callback);
  }
}
