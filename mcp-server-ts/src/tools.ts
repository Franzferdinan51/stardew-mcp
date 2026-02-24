import { GameClient } from './gameClient';
import { GameState } from './types';

export class StardewTools {
  private gameClient: GameClient;

  constructor(gameClient: GameClient) {
    this.gameClient = gameClient;
  }

  // Core Game Tools

  async getState(): Promise<GameState | null> {
    return this.gameClient.getState();
  }

  async getSurroundings(): Promise<any> {
    const response = await this.gameClient.sendCommand('get_surroundings');
    return response.data;
  }

  async moveTo(x: number, y: number): Promise<string> {
    const response = await this.gameClient.sendCommand('move_to', { x, y });
    return response.message || 'Moved';
  }

  async interact(): Promise<string> {
    const response = await this.gameClient.sendCommand('interact');
    return response.message || 'Interacted';
  }

  async useTool(): Promise<string> {
    const response = await this.gameClient.sendCommand('use_tool');
    return response.message || 'Tool used';
  }

  async useToolRepeat(count: number, direction: number = 0): Promise<string> {
    const response = await this.gameClient.sendCommand('use_tool_repeat', { count, direction });
    return response.message || 'Tools used';
  }

  async faceDirection(direction: number): Promise<string> {
    const response = await this.gameClient.sendCommand('face_direction', { direction });
    return response.message || 'Direction changed';
  }

  async selectItem(slot: number): Promise<string> {
    const response = await this.gameClient.sendCommand('select_item', { slot });
    return response.message || 'Item selected';
  }

  async switchTool(tool: string): Promise<string> {
    const response = await this.gameClient.sendCommand('switch_tool', { tool });
    return response.message || 'Tool switched';
  }

  async eatItem(slot: number): Promise<string> {
    const response = await this.gameClient.sendCommand('eat_item', { slot });
    return response.message || 'Item eaten';
  }

  async enterDoor(): Promise<string> {
    const response = await this.gameClient.sendCommand('enter_door');
    return response.message || 'Door entered';
  }

  async findBestTarget(type: string): Promise<string> {
    const response = await this.gameClient.sendCommand('find_best_target', { type });
    return response.message || 'Target found';
  }

  async clearTarget(): Promise<string> {
    const response = await this.gameClient.sendCommand('clear_target');
    return response.message || 'Target cleared';
  }

  // Additional Game Commands

  async stop(): Promise<string> {
    const response = await this.gameClient.sendCommand('stop');
    return response.message || 'Stopped';
  }

  async holdTool(enable: boolean): Promise<string> {
    const response = await this.gameClient.sendCommand('hold_tool', { enable });
    return response.message || 'Tool hold toggled';
  }

  async placeItem(x: number, y: number): Promise<string> {
    const response = await this.gameClient.sendCommand('place_item', { x, y });
    return response.message || 'Item placed';
  }

  async trashItem(slot: number): Promise<string> {
    const response = await this.gameClient.sendCommand('trash_item', { slot });
    return response.message || 'Item trashed';
  }

  async shipItem(itemId: string, count: number = 1): Promise<string> {
    const response = await this.gameClient.sendCommand('ship_item', { itemId, count });
    return response.message || 'Item shipped';
  }

  async castFishingRod(): Promise<string> {
    const response = await this.gameClient.sendCommand('cast_fishing_rod');
    return response.message || 'Fishing rod cast';
  }

  async reelFish(): Promise<string> {
    const response = await this.gameClient.sendCommand('reel_fish');
    return response.message || 'Fishing reeled';
  }

  async openShopMenu(shopId: string): Promise<string> {
    const response = await this.gameClient.sendCommand('open_shop_menu', { shopId });
    return response.message || 'Shop opened';
  }

  async buyItem(itemId: string, count: number = 1): Promise<string> {
    const response = await this.gameClient.sendCommand('buy_item', { itemId, count });
    return response.message || 'Item bought';
  }

  async sellItem(itemId: string, count: number = 1): Promise<string> {
    const response = await this.gameClient.sendCommand('sell_item', { itemId, count });
    return response.message || 'Item sold';
  }

  async giveGift(npc: string, itemId: string): Promise<string> {
    const response = await this.gameClient.sendCommand('give_gift', { npc, itemId });
    return response.message || 'Gift given';
  }

  async checkMail(mailId?: string): Promise<string> {
    const response = await this.gameClient.sendCommand('check_mail', { mailId });
    return response.message || 'Mail checked';
  }

