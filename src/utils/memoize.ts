export function memoize(fn: any) {
  let cache: { [key: string]: any } = {}

  return async function () {
    const arg = arguments[0]

    cache[arg] = cache[arg] || (await fn.apply(undefined, arguments))
    return cache[arg]
  }
}
