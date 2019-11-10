export interface Cursor {
  key: string
  downCallback: () => void
  upCallback: () => void
}

export interface Cursors {
  up: Cursor
  down: Cursor
  left: Cursor
  right: Cursor
}

export interface Point {
  x: number
  y: number
}
