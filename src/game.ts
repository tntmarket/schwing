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

let wristOffset = 0

let weaponTipMagnet: Phaser.Physics.Matter.Image
let weaponHiltMagnet: Phaser.Physics.Matter.Image
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

  matter.add.rectangle(-400, -400, 20, 70, {})
  matter.add.rectangle(-300, -300, 10, 70, {})
  matter.add.rectangle(-200, -200, 20, 70, {})
  matter.add.rectangle(-100, -100, 10, 70, {})
  matter.add.rectangle(100, 100, 20, 70, {})
  matter.add.rectangle(200, 200, 10, 70, {})
  matter.add.rectangle(300, 300, 20, 70, {})
  matter.add.rectangle(400, 400, 10, 70, {})

  player = matter.add.image(0, 0, 'player').setScale(0.2, 0.2)
  player.setDensity(1)
  player.setFriction(1, 0.05)

  weapon = matter.add.image(0, -100, 'sword').setScale(2, -2)
  weapon.setDensity(0.001)
  weapon.setFriction(1, 0.05)

  weaponTipMagnet = matter.add.image(80, 80, 'player').setScale(0.08, 0.08)
  weaponTipMagnet.setDensity(0.01)

  weaponHiltMagnet = matter.add.image(80, 80, 'player').setScale(0.08, 0.08)
  weaponHiltMagnet.setDensity(0.01)

  const collisionGroups = {
    terrain: 1,
    players: matter.world.nextCategory(),
    weapons: matter.world.nextCategory(),
    controls: matter.world.nextCategory(),
  }

  player.setCollisionCategory(collisionGroups.players)

  weapon.setCollisionCategory(collisionGroups.weapons)

  weaponTipMagnet.setCollisionCategory(collisionGroups.controls)
  weaponHiltMagnet.setCollisionCategory(collisionGroups.controls)

  player.setCollidesWith([collisionGroups.terrain, collisionGroups.players])
  weaponTipMagnet.setCollidesWith([])
  weaponHiltMagnet.setCollidesWith([])

  // @ts-ignore
  matter.add.constraint(weaponHiltMagnet, weapon, 1, 0.95, {
    pointA: { x: 0, y: 0 },
    pointB: { x: 0, y: 25 },
  })
  // @ts-ignore
  matter.add.constraint(weaponTipMagnet, weapon, 1, 0.3, {
    pointA: { x: 0, y: 0 },
    pointB: { x: 0, y: -40 },
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

  input.on('wheel', (event: { deltaY: number }) => {
    if (event.deltaY > 0) {
      wristOffset += 0.2
    } else {
      wristOffset -= 0.2
    }
  })
}

const armPositions = (pointer: Phaser.Input.Pointer) => {
  // 40 for max up
  const verticalOffset =
    ((CAMERA_HEIGHT - 2 * pointer.y) / CAMERA_HEIGHT + 1) * 30

  // 1 for max right
  const horizontalOffset = ((2 * pointer.x - CAMERA_WIDTH) / CAMERA_WIDTH)
  const shoulderAngle = ((horizontalOffset - 1) * Math.PI) / 2

  const shoulderToHand = new Phaser.Math.Vector2().setToPolar(
    player.rotation + shoulderAngle,
    verticalOffset
  )

  const playerPosition = new Phaser.Math.Vector2(player.x, player.y)
  const hand = playerPosition.add(shoulderToHand)
  const handToTip = new Phaser.Math.Vector2().setToPolar(
    player.rotation + shoulderAngle + wristOffset,
    70 // weapon length
  )

  return {
    hand,
    shoulderAngle,
    tip: new Phaser.Math.Vector2().add(playerPosition).add(handToTip),
  }
}

function update(this: {
  cameras: Phaser.Cameras.Scene2D.CameraManager
  input: Phaser.Input.InputPlugin
}) {
  const { cameras, input } = this

  const positions = armPositions(input.activePointer)
  weaponHiltMagnet.setPosition(positions.hand.x, positions.hand.y)
  weaponHiltMagnet.setRotation(positions.shoulderAngle)

  weaponTipMagnet.setPosition(positions.tip.x, positions.tip.y)

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
