import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "expo-router";
import {
  Agents,
  EntitlementsToken,
  Maps,
  RankTiers,
  ValorantApiService,
} from "@/API/valorant-api";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useTheme } from "@/src/hooks/useTheme";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useShopStore } from "@/src/store/useShopStore";
import { AnimatedEntrance, AnimatedPressable } from "@/src/components/common/Motion";
import { SegmentHeader } from "@/src/components/common/SegmentHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showAutopickNotification, dismissAutopickNotification } from "@/API/notifications-api";
import { registerBackgroundAutopickTask, unregisterBackgroundAutopickTask } from "@/src/utils/autopickTask";

type LivePhase = "checking" | "pregame" | "live" | "offline" | "error";

type LivePlayer = {
  subject: string;
  displayName: string;
  tagLine: string;
  teamId: string;
  agentName: string;
  agentIcon?: string;
  rankName: string;
  rankIcon?: string;
  accountLevel: string;
  rating: string;
  state: string;
  isSelf: boolean;
  peakRankName?: string;
};

const GLZ_REGIONS = ["na", "latam", "br", "eu", "ap", "kr"];

function getSubject(player: any) {
  return player?.Subject || player?.subject || player?.PlayerIdentity?.Subject || "";
}

function getTeamId(player: any) {
  return player?.TeamID || player?.teamId || player?.TeamId || player?.Team || "Unknown";
}

function getCharacterId(player: any) {
  return player?.CharacterID || player?.characterId || player?.CharacterId || "";
}

function getMatchId(payload: any) {
  return payload?.MatchID || payload?.MatchId || payload?.matchId || "";
}

function getRankTier(player: any, mmr: any) {
  const tier = (
    player?.CompetitiveTier ||
    player?.competitiveTier ||
    player?.PlayerIdentity?.CompetitiveTier ||
    player?.SeasonalBadgeInfo?.Rank ||
    player?.SeasonalBadgeInfo?.SeasonalBadgeRank ||
    mmr?.LatestCompetitiveUpdate?.TierAfterUpdate ||
    mmr?.LatestCompetitiveUpdate?.TierBeforeUpdate ||
    0
  );

  return Number(tier) || 0;
}

function getLatestSeasonInfo(mmr: any) {
  const seasons = mmr?.QueueSkills?.competitive?.SeasonalInfoBySeasonID;
  if (!seasons) return null;
  const values = Object.values(seasons);
  return values.length > 0 ? values[values.length - 1] : null;
}

function getAccountLevel(player: any) {
  const value =
    player?.PlayerIdentity?.AccountLevel ||
    player?.AccountLevel ||
    player?.accountLevel;

  return value === undefined || value === null ? "--" : String(value);
}

function getRankRating(mmr: any) {
  const latestSeason = getLatestSeasonInfo(mmr) as any;
  const value =
    latestSeason?.RankedRating ||
    latestSeason?.RankedRatingBeforeUpdate ||
    mmr?.LatestCompetitiveUpdate?.RankedRatingAfterUpdate ||
    mmr?.LatestCompetitiveUpdate?.RankedRatingBeforeUpdate;

  if (value !== undefined && value !== null) {
    return String(value);
  }

  return "--";
}

function getSelectionState(player: any, phase: LivePhase) {
  const rawState =
    player?.CharacterSelectionState ||
    player?.characterSelectionState ||
    player?.SelectionState ||
    "";

  if (rawState) {
    return String(rawState).replace(/_/g, " ").toUpperCase();
  }

  if (phase === "live") {
    return "IN GAME";
  }

  return getCharacterId(player) ? "SELECTED" : "PENDING";
}

function getLatestTierList(rankTiers: any[]) {
  return rankTiers?.[rankTiers.length - 1]?.tiers || [];
}

