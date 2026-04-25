import React from "react";
import { View, Text, ScrollView } from "react-native";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@components/Input";
import { Button, IconButton } from "@components/index";

import { useTranslation } from "react-i18next";

const StyledView = styled(View);
const StyledText = styled(Text);

const LoginScreen = () => {
  const navigation = useNavigation();

  const { t } = useTranslation();

  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setIsLoading(false);
  };

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

        {/* Form */}
        <Input
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
        />

        <StyledText className="self-end mb-6 text-[#F59E0B] font-medium">
          Forgot Password?
        </StyledText>

        <Button
          label={isLoading ? "Signing in..." : t("auth.login")}
          className="bg-[#F59E0B]"
          onPress={handleLogin}
          isLoading={isLoading}
        />

        {/* Footer */}
        <StyledView className="flex-row justify-center mt-6">
          <StyledText className="text-gray-500">
            Don't have an account?{" "}
          </StyledText>
          <StyledText
            onPress={() => navigation.navigate("Signup" as never)}
            className="text-[#F59E0B] font-bold"
          >
            Sign up
          </StyledText>
        </StyledView>
      </ScrollView>
    </StyledView>
  );
};

export default LoginScreen;
