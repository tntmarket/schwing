import { startGame } from 'ROOT/game'

describe('Smoke test', () => {
  it('should not crash', () => {
    startGame(Phaser.HEADLESS)
  })
})
