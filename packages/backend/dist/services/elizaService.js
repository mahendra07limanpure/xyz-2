"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elizaService = void 0;
exports.initializeEliza = initializeEliza;
const logger_1 = require("../utils/logger");
class ElizaService {
    constructor() {
        this.agents = new Map();
        this.initialized = false;
    }
    async initialize() {
        try {
            const defaultAgents = [
                {
                    id: 'merchant',
                    name: 'Grima the Merchant',
                    personality: 'Cunning and business-minded, always looking for a profitable deal',
                    specialties: ['equipment_trading', 'market_prices', 'rare_items']
                },
                {
                    id: 'sage',
                    name: 'Elder Thane',
                    personality: 'Wise and mysterious, speaks in riddles and ancient knowledge',
                    specialties: ['dungeon_lore', 'magic_advice', 'party_strategy']
                },
                {
                    id: 'blacksmith',
                    name: 'Thorin Ironforge',
                    personality: 'Gruff but skilled, takes pride in craftsmanship',
                    specialties: ['equipment_upgrading', 'weapon_advice', 'material_info']
                },
                {
                    id: 'guide',
                    name: 'Luna the Guide',
                    personality: 'Adventurous and encouraging, always ready to help newcomers',
                    specialties: ['beginner_tips', 'party_formation', 'dungeon_basics']
                }
            ];
            defaultAgents.forEach(agent => {
                this.agents.set(agent.id, agent);
            });
            this.initialized = true;
            logger_1.logger.info('ElizaOS service initialized with default agents');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize ElizaOS:', error);
            throw error;
        }
    }
    async generateResponse(agentId, message, context) {
        if (!this.initialized) {
            throw new Error('ElizaOS not initialized');
        }
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        return this.generatePlaceholderResponse(agent, message, context);
    }
    generatePlaceholderResponse(agent, message, context) {
        const responses = {
            merchant: [
                "Ah, a fellow entrepreneur! What treasures do you seek today?",
                "The market is favorable for those with keen eyes and sharp wits.",
                "I have just the thing for an adventurer of your caliber!"
            ],
            sage: [
                "The ancient texts speak of such matters... *strokes beard thoughtfully*",
                "Knowledge is the greatest treasure, young one.",
                "The path ahead is shrouded in mystery, but wisdom lights the way."
            ],
            blacksmith: [
                "*hammering stops* What brings you to my forge?",
                "A fine piece of equipment deserves proper care and respect.",
                "The metal speaks to those who know how to listen."
            ],
            guide: [
                "Welcome, brave adventurer! Ready for your next quest?",
                "Every great journey begins with a single step!",
                "The dungeons hold many secrets for those brave enough to explore."
            ]
        };
        const agentResponses = responses[agent.id] || [
            "I understand your question, traveler.",
            "Let me consider this matter carefully.",
            "An interesting proposition indeed."
        ];
        return agentResponses[Math.floor(Math.random() * agentResponses.length)];
    }
    getAvailableAgents() {
        return Array.from(this.agents.values());
    }
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
}
exports.elizaService = new ElizaService();
async function initializeEliza() {
    await exports.elizaService.initialize();
}
//# sourceMappingURL=elizaService.js.map