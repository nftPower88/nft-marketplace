import React, { useEffect } from "react";

import "./CallRejectedDialog.module.css";

type Props = {
  reason: string;
  hideCallRejectedDialog(callRejected: CallRejected): void;
};

const CallRejectedDialog = ({ reason, hideCallRejectedDialog }: Props) => {
  useEffect(() => {
    setTimeout(() => {
      hideCallRejectedDialog({
        rejected: false,
        reason: "",
      });
    }, 4000);
  }, []);

  return (
    <div className="call_rejected_dialog background_secondary_color">
      <span>{reason}</span>
    </div>
  );
};

export default CallRejectedDialog;
