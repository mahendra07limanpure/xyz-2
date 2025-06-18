import Phaser from 'phaser';

export class GameRegistry {
  private static eventEmitter: Phaser.Events.EventEmitter;

  static init() {
    if (!this.eventEmitter) {
      this.eventEmitter = new Phaser.Events.EventEmitter();
    }
  }

  static get events() {
    if (!this.eventEmitter) {
      this.init();
    }
    return this.eventEmitter;
  }

  static setData(key: string, value: any) {
    if (!this.eventEmitter) {
      this.init();
    }
    this.eventEmitter.emit('data-set', { key, value });
  }

  static getData(key: string) {
    // This would normally retrieve from a data store
    return null;
  }

  // Integration with React Game Context
  static updateGameContext(data: any) {
    this.events.emit('update-context', data);
  }

  static getPlayerStats() {
    return {
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      level: 1,
      experience: 0
    };
  }
}
