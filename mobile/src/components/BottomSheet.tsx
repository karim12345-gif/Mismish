import React from 'react';
import { View } from 'react-native';
import { styled } from 'nativewind';

interface BottomSheetProps {
  children: React.ReactNode;
  height?: string; // Tailwind height class or percentage
}

const StyledView = styled(View);

export default function BottomSheet({ children }: BottomSheetProps) {
  return (
    <StyledView className="w-full bg-[#146566] rounded-t-[32px] px-6 pt-10 pb-8 absolute bottom-0 h-[45%]">
      {children}
    </StyledView>
  );
}
