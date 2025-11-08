import {
  PLAYER_COLOR,
  PLAYER_CRUSH_COLOR,
  PLAYER_DRAG,
  PLAYER_MAX_SPEED,
  PLAYER_MIN_CRUSH_SPEED,
  PLAYER_SIZE,
  PLAYER_SPEED_MULTI,
} from '../constants'
import { Game } from '../scenes/Game'

export class Player extends Phaser.GameObjects.Arc {
  declare body: Phaser.Physics.Arcade.Body
  declare scene: Game

  constructor(scene: Game) {
    const { centerX, centerY } = scene.cameras.main
    super(scene, centerX, centerY, PLAYER_SIZE, 0, 360, true, PLAYER_COLOR)
    scene.physics.add.existing(this)
    scene.add.existing(this)
    this.body
      .setCircle(PLAYER_SIZE)
      .setImmovable(false)
      .setAllowGravity(false)
      .setCollideWorldBounds(true)
      .setBounce(1)
      .setDamping(true)
      .setDrag(PLAYER_DRAG)

    this.body.onWorldBounds = true
  }

  update() {
    if (this.speed > PLAYER_MIN_CRUSH_SPEED) {
      this.setFillStyle(PLAYER_CRUSH_COLOR)
    } else {
      this.setFillStyle(PLAYER_COLOR)
      this.scene.state.patch({ multi: 0 })
    }
  }

  kill = () => {
    this.setActive(false).setAlpha(0)
    this.scene.particles
      .setParticleTint(PLAYER_COLOR)
      .emitParticleAt(this.x, this.y, 50)
  }

  get speed(): number {
    return Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2)
  }

  addImpulse(impulse: number) {
    const newSpeed = this.speed + impulse
    const nx = this.body.velocity.x / this.speed
    const ny = this.body.velocity.y / this.speed
    this.body.setVelocity(nx * newSpeed, ny * newSpeed)
  }

  launch(p: Phaser.Input.Pointer) {
    const dx = -(p.x - p.downX)
    const dy = -(p.y - p.downY)

    const angle = Math.atan2(dy, dx)
    const speed = Math.min(PLAYER_SPEED_MULTI, PLAYER_MAX_SPEED)
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed
    this.body.setVelocity(vx, vy)
  }

  onWorldBounds() {
    this.scene.cameras.main.shake(50, 0.015)
  }
}
