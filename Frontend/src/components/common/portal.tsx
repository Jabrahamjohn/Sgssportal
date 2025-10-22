import type React from 'react';
import ReactDOM from 'react-dom';

export default function Portal({ children, domNodeId }: PortalProps) {
  const domNode = domNodeId ? document.getElementById(domNodeId) : null;

  return ReactDOM.createPortal(children, domNode || document.body);
}

type PortalProps = {
  children: React.ReactNode;
  domNodeId?: string;
};
