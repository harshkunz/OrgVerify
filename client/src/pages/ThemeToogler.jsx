import React from 'react'
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react'
const ThemeToogler = () => {
  const { theme, setTheme } = useTheme();

  
  return (
    <div className="flex gap-1">
    <button onClick={() => setTheme('light')} className={`p-2 rounded ${theme === 'light' ? 'bg-gray-300 dark:bg-gray-700' : ''}`}><Sun className="dark:text-gray-100 size-6" /></button>
    <button onClick={() => setTheme('dark')} className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-300 dark:bg-gray-700' : ''}`}><Moon  className="size-6 dark:text-gray-100" /></button>
    <button onClick={() => setTheme('system')} className={`p-2 rounded ${theme === 'system' ? 'bg-gray-300 dark:bg-gray-700' : ''}`}><Monitor className="size-6 dark:text-gray-100" /></button>
  </div>
  )
}

export default ThemeToogler
