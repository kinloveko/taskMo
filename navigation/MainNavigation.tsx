import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HomeScreen from "../components/screen/HomeScreen";
import ProfileScreen from "../components/screen/ProfileScreen";
import AddTaskScreen from "../components/screen/AddTaskScreen";
import { RootTabParamList } from "../lib/navigationTypes";
import { Session } from "@supabase/supabase-js";
import { useRoute } from "@react-navigation/native";

const Tab = createBottomTabNavigator<RootTabParamList>();

type MainNavigationProps = {
  session: Session;
};

export default function MainNavigation({ session }: MainNavigationProps) {
  const route = useRoute();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "AddTask") iconName = "plus-box";
          else if (route.name === "Profile") iconName = "account";

          return <Icon name={iconName ?? ""} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{ tabBarLabel: "Add", title: "Add Task" }}
      />
      <Tab.Screen name="Profile">
        {() => <ProfileScreen session={session} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
