import 'phaser'
import { Composite } from 'matter-js'

const WIDTH = 1000
const HEIGHT = 1000

const CAMERA_WIDTH = 500
const CAMERA_HEIGHT = 500

let WASD: {
  W: Phaser.Input.Keyboard.Key
  A: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
  Q: Phaser.Input.Keyboard.Key
  E: Phaser.Input.Keyboard.Key
}

let pointer: Phaser.Physics.Matter.Image
let player: Phaser.Physics.Matter.Image

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

  matter.world.setBounds(0, 0, WIDTH, HEIGHT)

  matter.add.rectangle(200, 200, 10, 100, {})

  player = matter.add.image(10, 10, 'player').setScale(0.2, 0.2)
  player.setDensity(1)
  player.setFriction(1, 0.05)

  const sword = matter.add.image(100, 100, 'sword').setScale(2, -2)
  sword.setDensity(0.001)
  sword.setFriction(1, 0.05)

  pointer = matter.add.image(80, 80, 'player').setScale(0.08, 0.08)
  pointer.setDensity(0.01)

  // const player = Composite.create()
  // Composite.add(player, player)
  // Composite.add(player, sword)

  const collisionGroups = {
    terrain: 1,
    players: matter.world.nextCategory(),
    weapons: matter.world.nextCategory(),
    controls: matter.world.nextCategory(),
  }

  player.setCollisionCategory(collisionGroups.players)
  // player.setRotation(Math.PI)

  sword.setCollisionCategory(collisionGroups.weapons)

  pointer.setCollisionCategory(collisionGroups.controls)

  player.setCollidesWith([collisionGroups.terrain, collisionGroups.players])
  pointer.setCollidesWith([])

  // pointer.setCollidesWith([])

  // @ts-ignore
  const leftHand = matter.add.constraint(player, sword, 40, 0.5, {
    pointA: { x: -15, y: 0 },
    pointB: { x: 0, y: -25 },
  })
  // @ts-ignore
  const rightHand = matter.add.constraint(player, sword, 40, 0.5, {
    pointA: { x: 15, y: 0 },
    pointB: { x: 0, y: -35 },
  })
  // @ts-ignore
  matter.add.constraint(pointer, sword, 1, 0.1, {
    pointA: { x: 0, y: 0 },
    pointB: { x: 0, y: 40 },
    damping: 1,
  })

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
    // player.setVelocity(0, -DASH_SPEED)
    // const dashForce = new Phaser.Math.Vector2().setToPolar(player.rotation, DASH_SPEED);
    // console.log(dashForce.x, dashForce.y)
    // player.applyForce(dashForce)
    player.applyForce(new Phaser.Math.Vector2(0, -DASH_SPEED))
  })
  WASD.A.on('down', () => {
    // player.setVelocity(-DASH_SPEED, 0)
    player.applyForce(new Phaser.Math.Vector2(-DASH_SPEED, 0))
  })
  WASD.S.on('down', () => {
    // player.setVelocity(0, DASH_SPEED)
    player.applyForce(new Phaser.Math.Vector2(0, DASH_SPEED))
  })
  WASD.D.on('down', () => {
    // player.setVelocity(DASH_SPEED, 0)
    player.applyForce(new Phaser.Math.Vector2(DASH_SPEED, 0))
  })
  WASD.Q.on('down', () => {
    player.setAngularVelocity(-0.01)
  })
  WASD.E.on('down', () => {
    player.setAngularVelocity(0.01)
  })

  input.on('pointermove', () => {})
  input.on('wheel', event => {
    if (event.deltaY > 0) {
      rightHand.pointA.y += 1
      leftHand.pointA.y += 1
    } else {
      rightHand.pointA.y -= 1
      leftHand.pointA.y -= 1
    }
  })
}

function update(this: {
  cameras: Phaser.Cameras.Scene2D.CameraManager
  input: Phaser.Input.InputPlugin
}) {
  const { cameras, input } = this

  const playerPosition = new Phaser.Math.Vector2(player.x, player.y)
  const cursorPosition = new Phaser.Math.Vector2(
    input.activePointer.worldX,
    input.activePointer.worldY
  )
  const orbitPosition = cursorPosition
    .subtract(playerPosition)
    .normalize()
    .scale(110)
    .add(playerPosition)
  pointer.setPosition(orbitPosition.x, orbitPosition.y)

  cameras.main.setRotation(-player.rotation)
  console.log(player.rotation/Math.PI/2)
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
