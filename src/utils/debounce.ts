export const debounce = (callback: (args: any) => void, delay = 500) => {
  let timer: NodeJS.Timer

  return (args: any) => {
    clearTimeout(timer)

    timer = setTimeout(() => {
      callback(args)
    }, delay)
  }
}
