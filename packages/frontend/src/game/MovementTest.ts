// Movement test utilities for debugging
export class MovementTest {
  static logPlayerPosition(player: any, scene: any) {
    console.log(`Player Position: x=${player.x.toFixed(2)}, y=${player.y.toFixed(2)}`);
    console.log(`Player Velocity: vx=${player.body.velocity.x.toFixed(2)}, vy=${player.body.velocity.y.toFixed(2)}`);
    console.log(`Player Drag: ${player.body.drag.x}`);
  }

  static testInputs(cursors: any, wasd: any) {
    const inputs = {
      left: cursors.left.isDown || wasd.A.isDown,
      right: cursors.right.isDown || wasd.D.isDown,
      up: cursors.up.isDown || wasd.W.isDown,
      down: cursors.down.isDown || wasd.S.isDown
    };
    
    console.log('Active inputs:', inputs);
    return inputs;
  }

  static validateMovement(player: any, expectedVelocity: { x: number, y: number }) {
    const actualVx = player.body.velocity.x;
    const actualVy = player.body.velocity.y;
    
    const tolerance = 5;
    const vxValid = Math.abs(actualVx - expectedVelocity.x) < tolerance;
    const vyValid = Math.abs(actualVy - expectedVelocity.y) < tolerance;
    
    if (!vxValid || !vyValid) {
      console.warn(`Movement mismatch: expected (${expectedVelocity.x}, ${expectedVelocity.y}), actual (${actualVx.toFixed(2)}, ${actualVy.toFixed(2)})`);
    }
    
    return vxValid && vyValid;
  }
}
