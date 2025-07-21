import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import axios from "axios";

// Initialize Firebase Admin
initializeApp();

// Import our FirestoreService
import { FirestoreService } from "./services/FirestoreService";
import { SimplifiedMatch, TBAMatch, TBARankings, TeamRanking } from "./models/TBAModels";

// For cost control, limit the number of instances
setGlobalOptions({ maxInstances: 1 });

// TBA API configuration
const TBA_BASE_URL = "https://www.thebluealliance.com/api/v3";
// The API key should be stored in environment variables in production
const TBA_API_KEY = process.env.TBA_API_KEY;

// Define interfaces for TheBlueAlliance webhook payloads
interface TBAWebhookPayload {
  message_type: string;
  message_data: any;
}

interface PingNotification {
  // Ping notification has no specific fields
}

interface EventScheduleUpdatedNotification {
  event_key: string;
}

interface MatchScoreNotification {
  event_key: string;
  match_key: string;
}

interface VerificationNotification {
  verification_key: string;
}

/**
 * Main webhook handler for TheBlueAlliance notifications
 * Handles three types of notifications:
 * 1. Ping Notification
 * 2. Event Schedule Updated
 * 3. Match Score Notification
 */
export const tbaWebhook = onRequest(async (request, response) => {
  try {
    // Verify request method
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const payload = request.body as TBAWebhookPayload;
    
    // Log the incoming webhook
    logger.info("Received TBA webhook", { messageType: payload.message_type });
    
    // Handle different notification types
    switch (payload.message_type) {
      case "ping":
        await handlePingNotification(payload.message_data);
        break;
        
      case "schedule_updated":
        await handleEventScheduleUpdated(payload.message_data);
        break;
        
      case "match_score":
        await handleMatchScoreNotification(payload.message_data);
        break;

      case "verification":
        const data = payload.message_data as VerificationNotification;
        logger.info(`Received verification code ${data.verification_key}`);
        
      default:
        logger.warn("Unhandled webhook type: ", payload.message_type);
    }
    
    response.status(200).send("Webhook processed successfully");
  } catch (error) {
    logger.error("Error processing webhook", { error });
    response.status(500).send("Internal Server Error");
  }
});

/**
 * Handle Ping Notification
 * Simply logs the message data
 */
async function handlePingNotification(data: PingNotification): Promise<void> {
  logger.info("Received ping notification", { data });
  
  // Log the ping notification to Firestore
  await FirestoreService.logWebhookNotification("ping", data);
}

/**
 * Fetch match data from TheBlueAlliance API
 */
