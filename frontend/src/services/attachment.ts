import AbstractService from './abstractService'
import AttachmentModel from '../models/attachment'

import type { IAttachment } from '@/modelTypes/IAttachment'

import {downloadBlob} from '@/helpers/downloadBlob'
import {useConfigStore} from '@/stores/config'
import {error} from '@/message'
import {i18n} from '@/i18n'
import {parseHumanSize} from '@/helpers/getHumanSize'

export enum PREVIEW_SIZE {
	SM = 'sm',
	MD = 'md',
	LG = 'lg',
	XL = 'xl',
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
		const data = new FormData()
		const config = useConfigStore()
		const maxSize = parseHumanSize(config.maxFileSize)
		for (let i = 0; i < files.length; i++) {
			if (files[i].size > maxSize) {
				error({message: i18n.global.t('attachment.fileTooLarge', {size: config.maxFileSize})})
				continue
			}
			data.append('files', new Blob([files[i]]), files[i].name)
		}
		
		if (!Array.from(data.keys()).includes('files')) {
			return Promise.reject(new Error('file too large'))
		}

		return this.uploadFormData(
			this.getReplacedRoute(this.paths.create, model),
			data,
		)
	}
}
