
import { GameState, Challenge, HitResult, Step } from '../types';

export type EngineEvent = 'ON_HIT' | 'ON_MISS' | 'ON_STEP_COMPLETE' | 'ON_GAME_OVER';

export class CoreEngine {
  private static instance: CoreEngine;
  private isRunning: boolean = false;
  private startTime: number = 0;
  private lastTick: number = 0;
  private listeners: Map<EngineEvent, Function[]> = new Map();

  private constructor() {}

  static getInstance(): CoreEngine {
    if (!CoreEngine.instance) CoreEngine.instance = new CoreEngine();
    return CoreEngine.instance;
  }

  on(event: EngineEvent, callback: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)?.push(callback);
  }

  private emit(event: EngineEvent, data?: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  start() {
    this.isRunning = true;
    this.startTime = performance.now();
    this.requestTick();
  }

  stop() {
    this.isRunning = false;
  }

  private requestTick() {
    if (!this.isRunning) return;
    requestAnimationFrame((t) => this.tick(t));
  }

  private tick(now: number) {
    const elapsed = now - this.startTime;
    this.lastTick = elapsed;
    
    // Antigravity Ready: Aqui entrará a lógica de física/interpolação pesada
    this.requestTick();
  }

  get elapsed() { return this.lastTick; }
}
