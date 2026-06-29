import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/src/hooks/useTheme";
import {
  eraseMathHistory,
  getMatchHistory,
} from "@/API/valorant-api";
import { useShopStore } from "@/src/store/useShopStore";
import { LinearGradient } from "expo-linear-gradient";
import ProgressBar from "./ProgressBar";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { AnimatedEntrance, AnimatedPressable } from "@/src/components/common/Motion";

type MatchHistoryProps = {
  setShowMatchHistory: (show: boolean) => void;
};

export const MatchHistory = ({ setShowMatchHistory }: MatchHistoryProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const playerMMR = useShopStore((state) => state.playerMMR);
  const matchHistory = useShopStore((state) => state.matchHistory);

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

  const resultTone = (result: string) => {
    if (result === "Victory") return accent.gold;
    if (result === "Draw") return colors.muted;
    return accent.red;
  };

  return (
    <View style={styles.overlay}>
      <AnimatedEntrance style={styles.sheet} distance={18} duration={240}>
        <View style={styles.grabber} />

        {/* Header Block */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PERFORMANCE TERMINAL</Text>
            <Text style={styles.title}>Match Logs</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowMatchHistory(false)}
            style={styles.iconButton}
            activeOpacity={0.76}
          >
            <TabBarIcon name="close" color={colors.text} size={20} />
          </TouchableOpacity>
        </View>

        {/* Competitive Status Card */}
        <View style={styles.rankCard}>
          {playerMMR?.Rank?.largeIcon && (
            <Image
              style={styles.rankIcon}
              source={{ uri: playerMMR.Rank.largeIcon }}
            />
          )}
          <View style={styles.rankTextBlock}>
            <Text style={[styles.rankName, { color: resultTone("Victory") }]} numberOfLines={1}>
              {playerMMR?.Rank?.tierName || "Unrated"}
            </Text>
            <ProgressBar
              value={playerMMR?.LatestCompetitiveUpdate?.RankedRatingBeforeUpdate || 0}
              maxValue={100}
              isRankBar={true}
            />
          </View>
        </View>

        {/* Matches List */}
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={accent.gold} />
            <Text style={styles.loadingText}>Fetching competitive updates...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.matchList}
            showsVerticalScrollIndicator={true}
            indicatorStyle={theme === "dark" ? "white" : "black"}
          >
            {matchHistory?.Matches?.map(
              (match: any, index: any) =>
                match.Details && (
                  <AnimatedEntrance key={match.MatchID || index} delay={(index % 5) * 35} distance={10} duration={220}>
                  <AnimatedPressable
                    style={[
                      styles.matchCard,
                      { borderColor: resultTone(match.Details.result) + "38" }
                    ]}
                    contentStyle={styles.matchPressableContent}
                    onPress={() => handleMatchPress(match)}
                  >
                    <Image
                      style={styles.mapImage}
                      source={{ uri: match.Details.MapDetails.listViewIcon }}
                    />
                    <LinearGradient
                      colors={[
                        "rgba(9,10,12,0.18)",
                        "rgba(9,10,12,0.9)"
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.mapFade}
                    />

                    {/* Victory Indicator Stripe */}
                    <View
                      style={[
                        styles.indicatorStripe,
                        { backgroundColor: resultTone(match.Details.result) }
                      ]}
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
                            {match.Details.result === "Victory" ? "WIN" : "LOSS"}
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
                  </AnimatedPressable>
                  </AnimatedEntrance>
                )
            )}
          </ScrollView>
        )}
      </AnimatedEntrance>

      {/* Detail Overlay */}
      <Modal animationType="fade" transparent={true} visible={detailsVisible}>
        <View style={styles.detailOverlay}>
          <AnimatedEntrance style={styles.detailSheet} distance={12} duration={220}>
            {selectedMatch?.Details && (
              <>
                <View style={styles.detailHeader}>
                  <View style={styles.detailIdentity}>
                    {selectedMatch.Details.PlayerAgent?.displayIconSmall && (
                      <Image
                        source={{ uri: selectedMatch.Details.PlayerAgent.displayIconSmall }}
                        style={styles.detailAgentIcon}
                      />
                    )}
                    <View style={styles.detailTitleBlock}>
                      <Text style={styles.detailEyebrow}>MATCH LOG</Text>
                      <Text style={styles.detailTitle} numberOfLines={1}>
                        {selectedMatch.Details.MapDetails?.displayName || "Competitive Match"}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.detailResultPill,
                      { borderColor: resultTone(selectedMatch.Details.result) + "66" },
                    ]}
                  >
                    <Text style={[styles.detailResultText, { color: resultTone(selectedMatch.Details.result) }]}>
                      {selectedMatch.Details.result}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailScorePanel}>
                  <Text style={styles.detailScore}>
                    {selectedMatch.Details.PlayerTeamRoundsWon}
                    <Text style={styles.detailScoreDivider}> - </Text>
                    {selectedMatch.Details.EnemyTeamRoundsWon}
                  </Text>
                  <Text style={styles.detailSubtle}>
                    {formatDate(selectedMatch.MatchStartTime)} at {formatHour(selectedMatch.MatchStartTime)}
                  </Text>
                </View>

                <View style={styles.detailStats}>
                  <View style={styles.detailStatCard}>
                    <Text style={styles.detailLabel}>KILLS</Text>
                    <Text style={styles.detailValue}>{selectedMatch.Details.Player.stats.kills}</Text>
                  </View>
                  <View style={styles.detailStatCard}>
                    <Text style={styles.detailLabel}>DEATHS</Text>
                    <Text style={styles.detailValue}>{selectedMatch.Details.Player.stats.deaths}</Text>
                  </View>
                  <View style={styles.detailStatCard}>
                    <Text style={styles.detailLabel}>ASSISTS</Text>
                    <Text style={styles.detailValue}>{selectedMatch.Details.Player.stats.assists}</Text>
                  </View>
                  <View style={styles.detailStatCard}>
                    <Text style={styles.detailLabel}>SCORE</Text>
                    <Text style={styles.detailValue}>{selectedMatch.Details.Player.stats.score}</Text>
                  </View>
                </View>
              </>
            )}
            <AnimatedPressable
              style={styles.detailButton}
              onPress={() => setDetailsVisible(!detailsVisible)}
            >
              <Text style={styles.detailButtonText}>Dismiss Log</Text>
            </AnimatedPressable>
          </AnimatedEntrance>
        </View>
      </Modal>
    </View>
  );
};

