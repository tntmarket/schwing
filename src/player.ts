import { ratio } from 'ROOT/units'
import { COLLISION_GROUPS } from 'ROOT/world'

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

export type Player = {
  wristAngle: ratio
  fingers: Phaser.Physics.Matter.Image
  wrist: Phaser.Physics.Matter.Image
  head: Phaser.Physics.Matter.Image
  weapon: Phaser.Physics.Matter.Image
}

export const createPlayer = (
  matter: Phaser.Physics.Matter.MatterPhysics,
  spawnX: number = 0,
  spawnY: number = 0,
  spawnRotation: number = 0,
  texture: string = 'red'
): Player => {
  const head = matter.add.image(spawnX, spawnY, texture).setScale(0.2, 0.2)
  head.setDensity(0.5)
  head.setFriction(1, 0.05)

  const weapon = matter.add.image(spawnX, spawnY - 100, 'sword').setScale(2, -2)
  weapon.setDensity(0.00002)
  weapon.setFriction(0, 0.01)
  weapon.setBounce(0.7)

  const fingers = matter.add.image(spawnX, -80, texture).setScale(0.08, 0.08)
  fingers.setDensity(0.01)

  const wrist = matter.add.image(spawnX, -60, texture).setScale(0.08, 0.08)
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

  head.setRotation(spawnRotation)

  return {
    wristAngle: 0,
    fingers,
    wrist,
    head,
    weapon,
  }
}

export const controlPlayer = (
  player: Player,
  input: Phaser.Input.InputPlugin
) => {
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
      player.wristAngle = Math.min(player.wristAngle + 0.1, 1.5)
    } else {
      player.wristAngle = Math.max(player.wristAngle - 0.1, -1.5)
    }
  })
}

export const handPositions = (
  headPosition: Phaser.Physics.Matter.Image,
  wristAngle: ratio,
  armLength: ratio,
  shoulderAngle: ratio
) => {
  const head = new Phaser.Math.Vector2(headPosition.x, headPosition.y)

  const shoulderAngle_ = ((shoulderAngle - 1) * Math.PI) / 2
  const shoulderToHand = new Phaser.Math.Vector2().setToPolar(
    headPosition.rotation + shoulderAngle_,
    armLength * 30
  )
  const wrist = head.add(shoulderToHand)

  const wristAngle_ = (wristAngle * Math.PI) / 2
  const wristToFingers = new Phaser.Math.Vector2().setToPolar(
    headPosition.rotation + shoulderAngle_ + wristAngle_,
    15
  )
  const fingers = new Phaser.Math.Vector2().add(head).add(wristToFingers)

  return {
    wrist,
    fingers,
  }
}
