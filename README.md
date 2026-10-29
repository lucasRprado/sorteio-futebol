# sorteio-futebol

# ⚽ Sorteio de Times - Gestão de Futebol Amador

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

Um aplicativo web colaborativo desenhado para organizar e equilibrar partidas de futebol amador. Diga adeus aos times desiguais: este sistema utiliza um algoritmo de nivelamento para distribuir jogadores e goleiros de forma justa, agora com **sincronização em tempo real na nuvem**.

## 🚀 Novidades desta Versão (Cloud Update)
* **Migração para Nuvem:** Substituição do `localStorage` pelo **Firebase Firestore**.
* **Sincronismo em Tempo Real:** Alterações feitas em um celular/computador refletem instantaneamente em todos os outros aparelhos conectados.
* **Organização Flexível:** Possibilidade de reordenar a lista de jogadores e salvar a preferência globalmente.

## ✨ Funcionalidades Principais

- **Nivelamento Inteligente:** Algoritmo que distribui jogadores de linha (nível 1 a 5) e goleiros, garantindo que todos os times tenham a mesma "força" somada.
- **Gestão de Elenco (CRUD):** Adicione, edite (nível/posição), remova e defina quem vai jogar no dia (participação ativa).
- **Sistema de Capitães:** Escolha capitães específicos que serão cabeças de chave em cada time.
- **Regras Customizadas:** Suporte a fixação de jogadores específicos em um time (ex: "Time Preto"), útil para turmas com panelinhas tradicionais ou donos da bola.
- **Exportação para WhatsApp:** Com um clique, o resultado do sorteio é formatado com emojis e enviado diretamente para o grupo do WhatsApp.
- **PWA Ready:** Interface responsiva e adaptada para funcionar como um aplicativo nativo no celular.

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React (com Hooks `useState`, `useEffect`)
* **Build Tool:** Vite
* **Estilização:** Tailwind CSS
* **Banco de Dados:** Firebase Firestore (NoSQL, Realtime)

## ⚙️ Como rodar o projeto localmente

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/SEU-USUARIO/sorteio-de-times.git](https://github.com/SEU-USUARIO/sorteio-de-times.git)
   cd sorteio-de-times

```

2. **Instale as dependências:**
```bash
npm install

```


3. **Configure o Firebase:**
Crie um arquivo `src/firebase.js` na raiz do projeto e insira as suas chaves do Firebase:
```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  // ... outras chaves
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

```


4. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev

```


*Para testar no celular conectado à mesma rede WiFi, use `npm run dev -- --host*`

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Se você tem ideias para melhorar o algoritmo, adicionar gamificação (estatísticas, artilharia) ou criar a tela isolada para confirmação de presença dos jogadores, sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.

1. Faça um Fork do projeto
2. Crie sua *Feature Branch* (`git checkout -b feature/NovaFuncionalidade`)
3. Faça o Commit de suas mudanças (`git commit -m 'Add: Nova funcionalidade incrível'`)
4. Faça o Push para a Branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

```
