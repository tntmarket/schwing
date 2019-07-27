import 'phaser'
import { createWorld, HEIGHT, WIDTH } from 'ROOT/world'
import { controlPlayer, createPlayer, handPositions, Player } from 'ROOT/player'
import { ratio } from 'ROOT/units'

const CAMERA_WIDTH = 400
const CAMERA_HEIGHT = 600

let player: Player
let player2: Player

/* istanbul ignore next */
function preload(this: { load: Phaser.Loader.LoaderPlugin }) {
  const { load } = this

  load.image('sword', '/assets/rapier.png')
  load.image('red', 'http://labs.phaser.io/assets/particles/red.png')
  load.image('yellow', 'http://labs.phaser.io/assets/particles/yellow.png')
  load.image('background', 'http://labs.phaser.io/assets/skies/fog.png')
}

/* istanbul ignore next */
function create(this: {
  add: Phaser.GameObjects.GameObjectFactory
  cameras: Phaser.Cameras.Scene2D.CameraManager
  input: Phaser.Input.InputPlugin
  matter: Phaser.Physics.Matter.MatterPhysics
}) {
  const { add, cameras, input, matter } = this

  const background = add.image(0, 0, 'background')
  background.displayWidth = WIDTH
  background.displayHeight = HEIGHT

  createWorld(matter)

  player2 = createPlayer(matter, 0, -200, Math.PI / 2, 'yellow')

  player = createPlayer(matter)
  controlPlayer(player, input)

  cameras.main.startFollow(player.head)
  cameras.main.setSize(CAMERA_WIDTH, CAMERA_HEIGHT)
}

const setHandPosition = (
  player: Player,
  armLength: ratio,
  shoulderAngle: ratio
) => {
  const positions = handPositions(
    player.head,
    player.wristAngle,
    armLength,
    shoulderAngle
  )
  player.wrist.setPosition(positions.wrist.x, positions.wrist.y)
  player.fingers.setPosition(positions.fingers.x, positions.fingers.y)
}

function update(this: {
  cameras: Phaser.Cameras.Scene2D.CameraManager
  input: Phaser.Input.InputPlugin
}) {
  const { cameras, input } = this

  setHandPosition(
    player,
    (CAMERA_HEIGHT - 2 * input.activePointer.y) / CAMERA_HEIGHT + 1,
    (2 * input.activePointer.x - CAMERA_WIDTH) / CAMERA_WIDTH
  )
  setHandPosition(
    player2,
    1,
    1,
  )

  cameras.main.setRotation(-player.head.rotation)
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
