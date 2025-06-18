import { Request, Response, NextFunction } from 'express';
export declare class AIController {
    private getDb;
    interactWithNPC(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAvailableNPCs(req: Request, res: Response, next: NextFunction): Promise<void>;
    getInteractionHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getQuest(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=aiController.d.ts.map