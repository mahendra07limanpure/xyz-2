import { Request, Response, NextFunction } from 'express';
export declare class LootController {
    private getDb;
    generateLoot(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPlayerLoot(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEquipment(req: Request, res: Response, next: NextFunction): Promise<void>;
    createLendingOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    borrowEquipment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMarketplace(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateLendingOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    private generateRandomEquipment;
    private generateRarity;
    private generateEquipmentName;
    private generateSpecialAbility;
    private getRarityIndex;
}
export declare const lootController: LootController;
//# sourceMappingURL=lootController.d.ts.map