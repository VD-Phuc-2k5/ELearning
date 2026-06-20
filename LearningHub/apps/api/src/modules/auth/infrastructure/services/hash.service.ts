import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IHashService } from "../../application/interfaces/i-hash.service";

@Injectable()
export class HashService implements IHashService {
    hash(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}
