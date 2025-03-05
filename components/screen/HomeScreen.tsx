import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Animated,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from "react-native";
import {
  Text,
  Card,
  ActivityIndicator,
  FAB,
  Chip,
  IconButton,
  Menu,
  Portal,
  Dialog,
  Button,
  Checkbox,
} from "react-native-paper";
import NoTasksFound from "../resuable/NoTaskFound";
import { Swipeable } from "react-native-gesture-handler";
import { supabase } from "../../lib/supabase";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../../lib/navigationTypes";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { EditTaskScreen } from "./EditTaskScreen";
import Checklist from "../resuable/ChecklistUpdate";
type HomeScreenProps = BottomTabScreenProps<RootTabParamList, "Home">;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [sortVisible, setSortVisible] = useState(false);
  const [isEditVisible, setEditVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [viewTaskModal, setViewTaskModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "all" | "in_progress" | "completed"
  >("all"); // Default tab is 'All'
  const [sortType, setSortType] = useState<"priority" | "due_date" | null>(
    null
  );
  // Fetch tasks from Supabase
  async function fetchTasks() {
    setLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      Alert.alert("Error getting user: " + userError);
      setLoading(false);
      return;
    }

    const userId = userData.user.id;

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .order("inserted_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks(data || []);
      filterTasks(data || [], selectedTab, searchText, sortType); // Apply filter on fetch
    }

    setLoading(false);
  }

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks(); // Initial fetch

    const subscription = supabase
      .channel("todos-changes") // Unique channel name
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        (payload) => {
          console.log("Change received!", payload);
          fetchTasks(); // Fetch updated tasks
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); // Cleanup on unmount
    };
  }, []);

  // Handle Search
  const handleSearch = (text: string) => {
    setSearchText(text);
    filterTasks(tasks, selectedTab, text, sortType);
  };

  // Function to filter tasks based on selected tab
  const filterTasks = (
    taskList: any[],
    tab: string,
    search: string,
    sort: string | null
  ) => {
    let updatedTasks = [...taskList];

    if (tab === "in_progress") {
      updatedTasks = updatedTasks.filter((task) => !task.is_complete);
    } else if (tab === "completed") {
      updatedTasks = updatedTasks.filter((task) => task.is_complete);
    }

    if (search.trim()) {
      updatedTasks = updatedTasks.filter((task) =>
        task.task?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === "priority") {
      const priorityOrder: Record<string, number> = {
        high: 1,
        medium: 2,
        low: 3,
      };
      updatedTasks.sort(
        (a, b) =>
          (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
      );
    } else if (sort === "due_date") {
      updatedTasks.sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
    }
    setSortVisible(false);
    setFilteredTasks(updatedTasks);
  };

  // Handle tab change
  const handleTabChange = (tab: "all" | "in_progress" | "completed") => {
    setSelectedTab(tab);
    filterTasks(tasks, tab, searchText, sortType);
  };

  const clearSearch = () => {
    setSearchText("");
    setFilteredTasks(tasks);
  };
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    item: any
  ) => {
    if (item.is_complete) return null; // Hide swipe action if already completed

    return (
      <TouchableOpacity
        onPress={() => handleCompleteTask(item.id)}
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#2ECC71", // Green for complete
          width: 100,
          marginStart: 5,
          marginTop: 5,
          marginBottom: 10,
          borderRadius: 5,
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <MaterialCommunityIcons name="check" size={30} color="white" />
        <Text
          style={{ color: "white", fontWeight: "bold", textAlign: "center" }}
        >
          Tap to complete
        </Text>
      </TouchableOpacity>
    );
  };
  const handleCompleteTask = async (taskId: number) => {
    setLoadingComplete(true);
    setSuccess(false);

    const { error } = await supabase
      .from("todos")
      .update({ is_complete: true })
      .eq("id", taskId);

    if (error) {
      console.error("Error updating task:", error);
      setLoading(false);
      return;
    }

    // Show success state
    setLoadingComplete(false);
    setSuccess(true);

    // Hide modal after 1.5 seconds
    setTimeout(() => {
      setSuccess(false);
    }, 1500);
  };
  const confirmDeleteTask = (taskId: number) => {
    setTaskToDelete(taskId);
    setDeleteModalVisible(true);
  };

  const openEditTask = (task: any) => {
    setSelectedTask(task);
    setEditVisible(true);
  };

  // Swipeable Actions
  // Swipeable Actions
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    item: any
  ) => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <IconButton
          icon="pencil"
          size={24}
          iconColor="white"
          style={{ backgroundColor: "#85C1E9", marginRight: 10 }}
          onPress={() => {
            openEditTask(item);
          }}
        />
        <IconButton
          icon="delete"
          size={24}
          iconColor="white"
          style={{ backgroundColor: "#E74C3C" }}
          onPress={() => confirmDeleteTask(item.id)}
        />
      </View>
    );
  };
  // Priority-based border colors
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#D98880"; // Soft Red
      case "medium":
        return "#F7DC6F"; // Soft Yellow
      case "low":
        return "#a7a7a7"; // Soft Green
      default:
        return "#D5D8DC"; // Soft Gray
    }
  };

  const DeleteTaskModal = () => {
    return (
      <Portal>
        <Dialog
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
        >
          <Dialog.Title>Delete Task</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this task?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDeleteModalVisible(false)}
              textColor="gray" // Gray text for cancel button
            >
              Cancel
            </Button>
            <Button
              onPress={() => {
                if (taskToDelete) handleDelete(taskToDelete);
                setDeleteModalVisible(false);
              }}
              textColor="white" // White text for delete button
              style={{
                backgroundColor: "#E74C3C",
                paddingLeft: 5,
                paddingRight: 5,
              }} // Red background for delete button
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };

  const handleDelete = async (taskId: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      return;
    }

    setTasks(tasks.filter((task) => task.id !== taskId));
    setFilteredTasks(filteredTasks.filter((task) => task.id !== taskId));
  };
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f8f8f8" }}>
      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          borderRadius: 8,
          paddingHorizontal: 10,
          marginBottom: 10,
        }}
      >
        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 8,
            flex: 1, // Takes remaining space
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={24} color="gray" />
          <TextInput
            placeholder="Search tasks..."
            value={searchText}
            onChangeText={handleSearch}
            style={{ flex: 1, paddingHorizontal: 10 }}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Sorting Filter */}
        <Menu
          visible={sortVisible}
          onDismiss={() => setSortVisible(false)}
          anchor={
            <IconButton
              icon="sort"
              size={24}
              onPress={() => setSortVisible(true)}
              style={{ marginLeft: 10 }}
            />
          }
        >
          <Menu.Item
            onPress={() =>
              filterTasks(tasks, selectedTab, searchText, "priority")
            }
            title="Sort by Priority"
          />
          <Menu.Item
            onPress={() =>
              filterTasks(tasks, selectedTab, searchText, "due_date")
            }
            title="Sort by Due Date"
          />

          <Menu.Item
            onPress={() => filterTasks(tasks, selectedTab, searchText, "clear")}
            title="Clear Sort"
            titleStyle={{ color: "gray" }} // Soft color for clear sort
          />
        </Menu>
      </View>

      {/* Tabs for Filtering */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        {["all", "in_progress", "completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() =>
              handleTabChange(tab as "all" | "in_progress" | "completed")
            }
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 8,
              backgroundColor: selectedTab === tab ? "#2C3E50" : "#ecf0f1",
              borderRadius: 20,
              marginHorizontal: 10,
            }}
          >
            <Text
              style={{
                fontWeight: selectedTab === tab ? "bold" : "normal",
                color: selectedTab === tab ? "white" : "black",
              }}
            >
              {tab === "all"
                ? "All"
                : tab === "in_progress"
                ? "In Progress"
                : "Completed"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      {loading ? (
        <ActivityIndicator
          animating={true}
          size="large"
          style={{ marginTop: 20 }}
        />
      ) : filteredTasks.length === 0 ? (
        <NoTasksFound />
      ) : (
        <FlatList
          style={{ marginTop: 10 }}
          data={filteredTasks}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedTask(item);
                setViewTaskModal(true); // Assuming you have a modal state
              }}
            >
              <Swipeable
                renderLeftActions={(progress) =>
                  renderLeftActions(progress, item)
                } // Enable swipe right
                renderRightActions={(progress) =>
                  renderRightActions(progress, item)
                } // Keep delete/edit swipe
              >
                <Card
                  style={{
                    marginBottom: 12,
                    borderLeftWidth: 3,
                    marginTop: 5,
                    marginStart: 5,
                    marginEnd: 5,
                    backgroundColor: "white",
                    borderLeftColor: getPriorityColor(item.priority),
                  }}
                  mode="elevated"
                >
                  <Card.Content>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text variant="titleMedium">{item.task}</Text>
                      <Chip
                        textStyle={{
                          fontWeight: "bold",
                          color: getPriorityColor(item.priority),
                        }}
                        style={{ backgroundColor: "transparent" }}
                      >
                        {item.priority.toUpperCase()}
                      </Chip>
                    </View>

                    {item.description && (
                      <Text
                        variant="bodyMedium"
                        style={{ marginTop: 4, color: "gray" }}
                      >
                        {item.description}
                      </Text>
                    )}

                    {/* Progress & Due Date */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 30,
                        marginStart: -10,
                        alignContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {item.is_complete ? (
                        <Chip
                          style={{
                            backgroundColor: "#2ECC71",
                            marginLeft: 10,
                            minWidth: 20, // Set a minimum width
                            paddingHorizontal: 0, // Reduce horizontal padding to make it smaller
                          }}
                          mode="flat"
                          icon={() => (
                            <MaterialCommunityIcons
                              name="progress-check"
                              size={18}
                              color="white"
                            />
                          )}
                          textStyle={{ fontSize: 12, color: "white" }} // Adjust the font size here
                        >
                          Completed
                        </Chip>
                      ) : (
                        <Chip
                          style={{
                            backgroundColor: "rgb(216, 195, 58)", // Semi blue background
                            marginLeft: 10,
                            minWidth: 20,
                            paddingHorizontal: 0,
                          }}
                          mode="flat"
                          icon={() => (
                            <MaterialCommunityIcons
                              name="progress-clock"
                              size={18}
                              color="white"
                            />
                          )}
                          textStyle={{ fontSize: 12, color: "white" }}
                        >
                          In Progress
                        </Chip>
                      )}
                      <View
                        style={{
                          backgroundColor: "rgba(240, 240, 240, 0.9)", // Dirty white with slight transparency
                          padding: 10,
                          borderRadius: 15, // Rounded corners
                          paddingLeft: 20,
                          paddingRight: 20,
                          alignSelf: "flex-start", // Aligns left like a received message
                        }}
                      >
                        <Text style={{ fontSize: 12 }}>
                          Due: {new Date(item.due_date).toDateString()}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </Swipeable>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Action Button (FAB) */}
      <FAB
        icon="plus"
        color="black"
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          backgroundColor: "white",
        }}
        onPress={() => navigation.navigate("AddTask")}
      />
      <Modal visible={isEditVisible} animationType="slide">
        <EditTaskScreen
          task={selectedTask}
          setLoading={setLoadingEdit}
          onClose={() => setEditVisible(false)}
          onUpdate={fetchTasks} // <-- Refresh FlatList
        />
      </Modal>
      {/* Loading Modal */}
      <Modal visible={loadingEdit} animationType="fade" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={{ marginTop: 10, fontSize: 16, color: "gray" }}>
              Please wait, updating task...
            </Text>
          </View>
        </View>
      </Modal>
      {/* Task Details Modal */}
      <Modal
        visible={viewTaskModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedTask(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "90%",
              backgroundColor: "white",
              borderRadius: 15,
              padding: 20,
              elevation: 5,
            }}
          >
            {/* Header with Back Button & Task Name */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <TouchableOpacity onPress={() => setViewTaskModal(false)}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {selectedTask?.task}
              </Text>
              <View style={{ width: 24 }} />
            </View>
            <View
              style={{
                marginBottom: 15,
                marginTop: 20,
                paddingEnd: 50,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f8f8f8", // Light background for contrast
                padding: 15,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "darkgray", // Soft gray border
                shadowColor: "#b0b0b0",
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
                elevation: 4, // Android shadow
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  marginEnd: 10,
                  color: "black",
                  marginBottom: 10,
                }}
              >
                Description:
              </Text>
              <View
                style={{
                  shadowColor: "#b0b0b0",
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 3,
                  elevation: 4, // Android shadow
                  backgroundColor: "rgba(240, 240, 240, 0.9)", // Dirty white with slight transparency
                  padding: 20,
                  borderRadius: 15, // Rounded corners
                  maxWidth: "80%", // Limit width like a chat bubble
                  width: "100%", // Takes full width of the screen
                  alignSelf: "flex-start", // Aligns left like a received message
                }}
              >
                <Text
                  ellipsizeMode="tail"
                  style={{
                    fontSize: 16,
                    color: "black",
                    marginBottom: 5,
                  }}
                >
                  {selectedTask?.description || "No description available."}
                </Text>
              </View>
            </View>
            {selectedTask?.checklist && (
              <View
                style={{
                  marginBottom: 15,
                  padding: 15,
                  backgroundColor: "#f8f8f8",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "darkgray",
                }}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}
                >
                  Checklist:
                </Text>
                <Checklist
                  selectedTask={selectedTask}
                  refreshTask={fetchTasks}
                />
              </View>
            )}
            <View
              style={{
                backgroundColor: "#f8f8f8", // Light background for contrast
                padding: 15,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "darkgray", // Soft gray border
                shadowColor: "#b0b0b0",
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
                elevation: 4, // Android shadow
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 15,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "black" }}>Ticket priority: </Text>
                <Chip
                  textStyle={{
                    fontWeight: "bold",
                    color: "white",
                  }}
                  style={{
                    backgroundColor: getPriorityColor(selectedTask?.priority),
                  }}
                >
                  {selectedTask?.priority?.toUpperCase()}
                </Chip>
              </View>

              <View
                style={{
                  marginBottom: 15,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: "black",
                  }}
                >
                  Due date:{" "}
                </Text>
                <Chip
                  textStyle={{
                    fontWeight: "bold",
                    color: "white",
                    fontSize: 13,
                  }}
                  style={{
                    //make the background semi yellow

                    backgroundColor: "#f1c40f",
                  }}
                >
                  {selectedTask?.due_date
                    ? new Date(selectedTask?.due_date).toDateString()
                    : "N/A"}
                </Chip>
              </View>
              <View
                style={{
                  marginBottom: 15,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "black" }}>Ticket status: </Text>
                <Chip
                  textStyle={{
                    fontWeight: "bold",
                    color: "white",
                  }}
                  style={{
                    backgroundColor: selectedTask?.is_complete
                      ? "#2ECC71"
                      : "rgb(61, 155, 205)",
                  }}
                >
                  {selectedTask?.is_complete ? "Completed" : "In Progress"}
                </Chip>
              </View>
            </View>
            {/* Close Button */}
            <Button
              mode="contained"
              onPress={() => setViewTaskModal(false)}
              style={{
                backgroundColor: "#2C3E50",
                borderRadius: 10,
                marginTop: 30,
              }}
            >
              Done Viewing
            </Button>
          </View>
        </View>
      </Modal>

      <Modal
        visible={loadingComplete || success}
        animationType="fade"
        transparent
      >
        <View
          style={{
            flex: 1, // Make it cover the whole screen
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
            justifyContent: "center", // Center vertically
            alignItems: "center", // Center horizontally
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              width: 250, // Fixed width
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5, // Add shadow for Android
            }}
          >
            {loadingComplete ? (
              <>
                <ActivityIndicator size="large" color="#2C3E50" />
                <Text
                  style={{ marginTop: 10, fontSize: 16, fontWeight: "bold" }}
                >
                  Completing Task...
                </Text>
              </>
            ) : success ? (
              <>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={50}
                  color="green"
                />
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "green",
                  }}
                >
                  Task Completed!
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <DeleteTaskModal />
    </View>
  );
}
