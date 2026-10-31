import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GeneratePlaylistRequestDTO {
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsIn([
    'เหงาๆ',
    'มันสุดเหวี่ยง',
    'คลั่งรัก',
    'ผ่อนคลาย',
    'สมาธิขั้นสุด',
    'อยากกลับบ้าน',
  ])
  presetName?:
    | 'เหงาๆ'
    | 'มันสุดเหวี่ยง'
    | 'คลั่งรัก'
    | 'ผ่อนคลาย'
    | 'สมาธิขั้นสุด'
    | 'อยากกลับบ้าน';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}