async function fetchMatchesFromTBA(eventKey: string): Promise<TBAMatch[]> {
  try {
    const url = `${TBA_BASE_URL}/event/${eventKey}/matches/simple`;
    const response = await axios.get(url, {
      headers: {
        'X-TBA-Auth-Key': TBA_API_KEY
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`TBA API returned status ${response.status}`);
    }
    
    return response.data as TBAMatch[];
  } catch (error) {
    logger.error(`Error fetching matches for event ${eventKey}:`, error);
    throw error;
  }
}

/**
 * Process TBA match data into simplified format
 * Strips 'frc' prefix from team numbers
 */
function processMatchData(matches: TBAMatch[]): SimplifiedMatch[] {
  return matches.map(match => {
    // Process team keys to remove 'frc' prefix
    const blueTeamKeys = match.alliances.blue.team_keys.map(key => key.replace('frc', ''));
    const redTeamKeys = match.alliances.red.team_keys.map(key => key.replace('frc', ''));
    
    return {
      match_number: match.match_number,
      comp_level: match.comp_level,
      alliances: {
        blue: {
          team_keys: blueTeamKeys,
          score: match.alliances.blue.score
        },
        red: {
          team_keys: redTeamKeys,
          score: match.alliances.red.score
        }
      },
      winning_alliance: match.winning_alliance,
      match_key: match.key,
      event_key: match.event_key,
      time: match.time || undefined,
      actual_time: match.actual_time || undefined
    };
  });
}

/**
 * Fetch rankings data from TheBlueAlliance API
 */
async function fetchRankingsFromTBA(eventKey: string): Promise<TBARankings> {
  try {
    const url = `${TBA_BASE_URL}/event/${eventKey}/rankings`;
    const response = await axios.get(url, {
      headers: {
        'X-TBA-Auth-Key': TBA_API_KEY
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`TBA API returned status ${response.status}`);
    }
    
    return response.data as TBARankings;
  } catch (error) {
    logger.error(`Error fetching rankings for event ${eventKey}:`, error);
    throw error;
  }
}

/**
 * Process TBA rankings data into simplified format
 * Strips 'frc' prefix from team numbers and maps stats to their names
 */
function processRankingsData(rankingsData: TBARankings): TeamRanking[] {
  return rankingsData.rankings.map(ranking => {
    // Strip 'frc' prefix from team number
    const teamNumber = ranking.team_key.replace('frc', '');
    
    // Map extra_stats to their names
    const namedExtraStats: { [key: string]: number } = {};
    if (ranking.extra_stats && rankingsData.extra_stats_info) {
      ranking.extra_stats.forEach((value, index) => {
        if (rankingsData.extra_stats_info[index]) {
          const name = rankingsData.extra_stats_info[index].name;
          namedExtraStats[name] = value;
        }
      });
    }
    
    // Map sort_orders to their names
    const namedSortOrders: { [key: string]: number } = {};
    if (ranking.sort_orders && rankingsData.sort_order_info) {
      ranking.sort_orders.forEach((value, index) => {
        if (rankingsData.sort_order_info[index]) {
          const name = rankingsData.sort_order_info[index].name;
          namedSortOrders[name] = value;
        }
      });
    }
    
    return {
      team_number: teamNumber,
      rank: ranking.rank,
      matches_played: ranking.matches_played,
      record: ranking.record,
      // First sort order is typically the ranking score
      ranking_score: ranking.sort_orders[0],
      extra_stats: ranking.extra_stats,
      sort_orders: ranking.sort_orders,
      named_extra_stats: namedExtraStats,
      named_sort_orders: namedSortOrders
    };
  });
}

/**
 * Handle Event Schedule Updated Notification
 * Fetches updated event data from TBA API and updates Firestore
 */
async function handleEventScheduleUpdated(data: EventScheduleUpdatedNotification): Promise<void> {
  try {
    const { event_key } = data;
    logger.info("Event schedule updated", { event_key });
    
    // Log the webhook notification
    await FirestoreService.logWebhookNotification("schedule_updated", data);
    
    // Fetch match data from TBA API
    const matches = await fetchMatchesFromTBA(event_key);
    logger.info(`Fetched ${matches.length} matches for event ${event_key}`);
    
    // Process the match data
    const simplifiedMatches = processMatchData(matches);
    
    // Save the processed matches to Firestore
    await FirestoreService.saveMatches(simplifiedMatches);
    
    logger.info("Successfully processed event schedule update", { event_key });
  } catch (error) {
    logger.error("Error handling event schedule update", { error });
    throw error;
  }
}

/**
 * Handle Match Score Notification
 * Fetches match score data from TBA API and updates Firestore
 */
async function handleMatchScoreNotification(data: MatchScoreNotification): Promise<void> {
  try {
    const { event_key, match_key } = data;
    logger.info("Match score updated", { event_key, match_key });
    
    // Log the webhook notification
    await FirestoreService.logWebhookNotification("match_score", data);
    
    // Fetch match score data from TBA API
    const url = `${TBA_BASE_URL}/match/${match_key}/simple`;
    const response = await axios.get(url, {
      headers: {
        'X-TBA-Auth-Key': TBA_API_KEY
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`TBA API returned status ${response.status}`);
    }
    
    const matchData = response.data as TBAMatch;
    logger.info(`Fetched match data for ${match_key}`);
    
    // Process the match data (strip 'frc' prefix from team numbers)
    const blueTeamKeys = matchData.alliances.blue.team_keys.map(key => key.replace('frc', ''));
    const redTeamKeys = matchData.alliances.red.team_keys.map(key => key.replace('frc', ''));
    
    // Save the match score data to Firestore
    await FirestoreService.saveMatchScore(match_key, {
      match_number: matchData.match_number,
      comp_level: matchData.comp_level,
      event_key: matchData.event_key,
      alliances: {
        blue: {
          team_keys: blueTeamKeys,
          score: matchData.alliances.blue.score
        },
        red: {
          team_keys: redTeamKeys,
          score: matchData.alliances.red.score
        }
      },
      winning_alliance: matchData.winning_alliance,
      time: matchData.time || undefined,
      actual_time: matchData.actual_time || undefined,
      received_at: new Date()
    });
    
    // Fetch and update rankings data
    try {
      logger.info(`Fetching rankings for event ${event_key}`);
      const rankingsData = await fetchRankingsFromTBA(event_key);
      
      // Process rankings data
      const teamRankings = processRankingsData(rankingsData);
      logger.info(`Processed rankings for ${teamRankings.length} teams`);
      
      // Save team rankings to Firestore
      await FirestoreService.saveTeamRankings(event_key, teamRankings);
      logger.info(`Successfully updated rankings for event ${event_key}`);
    } catch (rankingsError) {
      logger.error(`Error processing rankings for event ${event_key}:`, rankingsError);
      // Continue execution even if rankings update fails
    }
    
    logger.info("Successfully processed match score notification", { match_key });
  } catch (error) {
    logger.error("Error handling match score notification", { error });
    throw error;
  }
}
