import { Request, Response, NextFunction } from 'express';
export declare class PartyController {
    private getDb;
    createParty(req: Request, res: Response, next: NextFunction): Promise<void>;
    joinParty(req: Request, res: Response, next: NextFunction): Promise<void>;
    leaveParty(req: Request, res: Response, next: NextFunction): Promise<void>;
    getParty(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPlayerParty(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateParty(req: Request, res: Response, next: NextFunction): Promise<void>;
    disbandParty(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=partyController.d.ts.map