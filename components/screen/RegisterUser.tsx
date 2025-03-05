import React, { useState } from "react";
import { Alert, StyleSheet, View, ScrollView } from "react-native";
import { supabase } from "../../lib/supabase";
import { TextInput, Button, Text, Title, IconButton } from "react-native-paper";
import { RegisterUserScreenProps } from "../../lib/navigationTypes";

export default function RegisterUser({ navigation }: RegisterUserScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [confirmSecureText, setConfirmSecureText] = useState(true);

  function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function signUpWithEmail() {
    if (!email.trim()) {
      Alert.alert("Error", "Email cannot be empty.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Password cannot be empty.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success!", "Welcome to the app. ");
      navigation.navigate("Auth"); // Navigate to login screen after signup
    }

    setLoading(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        {/* Back Button */}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{ alignSelf: "flex-start" }}
            onPress={() => navigation.navigate("Auth")}
          >
            <IconButton icon="arrow-left" size={24} style={styles.backButton} />
          </Text>

          <Title style={styles.title}>Create an Account</Title>

          <View style={{ width: 40 }} />
        </View>
        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          error={!validateEmail(email) && email.length > 0}
        />

        <TextInput
          label="Password"
          mode="outlined"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureText}
          autoCapitalize="none"
          style={styles.input}
          error={password.length > 0 && password.length < 6}
          right={
            <TextInput.Icon
              icon={secureText ? "eye-off" : "eye"}
              onPress={() => setSecureText(!secureText)}
            />
          }
        />

        <TextInput
          label="Confirm Password"
          mode="outlined"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={confirmSecureText}
          autoCapitalize="none"
          style={styles.input}
          error={confirmPassword.length > 0 && confirmPassword !== password}
          right={
            <TextInput.Icon
              icon={confirmSecureText ? "eye-off" : "eye"}
              onPress={() => setConfirmSecureText(!confirmSecureText)}
            />
          }
        />

        <Button
          mode="contained"
          loading={loading}
          onPress={signUpWithEmail}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Sign Up
        </Button>

        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text style={styles.link} onPress={() => navigation.navigate("Auth")}>
            Log in
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F7F9FC",
  },
  form: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 3, // Adds shadow on Android
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
  footerText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
  link: {
    color: "#2C3E50",
    fontWeight: "bold",
  },
});
