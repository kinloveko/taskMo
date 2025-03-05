import React, { useState, useEffect } from "react";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import Auth from "./components/Login";
import RegisterUser from "./components/screen/RegisterUser";
import HomeScreen from "./components/screen/HomeScreen";
import { RootStackParamList, AuthStackParamList } from "./lib/navigationTypes";
import MainNavigation from "./navigation/MainNavigation";

/** Authentication Stack */
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Auth" component={Auth} />
      <AuthStack.Screen name="RegisterUser" component={RegisterUser} />
      <AuthStack.Screen name="Home" component={HomeScreen} />
    </AuthStack.Navigator>
  );
}
/** Root Stack */
const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {session ? (
              <RootStack.Screen
                name="MainTabs"
                children={() => <MainNavigation session={session} />}
              />
            ) : (
              <RootStack.Screen
                name="AuthStack"
                component={AuthStackNavigator}
              />
            )}
          </RootStack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
