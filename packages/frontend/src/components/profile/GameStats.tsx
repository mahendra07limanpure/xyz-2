const GameStats = () => {
    const stats = {
      dungeonsCleared: 18,
      totalLoot: 95,
      totalExperience: 14200,
      highestLevel: 15,
      gamesPlayed: 25,
    };
  
    return (
      <div className="mb-8 glass-morphism p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">📊 Game Stats</h2>
        <ul className="list-disc list-inside">
          <li>Dungeons Cleared: {stats.dungeonsCleared}</li>
          <li>Total Loot: {stats.totalLoot}</li>
          <li>Total Experience: {stats.totalExperience}</li>
          <li>Highest Level: {stats.highestLevel}</li>
          <li>Games Played: {stats.gamesPlayed}</li>
        </ul>
      </div>
    );
  };
  
  export default GameStats;
  