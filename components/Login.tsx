import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../lib/supabase";
import { TextInput, Button, Text, Icon } from "react-native-paper";
import { AuthStackParamList } from "../lib/navigationTypes";

type AuthScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Auth"
>;

export default function Auth() {
  const navigation = useNavigation<AuthScreenNavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      navigation.replace("Home");
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Large Branding Text */}

      <Text style={styles.brand}>TaskMo</Text>
      <Text style={styles.subtitle}>Welcome back, login to continue!</Text>
      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        activeOutlineColor="black"
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        left={<TextInput.Icon icon="email-outline" />} // 👈 Minimalist email icon
      />

      {/* Password Input */}
      <TextInput
        label="Password"
        mode="outlined"
        activeOutlineColor="black"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={secureText}
        autoCapitalize="none"
        style={styles.input}
        left={<TextInput.Icon icon="lock-outline" />} // 👈 Minimalist lock icon
        right={
          <TextInput.Icon
            icon={secureText ? "eye-outline" : "eye-off-outline"} // 👀 Minimalist eye icon
            onPress={() => setSecureText(!secureText)}
          />
        }
      />

      {/* Sign In Button */}
      <Button
        mode="contained"
        buttonColor="#0095F6"
        loading={loading}
        onPress={signInWithEmail}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Log In
      </Button>

      {/* Forgot Password & Sign Up */}
      <View style={styles.footerContainer}>
        <Text
          style={styles.signUp}
          onPress={() => navigation.navigate("RegisterUser")}
        >
          Don't have an account? <Text style={styles.bold}>Sign Up</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  brand: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#2C3E50",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "transparent",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#2C3E50",
    borderRadius: 5,
    paddingVertical: 5,
  },
  buttonLabel: {
    fontSize: 18,
  },
  footerContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  signUp: {
    color: "#2C3E50",
    fontSize: 14,
  },

  bold: {
    fontWeight: "bold",
    color: "#2C3E50",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
});
