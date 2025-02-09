/**
 * Custom scrollable container with hidden scrollbars
 * Features:
 * - Cross-browser scrollbar hiding
 * - Dynamic height adjustment
 * - Styled-components integration
 */

import React, { ReactNode, CSSProperties } from "react";
import styled from "styled-components";
import { cn } from "~/lib/utils";

// Styled component with hidden scrollbar styles
const ScrollableDiv = styled.div`
  max-height: 60vh;
  overflow-y: scroll;

  /* Hide scrollbar in WebKit browsers (Chrome, Safari, Edge) */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Firefox: hide scrollbar */
  scrollbar-width: none;
`;

const ScrollableContainer: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({ 
  children,
  ...rest 
}) => {
  return <ScrollableDiv {...rest}>{children}</ScrollableDiv>;
};

export default ScrollableContainer;

