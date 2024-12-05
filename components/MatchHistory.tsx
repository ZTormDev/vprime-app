import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Colors } from "@/constants/Colors";
import { MatchHistoryData } from "@/app/API/valorant-api";

export const MatchHistory = ({ setShowMatchHistory }) => {
  // Convierte la marca de tiempo a una fecha legible
  const formatDate = (timestamp) => {
    const date = new Date(timestamp); // Convierte milisegundos a fecha
    return date.toLocaleString(); // Formato legible según configuración local
  };

  // Función para manejar el toque en un match
  const handleMatchPress = (match) => {
    console.log("Match pressed:", match);
    // Aquí puedes navegar a otra pantalla, mostrar más detalles, etc.
  };

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        zIndex: 10,
        position: "absolute",
        top: 0,
        left: 0,
        margin: 10,
        padding: 25,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: Colors.dark.background,
        borderWidth: 1,
        borderRadius: 2,
        borderColor: Colors.dark.cardPress,
      }}
    >
      <Text
        style={{
          color: Colors.dark.text,
          fontSize: 20,
          fontFamily: "Rubik500",
        }}
      >
        MATCHES
      </Text>
      <ScrollView>
        {MatchHistoryData.History.map((match, index) => (
          <TouchableOpacity
            key={index}
            style={{
              marginVertical: 10,
              padding: 10,
              backgroundColor: Colors.dark.card,
              borderRadius: 5,
            }}
            activeOpacity={0.7}
            onPress={() => handleMatchPress(match)}
          >
            <Text style={{ color: Colors.dark.text, fontSize: 16 }}>
              <Text style={{ fontWeight: "bold" }}>Match ID:</Text>{" "}
              {match.MatchID}
            </Text>
            <Text style={{ color: Colors.dark.text, fontSize: 16 }}>
              <Text style={{ fontWeight: "bold" }}>Queue:</Text> {match.QueueID}
            </Text>
            <Text style={{ color: Colors.dark.text, fontSize: 16 }}>
              <Text style={{ fontWeight: "bold" }}>Date:</Text>{" "}
              {formatDate(match.GameStartTime)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        onPress={() => setShowMatchHistory(false)}
        style={{
          backgroundColor: Colors.accent.red,
          marginTop: 10,
          padding: 10,
          borderRadius: 5,
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color: Colors.dark.text,
            fontSize: 20,
            fontFamily: "Rubik500",
            textAlign: "center",
          }}
        >
          Close
        </Text>
      </TouchableOpacity>
    </View>
  );
};
