import { Scene } from 'phaser'

export class Line extends Phaser.GameObjects.Graphics {
  constructor(scene: Scene) {
    super(scene)
    scene.add.existing(this)
  }

  draw(p: Phaser.Input.Pointer) {
    const dx = p.worldX - p.downX
    const dy = p.worldY - p.downY
    const distance = Math.sqrt(dx * dx + dy * dy)

    const MAX = 50

    const ratio = distance > MAX ? MAX / distance : 1
    const endX = p.downX + dx * ratio
    const endY = p.downY + dy * ratio

    this.clear()
      .lineStyle(2, 0xffffff, 1)
      .moveTo(p.downX, p.downY)
      .lineTo(endX, endY)
      .strokePath()
  }
}
