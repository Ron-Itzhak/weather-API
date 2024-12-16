import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";

export function validateDto(dtoClass: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(
      dtoClass,
      req.method === "GET" ? req.query : req.body
    );
    validate(dto).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(", "))
          .join("; ");
        return res.status(400).json({ errors: errorMessages });
      }
      next();
    });
  };
}
