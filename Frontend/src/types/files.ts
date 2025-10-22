import type { ResponseType } from './base';

export type UploadFileRequestDataType =
	| FormData
	| { id: number; title: string; form: FormData }[];

export type UploadFileResponseDataType = ResponseType<{ url: string }>;
export type UploadFilesResponseDataType = ResponseType<
	{ id: number; title: string; url: string }[]
>;

// ****** Externals ************
