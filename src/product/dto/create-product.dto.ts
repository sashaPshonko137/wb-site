import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator"

export class CreateProductDto {
  @ApiProperty({ example: "shirt" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string  
  
  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  price: number
  
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  makerId: number     

  @ApiProperty({ example: [{name: "color", value: "red"}] })
  @IsArray()
  @IsNotEmpty()
  characteristics: {name: string, value: string}[]
}
