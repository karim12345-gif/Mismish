import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);

const LoginScreen = () => {
  const { login } = useAuth();
  const { t } = useTranslation();

  return (
    <StyledView className="flex-1 items-center justify-center bg-white p-6">
      <StyledText className="text-3xl font-bold text-[#146566] mb-4">
        {t("auth.login")}
      </StyledText>

      <StyledText className="text-gray-600 mb-8 text-center">
        This is a placeholder Login screen.
      </StyledText>

      <StyledTouchable
        onPress={login}
        className="w-full h-14 bg-[#F59E0B] rounded-2xl items-center justify-center"
      >
        <StyledText className="text-white text-lg font-bold">
          {t("auth.login")}
        </StyledText>
      </StyledTouchable>
    </StyledView>
  );
};

export default LoginScreen;
