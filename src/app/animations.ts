import { TweenMax, Power2 } from 'gsap/TweenMax'

export const promiseTo = (obj, duration: number, vars) =>
  new Promise(resolve =>
    TweenMax.to(obj, duration, {
      ...vars,
      onComplete: resolve
    })
  )

export const moveTo = (
  displayObject,
  duration: number = 1,
  vars: object = {}
) =>
  promiseTo(displayObject, duration, {
    ease: Power2.easeOut,
    ...vars
  })

export const grow = (
  displayObject,
  targetSize: number = 4,
  duration: number = 0.5,
  ease: () => number = Power2.easeIn
) =>
  promiseTo(displayObject.scale, duration, {
    x: targetSize,
    y: targetSize,
    ease
  })

export const shake = (
  displayObject,
  size: number = 3,
  duration: number = 0.2
) => {
  const ogPos = {
    x: displayObject.x,
    y: displayObject.y
  }
  const randomPos = () => ({
    x: displayObject.position.x + Math.random() * size * 2 - size,
    y: displayObject.position.y + Math.random() * size * 2 - size
  })
  return promiseTo(displayObject, duration / 3, randomPos())
    .then(() => promiseTo(displayObject, duration / 3, randomPos()))
    .then(() =>
      promiseTo(displayObject, duration / 3, { x: ogPos.x, y: ogPos.y })
    )
}

export const fade = (
  displayObject,
  duration: number = 0.5,
  alpha: number = 0
) => promiseTo(displayObject, duration, { alpha })

export const spinForever = (displayObject, duration: number = 1.5) =>
  TweenMax.to(displayObject, duration, {
    rotation: Math.PI * 2,
    startAt: {
      rotation: 0
    },
    repeat: -1,
    ease: 'Linear.easeNone'
  })

export const pulse = (
  displayObject,
  size: number = 4,
  duration: number = 0.75
) =>
  promiseTo(displayObject.scale, duration, { x: size, y: size }).then(() =>
    promiseTo(displayObject.scale, duration, { x: 1, y: 1 })
  )
