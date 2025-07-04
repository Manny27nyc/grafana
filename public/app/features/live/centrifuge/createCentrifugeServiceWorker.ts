// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { CorsWorker as Worker } from 'app/core/utils/CorsWorker';

export const createWorker = () => new Worker(new URL('./service.worker.ts', import.meta.url));
