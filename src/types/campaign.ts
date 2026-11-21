export interface Campaign {
  id?: number
  campaignId: string
  name: string
  aliases?: string[]
  description: string
  firstSeen: Date | string
  lastSeen?: Date | string
  objective?: string
  confidence: number
  sophistication?: string
  status: string
  source?: string
  sourceUrl?: string
  metadata?: Record<string, any>
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface ThreatActor {
  id?: number
  actorId: string
  name: string
  aliases?: string[]
  description?: string
  actorType: string
  sophistication?: string
  resourceLevel?: string
  primaryMotivation?: string
  origin?: string
  firstSeen?: Date | string
  lastSeen?: Date | string
  targetedSectors?: string[]
  targetedCountries?: string[]
  source?: string
  sourceUrl?: string
  metadata?: Record<string, any>
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface Malware {
  id?: number
  malwareId: string
  name: string
  aliases?: string[]
  description?: string
  malwareTypes: string[]
  architecture?: string
  capabilities?: string[]
  fileHashes?: Record<string, string>
  signatures?: string[]
  malwareFamily?: string
  variantOf?: string
  firstSeen?: Date | string
  lastSeen?: Date | string
  source?: string
  sourceUrl?: string
  metadata?: Record<string, any>
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface Indicator {
  id?: number
  indicatorId: string
  indicatorType: string
  value: string
  pattern?: string
  patternType?: string
  confidence: number
  validFrom: Date | string
  validUntil?: Date | string
  threatType?: string
  severity?: string
  description?: string
  source?: string
  sourceUrl?: string
  metadata?: Record<string, any>
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface Relationship {
  id?: number
  relationshipType: string
  sourceType: string
  sourceId: string
  targetType: string
  targetId: string
  confidence?: number
  description?: string
  firstSeen?: Date | string
  lastSeen?: Date | string
  metadata?: Record<string, any>
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface CampaignGraphEntity {
  id: string
  type: string
  name: string
  data: Campaign | ThreatActor | Malware | Indicator | any
}

export interface CampaignGraphRelationship {
  id: number
  source: string
  target: string
  type: string
  confidence?: number
  description?: string
}

export interface CampaignGraph {
  entities: CampaignGraphEntity[]
  relationships: CampaignGraphRelationship[]
}

export interface CampaignStats {
  total: number
  byStatus: {
    active: number
    inactive: number
    ongoing: number
  }
  byObjective: {
    espionage: number
    'financial-gain': number
    disruption: number
  }
  bySophistication: {
    strategic: number
    expert: number
    advanced: number
  }
}

export interface ThreatActorStats {
  total: number
  byType: {
    'nation-state': number
    cybercrime: number
    hacktivist: number
  }
  bySophistication: {
    strategic: number
    expert: number
    advanced: number
  }
}

export interface MalwareStats {
  total: number
  topFamilies: Record<string, number>
}

export interface IndicatorStats {
  total: number
  active: number
  byType: {
    ipv4: number
    domain: number
    url: number
    'file-hash': number
  }
  byThreatType: {
    malware: number
    phishing: number
    c2: number
  }
}

export interface RelationshipStats {
  total: number
  byType: {
    uses: number
    'attributed-to': number
    indicates: number
    targets: number
  }
}
