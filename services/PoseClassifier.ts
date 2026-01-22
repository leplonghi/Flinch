
import { Pose, HandLandmark, PoseClassification, Point } from '../types';

/**
 * PoseClassifier interpreta os landmarks brutos do MediaPipe em estados semânticos de jogo.
 */
export class PoseClassifier {
  private lastValidPose: Pose = "UNKNOWN";
  private readonly confidenceThreshold: number = 0.7;
  
  // Wave detection state
  private wristXHistory: number[] = [];
  private readonly historySize: number = 12;
  private readonly waveMovementThreshold: number = 0.08; // Range of X movement to trigger wave

  /** Classifica o gesto atual da mão baseando-se em distâncias e visibilidade */
  classify(landmarks: HandLandmark[]): PoseClassification {
    if (!landmarks || landmarks.length < 21) {
      this.wristXHistory = [];
      return { pose: "UNKNOWN", confidence: 0, timestamp: Date.now() };
    }

    // Track wrist X history for wave detection
    const wrist = landmarks[0];
    this.wristXHistory.push(wrist.x);
    if (this.wristXHistory.length > this.historySize) {
      this.wristXHistory.shift();
    }

    // Calcula visibilidade média (se o MediaPipe prover)
    const avgVisibility = landmarks.reduce((acc, l) => acc + (l.visibility || 1), 0) / 21;
    
    if (avgVisibility < 0.5) {
      return { pose: this.lastValidPose, confidence: avgVisibility, timestamp: Date.now() };
    }

    const pose = this.detectPose(landmarks);
    const confidence = this.calculateConfidence(avgVisibility);

    if (confidence >= this.confidenceThreshold) {
      this.lastValidPose = pose;
    }

    return { pose, confidence, timestamp: Date.now() };
  }

  private detectPose(l: HandLandmark[]): Pose {
    const thumbTip = l[4];
    const indexTip = l[8];
    const middleTip = l[12];
    const ringTip = l[16];
    const pinkyTip = l[20];

    const indexMcp = l[5];
    const middleMcp = l[9];
    const ringMcp = l[13];
    const pinkyMcp = l[17];

    // 1. PINCH: Dedão e Indicador próximos
    const pinchDist = this.distance(thumbTip, indexTip);
    if (pinchDist < 0.04) return "PINCH";

    // 2. FIST: Todos os dedos abaixo dos nudilhos
    const isFist = [indexTip, middleTip, ringTip, pinkyTip].every((tip, i) => {
      const mcps = [indexMcp, middleMcp, ringMcp, pinkyMcp];
      return tip.y > mcps[i].y;
    });
    if (isFist) return "FIST";

    // 3. POINT: Apenas indicador estendido
    const isIndexExtended = indexTip.y < indexMcp.y;
    const othersClosed = [middleTip, ringTip, pinkyTip].every((tip, i) => {
      const mcps = [middleMcp, ringMcp, pinkyMcp];
      return tip.y > mcps[i].y;
    });
    if (isIndexExtended && othersClosed) return "POINT";

    // 4. OPEN / WAVE: Todos os dedos estendidos
    const isOpen = [indexTip, middleTip, ringTip, pinkyTip].every((tip, i) => {
      const mcps = [indexMcp, middleMcp, ringMcp, pinkyMcp];
      return tip.y < mcps[i].y;
    });

    if (isOpen) {
      // Check for horizontal wave motion in history
      if (this.wristXHistory.length >= this.historySize) {
        const minX = Math.min(...this.wristXHistory);
        const maxX = Math.max(...this.wristXHistory);
        const deltaX = maxX - minX;
        
        if (deltaX > this.waveMovementThreshold) {
          return "WAVE";
        }
      }
      return "OPEN";
    }

    return "UNKNOWN";
  }

  private calculateConfidence(visibility: number): number {
    return Math.min(visibility * 1.2, 1.0);
  }

  private distance(p1: Point, p2: Point): number {
    return Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + 
      Math.pow(p2.y - p1.y, 2) + 
      Math.pow((p2.z || 0) - (p1.z || 0), 2)
    );
  }
}

export default new PoseClassifier();
