import React, { useState } from "react";
import { View, ScrollView, Platform } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import {
  Text,
  Button,
  TextInput,
  List,
  IconButton,
  Checkbox,
  Menu,
  Modal,
  Portal,
} from "react-native-paper";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { supabase } from "../../lib/supabase";
import { AddTaskScreenProps } from "../../lib/navigationTypes";

export default function AddTaskScreen({ navigation }: AddTaskScreenProps) {
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [checklist, setChecklist] = useState<
    { id: number; text: string; checked: boolean }[]
  >([]);
  const [dateStart, setDateStart] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState("Medium"); // Default priority
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null); // Temporary selected date
  const [loading, setLoading] = useState(false); // 🔹 Loading state

  // Add checklist item
  const addChecklistItem = () => {
    setChecklist([...checklist, { id: Date.now(), text: "", checked: false }]);
  };

  // Remove checklist item
  const removeChecklistItem = (id: number) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  // Update checklist item
  const updateChecklistItem = (id: number, text: string) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  // Toggle checklist item checked state
  const toggleChecklistItem = (id: number) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  async function addTask() {
    setLoading(true); // Start loading

    const { data, error } = await supabase.from("todos").insert({
      task,
      description,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      date_start: dateStart?.toISOString(),
      due_date: dueDate?.toISOString(),
      priority: priority.toLowerCase(),
      checklist: checklist.length > 0 ? JSON.stringify(checklist) : null,
    });

    if (error) {
      console.error(error);
    } else {
      // Reset fields on success
      setTask("");
      setDescription("");
      setChecklist([]);
      setDateStart(null);
      setDueDate(null);
      setPriority("Medium");
      navigation.navigate("Home");
    }

    setLoading(false); // Stop loading
  }

  return (
    <ScrollView style={{ padding: 20, backgroundColor: "white" }}>
      {/* Task Title */}
      <TextInput
        placeholder="Task Name"
        value={task}
        onChangeText={setTask}
        activeUnderlineColor="#2C3E50"
        style={{
          marginBottom: 20,
          backgroundColor: "rgba(240, 240, 240, 0.9)",
        }}
      />

      <TextInput
        placeholder="Task Description"
        value={description}
        onChangeText={setDescription}
        multiline
        activeUnderlineColor="#2C3E50"
        numberOfLines={5}
        style={{
          marginBottom: 20,
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
          textColor="black"
          buttonColor="rgba(240, 240, 240, 0.9)"
          icon="plus"
          contentStyle={{ flexDirection: "row-reverse" }} // Ensures icon appears before text
        >
          Add Checklist
        </Button>
      </View>
      <List.Section>
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
              onPress={() => toggleChecklistItem(item.id)}
            />
            <TextInput
              value={item.text}
              activeUnderlineColor="#2C3E50"
              placeholder="Ex. Buy groceries"
              onChangeText={(text) => updateChecklistItem(item.id, text)}
              style={{
                flex: 1,
                marginRight: 10,
                backgroundColor: "rgba(240, 240, 240, 0.9)",
              }}
            />
            <IconButton
              icon="delete"
              onPress={() => removeChecklistItem(item.id)}
            />
          </View>
        ))}
      </List.Section>

      {/* Date Pickers - Bottom Sheet Modals */}
      <Text
        style={{
          marginBottom: 20,
          marginTop: 20,
          width: showDuePicker || showStartPicker ? 0 : "auto",
        }}
        variant="titleSmall"
      >
        Set dates
      </Text>
      <List.Section>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Start Date Button */}
          <Button
            onPress={() => {
              setTempDate(dateStart || new Date());
              setShowStartPicker(true);
            }}
            icon="calendar"
            mode="contained-tonal"
            textColor="black"
            buttonColor="rgba(240, 240, 240, 0.9)"
            style={{ flex: 1, marginRight: 10 }}
          >
            {dateStart ? dateStart.toDateString() : "Set Start Date"}
          </Button>

          {/* Due Date Button */}
          <Button
            onPress={() => {
              setTempDate(dueDate || new Date());
              setShowDuePicker(true);
            }}
            icon="calendar"
            mode="contained-tonal"
            style={{ flex: 1 }}
            textColor="black"
            buttonColor="rgba(240, 240, 240, 0.9)"
          >
            {dueDate ? dueDate.toDateString() : "Set Due Date"}
          </Button>
        </View>
      </List.Section>

      {/* Start Date Modal */}
      <Portal>
        <Modal
          visible={showStartPicker && Platform.OS === "ios"}
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
            buttonColor="#2C3E50"
            mode="contained"
            onPress={() => {
              setDateStart(tempDate);
              setShowStartPicker(false);
            }}
          >
            Done
          </Button>
        </Modal>
      </Portal>
      {Platform.OS === "android" && showStartPicker && (
        <DateTimePicker
          value={tempDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            if (event.type === "set") {
              setDateStart(date ?? new Date());
              setShowStartPicker(false);
            } else {
              setShowStartPicker(false);
            }
          }}
        />
      )}
      {/* Due Date Modal */}
      <Portal>
        <Modal
          visible={showDuePicker && Platform.OS === "ios"}
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
            buttonColor="#2C3E50"
            mode="contained"
            onPress={() => {
              setDueDate(tempDate);
              setShowDuePicker(false);
            }}
          >
            Done
          </Button>
        </Modal>
      </Portal>
      {Platform.OS === "android" && showDuePicker && (
        <DateTimePicker
          value={tempDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            if (event.type === "set") {
              setDueDate(date ?? new Date());
              setShowDuePicker(false);
            } else {
              setShowDuePicker(false);
            }
          }}
        />
      )}
      {/* Priority Dropdown */}
      <Text
        style={{
          marginBottom: 20,
          marginTop: 20,
          width: showDuePicker || showStartPicker ? 0 : "auto",
        }}
        variant="titleSmall"
      >
        Priority
      </Text>
      <List.Section>
        <Menu
          visible={showPriorityMenu}
          onDismiss={() => setShowPriorityMenu(false)}
          anchor={
            <Button
              textColor="black"
              mode="outlined"
              onPress={() => setShowPriorityMenu(true)}
            >
              {priority}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setPriority("Low");
              setShowPriorityMenu(false);
            }}
            title="Low"
          />
          <Menu.Item
            onPress={() => {
              setPriority("Medium");
              setShowPriorityMenu(false);
            }}
            title="Medium"
          />
          <Menu.Item
            onPress={() => {
              setPriority("High");
              setShowPriorityMenu(false);
            }}
            title="High"
          />
        </Menu>
      </List.Section>

      {/* Save Task Button */}
      <Button
        mode="contained"
        onPress={addTask}
        buttonColor="#2C3E50"
        style={{ marginTop: 10, marginBottom: 50 }}
        disabled={loading} // Disable button while loading
      >
        {loading ? (
          <ActivityIndicator animating={true} color="white" />
        ) : (
          "Add Task"
        )}
      </Button>
      <Portal>
        <Modal visible={loading} dismissable={false}>
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              marginHorizontal: 50,
            }}
          >
            <ActivityIndicator size="large" color="#2C3E50" />
            <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "bold" }}>
              Please wait...
            </Text>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
}
