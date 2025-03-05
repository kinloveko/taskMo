import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const NoTasksFound = () => {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        marginTop: 100,
        paddingHorizontal: 20,
      }}
    >
      <MaterialCommunityIcons
        name="clipboard-text-outline"
        size={60}
        color="#b0b0b0"
      />
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#555",
          marginTop: 10,
        }}
      >
        No tasks found
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#777",
          textAlign: "center",
          marginTop: 5,
        }}
      >
        Add a new task to get started
      </Text>
    </View>
  );
};

export default NoTasksFound;
