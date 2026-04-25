import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { AuthStackParamList } from "../../../navigation/types";
import { Button, BottomSheet, IconButton } from "@components/index";
import { useAuth } from "../../../context/AuthContext";
import { useSocialLogin } from "../../../hooks/useSocialLogin";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

type AuthStartScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "AuthStart"
>;

const AuthStartScreen = () => {
  const navigation = useNavigation<AuthStartScreenNavigationProp>();
  const { login } = useAuth();
  const { mutate: socialLoginMutation, isPending } = useSocialLogin();

  // Configure Google Sign-In
  useEffect(() => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    console.log("Configuring Google Sign In with ClientID:", clientId);

    GoogleSignin.configure({
      iosClientId: clientId,
      offlineAccess: false,
    });
  }, []);

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential && credential.identityToken) {
        socialLoginMutation(
          { provider: "apple", idToken: credential.identityToken },
          {
            onSuccess: (response) => {
              console.log("Apple Login Success:", response);
              login(response.data.accessToken, response.data.refreshToken, response.data.user);
            },
            onError: (error: any) => {
              console.error("Apple Backend Error:", error);
              Alert.alert(
                "Error",
                "Login failed: " +
                  (error.response?.data?.message || error.message),
              );
            },
          },
        );
      } else {
        console.log("Apple Sign In cancelled or failed (No data)");
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // handle that the user canceled the sign-in flow
      } else {
        console.error(e);
        Alert.alert("Error", "Apple Sign in failed");
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log("Google User Info:", userInfo);

      // Verify we actually got a user (Cancel can sometimes return null/undefined depending on version)
      if (userInfo && userInfo.data && userInfo.data.idToken) {
        socialLoginMutation(
          { provider: "google", idToken: userInfo.data.idToken },
          {
            onSuccess: (response) => {
              console.log("Google Login Success:", response);
              login(response.data.accessToken, response.data.refreshToken, response.data.user);
            },
            onError: (error: any) => {
              console.error("Google Backend Error:", error);
              Alert.alert(
                "Error",
                "Login failed: " +
                  (error.response?.data?.message || error.message),
              );
            },
          },
        );
      } else {
        console.log("Google Sign In cancelled or failed (No data/token)");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        Alert.alert("Error", "Google Play Services not available");
      } else {
        // some other error happened
        console.error(error);
        Alert.alert("Error", "Google Sign in failed: " + error.message);
      }
    }
  };

  return (
    <StyledView className="flex-1 bg-white items-center">
      {/* Back Button */}
      <IconButton
        icon={<Ionicons name="chevron-back" size={24} color="#146566" />}
        onPress={() => navigation.goBack()}
        className="absolute top-12 left-4 z-10 p-2 rounded-full bg-white/70"
      />
      {/* Top Right Background Pattern */}
      <StyledImage
        source={require("@assets/images/food_BackGround.png")}
        className="absolute top-0 right-0 w-64 h-64"
        resizeMode="contain"
      />
      {/* Main Image - Centered in top portion */}
      <StyledView className="flex-1 items-center mt-60">
        <StyledImage
          source={require("@assets/images/Mismish_onBoarding.png")}
          style={{
            width: moderateScale(172),
            height: moderateScale(162),
          }}
          resizeMode="contain"
        />
      </StyledView>
      /// we show spinner full page
      <BottomSheet>
        <StyledView className="w-full">
          {/* Apple */}
          <Button
            label={isPending ? "Signing in..." : "Continue with apple"}
            onPress={handleAppleLogin}
            disabled={isPending}
            isLoading={isPending} // Show spinner if loading
            variant="social"
            className="bg-black border-0"
            leftIcon={<Ionicons name="logo-apple" size={20} color="white" />}
            // Override text style for Apple button specifically since it's black bg but social variant defaults to black text
            textClassName="text-white"
          />

          {/* Google */}
          <Button
            label={isPending ? "Signing in..." : "Continue with Google"}
            onPress={handleGoogleLogin}
            disabled={isPending}
            isLoading={isPending}
            variant="social"
            className="bg-[#1877F2] border-0"
            // Override text style for Google button
            textClassName="text-white"
            leftIcon={<Ionicons name="logo-google" size={20} color="white" />}
          />

          {/* Email */}
          <Button
            variant="primary"
            label="Continue with email"
            onPress={() => navigation.navigate("Signup")}
            className="w-full bg-[#F59E0B] mb-6 border-0"
          />

          {/* Divider */}
          <StyledView className="flex-row items-center w-full mb-6">
            <StyledView className="flex-1 h-[1px] bg-white/30" />
            <StyledText className="mx-4 text-white">or</StyledText>
            <StyledView className="flex-1 h-[1px] bg-white/30" />
          </StyledView>

          {/* Sign In Link */}
          {/* Sign In Link */}
          <StyledView className="flex-row items-center justify-center">
            <StyledText className="text-white mr-1">
              Already have an account?
            </StyledText>
            <Button
              label="Sign in"
              onPress={() => navigation.navigate("Login")}
              variant="ghost"
              className="ml-1"
              style={{
                width: "auto",
                height: "auto",
                padding: 0,
                marginBottom: 0,
              }}
              textClassName="text-[#F59E0B] font-bold"
            />
          </StyledView>
        </StyledView>
      </BottomSheet>
    </StyledView>
  );
};

export default AuthStartScreen;
