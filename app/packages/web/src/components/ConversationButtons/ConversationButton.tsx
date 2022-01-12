import React, { FC } from "react";

import CSS from "csstype";

const button: CSS.Properties = {
  width: "50px",
  height: "50px",
  borderRadius: "40px",
  border: "2px solid #e6e5e8",
  textDecoration: "none",
  backgroundColor: "#282c34",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: "10px",
  boxShadow: "none",
  borderImage: "none",
  borderStyle: "none",
  borderWidth: "0px",
  outline: "none",
};

type Props = {
  onClickHandler(): void;
};

const ConversationButton: FC<Props> = ({ onClickHandler, children }) => {
  return (
    <button style={button} onClick={onClickHandler}>
      {children}
    </button>
  );
};

export default ConversationButton;
