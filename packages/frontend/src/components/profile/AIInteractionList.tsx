const AIInteractionList = () => {
    const logs = [
      {
        npcName: "Zorak the Wise",
        interaction: "dialogue",
        response: "The dungeon ahead holds ancient secrets.",
      },
      {
        npcName: "Nyra the Trader",
        interaction: "trade",
        response: "I’ll give you 20 gold for that shield.",
      },
    ];
  
    return (
      <div className="mb-8 glass-morphism p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">🤖 AI Interactions</h2>
        <ul className="space-y-3">
          {logs.map((log, idx) => (
            <li key={idx}>
              <p><strong>{log.npcName}</strong> ({log.interaction})</p>
              <p className="text-gray-300 italic">“{log.response}”</p>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default AIInteractionList;
  