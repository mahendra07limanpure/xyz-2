const EquipmentList = () => {
    const equipment = [
      {
        name: "Flame Sword",
        rarity: "Epic",
        type: "Weapon",
        attackPower: 30,
        defensePower: 5,
        isLendable: true,
      },
      {
        name: "Mystic Cloak",
        rarity: "Rare",
        type: "Armor",
        attackPower: 0,
        defensePower: 25,
        isLendable: false,
      },
    ];
  
    return (
      <div className="mb-8 glass-morphism p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">🛡️ Equipment</h2>
        <ul className="space-y-2">
          {equipment.map((item, idx) => (
            <li key={idx} className="border-b border-gray-700 pb-2">
              <strong>{item.name}</strong> ({item.rarity}) - {item.type}<br />
              ⚔️ {item.attackPower} | 🛡️ {item.defensePower} | {item.isLendable ? "Lendable" : "Private"}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default EquipmentList;
  