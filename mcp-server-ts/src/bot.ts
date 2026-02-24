import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { GameState, WebSocketMessage, WebSocketResponse } from './types';

/**
 * Stardew Bot - Like rs-sdk but for Stardew Valley
 *
 * Usage:
 *   const bot = new Bot({ gameUrl: 'ws://localhost:8765/game' });
 *   bot.start();
 */
export class Bot extends EventEmitter {
  private ws: WebSocket | null = null;
  private gameUrl: string;
  private state: GameState | null = null;
  private connected: boolean = false;
  private responses: Map<string, (res: WebSocketResponse) => void> = new Map();
  private tools: StardewTools;
  private autoStart: boolean;
  private goal: string;
  private running: boolean = false;

  constructor(config: {
    gameUrl?: string;
    goal?: string;
    autoStart?: boolean;
  } = {}) {
    super();
    this.gameUrl = config.gameUrl || 'ws://localhost:8765/game';
    this.goal = config.goal || 'Manage the farm efficiently';
    this.autoStart = config.autoStart !== false;
    this.tools = new StardewToolsInternal(this);
  }

  async start(): Promise<void> {
    console.log(`[Bot] Connecting to ${this.gameUrl}...`);

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.gameUrl);

        this.ws.on('open', () => {
          console.log('[Bot] Connected to Stardew Valley!');
          this.connected = true;
          this.emit('connected');
          this.running = true;
          this.startKeepAlive();
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(data.toString());
        });

        this.ws.on('close', () => {
          console.log('[Bot] Disconnected from Stardew Valley');
          this.connected = false;
          this.running = false;
          this.emit('disconnected');
          this.scheduleReconnect();
        });

        this.ws.on('error', (error) => {
          console.error('[Bot] Error:', error.message);
          this.emit('error', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: string): void {
    try {
      const response: WebSocketResponse = JSON.parse(data);

      switch (response.type) {
        case 'state':
          this.state = response.data as GameState;
          this.emit('state', this.state);
          break;
        case 'response':
          if (response.id && this.responses.has(response.id)) {
            const resolver = this.responses.get(response.id);
            if (resolver) {
              this.responses.delete(response.id);
              resolver(response);
            }
          }
          this.emit('response', response);
          break;
        case 'error':
          console.error('[Bot] Game error:', response.message);
          this.emit('gameError', new Error(response.message));
          break;
      }
    } catch (error) {
      console.error('[Bot] Failed to parse message:', error);
    }
  }

  private startKeepAlive(): void {
    setInterval(() => {
      if (this.connected && this.ws) {
        this.send({ type: 'ping' });
      }
    }, 15000);
  }

  private scheduleReconnect(): void {
    if (!this.running) return;

    console.log('[Bot] Attempting to reconnect in 5 seconds...');
    setTimeout(async () => {
      try {
        await this.start();
      } catch (error) {
        console.error('[Bot] Reconnection failed:', error);
      }
    }, 5000);
  }

  private send(message: WebSocketMessage): void {
    if (this.ws && this.connected) {
      this.ws.send(JSON.stringify(message));
    }
  }

  async sendCommand(action: string, params: Record<string, any> = {}): Promise<WebSocketResponse> {
    if (!this.connected || !this.ws) {
      throw new Error('Not connected to game');
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message: WebSocketMessage = { id, type: 'command', action, params };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.responses.delete(id);
        reject(new Error('Command timeout'));
      }, 15000);

      this.responses.set(id, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });

      this.ws!.send(JSON.stringify(message));
    });
  }

  // Bot control methods
  stop(): void {
    this.running = false;
    if (this.ws) {
      this.ws.close();
    }
  }

  getState(): GameState | null {
    return this.state;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getTools(): StardewToolsInternal {
    return this.tools;
  }

  getGoal(): string {
    return this.goal;
  }
}

// Internal tools class
export class StardewToolsInternal {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  async getState(): Promise<GameState | null> {
    return this.bot.getState();
  }

  async getSurroundings(): Promise<any> {
    const response = await this.bot.sendCommand('get_surroundings');
    return response.data;
  }

  async moveTo(x: number, y: number): Promise<string> {
    const response = await this.bot.sendCommand('move_to', { x, y });
    return response.message || 'Moved';
  }

  async interact(): Promise<string> {
    const response = await this.bot.sendCommand('interact');
    return response.message || 'Interacted';
  }

  async useTool(): Promise<string> {
    const response = await this.bot.sendCommand('use_tool');
    return response.message || 'Tool used';
  }

  async switchTool(tool: string): Promise<string> {
    const response = await this.bot.sendCommand('switch_tool', { tool });
    return response.message || 'Tool switched';
  }

  async faceDirection(direction: number): Promise<string> {
    const response = await this.bot.sendCommand('face_direction', { direction });
    return response.message || 'Direction changed';
  }

  async selectItem(slot: number): Promise<string> {
    const response = await this.bot.sendCommand('select_item', { slot });
    return response.message || 'Item selected';
  }

  async eatItem(slot: number): Promise<string> {
    const response = await this.bot.sendCommand('eat_item', { slot });
    return response.message || 'Item eaten';
  }

  async enterDoor(): Promise<string> {
    const response = await this.bot.sendCommand('enter_door');
    return response.message || 'Door entered';
  }

  // Cheat commands
  async cheatModeEnable(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_mode_enable');
    return response.message || 'Cheat mode enabled';
  }

  async cheatWarp(location: string): Promise<string> {
    const response = await this.bot.sendCommand('cheat_warp', { location });
    return response.message || 'Warped';
  }

  async cheatSetMoney(amount: number): Promise<string> {
    const response = await this.bot.sendCommand('cheat_set_money', { amount });
    return response.message || 'Money set';
  }

  async cheatGrowCrops(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_grow_crops');
    return response.message || 'Crops grown';
  }

  async cheatHarvestAll(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_harvest_all');
    return response.message || 'Harvested';
  }

  async cheatClearDebris(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_clear_debris');
    return response.message || 'Debris cleared';
  }

  async cheatHoeAll(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_hoe_all');
    return response.message || 'All hoed';
  }
}

// Export GameClient for external use
export { GameClient } from './gameClient';
export { StardewTools } from './tools';
