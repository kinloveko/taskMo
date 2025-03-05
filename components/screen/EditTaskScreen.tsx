import React, { useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import {
  Text,
  TextInput,
  Button,
  IconButton,
  Checkbox,
  List,
  Menu,
  Modal,
  Portal,
} from "react-native-paper";
import { supabase } from "../../lib/supabase";

type ChecklistItem = {
  id: number;
  text: string;
  checked: boolean;
};

import DateTimePicker from "@react-native-community/datetimepicker";

export const EditTaskScreen = ({
  task,
  onClose,
  onUpdate,
  setLoading,
}: {
  task: any;
  onClose: () => void;
  onUpdate: () => void;
  setLoading: (loading: boolean) => void;
}) => {
  const [updatedTask, setUpdatedTask] = useState(task.task);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority.toLowerCase());
  const [dateStart, setDateStart] = useState(new Date(task.date_start));
  const [dueDate, setDueDate] = useState(new Date(task.due_date));
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    JSON.parse(task.checklist || "[]")
  );

  // State for modals and menus
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const handleUpdateTask = async () => {
    setLoading(true);
    onClose(); // Close modal
    setTimeout(async () => {
      const { error } = await supabase
        .from("todos")
        .update({
          task: updatedTask,
          description,
          priority,
          date_start: dateStart.toISOString(),
          due_date: dueDate.toISOString(),
          checklist: JSON.stringify(checklist),
        })
        .eq("id", task.id);

      setLoading(false);

      if (error) {
        console.error("Error updating task:", error);
        return;
      }

      onUpdate(); // Refresh FlatList
    }, 1500);
  };

  return (
    <>
      <ScrollView
        style={{ marginTop: Platform.OS === "ios" ? 40 : 10, flex: 1 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderBottomWidth: 1,
            borderBottomColor: "#ddd",
            backgroundColor: "#fff",
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          <IconButton icon="arrow-left" onPress={onClose} />
          <Text variant="titleMedium" style={{ textAlign: "center", flex: 1 }}>
            Edit Task
          </Text>
          <View style={{ width: 48 }} />
        </View>

        <View
          style={{
            padding: 20,
            opacity:
              showPriorityMenu || showDuePicker || showStartPicker ? 0.5 : 1,
          }}
        >
          {/* Task Inputs */}
          <TextInput
            placeholder="Task Name"
            value={updatedTask}
            onChangeText={setUpdatedTask}
            numberOfLines={3}
            activeUnderlineColor="#2C3E50"
            style={{
              marginBottom: 10,
              backgroundColor: "rgba(240, 240, 240, 0.9)",
            }}
          />
          <TextInput
            placeholder="Task Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            activeUnderlineColor="#2C3E50"
            style={{
              marginBottom: 10,
              minHeight: 120,
              backgroundColor: "rgba(240, 240, 240, 0.9)",
            }}
          />

          {/* Checklist Section */}
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text variant="titleSmall">Checklist</Text>
            <Button
              mode="contained-tonal"
              style={{ paddingLeft: 8, paddingRight: 8 }}
              compact
              onPress={() =>
                setChecklist([
                  ...checklist,
                  { id: Date.now(), text: "", checked: false },
                ])
              }
              buttonColor="rgba(240, 240, 240, 0.9)"
              icon="plus"
              contentStyle={{ flexDirection: "row-reverse" }} // Ensures icon appears before text
            >
              Add Checklist
            </Button>
          </View>
          {checklist.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Checkbox.Android
                color="#2C3E50"
                status={item.checked ? "checked" : "unchecked"}
                onPress={() =>
                  setChecklist((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, checked: !i.checked } : i
                    )
                  )
                }
              />
              <TextInput
                value={item.text}
                onChangeText={(text) =>
                  setChecklist((prev) =>
                    prev.map((i) => (i.id === item.id ? { ...i, text } : i))
                  )
                }
                activeUnderlineColor="#2C3E50"
                style={{
                  flex: 1,
                  marginRight: 10,
                  backgroundColor: "rgba(240, 240, 240, 0.9)",
                }}
              />
              <IconButton
                icon="delete"
                onPress={() =>
                  setChecklist((prev) => prev.filter((i) => i.id !== item.id))
                }
              />
            </View>
          ))}

          <Text style={{ marginTop: 30 }} variant="titleSmall">
            Set dates
          </Text>
          {/* Date Pickers - Bottom Sheet Modals */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            <Button
              onPress={() => {
                setTempDate(dateStart || new Date());
                setShowStartPicker(true);
              }}
              icon="calendar"
              mode="contained-tonal"
              buttonColor="rgba(240, 240, 240, 0.9)"
              style={{ flex: 1, marginRight: 10 }}
            >
              {dateStart ? dateStart.toDateString() : "Set Start Date"}
            </Button>

            <Button
              onPress={() => {
                setTempDate(dueDate || new Date());
                setShowDuePicker(true);
              }}
              icon="calendar"
              mode="contained-tonal"
              style={{ flex: 1 }}
              buttonColor="rgba(240, 240, 240, 0.9)"
            >
              {dueDate ? dueDate.toDateString() : "Set Due Date"}
            </Button>
          </View>

          {/* Priority Dropdown */}

          {/* Priority Selection */}
          <View>
            <Text
              style={{
                marginBottom: 20,
                width: showDuePicker || showStartPicker ? 0 : "auto",
              }}
              variant="titleSmall"
            >
              Priority
            </Text>
            <Button
              textColor="black"
              mode="outlined"
              onPress={() => setShowPriorityMenu(true)}
            >
              {priority}
            </Button>
          </View>

          <Button
            mode="contained"
            onPress={handleUpdateTask}
            style={{ marginTop: 20 }}
            buttonColor="#2C3E50" // Dark gray color
          >
            Save Task
          </Button>
        </View>

        {/* Start Date Modal */}
        <Modal
          visible={showStartPicker}
          onDismiss={() => setShowStartPicker(false)}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            marginHorizontal: 20,
          }}
        >
          <DateTimePicker
            value={tempDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, date) => {
              if (date) setTempDate(date);
            }}
          />
          <Button
            mode="contained"
            buttonColor="#2C3E50"
            onPress={() => {
              if (tempDate) {
                setDateStart(tempDate);
              }
              setShowStartPicker(false);
            }}
          >
            Done
          </Button>
        </Modal>

        {/* Due Date Modal */}
        <Modal
          visible={showDuePicker}
          onDismiss={() => setShowDuePicker(false)}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            marginHorizontal: 20,
          }}
        >
          <DateTimePicker
            value={tempDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, date) => {
              if (date) setTempDate(date);
            }}
          />
          <Button
            mode="contained"
            onPress={() => {
              if (tempDate) {
                setDueDate(tempDate);
              }
              setShowDuePicker(false);
            }}
          >
            Done
          </Button>
        </Modal>
        <Modal
          visible={showPriorityMenu}
          onDismiss={() => setShowPriorityMenu(false)}
          contentContainerStyle={{
            zIndex: 999,
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            marginHorizontal: 20,
            elevation: 5, // Shadow for Android
            shadowColor: "#000", // Shadow for iOS
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
          }}
        >
          <List.Item
            title="Low"
            onPress={() => {
              setPriority("low");
              setShowPriorityMenu(false);
            }}
          />
          <List.Item
            title="Medium"
            onPress={() => {
              setPriority("medium");
              setShowPriorityMenu(false);
            }}
          />
          <List.Item
            title="High"
            onPress={() => {
              setPriority("high");
              setShowPriorityMenu(false);
            }}
          />
        </Modal>
      </ScrollView>
    </>
  );
};
