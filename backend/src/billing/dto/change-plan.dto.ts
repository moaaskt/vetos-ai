import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePlanDto {
  @IsString({ message: 'O planId deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O planId é obrigatório.' })
  planId!: string;
}
