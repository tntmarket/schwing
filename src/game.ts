import 'phaser'

/* istanbul ignore next */
function preload(this: { load: Phaser.Loader.LoaderPlugin }) {
  const { load } = this

  load.setBaseURL('http://labs.phaser.io')

  load.image('ground', 'assets/skies/deepblue.png')
  load.image('player', 'assets/particles/red.png')
}

/* istanbul ignore next */
function create(this: {
  add: Phaser.GameObjects.GameObjectFactory
  physics: Phaser.Physics.Arcade.ArcadePhysics
}) {
  const { add, physics } = this

  physics.world.setBounds(-500, -500, 1000, 1000)

  const ground = add.image(0, 0, 'ground')
  ground.setDisplaySize(500, 500)

  const player = physics.add.image(0, 0, 'player')
  player.setDisplaySize(50, 50).setCollideWorldBounds(true)
}

export const startGame = (type /* istanbul ignore next */ = Phaser.AUTO) => {
  new Phaser.Game({
    type,
    width: 500,
    height: 500,
    physics: {
      default: 'arcade',
      arcade: {},
    },
    scene: {
      preload,
      create,
    },
  })
}
