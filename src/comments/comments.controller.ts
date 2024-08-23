import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(
    @Param('post_id') post_id: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    createCommentDto.post_id = post_id;
    return await this.commentsService.create(createCommentDto);
  }

  @Get()
  async findAll(
    @Param('post_id') post_id: string,
    @Query('page') page: number,
  ) {
    return await this.commentsService.findAll(post_id, page, 10);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
