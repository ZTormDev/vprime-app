import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableHighlight, ScrollView } from "react-native";
import { Colors } from "@/constants/Colors";
import * as Updates from "expo-updates";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      console.error("Failed to reload app via Updates:", e);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.dark.background,
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
          }}
        >
          <Text
            style={{
              fontFamily: "Rubik700",
              color: Colors.accent.color,
              fontSize: 32,
              textAlign: "center",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Something went wrong
          </Text>
          
          <Text
            style={{
              fontFamily: "Rubik400",
              color: Colors.dark.text,
              fontSize: 16,
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            The application encountered an unexpected error. You can try restarting it.
          </Text>

          <TouchableHighlight
            onPress={this.handleReload}
            activeOpacity={0.7}
            underlayColor={Colors.accent.darkRed}
            style={{
              backgroundColor: Colors.accent.color,
              paddingVertical: 14,
              paddingHorizontal: 40,
              borderRadius: 2,
              marginBottom: 30,
            }}
          >
            <Text
              style={{
                fontFamily: "Rubik500",
                color: "black",
                fontSize: 16,
                textTransform: "uppercase",
              }}
            >
              Restart App
            </Text>
          </TouchableHighlight>

          {__DEV__ && this.state.error && (
            <ScrollView
              style={{
                width: "100%",
                maxHeight: 200,
                backgroundColor: "rgba(255, 0, 0, 0.05)",
                borderColor: Colors.dark.cardPress,
                borderWidth: 1,
                borderRadius: 4,
                padding: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: "monospace",
                  color: "#ff6b6b",
                  fontSize: 12,
                }}
              >
                {this.state.error.toString()}
                {"\n\n"}
                {this.state.errorInfo?.componentStack}
              </Text>
            </ScrollView>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}