function createStyles(colors: any, accent: any, theme: string) {
  return StyleSheet.create({
    overlay: {
      zIndex: 10,
      position: "absolute",
      top: Platform.OS === "ios" ? 112 : 94,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    sheet: {
      height: "100%",
      backgroundColor: theme === "dark" ? "rgba(16,17,20,0.96)" : "rgba(248,250,252,0.96)",
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      padding: 16,
      paddingTop: 20,
      gap: 16,
      overflow: "hidden",
    },
    grabber: {
      position: "absolute",
      top: 8,
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 4,
      backgroundColor: theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    eyebrow: {
      color: accent.gold,
      fontSize: 11,
      fontFamily: "Rubik700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontFamily: "Rubik800",
    },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surfaceStrong,
    },
    rankCard: {
      borderRadius: 16,
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
      width: 58,
      height: 58,
      resizeMode: "contain",
    },
    rankTextBlock: {
      flex: 1,
      gap: 4,
    },
    rankName: {
      fontSize: 18,
      fontFamily: "Rubik800",
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
      fontSize: 14,
    },
    matchList: {
      gap: 14,
      paddingBottom: Platform.OS === "ios" ? 40 : 20,
    },
    matchCard: {
      minHeight: 88,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      backgroundColor: colors.glass,
      flexDirection: "row",
    },
    matchPressableContent: {
      flex: 1,
      alignItems: "stretch",
      justifyContent: "flex-start",
      flexDirection: "row",
    },
    mapImage: {
      position: "absolute",
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      opacity: 0.28,
    },
    mapFade: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    indicatorStripe: {
      width: 5,
      height: "100%",
    },
    matchContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      gap: 10,
    },
    agentIcon: {
      width: 54,
      height: 54,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "rgba(0,0,0,0.14)",
    },
    matchMain: {
      flex: 1,
      gap: 4,
    },
    resultRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    resultText: {
      fontSize: 16,
      fontFamily: "Rubik800",
    },
    scoreText: {
      color: colors.text,
      fontSize: 14,
      fontFamily: "Rubik700",
    },
    kdaText: {
      color: colors.muted,
      fontSize: 12,
      fontFamily: "Rubik600",
    },
    matchRight: {
      alignItems: "flex-end",
      gap: 1,
    },
    rrText: {
      fontFamily: "Rubik800",
      fontSize: 15,
    },
    dateText: {
      color: colors.muted,
      fontSize: 10,
      fontFamily: "Rubik500",
    },
    detailOverlay: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.58)",
      padding: 18,
    },
    detailSheet: {
      width: "100%",
      backgroundColor: theme === "dark" ? "rgba(16,17,20,0.94)" : "rgba(248,250,252,0.94)",
      borderWidth: 1,
      borderRadius: 18,
      borderColor: colors.glassBorder,
      padding: 18,
      gap: 14,
      overflow: "hidden",
    },
    detailHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    detailIdentity: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    detailAgentIcon: {
      width: 48,
      height: 48,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "rgba(0,0,0,0.14)",
    },
    detailTitleBlock: {
      flex: 1,
    },
    detailEyebrow: {
      color: accent.gold,
      fontFamily: "Rubik700",
      fontSize: 10,
      letterSpacing: 0.5,
    },
    detailTitle: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 20,
    },
    detailResultPill: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: colors.surface,
    },
    detailResultText: {
      fontFamily: "Rubik800",
      fontSize: 12,
    },
    detailScorePanel: {
      minHeight: 86,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
    },
    detailScore: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 34,
    },
    detailScoreDivider: {
      color: colors.muted,
    },
    detailSubtle: {
      color: colors.muted,
      fontFamily: "Rubik600",
      fontSize: 12,
    },
    detailStats: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    detailStatCard: {
      width: "47%",
      minHeight: 62,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      gap: 3,
    },
    detailLabel: {
      color: colors.muted,
      fontFamily: "Rubik700",
      fontSize: 11,
      letterSpacing: 0.5,
    },
    detailValue: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 15,
    },
    detailButton: {
      backgroundColor: colors.text,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      height: 44,
      borderRadius: 12,
    },
    detailButtonText: {
      color: colors.background,
      fontFamily: "Rubik800",
      fontSize: 14,
    },
  });
}
