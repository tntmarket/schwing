export const WIDTH = 400
export const HEIGHT = 1000
export let COLLISION_GROUPS: {
  terrain: number
  players: number
  weapons: number
  controls: number
}
export const createWorld = (matter: Phaser.Physics.Matter.MatterPhysics) => {
  matter.world.update60Hz()
  matter.world.setBounds(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT)

  COLLISION_GROUPS = {
    terrain: 1,
    players: matter.world.nextCategory(),
    weapons: matter.world.nextCategory(),
    controls: matter.world.nextCategory(),
  }
}
