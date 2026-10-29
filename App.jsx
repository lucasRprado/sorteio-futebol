import { useState, useEffect } from 'react';

// ============================================================================
// CONFIGURAÇÕES GERAIS E REGRAS DE NEGÓCIO FIXAS
// ============================================================================

// Lista de nomes de jogadores que podem ser fixados em um time específico (Time 3).
const jogadoresFixosTime3 = ['Tibala', 'Hurtadinho'];
// Flag (interruptor) para ativar ou desativar a regra de jogadores fixos no Time Preto.
const fixarJogadoresNoTimePreto = true; // true = ativa a regra, false = desativa

/**
 * Algoritmo de Fisher-Yates para embaralhar arrays de forma eficiente e aleatória.
 * Usado para garantir que jogadores do mesmo nível ou goleiros não entrem sempre na mesma ordem.
 * 
 * @param {Array} lista - A lista original a ser embaralhada.
 * @returns {Array} Uma nova cópia da lista com os elementos em posições aleatórias.
 */
const embaralhar = (lista) => {
  const resultado = [...lista];
  for (let i = resultado.length - 1; i > 0; i--) {
    const indiceAleatorio = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[indiceAleatorio]] = [resultado[indiceAleatorio], resultado[i]];
  }
  return resultado;
};

function App() {
  // ============================================================================
  // ESTADOS DA APLICAÇÃO (STATE MANAGEMENT)
  // ============================================================================

  // Estado da lista de jogadores. É inicializado buscando os dados salvos no 
  // cache do navegador (localStorage) para não perder os dados ao recarregar a página.
  const [jogadores, setJogadores] = useState(() => {
    const saved = localStorage.getItem('jogadoresFutebol');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Estados vinculados ao formulário de cadastro de um novo jogador.
  const [nome, setNome] = useState('');
  const [nivel, setNivel] = useState(3);
  const [isGoleiro, setIsGoleiro] = useState(false);

  // Estados de configuração da partida/sorteio.
  const [qtdTimes, setQtdTimes] = useState(2);
  const [jogadoresPorTime, setJogadoresPorTime] = useState(5);
  
  // Estados para armazenar o resultado gerado pelo algoritmo e histórico.
  const [timesSorteados, setTimesSorteados] = useState([]);
  const [ultimoSorteio, setUltimoSorteio] = useState([]);
  const [reservas, setReservas] = useState([]);

  // ============================================================================
  // EFEITOS COLATERAIS (LIFECYCLE)
  // ============================================================================

  // Sempre que o array "jogadores" sofrer qualquer alteração (adição, remoção, edição),
  // este useEffect atualiza automaticamente o banco de dados local do navegador.
  useEffect(() => {
    localStorage.setItem('jogadoresFutebol', JSON.stringify(jogadores));
  }, [jogadores]);

  // ============================================================================
  // FUNÇÕES DE GERENCIAMENTO DA LISTA (CRUD)
  // ============================================================================

  /**
   * Valida o formulário e insere um novo jogador no final da lista.
   * Utiliza crypto.randomUUID() para garantir que cada jogador tenha um ID único.
   */
  const adicionarJogador = (e) => {
    e.preventDefault();
    if (!nome.trim()) return alert('Digite o nome do jogador!');
    const novoJogador = { id: crypto.randomUUID(), nome, nivel: Number(nivel), isGoleiro, capitao: false, participaHoje: true };
    setJogadores([...jogadores, novoJogador]);
    setNome(''); setNivel(3); setIsGoleiro(false);
  };

  /**
   * Filtra a lista removendo o jogador que possui o ID correspondente.
   */
  const removerJogador = (id) => {
    setJogadores(jogadores.filter(j => j.id !== id));
  };

  /**
   * Move um jogador para cima ou para baixo na lista visual.
   * Muito útil para organização manual pelo usuário antes do sorteio.
   */
  const moverJogador = (id, deslocamento) => {
    setJogadores(lista => {
      const indiceAtual = lista.findIndex(j => j.id === id);
      const novoIndice = indiceAtual + deslocamento;
      // Impede movimentação se o jogador já estiver no topo ou no final da lista.
      if (indiceAtual < 0 || novoIndice < 0 || novoIndice >= lista.length) return lista;

      const novaLista = [...lista];
      // Faz a troca (swap) de posições entre o item atual e o alvo.
      [novaLista[indiceAtual], novaLista[novoIndice]] = [novaLista[novoIndice], novaLista[indiceAtual]];
      return novaLista;
    });
  };

  /**
   * Reorganiza a lista inteira considerando a ordem alfabética dos nomes.
   * Utiliza 'pt-BR' para respeitar acentuação na ordenação.
   */
  const ordenarJogadoresAlfabeticamente = () => {
    setJogadores(lista =>
      [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
    );
  };

  /**
   * Alterna a flag "participaHoje" (usada na checkbox da interface) para
   * incluir ou excluir rapidamente um jogador do próximo sorteio.
   */
  const alternarParticipacao = (id) => {
    setJogadores(jogadores.map(j => 
      j.id === id ? { ...j, participaHoje: !j.participaHoje } : j
    ));
  };

  /**
   * Define um jogador como capitão. O algoritmo impõe uma trava onde a quantidade
   * total de capitães não pode exceder o número de times configurados.
   */
  const alternarCapitao = (id) => {
    const jogador = jogadores.find(j => j.id === id);
    if (!jogador) return;

    if (!jogador.capitao && jogadores.filter(j => j.capitao).length >= Number(qtdTimes)) {
      return alert(`Cada time terá um capitão. Selecione no máximo ${qtdTimes} capitães.`);
    }

    setJogadores(jogadores.map(j =>
      j.id === id ? { ...j, capitao: !j.capitao } : j
    ));
  };

  /**
   * Atualiza as estrelas (nível) do jogador no banco de dados.
   */
  const alterarNivel = (id, novoNivel) => {
    setJogadores(jogadores.map(j =>
      j.id === id ? { ...j, nivel: Number(novoNivel) } : j
    ));
  };

  // ============================================================================
  // LÓGICA PRINCIPAL: ALGORITMO DO SORTEIO
  // ============================================================================

  const sortearTimes = () => {
    // 1. VALIDAÇÕES INICIAIS DA REGRA DE TIMES FIXOS
    if (fixarJogadoresNoTimePreto && qtdTimes < 3) {
      return alert('O sorteio precisa ter pelo menos 3 times para incluir os jogadores fixos no Time 3.');
    }
    if (fixarJogadoresNoTimePreto && jogadoresPorTime < jogadoresFixosTime3.length) {
      return alert(`O Time 3 precisa ter capacidade para pelo menos ${jogadoresFixosTime3.length} jogadores fixos.`);
    }

    // Filtra apenas os jogadores confirmados para jogar ("participaHoje" === true)
    const participantes = jogadores.filter(j => j.participaHoje);
    
    // Busca na base os objetos completos dos jogadores fixos comparando pelo nome
    const participantesFixos = fixarJogadoresNoTimePreto ? jogadoresFixosTime3.map(nomeFixo => {
      const correspondentes = participantes.filter(
        j => j.nome.trim().toLocaleLowerCase() === nomeFixo.toLocaleLowerCase()
      );
      if (correspondentes.length !== 1) return null;
      return correspondentes[0];
    }) : [];

    // Checa se algum jogador fixo obrigatório não está cadastrado ou está ausente
    const jogadoresFixosInvalidos = fixarJogadoresNoTimePreto
      ? jogadoresFixosTime3.filter((_, index) => !participantesFixos[index])
      : [];
    if (jogadoresFixosInvalidos.length > 0) {
      return alert(
        `Cadastre e marque como participantes os jogadores fixos do Time 3: ${jogadoresFixosInvalidos.join(', ')}.`
      );
    }

    // 2. VALIDAÇÃO DE CAPITÃES
    const capitaes = participantes.filter(j => j.capitao);
    if (capitaes.length !== Number(qtdTimes)) {
      return alert(`Selecione exatamente ${qtdTimes} capitães participantes, um para cada time.`);
    }

    // Garante que o grupo "Fixo" tenha no máximo 1 capitão configurado
    const idsJogadoresFixos = new Set(participantesFixos.map(j => j.id));
    const capitaesFixos = capitaes.filter(j => idsJogadoresFixos.has(j.id));
    if (fixarJogadoresNoTimePreto && capitaesFixos.length > 1) {
      return alert('No máximo um dos jogadores fixos do Time 3 pode ser capitão.');
    }

    // 3. SEPARAÇÃO E ORDENAÇÃO DE FORÇAS
    // Divide os jogadores entre goleiros e linha, já ordenando do mais forte (5) para o mais fraco (1)
    let goleiros = embaralhar(participantes.filter(j => j.isGoleiro)).sort((a, b) => b.nivel - a.nivel);
    let linha = embaralhar(participantes.filter(j => !j.isGoleiro)).sort((a, b) => b.nivel - a.nivel);
    
    // Remove os jogadores fixos das listas de sorteio geral para evitar alocação dupla
    goleiros = goleiros.filter(j => !idsJogadoresFixos.has(j.id));
    linha = linha.filter(j => !idsJogadoresFixos.has(j.id));

    // 4. CRIAÇÃO DAS ESTRUTURAS (CABEÇALHOS) DOS TIMES
    const cores = [
      { nome: 'Azul 🔵', valor: '#3b82f6' },
      { nome: 'Vermelho 🔴', valor: '#ef4444' },
      { nome: 'Preto ⚫', valor: '#111827' },
      { nome: 'Amarelo 🟡', valor: '#eab308' },
      { nome: 'Verde 🟢', valor: '#22c55e' },
      { nome: 'Branco ⚪', valor: '#d1d5db' }
    ];
    const times = Array.from({ length: qtdTimes }, (_, i) => ({
      id: i,
      nome: `Time ${cores[i % cores.length].nome}`,
      cor: cores[i % cores.length].valor,
      jogadores: [],
      somaNivel: 0
    }));

    // 5. ALOCAÇÃO DOS JOGADORES FIXOS (TIME 3)
    if (fixarJogadoresNoTimePreto) {
      participantesFixos.forEach(jogador => {
        times[2].jogadores.push(jogador); // times[2] refere-se ao 3º time da lista
        times[2].somaNivel += jogador.nivel;
      });
    }

    // 6. ALOCAÇÃO DE CAPITÃES
    const capitoesAlocados = new Set();
    
    // Se o time 3 for fixo, resolve a questão do capitão desse time primeiro
    if (fixarJogadoresNoTimePreto) {
      const capitaoTime3 = capitaesFixos[0] || capitaes.find(j => !idsJogadoresFixos.has(j.id));
      if (!capitaoTime3) {
        return alert('Não foi possível definir um capitão para o Time 3.');
      }
      if (!idsJogadoresFixos.has(capitaoTime3.id)) {
        times[2].jogadores.push(capitaoTime3);
        times[2].somaNivel += capitaoTime3.nivel;
      }
      capitoesAlocados.add(capitaoTime3.id);

      if (times[2].jogadores.length > jogadoresPorTime) {
        return alert('O Time 3 precisa ter capacidade para os jogadores fixos e seu capitão.');
      }
    }

    // Embaralha e distribui os capitães restantes para as cabeças de chave dos outros times
    const outrosCapitaes = embaralhar(capitaes.filter(j => !capitoesAlocados.has(j.id)));
    let indiceCapitao = 0;
    times.forEach((time, index) => {
      if (fixarJogadoresNoTimePreto && index === 2) return;
      const capitao = outrosCapitaes[indiceCapitao++];
      time.jogadores.push(capitao);
      time.somaNivel += capitao.nivel; // O nível do capitão já é somado à base da equipe
    });

    // Remove os capitães das listas de goleiros e linha para o restante do sorteio
    const idsCapitaes = new Set(capitaes.map(j => j.id));
    goleiros = goleiros.filter(j => !idsCapitaes.has(j.id));
    linha = linha.filter(j => !idsCapitaes.has(j.id));

    let sobras = [];

    // 7. DISTRIBUIÇÃO DE GOLEIROS
    goleiros.forEach(goleiro => {
      // Procura de forma aleatória algum time que ainda não tenha goleiro e tenha vaga
      const timesSemGoleiro = embaralhar(times.filter(
        t => !t.jogadores.some(j => j.isGoleiro) && t.jogadores.length < jogadoresPorTime
      ));
      const timeSemGoleiro = timesSemGoleiro[0];
      
      if (timeSemGoleiro && timeSemGoleiro.jogadores.length < jogadoresPorTime) {
        timeSemGoleiro.jogadores.push(goleiro);
        timeSemGoleiro.somaNivel += goleiro.nivel;
      } else {
        sobras.push(goleiro); // Vai para reserva se todos os times tiverem goleiro
      }
    });

    // 8. DISTRIBUIÇÃO BALANCEADA (NIVELAMENTO) DOS JOGADORES DE LINHA
    linha.forEach(jogador => {
      // Filtra os times que ainda têm capacidade para receber o jogador
      const timesComVaga = times.filter(t => t.jogadores.length < jogadoresPorTime);
      
      if (timesComVaga.length > 0) {
        // Encontra o(s) time(s) com o menor nível somado até aquele momento
        const menorSoma = Math.min(...timesComVaga.map(t => t.somaNivel));
        const timesComMenorSoma = timesComVaga.filter(t => t.somaNivel === menorSoma);
        
        // Em caso de empate na força, joga aleatório para não "viciar" a distribuição
        const timeEscolhido = timesComMenorSoma[Math.floor(Math.random() * timesComMenorSoma.length)];
        timeEscolhido.jogadores.push(jogador);
        timeEscolhido.somaNivel += jogador.nivel;
      } else {
        sobras.push(jogador); // Cai na reserva se todos os times já estiverem com capacidade máxima
      }
    });

    // 9. MECANISMO DE ANTI-REPETIÇÃO DO SORTEIO (SHUFFLE DE EMPATE)
    // Se o usuário clicar para sortear novamente e os times ficarem estritamente iguais, 
    // o algoritmo força uma troca de jogadores equivalentes para gerar times diferentes com a mesma força.
    const mesmoSorteioAnterior = ultimoSorteio.length === times.length && times.every((time, index) => {
      const jogadoresAtuais = time.jogadores.map(j => j.id).sort().join(',');
      const jogadoresAnteriores = ultimoSorteio[index].jogadores.map(j => j.id).sort().join(',');
      return jogadoresAtuais === jogadoresAnteriores;
    });

    if (mesmoSorteioAnterior) {
      const trocasPossiveis = [];
      times.forEach((timeA, indiceA) => {
        timeA.jogadores.forEach((jogadorA, indiceJogadorA) => {
          if (idsJogadoresFixos.has(jogadorA.id)) return;

          times.forEach((timeB, indiceB) => {
            if (indiceB <= indiceA) return;
            timeB.jogadores.forEach((jogadorB, indiceJogadorB) => {
              // Não permite trocar jogadores fixos nem trocar capitão por não-capitão
              if (
                idsJogadoresFixos.has(jogadorB.id) ||
                Boolean(jogadorA.capitao) !== Boolean(jogadorB.capitao)
              ) return;

              // Regras de validação para trocas envolvendo Goleiros
              const timeARecebeGoleiro = jogadorB.isGoleiro && !jogadorA.isGoleiro;
              const timeBRecebeGoleiro = jogadorA.isGoleiro && !jogadorB.isGoleiro;
              const timeAJaTemOutroGoleiro = timeA.jogadores.some(j => j.isGoleiro && j.id !== jogadorA.id);
              const timeBJaTemOutroGoleiro = timeB.jogadores.some(j => j.isGoleiro && j.id !== jogadorB.id);
              if (
                (timeARecebeGoleiro && timeAJaTemOutroGoleiro) ||
                (timeBRecebeGoleiro && timeBJaTemOutroGoleiro)
              ) return;

              // Registra essa troca como viável para o algoritmo escolher depois
              trocasPossiveis.push({ indiceA, indiceJogadorA, indiceB, indiceJogadorB });
            });
          });
        });
      });

      // Efetiva a troca aleatória e recalcula as somas dos níveis dos dois times envolvidos
      if (trocasPossiveis.length > 0) {
        const troca = trocasPossiveis[Math.floor(Math.random() * trocasPossiveis.length)];
        const jogadorA = times[troca.indiceA].jogadores[troca.indiceJogadorA];
        const jogadorB = times[troca.indiceB].jogadores[troca.indiceJogadorB];
        times[troca.indiceA].jogadores[troca.indiceJogadorA] = jogadorB;
        times[troca.indiceB].jogadores[troca.indiceJogadorB] = jogadorA;
        times[troca.indiceA].somaNivel += jogadorB.nivel - jogadorA.nivel;
        times[troca.indiceB].somaNivel += jogadorA.nivel - jogadorB.nivel;
      }
    }

    // Registra os estados de interface para exibição e histórico
    setTimesSorteados(times);
    setUltimoSorteio(times);
    setReservas(sobras);
  };

  /**
   * Remove o sorteio gerado da tela sem alterar a configuração inicial.
   */
  const limparSorteio = () => {
    setTimesSorteados([]);
    setReservas([]);
  };

  // ============================================================================
  // FUNÇÕES DE EXPORTAÇÃO
  // ============================================================================
  
  /**
   * Varre a matriz de timesSorteados gerada pelo algoritmo e cria uma string (texto)
   * formatada em blocos e com emojis para envio direto pelo link universal do WhatsApp.
   */
  const copiarParaWhatsApp = () => {
    let texto = '⚽ *SORTEIO DE TIMES* ⚽\n\n';
    
    timesSorteados.forEach(time => {
      texto += `*${time.nome} (Força: ${time.somaNivel})*\n`;
      time.jogadores.forEach(j => {
        texto += `• ${j.nome} ${j.capitao ? '(C) ' : ''}${j.isGoleiro ? '🧤' : ''}\n`;
      });
      texto += '\n';
    });

    if (reservas.length > 0) {
      texto += '🔄 *Reservas / De Fora*\n';
      reservas.forEach(j => {
        texto += `• ${j.nome} ${j.isGoleiro ? '🧤' : ''}\n`;
      });
    }

    // Codifica o texto para o formato de URL e abre o WhatsApp
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  // ============================================================================
  // RENDERIZAÇÃO DA INTERFACE (JSX)
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 font-sans pb-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- LADO ESQUERDO: CADASTRO E ELENCO --- */}
        <div className="space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">Sorteio de Times ⚽</h1>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Novo Jogador</h2>
            <form onSubmit={adicionarJogador} className="space-y-4">
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do jogador" className="w-full p-2 border rounded" />
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="text-sm text-gray-600">Nível: {nivel} ⭐</label>
                  <input type="range" min="1" max="5" value={nivel} onChange={(e) => setNivel(e.target.value)} className="w-full" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={isGoleiro} onChange={(e) => setIsGoleiro(e.target.checked)} className="w-5 h-5" />
                  Goleiro
                </label>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded">Adicionar</button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md max-h-[500px] overflow-y-auto">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Elenco ({jogadores.length})</h2>
              <button
                type="button"
                onClick={ordenarJogadoresAlfabeticamente}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-semibold px-3 py-2 rounded"
              >
                Ordenar A–Z
              </button>
            </div>
            <ul className="space-y-2">
              {jogadores.map((j, index) => (
                <li key={j.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 bg-gray-50 border rounded">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={j.participaHoje} onChange={() => alternarParticipacao(j.id)} className="w-5 h-5 text-green-500" />
                    <span className={j.participaHoje ? 'font-bold' : 'text-gray-400 line-through'}>
                      {j.nome} {j.isGoleiro && '🧤'}
                    </span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moverJogador(j.id, -1)}
                        disabled={index === 0}
                        aria-label={`Mover ${j.nome} para cima`}
                        className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed px-1"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moverJogador(j.id, 1)}
                        disabled={index === jogadores.length - 1}
                        aria-label={`Mover ${j.nome} para baixo`}
                        className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed px-1"
                      >
                        ▼
                      </button>
                    </div>
                    <label className="flex items-center gap-1 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={Boolean(j.capitao)} onChange={() => alternarCapitao(j.id)} className="w-4 h-4" />
                      Capitão (C)
                    </label>
                    <label className="flex items-center gap-1 text-sm font-bold text-blue-600">
                      <span>Nível:</span>
                      <select
                        value={j.nivel}
                        onChange={(e) => alterarNivel(j.id, e.target.value)}
                        className="p-1 border rounded bg-white"
                        aria-label={`Nível de ${j.nome}`}
                      >
                        {[1, 2, 3, 4, 5].map(valor => (
                          <option key={valor} value={valor}>{valor}⭐</option>
                        ))}
                      </select>
                    </label>
                    <button onClick={() => removerJogador(j.id)} className="text-red-500 text-sm">X</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- LADO DIREITO: CONFIGURAÇÃO DE SORTEIO E RESULTADOS --- */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Configurar Sorteio</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600">Qtd de Times</label>
                <input type="number" min="2" value={qtdTimes} onChange={(e) => setQtdTimes(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Jogadores por Time</label>
                <input type="number" min="2" value={jogadoresPorTime} onChange={(e) => setJogadoresPorTime(e.target.value)} className="w-full p-2 border rounded" />
              </div>
            </div>
            
            <button onClick={sortearTimes} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded text-lg transition shadow-lg">
              🎲 Sortear Times
            </button>
          </div>

          {/* Exibição condicional: Só mostra o bloco abaixo se o sorteio já tiver acontecido */}
          {timesSorteados.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={copiarParaWhatsApp}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded text-lg transition flex items-center justify-center gap-2 shadow-lg"
                >
                  💬 Copiar para WhatsApp
                </button>
                <button
                  onClick={limparSorteio}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded text-lg transition shadow-lg"
                >
                  🧹 Limpar sorteio
                </button>
              </div>

              {timesSorteados.map(time => (
                <div
                  key={time.id}
                  className="bg-white p-4 rounded-lg shadow border-l-4"
                  style={{ borderLeftColor: time.cor }}
                >
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h3 className="font-bold text-lg">{time.nome}</h3>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded font-bold">
                      Força Total: {time.somaNivel}
                    </span>
                  </div>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {time.jogadores.map(j => (
                      <li key={j.id}>
{j.nome} {j.capitao && <span className="font-bold text-amber-600">(C) </span>}{j.isGoleiro && '🧤'}</li>
                    ))}
                  </ul>
                  {time.jogadores.length === 0 && <p className="text-gray-400 text-sm">Nenhum jogador.</p>}
                </div>
              ))}

              {reservas.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500 mt-4">
                  <h3 className="font-bold text-lg border-b pb-2 mb-2">Reservas / De Fora</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {reservas.map(j => (
                      <li key={j.id}>
{j.nome} {j.isGoleiro && '🧤'}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;