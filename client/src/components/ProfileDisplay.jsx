// ProfileDisplay.jsx
import React from 'react';
import './styles/ProfileDisplay.scss';

const ProfileDisplay = ({ userProfile, onClose }) => {
  if (!userProfile) {
    return <div>No profile data available</div>;
  }

  return (
    <div className="profile_display">
      <div className="profile_card">
        <p>{userProfile.username}</p>
        <img src={userProfile.image || 'default-profile.png'} alt="User Profile" />
        <p>Email: {userProfile.email}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ProfileDisplay;
