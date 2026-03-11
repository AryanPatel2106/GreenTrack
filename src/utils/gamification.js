export const LEVEL_CONFIG = {
    BASE_XP: 100, // XP needed for first level
    MULTIPLIER: 1 // Next levels need: level * 100
};
export const BADGES = {
    FIRST_SPROUT: { id: 'first_sprout', name: 'First Sprout', icon: '🌱', description: 'Planted your first tree' },
    TREE_GUARDIAN: { id: 'tree_guardian', name: 'Tree Guardian', icon: '🌳', description: 'Verified 10 updates' },
    TOP_PERFORMER: { id: 'top_performer', name: 'Top Performer', icon: '🏆', description: 'Reached top 10% of leaderboard' }
};
export const POINTS = {
    REGISTER_TREE: 20,
    CREATE_POST: 5,
    VERIFIED_POST: 10,
    LIKE_RECEIVED: 1
};
export const awardPoints = async (userId, amount, context = {}) => {
    console.warn("awardPoints is now handled by the backend server.");
};
export const checkCommunityLeader = async (userId) => {
    console.warn("checkCommunityLeader is now handled by the backend server.");
};
