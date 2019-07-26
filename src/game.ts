import 'phaser'

const WIDTH = 1000
const HEIGHT = 1000

const CAMERA_WIDTH = 600
const CAMERA_HEIGHT = 600

let WASD: {
  W: Phaser.Input.Keyboard.Key
  A: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
  Q: Phaser.Input.Keyboard.Key
  E: Phaser.Input.Keyboard.Key
}

const ARM_LENGTH = 35

let pointer: Phaser.Physics.Matter.Image
let player: Phaser.Physics.Matter.Image
let weapon: Phaser.Physics.Matter.Image

const DASH_SPEED = 8

/* istanbul ignore next */
function preload(this: { load: Phaser.Loader.LoaderPlugin }) {
  const { load } = this

  load.image('sword', '/assets/rapier.png')
  load.image('player', 'http://labs.phaser.io/assets/particles/red.png')
}

/* istanbul ignore next */
function create(this: {
  cameras: Phaser.Cameras.Scene2D.CameraManager
  input: Phaser.Input.InputPlugin
  matter: Phaser.Physics.Matter.MatterPhysics
}) {
  const { cameras, input, matter } = this

  matter.world.setBounds(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT)

  matter.add.rectangle(200, 200, 10, 100, {})

  player = matter.add.image(0, 0, 'player').setScale(0.2, 0.2)
  player.setDensity(1)
  player.setFriction(1, 0.05)

  weapon = matter.add.image(0, -100, 'sword').setScale(2, -2)
  weapon.setDensity(0.004)
  weapon.setFriction(1, 0.05)

  pointer = matter.add.image(80, 80, 'player').setScale(0.08, 0.08)
  pointer.setDensity(0.01)

  const collisionGroups = {
    terrain: 1,
    players: matter.world.nextCategory(),
    weapons: matter.world.nextCategory(),
    controls: matter.world.nextCategory(),
  }

  player.setCollisionCategory(collisionGroups.players)

  weapon.setCollisionCategory(collisionGroups.weapons)

  pointer.setCollisionCategory(collisionGroups.controls)

  player.setCollidesWith([collisionGroups.terrain, collisionGroups.players])
  pointer.setCollidesWith([])

  // @ts-ignore
  const hand = matter.add.constraint(player, weapon, 1, 0.95, {
    pointA: { x: 0, y: -ARM_LENGTH },
    pointB: { x: 0, y: 25 },
  })
  // @ts-ignore
  // matter.add.constraint(pointer, weapon, 1, 0.5, {
  //   pointA: { x: 0, y: 0 },
  //   pointB: { x: 0, y: -40 },
  //   damping: 1,
  // })

  cameras.main.startFollow(player)
  cameras.main.setSize(CAMERA_WIDTH, CAMERA_HEIGHT)

  // @ts-ignore
  WASD = input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D,
    Q: Phaser.Input.Keyboard.KeyCodes.Q,
    E: Phaser.Input.Keyboard.KeyCodes.E,
  })

  WASD.W.on('down', () => {
    const forward = new Phaser.Math.Vector2().setToPolar(
      player.rotation - Math.PI / 2,
      DASH_SPEED
    )
    player.applyForce(forward)
  })
  WASD.A.on('down', () => {
    const left = new Phaser.Math.Vector2().setToPolar(
      player.rotation - Math.PI,
      DASH_SPEED
    )
    player.applyForce(left)
  })
  WASD.S.on('down', () => {
    const back = new Phaser.Math.Vector2().setToPolar(
      player.rotation + Math.PI / 2,
      DASH_SPEED
    )
    player.applyForce(back)
  })
  WASD.D.on('down', () => {
    const right = new Phaser.Math.Vector2().setToPolar(
      player.rotation,
      DASH_SPEED
    )
    player.applyForce(right)
  })
  WASD.Q.on('down', () => {
    player.setAngularVelocity(-0.03)
  })
  WASD.E.on('down', () => {
    player.setAngularVelocity(0.03)
  })

  input.on('pointermove', () => {})
  input.on('wheel', event => {
    console.log(hand.bodyA.position)
    // if (event.deltaY > 0) {
    //   hand.pointA.y += 1
    // } else {
    //   hand.pointA.y -= 1
    // }
  })
}

function update(this: {
  cameras: Phaser.Cameras.Scene2D.CameraManager
  input: Phaser.Input.InputPlugin
}) {
  const { cameras, input } = this

  const handPosition = new Phaser.Math.Vector2(player.x, player.y - ARM_LENGTH)
  const handToCursor = new Phaser.Math.Vector2(
    input.activePointer.x - CAMERA_WIDTH / 2,
    input.activePointer.y - (CAMERA_HEIGHT / 2 - ARM_LENGTH)
  )

  const handToCursorWithinOrbit = new Phaser.Math.Vector2().setToPolar(
    handToCursor.angle() + player.rotation,
    80
  )
  const worldCursorWithinPlayerOrbit = handPosition.add(handToCursorWithinOrbit)

  pointer.setPosition(
    worldCursorWithinPlayerOrbit.x,
    worldCursorWithinPlayerOrbit.y
  )

  cameras.main.setRotation(-player.rotation)
}

export const startGame = (type /* istanbul ignore next */ = Phaser.AUTO) => {
  new Phaser.Game({
    type,
    width: CAMERA_WIDTH,
    height: CAMERA_HEIGHT,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'matter',
      matter: {
        gravity: {
          y: 0,
        },
        debug: true,
      },
    },
    scene: {
      preload,
      create,
      update,
    },
  })
}
