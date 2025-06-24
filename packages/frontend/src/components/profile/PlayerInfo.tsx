const PlayerInfo = () => {
    const data = {
      username: "Talha",
      wallet: "0x1234...abcd",
      level: 12,
      experience: 4200,
    };
  
    return (
      <div className="mb-8 glass-morphism p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">👤 Player Info</h2>
        <p><strong>Username:</strong> {data.username}</p>
        <p><strong>Wallet:</strong> {data.wallet}</p>
        <p><strong>Level:</strong> {data.level}</p>
        <p><strong>Experience:</strong> {data.experience}</p>
      </div>
    );
  };
  
  export default PlayerInfo;
  