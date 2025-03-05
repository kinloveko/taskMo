import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Avatar,
  Button,
  Card,
  TextInput,
  Title,
  ActivityIndicator,
} from "react-native-paper";
import { supabase } from "../../lib/supabase";
import { Session } from "@supabase/supabase-js";

export default function ProfileScreen({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      if (data) {
        setFullName(data.full_name);
        setUsername(data.username);
      }
    } catch (error: any) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      const updates = {
        id: session.user.id,
        full_name: fullName,
        username,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;

      Alert.alert("Profile updated successfully!");
    } catch (error: any) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }
  // Function for handling sign-out
  const handleSignout = async () => {
    try {
      // Attempt to sign out
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error; // If sign-out fails, throw an error to enter the catch block
      }
      console.log("Successfully signed out");
    } catch (error) {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user?.id) {
        Alert.alert("Error while signing out " + userError);
        setLoading(false);
        return;
      }
    }
  };
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.avatarContainer}>
            <Avatar.Icon
              style={{ backgroundColor: "gray" }}
              size={80}
              icon="account-circle"
              color="white"
            />
          </View>

          <Title style={styles.title}>Profile</Title>

          <TextInput
            label="Email"
            value={session.user.email}
            disabled
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            activeOutlineColor="black"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            activeOutlineColor="black"
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
          />

          {loading ? (
            <ActivityIndicator animating={true} size="small" />
          ) : (
            <Button
              mode="contained"
              onPress={updateProfile}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Update Profile
            </Button>
          )}

          <Button
            mode="outlined"
            onPress={async () => {
              handleSignout();
            }}
            style={styles.signOutButton}
            textColor="black"
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F7F9FC",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2C3E50",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#2C3E50",
  },
  buttonLabel: {
    fontSize: 16,
  },
  signOutButton: {
    marginTop: 10,
  },
});
