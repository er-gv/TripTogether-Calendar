import React from 'react';

interface InviteButtonProps {
  onCopyInvite: () => void;
}

const InviteButton: React.FC<InviteButtonProps> = ({ onCopyInvite }) => {
  return (
    <button
      id="copy-invite"
      onClick={onCopyInvite}
      className="btn btn-primary"
    >
      Copy Invite Link
    </button>
  );
};

export default InviteButton;