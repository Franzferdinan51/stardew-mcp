/**
 * Stardew MCP Bot Creator
 *
 * Usage:
 *   npm run create-bot -- <botname>
 *
 * Creates a new bot with:
 *   - bots/<botname>/bot.ts - Main bot file
 *   - bots/<botname>/bot.env - Configuration
 */

import * as fs from 'fs';
import * as path from 'path';

const botName = process.argv[2];

if (!botName) {
  console.log('Usage: npm run create-bot -- <botname>');
  console.log('Example: npm run create-bot -- my-farmer');
  process.exit(1);
}

const botsDir = path.join(__dirname, '..', 'bots');
const botDir = path.join(botsDir, botName);

// Create bots directory
if (!fs.existsSync(botsDir)) {
  fs.mkdirSync(botsDir, { recursive: true });
}

// Create bot directory
if (fs.existsSync(botDir)) {
  console.error(`Bot "${botName}" already exists!`);
  process.exit(1);
}

fs.mkdirSync(botDir, { recursive: true });

// Create bot.ts
const botCode = `import { Bot, GameClient, StardewTools } from '../../src';

// Bot configuration
const config = {
  // Game connection
  gameUrl: 'ws://localhost:8765/game',

  // Agent settings
  goal: 'Setup and manage the farm efficiently using available tools',
  autoStart: true,
};

// Initialize bot
const bot = new Bot(config);

// Bot logic
async function loop() {
  const state = bot.getState();
  if (!state) return;

  // Your AI logic here!
  // Examples:

  // 1. Check energy and eat if needed
  if (state.player.energy < 50) {
    // Find food in inventory and eat
    console.log('Low energy, finding food...');
  }

  // 2. Check time
  if (state.time.timeOfDay > 2200) {
    console.log('Getting late, heading home...');
    // Go to bed
  }

  // 3. Farm tasks
  console.log(\`Location: \${state.player.location}\`);
  console.log(\`Money: \${state.player.money}\`);
  console.log(\`Energy: \${state.player.energy}/\${state.player.maxEnergy}\`);
}

// Run the bot
bot.start().then(() => {
  console.log('Bot started!');

  // Main loop
  setInterval(loop, 5000);
}).catch(err => {
  console.error('Failed to start bot:', err);
  process.exit(1);
});
`;

// Create bot.ts
fs.writeFileSync(path.join(botDir, 'bot.ts'), botCode);

// Create bot.env
const envContent = `# Bot Configuration
# Game connection
GAME_URL=ws://localhost:8765/game

# Agent settings
GOAL=Setup and manage the farm efficiently
AUTO_START=true

# Gateway (leave empty for local, or set to rs-sdk server)
SERVER=

# Claude settings
CLAUDE_API_KEY=
`;

// Create bot.env
fs.writeFileSync(path.join(botDir, 'bot.env'), envContent);

// Create README
const readme = `# ${botName}

Stardew Valley bot created with stardew-mcp.

## Running

\`\`\`bash
# Development mode (auto-restart on changes)
npm run dev -- bots/${botName}/bot.ts

# Or build and run
npm run build
node bots/${botName}/bot.js
\`\`\`

## Configuration

Edit \`bot.env\` to configure:
- GAME_URL - WebSocket URL to Stardew MCP server
- GOAL - What the bot should do
- SERVER - Gateway server (optional)

## Adding AI

This is your Stardew bot! Add AI logic to make it play automatically.

### Simple Example:
\`\`\`typescript
const state = bot.getState();
if (state.player.location === 'Farm') {
  // Do farm things
}
\`\`\`

### With Claude:
\`\`\`typescript
// Use Claude API to make decisions
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: \`Farm data: \${JSON.stringify(state)}\`
    }]
  })
});
\`\`\`
`;

// Create README.md
fs.writeFileSync(path.join(botDir, 'README.md'), readme);

console.log(`
Bot "${botName}" created successfully!

Files created:
  - bots/${botName}/bot.ts    - Main bot code
  - bots/${botName}/bot.env   - Configuration
  - bots/${botName}/README.md - Documentation

Next steps:
  1. cd bots/${botName}
  2. Edit bot.ts to add your AI logic
  3. Run: npm run dev -- bots/${botName}/bot.ts

Have fun farming! 🦞
`);
