import 'phaser'
import { COLLISION_GROUPS, createWorld, HEIGHT, WIDTH } from 'ROOT/world'

const CAMERA_WIDTH = 400
const CAMERA_HEIGHT = 600

let WASD: {
  W: Phaser.Input.Keyboard.Key
  A: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
  Q: Phaser.Input.Keyboard.Key
  E: Phaser.Input.Keyboard.Key
  F: Phaser.Input.Keyboard.Key
}

const DASH_SPEED = 4

type Player = {
  wristOffset: number // 1 means 90 degrees
  fingers: Phaser.Physics.Matter.Image
  wrist: Phaser.Physics.Matter.Image
  head: Phaser.Physics.Matter.Image
  weapon: Phaser.Physics.Matter.Image
}

let player: Player

/* istanbul ignore next */
function preload(this: { load: Phaser.Loader.LoaderPlugin }) {
  const { load } = this

  load.image('sword', '/assets/rapier.png')
  load.image('player', 'http://labs.phaser.io/assets/particles/red.png')
  load.image('background', 'http://labs.phaser.io/assets/skies/fog.png')
}

const createPlayer = (matter: Phaser.Physics.Matter.MatterPhysics): Player => {
  const head = matter.add.image(0, 0, 'player').setScale(0.2, 0.2)
  head.setDensity(0.5)
  head.setFriction(1, 0.05)

  const weapon = matter.add.image(0, -100, 'sword').setScale(2, -2)
  weapon.setDensity(0.00002)
  weapon.setFriction(0, 0.01)
  weapon.setBounce(0.7)

  const fingers = matter.add.image(80, 80, 'player').setScale(0.08, 0.08)
  fingers.setDensity(0.01)

  const wrist = matter.add.image(80, 80, 'player').setScale(0.08, 0.08)
  wrist.setDensity(0.01)

  head.setCollisionCategory(COLLISION_GROUPS.players)

  weapon.setCollisionCategory(COLLISION_GROUPS.weapons)

  fingers.setCollisionCategory(COLLISION_GROUPS.controls)
  wrist.setCollisionCategory(COLLISION_GROUPS.controls)

  head.setCollidesWith([COLLISION_GROUPS.terrain, COLLISION_GROUPS.players])
  fingers.setCollidesWith([])
  wrist.setCollidesWith([])

  // @ts-ignore
  matter.add.constraint(wrist, weapon, 1, 0.99, {
    pointA: { x: 0, y: 0 },
    pointB: { x: 0, y: 35 },
    damping: 1,
  })
  // @ts-ignore
  matter.add.constraint(fingers, weapon, 1, 0.99, {
    pointA: { x: 0, y: 0 },
    pointB: { x: 0, y: 20 },
    damping: 1,
  })

  return {
    wristOffset: 0,
    fingers,
    wrist,
    head,
    weapon,
  }
}

const controlPlayer = (player: Player, input: Phaser.Input.InputPlugin) => {
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
      player.head.rotation - Math.PI / 2,
      DASH_SPEED
    )
    player.head.applyForce(forward)
  })
  WASD.A.on('down', () => {
    const left = new Phaser.Math.Vector2().setToPolar(
      player.head.rotation - Math.PI,
      DASH_SPEED
    )
    player.head.applyForce(left)
  })
  WASD.S.on('down', () => {
    const back = new Phaser.Math.Vector2().setToPolar(
      player.head.rotation + Math.PI / 2,
      DASH_SPEED
    )
    player.head.applyForce(back)
  })
  WASD.D.on('down', () => {
    const right = new Phaser.Math.Vector2().setToPolar(
      player.head.rotation,
      DASH_SPEED
    )
    player.head.applyForce(right)
  })
  WASD.Q.on('down', () => {
    player.head.setAngularVelocity(-0.03)
  })
  WASD.E.on('down', () => {
    player.head.setAngularVelocity(0.03)
  })

  input.on('wheel', (event: { deltaY: number }) => {
    if (event.deltaY > 0) {
      player.wristOffset = Math.min(player.wristOffset + 0.1, 1.5)
    } else {
      player.wristOffset = Math.max(player.wristOffset - 0.1, -1.5)
    }
  })
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

  const otherWeapon = matter.add.image(100, 100, 'sword').setScale(2, -2)
  otherWeapon.setDensity(0.00002)
  otherWeapon.setFriction(0, 0.01)
  otherWeapon.setBounce(0.7)

  player = createPlayer(matter)
  controlPlayer(player, input)

  cameras.main.startFollow(player.head)
  cameras.main.setSize(CAMERA_WIDTH, CAMERA_HEIGHT)
}

const handPositions = (
  headPosition: Phaser.Physics.Matter.Image,
  wristAngle: number,
  armLength: number,
  shoulderAngle: number
) => {
  const head = new Phaser.Math.Vector2(headPosition.x, headPosition.y)

  const shoulderAngle_ = ((shoulderAngle - 1) * Math.PI) / 2
  const shoulderToHand = new Phaser.Math.Vector2().setToPolar(
    player.head.rotation + shoulderAngle_,
    armLength * 30
  )
  const wrist = head.add(shoulderToHand)

  const wristAngle_ = (wristAngle * Math.PI) / 2
  const wristToFingers = new Phaser.Math.Vector2().setToPolar(
    player.head.rotation + shoulderAngle_ + wristAngle_,
    15
  )
  const fingers = new Phaser.Math.Vector2().add(head).add(wristToFingers)

  return {
    wrist,
    fingers,
  }
}

function update(this: {
  cameras: Phaser.Cameras.Scene2D.CameraManager
  input: Phaser.Input.InputPlugin
}) {
  const { cameras, input } = this

  const positions = handPositions(
    player.head,
    player.wristOffset,
    (CAMERA_HEIGHT - 2 * input.activePointer.y) / CAMERA_HEIGHT + 1,
    (2 * input.activePointer.x - CAMERA_WIDTH) / CAMERA_WIDTH
  )
  player.wrist.setPosition(positions.wrist.x, positions.wrist.y)
  player.fingers.setPosition(positions.fingers.x, positions.fingers.y)

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
        // debug: true,
      },
    },
    scene: {
      preload,
      create,
      update,
    },
  })
}
