import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../slices/reducer';
import { LAYOUT_DIRECTION } from '../constants/layout';

interface DirectionalIconProps {
  children: React.ReactNode;
  className?: string;
  shouldFlip?: boolean; // Whether this icon should flip in RTL
}

const DirectionalIcon: React.FC<DirectionalIconProps> = ({ 
  children, 
  className = '', 
  shouldFlip = true 
}) => {
  const { layoutDirection } = useSelector((state: RootState) => state.Layout);
  
  const isRTL = layoutDirection === LAYOUT_DIRECTION.RTL;
  const flipClass = shouldFlip && isRTL ? 'rtl-flip' : '';
  
  return (
    <span className={`${className} ${flipClass}`.trim()}>
      {children}
    </span>
  );
};

export default DirectionalIcon; 