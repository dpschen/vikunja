import AbstractService from './abstractService'
import AttachmentModel from '../models/attachment'
import {useConfigStore} from '@/stores/config'
import {getHumanSize} from '@/helpers/getHumanSize'

import type { IAttachment } from '@/modelTypes/IAttachment'

import {downloadBlob} from '@/helpers/downloadBlob'

export enum PREVIEW_SIZE {
	SM = 'sm',
	MD = 'md',
	LG = 'lg',
	XL = 'xl',
}

export class FileTooLargeError extends Error {
	constructor(public fileName: string, public fileSize: number, public maxSize: number) {
		super(`File '${fileName}' is too large. Maximum size is ${getHumanSize(maxSize)}.`)
		this.name = 'FileTooLargeError'
	}
}

function parseFileSize(size: string): number {
	const match = size.trim().match(/^(\d+(?:\.\d+)?)\s*(k|m|g|t)?i?b?$/i)
	if (!match) {
		return NaN
	}
	const value = parseFloat(match[1])
	const unit = match[2]?.toLowerCase()
	switch (unit) {
		case 'k':
			return value * 1024
		case 'm':
			return value * 1024 * 1024
		case 'g':
			return value * 1024 * 1024 * 1024
		case 't':
			return value * 1024 * 1024 * 1024 * 1024
		default:
			return value
	}
}

export default class AttachmentService extends AbstractService<IAttachment> {
	constructor() {
		super({
			create: '/tasks/{taskId}/attachments',
			getAll: '/tasks/{taskId}/attachments',
			delete: '/tasks/{taskId}/attachments/{id}',
		})
	}

	processModel(model: IAttachment) {
		return {
			...model,
			created: new Date(model.created).toISOString(),
		}
	}

	useCreateInterceptor() {
		return false
	}

	modelFactory(data: Partial<IAttachment>) {
		return new AttachmentModel(data)
	}

	modelCreateFactory(data) {
		// Success contains the uploaded attachments
		data.success = (data.success === null ? [] : data.success).map(a => {
			return this.modelFactory(a)
		})
		return data
	}

	getBlobUrl(model: IAttachment, size?: PREVIEW_SIZE) {
		let mainUrl = '/tasks/' + model.taskId + '/attachments/' + model.id
		if (size !== undefined) {
			mainUrl += `?preview_size=${size}`
		}

		return AbstractService.prototype.getBlobUrl.call(this, mainUrl)
	}

	async download(model: IAttachment) {
		const url = await this.getBlobUrl(model)
		return downloadBlob(url, model.file.name)
	}

	/**
	 * Uploads a file to the server
	 * @param files
	 * @returns {Promise<any|never>}
	 */
	create(model: IAttachment, files: File[] | FileList) {
		const configStore = useConfigStore()
		const defaultMax = 25 * 1024 * 1024
		let maxSize = defaultMax
		if (configStore.maxFileSize) {
			const parsed = parseFileSize(configStore.maxFileSize)
			if (!isNaN(parsed)) {
				maxSize = parsed
			}
		}

		const data = new FormData()
		for (let i = 0; i < files.length; i++) {
			if (files[i].size > maxSize) {
				return Promise.reject(new FileTooLargeError(files[i].name, files[i].size, maxSize))
			}
			data.append('files', new Blob([files[i]]), files[i].name)
		}

		return this.uploadFormData(
			this.getReplacedRoute(this.paths.create, model),
			data,
		)
	}
}
