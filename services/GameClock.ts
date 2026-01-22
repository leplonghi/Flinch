
/**
 * GameClock gerencia o tempo rítmico com precisão de microssegundos.
 * Essencial para sincronia perfeita entre áudio e visão computacional.
 */
class GameClock {
  private startTime: number = 0;
  private pausedTime: number = 0;
  private pauseStartTime: number | null = null;
  private _isPaused: boolean = false;

  /** Inicia o contador global do desafio */
  start(): void {
    this.startTime = performance.now();
    this.pausedTime = 0;
    this.pauseStartTime = null;
    this._isPaused = false;
  }

  /** Pausa o clock e registra o ponto de interrupção */
  pause(): void {
    if (!this._isPaused) {
      this.pauseStartTime = performance.now();
      this._isPaused = true;
    }
  }

  /** Retoma o clock subtraindo o delta do tempo pausado */
  resume(): void {
    if (this._isPaused && this.pauseStartTime !== null) {
      this.pausedTime += performance.now() - this.pauseStartTime;
      this.pauseStartTime = null;
      this._isPaused = false;
    }
  }

  /** Retorna o tempo decorrido real em milissegundos */
  elapsed(): number {
    if (this.startTime === 0) return 0;
    const current = (this._isPaused && this.pauseStartTime !== null) 
      ? this.pauseStartTime 
      : performance.now();
    return current - this.startTime - this.pausedTime;
  }

  /** Limpa todos os estados do relógio */
  reset(): void {
    this.startTime = 0;
    this.pausedTime = 0;
    this.pauseStartTime = null;
    this._isPaused = false;
  }

  /** Verifica se o clock está em execução ativa */
  isRunning(): boolean {
    return this.startTime !== 0 && !this._isPaused;
  }

  get isPaused(): boolean {
    return this._isPaused;
  }
}

export default new GameClock();
