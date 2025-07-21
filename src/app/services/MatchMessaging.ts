import { TeamData, AllianceType, ViewMode } from '../models/TeamData';
import { io, Socket } from 'socket.io-client';

// Define message types for our application
export enum MessageType {
  MATCH_DATA_UPDATE = 'MATCH_DATA_UPDATE',
  VIEW_MODE_CHANGE = 'VIEW_MODE_CHANGE',
  ALLIANCE_SELECTION = 'ALLIANCE_SELECTION',
  ROBOT_SELECTION = 'ROBOT_SELECTION',
  RANKINGS_PAGE_CHANGE = 'RANKINGS_PAGE_CHANGE'
}

// Map message types to their corresponding payload types
export type MessagePayloadMap = {
  [MessageType.MATCH_DATA_UPDATE]: MatchDataPayload;
  [MessageType.VIEW_MODE_CHANGE]: ViewModePayload;
  [MessageType.ALLIANCE_SELECTION]: AllianceSelectionPayload;
  [MessageType.ROBOT_SELECTION]: RobotSelectionPayload;
  [MessageType.RANKINGS_PAGE_CHANGE]: RankingsPagePayload;
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
  eventKey: string; // Add event key to match data
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

export interface RankingsPagePayload {
  page: number;
}

// Singleton class for managing match messaging
class MatchMessagingService {
  private socket: Socket;
  private listeners: Map<MessageType, ((payload: any) => void)[]>;
  
  constructor() {
    // Connect to the Socket.IO server using relative URL (will connect to same host as the page)
    // This works across different devices as long as they access the app from the server's IP/hostname
    this.socket = io();
    this.listeners = new Map();
    
    // Set up listeners for each message type
    Object.values(MessageType).forEach((type: MessageType) => {
      this.socket.on(type, (payload: any) => {
        this.notifyListeners(type, payload);
      });
    });
    
    // Log connection status
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server with ID:', this.socket.id);
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });
  }
  
  // Send a message to all other connected clients
  public sendMessage<T extends MessageType>(type: T, payload: MessagePayloadMap[T]): void {
    // Emit the message to the Socket.IO server
    this.socket.emit(type, payload);
    
    // Also notify local listeners (for the current client)
    this.notifyListeners(type, payload);
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
    this.sendMessage(MessageType.MATCH_DATA_UPDATE, matchData);
  }
  
  public changeViewMode(mode: ViewMode): void {
    this.sendMessage(MessageType.VIEW_MODE_CHANGE, { mode });
  }
  
  public selectAlliance(alliance: AllianceType): void {
    this.sendMessage(MessageType.ALLIANCE_SELECTION, { alliance });
  }
  
  public selectRobot(alliance: AllianceType, teamIndex: number): void {
    this.sendMessage(MessageType.ROBOT_SELECTION, { alliance, teamIndex });
  }
  
  public changeRankingsPage(page: number): void {
    this.sendMessage(MessageType.RANKINGS_PAGE_CHANGE, { page });
  }
  
  // Clean up resources
  public dispose(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
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
