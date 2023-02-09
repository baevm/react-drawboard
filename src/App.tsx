import styles from './App.module.css'
import Board from './components/Board/Board'
import Header from './components/Header/Header'

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <Board />
    </div>
  )
}

export default App
