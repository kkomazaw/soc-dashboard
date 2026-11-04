import axios from 'axios'

// MITRE ATT&CK STIX data from official GitHub repository
const ATTACK_STIX_URL = 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json'

export interface AttackTechnique {
  id: string // ATT&CK ID like T1566
  name: string
  description: string
  tactics: string[] // kill chain phases
  platforms: string[]
  dataSource: string[]
  detectionDifficulty?: string
  url: string
  mitigations?: string[]
  subtechniques?: string[]
}

export interface AttackTactic {
  id: string
  name: string
  description: string
  shortName: string // e.g., "initial-access"
  techniques: string[] // technique IDs under this tactic
}

interface StixObject {
  type: string
  id: string
  name?: string
  description?: string
  x_mitre_shortname?: string
  kill_chain_phases?: Array<{
    kill_chain_name: string
    phase_name: string
  }>
  x_mitre_platforms?: string[]
  x_mitre_data_sources?: string[]
  x_mitre_detection?: string
  external_references?: Array<{
    source_name: string
    external_id?: string
    url?: string
  }>
}

interface StixBundle {
  type: string
  id: string
  objects: StixObject[]
}

export const fetchAttackData = async (): Promise<{
  techniques: AttackTechnique[]
  tactics: AttackTactic[]
}> => {
  try {
    console.log('Fetching MITRE ATT&CK data from GitHub...')
    const response = await axios.get<StixBundle>(ATTACK_STIX_URL, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.data || !response.data.objects) {
      throw new Error('Invalid STIX data format')
    }

    const stixObjects = response.data.objects

    // Extract tactics (kill chain phases)
    const tacticsMap = new Map<string, AttackTactic>()
    const tacticsObjects = stixObjects.filter(
      (obj) => obj.type === 'x-mitre-tactic'
    )

    tacticsObjects.forEach((tacticObj) => {
      if (!tacticObj.x_mitre_shortname || !tacticObj.name) return

      const attackId = tacticObj.external_references?.find(
        (ref) => ref.source_name === 'mitre-attack'
      )?.external_id

      if (attackId) {
        tacticsMap.set(tacticObj.x_mitre_shortname, {
          id: attackId,
          name: tacticObj.name,
          description: tacticObj.description || '',
          shortName: tacticObj.x_mitre_shortname,
          techniques: [],
        })
      }
    })

    // Extract techniques
    const techniques: AttackTechnique[] = []
    const techniqueObjects = stixObjects.filter(
      (obj) => obj.type === 'attack-pattern' && !obj.x_mitre_is_subtechnique
    )

    techniqueObjects.forEach((techObj) => {
      const attackRef = techObj.external_references?.find(
        (ref) => ref.source_name === 'mitre-attack'
      )

      if (!attackRef?.external_id || !techObj.name) return

      const tactics = techObj.kill_chain_phases?.map(
        (phase) => phase.phase_name
      ) || []

      const technique: AttackTechnique = {
        id: attackRef.external_id,
        name: techObj.name,
        description: techObj.description || '',
        tactics,
        platforms: techObj.x_mitre_platforms || [],
        dataSource: techObj.x_mitre_data_sources || [],
        url: attackRef.url || `https://attack.mitre.org/techniques/${attackRef.external_id}/`,
      }

      techniques.push(technique)

      // Add technique to each tactic
      tactics.forEach((tacticName) => {
        const tactic = tacticsMap.get(tacticName)
        if (tactic) {
          tactic.techniques.push(technique.id)
        }
      })
    })

    const tactics = Array.from(tacticsMap.values())

    console.log(`✅ Fetched ${techniques.length} techniques and ${tactics.length} tactics`)
    return { techniques, tactics }
  } catch (error) {
    console.error('Error fetching MITRE ATT&CK data:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch ATT&CK data: ${error.message}`
      )
    }
    throw error
  }
}

export const searchTechniqueById = async (
  techniqueId: string
): Promise<AttackTechnique | null> => {
  try {
    const { techniques } = await fetchAttackData()
    return techniques.find((t) => t.id === techniqueId) || null
  } catch (error) {
    console.error('Error searching technique:', error)
    return null
  }
}

export const getTechniquesByTactic = async (
  tacticName: string
): Promise<AttackTechnique[]> => {
  try {
    const { techniques } = await fetchAttackData()
    return techniques.filter((t) =>
      t.tactics.some(
        (tactic) => tactic.toLowerCase() === tacticName.toLowerCase()
      )
    )
  } catch (error) {
    console.error('Error filtering techniques by tactic:', error)
    return []
  }
}
