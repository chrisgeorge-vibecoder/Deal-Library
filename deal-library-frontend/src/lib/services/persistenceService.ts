import fs from 'fs';
import path from 'path';

export interface PersistedState {
  lastQuery: string;
  lastResponse: any;
  sessionData: any;
  timestamp: number;
}

export class PersistenceService {
  private stateFile: string;
  private state: PersistedState;

  constructor() {
    this.stateFile = path.join(process.cwd(), 'demo-state.json');
    this.state = this.loadState();
    
    // Save state on process exit
    process.on('SIGINT', () => this.saveState());
    process.on('SIGTERM', () => this.saveState());
    process.on('exit', () => this.saveState());
    
    console.log('🔄 PersistenceService initialized - context will be preserved across restarts');
  }

  private loadState(): PersistedState {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = fs.readFileSync(this.stateFile, 'utf8');
        const state = JSON.parse(data);
        
        // Only load recent state (within last hour)
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        if (state.timestamp > oneHourAgo) {
          console.log('📁 Loaded persisted state from previous session');
          return state;
        }
      }
    } catch (error) {
      console.log('⚠️ Could not load persisted state, starting fresh');
    }
    
    return {
      lastQuery: '',
      lastResponse: null,
      sessionData: {},
      timestamp: Date.now()
    };
  }

  private saveState(): void {
    try {
      this.state.timestamp = Date.now();
      fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
      console.log('💾 State persisted successfully');
    } catch (error) {
      console.error('❌ Failed to persist state:', error);
    }
  }

  public updateLastQuery(query: string): void {
    this.state.lastQuery = query;
    this.saveState();
  }

  public updateLastResponse(response: any): void {
    this.state.lastResponse = response;
    this.saveState();
  }

  public getLastQuery(): string {
    return this.state.lastQuery;
  }

  public getLastResponse(): any {
    return this.state.lastResponse;
  }

  public updateSessionData(key: string, value: any): void {
    this.state.sessionData[key] = value;
    this.saveState();
  }

  public getSessionData(key: string): any {
    return this.state.sessionData[key];
  }

  public clearState(): void {
    this.state = {
      lastQuery: '',
      lastResponse: null,
      sessionData: {},
      timestamp: Date.now()
    };
    this.saveState();
    console.log('🗑️ State cleared');
  }

  public getState(): PersistedState {
    return { ...this.state };
  }
}


