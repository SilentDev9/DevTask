import styles from './OpenTheWeb.module.css'
function OpenTheWeb() {
  const data = "</>"
  return (
    <div>
     <div className={styles.contanar}>
      <div>  <h1 className={styles.txt}>{data}</h1>
      <h1 className={styles.text}><span>Red</span>king</h1></div>
     
      <div className={styles.loader}></div>
     </div>
    </div>
  )
}

export default OpenTheWeb