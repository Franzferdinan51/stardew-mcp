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
  private tools: StardewToolsInternal;
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

  // Core State
  async getState(): Promise<GameState | null> {
    return this.bot.getState();
  }

  async getSurroundings(): Promise<any> {
    const response = await this.bot.sendCommand('get_surroundings');
    return response.data;
  }

  // Movement & Actions
  async moveTo(x: number, y: number): Promise<string> {
    const response = await this.bot.sendCommand('move_to', { x, y });
    return response.message || 'Moved';
  }

  async stop(): Promise<string> {
    const response = await this.bot.sendCommand('stop');
    return response.message || 'Stopped';
  }

  async interact(): Promise<string> {
    const response = await this.bot.sendCommand('interact');
    return response.message || 'Interacted';
  }

  async faceDirection(direction: number): Promise<string> {
    const response = await this.bot.sendCommand('face_direction', { direction });
    return response.message || 'Direction changed';
  }

  // Tools
  async useTool(): Promise<string> {
    const response = await this.bot.sendCommand('use_tool');
    return response.message || 'Tool used';
  }

  async useToolRepeat(count: number, direction: number = 0): Promise<string> {
    const response = await this.bot.sendCommand('use_tool_repeat', { count, direction });
    return response.message || 'Tools used';
  }

  async holdTool(enable: boolean): Promise<string> {
    const response = await this.bot.sendCommand('hold_tool', { enable });
    return response.message || 'Tool hold toggled';
  }

  async switchTool(tool: string): Promise<string> {
    const response = await this.bot.sendCommand('switch_tool', { tool });
    return response.message || 'Tool switched';
  }

  // Inventory
  async selectItem(slot: number): Promise<string> {
    const response = await this.bot.sendCommand('select_item', { slot });
    return response.message || 'Item selected';
  }

  async placeItem(x: number, y: number): Promise<string> {
    const response = await this.bot.sendCommand('place_item', { x, y });
    return response.message || 'Item placed';
  }

  async eatItem(slot: number): Promise<string> {
    const response = await this.bot.sendCommand('eat_item', { slot });
    return response.message || 'Item eaten';
  }

  async trashItem(slot: number): Promise<string> {
    const response = await this.bot.sendCommand('trash_item', { slot });
    return response.message || 'Item trashed';
  }

  async shipItem(itemId: string, count: number = 1): Promise<string> {
    const response = await this.bot.sendCommand('ship_item', { itemId, count });
    return response.message || 'Item shipped';
  }

  // Fishing
  async castFishingRod(): Promise<string> {
    const response = await this.bot.sendCommand('cast_fishing_rod');
    return response.message || 'Fishing rod cast';
  }

  async reelFish(): Promise<string> {
    const response = await this.bot.sendCommand('reel_fish');
    return response.message || 'Fishing reeled';
  }

  // Shopping
  async openShopMenu(shopId: string): Promise<string> {
    const response = await this.bot.sendCommand('open_shop_menu', { shopId });
    return response.message || 'Shop opened';
  }

  async buyItem(itemId: string, count: number = 1): Promise<string> {
    const response = await this.bot.sendCommand('buy_item', { itemId, count });
    return response.message || 'Item bought';
  }

  async sellItem(itemId: string, count: number = 1): Promise<string> {
    const response = await this.bot.sendCommand('sell_item', { itemId, count });
    return response.message || 'Item sold';
  }

  // Social
  async giveGift(npc: string, itemId: string): Promise<string> {
    const response = await this.bot.sendCommand('give_gift', { npc, itemId });
    return response.message || 'Gift given';
  }

  async checkMail(mailId?: string): Promise<string> {
    const response = await this.bot.sendCommand('check_mail', { mailId });
    return response.message || 'Mail checked';
  }

  // Crafting
  async craftItem(recipeName: string, count: number = 1): Promise<string> {
    const response = await this.bot.sendCommand('craft_item', { recipeName, count });
    return response.message || 'Item crafted';
  }

  // Navigation
  async warpToLocation(location: string, x?: number, y?: number): Promise<string> {
    const response = await this.bot.sendCommand('warp_to_location', { location, x, y });
    return response.message || 'Warped';
  }

  async enterDoor(): Promise<string> {
    const response = await this.bot.sendCommand('enter_door');
    return response.message || 'Door entered';
  }

  // Combat
  async attack(): Promise<string> {
    const response = await this.bot.sendCommand('attack');
    return response.message || 'Attacked';
  }

  async equipWeapon(weaponId: string): Promise<string> {
    const response = await this.bot.sendCommand('equip_weapon', { weaponId });
    return response.message || 'Weapon equipped';
  }

  // Animals
  async petAnimal(x: number, y: number): Promise<string> {
    const response = await this.bot.sendCommand('pet_animal', { x, y });
    return response.message || 'Animal petted';
  }

  async milkAnimal(x: number, y: number): Promise<string> {
    const response = await this.bot.sendCommand('milk_animal', { x, y });
    return response.message || 'Animal milked';
  }

  async shearAnimal(x: number, y: number): Promise<string> {
    const response = await this.bot.sendCommand('shear_animal', { x, y });
    return response.message || 'Animal sheared';
  }

  async collectProduct(x: number, y: number): Promise<string> {
    const response = await this.bot.sendCommand('collect_product', { x, y });
    return response.message || 'Product collected';
  }

  // Mining
  async useBomb(x: number, y: number): Promise<string> {
    const response = await this.bot.sendCommand('use_bomb', { x, y });
    return response.message || 'Bomb used';
  }

  // Targeting
  async findBestTarget(type: string): Promise<string> {
    const response = await this.bot.sendCommand('find_best_target', { type });
    return response.message || 'Target found';
  }

  async clearTarget(): Promise<string> {
    const response = await this.bot.sendCommand('clear_target');
    return response.message || 'Target cleared';
  }

  // Cheat Mode Control
  async cheatModeEnable(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_mode_enable');
    return response.message || 'Cheat mode enabled';
  }

  async cheatModeDisable(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_mode_disable');
    return response.message || 'Cheat mode disabled';
  }

  async cheatTimeFreeze(freeze: boolean): Promise<string> {
    const response = await this.bot.sendCommand('cheat_time_freeze', { freeze });
    return response.message || 'Time freeze toggled';
  }

  async cheatInfiniteEnergy(enable: boolean): Promise<string> {
    const response = await this.bot.sendCommand('cheat_infinite_energy', { enable });
    return response.message || 'Infinite energy toggled';
  }

  // Cheat Teleportation
  async cheatWarp(location: string): Promise<string> {
    const response = await this.bot.sendCommand('cheat_warp', { location });
    return response.message || 'Warped';
  }

  async cheatMineWarp(level: number): Promise<string> {
    const response = await this.bot.sendCommand('cheat_mine_warp', { level });
    return response.message || 'Warped to mine';
  }

  // Cheat Farming
  async cheatClearDebris(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_clear_debris');
    return response.message || 'Debris cleared';
  }

  async cheatCutTrees(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_cut_trees');
    return response.message || 'Trees cut';
  }

  async cheatMineRocks(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_mine_rocks');
    return response.message || 'Rocks mined';
  }

  async cheatHoeAll(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_hoe_all');
    return response.message || 'All tiles hoed';
  }

  async cheatWaterAll(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_water_all');
    return response.message || 'All crops watered';
  }

  async cheatPlantSeeds(season: string, seedId?: string): Promise<string> {
    const response = await this.bot.sendCommand('cheat_plant_seeds', { season, seedId });
    return response.message || 'Seeds planted';
  }

  async cheatFertilizeAll(type: string): Promise<string> {
    const response = await this.bot.sendCommand('cheat_fertilize_all', { type });
    return response.message || 'Fertilizer applied';
  }

  async cheatGrowCrops(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_grow_crops');
    return response.message || 'Crops grown';
  }

  async cheatHarvestAll(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_harvest_all');
    return response.message || 'Crops harvested';
  }

  async cheatDigArtifacts(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_dig_artifacts');
    return response.message || 'Artifacts dug';
  }

  // Cheat Resources
  async cheatSetMoney(amount: number): Promise<string> {
    const response = await this.bot.sendCommand('cheat_set_money', { amount });
    return response.message || 'Money set';
  }

  async cheatAddItem(id: string, count: number = 1): Promise<string> {
    const response = await this.bot.sendCommand('cheat_add_item', { id, count });
    return response.message || 'Item added';
  }

  async cheatSpawnOres(type: string): Promise<string> {
    const response = await this.bot.sendCommand('cheat_spawn_ores', { type });
    return response.message || 'Ores spawned';
  }

  async cheatSetEnergy(amount: number): Promise<string> {
    const response = await this.bot.sendCommand('cheat_set_energy', { amount });
    return response.message || 'Energy set';
  }

  async cheatSetHealth(amount: number): Promise<string> {
    const response = await this.bot.sendCommand('cheat_set_health', { amount });
    return response.message || 'Health set';
  }

  async cheatAddExperience(skill: string, amount: number): Promise<string> {
    const response = await this.bot.sendCommand('cheat_add_experience', { skill, amount });
    return response.message || 'Experience added';
  }

  async cheatCollectAllForage(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_collect_all_forage');
    return response.message || 'All forage collected';
  }

  async cheatInstantMine(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_instant_mine');
    return response.message || 'Instant mine enabled';
  }

  // Cheat Time & Season
  async cheatTimeSet(time: number): Promise<string> {
    const response = await this.bot.sendCommand('cheat_time_set', { time });
    return response.message || 'Time set';
  }

  async cheatSetSeason(season: string): Promise<string> {
    const response = await this.bot.sendCommand('cheat_set_season', { season });
    return response.message || 'Season set';
  }

  // Cheat Social
  async cheatSetFriendship(npc: string, points: number): Promise<string> {
    const response = await this.bot.sendCommand('cheat_set_friendship', { npc, points });
    return response.message || 'Friendship set';
  }

  async cheatMaxAllFriendships(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_max_all_friendships');
    return response.message || 'All friendships maxed';
  }

  async cheatGiveGift(npc: string, itemId: string): Promise<string> {
    const response = await this.bot.sendCommand('cheat_give_gift', { npc, itemId });
    return response.message || 'Gift given';
  }

  // Cheat Upgrades
  async cheatUpgradeBackpack(level: number): Promise<string> {
    const response = await this.bot.sendCommand('cheat_upgrade_backpack', { level });
    return response.message || 'Backpack upgraded';
  }

  async cheatUpgradeTool(tool: string, level: number): Promise<string> {
    const response = await this.bot.sendCommand('cheat_upgrade_tool', { tool, level });
    return response.message || 'Tool upgraded';
  }

  async cheatUpgradeAllTools(level: number): Promise<string> {
    const response = await this.bot.sendCommand('cheat_upgrade_all_tools', { level });
    return response.message || 'All tools upgraded';
  }

  async cheatUnlockAll(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_unlock_all');
    return response.message || 'Everything unlocked';
  }

  // Cheat Recipes & Progression
  async cheatUnlockRecipes(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_unlock_recipes');
    return response.message || 'Recipes unlocked';
  }

  // Cheat Animals
  async cheatPetAllAnimals(): Promise<string> {
    const response = await this.bot.sendCommand('cheat_pet_all_animals');
    return response.message || 'All animals petted';
  }

  // Cheat Quests
  async cheatCompleteQuest(questId: string): Promise<string> {
    const response = await this.bot.sendCommand('cheat_complete_quest', { questId });
    return response.message || 'Quest completed';
  }

  // Cheat Pattern Drawing
  async cheatHoeTiles(pattern: string): Promise<string> {
    const response = await this.bot.sendCommand('cheat_hoe_tiles', { pattern });
    return response.message || 'Tiles hoed';
  }

  async cheatClearTiles(pattern: string): Promise<string> {
    const response = await this.bot.sendCommand('cheat_clear_tiles', { pattern });
    return response.message || 'Tiles cleared';
  }

  async cheatTillPattern(pattern: string): Promise<string> {
    const response = await this.bot.sendCommand('cheat_till_pattern', { pattern });
    return response.message || 'Pattern tilled';
  }

  async cheatHoeCustomPattern(grid: string): Promise<string> {
    const response = await this.bot.sendCommand('cheat_hoe_custom_pattern', { grid });
    return response.message || 'Custom pattern hoed';
  }
}

// Export GameClient for external use
export { GameClient } from './gameClient';
export { StardewTools } from './tools';
