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
  StyleSheet,
} from "react-native";
import { useTheme } from "@/src/hooks/useTheme";
import {
  eraseMathHistory,
  getMatchHistory,
  MatchHistoryData,
  PlayerMMR,
} from "@/API/valorant-api";
import { LinearGradient } from "expo-linear-gradient";
import { AppBlurView } from "@/src/components/common/AppBlurView";
import ProgressBar from "./ProgressBar";
import { TabBarIcon } from "./navigation/TabBarIcon";

type MatchHistoryProps = {
  setShowMatchHistory: (show: boolean) => void;
};

export const MatchHistory = ({ setShowMatchHistory }: MatchHistoryProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  const { colors, theme, accent } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, accent, theme), [colors, accent, theme]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      eraseMathHistory();
      await getMatchHistory();
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const formatDate = (timestamp: any) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatHour = (timestamp: any) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleMatchPress = (match: any) => {
    setSelectedMatch(match);
    setDetailsVisible(true);
  };

  function hexToRgba(hex: any) {
    if (typeof hex === "string" && hex.length === 8) {
      const r = Math.min(parseInt(hex.substring(0, 2), 16) + 35, 255);
      const g = Math.min(parseInt(hex.substring(2, 4), 16) + 35, 255);
      const b = Math.min(parseInt(hex.substring(4, 6), 16) + 35, 255);
      const a = parseInt(hex.substring(6, 8), 16) / 255;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return accent.blue;
  }

  const resultTone = (result: string) => {
    if (result === "Victory") return accent.green;
    if (result === "Draw") return colors.muted;
    return accent.red;
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <AppBlurView
          tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
          intensity={72}
          style={styles.blurLayer}
        />
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Competitive</Text>
            <Text style={styles.title}>Career</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowMatchHistory(false)}
            style={styles.iconButton}
            activeOpacity={0.72}
          >
            <TabBarIcon name="close" color={colors.text} size={22} />
          </TouchableOpacity>
        </View>

        <View style={styles.rankCard}>
          <AppBlurView
            tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
            intensity={38}
            style={styles.blurLayer}
          />
          {PlayerMMR?.Rank?.largeIcon && (
            <Image
              style={styles.rankIcon}
              source={{ uri: PlayerMMR.Rank.largeIcon }}
            />
          )}
          <View style={styles.rankTextBlock}>
            <Text
              style={[
                styles.rankName,
                { color: hexToRgba(PlayerMMR?.Rank?.color) },
              ]}
              numberOfLines={1}
            >
              {PlayerMMR?.Rank?.tierName || "Unrated"}
              {PlayerMMR?.Rank?.tier >= 24 ? " #635" : ""}
            </Text>
            {PlayerMMR?.Rank?.tier >= 24 ? (
              <Text style={styles.rankSubtext}>295 Rank Rating</Text>
            ) : (
              <ProgressBar
                value={
                  PlayerMMR?.LatestCompetitiveUpdate?.RankedRatingBeforeUpdate || 0
                }
                maxValue={100}
                isRankBar={true}
              />
            )}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={accent.blue} />
            <Text style={styles.loadingText}>Loading matches</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.matchList}
            showsVerticalScrollIndicator={true}
            indicatorStyle={theme === "dark" ? "white" : "black"}
          >
            {MatchHistoryData?.Matches?.map(
              (match: any, index: any) =>
                match.Details && (
                  <TouchableOpacity
                    key={index}
                    style={styles.matchCard}
                    activeOpacity={0.76}
                    onPress={() => handleMatchPress(match)}
                  >
                    <AppBlurView
                      tint={theme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
                      intensity={28}
                      style={styles.blurLayer}
                    />
                    <Image
                      style={styles.mapImage}
                      source={{ uri: match.Details.MapDetails.listViewIcon }}
                    />
                    <LinearGradient
                      colors={[
                        theme === "dark" ? "rgba(16,17,20,0.25)" : "rgba(248,250,252,0.25)",
                        theme === "dark" ? "rgba(16,17,20,0.92)" : "rgba(248,250,252,0.92)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.mapFade}
                    />

                    <View style={styles.matchContent}>
                      {match.Details.PlayerAgent && (
                        <Image
                          style={styles.agentIcon}
                          source={{
                            uri: match.Details.PlayerAgent.displayIconSmall,
                          }}
                        />
                      )}
                      <View style={styles.matchMain}>
                        <View style={styles.resultRow}>
                          <Text
                            style={[
                              styles.resultText,
                              { color: resultTone(match.Details.result) },
                            ]}
                          >
                            {match.Details.result}
                          </Text>
                          <Text style={styles.scoreText}>
                            {match.Details.PlayerTeamRoundsWon} -{" "}
                            {match.Details.EnemyTeamRoundsWon}
                          </Text>
                        </View>
                        <Text style={styles.kdaText}>
                          KDA {match.Details.Player.stats.kills}/
                          {match.Details.Player.stats.assists}/
                          {match.Details.Player.stats.deaths}
                        </Text>
                      </View>

                      <View style={styles.matchRight}>
                        <Text
                          style={[
                            styles.rrText,
                            { color: resultTone(match.Details.result) },
                          ]}
                        >
                          {match.Details.result === "Defeat"
                            ? match.RankedRatingEarned
                            : `+${match.RankedRatingEarned}`}
                        </Text>
                        <Text style={styles.dateText}>
                          {formatDate(match.MatchStartTime)}
                        </Text>
                        <Text style={styles.dateText}>
                          {formatHour(match.MatchStartTime)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
            )}
          </ScrollView>
        )}
      </View>

      <Modal animationType="fade" transparent={true} visible={detailsVisible}>
        <View style={styles.detailOverlay}>
          <View style={styles.detailSheet}>
            <Text style={styles.detailTitle}>Match Details</Text>
            {selectedMatch?.Details && (
              <View style={styles.detailStats}>
                <Text style={styles.detailText}>
                  Result: {selectedMatch.Details.result}
                </Text>
                <Text style={styles.detailText}>
                  Score: {selectedMatch.Details.PlayerTeamRoundsWon} -{" "}
                  {selectedMatch.Details.EnemyTeamRoundsWon}
                </Text>
                <Text style={styles.detailText}>
                  Combat Score: {selectedMatch.Details.Player.stats.score}
                </Text>
              </View>
            )}
            <Pressable
              style={styles.detailButton}
              onPress={() => setDetailsVisible(!detailsVisible)}
            >
              <Text style={styles.detailButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

function createStyles(colors: any, accent: any, theme: string) {
  return StyleSheet.create({
    overlay: {
      width: "100%",
      height: "100%",
      zIndex: 10,
      position: "absolute",
      top: 0,
      left: 0,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "flex-end",
    },
    sheet: {
      height: "92%",
      backgroundColor: theme === "dark" ? "rgba(16,17,20,0.96)" : "rgba(248,250,252,0.96)",
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      padding: 16,
      gap: 14,
      overflow: "hidden",
    },
    blurLayer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    eyebrow: {
      color: accent.blue,
      fontSize: 12,
      fontFamily: "Rubik700",
      textTransform: "uppercase",
    },
    title: {
      color: colors.text,
      fontSize: 30,
      fontFamily: "Rubik800",
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surfaceStrong,
    },
    rankCard: {
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glass,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    rankIcon: {
      width: 70,
      height: 70,
      resizeMode: "contain",
    },
    rankTextBlock: {
      flex: 1,
      gap: 6,
    },
    rankName: {
      fontSize: 21,
      fontFamily: "Rubik800",
    },
    rankSubtext: {
      fontFamily: "Rubik600",
      fontSize: 14,
      color: colors.muted,
    },
    loadingWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    loadingText: {
      color: colors.muted,
      fontFamily: "Rubik600",
      fontSize: 15,
    },
    matchList: {
      gap: 12,
      paddingBottom: 18,
    },
    matchCard: {
      minHeight: 96,
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glass,
    },
    mapImage: {
      position: "absolute",
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      opacity: 0.62,
    },
    mapFade: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    matchContent: {
      minHeight: 96,
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      gap: 10,
    },
    agentIcon: {
      width: 76,
      height: 76,
      resizeMode: "contain",
    },
    matchMain: {
      flex: 1,
      gap: 4,
    },
    resultRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    resultText: {
      fontSize: 19,
      fontFamily: "Rubik800",
      textTransform: "uppercase",
    },
    scoreText: {
      color: colors.text,
      fontSize: 18,
      fontFamily: "Rubik700",
    },
    kdaText: {
      color: colors.muted,
      fontSize: 13,
      fontFamily: "Rubik600",
    },
    matchRight: {
      alignItems: "flex-end",
      gap: 2,
    },
    rrText: {
      fontFamily: "Rubik800",
      fontSize: 16,
    },
    dateText: {
      color: colors.muted,
      fontSize: 11,
      fontFamily: "Rubik500",
    },
    detailOverlay: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.58)",
      padding: 24,
    },
    detailSheet: {
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: colors.border,
      padding: 18,
      gap: 18,
    },
    detailTitle: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 24,
    },
    detailStats: {
      width: "100%",
      gap: 8,
    },
    detailText: {
      color: colors.muted,
      fontFamily: "Rubik600",
      fontSize: 15,
    },
    detailButton: {
      backgroundColor: colors.text,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      minHeight: 46,
      borderRadius: 8,
    },
    detailButtonText: {
      color: colors.background,
      fontFamily: "Rubik800",
      fontSize: 16,
    },
  });
}
