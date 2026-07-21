import { Config } from '@remotion/cli/config';

// png → cleaner yuv420p path for LinkedIn/YouTube (avoid yuvj420p from jpeg)
Config.setVideoImageFormat('png');
Config.setConcurrency(4);
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);
Config.setEntryPoint('src/index.ts');