  async craftItem(recipeName: string, count: number = 1): Promise<string> {
    const response = await this.gameClient.sendCommand('craft_item', { recipeName, count });
    return response.message || 'Item crafted';
  }

  async warpToLocation(location: string, x?: number, y?: number): Promise<string> {
    const response = await this.gameClient.sendCommand('warp_to_location', { location, x, y });
    return response.message || 'Warped';
  }

  async attack(): Promise<string> {
    const response = await this.gameClient.sendCommand('attack');
    return response.message || 'Attacked';
  }

  async equipWeapon(weaponId: string): Promise<string> {
    const response = await this.gameClient.sendCommand('equip_weapon', { weaponId });
    return response.message || 'Weapon equipped';
  }

  async petAnimal(x: number, y: number): Promise<string> {
    const response = await this.gameClient.sendCommand('pet_animal', { x, y });
    return response.message || 'Animal petted';
  }

  async milkAnimal(x: number, y: number): Promise<string> {
    const response = await this.gameClient.sendCommand('milk_animal', { x, y });
    return response.message || 'Animal milked';
  }

  async shearAnimal(x: number, y: number): Promise<string> {
    const response = await this.gameClient.sendCommand('shear_animal', { x, y });
    return response.message || 'Animal sheared';
  }

  async collectProduct(x: number, y: number): Promise<string> {
    const response = await this.gameClient.sendCommand('collect_product', { x, y });
    return response.message || 'Product collected';
  }

  async useBomb(x: number, y: number): Promise<string> {
    const response = await this.gameClient.sendCommand('use_bomb', { x, y });
    return response.message || 'Bomb used';
  }

  // Cheat Mode Tools

  async cheatModeEnable(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_mode_enable');
    return response.message || 'Cheat mode enabled';
  }

  async cheatModeDisable(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_mode_disable');
    return response.message || 'Cheat mode disabled';
  }

