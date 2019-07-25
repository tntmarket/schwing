import 'phaser'
import { Body } from 'matter-js'

const WIDTH = 1000
const HEIGHT = 1000

const CAMERA_WIDTH = 500
const CAMERA_HEIGHT = 500

let WASD: {
  W: Phaser.Input.Keyboard.Key
  A: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
}

const DASH_SPEED = 0.01

/* istanbul ignore next */
function preload(this: { load: Phaser.Loader.LoaderPlugin }) {
  const { load } = this

  load.setBaseURL('http://labs.phaser.io')

  load.image('sword', 'assets/skies/deepblue.png')
  load.image('player', 'assets/particles/red.png')
}

/* istanbul ignore next */
function create(this: {
  cameras: Phaser.Cameras.Scene2D.CameraManager
  input: Phaser.Input.InputPlugin
  matter: Phaser.Physics.Matter.MatterPhysics
}) {
  const { cameras, input, matter } = this

  cameras.main.setBounds(-100, -100, WIDTH + 100, HEIGHT + 100)

  matter.world.setBounds(0, 0, WIDTH, HEIGHT)

  matter.add.rectangle(100, 100, 20, 20, { isStatic: true })
  matter.add.rectangle(200, 100, 20, 20, { isStatic: true })
  matter.add.rectangle(300, 100, 20, 20, { isStatic: true })
  matter.add.rectangle(100, 100, 20, 20, { isStatic: true })
  matter.add.rectangle(100, 200, 20, 20, { isStatic: true })
  matter.add.rectangle(100, 300, 20, 20, { isStatic: true })

  const player = matter.add.image(80, 80, 'player').setScale(0.2, 0.2)
  const sword = matter.add.rectangle(80, 80, 4, 80, {})

  matter.add.constraint(player, sword, 30, 0, {
    pointA: { x: 0, y: 0 },
    pointB: { x: 0, y: -40 },
  })

  cameras.main.startFollow(player)
  cameras.main.setSize(CAMERA_WIDTH, CAMERA_HEIGHT)

  // @ts-ignore
  WASD = input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D,
  })

  WASD.W.on('down', () => {
    player.setVelocity(0, 0)
    player.applyForce(new Phaser.Math.Vector2(0, -DASH_SPEED))
  })
  WASD.A.on('down', () => {
    player.setVelocity(0, 0)
    player.applyForce(new Phaser.Math.Vector2(-DASH_SPEED, 0))
  })
  WASD.S.on('down', () => {
    player.setVelocity(0, 0)
    player.applyForce(new Phaser.Math.Vector2(0, DASH_SPEED))
  })
  WASD.D.on('down', () => {
    player.setVelocity(0, 0)
    player.applyForce(new Phaser.Math.Vector2(DASH_SPEED, 0))
  })
}

function update() {}

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