function findRank(rankTiers: any[], tier: number) {
  const sourceRanks = rankTiers && rankTiers.length > 0 ? rankTiers : (RankTiers || []);
  const tiers = getLatestTierList(sourceRanks);
  return tiers.find((rank: any) => rank.tier === tier) || tiers[0] || null;
}

function findAgent(agents: any[], characterId: string) {
  return agents.find((agent: any) => agent.uuid?.toLowerCase() === characterId?.toLowerCase());
}

function getPeakRankTier(mmr: any) {
  const seasons = mmr?.QueueSkills?.competitive?.SeasonalInfoBySeasonID;
  if (!seasons) {
    return mmr?.LatestCompetitiveUpdate?.TierAfterUpdate || mmr?.LatestCompetitiveUpdate?.TierBeforeUpdate || 0;
  }
  let peakTier = 0;
  for (const key of Object.keys(seasons)) {
    const seasonData = seasons[key];
    const tier = seasonData?.CompetitiveTier || 0;
    if (tier > peakTier) {
      peakTier = tier;
    }
  }
  const latestTier = mmr?.LatestCompetitiveUpdate?.TierAfterUpdate || mmr?.LatestCompetitiveUpdate?.TierBeforeUpdate || 0;
  if (latestTier > peakTier) {
    peakTier = latestTier;
  }
  return peakTier;
}

function getTeamDisplayName(teamId: string, ownTeamId?: string) {
  if (!teamId) return "--";
  if (teamId.toLowerCase() === "blue") return "BLUE";
  if (teamId.toLowerCase() === "red") return "RED";
  if (ownTeamId && teamId === ownTeamId) return "ALLY";
  if (ownTeamId && teamId !== ownTeamId) return "ENEMY";
  if (teamId.length > 8) {
    return "TEAM";
  }
  return teamId.toUpperCase();
}

function collectMatchPlayers(match: any) {
  const buckets = [
    ...(match?.Players || []),
    ...(match?.AllyTeam?.Players || []),
    ...(match?.EnemyTeam?.Players || []),
    ...((match?.Teams || []).flatMap((team: any) =>
      (team?.Players || []).map((player: any) => ({
        ...player,
        TeamID: player?.TeamID || team?.TeamID || team?.teamId,
      }))
    )),
  ];
  const seen = new Set<string>();

  return buckets.filter((player: any) => {
    const subject = getSubject(player);
    if (!subject || seen.has(subject)) return false;
    seen.add(subject);
    return true;
  });
}

function resolveMap(match: any, maps: any[]) {
  const mapId = match?.MapID || match?.MapId || match?.mapId;
  return maps.find((map: any) => map.mapUrl === mapId || map.uuid === mapId);
}

function getRegionCandidates(shard?: string | null) {
  const preferred = shard && GLZ_REGIONS.includes(shard) ? shard : "na";
  return [preferred, ...GLZ_REGIONS.filter((region) => region !== preferred)];
}

function getAutoPickDelayMs() {
  return 4000 + Math.floor(Math.random() * 2001);
}

