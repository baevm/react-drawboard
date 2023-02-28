import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | undefined

const LOCALSTORAGE_THEME = 'drawboard-theme'

const getTheme = (): Theme => {
  // check for already existing preference
  const theme = localStorage.getItem(LOCALSTORAGE_THEME) as Theme | null
  if (theme) return theme

  // check for preferred dark theme
  const userPrefDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (userPrefDark) return 'dark'

  return 'light'
}

export const useTheme = () => {
  const [theme, setTheme] = useState(getTheme())

  // set theme on mount
  useEffect(() => {
    const oldTheme = getTheme()
    document.body.dataset.theme = oldTheme
  }, [])

  const changeTheme = () => {
    let newTheme: Theme

    if (theme === 'dark') {
      newTheme = 'light'
    } else {
      newTheme = 'dark'
    }

    localStorage.setItem(LOCALSTORAGE_THEME, newTheme)
    document.body.dataset.theme = newTheme
    setTheme(newTheme)
  }

  return { theme, changeTheme }
}
