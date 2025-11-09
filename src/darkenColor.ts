export const darkenColor = (color: number, amount: number) => {
  const Color = Phaser.Display.Color
  const c = Color.ValueToColor(color)
  const d = Color.Interpolate.ColorWithColor(c, new Color(0, 0, 0), 100, amount)
  return Color.GetColor(d.r, d.g, d.b)
}
