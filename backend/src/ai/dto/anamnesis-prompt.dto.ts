import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnamnesisPromptDto {
  @IsString({ message: 'O petId deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O petId é obrigatório.' })
  petId!: string;

  @IsString({ message: 'Os sintomas devem ser descritos em texto.' })
  @IsNotEmpty({ message: 'A descrição dos sintomas é obrigatória.' })
  symptoms!: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
