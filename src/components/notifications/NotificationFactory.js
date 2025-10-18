'use client';

import InfoNotification from './InfoNotification';
import InvitationNotification from './InvitationNotification';
import FriendRequestNotification from './FriendRequestNotification';

export default function NotificationFactory({ notification, onMarkAsRead, onUpdate }) {
  switch (notification.type) {
    case 'invitation':
      return (
        <InvitationNotification
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onUpdate={onUpdate}
        />
      );
    case 'friend_request':
      return (
        <FriendRequestNotification
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onUpdate={onUpdate}
        />
      );
    case 'activity_update':
    case 'memory_comment':
    default:
      return (
        <InfoNotification
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      );
  }
}
