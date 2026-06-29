export interface JwtPayload {
  sub: string;
  iss: string;
  iat: number;
  exp: number;
}

export interface CustomJwtPayload extends JwtPayload {
  acct: {
    game_name: string;
    tag_line: string;
  };
}

export interface RiotSession {
  accessToken: string;
  idToken: string;
  playerUUID: string;
  shard: string;
  expiresIn: string;
  gameName: string;
  tagline: string;
}

export interface ContentTier {
  uuid: string;
  displayName: string;
  displayIcon: string;
  rank: number;
}

export interface Skin {
  uuid: string;
  displayName: string;
  displayIcon: string;
  contentTierUuid?: string;
  Cost?: string;
  TierColor?: string;
  TierName?: string;
  levels: Array<{
    uuid: string;
    displayName: string;
    displayIcon: string;
    streamedVideoPath: string | null;
  }>;
}

export interface Bundle {
  uuid: string;
  displayName: string;
  displayIcon: string;
  Cost?: string;
  timeRemaining?: number;
  originalBundle?: any;
}

export interface AccessoryOffer {
  uuid: string;
  displayName: string;
  displayIcon: string;
  Cost: string;
  itemType: 'Buddy' | 'Spray' | 'Player Card' | 'Player Title' | 'Accessory';
  originalItem: any;
}

export interface WalletBalances {
  vp: number;
  kingdomCredits: number;
  radianite: number;
  freeAgents: number;
  raw?: Record<string, number>;
}

export interface PlayerMMR {
  LatestCompetitiveUpdate: {
    MatchID?: string;
    MapID?: string;
    TierAfterUpdate?: number;
    TierBeforeUpdate: number;
    RankedRatingAfterUpdate?: number;
    RankedRatingBeforeUpdate: number;
  } | null;
  Rank: {
    tier: number;
    tierName: string;
    largeIcon: string;
    color: string;
  };
}

export interface MatchHistory {
  Matches: Array<{
    MatchID: string;
    MapID: string;
    MatchStartTime: number;
    TierAfterUpdate: number;
    Details?: any;
  }>;
}