  async cheatTimeFreeze(freeze: boolean): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_time_freeze', { freeze });
    return response.message || 'Time freeze toggled';
  }

  async cheatInfiniteEnergy(enable: boolean): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_infinite_energy', { enable });
    return response.message || 'Infinite energy toggled';
  }

  async cheatWarp(location: string): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_warp', { location });
    return response.message || 'Warped';
  }

  async cheatMineWarp(level: number): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_mine_warp', { level });
    return response.message || 'Warped to mine';
  }

  async cheatClearDebris(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_clear_debris');
    return response.message || 'Debris cleared';
  }

  async cheatCutTrees(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_cut_trees');
    return response.message || 'Trees cut';
  }

  async cheatMineRocks(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_mine_rocks');
    return response.message || 'Rocks mined';
  }

  async cheatHoeAll(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_hoe_all');
    return response.message || 'All tiles hoed';
  }

  async cheatWaterAll(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_water_all');
    return response.message || 'All crops watered';
  }

  async cheatPlantSeeds(season: string, seedId?: string): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_plant_seeds', { season, seedId });
    return response.message || 'Seeds planted';
  }

  async cheatFertilizeAll(type: string): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_fertilize_all', { type });
    return response.message || 'Fertilizer applied';
  }

  async cheatGrowCrops(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_grow_crops');
    return response.message || 'Crops grown';
  }

  async cheatHarvestAll(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_harvest_all');
    return response.message || 'Crops harvested';
  }

  async cheatDigArtifacts(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_dig_artifacts');
    return response.message || 'Artifacts dug';
  }

  async cheatSetMoney(amount: number): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_set_money', { amount });
    return response.message || 'Money set';
  }

  async cheatAddItem(id: string, count: number = 1): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_add_item', { id, count });
    return response.message || 'Item added';
  }

  async cheatSpawnOres(type: string): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_spawn_ores', { type });
    return response.message || 'Ores spawned';
  }

  async cheatSetFriendship(npc: string, points: number): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_set_friendship', { npc, points });
    return response.message || 'Friendship set';
  }

  async cheatMaxAllFriendships(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_max_all_friendships');
    return response.message || 'All friendships maxed';
  }

  async cheatGiveGift(npc: string, itemId: string): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_give_gift', { npc, itemId });
    return response.message || 'Gift given';
  }

  async cheatUpgradeBackpack(level: number): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_upgrade_backpack', { level });
    return response.message || 'Backpack upgraded';
  }

  async cheatUpgradeTool(tool: string, level: number): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_upgrade_tool', { tool, level });
    return response.message || 'Tool upgraded';
  }

  async cheatUpgradeAllTools(level: number): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_upgrade_all_tools', { level });
    return response.message || 'All tools upgraded';
  }

  async cheatUnlockAll(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_unlock_all');
    return response.message || 'Everything unlocked';
  }

  // Additional Cheat Commands

  async cheatSetEnergy(amount: number): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_set_energy', { amount });
    return response.message || 'Energy set';
  }

  async cheatSetHealth(amount: number): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_set_health', { amount });
    return response.message || 'Health set';
  }

  async cheatAddExperience(skill: string, amount: number): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_add_experience', { skill, amount });
    return response.message || 'Experience added';
  }

  async cheatCollectAllForage(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_collect_all_forage');
    return response.message || 'All forage collected';
  }

  async cheatInstantMine(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_instant_mine');
    return response.message || 'Instant mine enabled';
  }

  async cheatTimeSet(time: number): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_time_set', { time });
    return response.message || 'Time set';
  }

  async cheatUnlockRecipes(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_unlock_recipes');
    return response.message || 'Recipes unlocked';
  }

  async cheatPetAllAnimals(): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_pet_all_animals');
    return response.message || 'All animals petted';
  }

  async cheatCompleteQuest(questId: string): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_complete_quest', { questId });
    return response.message || 'Quest completed';
  }

  async cheatSetSeason(season: string): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_set_season', { season });
    return response.message || 'Season set';
  }

  async cheatHoeTiles(pattern: string): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_hoe_tiles', { pattern });
    return response.message || 'Tiles hoed';
  }

  async cheatClearTiles(pattern: string): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_clear_tiles', { pattern });
    return response.message || 'Tiles cleared';
  }

  async cheatTillPattern(pattern: string): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_till_pattern', { pattern });
    return response.message || 'Pattern tilled';
  }

  async cheatHoeCustomPattern(grid: string): Promise<string> {
    const response = await this.gameClient.sendCommand('cheat_hoe_custom_pattern', { grid });
    return response.message || 'Custom pattern hoed';
  }

  // Get all tools as object for rs-sdk
  getToolsObject() {
    return {
      // Core state
      get_state: () => this.getState(),
      get_surroundings: () => this.getSurroundings(),

      // Movement & Actions
      move_to: (params: { x: number; y: number }) => this.moveTo(params.x, params.y),
      stop: () => this.stop(),
      interact: () => this.interact(),
      face_direction: (params: { direction: number }) => this.faceDirection(params.direction),

      // Tools
      use_tool: () => this.useTool(),
      use_tool_repeat: (params: { count: number; direction?: number }) =>
        this.useToolRepeat(params.count, params.direction || 0),
      hold_tool: (params: { enable: boolean }) => this.holdTool(params.enable),
      switch_tool: (params: { tool: string }) => this.switchTool(params.tool),

      // Inventory
      select_item: (params: { slot: number }) => this.selectItem(params.slot),
      place_item: (params: { x: number; y: number }) => this.placeItem(params.x, params.y),
      eat_item: (params: { slot: number }) => this.eatItem(params.slot),
      trash_item: (params: { slot: number }) => this.trashItem(params.slot),
      ship_item: (params: { itemId: string; count?: number }) => this.shipItem(params.itemId, params.count || 1),

      // Fishing
      cast_fishing_rod: () => this.castFishingRod(),
      reel_fish: () => this.reelFish(),

      // Shopping
      open_shop_menu: (params: { shopId: string }) => this.openShopMenu(params.shopId),
      buy_item: (params: { itemId: string; count?: number }) => this.buyItem(params.itemId, params.count || 1),
      sell_item: (params: { itemId: string; count?: number }) => this.sellItem(params.itemId, params.count || 1),

      // Social
      give_gift: (params: { npc: string; itemId: string }) => this.giveGift(params.npc, params.itemId),
      check_mail: (params: { mailId?: string }) => this.checkMail(params.mailId),

      // Crafting
      craft_item: (params: { recipeName: string; count?: number }) => this.craftItem(params.recipeName, params.count || 1),

      // Navigation
      warp_to_location: (params: { location: string; x?: number; y?: number }) =>
        this.warpToLocation(params.location, params.x, params.y),
      enter_door: () => this.enterDoor(),

      // Combat
      attack: () => this.attack(),
      equip_weapon: (params: { weaponId: string }) => this.equipWeapon(params.weaponId),

      // Animals
      pet_animal: (params: { x: number; y: number }) => this.petAnimal(params.x, params.y),
      milk_animal: (params: { x: number; y: number }) => this.milkAnimal(params.x, params.y),
      shear_animal: (params: { x: number; y: number }) => this.shearAnimal(params.x, params.y),
      collect_product: (params: { x: number; y: number }) => this.collectProduct(params.x, params.y),

      // Mining
      use_bomb: (params: { x: number; y: number }) => this.useBomb(params.x, params.y),

      // Targeting
      find_best_target: (params: { type: string }) => this.findBestTarget(params.type),
      clear_target: () => this.clearTarget(),

      // Cheat Mode Control
      cheat_mode_enable: () => this.cheatModeEnable(),
      cheat_mode_disable: () => this.cheatModeDisable(),
      cheat_time_freeze: (params: { freeze: boolean }) => this.cheatTimeFreeze(params.freeze),
      cheat_infinite_energy: (params: { enable: boolean }) => this.cheatInfiniteEnergy(params.enable),

      // Cheat Teleportation
      cheat_warp: (params: { location: string }) => this.cheatWarp(params.location),
      cheat_mine_warp: (params: { level: number }) => this.cheatMineWarp(params.level),

      // Cheat Farming
      cheat_clear_debris: () => this.cheatClearDebris(),
      cheat_cut_trees: () => this.cheatCutTrees(),
      cheat_mine_rocks: () => this.cheatMineRocks(),
      cheat_hoe_all: () => this.cheatHoeAll(),
      cheat_water_all: () => this.cheatWaterAll(),
      cheat_plant_seeds: (params: { season: string; seedId?: string }) =>
        this.cheatPlantSeeds(params.season, params.seedId),
      cheat_fertilize_all: (params: { type: string }) => this.cheatFertilizeAll(params.type),
      cheat_grow_crops: () => this.cheatGrowCrops(),
      cheat_harvest_all: () => this.cheatHarvestAll(),
      cheat_dig_artifacts: () => this.cheatDigArtifacts(),

      // Cheat Resources
      cheat_set_money: (params: { amount: number }) => this.cheatSetMoney(params.amount),
      cheat_add_item: (params: { id: string; count?: number }) =>
        this.cheatAddItem(params.id, params.count || 1),
      cheat_spawn_ores: (params: { type: string }) => this.cheatSpawnOres(params.type),
      cheat_set_energy: (params: { amount: number }) => this.cheatSetEnergy(params.amount),
      cheat_set_health: (params: { amount: number }) => this.cheatSetHealth(params.amount),
      cheat_add_experience: (params: { skill: string; amount: number }) =>
        this.cheatAddExperience(params.skill, params.amount),
      cheat_collect_all_forage: () => this.cheatCollectAllForage(),
      cheat_instant_mine: () => this.cheatInstantMine(),

      // Cheat Time & Season
      cheat_time_set: (params: { time: number }) => this.cheatTimeSet(params.time),
      cheat_set_season: (params: { season: string }) => this.cheatSetSeason(params.season),

      // Cheat Social
      cheat_set_friendship: (params: { npc: string; points: number }) =>
        this.cheatSetFriendship(params.npc, params.points),
      cheat_max_all_friendships: () => this.cheatMaxAllFriendships(),
      cheat_give_gift: (params: { npc: string; item_id: string }) =>
        this.cheatGiveGift(params.npc, params.item_id),

      // Cheat Upgrades
      cheat_upgrade_backpack: (params: { level: number }) => this.cheatUpgradeBackpack(params.level),
      cheat_upgrade_tool: (params: { tool: string; level: number }) =>
        this.cheatUpgradeTool(params.tool, params.level),
      cheat_upgrade_all_tools: (params: { level: number }) => this.cheatUpgradeAllTools(params.level),
      cheat_unlock_all: () => this.cheatUnlockAll(),

      // Cheat Recipes & Progression
      cheat_unlock_recipes: () => this.cheatUnlockRecipes(),

      // Cheat Animals
      cheat_pet_all_animals: () => this.cheatPetAllAnimals(),

      // Cheat Quests
      cheat_complete_quest: (params: { questId: string }) => this.cheatCompleteQuest(params.questId),

      // Cheat Pattern Drawing
      cheat_hoe_tiles: (params: { pattern: string }) => this.cheatHoeTiles(params.pattern),
      cheat_clear_tiles: (params: { pattern: string }) => this.cheatClearTiles(params.pattern),
      cheat_till_pattern: (params: { pattern: string }) => this.cheatTillPattern(params.pattern),
      cheat_hoe_custom_pattern: (params: { grid: string }) => this.cheatHoeCustomPattern(params.grid),
    };
  }
}
