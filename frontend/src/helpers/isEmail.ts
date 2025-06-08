export function isEmail(email: string): boolean {
        const format = /^.+@.+$/
        return format.test(email)
}
