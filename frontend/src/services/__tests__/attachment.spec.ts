import {describe, it, expect, beforeEach, vi} from 'vitest'
import {setActivePinia, createPinia} from 'pinia'

import AttachmentService, {FileTooLargeError} from '../attachment'
import AttachmentModel from '../../models/attachment'
import {useConfigStore} from '@/stores/config'

beforeEach(() => {
    setActivePinia(createPinia())
})

describe('AttachmentService.create', () => {
    it('rejects files larger than configured size', async () => {
        const config = useConfigStore()
        config.maxFileSize = '1MB'

        const service = new AttachmentService()
        const spy = vi.spyOn(service as unknown as {uploadFormData: (url: string, data: FormData) => Promise<unknown>}, 'uploadFormData').mockResolvedValue({})

        const bigFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'big.dat')
        const model = new AttachmentModel({taskId: 1})
        await expect(service.create(model, [bigFile])).rejects.toBeInstanceOf(FileTooLargeError)
        expect(spy).not.toHaveBeenCalled()
    })

    it('calls upload for files within limit', async () => {
        const config = useConfigStore()
        config.maxFileSize = '2MB'

        const service = new AttachmentService()
        const spy = vi.spyOn(service as unknown as {uploadFormData: (url: string, data: FormData) => Promise<unknown>}, 'uploadFormData').mockResolvedValue({})

        const smallFile = new File([new ArrayBuffer(1024)], 'small.txt')
        const model = new AttachmentModel({taskId: 1})
        await service.create(model, [smallFile])
        expect(spy).toHaveBeenCalled()
    })
})
