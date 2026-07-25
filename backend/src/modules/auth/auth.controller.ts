import { Request, Response } from "express";
import { authService } from "./auth.service";

export class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(
      req.body.email,
      req.body.password,
      req.body.companyId,
      req.body.companyName
    );

    
    res.status(201).json(result);
  }

  async verifyEmail(req: Request, res: Response) {
  const result = await authService.verifyEmail(req.body.email, req.body.otp);
  res.status(200).json(result);
}


  async login(req: Request, res: Response) {
    const result = await authService.login(
      req.body.email,
      req.body.password,
    );

    res.status(200).json(result);
  }

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
  }

  async logout(req: Request, res: Response) {
    await authService.logout(req.body.refreshToken);
    res.status(204).send();
  }

  async forgotPassword(req: Request, res: Response) {
    const result = await authService.forgotPassword(req.body.email);
    res.json(result);
  }

  async resetPassword(req: Request, res: Response) {
    const result = await authService.resetPassword(
      req.body.email,
      req.body.token,
      req.body.newPassword,
    );

    res.json(result);
  }
}

export const authController = new AuthController();