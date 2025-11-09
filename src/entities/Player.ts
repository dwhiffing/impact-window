import {
  PLAYER_COLOR,
  PLAYER_CRUSH_COLOR,
  PLAYER_DRAG,
  PLAYER_MAX_SPEED,
  PLAYER_MIN_CRUSH_SPEED,
  PLAYER_SIZE,
  PLAYER_ACCELERATION,
  ENEMY_COLOR,
  PLAYER_LAUNCH_COOLDOWN_MS,
  PLAYER_FULL_LAUNCH_SPEED,
  PLAYER_WEAK_LAUNCH_SPEED,
  TRAIL_CONFIG,
} from '../constants'
import { darkenColor } from '../darkenColor'
import { Game } from '../scenes/Game'
import { PowerupDef } from '../types'
import { Powerup } from './Powerup'

export class Player extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body
  declare scene: Game
  private pendingImpulse = 0
  private invulnerableUntil = 0
  public lastLaunch = 0
  private base: Phaser.GameObjects.Arc
  private cooldownArc: Phaser.GameObjects.Graphics
  public trailParticles: Phaser.GameObjects.Particles.ParticleEmitter
  public renderTexture: Phaser.GameObjects.RenderTexture
  private activePowerup?: { def: PowerupDef; until: number }

  constructor(scene: Game) {
    super(scene)

    const { centerX, centerY, width, height } = scene.cameras.main
    this.setPosition(centerX, centerY).setDepth(3)
    this.base = scene.add
      .arc(0, 0, PLAYER_SIZE, 0, 360, true, PLAYER_COLOR)
      .setDepth(1)

    this.cooldownArc = scene.add.graphics().setDepth(2)
    this.add([this.base, this.cooldownArc])

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body
      .setCircle(PLAYER_SIZE)
      .setImmovable(false)
      .setAllowGravity(false)
      .setCollideWorldBounds(true)
      .setBounce(1)
      .setDamping(true)
      .setDrag(PLAYER_DRAG)
      .setOffset(-PLAYER_SIZE, -PLAYER_SIZE)

    this.body.onWorldBounds = true

    this.trailParticles = this.scene.add.particles(0, 0, 'circle', TRAIL_CONFIG)
    this.trailParticles.startFollow(this)
    this.renderTexture = this.scene.add.renderTexture(0, 0, width, height)
    this.renderTexture.setOrigin(0, 0).setDepth(-1).setAlpha(0.3)
  }

  update() {
    this.base.setFillStyle(this.color)
    this.updateCooldownTimer()
    this.applyImpulse()
    this.updateTrail()
  }

  onPickupPowerup = (_p: any, pu: any) => {
    const power = pu as Powerup

    if (!power.active) return
    const def = power.def
    power.pickup()
    this.activePowerup = { def, until: this.scene.time.now + def.duration }
    // TODO: add powerup effects

    this.scene.time.delayedCall(def.duration, () => {
      if (this.activePowerup?.def === def) {
        this.activePowerup = undefined
      }
    })
  }

  updateCooldownTimer = () => {
    const progress =
      (this.scene.time.now - this.lastLaunch) / PLAYER_LAUNCH_COOLDOWN_MS

    const startDeg = -90
    const endDeg = startDeg + Math.floor(360 * progress)
    const start = Phaser.Math.DegToRad(startDeg)
    const end = Phaser.Math.DegToRad(endDeg)
    this.cooldownArc
      .clear()
      .moveTo(0, 0)
      .arc(0, 0, PLAYER_SIZE - 2, start, end, false)
      .fillStyle(darkenColor(this.color, 30), 1)
      .fillPath()
  }

  applyImpulse = () => {
    if (this.pendingImpulse > 0) {
      const apply = Math.min(this.pendingImpulse, PLAYER_ACCELERATION)
      const nx = this.body.velocity.x / this.speed
      const ny = this.body.velocity.y / this.speed
      const s = Math.min(this.speed + apply, PLAYER_MAX_SPEED)
      this.body.setVelocity(nx * s, ny * s)
      this.pendingImpulse -= apply
      if (this.pendingImpulse <= 0) this.pendingImpulse = 0
    }
  }

  updateTrail = () => {
    const t = Phaser.Math.Clamp(this.speed / PLAYER_MAX_SPEED, 0, 1)
    const eased = 1 - Math.pow(1 - t, 1.2)
    const scale = Phaser.Math.Linear(0.01, 0.2, eased)
    this.trailParticles.setParticleTint(this.color)
    this.trailParticles.setParticleScale(scale)
    if (this.speed > PLAYER_MIN_CRUSH_SPEED) {
      this.trailParticles.setActive(true)
    } else {
      this.scene.state.patch({ multi: 0 })
    }
    this.renderTexture.clear().draw(this.trailParticles, 0, 0)
  }

  kill = () => {
    this.setActive(false).setAlpha(0).setVisible(false)
    this.scene.particles
      .setParticleTint(this.color)
      .emitParticleAt(this.x, this.y, 50)
  }

  get color(): number {
    return this.speed > PLAYER_MIN_CRUSH_SPEED
      ? PLAYER_CRUSH_COLOR
      : PLAYER_COLOR
  }

  get speed(): number {
    return (
      Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2) + 0.1
    )
  }

  addImpulse(impulse: number) {
    const availableToMax = Math.max(0, PLAYER_MAX_SPEED - this.speed)
    const toAdd = Math.min(impulse, availableToMax)
    if (toAdd <= 0) return
    this.pendingImpulse += toAdd
    this.trailParticles.setParticleTint(ENEMY_COLOR)
    this.scene.time.delayedCall(Phaser.Math.Between(50, 100), () => {
      this.trailParticles.setParticleTint(this.color)
    })
  }

  launch(p: Phaser.Input.Pointer, fullLaunch = false) {
    if (!this.active) return

    this.lastLaunch = this.scene.time.now
    const dx = -(p.x - p.downX)
    const dy = -(p.y - p.downY)
    const angle = Math.atan2(dy, dx)
    const vx = Math.cos(angle) * this.speed
    const vy = Math.sin(angle) * this.speed
    this.body.setVelocity(vx, vy)
    this.pendingImpulse += fullLaunch
      ? PLAYER_FULL_LAUNCH_SPEED
      : PLAYER_WEAK_LAUNCH_SPEED
  }

  onWorldBounds() {
    this.scene.cameras.main.shake(50, 0.015)
    this.scene.particles
      .setParticleTint(this.color)
      .emitParticleAt(this.x, this.y, 2)
  }

  makeInvulnerable(ms: number) {
    this.invulnerableUntil = this.scene.time.now + ms
  }

  get canLaunch() {
    return (
      !this.lastLaunch ||
      !(this.scene.time.now - this.lastLaunch < PLAYER_LAUNCH_COOLDOWN_MS)
    )
  }

  get isInvulnerable() {
    return this.scene.time.now < this.invulnerableUntil
  }
}
