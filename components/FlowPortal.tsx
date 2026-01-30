import React from 'react';
import { createPortal } from 'react-dom';

const getFlowPortalTarget = () => {
  if (typeof document === 'undefined') return null;
  // Keep overlays clipped to the app window (rounded corners) and outside any transformed pages.
  return document.querySelector('.flow-window') ?? document.body;
};

interface FlowPortalProps {
  children: React.ReactNode;
}

const FlowPortal: React.FC<FlowPortalProps> = ({ children }) => {
  const target = getFlowPortalTarget();
  if (!target) return <>{children}</>;
  return createPortal(children, target);
};

export default FlowPortal;

