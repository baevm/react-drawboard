import styles from './App.module.css'
import Board from './components/Board/Board'
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <Sidebar />
      <Board />
      <Footer />
    </div>
  )
}

export default App
