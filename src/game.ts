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
  F: Phaser.Input.Keyboard.Key
}

// 1 means 90 degrees
let wristOffset = 0

let weaponHiltMagnet: Phaser.Physics.Matter.Image
let weaponBaseMagnet: Phaser.Physics.Matter.Image
let player: Phaser.Physics.Matter.Image
let weapon: Phaser.Physics.Matter.Image

const DASH_SPEED = 4

/* istanbul ignore next */
function preload(this: { load: Phaser.Loader.LoaderPlugin }) {
  const { load } = this

  load.image('sword', '/assets/rapier.png')
  load.image('player', 'http://labs.phaser.io/assets/particles/red.png')
  load.image('background', 'http://labs.phaser.io/assets/skies/fog.png')
}

/* istanbul ignore next */
function create(this: {
  cameras: Phaser.Cameras.Scene2D.CameraManager
  input: Phaser.Input.InputPlugin
  matter: Phaser.Physics.Matter.MatterPhysics
}) {
  const { add, cameras, input, matter } = this

  const background = add.image(0, 0, 'background')
  background.displayWidth = WIDTH
  background.displayHeight = HEIGHT

  matter.world.update60Hz()
  matter.world.setBounds(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT)

  const otherWeapon = matter.add.image(100, 100, 'sword').setScale(2, -2)
  otherWeapon.setDensity(0.00002)
  otherWeapon.setFriction(0, 0.01)
  otherWeapon.setBounce(0.7)

  player = matter.add.image(0, 0, 'player').setScale(0.2, 0.2)
  player.setDensity(0.5)
  player.setFriction(1, 0.05)

  weapon = matter.add.image(0, -100, 'sword').setScale(2, -2)
  weapon.setDensity(0.00002)
  weapon.setFriction(0, 0.01)
  weapon.setBounce(0.7)

  weaponHiltMagnet = matter.add.image(80, 80, 'player').setScale(0.08, 0.08)
  weaponHiltMagnet.setDensity(0.01)

  weaponBaseMagnet = matter.add.image(80, 80, 'player').setScale(0.08, 0.08)
  weaponBaseMagnet.setDensity(0.01)

  const collisionGroups = {
    terrain: 1,
    players: matter.world.nextCategory(),
    weapons: matter.world.nextCategory(),
    controls: matter.world.nextCategory(),
  }

  player.setCollisionCategory(collisionGroups.players)

  weapon.setCollisionCategory(collisionGroups.weapons)

  weaponHiltMagnet.setCollisionCategory(collisionGroups.controls)
  weaponBaseMagnet.setCollisionCategory(collisionGroups.controls)

  player.setCollidesWith([collisionGroups.terrain, collisionGroups.players])
  weaponHiltMagnet.setCollidesWith([])
  weaponBaseMagnet.setCollidesWith([])

  // @ts-ignore
  matter.add.constraint(weaponBaseMagnet, weapon, 1, 0.99, {
    pointA: { x: 0, y: 0 },
    pointB: { x: 0, y: 35 },
    damping: 1,
  })
  // @ts-ignore
  matter.add.constraint(weaponHiltMagnet, weapon, 1, 0.99, {
    pointA: { x: 0, y: 0 },
    pointB: { x: 0, y: 20 },
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
      wristOffset = Math.min(wristOffset + 0.1, 1.5)
    } else {
      wristOffset = Math.max(wristOffset - 0.1, -1.5)
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
  const wristAngle = wristOffset * Math.PI / 2
  const handToTip = new Phaser.Math.Vector2().setToPolar(
    player.rotation + shoulderAngle + wristAngle,
    15 // weapon length
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
  weaponBaseMagnet.setPosition(positions.hand.x, positions.hand.y)
  weaponBaseMagnet.setRotation(positions.shoulderAngle)

  weaponHiltMagnet.setPosition(positions.tip.x, positions.tip.y)

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
