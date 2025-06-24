import { TeamData, AllianceType, ViewMode } from '../models/TeamData';

// Define message types for our application
export type MessageType = 
  | 'MATCH_DATA_UPDATE' 
  | 'VIEW_MODE_CHANGE' 
  | 'ALLIANCE_SELECTION' 
  | 'ROBOT_SELECTION';

// Map message types to their corresponding payload types
export type MessagePayloadMap = {
  'MATCH_DATA_UPDATE': MatchDataPayload;
  'VIEW_MODE_CHANGE': ViewModePayload;
  'ALLIANCE_SELECTION': AllianceSelectionPayload;
  'ROBOT_SELECTION': RobotSelectionPayload;
};

// Define the structure of our messages
export interface MatchMessage<T extends MessageType = MessageType> {
  type: T;
  payload: MessagePayloadMap[T];
}

// Define specific message payloads
export interface MatchDataPayload {
  matchNumber: string;
  blueTeams: TeamData[];
  redTeams: TeamData[];
}

export interface ViewModePayload {
  mode: ViewMode;
}

export interface AllianceSelectionPayload {
  alliance: AllianceType;
}

export interface RobotSelectionPayload {
  alliance: AllianceType;
  teamIndex: number;
}

// Singleton class for managing match messaging
class MatchMessagingService {
  private channel: BroadcastChannel;
  private listeners: Map<MessageType, ((payload: any) => void)[]>;
  
  constructor() {
    this.channel = new BroadcastChannel('match-messaging');
    this.listeners = new Map();
    
    this.channel.onmessage = (event) => {
      const message = event.data as MatchMessage;
      this.notifyListeners(message.type, message.payload);
    };
  }
  
  // Send a message to all other tabs/windows
  public sendMessage<T extends MessageType>(type: T, payload: MessagePayloadMap[T]): void {
    const message: MatchMessage<T> = { type, payload };
    this.channel.postMessage(message);
  }
  
  // Subscribe to a specific message type
  public subscribe<T extends MessageType>(type: T, callback: (payload: MessagePayloadMap[T]) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    this.listeners.get(type)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }
  
  // Notify all listeners of a specific message type
  private notifyListeners<T extends MessageType>(type: T, payload: MessagePayloadMap[T]): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(payload));
    }
  }
  
  // Helper methods for common messages
  public updateMatchData(matchData: MatchDataPayload): void {
    this.sendMessage('MATCH_DATA_UPDATE', matchData);
  }
  
  public changeViewMode(mode: ViewMode): void {
    this.sendMessage('VIEW_MODE_CHANGE', { mode });
  }
  
  public selectAlliance(alliance: AllianceType): void {
    this.sendMessage('ALLIANCE_SELECTION', { alliance });
  }
  
  public selectRobot(alliance: AllianceType, teamIndex: number): void {
    this.sendMessage('ROBOT_SELECTION', { alliance, teamIndex });
  }
  
  // Clean up resources
  public dispose(): void {
    this.channel.close();
    this.listeners.clear();
  }
}

// Create a singleton instance
let instance: MatchMessagingService | null = null;

// Export a function to get the singleton instance
export function getMatchMessagingService(): MatchMessagingService {
  if (!instance) {
    instance = new MatchMessagingService();
  }
  return instance;
}
