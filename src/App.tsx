import styles from './App.module.css'
import Board from './components/Board/Board'
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <Board />
      <Footer />
    </div>
  )
}

export default App
