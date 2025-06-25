const PartyMembership = () => {
    const party = {
      name: "Shadow Seekers",
      role: "DPS",
      joinedAt: "2025-06-20",
      isLeader: true,
    };
  
    return (
      <div className="mb-8 glass-morphism p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">🛡️ Party Membership</h2>
        <p><strong>Party Name:</strong> {party.name}</p>
        <p><strong>Role:</strong> {party.role}</p>
        <p><strong>Leader:</strong> {party.isLeader ? "Yes" : "No"}</p>
        <p><strong>Joined At:</strong> {party.joinedAt}</p>
      </div>
    );
  };
  
  export default PartyMembership;
  