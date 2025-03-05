import React, { useState } from "react";

import { View, Text } from "react-native";
import { Checkbox } from "react-native-paper";
import { supabase } from "../../lib/supabase"; // Ensure this is correctly imported

const Checklist = ({
  selectedTask,
  refreshTask,
}: {
  selectedTask: any;
  refreshTask: () => void;
}) => {
  const [checklist, setChecklist] = useState(
    JSON.parse(selectedTask?.checklist || "[]")
  );

  // Handle Check/Uncheck
  const toggleCheck = async (index: number) => {
    const updatedChecklist = [...checklist];
    updatedChecklist[index].checked = !updatedChecklist[index].checked;

    setChecklist(updatedChecklist); // Update UI immediately

    // Update Supabase
    const { error } = await supabase
      .from("todos")
      .update({ checklist: JSON.stringify(updatedChecklist) })
      .eq("id", selectedTask.id);

    if (error) {
      console.error("Failed to update checklist:", error);
    } else {
      refreshTask(); // Re-fetch task data to ensure it stays in sync
    }
  };

  return (
    <View style={{ marginTop: 15 }}>
      {checklist.length === 0 ? (
        <Text style={{ fontSize: 16, color: "gray", fontStyle: "italic" }}>
          No checklist on this ticket.
        </Text>
      ) : (
        checklist.map(
          (item: { text: string; checked: boolean }, index: number) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Checkbox.Android
                status={item.checked ? "checked" : "unchecked"}
                color="#2C3E50"
                onPress={() => toggleCheck(index)}
              />
              <Text style={{ fontSize: 16, color: "black", marginLeft: 10 }}>
                {item.text}
              </Text>
            </View>
          )
        )
      )}
    </View>
  );
};

export default Checklist;
