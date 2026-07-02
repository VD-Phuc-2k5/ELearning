export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export interface ICloudinaryService {
  uploadBuffer(buffer: Buffer, folder: string): Promise<CloudinaryUploadResult>;
  deleteFile(publicId: string): Promise<void>;
}

export const CLOUDINARY_SERVICE = Symbol('ICloudinaryService');
