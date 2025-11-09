import { Scene } from 'phaser'
import { HookState, withGlobalState } from 'phaser-hooks'
import { Enemy } from '../entities/Enemy'
import { Player } from '../entities/Player'
import { Line } from '../entities/Line'
import {
  DEAD_ZONE_SIZE,
  NUDGE_ZONE_SIZE,
  ENEMY_KILL_SPEED_BOOST,
  MULTI_SPEED_BOOST,
  PARTICLE_CONFIG,
  PLAYER_MIN_CRUSH_SPEED,
  TRAIL_CONFIG,
  MAX_ENERGY,
  ENERGY_RECHARGE_RATE,
  WEAK_LAUNCH_COST,
  FULL_LAUNCH_COST,
} from '../constants'

type IState = {
  score: number
  multi: number
  energy: number
}

const clamp = Phaser.Math.Clamp

export class Game extends Scene {
  public player: Player
  public enemies: Phaser.Physics.Arcade.Group
  public line: Line
  public particles: Phaser.GameObjects.Particles.ParticleEmitter
  public trailParticles: Phaser.GameObjects.Particles.ParticleEmitter
  public renderTexture: Phaser.GameObjects.RenderTexture
  public state: HookState<IState>
  private energyMeterFill: Phaser.GameObjects.Rectangle

  constructor() {
    super('Game')
  }

  create(): void {
    const { centerX: x, width, height } = this.cameras.main
    this.cameras.main.fadeFrom(800, 0, 0, 0)

    this.player = new Player(this)
    this.line = new Line(this)
    this.enemies = this.physics.add.group({ classType: Enemy })
    this.particles = this.add.particles(0, 0, 'particle', PARTICLE_CONFIG)
    this.trailParticles = this.add.particles(0, 0, 'circle', TRAIL_CONFIG)
    this.trailParticles.startFollow(this.player)
    this.renderTexture = this.add.renderTexture(0, 0, width, height)
    this.renderTexture.setOrigin(0, 0).setDepth(-2).setAlpha(0.3)

    const scoreText = this.add.text(x, height - 12, '0').setOrigin(0.5, 1)
    const multiText = this.add.text(x, height - 30, '').setOrigin(0.5, 1)

    this.add
      .rectangle(0, height, width, 5, 0x222222)
      .setOrigin(0, 1)
      .setDepth(9)
    this.energyMeterFill = this.add
      .rectangle(0, height, width, 5, 0x00cc99)
      .setOrigin(0, 1)
      .setDepth(10)

    this.state = withGlobalState<IState>(this, 'global')
    this.state.set({ score: 0, multi: 0, energy: MAX_ENERGY })
    this.state.on('change', ({ score, multi }) => {
      scoreText.setText(`${score}`)
      multiText.setText(multi > 0 ? `x${multi}` : '')
    })

    this.physics.add.overlap(this.player, this.enemies, this.onCollide)
    this.input.on('pointermove', this.onDrag)
    this.input.on('pointerup', this.onRelease)
    this.input.on('gameout', this.onRelease)
    this.physics.world.on('worldbounds', this.onWorldBounds)

    this.enemies.get().spawn()
    this.time.addEvent({
      delay: 600,
      loop: true,
      callback: () => this.enemies.get().spawn(),
    })
  }

  update = (_time: number, _delta: number): void => {
    this.player.update()
    this.renderTexture.clear().draw(this.trailParticles, 0, 0)
    this.updateEnergy(_delta / 1000)

    if (
      this.input.activePointer.isDown &&
      this.time.timeScale !== 0.2 &&
      this.player.canLaunch
    ) {
      this.setTimeScale(0.2)
      this.line.draw(this.input.activePointer)
    }
  }

  onDrag = () => {
    if (!this.input.activePointer.isDown) return
    this.line.draw(this.input.activePointer)
  }

  onRelease = () => {
    this.line.clear()

    if (this.time.timeScale === 1) return

    this.setTimeScale(1)

    const p = this.input.activePointer
    const dist = Phaser.Math.Distance.Between(p.x, p.y, p.downX, p.downY)
    if (dist <= DEAD_ZONE_SIZE) return

    const energy = this.state.get().energy
    const isWeak = dist <= NUDGE_ZONE_SIZE || energy < FULL_LAUNCH_COST
    const cost = isWeak ? WEAK_LAUNCH_COST : FULL_LAUNCH_COST
    if (energy >= cost) {
      this.setEnergy(-cost)
      this.player.launch(p, !isWeak)
    }
  }

  onCollide = (_p: any, e: any) => {
    const enemy = e as Enemy
    if (!this.player.active || !enemy.active) return

    if (this.player.speed >= PLAYER_MIN_CRUSH_SPEED) {
      this.onHitEnemy(enemy)
    } else {
      this.onGameOver()
    }
  }

  onHitEnemy = (enemy: Enemy) => {
    enemy.kill()
    this.player.addImpulse(
      ENEMY_KILL_SPEED_BOOST + MULTI_SPEED_BOOST * this.state.get().multi,
    )
    this.state.patch((s) => ({
      score: s.score + (s.multi + 1),
      multi: s.multi + 1,
    }))
  }

  onGameOver = () => {
    this.player.kill()
    this.cameras.main.flash(50, 255, 255, 255)
    this.cameras.main
      .shake(300, 0.01)
      .fade(800, 0, 0, 0, true, (_: any, p: number) => {
        if (p === 1) {
          this.state.clearListeners()
          this.scene.restart()
        }
      })
  }

  onWorldBounds = (body: Phaser.Physics.Arcade.Body) => {
    if (body.gameObject === this.player) this.player.onWorldBounds()
  }

  setTimeScale(scale: number) {
    this.time.timeScale = scale
    this.tweens.timeScale = scale
    this.particles.timeScale = scale
    this.trailParticles.timeScale = scale
    this.physics.world.timeScale = 1 / scale
  }

  updateEnergy = (dt: number) => {
    const rate = this.time.timeScale < 1 ? -1 : ENERGY_RECHARGE_RATE
    this.setEnergy(rate * dt)
  }

  setEnergy = (diff: number) => {
    this.state.patch((s) => ({
      energy: clamp(s.energy + diff, 0, MAX_ENERGY),
    }))
    const energy = this.state.get().energy
    const p = clamp(energy / MAX_ENERGY, 0, 1)
    const f = this.energyMeterFill
    f.setDisplaySize(this.cameras.main.width * p, f.height)
    const isWeak = energy < FULL_LAUNCH_COST
    const color =
      energy < WEAK_LAUNCH_COST ? 0x333333 : isWeak ? 0x00ffff : 0xffff00
    f.setFillStyle(color)
  }
}
