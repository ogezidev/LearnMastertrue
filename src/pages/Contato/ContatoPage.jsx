import { useState } from 'react';
import Header from '@/components/Header/Header';
import styles from './ContatoPage.module.css';
import imgCasal from '@/assets/images/CasalContato.png';

const MAX_CHARS = 250;

const ContatoPage = () => {
  const [mensagem, setMensagem] = useState('');

  const handleMensagem = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setMensagem(e.target.value);
    }
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>

          {/* Coluna esquerda — imagem + badge */}
          <div className={styles.imageCol}>
            <img
              src={imgCasal}
              alt="Casal usando LearnMaster"
              className={styles.image}
            />
          </div>

          {/* Coluna direita — formulário */}
          <div className={styles.formCol}>

            <div className={styles.formHeader}>
              <span className={styles.tag}>Fale conosco</span>
              <h1 className={styles.title}>Como podemos<br />ajudar você?</h1>
              <p className={styles.subtitle}>
                Estamos aqui para tirar suas dúvidas e ouvir suas sugestões.
              </p>
            </div>

            <form className={styles.form}>
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Primeiro nome</label>
                  <input type="text" className={styles.input} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Sobrenome</label>
                  <input type="text" className={styles.input} />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Endereço de email</label>
                <input type="email" className={styles.input} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Mensagem</label>
                <div className={styles.textareaWrapper}>
                  <textarea
                    className={styles.textarea}
                    value={mensagem}
                    onChange={handleMensagem}
                  />
                  <span className={styles.charCount}>
                    {mensagem.length}/{MAX_CHARS}
                  </span>
                </div>
              </div>

              <button type="submit" className={styles.btnEnviar}>
                Enviar
              </button>
            </form>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ContatoPage;