export default function LiveScreen() {
  const auth = useAuthStore();
  const { colors, theme, accent } = useTheme();
  const styles = useMemo(() => createStyles(colors, accent, theme), [colors, accent, theme]);

  const [phase, setPhase] = useState<LivePhase>("checking");
  const [detectedRegion, setDetectedRegion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("Scanning session");
  const [liveMatch, setLiveMatch] = useState<any | null>(null);
  const [pregameMatch, setPregameMatch] = useState<any | null>(null);
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [agents, setAgents] = useState<any[]>(Agents || []);
  const [rankTiers, setRankTiers] = useState<any[]>(RankTiers || []);
  const [maps, setMaps] = useState<any[]>(Maps || []);
  const [autoPickEnabled, setAutoPickEnabled] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [autoPickMessage, setAutoPickMessage] = useState("Waiting for agent select");
  const autoPickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPickKeyRef = useRef("");
  const [queueAlertEnabled, setQueueAlertEnabled] = useState(false);
  const lastAlertedMatchIdRef = useRef("");

  const playableAgents = useMemo(
    () =>
      agents
        .filter((agent: any) => agent.isPlayableCharacter !== false)
        .sort((a: any, b: any) => a.displayName.localeCompare(b.displayName)),
    [agents]
  );

  const selectedAgent = useMemo(
    () => playableAgents.find((agent: any) => agent.uuid === selectedAgentId),
    [playableAgents, selectedAgentId]
  );

  const currentMatch = phase === "live" ? liveMatch : pregameMatch;
  const currentMap = useMemo(() => resolveMap(currentMatch, maps), [currentMatch, maps]);

  const ensureCatalogs = useCallback(async () => {
    const [freshAgents, freshRanks, freshMaps] = await Promise.all([
      agents.length > 0 ? Promise.resolve(agents) : ValorantApiService.fetchAgentsList(),
      rankTiers.length > 0 ? Promise.resolve(rankTiers) : ValorantApiService.fetchRankTiersList(),
      maps.length > 0 ? Promise.resolve(maps) : ValorantApiService.fetchMapsList(),
    ]);

    setAgents(freshAgents);
    setRankTiers(freshRanks);
    setMaps(freshMaps);
    return { freshAgents, freshRanks, freshMaps };
  }, [agents, maps, rankTiers]);

  const buildPlayers = useCallback(
    async (match: any, catalogAgents: any[], catalogRanks: any[], matchPhase: LivePhase) => {
      const rawPlayers = collectMatchPlayers(match);
      const subjects = rawPlayers.map(getSubject).filter(Boolean);
      const names = await ValorantApiService.fetchPlayerNames(
        auth.shard || "na",
        auth.accessToken || "",
        EntitlementsToken || "",
        subjects
      );

      let ownMmr = useShopStore.getState().playerMMR;
      if (!ownMmr && auth.playerUUID) {
        ownMmr = await ValorantApiService.fetchPlayerMMR(
          auth.shard || "na",
          auth.playerUUID,
          auth.accessToken || "",
          EntitlementsToken || "",
          catalogRanks
        );
        if (ownMmr) {
          useShopStore.setState({ playerMMR: ownMmr });
        }
      }

      return rawPlayers.map((player: any) => {
        const subject = getSubject(player);
        const nameRecord = names[subject] || {};
        const isSelf = subject === auth.playerUUID;
        const mmr = isSelf ? ownMmr : null;
        const tierNumber = getRankTier(player, mmr);
        const rank = findRank(catalogRanks, tierNumber);
        const agent = findAgent(catalogAgents, getCharacterId(player));

        let peakRankName = "--";
        if (isSelf && mmr) {
          const peakTierNumber = getPeakRankTier(mmr);
          if (peakTierNumber > 0) {
            const peakRank = findRank(catalogRanks, peakTierNumber);
            peakRankName = peakRank?.tierName || "--";
          }
        }

        return {
          subject,
          displayName:
            nameRecord.GameName ||
            nameRecord.gameName ||
            (isSelf ? auth.gameName || "You" : "Hidden Player"),
          tagLine: nameRecord.TagLine || nameRecord.tagLine || (isSelf ? auth.tagline || "" : ""),
          teamId: getTeamId(player),
          agentName: agent?.displayName || "Pending",
          agentIcon: agent?.displayIcon || agent?.fullPortrait,
          rankName: rank?.tierName || "Unrated",
          rankIcon: rank?.largeIcon || rank?.smallIcon,
          accountLevel: getAccountLevel(player),
          rating: isSelf ? getRankRating(mmr) : "--",
          state: getSelectionState(player, matchPhase),
          isSelf,
          peakRankName,
        };
      });
    },
    [auth.accessToken, auth.gameName, auth.playerUUID, auth.shard, auth.tagline]
  );

  const clearQueuedAutoPick = useCallback(() => {
    if (autoPickTimerRef.current) {
      clearTimeout(autoPickTimerRef.current);
      autoPickTimerRef.current = null;
    }
    autoPickKeyRef.current = "";
  }, []);

  const scheduleAutoPick = useCallback(
    (matchId: string, matchRegion: string) => {
      if (!autoPickEnabled || !selectedAgentId) return;
      const queueKey = `${matchId}:${selectedAgentId}`;
      if (!matchId || autoPickKeyRef.current === queueKey) return;

      clearQueuedAutoPick();
      autoPickKeyRef.current = queueKey;
      const delay = getAutoPickDelayMs();
      const seconds = (delay / 1000).toFixed(1);
      const agentName = selectedAgent?.displayName || "agent";
      setAutoPickMessage(`${agentName} queued in ${seconds}s`);
      setStatusText(`Instalock queued in ${seconds}s`);

      autoPickTimerRef.current = setTimeout(async () => {
        setAutoPickMessage(`Locking ${agentName}`);
        setStatusText(`Locking ${agentName}`);
        await ValorantApiService.selectPreGameAgent(
          {
            region: matchRegion,
            shard: auth.shard || "na",
            playerUuid: auth.playerUUID || "",
            accessToken: auth.accessToken || "",
            entitlementsToken: EntitlementsToken || "",
          },
          matchId,
          selectedAgentId
        );
        await ValorantApiService.lockPreGameAgent(
          {
            region: matchRegion,
            shard: auth.shard || "na",
            playerUuid: auth.playerUUID || "",
            accessToken: auth.accessToken || "",
            entitlementsToken: EntitlementsToken || "",
          },
          matchId,
          selectedAgentId
        );
        autoPickTimerRef.current = null;
        setAutoPickMessage(`${agentName} locked`);
        setStatusText(`${agentName} locked`);
      }, delay);
    },
    [
      auth.accessToken,
      auth.playerUUID,
      auth.shard,
      autoPickEnabled,
      clearQueuedAutoPick,
      selectedAgent,
      selectedAgentId,
    ]
  );

  const refreshLive = useCallback(async () => {
    if (!auth.accessToken || !auth.playerUUID || !auth.shard || !EntitlementsToken) {
      setPhase("error");
      setStatusText("Missing Riot session");
      return;
    }

    setIsLoading(true);
    setStatusText("Auto scanning lobby");

    try {
      const { freshAgents, freshRanks, freshMaps } = await ensureCatalogs();
      const regionCandidates = getRegionCandidates(auth.shard);

      for (const candidateRegion of regionCandidates) {
        const request = {
          region: candidateRegion,
          shard: auth.shard,
          playerUuid: auth.playerUUID,
          accessToken: auth.accessToken,
          entitlementsToken: EntitlementsToken,
        };

        const pregamePlayer = await ValorantApiService.fetchPreGamePlayer(request);
        const pregameMatchId = getMatchId(pregamePlayer);

        if (pregameMatchId) {
          scheduleAutoPick(pregameMatchId, candidateRegion);
          
          if (queueAlertEnabled && lastAlertedMatchIdRef.current !== pregameMatchId) {
            lastAlertedMatchIdRef.current = pregameMatchId;
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "🎯 ¡PARTIDA ENCONTRADA!",
                body: "Lobby de selección de agente activo. ¡Regresa a tu PC!",
                sound: "alarm.wav",
              },
              trigger: null,
            });
            Alert.alert("🎯 ¡Partida Encontrada!", "Lobby de selección de agente activo. ¡Regresa a tu PC!");
          }

          const match = await ValorantApiService.fetchPreGameMatch(request, pregameMatchId);
          setDetectedRegion(candidateRegion);
          setPregameMatch(match);
          setLiveMatch(null);
          setPlayers(match ? await buildPlayers(match, freshAgents, freshRanks, "pregame") : []);
          setPhase("pregame");
          setStatusText("Agent select");
          return;
        }
      }

      setStatusText("Auto scanning live match");

      for (const candidateRegion of regionCandidates) {
        const request = {
          region: candidateRegion,
          shard: auth.shard,
          playerUuid: auth.playerUUID,
          accessToken: auth.accessToken,
          entitlementsToken: EntitlementsToken,
        };

        const currentPlayer = await ValorantApiService.fetchCurrentGamePlayer(request);
        const liveMatchId = getMatchId(currentPlayer);

        if (liveMatchId) {
          const match = await ValorantApiService.fetchCurrentGameMatch(request, liveMatchId);
          setDetectedRegion(candidateRegion);
          setLiveMatch(match);
          setPregameMatch(null);
          setPlayers(match ? await buildPlayers(match, freshAgents, freshRanks, "live") : []);
          setPhase("live");
          setStatusText("Live match");
          return;
        }
      }

      setDetectedRegion("");
      setLiveMatch(null);
      setPregameMatch(null);
      setPlayers([]);
      setPhase("offline");
      setStatusText("No active match");
    } catch (error) {
      console.error("[LiveScreen] Failed to refresh live match:", error);
      setPhase("error");
      setStatusText("Live sync failed");
    } finally {
      setIsLoading(false);
    }
  }, [
    auth.accessToken,
    auth.playerUUID,
    auth.shard,
    buildPlayers,
    ensureCatalogs,
    scheduleAutoPick,
  ]);

  // Load autopick state on mount
  useEffect(() => {
    const loadAutopickState = async () => {
      try {
        const enabled = await AsyncStorage.getItem("autoPickEnabled");
        const agentId = await AsyncStorage.getItem("autopickAgentId");
        const alertEnabled = await AsyncStorage.getItem("queueAlertEnabled");
        if (enabled === "true") {
          setAutoPickEnabled(true);
        }
        if (agentId) {
          setSelectedAgentId(agentId);
        }
        if (alertEnabled === "true") {
          setQueueAlertEnabled(true);
        }
      } catch (e) {
        console.error("Failed to load autopick state from storage:", e);
      }
    };
    loadAutopickState();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshLive();
    }, [refreshLive])
  );

  // Background scanning refresh interval when autopick is off (30 seconds)
  useEffect(() => {
    if (autoPickEnabled) return;
    const interval = setInterval(refreshLive, 30000);
    return () => clearInterval(interval);
  }, [autoPickEnabled, refreshLive]);

  useEffect(() => {
    if (!autoPickEnabled) return;
    const interval = setInterval(refreshLive, 3500);
    return () => clearInterval(interval);
  }, [autoPickEnabled, refreshLive]);

  useEffect(() => {
    if (autoPickEnabled && selectedAgentId) {
      refreshLive();
    }
  }, [autoPickEnabled, refreshLive, selectedAgentId]);

  useEffect(() => {
    if (!autoPickEnabled || !selectedAgentId) {
      clearQueuedAutoPick();
      setAutoPickMessage(selectedAgentId ? "Autopick disabled" : "Select an agent");
    }
  }, [autoPickEnabled, clearQueuedAutoPick, selectedAgentId]);

  useEffect(() => {
    return clearQueuedAutoPick;
  }, [clearQueuedAutoPick]);

  const ownTeamId = useMemo(() => players.find((player) => player.isSelf)?.teamId, [players]);

  const groupedPlayers = useMemo(() => {
    const allies = players.filter((player) => player.teamId === ownTeamId || player.isSelf);
    const enemies = players.filter((player) => player.teamId !== ownTeamId && !player.isSelf);

    return {
      allies: allies.length > 0 ? allies : players.slice(0, 5),
      enemies,
    };
  }, [players, ownTeamId]);

  const renderPlayerCard = (player: LivePlayer) => (
    <AnimatedEntrance key={player.subject} distance={10} duration={220} style={styles.playerCard}>
      <View style={styles.playerIdentity}>
        <View style={styles.agentFrame}>
          {player.agentIcon ? (
            <Image source={{ uri: player.agentIcon }} style={styles.agentIcon} />
          ) : (
            <TabBarIcon name="person-outline" color={colors.subtle} size={24} />
          )}
        </View>
        <View style={styles.playerNameBlock}>
          <Text style={styles.playerName} numberOfLines={1}>
            {player.displayName}
          </Text>
          <Text style={styles.playerSub} numberOfLines={1}>
            {player.agentName} {player.tagLine ? `#${player.tagLine}` : ""}
          </Text>
        </View>
        {player.rankIcon ? <Image source={{ uri: player.rankIcon }} style={styles.rankIcon} /> : null}
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>LVL</Text>
          <Text style={styles.statValue}>{player.accountLevel}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>RANK</Text>
          <Text style={styles.statValue} numberOfLines={1}>
            {player.rankName}
          </Text>
        </View>
        {player.isSelf ? (
          <>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>PEAK</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {player.peakRankName || "--"}
              </Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>RR</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {player.rating}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>TEAM</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {getTeamDisplayName(player.teamId, ownTeamId)}
              </Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>STATE</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {player.state}
              </Text>
            </View>
          </>
        )}
      </View>
    </AnimatedEntrance>
  );

  return (
    <View style={styles.container}>
      <SegmentHeader activeSegment="live" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        indicatorStyle={theme === "dark" ? "white" : "black"}
      >
        <AnimatedEntrance style={styles.hero} distance={10} duration={240}>
          {currentMap?.listViewIcon && (
            <Image source={{ uri: currentMap.listViewIcon }} style={styles.heroImage} blurRadius={2} />
          )}
          <View style={styles.heroTint} />
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.eyebrow}>LIVE INTEL</Text>
              <Text style={styles.heroTitle}>
                {phase === "pregame" ? "Agent Select" : phase === "live" ? "Live Match" : "Match Scanner"}
              </Text>
              <Text style={styles.heroSub}>{currentMap?.displayName || statusText}</Text>
            </View>
            <TouchableOpacity
              onPress={refreshLive}
              activeOpacity={0.76}
              style={styles.refreshButton}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <TabBarIcon name="refresh" color={colors.text} size={20} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusChip}>
              <TabBarIcon name="navigate-outline" color={accent.gold} size={14} />
              <Text style={styles.statusChipText}>
                {detectedRegion ? `${detectedRegion.toUpperCase()} detected` : "Auto region"}
              </Text>
            </View>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={50} style={styles.autopickPanel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelLabel}>AUTOPICK</Text>
              <Text style={styles.panelTitle}>{selectedAgent?.displayName || "No agent selected"}</Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                const nextValue = !autoPickEnabled;
                setAutoPickEnabled(nextValue);
                if (nextValue) {
                  await AsyncStorage.setItem("autoPickEnabled", "true");
                  if (selectedAgentId) {
                    setAutoPickMessage("Scanning for agent select");
                    const agentName = playableAgents.find((a) => a.uuid === selectedAgentId)?.displayName || "agent";
                    await showAutopickNotification(agentName);
                    await registerBackgroundAutopickTask();
                  } else {
                    setAutoPickMessage("Select an agent");
                  }
                } else {
                  await AsyncStorage.setItem("autoPickEnabled", "false");
                  await dismissAutopickNotification();
                  if (!queueAlertEnabled) {
                    await unregisterBackgroundAutopickTask();
                  }
                  setAutoPickMessage("Autopick disabled");
                }
              }}
              activeOpacity={0.76}
              style={[styles.toggleButton, autoPickEnabled && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleText, autoPickEnabled && styles.toggleTextActive]}>
                {autoPickEnabled ? "ON" : "OFF"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.agentRail}
          >
            {playableAgents.map((agent: any) => (
              <AnimatedPressable
                key={agent.uuid}
                onPress={async () => {
                  clearQueuedAutoPick();
                  setSelectedAgentId(agent.uuid);
                  await AsyncStorage.setItem("autopickAgentId", agent.uuid);
                  setAutoPickMessage(autoPickEnabled ? "Waiting for next lobby scan" : "Autopick disabled");
                  if (autoPickEnabled) {
                    await showAutopickNotification(agent.displayName);
                  }
                }}
                style={[
                  styles.agentPickCard,
                  selectedAgentId === agent.uuid && styles.agentPickCardActive,
                ]}
                contentStyle={styles.agentPickContent}
              >
                {agent.displayIcon && <Image source={{ uri: agent.displayIcon }} style={styles.pickAgentIcon} />}
                <Text style={styles.pickAgentName} numberOfLines={1}>
                  {agent.displayName}
                </Text>
              </AnimatedPressable>
            ))}
          </ScrollView>
          <Text style={styles.autoPickHint}>{autoPickMessage}</Text>
        </AnimatedEntrance>

        <AnimatedEntrance delay={65} style={styles.alertPanel}>
          <View style={styles.panelHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.panelLabel}>DODGE PREVENTER</Text>
              <Text style={styles.panelTitle}>Alerta de Cola</Text>
              <Text style={styles.alertHint}>
                Te avisaremos con sonido y vibración en tu celular cuando se encuentre partida.
              </Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                const nextValue = !queueAlertEnabled;
                setQueueAlertEnabled(nextValue);
                if (nextValue) {
                  await AsyncStorage.setItem("queueAlertEnabled", "true");
                  await registerBackgroundAutopickTask();
                } else {
                  await AsyncStorage.setItem("queueAlertEnabled", "false");
                  if (!autoPickEnabled) {
                    await unregisterBackgroundAutopickTask();
                  }
                }
              }}
              activeOpacity={0.76}
              style={[styles.toggleButton, queueAlertEnabled && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleText, queueAlertEnabled && styles.toggleTextActive]}>
                {queueAlertEnabled ? "ON" : "OFF"}
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntrance>

        {phase === "offline" || phase === "error" ? (
          <AnimatedEntrance style={styles.emptyPanel}>
            <TabBarIcon
              name={phase === "error" ? "alert-circle-outline" : "radio-outline"}
              color={phase === "error" ? accent.red : accent.gold}
              size={30}
            />
            <Text style={styles.emptyTitle}>{statusText}</Text>
          </AnimatedEntrance>
        ) : (
          <>
            <AnimatedEntrance delay={80} style={styles.teamSection}>
              <View style={styles.teamHeader}>
                <Text style={styles.teamTitle}>Your Team</Text>
                <Text style={styles.teamCount}>{groupedPlayers.allies.length}/5</Text>
              </View>
              {groupedPlayers.allies.map(renderPlayerCard)}
            </AnimatedEntrance>

            <AnimatedEntrance delay={110} style={styles.teamSection}>
              <View style={styles.teamHeader}>
                <Text style={styles.teamTitle}>Enemy Team</Text>
                <Text style={styles.teamCount}>{groupedPlayers.enemies.length}/5</Text>
              </View>
              {groupedPlayers.enemies.length > 0 ? (
                groupedPlayers.enemies.map(renderPlayerCard)
              ) : (
                <View style={styles.hiddenEnemyCard}>
                  <TabBarIcon name="eye-off-outline" color={colors.subtle} size={24} />
                  <Text style={styles.hiddenEnemyText}>Enemy data hidden</Text>
                </View>
              )}
            </AnimatedEntrance>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: any, accent: any, theme: string) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 60,
      gap: 16,
    },
    hero: {
      minHeight: 178,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.backgroundAlt,
      padding: 16,
      justifyContent: "space-between",
    },
    heroImage: {
      position: "absolute",
      top: -1,
      right: -1,
      bottom: -1,
      left: -1,
      resizeMode: "cover",
      opacity: 0.38,
    },
    heroTint: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: theme === "dark" ? "rgba(9,10,12,0.58)" : "rgba(248,250,252,0.64)",
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    eyebrow: {
      color: accent.gold,
      fontFamily: "Rubik700",
      fontSize: 11,
      letterSpacing: 0.5,
    },
    heroTitle: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 28,
      lineHeight: 32,
    },
    heroSub: {
      color: colors.muted,
      fontFamily: "Rubik600",
      fontSize: 13,
    },
    refreshButton: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surfaceStrong,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusRow: {
      flexDirection: "row",
    },
    statusChip: {
      height: 30,
      borderRadius: 8,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    statusChipText: {
      color: colors.text,
      fontFamily: "Rubik700",
      fontSize: 11,
    },
    autopickPanel: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glass,
      padding: 14,
      gap: 12,
      overflow: "hidden",
    },
    alertPanel: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glass,
      padding: 14,
      marginTop: 14,
    },
    alertHint: {
      color: colors.muted,
      fontFamily: "Rubik500",
      fontSize: 12,
      marginTop: 4,
      lineHeight: 16,
    },
    panelHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    panelLabel: {
      color: colors.muted,
      fontFamily: "Rubik700",
      fontSize: 11,
      letterSpacing: 0.5,
    },
    panelTitle: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 18,
    },
    toggleButton: {
      width: 58,
      height: 34,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surfaceStrong,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleButtonActive: {
      backgroundColor: accent.goldSoft,
      borderColor: accent.gold,
    },
    toggleText: {
      color: colors.muted,
      fontFamily: "Rubik800",
      fontSize: 12,
    },
    toggleTextActive: {
      color: colors.text,
    },
    agentRail: {
      gap: 10,
      paddingRight: 10,
    },
    agentPickCard: {
      width: 78,
      height: 92,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    agentPickCardActive: {
      borderColor: accent.gold,
      backgroundColor: accent.goldSoft,
    },
    agentPickContent: {
      flex: 1,
      padding: 8,
      alignItems: "center",
      justifyContent: "space-between",
    },
    pickAgentIcon: {
      width: 44,
      height: 44,
      resizeMode: "contain",
    },
    pickAgentName: {
      width: "100%",
      color: colors.text,
      fontFamily: "Rubik700",
      fontSize: 10,
      textAlign: "center",
    },
    autoPickHint: {
      color: colors.muted,
      fontFamily: "Rubik600",
      fontSize: 12,
      lineHeight: 16,
    },
    emptyPanel: {
      minHeight: 160,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glass,
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      padding: 20,
    },
    emptyTitle: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 18,
      textAlign: "center",
    },
    teamSection: {
      gap: 12,
    },
    teamHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    teamTitle: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 20,
    },
    teamCount: {
      color: colors.muted,
      fontFamily: "Rubik700",
      fontSize: 12,
    },
    playerCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glass,
      padding: 12,
      gap: 12,
      overflow: "hidden",
    },
    playerIdentity: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    agentFrame: {
      width: 48,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    agentIcon: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    playerNameBlock: {
      flex: 1,
    },
    playerName: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: 16,
    },
    playerSub: {
      color: colors.muted,
      fontFamily: "Rubik600",
      fontSize: 12,
    },
    rankIcon: {
      width: 42,
      height: 42,
      resizeMode: "contain",
    },
    statGrid: {
      flexDirection: "row",
      gap: 8,
    },
    statCell: {
      flex: 1,
      minHeight: 52,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
    },
    statLabel: {
      color: colors.muted,
      fontFamily: "Rubik700",
      fontSize: 10,
    },
    statValue: {
      color: colors.text,
      fontFamily: "Rubik800",
      fontSize: Platform.OS === "ios" ? 12 : 11,
      textAlign: "center",
    },
    hiddenEnemyCard: {
      minHeight: 88,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glass,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    hiddenEnemyText: {
      color: colors.muted,
      fontFamily: "Rubik700",
      fontSize: 13,
    },
  });
}
