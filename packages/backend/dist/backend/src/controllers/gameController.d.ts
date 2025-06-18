import { Request, Response, NextFunction } from 'express';
export declare class GameController {
    private db;
    getGameState(req: Request, res: Response, next: NextFunction): Promise<void>;
    joinGame(req: Request, res: Response, next: NextFunction): Promise<void>;
    leaveGame(req: Request, res: Response, next: NextFunction): Promise<void>;
    getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    registerPlayer(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPlayer(req: Request, res: Response, next: NextFunction): Promise<void>;
    updatePlayer(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=gameController.d.ts.map