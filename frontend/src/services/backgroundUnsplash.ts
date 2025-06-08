import AbstractService from './abstractService'
import BackgroundImageModel from '../models/backgroundImage'
import ProjectModel from '@/models/project'
import type { IBackgroundImage } from '@/modelTypes/IBackgroundImage'

export default class BackgroundUnsplashService extends AbstractService<IBackgroundImage> {
        constructor() {
                super({
                        getAll: '/backgrounds/unsplash/search',
                        update: '/projects/{projectId}/backgrounds/unsplash',
                })
        }

       private lastThumbUrl: string | null = null

	modelFactory(data: Partial<IBackgroundImage>) {
		return new BackgroundImageModel(data)
	}

	modelUpdateFactory(data) {
		return new ProjectModel(data)
	}

       async thumb(model) {
               const response = await this.http({
                       url: `/backgrounds/unsplash/images/${model.id}/thumb`,
                       method: 'GET',
                       responseType: 'blob',
               })
               if (this.lastThumbUrl) {
                       URL.revokeObjectURL(this.lastThumbUrl)
               }
               this.lastThumbUrl = window.URL.createObjectURL(new Blob([response.data]))
               return this.lastThumbUrl
       }

       revokeThumb() {
               if (this.lastThumbUrl) {
                       URL.revokeObjectURL(this.lastThumbUrl)
                       this.lastThumbUrl = null
               }
       }
}
