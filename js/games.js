
    // --- BASES DE DATOS SIMULADAS PARA NUEVOS JUEGOS ---
    const dbExtraCasos = [
      { q: "Siento que nada de lo que hago tiene sentido últimamente.", correct: "Entiendo que te sientes desmotivado y vacío en este momento.", wrong: ["Deberías salir a caminar, eso ayuda.", "No digas eso, tienes muchas cosas buenas.", "¿Por qué no pruebas un nuevo hobby?"] },
      { q: "Mi pareja me dejó y siento que me muero.", correct: "Sientes un dolor muy profundo y abrumador por esta pérdida.", wrong: ["Ya vas a encontrar a alguien mejor.", "El tiempo lo cura todo, ten paciencia.", "Quizás no era la persona indicada para ti."] },
      { q: "Tengo mucho miedo de hablar en público, me paralizo.", correct: "La idea de exponerte frente a otros te genera una gran ansiedad.", wrong: ["Solo imagina que están todos desnudos.", "No te preocupes, a todos les pasa.", "Tienes que ser valiente y enfrentarlo."] }
    ];
    
    const dbExtraEmpatia = [
      { text: "Comprendo que esta situación te resulta muy frustrante.", isEmpatia: true },
      { text: "No te pongas así, no es para tanto.", isEmpatia: false },
      { text: "Veo que esto te ha dolido más de lo que esperabas.", isEmpatia: true },
      { text: "Yo en tu lugar habría hecho lo mismo.", isEmpatia: false },
      { text: "Debe ser muy difícil lidiar con tanta presión.", isEmpatia: true },
      { text: "Mira el lado positivo, al menos tienes salud.", isEmpatia: false }
    ];

    const dbExtraAutores = [
      { cita: "El organismo tiene una tendencia y un esfuerzo básicos: actualizarse, mantenerse y enriquecer las experiencias.", autor: "Carl Rogers" },
      { cita: "Al hombre se le puede arrebatar todo salvo una cosa: la última de las libertades humanas —la elección de la actitud personal.", autor: "Viktor Frankl" },
      { cita: "No estoy en este mundo para estar a la altura de tus expectativas, ni tú para estar a la altura de las mías.", autor: "Fritz Perls" },
      { cita: "La neurosis es siempre un sustituto de un sufrimiento legítimo.", autor: "Carl Jung" },
      { cita: "Lo que las personas sienten es tan importante como lo que hacen o piensan.", autor: "Irvin Yalom" }
    ];

    const frasesCounselor = [
      "La escucha activa es tu mejor herramienta.", "Confía en la tendencia actualizante.",
      "Validar las emociones abre puertas.", "No juzgues, comprende profundamente.",
      "La aceptación incondicional sana.", "Acompaña sin dirigir el camino.",
      "El silencio también es una intervención.", "Muestra congruencia en cada respuesta.",
      "La empatía construye puentes duraderos.", "El cambio ocurre en el aquí y el ahora.",
      "Cada consultante tiene su propio ritmo.", "El respeto profundo transforma realidades.",
      "Conectar es más importante que intervenir.", "La vulnerabilidad es un acto de valentía.",
      "Aceptar no es estar de acuerdo, es acoger.", "El autodescubrimiento sana heridas.",
      "Somos facilitadores, no salvadores.", "Toda emoción tiene una función legítima.",
      "La congruencia genera confianza genuina.", "Reflejar sentimientos es un arte clínico.",
      "El silencio terapéutico habla volumenes.", "No hay emociones buenas o malas.",
      "Permite que la experiencia fluya.", "El individuo es su mejor experto.",
      "Sostener la mirada es sostener el alma.", "Caminar al lado, nunca por delante.",
      "Validar es reconocer la verdad del otro.", "La autenticidad es la base del encuentro."
    ];

    const elArcadeView = document.getElementById('arcade-main-view');

    let timerGlobal = null; 
    let loopInvasores = null;
    let loopRunner = null;
    
    // --- VARIABLES GLOBALES, RESPUESTAS Y MARATÓN ---
    let puntajeGlobalTotal = 0;
    let historialRespuestas = [];
    let modoMaraton = false;
    let indiceMaraton = 0;
    let puntajeMaraton = 0;
    let maxPuntajeMaraton = 0;
    
    let modoFlash = false;
    let flashTimerInterval = null;
    let flashTimeRestante = 60;

    const MARATON_JUEGOS = [
      () => startFlashcards(), () => startTrivia(1), () => startTrivia(2),
      () => startMatching(), () => startHangman(), () => startSimulador(),
      () => startEmpatia(), () => startCorrientes(), () => startAutores(),
      () => startCrucigrama(), () => startFragmentado(), () => startBombardeo(),
      () => startWordle(), () => startSopa(), () => startInvasores(), () => startRunner()
    ];

    // --- AUDIO API: MÚSICA MIDI POR JUEGO Y NEON ---
    let audioCtx = null;
    let activeOscillators = [];
    const neonColors = ['#ff00ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000', '#ff9900'];

    function initAudio() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function stopMidiMusic() {
      activeOscillators.forEach(osc => { try { osc.stop(); } catch(e) {} });
      activeOscillators = [];
    }

    function playMarimbaHover() {
        initAudio();
        if(!audioCtx) return;
        const t = audioCtx.currentTime;
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        let notes = [392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[Math.floor(Math.random()*notes.length)], t);
        
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3); 
        
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.3);
    }

    function playMidiTheme(gameString) {
      initAudio();
      stopMidiMusic();
      if (!audioCtx) return;

      const t = audioCtx.currentTime;
      let melody = [];
      let tempo = 0.25;
      let type = 'sine';

      switch(gameString) {
        case 'arcade_intro': melody = [523.25, 659.25, 783.99, 1046.50, 783.99, 1318.51, 1046.50, 1567.98]; tempo = 0.12; type = 'square'; break;
        case 'flashcards': melody = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50, 1318.51, 1046.50]; tempo=0.18; type='triangle'; break;
        case 'trivia_1': case 'trivia_2': melody = [440, 440, 554.37, 659.25, 554.37, 440, 329.63, 440]; tempo=0.2; type='square'; break;
        case 'matching': melody = [392, 493.88, 587.33, 783.99, 587.33, 783.99, 987.77, 783.99]; tempo=0.15; break;
        case 'hangman': melody = [220, 207.65, 196, 185, 220, 261.63, 293.66, 261.63]; tempo=0.3; type='sawtooth'; break;
        case 'simulador': melody = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25, 659.25, 523.25]; tempo=0.25; type='triangle'; break;
        case 'empatia': melody = [523.25, 659.25, 783.99, 1046.50, 659.25, 783.99, 1046.50, 1318.51]; tempo=0.18; break;
        case 'corrientes': melody = [349.23, 440, 523.25, 698.46, 523.25, 698.46, 880, 698.46]; tempo=0.2; type='square'; break;
        case 'autores': melody = [493.88, 440, 392, 493.88, 587.33, 493.88, 659.25, 587.33]; tempo=0.22; type='square'; break;
        case 'crucigrama': melody = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25]; tempo=0.15; type='triangle'; break;
        case 'fragmentado': melody = [659.25, 523.25, 659.25, 783.99, 659.25, 523.25, 783.99, 1046.50]; tempo=0.15; break;
        case 'bombardeo': melody = [880, 880, 880, 1046.50, 880, 1046.50, 1318.51, 1046.50]; tempo=0.12; type='sawtooth'; break;
        case 'wordle': melody = [392, 523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50, 1318.51]; tempo=0.2; type='triangle'; break;
        case 'sopa': melody = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.50]; tempo=0.12; type='square'; break;
        case 'invasores': melody = [196, 185, 174.61, 164.81, 196, 220, 196, 164.81]; tempo=0.25; type='sawtooth'; break;
        case 'runner': melody = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 523.25, 659.25]; tempo=0.15; type='square'; break;
        default: melody = [440, 880, 440, 880, 659.25]; tempo=0.2; break;
      }

      melody.forEach((freq, i) => {
        let osc1 = audioCtx.createOscillator();
        let osc2 = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        
        osc1.type = type;
        osc2.type = type === 'sine' ? 'triangle' : 'sine';
        
        osc1.frequency.setValueAtTime(freq, t + i*tempo);
        osc2.frequency.setValueAtTime(freq * 1.01, t + i*tempo);
        
        gain.gain.setValueAtTime(0.08, t + i*tempo);
        gain.gain.setTargetAtTime(0, t + i*tempo + tempo*0.8, 0.05);
        
        osc1.connect(gain); osc2.connect(gain); gain.connect(audioCtx.destination);
        
        osc1.start(t + i*tempo); osc1.stop(t + i*tempo + tempo);
        osc2.start(t + i*tempo); osc2.stop(t + i*tempo + tempo);
        
        activeOscillators.push(osc1, osc2);
      });
    }

    // --- MENSAJES DEL TABLERO GLOBAL ---
    function obtenerMensajeCounselor() {
      return frasesCounselor[Math.floor(Math.random() * frasesCounselor.length)];
    }

    setInterval(() => {
      const msgs = document.querySelectorAll('.counselor-msg');
      msgs.forEach(msg => {
        msg.style.opacity = 0;
        setTimeout(() => {
          msg.innerText = '"' + obtenerMensajeCounselor() + '"';
          msg.style.opacity = 1;
        }, 400);
      });
    }, 15000);

    function renderDashboardHTML() {
      return `
        <div class="global-dashboard">
          <div class="dashboard-counselor">
            <span class="counselor-avatar">🧠</span>
            <span class="counselor-msg">"${obtenerMensajeCounselor()}"</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
            <div class="dashboard-score" id="ui-global-score">
              🏆 Global: ${puntajeGlobalTotal} pts
            </div>
          </div>
        </div>
      `;
    }

    function updatePuntajeGlobal(puntos) {
      puntajeGlobalTotal += puntos;
      const el = document.getElementById('ui-global-score');
      if(el) {
        el.innerHTML = `🏆 Global: ${puntajeGlobalTotal} pts`;
        el.style.transform = "scale(1.1)";
        el.style.color = puntos > 0 ? "#2ecc71" : "#e74c3c";
        setTimeout(() => { el.style.transform = "scale(1)"; el.style.color = "#8e44ad"; }, 300);
      }
    }

    function obtenerManual() {
        const manuals = {
            flashcards: "Gira la tarjeta haciendo clic sobre ella. Evalúa tu conocimiento usando los botones inferiores.",
            trivia_1: "Lee la definición detenidamente y haz clic en el concepto que le corresponda.",
            trivia_2: "Indica si la afirmación es Verdadera o Falsa según el glosario.",
            matching: "Haz clic en un concepto y luego en su definición para emparejarlos. Repite hasta vaciar el tablero.",
            hangman: "Adivina el concepto letra por letra. Tienes 6 vidas, usa la pista sabiamente.",
            simulador: "Lee lo que dice el consultante y elige la intervención del Counselor más empática y libre de juicios.",
            empatia: "Clasifica velozmente si la frase es una respuesta empática (verde) o una barrera/simpatía inadecuada (rojo).",
            corrientes: "Haz clic en la corriente teórica (caja) a la que pertenece el concepto que aparece en pantalla.",
            autores: "Descubre qué autor célebre de la psicología o el counseling formuló la cita en pantalla.",
            crucigrama: "Escribe las palabras exactas para cada definición en los campos de texto y luego comprueba tus respuestas.",
            fragmentado: "Haz clic en los fragmentos de texto en el orden correcto para reconstruir la oración terapéutica.",
            bombardeo: "Selecciona las respuestas correctas lo más rápido posible. El juego termina cuando el temporizador llega a cero.",
            wordle: "Adivina el concepto. Si la letra está en su posición correcta se pintará de verde; si existe pero en otro lugar, de amarillo.",
            sopa: "Selecciona las letras del tablero para formar el concepto indicado. Tienes 10 rondas para resolver todo lo más rápido que puedas.",
            invasores: "Usa Flechas o Botones Izq/Der para moverte. Dispara Empatía (Espacio/Botón) para eliminar los bloqueos que caen. Atrapa los regalos 🎁 para mejorar tus habilidades.",
            runner: "La carrera de la Alianza Terapéutica. Toca la pantalla o presiona Espacio/Arriba para saltar (y doble salto). Esquiva bloqueos y atrapa la escucha activa."
        };
        if(!manuals[juegoActual]) return "";
        return `<div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-top: 3px dashed #cbd5e1; color: #64748b; font-size: 1.1rem; text-align: left; border-radius: 12px; font-family:'Roboto',sans-serif;"><strong>📖 Instrucciones:</strong> ${manuals[juegoActual]}</div>`;
    }

    function cancelarTimersGlobales() {
      if(timerGlobal) clearInterval(timerGlobal);
      if(loopInvasores) cancelAnimationFrame(loopInvasores);
      if(loopRunner) cancelAnimationFrame(loopRunner);
      if(flashTimerInterval) clearInterval(flashTimerInterval);
      stopMidiMusic();
      modoFlash = false;
      let existingFlashUI = document.getElementById('flash-timer-ui');
      if(existingFlashUI) existingFlashUI.remove();
    }

    function normalizarP(str) { return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : ''; }
    function mezclarArray(arr) { return [...arr].sort(() => Math.random() - 0.5); }
    function obtenerOpcionesCuatro(correcta, pool) {
      let s = new Set([correcta]);
      while(s.size < 4 && pool.length >= 4) { s.add(pool[Math.floor(Math.random() * pool.length)]); }
      return Array.from(s).sort(() => Math.random() - 0.5);
    }
    function escapeString(str) { return str.replace(/'/g, "\'").replace(/"/g, '&quot;'); }

    let juegoActual = ''; let ronda = 0; let puntajeJuego = 0; let bancoJuego = [];
    // Nota: Asegúrate de que dbGlosario esté definida en tu front-end o usa window.dbGlosario
    const listaTitulosGlobal = dbGlosario.map(g => g.titulo);

    function startMaraton() {
      modoMaraton = true; indiceMaraton = 0; puntajeMaraton = 0; maxPuntajeMaraton = 0;
      MARATON_JUEGOS[0]();
    }

    function startFlashChallenge() {
      modoFlash = true; flashTimeRestante = 60;
      let randIndex = Math.floor(Math.random() * MARATON_JUEGOS.length);
      
      let flashUI = document.createElement('div');
      flashUI.id = 'flash-timer-ui'; flashUI.className = 'flash-timer-overlay'; flashUI.innerText = "⏱️ 60s";
      document.body.appendChild(flashUI);

      MARATON_JUEGOS[randIndex]();

      flashTimerInterval = setInterval(() => {
        flashTimeRestante--;
        let ui = document.getElementById('flash-timer-ui');
        if(ui) ui.innerText = `⏱️ ${flashTimeRestante}s`;
        
        if(flashTimeRestante <= 0) {
            clearInterval(flashTimerInterval); modoFlash = false;
            if(ui) ui.remove();
            alert("⚡ ¡Tiempo Flash Cumplido!"); renderFinalResult();
        }
      }, 1000);
    }

    function renderArcadeMenu() {
      cancelarTimersGlobales();
      modoMaraton = false; juegoActual = '';

      const arcadeGames = [
        { action: 'startBombardeo()', icon: '⏱️', name: 'Bombardeo', desc: 'Modo Contrarreloj.' },
        { action: 'startCorrientes()', icon: '🗂️', name: 'Cajas', desc: 'Clasifica enfoques.' },
        { action: 'startAutores()', icon: '👤', name: 'Citas', desc: '¿Quién lo dijo?' },
        { action: 'startCrucigrama()', icon: '📝', name: 'Crucigrama', desc: 'Escribe la palabra.' },
        { action: 'startHangman()', icon: '🔤', name: 'El Ahorcado', desc: 'Adivina la palabra.' },
        { action: 'startMatching()', icon: '🔗', name: 'Emparejamiento', desc: 'Conecta conceptos.' },
        { action: 'startEmpatia()', icon: '⚖️', name: 'Empatía o no', desc: 'Clasifica rápido.' },
        { action: 'startFragmentado()', icon: '🧩', name: 'Fragmentado', desc: 'Reconstruye la frase.' },
        { action: 'startInvasores()', icon: '🚀', name: 'Invasores', desc: 'Destruye bloqueos.' },
        { action: 'startSimulador()', icon: '💬', name: 'Simulador', desc: 'Elige qué decir.' },
        { action: 'startSopa()', icon: '🔍', name: 'Sopa de Letras', desc: 'Encuentra conceptos.' },
        { action: 'startRunner()', icon: '🍄', name: 'Super Runner', desc: 'Corre y salta barreras.' },
        { action: 'startFlashcards()', icon: '🃏', name: 'Tarjetas', desc: 'Tarjetas de memoria.' },
        { action: 'startTrivia(1)', icon: '❓', name: 'Trivia Clásica', desc: 'Adivina la definición.' },
        { action: 'startTrivia(2)', icon: '⏳', name: 'V o F', desc: 'Verdadero o falso.' },
        { action: 'startWordle()', icon: '🟩', name: 'Wordle', desc: 'Adivina el término.' }
      ];

      arcadeGames.sort((a, b) => a.name.localeCompare(b.name, 'es'));

      let gamesHtml = arcadeGames.map(g => {
        let neonColor = neonColors[Math.floor(Math.random() * neonColors.length)];
        return `<div class="arcade-card neon-hover" style="--neon: ${neonColor}" onclick="${g.action}" onmouseenter="playMarimbaHover()"><div class="arcade-icon">${g.icon}</div><div class="arcade-name">${g.name}</div><div class="arcade-desc">${g.desc}</div></div>`;
      }).join('');
      
      let neon1 = neonColors[Math.floor(Math.random() * neonColors.length)];
      let neon2 = neonColors[Math.floor(Math.random() * neonColors.length)];

      elArcadeView.innerHTML = renderDashboardHTML() + `
        <h2 class="arcade-title">🕹️ COUNSELOR PLAY</h2>
        <p class="arcade-subtitle">Elige una modalidad para repasar interactivamente</p>
        
        <div class="arcade-top-actions">
          <div class="arcade-card neon-hover" style="border-color: #f39c12; background: #fef9e7; --neon: ${neon1};" onclick="startMaraton()" onmouseenter="playMarimbaHover()">
            <div class="arcade-icon">🏃‍♂️</div>
            <div class="arcade-name">MARATÓN DE COUNSELING</div>
            <div class="arcade-desc">Juega las 16 modalidades de corrido.</div>
          </div>
          <div class="arcade-card neon-hover" style="border-color: #ff4757; background: #fff0f1; --neon: ${neon2};" onclick="startFlashChallenge()" onmouseenter="playMarimbaHover()">
            <div class="arcade-icon">⚡</div>
            <div class="arcade-name">DESAFÍO RANDOM FLASH</div>
            <div class="arcade-desc">60 Segundos. Juego Aleatorio. ¡Pon a prueba tu velocidad!</div>
          </div>
        </div>
        
        <div class="arcade-grid-4x4">
          ${gamesHtml}
        </div>
      `;
    }

    // --- 1. FLASHCARDS ---
    function startFlashcards() { playMidiTheme('flashcards'); historialRespuestas = []; juegoActual = 'flashcards'; ronda = 0; puntajeJuego = 0; bancoJuego = mezclarArray(dbGlosario).slice(0, 10); renderFlashcardRonda(); }
    function renderFlashcardRonda() {
      if(ronda >= 10 || ronda >= bancoJuego.length) return renderFinalResult();
      let item = bancoJuego[ronda];
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Volver al Menú</button><div class="game-active-header"><span>🃏 Tarjetas de Memoria</span><span>Tarjeta ${ronda + 1} / 10</span></div><div class="flashcard-box" onclick="this.classList.toggle('flipped')" onmouseenter="playMarimbaHover()"><div class="flashcard-inner"><div class="flashcard-face flashcard-front"><h2>${item.titulo}</h2><span style="margin-top:20px; color:#8e44ad; font-weight:bold; font-size:1.2rem;">👆 Toca para girar</span></div><div class="flashcard-face flashcard-back"><p><b>Definición:</b><br><br>${item.resumen}</p></div></div></div><div class="flashcard-actions"><button class="btn-action-fc btn-fc-wrong" onclick="nextFlashcard(false)" onmouseenter="playMarimbaHover()">🔴 No la sabía</button><button class="btn-action-fc btn-fc-correct" onclick="nextFlashcard(true)" onmouseenter="playMarimbaHover()">🟢 ¡Me la sabía!</button></div>` + obtenerManual();
    }
    function nextFlashcard(supo) { 
      let item = bancoJuego[ronda];
      historialRespuestas.push({pre: item.titulo, res: supo?"Sí":"No", cor: item.titulo, exp: item.resumen});
      if(supo) { puntajeJuego++; updatePuntajeGlobal(1); } else { updatePuntajeGlobal(-1); }
      ronda++; renderFlashcardRonda(); 
    }

    // --- 2. TRIVIAS ---
    function startTrivia(tipo) {
      playMidiTheme('trivia_' + tipo);
      historialRespuestas = []; juegoActual = 'trivia_' + tipo; ronda = 0; puntajeJuego = 0; bancoJuego = [];
      let poolValidos = dbGlosario.filter(g => g.resumen && g.resumen.length > 5);
      let mezclados = mezclarArray(poolValidos).slice(0, 10);
      mezclados.forEach(g => {
        if(tipo === 1) bancoJuego.push({ pregunta: "¿Qué concepto se define de la siguiente manera?<br><br><i>'" + g.resumen + "'</i>", correcta: g.titulo, opciones: obtenerOpcionesCuatro(g.titulo, listaTitulosGlobal) });
        else if(tipo === 2) {
          let esV = Math.random() > 0.5; let def = g.resumen;
          if(!esV) { let a = mezclarArray(dbGlosario.filter(x => x.id != g.id && x.resumen))[0]; if(a) def = a.resumen; }
          bancoJuego.push({ pregunta: "El concepto <b>" + g.titulo + "</b> se define como:<br><br><i>'" + def + "'</i>", correcta: esV ? "Verdadero" : "Falso", opciones: ["Verdadero", "Falso"] });
        }
      });
      renderTriviaRonda();
    }
    function renderTriviaRonda() {
      if(ronda >= 10 || ronda >= bancoJuego.length) return renderFinalResult();
      let p = bancoJuego[ronda];
      let botones = p.opciones.map(o => `<button class="option-btn" onclick="evaluarRespuestaTrivia(this, '${escapeString(o)}', '${escapeString(p.correcta)}')" onmouseenter="playMarimbaHover()">${o}</button>`).join('');
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Volver</button><div class="game-active-header"><span>❓ Trivia</span><span>Ronda ${ronda + 1} / 10</span></div><div class="game-text-question">${p.pregunta}</div><div class="options-stack">${botones}</div>` + obtenerManual();
    }
    function evaluarRespuestaTrivia(btn, sel, corr) {
      elArcadeView.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
      let pregClean = bancoJuego[ronda].pregunta.replace(/<[^>]*>?/gm, '');
      historialRespuestas.push({pre: pregClean, res: sel, cor: corr, exp: sel === corr ? "¡Acertaste la definición!" : "La respuesta correcta era " + corr});
      
      if(sel === corr) { btn.classList.add('correct'); puntajeJuego++; updatePuntajeGlobal(1); } 
      else { btn.classList.add('wrong'); updatePuntajeGlobal(-1); elArcadeView.querySelectorAll('.option-btn').forEach(b => { if(b.innerText === corr) b.classList.add('correct'); }); }
      setTimeout(() => { ronda++; renderTriviaRonda(); }, 1200);
    }

    // --- MATCHING ---
    let itemsSeleccionadosMatching = { concepto: null, definicion: null };
    function startMatching() {
      playMidiTheme('matching');
      historialRespuestas = []; juegoActual = 'matching'; ronda = 0; puntajeJuego = 0;
      let pool = mezclarArray(dbGlosario.filter(g => g.resumen)).slice(0, 5);
      bancoJuego = { conceptos: mezclarArray(pool.map(g => ({ id: String(g.id), texto: g.titulo }))), definiciones: mezclarArray(pool.map(g => ({ id: String(g.id), texto: g.resumen.substring(0, 95) + '...' }))), matchedIds: [] };
      itemsSeleccionadosMatching = { concepto: null, definicion: null }; renderMatchingBoard();
    }
    function renderMatchingBoard() {
      if(bancoJuego.matchedIds.length === 5) { 
        puntajeJuego = 10; 
        bancoJuego.matchedIds.forEach(id => {
            let c = dbGlosario.find(g=>g.id == id);
            historialRespuestas.push({ pre: c.titulo, res: "Emparejado", cor: c.titulo, exp: c.resumen });
        });
        return renderFinalResult(); 
      }
      let cHtml = bancoJuego.conceptos.map(c => `<div class="match-item ${bancoJuego.matchedIds.includes(c.id)?'matched':''} ${itemsSeleccionadosMatching.concepto===c.id?'selected':''}" ${!bancoJuego.matchedIds.includes(c.id)?`onclick="selectMatchItem('concepto', '${c.id}')"`:''} onmouseenter="playMarimbaHover()">${c.texto}</div>`).join('');
      let dHtml = bancoJuego.definiciones.map(d => `<div class="match-item ${bancoJuego.matchedIds.includes(d.id)?'matched':''} ${itemsSeleccionadosMatching.definicion===d.id?'selected':''}" ${!bancoJuego.matchedIds.includes(d.id)?`onclick="selectMatchItem('definicion', '${d.id}')"`:''} onmouseenter="playMarimbaHover()">${d.texto}</div>`).join('');
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Volver</button><div class="game-active-header"><span>🔗 Emparejamiento</span><span>Completados: ${bancoJuego.matchedIds.length} / 5</span></div><div class="match-container"><div class="match-col"><h3 style="color:#2c3e50; margin-bottom:10px; font-family:'Fredoka',sans-serif;">Conceptos</h3>${cHtml}</div><div class="match-col"><h3 style="color:#2c3e50; margin-bottom:10px; font-family:'Fredoka',sans-serif;">Definiciones</h3>${dHtml}</div></div>` + obtenerManual();
    }
    function selectMatchItem(col, id) {
      itemsSeleccionadosMatching[col] = id;
      if(itemsSeleccionadosMatching.concepto && itemsSeleccionadosMatching.definicion) {
        if(itemsSeleccionadosMatching.concepto === itemsSeleccionadosMatching.definicion) {
            bancoJuego.matchedIds.push(itemsSeleccionadosMatching.concepto);
            updatePuntajeGlobal(2);
        } else {
            updatePuntajeGlobal(-1);
        }
        itemsSeleccionadosMatching = { concepto: null, definicion: null };
      }
      renderMatchingBoard();
    }

    // --- AHORCADO ---
    function startHangman() { playMidiTheme('hangman'); historialRespuestas = []; juegoActual = 'hangman'; ronda = 0; puntajeJuego = 0; bancoJuego = mezclarArray(dbGlosario.filter(g => g.titulo.length > 3 && g.titulo.length < 25)).slice(0, 3); startHangmanWord(); }
    let hangWordObj = {};
    function startHangmanWord() {
      if(ronda >= 3) return renderFinalResult();
      let c = bancoJuego[ronda]; let real = c.titulo.toUpperCase(); let oculta = '';
      for(let i=0; i<real.length; i++) oculta += /[A-ZÁÉÍÓÚÜÑ]/.test(real[i]) ? '_' : real[i];
      hangWordObj = { real, oculta, vidas: 6, usadas: [], pista: c.resumen }; renderHangmanBoard();
    }
    function renderHangmanBoard() {
      let tHtml = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split('').map(l => `<button class="hang-letter ${hangWordObj.usadas.includes(l)?'used':''}" ${hangWordObj.usadas.includes(l)?'disabled':`onclick="guessHangmanLetter('${l}')"`} style="padding:12px 18px; margin:4px; border:2px solid #cbd5e1; background:#fff; border-radius:8px; font-weight:bold; cursor:pointer; font-size:1.2rem; transition:0.2s;" onmouseenter="playMarimbaHover()">${l}</button>`).join('');
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Volver</button><div class="game-active-header"><span>🔤 Ahorcado</span><span>Palabra ${ronda+1}/3 | Vidas: ${hangWordObj.vidas} ❤️</span></div><div class="game-text-question"><b>Pista:</b> "${hangWordObj.pista}"</div><div style="font-family:monospace; font-size:3rem; letter-spacing:10px; margin:35px 0; word-break: break-all; color:#9b59b6; font-weight:bold;">${hangWordObj.oculta}</div><div style="display:flex; flex-wrap:wrap; gap:5px; justify-content:center; max-width:600px; margin:0 auto;">${tHtml}</div>` + obtenerManual();
    }
    function guessHangmanLetter(l) {
      hangWordObj.usadas.push(l); let lN = normalizarP(l);
      if(normalizarP(hangWordObj.real).includes(lN)) {
        let nO = '';
        for(let i=0; i<hangWordObj.real.length; i++) nO += normalizarP(hangWordObj.real[i]) === lN ? hangWordObj.real[i] : hangWordObj.oculta[i];
        hangWordObj.oculta = nO;
        updatePuntajeGlobal(1);
        if(!nO.includes('_')) { 
            historialRespuestas.push({pre: "Palabra Oculta", res: "Descubierta", cor: hangWordObj.real, exp: hangWordObj.pista});
            puntajeJuego+=3; updatePuntajeGlobal(2); ronda++; setTimeout(startHangmanWord, 1000); 
        }
      } else {
        hangWordObj.vidas--; updatePuntajeGlobal(-1);
        if(hangWordObj.vidas<=0) { 
            historialRespuestas.push({pre: "Palabra Oculta", res: "Fallida", cor: hangWordObj.real, exp: hangWordObj.pista});
            ronda++; setTimeout(startHangmanWord, 1500); 
        }
      }
      renderHangmanBoard();
    }

    // --- SIMULADOR DE DIÁLOGO ---
    function startSimulador() { playMidiTheme('simulador'); historialRespuestas = []; juegoActual = 'simulador'; ronda = 0; puntajeJuego = 0; bancoJuego = mezclarArray(dbExtraCasos).slice(0, 3); renderSimulador(); }
    function renderSimulador() {
      if(ronda >= bancoJuego.length) { puntajeJuego = Math.round((puntajeJuego/3)*10); return renderFinalResult(); }
      let p = bancoJuego[ronda];
      let opciones = mezclarArray([p.correct, ...p.wrong]);
      let botones = opciones.map(o => `<button class="option-btn" onclick="evaluarSimulador(this, '${escapeString(o)}', '${escapeString(p.correct)}')" onmouseenter="playMarimbaHover()">${o}</button>`).join('');
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Volver</button><div class="game-active-header"><span>💬 Simulador</span><span>Caso ${ronda + 1} / 3</span></div><div class="game-text-question" style="background:#f0f9ff; border-color:#3498db;"><b>Consultante:</b><br><br>"${p.q}"</div><p style="margin-bottom:15px; color:var(--text-muted); font-weight:bold; font-size:1.1rem;">Como Counselor, ¿cuál sería tu mejor respuesta?</p><div class="options-stack">${botones}</div>` + obtenerManual();
    }
    function evaluarSimulador(btn, sel, corr) {
      elArcadeView.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
      historialRespuestas.push({ pre: bancoJuego[ronda].q, res: sel, cor: corr, exp: "Se busca reflejar sentimientos y validar empáticamente." });
      if(sel === corr) { btn.classList.add('correct'); puntajeJuego++; updatePuntajeGlobal(3); } 
      else { btn.classList.add('wrong'); updatePuntajeGlobal(-1); elArcadeView.querySelectorAll('.option-btn').forEach(b => { if(b.innerText === corr) b.classList.add('correct'); }); }
      setTimeout(() => { ronda++; renderSimulador(); }, 1800);
    }

    // --- EMPATÍA O SIMPATÍA ---
    function startEmpatia() { playMidiTheme('empatia'); historialRespuestas = []; juegoActual = 'empatia'; ronda = 0; puntajeJuego = 0; bancoJuego = mezclarArray(dbExtraEmpatia).slice(0, 5); renderEmpatia(); }
    function renderEmpatia() {
      if(ronda >= bancoJuego.length) { puntajeJuego = puntajeJuego * 2; return renderFinalResult(); }
      let p = bancoJuego[ronda];
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Volver</button><div class="game-active-header"><span>⚖️ ¿Empatía o Inadecuado?</span><span>Frase ${ronda + 1} / 5</span></div><div class="flashcard-box" style="cursor:default; border:none; box-shadow:0 12px 35px rgba(0,0,0,0.15);"><div class="flashcard-face flashcard-front" style="position:relative;"><h2>"${p.text}"</h2></div></div><div class="swipe-container"><button class="btn-swipe bg-red" onclick="evaluarEmpatia(false, ${p.isEmpatia})" onmouseenter="playMarimbaHover()">Simpatía / Inadecuado</button><button class="btn-swipe bg-green" onclick="evaluarEmpatia(true, ${p.isEmpatia})" onmouseenter="playMarimbaHover()">Empatía / Adecuado</button></div>` + obtenerManual();
    }
    function evaluarEmpatia(respuesta, correcta) {
      historialRespuestas.push({ pre: bancoJuego[ronda].text, res: respuesta?"Empatía":"Inadecuado", cor: correcta?"Empatía":"Inadecuado", exp: correcta ? "Validación y acompañamiento." : "Bloquea o minimiza la emoción." });
      if(respuesta === correcta) { puntajeJuego++; updatePuntajeGlobal(2); } else { updatePuntajeGlobal(-1); }
      ronda++; renderEmpatia();
    }

    // --- CAJAS DE CORRIENTES ---
    function startCorrientes() {
      playMidiTheme('corrientes');
      historialRespuestas = []; juegoActual = 'corrientes'; ronda = 0; puntajeJuego = 0;
      // Nota: Asume que dbCategorias está disponible globalmente
      let catsUtiles = dbCategorias.filter(c => c.nombre.length > 3).slice(0, 3);
      if(catsUtiles.length < 2) return alert("Faltan categorías en la base de datos.");
      let conceptos = mezclarArray(dbGlosario.filter(g => catsUtiles.some(c => c.id == g.categoriaId))).slice(0, 5);
      bancoJuego = { cats: catsUtiles, conceptos: conceptos };
      renderCorrientes();
    }
    function renderCorrientes() {
      if(ronda >= bancoJuego.conceptos.length) { puntajeJuego = puntajeJuego * 2; return renderFinalResult(); }
      let c = bancoJuego.conceptos[ronda];
      let cajas = bancoJuego.cats.map(cat => {
          let neonColor = neonColors[Math.floor(Math.random() * neonColors.length)];
          return `<div class="drop-box" style="--neon:${neonColor}" onclick="evaluarCorriente(${cat.id}, ${c.categoriaId})" onmouseenter="playMarimbaHover()">${cat.nombre}</div>`;
      }).join('');
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Volver</button><div class="game-active-header"><span>🗂️ Cajas</span><span>Concepto ${ronda + 1} / 5</span></div><h2 style="font-family:'Lora',serif; font-size:3.5rem; margin:45px 0; color:#34495e; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">${c.titulo}</h2><p style="color:var(--text-muted); margin-bottom:20px; font-weight:bold; font-size:1.2rem;">¿A qué enfoque/categoría pertenece?</p><div class="box-container">${cajas}</div>` + obtenerManual();
    }
    function evaluarCorriente(selId, corrId) {
      let catSel = bancoJuego.cats.find(c=>c.id==selId).nombre;
      let catCor = dbCategorias.find(c=>c.id==corrId).nombre;
      historialRespuestas.push({pre: bancoJuego.conceptos[ronda].titulo, res: catSel, cor: catCor, exp: "Este concepto pertenece a: " + catCor});
      if(selId == corrId) { puntajeJuego++; updatePuntajeGlobal(2); } else { updatePuntajeGlobal(-1); }
      ronda++; renderCorrientes();
    }

    // --- ¿QUIÉN LO DIJO? ---
    function startAutores() { playMidiTheme('autores'); historialRespuestas = []; juegoActual = 'autores'; ronda = 0; puntajeJuego = 0; bancoJuego = mezclarArray(dbExtraAutores).slice(0, 4); renderAutores(); }
    function renderAutores() {
      if(ronda >= bancoJuego.length) { puntajeJuego = Math.round((puntajeJuego/4)*10); return renderFinalResult(); }
      let p = bancoJuego[ronda];
      let autoresList = [...new Set(dbExtraAutores.map(a => a.autor))];
      let opciones = mezclarArray(autoresList).slice(0, 4);
      if(!opciones.includes(p.autor)) opciones[0] = p.autor; opciones = mezclarArray(opciones);
      let botones = opciones.map(o => `<button class="option-btn" onclick="evaluarAutores(this, '${escapeString(o)}', '${escapeString(p.autor)}')" onmouseenter="playMarimbaHover()">${o}</button>`).join('');
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Volver</button><div class="game-active-header"><span>👤 Citas</span><span>Cita ${ronda + 1} / 4</span></div><div class="game-text-question" style="font-family:'Lora',serif; font-style:italic; font-size:1.6rem; text-align:center;">"${p.cita}"</div><div class="options-stack">${botones}</div>` + obtenerManual();
    }
    function evaluarAutores(btn, sel, corr) {
      elArcadeView.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
      historialRespuestas.push({pre: bancoJuego[ronda].cita, res: sel, cor: corr, exp: "Cita perteneciente a " + corr});
      if(sel === corr) { btn.classList.add('correct'); puntajeJuego++; updatePuntajeGlobal(2); } 
      else { btn.classList.add('wrong'); updatePuntajeGlobal(-1); elArcadeView.querySelectorAll('.option-btn').forEach(b => { if(b.innerText === corr) b.classList.add('correct'); }); }
      setTimeout(() => { ronda++; renderAutores(); }, 1200);
    }

    // --- CRUCIGRAMA LINEAL ---
    let cruciObj = [];
    function startCrucigrama() {
      playMidiTheme('crucigrama'); historialRespuestas = []; juegoActual = 'crucigrama'; puntajeJuego = 0;
      let validos = mezclarArray(dbGlosario.filter(g => g.titulo.length > 3 && g.titulo.length < 12 && !g.titulo.includes(' '))).slice(0, 5);
      cruciObj = validos.map(g => ({ t: g.titulo, res: g.resumen.substring(0,80)+"...", val: '' }));
      renderCrucigrama();
    }
    function renderCrucigrama() {
      let inputs = cruciObj.map((c, i) => `<div class="cross-row"><div class="cross-clue">${i+1}. ${c.res}</div><input type="text" class="cross-input" id="cruci_${i}" maxlength="${c.t.length}" placeholder="${c.t.length} letras" value="${c.val}"></div>`).join('');
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Volver</button><div class="game-active-header"><span>📝 Crucigrama</span><span>5 Palabras</span></div>${inputs}<button class="game-play-btn" style="margin-top:25px;" onclick="checkCrucigrama()" onmouseenter="playMarimbaHover()">Comprobar Respuestas</button>` + obtenerManual();
    }
    function checkCrucigrama() {
      puntajeJuego = 0; historialRespuestas = [];
      cruciObj.forEach((c, i) => {
        let el = document.getElementById('cruci_'+i);
        if(el) {
          c.val = el.value.toUpperCase();
          if(normalizarP(c.val) === normalizarP(c.t).toUpperCase()) { puntajeJuego += 2; updatePuntajeGlobal(2); el.style.borderColor = '#2ecc71'; el.style.backgroundColor = '#e8f5e9'; el.disabled = true; }
          else { el.style.borderColor = '#e74c3c'; updatePuntajeGlobal(-1); }
          historialRespuestas.push({pre: c.res, res: c.val || "Vacío", cor: c.t, exp: "Definición de " + c.t});
        }
      });
      setTimeout(renderFinalResult, 1500); 
    }

    // --- CONCEPTO FRAGMENTADO ---
    let fragObj = { real: "", arr: [], sel: [] };
    function startFragmentado() {
      playMidiTheme('fragmentado'); historialRespuestas = []; juegoActual = 'fragmentado'; ronda = 0; puntajeJuego = 0;
      bancoJuego = mezclarArray(dbGlosario.filter(g => g.resumen.length > 20 && g.resumen.length < 100)).slice(0, 3);
      nextFragmentado();
    }
    function nextFragmentado() {
      if(ronda >= bancoJuego.length) { puntajeJuego = Math.round((puntajeJuego/3)*10); return renderFinalResult(); }
      let c = bancoJuego[ronda];
      fragObj.real = c.resumen; fragObj.arr = mezclarArray(c.resumen.split(' ')); fragObj.sel = []; renderFragmentado();
    }
    function renderFragmentado() {
      let fHtml = fragObj.arr.map((w, i) => {
        let isUsed = fragObj.sel.includes(i);
        return `<div class="frag-word ${isUsed?'used':''}" ${isUsed?'':`onclick="clickFrag(${i})"`} onmouseenter="playMarimbaHover()">${w}</div>`;
      }).join('');
      let currentSentence = fragObj.sel.map(idx => fragObj.arr[idx]).join(' ');
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Volver</button><div class="game-active-header"><span>🧩 Fragmentado</span><span>Frase ${ronda + 1} / 3</span></div><h3 style="font-family:'Lora',serif; color:#9b59b6; margin-bottom:15px; font-size:2rem;">${bancoJuego[ronda].titulo}</h3><div style="min-height:70px; font-size:1.2rem; font-style:italic; margin:20px 0; padding:20px; background:white; border-radius:12px; border:2px solid #e2e8f0; font-family:'Lora',serif;">${currentSentence}</div><div class="frag-container">${fHtml}</div><button class="game-back-menu" onclick="fragObj.sel=[]; renderFragmentado()" onmouseenter="playMarimbaHover()">↻ Limpiar Selección</button>` + obtenerManual();
      
      if(fragObj.sel.length === fragObj.arr.length && fragObj.arr.length > 0) {
        if(currentSentence === fragObj.real) { 
            puntajeJuego++; updatePuntajeGlobal(3); 
            historialRespuestas.push({pre: bancoJuego[ronda].titulo, res: "Correcto", cor: fragObj.real, exp: "Frase ensamblada perfectamente."});
            ronda++; alert("¡Correcto!"); nextFragmentado(); 
        } else { 
            updatePuntajeGlobal(-1);
            historialRespuestas.push({pre: bancoJuego[ronda].titulo, res: "Incorrecto", cor: fragObj.real, exp: "El orden preciso importa."});
            alert("Orden incorrecto. Te mostraremos la correcta en los resultados."); ronda++; nextFragmentado();
        }
      }
    }
    function clickFrag(idx) { fragObj.sel.push(idx); renderFragmentado(); }

    // --- BOMBARDEO CONTRARRELOJ ---
    let bombObj = { time: 60, score: 0, current: null };
    function startBombardeo() {
      playMidiTheme('bombardeo'); historialRespuestas = []; juegoActual = 'bombardeo'; puntajeJuego = 0; bombObj.time = 60; bombObj.score = 0;
      if(timerGlobal) clearInterval(timerGlobal);
      timerGlobal = setInterval(tickBombardeo, 1000); nextBombardeo();
    }
    function tickBombardeo() {
      bombObj.time--;
      let barra = document.getElementById('bomb-bar'); if(barra) barra.style.width = (bombObj.time/60)*100 + '%';
      if(bombObj.time <= 0) { clearInterval(timerGlobal); puntajeJuego = bombObj.score >= 10 ? 10 : bombObj.score; renderFinalResult(); }
    }
    function nextBombardeo() {
      let g = dbGlosario[Math.floor(Math.random()*dbGlosario.length)];
      bombObj.current = { q: g.resumen, c: g.titulo, ops: obtenerOpcionesCuatro(g.titulo, listaTitulosGlobal) };
      renderBombardeo();
    }
    function renderBombardeo() {
      let botones = bombObj.current.ops.map(o => `<button class="option-btn" style="padding:14px; font-size:1.05rem;" onclick="evaluarBombardeo('${escapeString(o)}')" onmouseenter="playMarimbaHover()">${o}</button>`).join('');
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Salir</button><div class="game-active-header"><span>⏱️ Bombardeo</span><span>Score: ${bombObj.score}</span></div><div class="timer-bar"><div class="timer-fill" id="bomb-bar" style="width:${(bombObj.time/60)*100}%"></div></div><div class="game-text-question" style="font-size:1.15rem; padding:25px;">${bombObj.current.q}</div><div class="options-stack">${botones}</div>` + obtenerManual();
    }
    function evaluarBombardeo(sel) { 
        if(sel === bombObj.current.c) { bombObj.score++; updatePuntajeGlobal(1); } else { updatePuntajeGlobal(-1); }
        historialRespuestas.push({pre: bombObj.current.q, res: sel, cor: bombObj.current.c, exp: sel === bombObj.current.c ? "¡Correcto!" : "Concepto erróneo."});
        nextBombardeo(); 
    }

    // --- WORDLE CLÍNICO ---
    let wObj = { palabra: '', intentos: 0, max: 6, historial: [] };
    function startWordle() {
      playMidiTheme('wordle'); historialRespuestas = []; juegoActual = 'wordle'; puntajeJuego = 0; 
      let cand = dbGlosario.filter(g => g.titulo.length >= 4 && g.titulo.length <= 7 && !g.titulo.includes(' '));
      if(!cand.length) cand = [{titulo: "TERAPIA"}]; 
      wObj.palabra = normalizarP(cand[Math.floor(Math.random() * cand.length)].titulo).toUpperCase();
      wObj.intentos = 0; wObj.historial = []; renderWordleBoard();
    }
    function renderWordleBoard() {
      let histHtml = wObj.historial.map(h => `<div style="display:flex;gap:10px;justify-content:center;margin-bottom:10px;">${h.split('').map((letra, i) => { let color = '#cbd5e1'; if(wObj.palabra[i] === letra) color = '#2ecc71'; else if(wObj.palabra.includes(letra)) color = '#f1c40f'; return `<span style="width:50px;height:50px;display:flex;align-items:center;justify-content:center;background:${color};color:white;font-weight:900;font-size:1.6rem;border-radius:8px;box-shadow:inset 0 -4px 0 rgba(0,0,0,0.15);">${letra}</span>`}).join('')}</div>`).join('');
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Volver</button><div class="game-active-header"><span>🟩 Wordle Clínico</span><span>Intentos: ${wObj.intentos}/6</span></div><p style="font-size:1.2rem;">Palabra de <b>${wObj.palabra.length} letras</b>.</p><div style="margin:30px 0;">${histHtml}</div><input type="text" id="w-input" maxlength="${wObj.palabra.length}" style="text-transform:uppercase;padding:15px;font-size:1.6rem;width:280px;text-align:center;border:3px solid #9b59b6;border-radius:10px;font-weight:bold;font-family:'Courier New', monospace;"><br><button class="game-play-btn" onclick="checkWordle()" style="margin-top:25px;" onmouseenter="playMarimbaHover()">Comprobar Palabra</button>` + obtenerManual();
    }
    function checkWordle() {
      let el = document.getElementById('w-input'); if(!el) return;
      let intento = normalizarP(el.value).toUpperCase();
      if(intento.length !== wObj.palabra.length) return alert("Debe tener " + wObj.palabra.length + " letras.");
      wObj.historial.push(intento); wObj.intentos++;
      
      if(intento === wObj.palabra) { 
          puntajeJuego = 10; updatePuntajeGlobal(10);
          historialRespuestas.push({pre: "Wordle ("+wObj.palabra.length+" letras)", res: intento, cor: wObj.palabra, exp: "¡Adivinaste!"});
          return renderFinalResult(); 
      }
      updatePuntajeGlobal(-1);
      if(wObj.intentos >= wObj.max) {
          historialRespuestas.push({pre: "Wordle ("+wObj.palabra.length+" letras)", res: intento, cor: wObj.palabra, exp: "Te quedaste sin intentos."});
          return renderFinalResult();
      }
      renderWordleBoard();
    }

    // --- SOPA DE LETRAS REHECHA ---
    let slObj = { grid: [], word: '', coords: [], seleccionadas: [], round: 0, max: 10, time: 0 };
    function startSopa() {
      playMidiTheme('sopa'); historialRespuestas = []; juegoActual = 'sopa'; puntajeJuego = 0;
      slObj = { grid: [], word: '', coords: [], seleccionadas: [], round: 0, max: 10, time: 0 };
      if(timerGlobal) clearInterval(timerGlobal);
      timerGlobal = setInterval(() => {
        if(juegoActual === 'sopa') { slObj.time++; let elTime = document.getElementById('sopa-time'); if(elTime) elTime.innerText = slObj.time + "s"; }
      }, 1000);
      nextSopa();
    }
    function nextSopa() {
      if(slObj.round >= slObj.max) {
        if(timerGlobal) clearInterval(timerGlobal);
        if(slObj.time <= 60) puntajeJuego = 10; else if(slObj.time <= 85) puntajeJuego = 8; else if(slObj.time <= 110) puntajeJuego = 6; else if(slObj.time <= 140) puntajeJuego = 4; else puntajeJuego = 2;
        updatePuntajeGlobal(puntajeJuego);
        historialRespuestas.push({ pre: "Sopa de Letras (10 palabras)", res: slObj.time + " segundos", cor: "Rápido y preciso (< 60s para un 10)", exp: "Completaste las 10 rondas. El puntaje se basa en tu agilidad visual." });
        return renderFinalResult();
      }
      let cands = dbGlosario.filter(g => g.titulo.length >= 4 && g.titulo.length <= 8 && !g.titulo.includes(' '));
      if(!cands.length) cands = [{titulo: "AYUDA"}, {titulo: "AMOR"}];
      let cand = cands[Math.floor(Math.random() * cands.length)];
      slObj.word = normalizarP(cand.titulo).toUpperCase(); slObj.seleccionadas = []; slObj.coords = [];
      let gridSize = 8; slObj.grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
      
      let placed = false; let safety = 0;
      while(!placed && safety < 100) {
        safety++; let dir = Math.floor(Math.random() * 3); let r = Math.floor(Math.random() * gridSize); let c = Math.floor(Math.random() * gridSize); let can = true; let tempCoords = [];
        for(let i = 0; i < slObj.word.length; i++) {
          let nr = r + (dir === 1 || dir === 2 ? i : 0); let nc = c + (dir === 0 || dir === 2 ? i : 0);
          if(nr >= gridSize || nc >= gridSize) { can = false; break; }
          tempCoords.push({r: nr, c: nc});
        }
        if(can) { tempCoords.forEach((pos, i) => { slObj.grid[pos.r][pos.c] = slObj.word[i]; }); slObj.coords = tempCoords; placed = true; }
      }

      let letT = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for(let r=0; r<gridSize; r++) { for(let c=0; c<gridSize; c++) { if(slObj.grid[r][c] === '') slObj.grid[r][c] = letT.charAt(Math.floor(Math.random() * letT.length)); } }
      renderSopa();
    }
    function renderSopa() {
      let hG = '<div style="display:grid;grid-template-columns:repeat(8,45px);gap:5px;justify-content:center;margin:30px auto;">';
      for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
           let isS = slObj.seleccionadas.some(s => s.r === r && s.c === c); 
           hG += `<div onclick="clickSopa(${r},${c})" onmouseenter="playMarimbaHover()" style="width:45px;height:45px;display:flex;align-items:center;justify-content:center;background:${isS?'#9b59b6':'#fff'};color:${isS?'white':'#333'};border:2px solid ${isS?'#8e44ad':'#cbd5e1'};cursor:pointer;font-weight:900;font-size:1.3rem;border-radius:8px;transition:0.1s;font-family:'Fredoka',sans-serif;">${slObj.grid[r][c]}</div>`;
        }
      }
      hG += '</div>';
      let btnTerminar = modoMaraton || modoFlash ? `<button class="game-play-btn" style="background:#e74c3c; margin-left:15px; box-shadow:0 5px 0 #c0392b;" onclick="forceEndSopa()" onmouseenter="playMarimbaHover()">Rendirse</button>` : '';
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">← Volver</button><div class="game-active-header"><span>🔍 Sopa de Letras</span><span>Ronda ${slObj.round + 1} / ${slObj.max} | ⏱️ <span id="sopa-time">${slObj.time}s</span></span></div><p style="font-size:1.3rem;">Encuentra: <b style="color:#9b59b6; letter-spacing:3px; font-family:'Fredoka',sans-serif;">${slObj.word}</b></p>${hG}<button class="game-play-btn" onclick="checkSopa()" onmouseenter="playMarimbaHover()">Verificar</button>${btnTerminar}` + obtenerManual();
    }
    function clickSopa(r, c) { let idx = slObj.seleccionadas.findIndex(s => s.r === r && s.c === c); if(idx >= 0) slObj.seleccionadas.splice(idx, 1); else slObj.seleccionadas.push({r, c}); renderSopa(); }
    function checkSopa() {
      if(slObj.seleccionadas.length === slObj.coords.length) {
         let matchCount = 0;
         slObj.seleccionadas.forEach(sel => { if(slObj.coords.some(coord => coord.r === sel.r && coord.c === sel.c)) { matchCount++; } });
         if(matchCount === slObj.coords.length) { slObj.round++; updatePuntajeGlobal(1); nextSopa(); return; }
      }
      updatePuntajeGlobal(-1); slObj.seleccionadas = []; renderSopa();
    }
    function forceEndSopa() { if(timerGlobal) clearInterval(timerGlobal); puntajeJuego = 0; historialRespuestas.push({pre: "Sopa de Letras", res: "Rendición (Ronda " + (slObj.round + 1) + ")", cor: "10 rondas completas", exp: "Abandonaste antes de terminar."}); renderFinalResult(); }

    // --- INVASORES TERAPÉUTICOS (Space Invaders) ---
    let invState = {};
    const bloquesNormales = ["Juicio", "Prejuicio", "Crítica", "Censura"];
    const bloquesDuros = ["Trauma", "Resistencia", "Bloqueo", "Soberbia"];
    function startInvasores() {
      playMidiTheme('invasores'); historialRespuestas = []; juegoActual = 'invasores'; puntajeJuego = 0;
      invState = { playing: true, score: 0, playerX: 300, playerW: 60, playerH: 40, bullets: [], enemies: [], powerups: [], lastEnemy: 0, keys: {}, lives: 3, speedMod: 1, level: 1, weaponType: 0, weaponTimer: 0 };
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="stopInvasores()" onmouseenter="playMarimbaHover()">← Salir</button><div class="game-active-header"><span>🚀 Invasores</span><span id="inv-score">Nivel: 1 | Pts: 0 | Vidas: 3</span></div><p style="margin-bottom:20px;font-size:1rem;">Sobrevive el mayor tiempo posible. Los bloques morados requieren más empatía. ¡Atrapa las 🎁 para mejorar tu arma!</p><canvas id="space-canvas" class="canvas-game" width="700" height="400"></canvas><div class="space-controls"><button class="btn-space" onmousedown="invState.keys.ArrowLeft=true" onmouseup="invState.keys.ArrowLeft=false" ontouchstart="invState.keys.ArrowLeft=true" ontouchend="invState.keys.ArrowLeft=false" onmouseenter="playMarimbaHover()">⬅️ Izq</button><button class="btn-space btn-space-shoot" onmousedown="shootInv()" ontouchstart="shootInv()" onmouseenter="playMarimbaHover()">⚡ Disparar Empatía</button><button class="btn-space" onmousedown="invState.keys.ArrowRight=true" onmouseup="invState.keys.ArrowRight=false" ontouchstart="invState.keys.ArrowRight=true" ontouchend="invState.keys.ArrowRight=false" onmouseenter="playMarimbaHover()">Der ➡️</button></div>` + obtenerManual();
      document.addEventListener('keydown', invKeyDown); document.addEventListener('keyup', invKeyUp); loopInvasores = requestAnimationFrame(updateInvasores);
    }
    function invKeyDown(e) { invState.keys[e.code] = true; if(e.code === 'Space') { e.preventDefault(); shootInv(); } }
    function invKeyUp(e) { invState.keys[e.code] = false; }
    function shootInv() {
        if(!invState.playing) return;
        if (invState.weaponType === 1) { 
            invState.bullets.push({ x: invState.playerX + 5, y: 340, w: 5, h: 12, dmg: 1, color: '#3498db' });
            invState.bullets.push({ x: invState.playerX + invState.playerW - 10, y: 340, w: 5, h: 12, dmg: 1, color: '#3498db' });
        } else if (invState.weaponType === 2) { 
            invState.bullets.push({ x: invState.playerX + invState.playerW/2 - 15, y: 340, w: 30, h: 15, dmg: 3, color: '#2ecc71' });
        } else { 
            invState.bullets.push({ x: invState.playerX + invState.playerW/2 - 2, y: 340, w: 5, h: 12, dmg: 1, color: '#f1c40f' });
        }
    }
    function stopInvasores() { invState.playing = false; document.removeEventListener('keydown', invKeyDown); document.removeEventListener('keyup', invKeyUp); cancelAnimationFrame(loopInvasores); renderArcadeMenu(); }
    function updateInvasores() {
        if(!invState.playing) return; let canvas = document.getElementById('space-canvas'); if(!canvas) return; let ctx = canvas.getContext('2d');
        if(invState.weaponTimer > 0) { invState.weaponTimer--; if(invState.weaponTimer <= 0) invState.weaponType = 0; }
        invState.level = 1 + Math.floor(invState.score / 15); invState.speedMod = 1 + ((invState.level - 1) * 0.15);
        if(invState.keys['ArrowLeft'] && invState.playerX > 0) invState.playerX -= 7;
        if(invState.keys['ArrowRight'] && invState.playerX < canvas.width - invState.playerW) invState.playerX += 7;
        invState.lastEnemy++;
        if(invState.lastEnemy > (90 / invState.speedMod)) {
            let esDuro = Math.random() < (0.1 + (invState.level * 0.05));
            if(esDuro) invState.enemies.push({ x: Math.random() * (canvas.width - 80), y: -30, w: 80, h: 30, text: bloquesDuros[Math.floor(Math.random() * bloquesDuros.length)], hp: 3, maxHp: 3, speedMult: 0.6, color: '#8e44ad' });
            else invState.enemies.push({ x: Math.random() * (canvas.width - 70), y: -25, w: 70, h: 25, text: bloquesNormales[Math.floor(Math.random() * bloquesNormales.length)], hp: 1, maxHp: 1, speedMult: 1, color: '#e74c3c' });
            invState.lastEnemy = 0;
        }
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        let px = invState.playerX; ctx.fillStyle = '#475569'; ctx.fillRect(px + 10, 360, 40, 40); ctx.fillRect(px + 15, 340, 30, 20); ctx.fillStyle = '#64748b'; ctx.fillRect(px + 2, 355, 12, 30); ctx.fillRect(px + 46, 355, 12, 30);
        ctx.fillStyle = invState.weaponType === 0 ? '#2ecc71' : (invState.weaponType === 1 ? '#3498db' : '#f1c40f'); ctx.beginPath(); ctx.arc(px + 30, 345, 9, 0, Math.PI*2); ctx.fill(); ctx.fillRect(px + 22, 355, 16, 20); ctx.fillStyle = 'white'; ctx.font = 'bold 10px Montserrat'; ctx.textAlign = 'center'; ctx.fillText("Tú", px + 30, 368);
        for(let i = invState.powerups.length - 1; i >= 0; i--) {
            let p = invState.powerups[i]; p.y += 2.5; ctx.fillStyle = '#f39c12'; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.fillStyle = 'white'; ctx.font = '14px Arial'; ctx.fillText("🎁", p.x + p.w/2, p.y + 16);
            if(p.x < invState.playerX + invState.playerW && p.x + p.w > invState.playerX && p.y + p.h > 360) { invState.weaponType = p.type; invState.weaponTimer = 400; invState.score += 2; updatePuntajeGlobal(2); invState.powerups.splice(i, 1); } else if (p.y > canvas.height) { invState.powerups.splice(i, 1); }
        }
        for(let i = invState.bullets.length - 1; i >= 0; i--) { let b = invState.bullets[i]; b.y -= 8; ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h); if(b.y < 0) invState.bullets.splice(i, 1); }
        for(let i = invState.enemies.length - 1; i >= 0; i--) {
            let e = invState.enemies[i]; e.y += 1.4 * invState.speedMod * e.speedMult; let hit = false;
            for(let j = invState.bullets.length - 1; j >= 0; j--) {
                let b = invState.bullets[j];
                if(b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
                    e.hp -= b.dmg; invState.bullets.splice(j, 1); 
                    if(e.hp <= 0) { invState.score += e.maxHp; updatePuntajeGlobal(e.maxHp); invState.enemies.splice(i, 1); if(Math.random() < 0.15) invState.powerups.push({ x: e.x + e.w/2 - 12, y: e.y, w: 24, h: 24, type: Math.random() > 0.5 ? 1 : 2 }); hit = true; break; } hit = true; break;
                }
            }
            if(hit) continue;
            if(e.y > canvas.height) { invState.lives--; updatePuntajeGlobal(-2); invState.enemies.splice(i, 1); if(invState.lives <= 0) return endInvasores(); } 
            else { ctx.fillStyle = e.color; ctx.fillRect(e.x, e.y, e.w, e.h); if(e.maxHp > 1) { ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(e.x, e.y + e.h - 5, e.w, 5); ctx.fillStyle = '#2ecc71'; ctx.fillRect(e.x, e.y + e.h - 5, e.w * (e.hp / e.maxHp), 5); } ctx.fillStyle = 'white'; ctx.font = 'bold 11px Montserrat'; ctx.fillText(e.text, e.x + e.w/2, e.y + (e.maxHp>1?16:18)); }
        }
        let elScore = document.getElementById('inv-score'); if(elScore) elScore.innerText = `Nivel: ${invState.level} | Pts: ${invState.score} | Vidas: ${invState.lives}`;
        loopInvasores = requestAnimationFrame(updateInvasores);
    }
    function endInvasores() {
        invState.playing = false; document.removeEventListener('keydown', invKeyDown); document.removeEventListener('keyup', invKeyUp);
        puntajeJuego = invState.score > 20 ? 20 : invState.score; 
        historialRespuestas.push({ pre: "Resistencia Terapéutica", res: "Nivel " + invState.level, cor: invState.score + " pts", exp: "Sobreviviste a múltiples bloqueos usando habilidades de Counseling." });
        renderFinalResult();
    }

    // --- SUPER COUNSELOR (Endless Runner) ---
    let runState = {};
    const runEnemies = ["Consejo no pedido", "Juicio de valor", "Interrupción", "Proyección"];
    const runCoins = ["Escucha Activa", "Silencio", "Rapport"];
    function startRunner() {
      playMidiTheme('runner'); historialRespuestas = []; juegoActual = 'runner'; puntajeJuego = 0;
      runState = { playing: true, score: 0, distance: 0, p: { x: 50, y: 300, w: 40, h: 40, vy: 0, jumps: 0, invincibility: 0 }, floorY: 340, gravity: 0.7, jumpForce: -12, speed: 6.5, obstacles: [], coins: [], powerups: [], bg: { clouds: Array(6).fill(0).map(()=>({x: Math.random()*700, y: 20+Math.random()*120, s: 25+Math.random()*35, v: 0.3+Math.random()*0.6})), mountains: Array(4).fill(0).map((_,i)=>({x: i*350 - 50, w: 250+Math.random()*150, h: 120+Math.random()*120})), birds: Array(4).fill(0).map(()=>({x: Math.random()*700, y: 30+Math.random()*100, v: 1.2+Math.random()*1.5, offset: Math.random()*100})), flowers: Array(12).fill(0).map(()=>({x: Math.random()*700, type: ['🌷','🌻','🌼','🍄'][Math.floor(Math.random()*4)]})) }, frames: 0, lives: 3 };
      elArcadeView.innerHTML = renderDashboardHTML() + `<button class="game-back-menu" onclick="stopRunner()" onmouseenter="playMarimbaHover()">← Salir</button><div class="game-active-header"><span>🍄 Super Runner</span><span id="run-score">Distancia: 0m | Puntos: 0 | Vidas: 3</span></div><p style="margin-bottom:20px;font-size:1rem;">Toca la pantalla o presiona espacio para saltar. ¡Puedes hacer <b>Doble Salto</b>!</p><canvas id="runner-canvas" class="canvas-game" width="700" height="400"></canvas><div class="space-controls"><button class="btn-space btn-space-shoot" style="background:#27ae60; box-shadow:0 6px 0 #1e8449;" onmousedown="jumpRunner()" ontouchstart="jumpRunner(event)" onmouseenter="playMarimbaHover()">⬆️ SALTAR</button></div>` + obtenerManual();
      document.addEventListener('keydown', runKeyDown); loopRunner = requestAnimationFrame(updateRunner);
    }
    function runKeyDown(e) { if(e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jumpRunner(); } }
    function jumpRunner(e) {
      if(e) e.preventDefault(); if(!runState.playing) return;
      if(runState.p.jumps < 2) {
        runState.p.vy = runState.jumpForce; runState.p.jumps++;
        if(audioCtx && audioCtx.state !== 'suspended') {
            let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain();
            osc.frequency.setValueAtTime(350 + (runState.p.jumps*150), audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(600 + (runState.p.jumps*150), audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.15);
        }
      }
    }
    function stopRunner() { runState.playing = false; document.removeEventListener('keydown', runKeyDown); cancelAnimationFrame(loopRunner); renderArcadeMenu(); }
    function updateRunner() {
      if(!runState.playing) return; let canvas = document.getElementById('runner-canvas'); if(!canvas) return; let ctx = canvas.getContext('2d');
      runState.frames++; runState.distance += runState.speed * 0.01;
      if(runState.frames % 500 === 0) runState.speed += 0.5; if(runState.p.invincibility > 0) runState.p.invincibility--;
      runState.p.vy += runState.gravity; runState.p.y += runState.p.vy;
      if(runState.p.y + runState.p.h >= runState.floorY) { runState.p.y = runState.floorY - runState.p.h; runState.p.vy = 0; runState.p.jumps = 0; }
      if(runState.frames % Math.max(45, Math.floor(110 - runState.speed * 5)) === 0) { if(Math.random() > 0.3) runState.obstacles.push({ x: canvas.width, y: runState.floorY - 40, w: 40, h: 40, text: runEnemies[Math.floor(Math.random() * runEnemies.length)] }); }
      if(runState.frames % 80 === 0 && Math.random() > 0.4) { runState.coins.push({ x: canvas.width, y: runState.floorY - 60 - Math.random() * 100, w: 24, h: 24, text: runCoins[Math.floor(Math.random() * runCoins.length)] }); }
      if(runState.frames % 650 === 0) runState.powerups.push({ x: canvas.width, y: runState.floorY - 120, w: 30, h: 30 });
      ctx.fillStyle = '#e0f7fa'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      runState.bg.clouds.forEach(c => { c.x -= c.v; if(c.x < -c.s*2) { c.x = 700 + c.s; c.y = 20 + Math.random()*100; } ctx.beginPath(); ctx.arc(c.x, c.y, c.s, 0, Math.PI*2); ctx.arc(c.x + c.s*0.8, c.y - c.s*0.3, c.s*0.8, 0, Math.PI*2); ctx.arc(c.x + c.s*1.6, c.y, c.s*0.9, 0, Math.PI*2); ctx.fill(); });
      ctx.fillStyle = '#b2bec3';
      runState.bg.mountains.forEach(m => { m.x -= runState.speed * 0.1; if(m.x + m.w < -100) { m.x = 700 + Math.random()*150; m.w = 200 + Math.random()*200; m.h = 100 + Math.random()*120; } ctx.beginPath(); ctx.moveTo(m.x, runState.floorY); ctx.lineTo(m.x + m.w/2, runState.floorY - m.h); ctx.lineTo(m.x + m.w, runState.floorY); ctx.fill(); });
      ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 2.5;
      runState.bg.birds.forEach(b => { b.x -= b.v + runState.speed * 0.05; if(b.x < -30) { b.x = 700 + Math.random()*150; b.y = 20 + Math.random()*100; } let flap = Math.sin((runState.frames + b.offset) * 0.15) * 8; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.quadraticCurveTo(b.x + 6, b.y - 6 - flap, b.x + 12, b.y); ctx.quadraticCurveTo(b.x + 18, b.y - 6 - flap, b.x + 24, b.y); ctx.stroke(); });
      ctx.fillStyle = '#795548'; ctx.fillRect(0, runState.floorY, canvas.width, canvas.height - runState.floorY); ctx.fillStyle = '#8bc34a'; ctx.fillRect(0, runState.floorY, canvas.width, 14);
      ctx.font = '20px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      runState.bg.flowers.forEach(f => { f.x -= runState.speed; if(f.x < -30) { f.x = 700 + Math.random()*60; f.type = ['🌷','🌻','🌼','🍄'][Math.floor(Math.random()*4)]; } ctx.fillText(f.type, f.x, runState.floorY + 2); });
      ctx.save(); ctx.translate(runState.p.x + runState.p.w/2, runState.p.y + runState.p.h/2); ctx.fillStyle = 'white'; ctx.font = 'bold 12px Montserrat'; ctx.fillText("Tú", 0, -28);
      if(runState.p.jumps === 0) { ctx.translate(0, Math.sin(runState.frames * 0.4) * 4); ctx.rotate(Math.cos(runState.frames * 0.4) * 0.12); }
      ctx.scale(-1, 1); ctx.font = '40px Arial'; if(runState.p.invincibility > 0 && Math.floor(runState.frames / 5) % 2 === 0) { ctx.shadowColor = '#f1c40f'; ctx.shadowBlur = 20; } ctx.fillText("🏃", 0, 0); ctx.restore();
      for(let i = runState.coins.length - 1; i >= 0; i--) { let c = runState.coins[i]; c.x -= runState.speed; ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(c.x + c.w/2, c.y + c.h/2, c.w/2, 0, Math.PI*2); ctx.fill(); if(runState.p.x < c.x + c.w && runState.p.x + runState.p.w > c.x && runState.p.y < c.y + c.h && runState.p.y + runState.p.h > c.y) { runState.score += 5; updatePuntajeGlobal(5); runState.coins.splice(i, 1); } else if(c.x + c.w < 0) runState.coins.splice(i, 1); }
      for(let i = runState.powerups.length - 1; i >= 0; i--) { let p = runState.powerups[i]; p.x -= runState.speed; ctx.fillStyle = '#f1c40f'; ctx.save(); ctx.translate(p.x + p.w/2, p.y + p.h/2); ctx.beginPath(); for(let j=0; j<5; j++) { ctx.lineTo(Math.cos((18+j*72)*Math.PI/180)*15, -Math.sin((18+j*72)*Math.PI/180)*15); ctx.lineTo(Math.cos((54+j*72)*Math.PI/180)*6, -Math.sin((54+j*72)*Math.PI/180)*6); } ctx.closePath(); ctx.fill(); ctx.restore(); if(runState.p.x < p.x + p.w && runState.p.x + runState.p.w > p.x && runState.p.y < p.y + p.h && runState.p.y + runState.p.h > p.y) { runState.p.invincibility = 350; runState.powerups.splice(i, 1); } else if(p.x + p.w < 0) runState.powerups.splice(i, 1); }
      for(let i = runState.obstacles.length - 1; i >= 0; i--) { let o = runState.obstacles[i]; o.x -= runState.speed; ctx.fillStyle = '#c0392b'; ctx.fillRect(o.x, o.y, o.w, o.h); ctx.fillStyle = 'black'; ctx.font = 'bold 10px Montserrat'; ctx.textAlign = 'center'; ctx.fillText(o.text, o.x + o.w/2, o.y - 6); if(runState.p.x < o.x + o.w && runState.p.x + runState.p.w > o.x && runState.p.y < o.y + o.h && runState.p.y + runState.p.h > o.y) { if(runState.p.invincibility > 0) { runState.obstacles.splice(i, 1); runState.score += 2; updatePuntajeGlobal(2); } else { runState.lives--; updatePuntajeGlobal(-3); runState.obstacles.splice(i, 1); runState.p.invincibility = 70; if(runState.lives <= 0) return endRunner(); } } else if(o.x + o.w < 0) { runState.score += 1; updatePuntajeGlobal(1); runState.obstacles.splice(i, 1); } }
      let elScore = document.getElementById('run-score'); if(elScore) elScore.innerText = `Distancia: ${Math.floor(runState.distance)}m | Pts: ${runState.score} | Vidas: ${runState.lives}`;
      loopRunner = requestAnimationFrame(updateRunner);
    }
    function endRunner() {
      runState.playing = false; document.removeEventListener('keydown', runKeyDown); puntajeJuego = runState.score > 20 ? 20 : runState.score; 
      historialRespuestas.push({ pre: "La Carrera del Rapport", res: Math.floor(runState.distance) + " metros", cor: runState.score + " pts", exp: "Esquivaste bloqueos y juntaste orbes de escucha." });
      renderFinalResult();
    }

    // --- RESULTADOS Y MARATÓN ---
    function renderFinalResult() {
      let mensaje = ""; let consejo = ""; let scoreMaximo = 10;
      if(juegoActual === 'invasores' || juegoActual === 'runner') scoreMaximo = 20;

      if (puntajeJuego >= (scoreMaximo * 0.9)) { mensaje = "¡Perfección Absoluta! 🏆"; consejo = "Tienes un dominio increíble e impecable del glosario."; } 
      else if (puntajeJuego >= (scoreMaximo * 0.6)) { mensaje = "¡Excelente Trabajo! 🌟"; consejo = "Estás muy bien preparado/a y demuestras gran fluidez conceptual."; } 
      else if (puntajeJuego >= (scoreMaximo * 0.4)) { mensaje = "¡Buen Intento! 👍"; consejo = "Vas por muy buen camino. Repasa de manera focalizada."; } 
      else { mensaje = "¡A Seguir Estudiando! 📚"; consejo = "Utiliza el panel central para profundizar cada concepto."; }

      let htmlRespuestas = `<div style="text-align:left; margin-top: 25px; max-height: 250px; overflow-y: auto; padding: 20px; background: white; border-radius: 12px; border: 2px solid #e2e8f0; font-family:'Roboto',sans-serif;">
        <h3 style="color:#9b59b6; margin-bottom:15px; font-size:1.2rem; font-family:'Fredoka',sans-serif;">📝 Resumen de Respuestas:</h3>
        ${historialRespuestas.length > 0 ? historialRespuestas.map(r => `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #cbd5e1; font-size: 0.95rem;">
                <strong>Contexto:</strong> <span style="color:#334155;">${r.pre}</span> <br>
                <strong>Tú:</strong> <span style="color:${r.res === r.cor || ['Sí', 'Descubierta', 'Correcto', 'Emparejado', 'Empatía'].includes(r.res) || (typeof r.res === 'string' && (r.res.includes('metros') || r.res.includes('impactos') || r.res.includes('Nivel'))) ? '#2ecc71' : (r.res===r.cor ? '#2ecc71' : '#e74c3c')}">${r.res}</span> <br>
                <strong>Esperado:</strong> <span style="color:#2ecc71;">${r.cor}</span> <br>
                <em style="font-size: 0.85rem; color: #64748b; display:block; margin-top:6px;">💡 ${r.exp}</em>
            </div>
        `).join('') : '<p style="color:#94a3b8; font-style:italic;">No se registraron detalles específicos.</p>'}
      </div>`;

      let btnAction = `<button class="game-play-btn" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">↻ Volver al Menú Arcade</button>`;
      
      if(modoMaraton && !modoFlash) {
          puntajeMaraton += puntajeJuego; maxPuntajeMaraton += scoreMaximo; indiceMaraton++;
          if(indiceMaraton < MARATON_JUEGOS.length) {
              btnAction = `<button class="game-play-btn" style="background:#2ecc71; width:100%; font-size:1.3rem; box-shadow:0 6px 0 #27ae60;" onclick="MARATON_JUEGOS[${indiceMaraton}]()" onmouseenter="playMarimbaHover()">Siguiente Juego ➔</button>
                           <div style="margin-top:20px; font-weight:700; color:#334155; font-size:1.1rem; font-family:'Roboto',sans-serif;">Progreso: Juego ${indiceMaraton} de 16 | Score Acumulado: ${puntajeMaraton}</div>
                           <button class="game-back-menu" style="margin-top:15px; border:none; text-decoration:underline;" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">Salir de la Maratón</button>`;
          } else {
              btnAction = `<button class="game-play-btn" style="background:#f1c40f; color:#333; width:100%; font-size:1.3rem; box-shadow:0 6px 0 #f39c12;" onclick="finalizarMaraton()" onmouseenter="playMarimbaHover()">🏆 Ver Resultado Final de Maratón</button>`;
          }
      }

      elArcadeView.innerHTML = renderDashboardHTML() + `<div class="result-box"><h2 style="font-size:2rem; margin-bottom:10px;">${mensaje}</h2><p style="font-size:1.2rem; font-family:'Roboto',sans-serif;">Tu puntaje en este juego es:</p><div class="result-score">${puntajeJuego} / ${scoreMaximo}</div><p style="font-style:italic;margin-bottom:20px;color:var(--text-main); font-family:'Roboto',sans-serif; font-size:1.1rem;">${consejo}</p>${htmlRespuestas}<br>${btnAction}</div>` + obtenerManual();
    }

    function finalizarMaraton() {
        modoMaraton = false;
        elArcadeView.innerHTML = renderDashboardHTML() + `<div class="result-box" style="max-width: 700px;">
            <h2 style="font-size:3rem; color:#f39c12; text-shadow: 2px 2px 0px #fffdf0;">🏆 ¡Maratón Completada! 🏆</h2>
            <div class="result-score">${puntajeMaraton} / ${maxPuntajeMaraton}</div>
            <p style="font-size:1.3rem; margin-bottom:25px; font-family:'Roboto',sans-serif;">¡Increíble esfuerzo! Has recorrido las 16 modalidades del Arcade.</p>
            <button class="game-play-btn" style="margin-top:20px; font-size:1.3rem;" onclick="renderArcadeMenu()" onmouseenter="playMarimbaHover()">↻ Volver al Menú Arcade</button>
        </div>`;
    }
  