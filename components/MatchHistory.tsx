import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
  TouchableHighlight,
} from "react-native";
import { Colors } from "@/constants/Colors";
import {
  eraseMathHistory,
  getMatchHistory,
  MatchHistoryData,
  PlayerMMR,
} from "@/app/API/valorant-api";
import { LinearGradient } from "expo-linear-gradient";
import ProgressBar from "./ProgressBar";

export const MatchHistory = ({ setShowMatchHistory }) => {
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar si está cargando
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Indicar que la carga comienza
      eraseMathHistory();
      await getMatchHistory(); // Espera a que se complete la obtención de datos
      setIsLoading(false); // Indicar que la carga ha terminado
    };
    fetchData();
  }, []);

  const formatDate = (timestamp: any) => {
    const date = new Date(timestamp);

    // Extraer componentes de fecha
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Meses van de 0 a 11
    const year = date.getFullYear();
    // Formatear salida
    return `${day}/${month}/${year}`;
  };

  const formatHour = (timestamp: any) => {
    const date = new Date(timestamp);
    // Extraer componentes de hora
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    // Formatear salida
    return `${hours}:${minutes}`;
  };

  // Función para manejar el toque en un match
  const handleMatchPress = (match: any) => {
    setDetailsVisible(true);
    console.log(JSON.stringify(match.Details.PlayerAgent, null, 1));
  };

  function hexToRgba(hex: any) {
    // Asegurarse de que el hex tenga la longitud correcta
    if (hex.length === 8) {
      const r = parseInt(hex.substring(0, 2), 16) + 50; // Rojo
      const g = parseInt(hex.substring(2, 4), 16) + 50; // Verde
      const b = parseInt(hex.substring(4, 6), 16) + 50; // Azul
      const a = parseInt(hex.substring(6, 8), 16) / 255; // Alfa (convertido a 0-1)
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    throw new Error("Hexadecimal inválido. Debe tener 8 caracteres.");
  }

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
        padding: 10,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.dark.background,
        borderWidth: 1,
        borderRadius: 1,
        borderColor: Colors.dark.cardPress,
      }}
    >
      <View
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Text
          style={{
            color: Colors.dark.text,
            fontSize: 22,
            fontFamily: "Rubik700",
          }}
        >
          CAREER
        </Text>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
            width: "100%",
          }}
        >
          <View
            style={{
              aspectRatio: 1 / 1,
              width: 70,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              style={{ width: "100%", height: "100%" }}
              source={{ uri: PlayerMMR.Rank.largeIcon }}
            ></Image>
          </View>
          <Text
            style={{
              color: hexToRgba(PlayerMMR.Rank.color),
              fontSize: 20,
              fontFamily: "Rubik600",
            }}
          >
            {PlayerMMR.Rank.tierName}
          </Text>
          <ProgressBar value={10} maxValue={100} />
        </View>
      </View>
      {isLoading ? (
        // Mostrar un indicador de carga mientras se obtienen los datos
        <ActivityIndicator size="large" color={Colors.accent.color} />
      ) : (
        MatchHistoryData &&
        MatchHistoryData.Matches && (
          <ScrollView
            contentContainerStyle={{ marginHorizontal: 6 }}
            persistentScrollbar={true}
          >
            {MatchHistoryData.Matches.map(
              (match: any, index: any) =>
                match.Details && (
                  <TouchableHighlight
                    key={index}
                    style={{
                      marginVertical: 8,
                      borderRadius: 2,
                      borderWidth: 1,
                      borderColor: Colors.dark.cardPress,
                      width: "100%",
                      height: 72,
                      overflow: "hidden",
                    }}
                    underlayColor={
                      match.Details.result === "Draw"
                        ? Colors.dark.cardPress
                        : match.Details.result === "Victory"
                        ? Colors.text.active
                        : Colors.accent.red
                    }
                    activeOpacity={0.25}
                    onPress={() => handleMatchPress(match)}
                  >
                    <View style={{ width: "100%" }}>
                      <View
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          opacity: 0.65,
                          zIndex: 10,
                          right: 0,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Image
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          source={{
                            uri: match.Details.MapDetails.listViewIcon,
                          }}
                        ></Image>
                      </View>
                      <View
                        style={{
                          zIndex: 11,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <LinearGradient
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          colors={[
                            match.Details.result === "Draw"
                              ? "grey"
                              : match.Details.result === "Victory"
                              ? Colors.text.dark
                              : Colors.accent.darkRed2,
                            "rgba(0,0,0,0.15)",
                          ]}
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                          }}
                        />

                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          <View
                            style={{
                              height: "100%",
                              aspectRatio: 1 / 1,
                            }}
                          >
                            {match.Details.PlayerAgent && (
                              <Image
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  marginLeft: -5,
                                }}
                                source={{
                                  uri: match.Details.PlayerAgent
                                    .displayIconSmall,
                                }}
                              ></Image>
                            )}
                          </View>
                          <View
                            style={{
                              height: "100%",
                              justifyContent: "center",
                              alignItems: "center",
                              marginLeft: -15,
                            }}
                          >
                            <Image
                              style={{ aspectRatio: 1 / 1, width: 40 }}
                              source={{
                                uri: match.Details.Player.Rank.largeIcon,
                              }}
                            ></Image>
                            <Text
                              style={{
                                justifyContent: "center",
                                alignItems: "center",
                                color:
                                  match.Details.result === "Draw"
                                    ? Colors.text.active
                                    : match.Details.result === "Victory"
                                    ? Colors.text.active
                                    : Colors.accent.red,
                                fontSize: 12,
                                fontFamily: "Rubik500",
                                textTransform: "uppercase",
                                margin: 0,
                                padding: 0,
                              }}
                            >
                              {match.Details.result === "Draw"
                                ? "+" + match.RankedRatingEarned
                                : match.Details.result === "Victory"
                                ? "+" + match.RankedRatingEarned
                                : match.RankedRatingEarned}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: Colors.dark.text,
                                fontSize: 18,
                                fontFamily: "Rubik500",
                                textTransform: "uppercase",
                                margin: 0,
                                padding: 0,
                                marginBlock: -5,
                              }}
                            >
                              {match.Details.result}
                            </Text>
                            <Text
                              style={{
                                color: Colors.dark.text,
                                fontSize: 18,
                                fontFamily: "Rubik500",
                                textTransform: "uppercase",
                                margin: 0,
                                padding: 0,
                                marginBlock: -5,
                              }}
                            >
                              {match.Details.PlayerTeamRoundsWon} {"- "}
                              {match.Details.EnemyTeamRoundsWon}
                            </Text>
                          </View>
                          <View
                            style={{
                              justifyContent: "flex-start",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              paddingInline: 5,
                            }}
                          >
                            <Text
                              style={{
                                color: Colors.text.active,
                                fontSize: 14,
                                fontFamily: "Rubik400",
                                textShadowColor: "rgba(0,0,0,0.5)",
                                textShadowRadius: 10,
                              }}
                            >
                              {formatDate(match.MatchStartTime)}
                            </Text>
                            <Text
                              style={{
                                color: Colors.dark.text,
                                fontSize: 14,
                                fontFamily: "Rubik400",
                                textShadowColor: "rgba(0,0,0,0.5)",
                                textShadowRadius: 10,
                              }}
                            >
                              {formatHour(match.MatchStartTime)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableHighlight>
                )
            )}
          </ScrollView>
        )
      )}
      <TouchableOpacity
        onPress={() => setShowMatchHistory(false)}
        style={{
          backgroundColor: Colors.accent.red,
          marginTop: 10,
          padding: 8,
          width: "100%",
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
      <Modal animationType="fade" transparent={true} visible={detailsVisible}>
        <View
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: 30,
          }}
        >
          <View
            style={{
              width: "100%",
              height: "75%",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: Colors.dark.background,
              borderWidth: 1,
              borderRadius: 2,
              borderColor: Colors.dark.cardPress,
              padding: 20,
            }}
          >
            <Text
              style={{
                color: Colors.dark.text,
                fontFamily: "Rubik500",
                fontSize: 24,
              }}
            >
              Details
            </Text>
            <Pressable
              style={{
                backgroundColor: Colors.accent.red,
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                padding: 6,
                borderRadius: 2,
                borderWidth: 1,
                borderColor: Colors.dark.cardPress,
              }}
              onPress={() => setDetailsVisible(!detailsVisible)}
            >
              <Text
                style={{
                  color: Colors.dark.text,
                  fontFamily: "Rubik500",
                  fontSize: 20,
                }}
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};
