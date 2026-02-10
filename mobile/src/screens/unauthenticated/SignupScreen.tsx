import React from "react";
import { View, Text, ScrollView } from "react-native";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@components/Input";
import { Button, IconButton } from "@components/index";

const StyledView = styled(View);
const StyledText = styled(Text);

const SignupScreen = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignup = async () => {
    try {
      setIsLoading(true);
      // Simulate api call
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
          <StyledText className="text-xl font-bold ml-2">Sign Up</StyledText>
        </StyledView>

        <StyledView className="mb-8">
          <StyledText className="text-3xl font-bold text-[#146566] mb-2">
            Create Account
          </StyledText>
          <StyledText className="text-gray-500">
            Enter your details to register
          </StyledText>
        </StyledView>

        {/* Form */}
        <Input label="Full Name" placeholder="Enter your full name" />

        <Input
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          placeholder="Create a password"
          secureTextEntry
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          secureTextEntry
        />

        <Button
          label={isLoading ? "Signing up..." : "Sign Up"}
          className="mt-6 bg-[#F59E0B]"
          onPress={handleSignup}
          isLoading={isLoading}
        />

        {/* Footer */}
        <StyledView className="flex-row justify-center mt-6">
          <StyledText className="text-gray-500">
            Already have an account?
          </StyledText>
          <StyledText
            onPress={() => navigation.navigate("Login" as never)}
            className="text-[#F59E0B] font-bold ml-1"
          >
            Sign in
          </StyledText>
        </StyledView>
      </ScrollView>
    </StyledView>
  );
};

export default SignupScreen;
