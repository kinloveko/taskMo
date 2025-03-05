import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";

// Bottom Tab Navigation
export type RootTabParamList = {
  Home: undefined;
  Profile: undefined;
  AddTask: undefined;
  EditTask: { task: any }; // Allow task parameter
};

// Authentication Stack
export type AuthStackParamList = {
  Auth: undefined;
  RegisterUser: undefined;
  Login: undefined;
  Home: undefined;
};

// Root Stack (Contains both Auth and Bottom Tabs)
export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  MainTabs: NavigatorScreenParams<RootTabParamList>;
};

// Props for Authentication Screens
export type AuthScreenNavigationProp = NativeStackScreenProps<
  AuthStackParamList,
  "Auth"
>;

export type RegisterUserScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "RegisterUser"
>;

// Props for Bottom Tab Screens
export type HomeScreenProps = BottomTabScreenProps<RootTabParamList, "Home">;
export type AddTaskScreenProps = BottomTabScreenProps<
  RootTabParamList,
  "AddTask"
>;
export type EditTaskScreenProps = BottomTabScreenProps<
  RootTabParamList,
  "EditTask"
>;

// Root Navigation Prop
export type RootNavigationProp = NativeStackScreenProps<RootStackParamList>;
