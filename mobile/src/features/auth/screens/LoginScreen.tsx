import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button, IconButton } from "@components/index";

import { useTranslation } from "react-i18next";
import { GuestAuthModal } from "../../../components/GuestAuthModal";

const StyledView = styled(View);
const StyledText = styled(Text);

const LoginScreen = () => {
  const navigation = useNavigation();

  const { t } = useTranslation();

  const [authVisible, setAuthVisible] = useState(false);

  return (
    <StyledView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {/* Header */}
        <StyledView className="flex-row items-center mb-8 mt-4">
          <IconButton
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2"
            icon={<Ionicons name="chevron-back" size={24} color="#000" />}
          />
          <StyledText className="text-xl font-bold ml-2">
            {t("auth.login")}
          </StyledText>
        </StyledView>

        <StyledView className="mb-8">
          <StyledText className="text-3xl font-bold text-[#146566] mb-2">
            Welcome Back
          </StyledText>
          <StyledText className="text-gray-500">Sign in to continue</StyledText>
        </StyledView>

        <StyledText className="text-gray-500 mb-8">
          Enter your Saudi phone number and verify the Firebase OTP code.
        </StyledText>

        <Button
          label="Continue with phone"
          className="bg-[#F59E0B]"
          onPress={() => setAuthVisible(true)}
        />

        <GuestAuthModal
          visible={authVisible}
          onClose={() => setAuthVisible(false)}
          onLoginSuccess={() => setAuthVisible(false)}
        />
      </ScrollView>
    </StyledView>
  );
};

export default LoginScreen;
